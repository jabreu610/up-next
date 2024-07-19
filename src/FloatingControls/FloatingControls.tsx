import { Id, Nullable } from "../util";
import styles from "./FloatingControls.module.css";
import classNames from "classnames/bind";
import FloatingControlsButton from "./FloatingControlsButton/FloatingControlsButton";
import { MouseEventHandler } from "react";

const cx = classNames.bind(styles);

type BaseConfig = {
  onClick: MouseEventHandler;
};

type LabelOnlyConfig = BaseConfig & {
  label: string;
};

type IconOnlyConfig = BaseConfig & {
  icon: string;
};

type LabelIconConfig = BaseConfig & LabelOnlyConfig & IconOnlyConfig;

type FloatingControlsProps = {
  config: (LabelOnlyConfig | IconOnlyConfig | LabelIconConfig)[];
  selectedId: Nullable<Id>;
  hidden?: boolean;
};

export default function FloatingControls({
  config,
  hidden = false,
  selectedId,
}: FloatingControlsProps) {
  if (hidden || !selectedId ) {
    return null;
  }
  return (
    <div className={cx("container")}>
      {config.map((item, index) => (
        <FloatingControlsButton key={index} {...item} />
      ))}
    </div>
  );
}
