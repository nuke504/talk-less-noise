import React, { Component } from "react";

import { KEY_MAPPING, AREAS, TIMEOUT_SECONDS } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionOut, transitionIn } from "../../utils/animationUtils";

import "./Area.css";
import singaporeMap from "../../img/misc/singapore-map.png";

function MapLegend(props) {
  return (
    <aside className="legend">
      <div className="legend-box legend-box--orange">&nbsp;</div>
      <p>North-East</p>
      <div className="legend-box legend-box--red">&nbsp;</div>
      <p>North</p>
      <div className="legend-box legend-box--green">&nbsp;</div>
      <p>Central</p>
      <div className="legend-box legend-box--blue">&nbsp;</div>
      <p>West</p>
      <div className="legend-box legend-box--purple">&nbsp;</div>
      <p>East</p>
    </aside>
  );
}

export default class AreaScreen extends Component {
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
        this.props.updateParam("area", AREAS[idx]);
        this.exitSlide();
      });
    });

    this.functionMap = functionMap;
  }

  exitSlide() {
    clearInterval(this.timeoutTimer);
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

    this.props.updateParam("area", AREAS[keyIndex]);

    this.exitSlide();
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    document.addEventListener("keydown", this.handleKeyDown);
    this.timeoutTimer = setTimeout(
      this.props.slideTimeout,
      TIMEOUT_SECONDS * 1000
    );
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
          <MapLegend />
        </div>
        <ButtonContainer
          instructions="Press the button for your area"
          buttonClass="btn-area"
          functionMap={this.functionMap}
          animateHover={[1, 2, 3, 4, 6]}
        />
      </main>
    );
  }
}
