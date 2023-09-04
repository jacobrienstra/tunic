import { css } from "@emotion/react";
import { PropsWithChildren } from "react";
import { cx } from "@emotion/css";

type TileProps = {
  size?: number;
  align?: "center" | "start";
  active?: boolean;
} & React.HTMLProps<HTMLDivElement>;

function Tile({
  size,
  children,
  align = "center",
  active = false,
  ...rest
}: PropsWithChildren<TileProps>) {
  const tile = css`
    padding: 8px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    align-items: ${align};
    min-width: ${size ? `${size}px` : "min-content"};
    border: 1px dotted var(--slate-300);

    &:hover {
      box-shadow: 2px 2px 5px 0px rgba(0, 0, 0, 0.5);
    }

    &.active {
      background: var(--cyan-300);
    }
  `;

  return (
    <div css={tile} className={cx({ active })} {...rest}>
      {children}
    </div>
  );
}

export default Tile;
