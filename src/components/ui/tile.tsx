import * as React from "react";

import { cn } from "@/lib/utils";

interface TileProps<T> {
  active?: boolean;
  toggleFn: (v: T) => void;
  val: T;
}

function Tile<T>({
  active,
  toggleFn,
  val,
  className,
  ...props
}: React.ComponentProps<"div"> & TileProps<T>) {
  return (
    <div
      data-slot="tile"
      className={cn(
        "group/tile hover:shadow-s ring-foreground/20 m-1 flex min-w-min cursor-pointer flex-col items-center overflow-hidden rounded-sm p-(--tile-spacing) ring-1 transition-all [--tile-spacing:--spacing(2)]",
        { "ring-3 ring-sky-500": active },
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
      className={cn("flex w-full justify-center overflow-visible", className)}
      {...props}
    />
  );
}

function TileAnnotation({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-annotation"
      className={cn("text-sky-500", className)}
      {...props}
    />
  );
}

function TileInput({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile-input"
      className={cn("min-w-min, w-full", className)}
      {...props}
    />
  );
}

function TileImage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="tile-image" className={cn("", className)} {...props} />
  );
}

export { Tile, TileTrunic, TileAnnotation, TileInput, TileImage };
