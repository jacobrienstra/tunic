import { PropsWithChildren } from "react";

type SectionProps = {
  title: string;
} & React.HTMLProps<HTMLDivElement>;

function Section({
  title,
  children,
  ...rest
}: PropsWithChildren<SectionProps>) {
  return (
    <section
      className="flex h-full flex-col content-center items-stretch"
      {...rest}
    >
      <h3 className="mx-2 flex flex-[0_0_auto] flex-row items-center justify-center rounded-md bg-slate-300 p-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default Section;
