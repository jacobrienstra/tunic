import { PropsWithChildren } from "react";
import { css } from "@emotion/react";

const section = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-content: center;
  height: 100%;
  /* &:not(:last-child) {
    box-shadow: 10px 0px 15px -15px rgba(0, 0, 0, 0.5);
  } */
`;

const header = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: var(--slate-300);
  border-radius: 6px;
  padding: 8px;
  margin: 0 8px;
  flex: 0 0 auto;
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
