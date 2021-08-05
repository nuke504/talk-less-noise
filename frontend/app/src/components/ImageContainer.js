import React from "react";
import "./ImageContainer.css";

export default function ImageContainer(props) {
  return (
    <div className="generic-image-container">
      <img src={props.src} alt={props?.alt} style="" />
      <p>{props?.caption}</p>
    </div>
  );
}
