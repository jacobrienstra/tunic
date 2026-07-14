import * as React from "react";

import { cn } from "@/lib/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "group/section flex flex-row items-stretch border-b-2 border-green-600",
        className
      )}
      {...props}
    />
  );
}

function SectionControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-controls"
      className={cn(
        "group/section mr-2 flex min-w-30 flex-col items-center border-r-2 border-pink-600 px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h2 className={cn("group/section text-xl", className)} {...props} />;
}

function SectionContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-row items-start py-1", className)}
      {...props}
    />
  );
}

export { Section, SectionTitle, SectionControls, SectionContent };
