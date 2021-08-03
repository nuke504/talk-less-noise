import React from "react";
import "./ButtonGallery.css";

export default function ButtonGallery(props) {
  const buttonIndices = [1, 2, 3, 4, 5, 6];
  const buttons = buttonIndices.map((idx) => {
    let classNames = "btn";

    if (props.animate?.includes(idx)) {
      classNames = `${classNames} btn--active`;
    }

    if (props.animateHover?.includes(idx)) {
      classNames = `${classNames} btn-hover`;
    }

    if (props.buttonClass) {
      classNames = `${classNames} ${props.buttonClass}`;
    }

    if (props.functionMap?.has(idx)) {
      return (
        <button
          key={String(idx)}
          className={classNames}
          onClick={props.functionMap.get(idx)}
        ></button>
      );
    }

    return <button key={String(idx)} className={classNames}></button>;
  });

  let classes = "btn-container";

  if (props.className) {
    classes = `${classes} ${props.className}`;
  }

  return <div className={classes}>{buttons}</div>;
}
