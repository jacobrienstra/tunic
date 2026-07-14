import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { InputInline } from "@/components/ui/input-inline";

interface InlineEditProps {
  value: string;
  setValueFn: (val: string) => void;
  element?: "input" | "textarea";
  className?: string;
}

function InlineEdit({
  value,
  setValueFn,
  element = "input",
  className,
}: InlineEditProps) {
  useEffect(() => {
    setEditingValue(value);
  }, [value]);

  const [editingValue, setEditingValue] = useState(value);

  // Submit updates on blur
  const onBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValueFn(event.target.value);
  };

  // Keep working value always up-to-date
  const onChange = (event: React.ChangeEvent<HTMLElement>) =>
    setEditingValue((event.target as HTMLInputElement).value);

  // Submit on enter or escape
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if ((event.key === "Enter" && !event.shiftKey) || event.key === "Escape") {
      (event.target as HTMLInputElement).blur();
    }
  };

  // Calm down
  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const Element = element === "input" ? InputInline : Textarea;

  return (
    <Element
      onClick={onClick}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      value={editingValue}
      className={cn("border-muted-foreground", className)}
    />
  );
}

export default InlineEdit;
