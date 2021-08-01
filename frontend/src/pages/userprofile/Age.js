import React, { Component } from "react";

import { KEY_MAPPING, AGE_GROUP } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionOut } from "../../animationUtils";

import "./Age.css";
import singaporeMap from "../../img/misc/singapore-map.png";

export default class AgeScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.getButtonMap();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getButtonMap() {
    let functionMap = new Map();
    [1, 2, 3, 4, 6].forEach((buttonIdx, idx) => {
      functionMap.set(buttonIdx, () => {
        this.props.updateParam("ageGroup", AGE_GROUP[idx]);
        this.exitSlide();
      });
    });

    this.functionMap = functionMap;
  }

  exitSlide() {
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key or button 5
    if (keyIndex === -1 || keyIndex === 4) return;

    this.exitSlide();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    // this.buttonBlink();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <main ref={this.slide}>
        <div className="area-container-top">
          <h1 className="area-primary-top">
            Which area of <strong>Singapore</strong> do you live in?
          </h1>
          <img
            src={singaporeMap}
            alt="Map of Singapore broken up into 5 colours"
          />
        </div>
        <ButtonContainer
          instructions="Press the button for your area"
          functionMap={this.functionMap}
          animateHover={[1, 2, 3, 4, 6]}
        />
      </main>
    );
  }
}
