import React, { Component } from "react";

import TitleScreen from "./transition/Title";
import StartScreen from "./transition/Start";
import UserProfileIntroScreen from "./userprofile/UserProfileIntro";
import FamilyMembersScreen from "./userprofile/FamilyMembers";
import NeighbourNoiseScreen from "./userprofile/NeighbourNoise";
import AreaScreen from "./userprofile/Area";

class SlideController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlide: "title",
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
            checkpointDescription="userProfile"
            startCheckpoint={this.props.startCheckpoint}
          />
        );

      case "userProfileIntro":
        return (
          <UserProfileIntroScreen
            nextSlide="userProfileFamily"
            callNextSlide={this.updateActiveSlide}
          />
        );

      case "userProfileFamily":
        return (
          <FamilyMembersScreen
            nextSlide="area"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
          />
        );

      case "area":
        return (
          <AreaScreen
            nextSlide="userProfileNeighbourNoise"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
          />
        );

      case "userProfileNeighbourNoise":
        return (
          <NeighbourNoiseScreen
            nextSlide="title"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            checkpointDescription="userProfile"
            endCheckpoint={this.props.endCheckpoint}
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
