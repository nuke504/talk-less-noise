import React, { Component } from "react";
import { gsap } from "gsap";
import { KEY_MAPPING } from "../../config";
import ButtonGallery from "../../components/ButtonGallery/ButtonGallery";
import selfIntroImage from "../../img/misc/self_introvert.png";

import "./UserProfileIntro.css";

class UserProfileIntroScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  transitionOut() {
    // gsap.to(this.slide.current, {
    //   duration: 0.5,
    //   opacity: 0,
    //   y: -100,
    //   ease: "back.in",
    // });
    // setTimeout(this.props.callNextSlide, 500, this.props.nextSlide);
    this.props.callNextSlide(this.props.nextSlide);
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
      <main className="user-profile-intro-screen" ref={this.slide}>
        <div className="user-profile-intro-container-top">
          <h1 className="user-profile-intro-primary-top">
            But before we begin...
          </h1>
          <h1 className="user-profile-intro-primary-bottom">
            Tell us more about you
          </h1>
          <div className="user-profile-intro-image">
            <img
              src={selfIntroImage}
              alt="Icon of an introspecting individual"
            />
          </div>
        </div>
        <div className="user-profile-intro-button-container">
          <p className="user-profile-intro-button-text">PRESS TO START!</p>
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

export default UserProfileIntroScreen;
