import React from "react";

import "./Modal.css";

export default function Modal(props) {
  return (
    <section>
      <div className={`modal ${props.hidden ? "hidden" : ""} `}>
        <button className="close-modal" onClick={props.onClose}>
          &times;
        </button>
        {props.children}
      </div>
      <div className={`overlay ${props.hidden ? "hidden" : ""}`}></div>
    </section>
  );
}
