import React, { Component } from "react";
import { gsap } from "gsap";
import { KEY_MAPPING, TIMEOUT_SECONDS } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionOut, transitionIn } from "../../utils/animationUtils";

import "./FamilyMembers.css";

function FamilyMemberNumbers(props) {
  const members = [1, 2, 3, 4, 5, 6];
  const listItems = members.map((number) => (
    <li key={number.toString()}>{number}</li>
  ));
  return <ul className={props.className}>{listItems}</ul>;
}

class FamilyMembersScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.getButtonMap();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getButtonMap() {
    let functionMap = new Map();
    [1, 2, 3, 4, 5, 6].forEach((idx) => {
      functionMap.set(idx, () => {
        this.props.updateParam("numFamilyMembers", idx);
        this.exitSlide();
      });
    });

    this.functionMap = functionMap;
  }

  buttonBlink(interval = 0.5) {
    const buttons =
      this.slide.current.querySelector(".btn-container").childNodes;
    const numbers = this.slide.current.querySelector(
      ".family-members-number-box"
    ).childNodes;

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
          numbers[idx - 1],
          {
            color: "#ffc078",
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
          numbers[idx],
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
    if (keyIndex === -1) return;

    this.props.updateParam("numFamilyMembers", keyIndex + 1);

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
        <div className="family-members-container-top">
          <h1 className="family-members-primary-top">
            How many family <br /> members do you have?
          </h1>
          <FamilyMemberNumbers className="family-members-number-box" />
        </div>
        <ButtonContainer
          instructions="Press the button corresponding to your choice!"
          functionMap={this.functionMap}
          animateHover={[1, 2, 3, 4, 5, 6]}
        />
      </main>
    );
  }
}

export default FamilyMembersScreen;
