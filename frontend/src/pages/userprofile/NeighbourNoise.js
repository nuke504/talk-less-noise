import React, { Component } from "react";
import { gsap } from "gsap";

import { KEY_MAPPING } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionOut } from "../../animationUtils";

import "./NeighbourNoise.css";
import happyface from "../../img/misc/happyface.png";
import sadface from "../../img/misc/sadface.png";

class NeighbourNoiseScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.getButtonMap();
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  getButtonMap() {
    let functionMap = new Map();
    [1, 3].forEach((idx) => {
      functionMap.set(idx, () => {
        this.props.updateParam("neighbourNoiseIsProblem", idx !== 1);
        this.exitSlide();
      });
    });

    this.functionMap = functionMap;
  }

  buttonBlink(interval = 0.5) {
    let buttons = this.slide.current.querySelector(".btn-container").childNodes;
    buttons = [buttons[0], buttons[2]];

    const images = [
      this.slide.current.querySelector(".face-happy"),
      this.slide.current.querySelector(".face-sad"),
    ];

    const blinkTimeline = gsap.timeline({ repeat: -1 });
    [0, 1, 2].forEach((idx) => {
      if (idx > 0) {
        blinkTimeline.set(
          buttons[idx - 1],
          {
            backgroundColor: "#ffc078",
          },
          idx * interval
        );
        blinkTimeline.set(
          images[idx - 1],
          {
            filter: "none",
          },
          idx * interval
        );
      }

      if (idx < 2) {
        blinkTimeline.set(
          buttons[idx],
          {
            backgroundColor: "#d9480f",
          },
          idx * interval
        );
        blinkTimeline.set(
          images[idx],
          {
            filter: `
            drop-shadow(0.4rem 0.4rem 0.2rem var(--color-primary-shade-1)) drop-shadow(-0.4rem 0.4rem 0.2rem var(--color-primary-shade-1)) drop-shadow(0.4rem -0.4rem 0.2rem var(--color-primary-shade-1)) drop-shadow(-0.4rem -0.4rem 0.2rem var(--color-primary-shade-1))
            `,
          },
          idx * interval
        );
      }
    });
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
    if (keyIndex !== 0 && keyIndex !== 2) return;

    if (keyIndex === 0)
      this.props.updateParam("neighbourNoiseIsProblem", false);
    else if (keyIndex === 2)
      this.props.updateParam("neighbourNoiseIsProblem", true);

    this.exitSlide();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.buttonBlink();
  }

  componentWillUnmount() {
    this.props.endCheckpoint(this.props.checkpointDescription);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <main ref={this.slide}>
        <div className="neighbour-noise-container-top">
          <h1 className="neighbour-noise-primary-top">
            Is <strong>Neighbourly Noise</strong> <br /> a big issue for you?
          </h1>
          <div className="neighbour-noise-image-container">
            <img src={happyface} alt="Happy Face" className="face-happy" />
            <p>Not a problem</p>
          </div>
          <div className="neighbour-noise-image-container">
            <img src={sadface} alt="Happy Face" className="face-sad" />
            <p>It is a problem</p>
          </div>
        </div>
        <ButtonContainer
          instructions="Answer with the button!"
          functionMap={this.functionMap}
          animateHover={[1, 3]}
        />
      </main>
    );
  }
}

export default NeighbourNoiseScreen;
