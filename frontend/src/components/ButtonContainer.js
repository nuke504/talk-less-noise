import React from "react";
import "./ButtonContainer.css";

import ButtonGallery from "./ButtonGallery";

export default function ButtonContainer(props) {
  return (
    <div className="generic-button-container">
      <p className="generic-button-text">{props?.instructions}</p>
      <ButtonGallery {...props} />
    </div>
  );
}
