import { useState } from "react";

interface InlineEditProps {
  value: string;
  setValue: (val: string) => void;
  textarea?: boolean;
}

function InlineEdit({ value, setValue, textarea = false }: InlineEditProps) {
  const [editingValue, setEditingValue] = useState(value);

  const onChange = (event: React.ChangeEvent<HTMLElement>) =>
    setEditingValue((event.target as HTMLInputElement).value);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      (event.target as HTMLInputElement).blur();
    }
  };

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  const onBlur = async (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(event.target.value);
  };

  const Element = textarea ? "textarea" : "input";

  return (
    <Element
      aria-label="Field name"
      onClick={onClick}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      value={editingValue}
    />
  );
}

export default InlineEdit;
