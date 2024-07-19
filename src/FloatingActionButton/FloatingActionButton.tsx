import { MouseEventHandler } from "react";
import classNames from "classnames/bind";
import styles from "./FloatingActionButton.module.css";

const cx = classNames.bind(styles);
type FloatingActionButtonProps = {
  onClick: MouseEventHandler;
  tabIndex?: number;
  hidden?: boolean;
};

export function FloatingActionButton({
  onClick,
  tabIndex,
  hidden,
}: FloatingActionButtonProps) {
  if (hidden) {
    return null;
  }
  return (
    <button onClick={onClick} tabIndex={tabIndex} className={cx("container")}>
      Add
    </button>
  );
}
