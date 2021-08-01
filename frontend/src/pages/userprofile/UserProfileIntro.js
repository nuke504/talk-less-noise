import React, { Component } from "react";
import { KEY_MAPPING } from "../../config";
import ButtonContainer from "../../components/ButtonContainer";
import selfIntroImage from "../../img/misc/self_introvert.png";
import { transitionOut } from "../../animationUtils";

import "./UserProfileIntro.css";

class UserProfileIntroScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  exitSlide() {
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

        <ButtonContainer
          instructions="PRESS TO START!"
          animate={[2]}
          functionMap={new Map([[2, this.exitSlide]])}
        />
      </main>
    );
  }
}

export default UserProfileIntroScreen;
