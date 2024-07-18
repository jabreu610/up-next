import { MouseEventHandler } from "react";
import styles from "./FloatingControlsButton.module.css";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);

type FloatingControlsButtonProps = {
  label?: string;
  icon?: string;
  onClick: MouseEventHandler;
};
export default function FloatingControlsButton({
  label,
  onClick,
}: FloatingControlsButtonProps) {
  return (
    <button className={cx("container")} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
}
