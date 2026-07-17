import { useState } from "react";
import { Check, Edit } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "./ui/select";
import TruneTyper from "./TruneTyper";

import { cn } from "@/lib/utils";
import { SUBSET_COLOR_CLASSES, SUBSET_COLORS } from "@/data/store";
import type { GlyphSubset } from "@/data/store";
import { Switch } from "@/components/ui/switch";
import { InputInline } from "@/components/ui/input-inline";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components//ui/button";

function GlyphSubsetViewer({
  subset,
  isEditing,
  isLocked,
  setIsEditing,
  handleSave,
  className,
}: React.ComponentProps<"article"> & {
  subset: GlyphSubset;
  isEditing: boolean;
  isLocked: boolean;
  setIsEditing: (id: string) => void;
  handleSave: (subset: Partial<GlyphSubset>) => void;
}) {
  const [draft, setDraft] = useState<GlyphSubset | null>(null);
  // Only the card being edited holds a buffer; idle cards read straight from
  // the store prop so external changes (e.g. a color swap) show live.
  const view = draft ?? subset;

  return (
    <article
      className={cn(
        "m-2 flex w-[200px] min-w-max flex-col items-center gap-2 rounded-md p-2 ring-2",
        SUBSET_COLOR_CLASSES[view.color],
        className
      )}
    >
      {isEditing === false ? (
        <Button
          variant="outline"
          disabled={isLocked === true}
          className="w-full"
          onClick={() => {
            setDraft(subset);
            setIsEditing(subset.id);
          }}
        >
          <Edit /> Edit Subset
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            handleSave(view);
            setDraft(null);
          }}
        >
          <Check /> Save Changes
        </Button>
      )}
      <InputInline
        className="border-none text-xl text-(--subset-color)"
        value={view.name}
        key={view.name}
        onBlur={(e) => {
          setDraft((d) => ({ ...d!, name: e.target.value }));
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" && !e.shiftKey) || e.key === "Escape")
            e.currentTarget.blur();
        }}
        disabled={!isEditing}
      />

      <TruneTyper
        disabled={!isEditing}
        value={view.mask}
        emitTrune={(v) => {
          setDraft((d) => ({ ...d!, mask: v }));
        }}
        className={cn(
          SUBSET_COLOR_CLASSES[view.color],
          "stroke-border [--glyph-size:150px]"
        )}
      />
      <FieldGroup>
        <Field orientation="horizontal">
          <Switch
            id={`${subset.id}-modifier`}
            checked={view.modifier}
            onCheckedChange={(v) => setDraft((d) => ({ ...d!, modifier: v }))}
            className={"cursor-pointer"}
            disabled={!isEditing}
          />
          <FieldLabel
            htmlFor={`${subset.id}-modifier`}
            className={"pointer-events-none"}
          >
            Modifier?
          </FieldLabel>
        </Field>
        {view.modifier ? (
          <Field>
            <FieldLabel htmlFor="rule">Composition rule</FieldLabel>
            <InputInline
              id={`${subset.id}-rule`}
              defaultValue={view.rule ?? ""}
              key={view.rule}
              onBlur={(e) => {
                setDraft((d) => ({ ...d!, rule: e.target.value }));
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" && !e.shiftKey) || e.key === "Escape")
                  e.currentTarget.blur();
              }}
              disabled={!isEditing}
            />
          </Field>
        ) : null}
        <Field orientation="horizontal">
          <FieldLabel htmlFor={`${subset.id}-color`} className="min-w-min">
            Color
          </FieldLabel>
          <Select
            id={`${subset.id}-color`}
            items={SUBSET_COLORS.map((c) => {
              return { label: c, value: c };
            })}
            defaultValue={view.color}
            onValueChange={(v) => {
              if (v) setDraft((d) => ({ ...d!, color: v }));
            }}
            disabled={!isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Color</SelectLabel>
                {SUBSET_COLORS.map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                    className={
                      cn()
                      // "text-(--subset-color)",
                      // SUBSET_COLOR_CLASSES[c]
                    }
                  >
                    {c}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </article>
  );
}

export default GlyphSubsetViewer;
