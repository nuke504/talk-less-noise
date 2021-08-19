import React, { Component } from "react";
import { KEY_MAPPING, TIMEOUT_SECONDS } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import convoImage from "../../img/misc/people_talking.png";
import { transitionOut, transitionIn } from "../../utils/animationUtils";

import "./Start.css";

export default class StartScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
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
    if (e.key !== KEY_MAPPING[1]) return;

    this.exitSlide();
  }

  componentDidMount() {
    this.props.stopSlideShow();
    transitionIn(this.slide.current);
    this.props.startCheckpoint(this.props.checkpointDescription);
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
      <main className="start-screen" ref={this.slide}>
        <div className="start-container-top top-container grid grid--2row-3col-wide-main">
          <div className="start-conversation-image--left">
            <img src={convoImage} alt="Icon of two people talking" />
          </div>
          <h1 className="start-primary heading--XL">
            Let Us <br />
            Talk About <strong>Noise</strong>
          </h1>
          <p className="start-secondary heading--M">
            Discuss with your fellow residents about your noise preferences!
          </p>
          <div className="start-conversation-image--right">
            <img src={convoImage} alt="Icon of two people talking" />
          </div>
        </div>
        <ButtonContainer
          instructions="Press to Start!"
          animate={[2]}
          animateHover={[2]}
          functionMap={new Map([[2, this.exitSlide]])}
        />
      </main>
    );
  }
}
