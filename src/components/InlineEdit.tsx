import { useEffect, useState } from "react";

type InlineEditProps = {
  value: string;
  setValue: (val: string) => void;
  textarea?: boolean;
  className?: string;
};

function InlineEdit({
  value,
  setValue,
  textarea = false,
  className,
}: InlineEditProps) {
  useEffect(() => {
    setEditingValue(value);
  }, [value]);

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
      className={className}
    />
  );
}

export default InlineEdit;
