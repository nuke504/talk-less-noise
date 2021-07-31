import React from "react";
import "./ButtonGallery.css";

function ButtonGallery(props) {
  const buttonIndices = [1, 2, 3, 4, 5, 6];
  const buttons = buttonIndices.map((idx) => {
    if (idx === props.activeIdx) {
      return <button class="btn btn--active" onClick={props.onClick}></button>;
    }

    return <button class="btn"></button>;
  });

  return <div class="btn-container">{buttons}</div>;
}

export default ButtonGallery;
