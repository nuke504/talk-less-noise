import React, { Component } from "react";

import TitleScreen from "./transition/TitleScreen";
import StartScreen from "./transition/StartScreen";
import UserProfileIntroScreen from "./userprofile/UserProfileIntro";

class SlideController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlide: "userProfileIntro",
    };

    // Bind all state uplift methods
    this.updateActiveSlide = this.updateActiveSlide.bind(this);
  }

  updateActiveSlide(activeSlide) {
    this.setState({ activeSlide });
  }

  // Helper Method for render
  renderSlide() {
    switch (this.state.activeSlide) {
      case "title":
        return (
          <TitleScreen
            newAttempt={this.props.newAttempt}
            nextSlide="start"
            callNextSlide={this.updateActiveSlide}
          />
        );
      case "start":
        return (
          <StartScreen
            nextSlide="userProfileIntro"
            callNextSlide={this.updateActiveSlide}
          />
        );

      case "userProfileIntro":
        return (
          <UserProfileIntroScreen
            nextSlide="title"
            callNextSlide={this.updateActiveSlide}
          />
        );

      default:
        throw new Error(`${this.state.activeSlide} is not a valid slide`);
    }
  }

  render() {
    return this.renderSlide();
  }
}

export default SlideController;
