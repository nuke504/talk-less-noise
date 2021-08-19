import React, { Component } from "react";
import { gsap } from "gsap";

import { KEY_MAPPING, AGE_GROUP, TIMEOUT_SECONDS } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import ageTimeline from "../../img/misc/age-timeline.png";

import "./Age.css";

function AgeContainer(props) {
  const position = { left: props.left, top: props.top };
  return (
    <figure className="age-card flex flex--column-centre" style={position}>
      <div className="age-card-circle"></div>
      <h1 className="age-card-age-group text--L">{props.ageGroup}</h1>
      <h2 className="age-card-caption text--S">years old</h2>
    </figure>
  );
}

export default class AgeScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.getButtonMap();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getButtonMap() {
    let functionMap = new Map();
    [1, 2, 3, 4, 5, 6].forEach((buttonIdx, idx) => {
      functionMap.set(buttonIdx, () => {
        this.props.updateParam("ageGroup", AGE_GROUP[idx]);
        this.exitSlide();
      });
    });

    this.functionMap = functionMap;
  }

  buttonBlink(interval = 0.5) {
    const buttons =
      this.slide.current.querySelector(".btn-container").childNodes;
    const ageCircles = this.slide.current.querySelectorAll(".age-card-circle");
    const ageGroupLabels = this.slide.current.querySelectorAll(
      ".age-card-age-group"
    );
    const ageGroupCaption =
      this.slide.current.querySelectorAll(".age-card-caption");

    const blinkTimeline = gsap.timeline({ repeat: -1 });
    [0, 1, 2, 3, 4, 5, 6].forEach((idx) => {
      if (idx > 0) {
        blinkTimeline.set(
          buttons[idx - 1],
          {
            backgroundColor: "#ffc078",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageCircles[idx - 1],
          {
            backgroundColor: "#ffc078",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageGroupLabels[idx - 1],
          {
            color: "#e67700",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageGroupCaption[idx - 1],
          {
            color: "#e67700",
          },
          idx * interval
        );
      }

      if (idx < 6) {
        blinkTimeline.set(
          buttons[idx],
          {
            backgroundColor: "#d9480f",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageCircles[idx],
          {
            backgroundColor: "#d9480f",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageGroupLabels[idx],
          {
            color: "#d9480f",
          },
          idx * interval
        );
        blinkTimeline.set(
          ageGroupCaption[idx],
          {
            color: "#d9480f",
          },
          idx * interval
        );
      }
    });
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
    if (keyIndex === -1) return;

    this.props.updateParam("ageGroup", AGE_GROUP[keyIndex]);

    this.exitSlide();
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    document.addEventListener("keydown", this.handleKeyDown);
    this.buttonBlink();
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
        <div className="age-container-top top-container">
          <h1 className="heading--L">
            What is your <strong>Age</strong>?
          </h1>
          <AgeContainer ageGroup="<20" left="6.5%" top="34%" />
          <AgeContainer ageGroup="20-29" left="21.7%" top="34%" />
          <AgeContainer ageGroup="30-39" left="37.4%" top="34%" />
          <AgeContainer ageGroup="40-49" left="52.5%" top="63%" />
          <AgeContainer ageGroup="50-59" left="67.5%" top="63%" />
          <AgeContainer ageGroup=">60" left="83%" top="63%" />
          <img
            src={ageTimeline}
            alt="Timeline background of different age groups"
          ></img>
        </div>
        <ButtonContainer
          instructions="Press the button for your age"
          functionMap={this.functionMap}
          animateHover={[1, 2, 3, 4, 5, 6]}
        />
      </main>
    );
  }
}
