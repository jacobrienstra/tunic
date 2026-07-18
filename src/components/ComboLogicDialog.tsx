import {
  createContext,
  Fragment,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Filter, Plus, XIcon } from "lucide-react";

import LogicStringView from "./LogicStringView";

import { cn } from "@/lib/utils";
import {
  useGlyphSubsets,
  SUBSET_COLOR_CLASSES,
  type GlyphSubset,
} from "@/data/store";
import { useSelectionStore } from "@/data/selectionStore";
import {
  createGroupNode,
  isValid,
  nodeInvalid,
  createNotNode,
  placeNodeInSlot,
  remove,
  replace,
  createSubsetNode,
  type GroupType,
  type LogicNode,
  type Slot,
} from "@/data/logic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NodeType =
  | { type: GroupType }
  | { type: "not" }
  | { type: "subset"; subsetId: string };

function nodeFromType(nodeType: NodeType): LogicNode {
  switch (nodeType.type) {
    case "subset":
      return createSubsetNode(nodeType.subsetId);
    case "not":
      return createNotNode();
    default:
      return createGroupNode(nodeType.type);
  }
}

interface EditCtx {
  subsets: ReturnType<typeof useGlyphSubsets>;
  fillSlot: (slot: Slot, spec: NodeType) => void;
  swapSlot: (id: string, spec: NodeType) => void;
  removeNode: (id: string) => void;
}

export const EditContext = createContext<EditCtx>(null!);

function useLogicTree() {
  const graphemeFilterLogic = useSelectionStore((s) => s.graphemeFilterLogic);
  const setGraphemeFilterLogic = useSelectionStore(
    (s) => s.setGraphemeFilterLogic
  );
  const [workingVal, setWorkingVal] = useState<LogicNode | null>(null);

  const beginEdit = () => setWorkingVal(graphemeFilterLogic);

  const fillSlot = (slot: Slot, nodeType: NodeType) =>
    setWorkingVal((t) => placeNodeInSlot(t, slot, nodeFromType(nodeType)));
  const swapSlot = (id: string, nodeType: NodeType) =>
    setWorkingVal((t) => (t ? replace(t, id, nodeFromType(nodeType)) : t));
  const removeNode = (id: string) => setWorkingVal((t) => remove(t, id));

  const canSave = isValid(workingVal);
  const save = () => {
    if (canSave) setGraphemeFilterLogic(workingVal);
  };

  return {
    workingVal,
    canSave,
    beginEdit,
    fillSlot,
    swapSlot,
    removeNode,
    save,
  };
}

function SubsetBadge({ subset }: { subset: GlyphSubset }) {
  return (
    <Badge
      variant="outline"
      className={cn(SUBSET_COLOR_CLASSES[subset.color], "gap-1.5")}
    >
      <span className="size-2 rounded-full bg-(--subset-color)" />
      {subset.name}
    </Badge>
  );
}

function NodeMenu({
  triggerClassName,
  triggerContent,
  subsets,
  onSelect,
}: {
  triggerClassName: string;
  triggerContent: ReactNode;
  subsets: GlyphSubset[];
  onSelect: (nodeType: NodeType) => void;
}) {
  return (
    <Select
      onValueChange={(value: string | null) => {
        if (!value) return;
        if (value === "and" || value === "or") onSelect({ type: value });
        else if (value === "not") onSelect({ type: "not" });
        else onSelect({ type: "subset", subsetId: value });
      }}
    >
      <SelectTrigger className={triggerClassName}>
        {triggerContent}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={"and"}>AND</SelectItem>
        <SelectItem value={"or"}>OR</SelectItem>
        <SelectItem value={"not"}>NOT</SelectItem>
        <SelectSeparator />
        {subsets.map((gs) => (
          <SelectItem key={gs.id} value={gs.id}>
            <span
              className={cn(
                SUBSET_COLOR_CLASSES[gs.color],
                "size-2 rounded-full bg-(--subset-color)"
              )}
            />
            {gs.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// --- an empty operand position: pick a subset, or a new AND/OR/NOT group ---
function EmptySlot({ slot }: { slot: Slot }) {
  const ctx = useContext(EditContext);
  return (
    <NodeMenu
      triggerClassName="text-muted-foreground gap-0 rounded-lg border-dashed px-2 [&>svg:last-child]:hidden"
      triggerContent={<Plus className="size-3.5" />}
      subsets={ctx.subsets.data}
      onSelect={(nodeType) => ctx.fillSlot(slot, nodeType)}
    />
  );
}

// The AND/OR combinator label between a group's children.
function OperatorWord({ type }: { type: "and" | "or" }) {
  return (
    <span className="text-muted-foreground text-xs leading-none font-bold tracking-wide">
      {type.toUpperCase()}
    </span>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="icon"
      onClick={onClick}
      className="absolute -top-1 -right-1 hidden size-3 items-center rounded-full group-hover/node:flex"
      aria-label="Remove"
    >
      <XIcon className="size-2" />
    </Button>
  );
}

type SubsetNode = Extract<LogicNode, { type: "subset" }>;
type NotNode = Extract<LogicNode, { type: "not" }>;
type GroupNode = Extract<LogicNode, { type: GroupType }>;

function SubsetNodeView({ node }: { node: SubsetNode }) {
  const ctx = useContext(EditContext);
  const subset = ctx.subsets.collection.get(node.subsetId);
  return (
    <>
      <NodeMenu
        triggerClassName="h-auto! cursor-pointer gap-0 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent dark:hover:bg-transparent [&>svg:last-child]:hidden"
        triggerContent={subset ? <SubsetBadge subset={subset} /> : "ERROR"}
        subsets={ctx.subsets.data}
        onSelect={(nodeType) => ctx.swapSlot(node.id, nodeType)}
      />
      <DeleteButton onClick={() => ctx.removeNode(node.id)} />
    </>
  );
}

function NotNodeView({ node }: { node: NotNode }) {
  const ctx = useContext(EditContext);
  return (
    <>
      <span className="text-muted-foreground font-bold tracking-wide">NOT</span>
      {node.child ? (
        <LogicNodeView node={node.child} />
      ) : (
        <EmptySlot slot={{ kind: "notOperand", parentId: node.id }} />
      )}
      <DeleteButton onClick={() => ctx.removeNode(node.id)} />
    </>
  );
}

function GroupNodeView({ node }: { node: GroupNode }) {
  const ctx = useContext(EditContext);
  return (
    <>
      {node.children.length === 0 ? (
        <>
          <EmptySlot
            slot={{ kind: "groupOperand", parentId: node.id, index: 0 }}
          />
          <OperatorWord type={node.type} />
        </>
      ) : (
        <>
          {node.children.map((child, i) => (
            <Fragment key={child.id}>
              {i > 0 && <OperatorWord type={node.type} />}
              <LogicNodeView node={child} />
            </Fragment>
          ))}
          <OperatorWord type={node.type} />
          <EmptySlot
            key={node.children.length}
            slot={{
              kind: "groupOperand",
              parentId: node.id,
              index: node.children.length,
            }}
          />
        </>
      )}
      <DeleteButton onClick={() => ctx.removeNode(node.id)} />
    </>
  );
}

function LogicNodeView({ node }: { node: LogicNode }) {
  const ring = nodeInvalid(node) ? "border-destructive" : "border-border";
  const border =
    node.type !== "subset" ? "border-1 gap-1 rounded-lg px-2 py-1" : "";
  return (
    <span
      className={cn(
        "group/node relative inline-flex items-center justify-center gap-1 overflow-visible",
        ring,
        border
      )}
    >
      {node.type === "subset" ? (
        <SubsetNodeView node={node} />
      ) : node.type === "not" ? (
        <NotNodeView node={node} />
      ) : node.type === "and" || node.type === "or" ? (
        <GroupNodeView node={node} />
      ) : null}
    </span>
  );
}

function ComboLogic() {
  const subsets = useGlyphSubsets();
  const graphemeFilterLogic = useSelectionStore((s) => s.graphemeFilterLogic);

  const {
    workingVal,
    canSave,
    beginEdit,
    fillSlot,
    swapSlot,
    removeNode,
    save,
  } = useLogicTree();

  const ctx: EditCtx = {
    subsets,
    fillSlot,
    swapSlot,
    removeNode,
  };

  return (
    <div className="my-2">
      <Dialog onOpenChange={(open) => open && beginEdit()}>
        <EditContext.Provider value={ctx}>
          <DialogTrigger
            render={
              <Button variant="outline">
                <Filter /> Filter Logic
              </Button>
            }
          ></DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Grapheme Filter Logic</DialogTitle>
            </DialogHeader>

            <div className="border-border overflow-auto rounded-lg border p-3">
              {workingVal ? (
                <LogicNodeView node={workingVal} />
              ) : (
                <EmptySlot slot={{ kind: "root" }} />
              )}
            </div>

            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <div>
                <LogicStringView filterLogic={graphemeFilterLogic} mode="dot" />
              </div>
              <Button disabled={!canSave} onClick={save}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </EditContext.Provider>
      </Dialog>
    </div>
  );
}

export default ComboLogic;
