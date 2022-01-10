import React from "react";

import ButtonGallery from "./ButtonGallery";

export default function ButtonContainer(props) {
  let classes = "bottom-container flex flex--column-centre flex-gap-M";

  if (props.className) {
    classes = `${classes} ${props.className}`;
  }
  return (
    <div className={classes}>
      <p className="text--M text--bold">{props?.instructions}</p>
      <ButtonGallery {...props} />
    </div>
  );
}
