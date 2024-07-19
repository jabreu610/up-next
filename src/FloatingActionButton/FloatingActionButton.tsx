import { MouseEventHandler } from "react";
import classNames from "classnames/bind";
import styles from "./FloatingActionButton.module.css";

const cx = classNames.bind(styles);
type FloatingActionButtonProps = {
  onClick: MouseEventHandler;
  tabIndex?: number;
};

export function FloatingActionButton({
  onClick,
  tabIndex,
}: FloatingActionButtonProps) {
  return (
    <button onClick={onClick} tabIndex={tabIndex} className={cx("container")}>
      Add
    </button>
  );
}
