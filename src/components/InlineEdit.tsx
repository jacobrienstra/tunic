import { useState } from "react";

interface InlineEditProps {
  value: string;
  setValue: (val: string) => Promise<void>;
}

function InlineEdit({ value, setValue }: InlineEditProps) {
  const [editingValue, setEditingValue] = useState(value);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setEditingValue((event.target as HTMLInputElement).value);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === "Escape") {
      (event.target as HTMLInputElement).blur();
    }
  };

  const onClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation();
  };

  const onBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    await setValue(event.target.value);
  };

  return (
    <input
      aria-label="Field name"
      onClick={onClick}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      value={editingValue}
    ></input>
  );
}

export default InlineEdit;
