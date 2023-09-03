import { css } from "@emotion/react";
import { PropsWithChildren } from "react";

const section = css`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  align-items: stretch;
  align-content: center;

  &:not(:last-child) {
    box-shadow: 10px 0px 15px -15px rgba(0, 0, 0, 0.5);
  }
`;

const header = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: var(--slate-300);
  border-radius: 6px;
  padding: 8px 0;
  margin: 0 8px;
`;

type SectionProps = {
  title: string;
} & React.HTMLProps<HTMLDivElement>;

function Section({
  title,
  children,
  ...rest
}: PropsWithChildren<SectionProps>) {
  return (
    <section css={section} {...rest}>
      <h3 css={header}>{title}</h3>
      {children}
    </section>
  );
}

export default Section;
