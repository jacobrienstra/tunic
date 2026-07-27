import * as React from "react";

import { cn } from "@/lib/utils";

export interface TileProps<T> {
  active?: boolean;
  activeClass?: string;
  toggleFn: (v: T) => void;
  val: T;
}

function Tile<T>({
  active,
  activeClass = "",
  toggleFn,
  val,
  className,
  ...props
}: React.ComponentProps<"div"> & TileProps<T>) {
  return (
    <div
      data-slot="tile"
      className={cn(
        "group/tile ring-foreground/20 relative m-1 flex min-w-min cursor-pointer flex-col items-center overflow-hidden rounded-sm p-(--tile-spacing) ring-1 [--tile-spacing:--spacing(2)] hover:shadow-md",
        { "ring-3 ring-sky-500": active },
        { [activeClass]: active },
        className
      )}
      onClick={() => toggleFn(val)}
      {...props}
    />
  );
}

function TileTrunic({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-trunic"
      className={cn(
        "group/tile flex w-full justify-center overflow-visible",
        className
      )}
      {...props}
    />
  );
}

function TileAnnotation({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-annotation"
      className={cn("group/tile text-sky-500", className)}
      {...props}
    />
  );
}

function TileInput({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-input"
      className={cn("group/tile min-w-min, w-full", className)}
      {...props}
    />
  );
}

function TileImage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-image"
      className={cn("group/tile", className)}
      {...props}
    />
  );
}

export { Tile, TileTrunic, TileAnnotation, TileInput, TileImage };
