import { PropsWithChildren } from "react";
import clsx from "clsx";

type TileProps<T> = {
  size?: number;
  align?: "center" | "start";
  active?: boolean;
  sure?: boolean;
  toggleFn: (v: T | null) => void;
  val: T | null;
} & React.HTMLProps<HTMLDivElement>;

function Tile<T>({
  size,
  children,
  align = "center",
  active = false,
  toggleFn,
  val,
  className,
  ...rest
}: PropsWithChildren<TileProps<T>>) {
  return (
    <div
      className={clsx(
        "flex cursor-pointer flex-col border border-dotted border-slate-300 p-2 hover:shadow-md",
        align === "center" ? "items-center" : "items-start",
        !size && "min-w-min",
        active && "bg-cyan-300",
        className
      )}
      style={size ? { minWidth: `${size}px` } : undefined}
      onClick={() => toggleFn(val)}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Tile;
