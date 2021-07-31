import React, { Component } from "react";
import { gsap } from "gsap";
import { KEY_MAPPING } from "../../config";
import ButtonGallery from "../../components/ButtonGallery/ButtonGallery";
import convoImage from "../../img/misc/people_talking.png";

import "./StartScreen.css";

class StartScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  transitionOut() {
    gsap.to(this.slide.current, {
      duration: 0.5,
      opacity: 0,
      y: -100,
      ease: "back.in",
    });
    setTimeout(this.props.callNextSlide, 500, this.props.nextSlide);
  }

  exitSlide() {
    // this.props.newAttempt();
    this.transitionOut();
  }

  handleKeyDown(e) {
    if (e.key !== KEY_MAPPING[1]) return;

    this.exitSlide();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <main className="start-screen" ref={this.slide}>
        <div className="start-container-top">
          <div className="start-conversation-image--left">
            <img src={convoImage} alt="Icon of two people talking" />
          </div>
          <h1 className="start-primary-top">Let Us</h1>
          <h1 className="start-primary-bottom">
            Talk About <div className="start-accent">Noise</div>
          </h1>
          <p className="start-secondary">
            Discuss with your fellow residents about your noise preferences!
          </p>
          <div className="start-conversation-image--right">
            <img src={convoImage} alt="Icon of two people talking" />
          </div>
        </div>
        <div className="start-button-container">
          <p className="start-button-text">PRESS TO START!</p>
          <ButtonGallery
            activeIdx={2}
            animation={true}
            onClick={this.exitSlide}
          />
        </div>
      </main>
    );
  }
}

export default StartScreen;
