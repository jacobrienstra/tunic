import * as React from "react";

import { cn } from "@/lib/utils";

function Section({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "group/section flex flex-col items-stretch border-b-2 border-green-600",
        className
      )}
      {...props}
    />
  );
}

function SectionMain({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-main"
      className={cn("group/section flex flex-row", className)}
      {...props}
    />
  );
}

function SectionControls({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-controls"
      className={cn(
        "group/section mr-2 flex w-30 min-w-35 flex-col items-center border-r-2 border-pink-600 px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

function SectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 className={cn("group/section text-xl", className)} {...props} />;
}

function SectionContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-content"
      className={cn("group/section flex flex-row items-start", className)}
      {...props}
    />
  );
}

function SectionFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="section-footer"
      className={cn(
        "group/section flex h-min flex-row border-t-2 p-2",
        className
      )}
      {...props}
    ></div>
  );
}

export {
  Section,
  SectionTitle,
  SectionControls,
  SectionContent,
  SectionFooter,
  SectionMain,
};
