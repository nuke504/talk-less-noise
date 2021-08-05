import React from "react";
import "./ButtonContainer.css";

import ButtonGallery from "./ButtonGallery";

export default function ButtonContainer(props) {
  let classes = "generic-button-container";

  if (props.className) {
    classes = `${classes} ${props.className}`;
  }
  return (
    <div className={classes}>
      <p className="generic-button-text">{props?.instructions}</p>
      <ButtonGallery {...props} />
    </div>
  );
}
