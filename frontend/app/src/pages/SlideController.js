import React, { Component } from "react";

import TitleScreen from "./transition/Title";
import StartScreen from "./transition/Start";
import UserProfileIntroScreen from "./userprofile/UserProfileIntro";
import FamilyMembersScreen from "./userprofile/FamilyMembers";
import NeighbourNoiseScreen from "./userprofile/NeighbourNoise";
import AreaScreen from "./userprofile/Area";
import AgeScreen from "./userprofile/Age";

import NoiseCollationScreen from "./survey/NoiseCollation";
import NoiseCollationResultsScreen from "./survey/NoiseCollationResults";

export default class SlideController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlide: "title",
    };

    // Bind all state uplift methods
    this.updateActiveSlide = this.updateActiveSlide.bind(this);
    this.slideTimeout = this.slideTimeout.bind(this);
  }

  slideTimeout() {
    this.props.timeoutAttempt();
    this.setState({ activeSlide: "title" });
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
            slideTimeout={this.slideTimeout}
          />
        );

      case "userProfileIntro":
        return (
          <UserProfileIntroScreen
            nextSlide="userProfileFamily"
            callNextSlide={this.updateActiveSlide}
            slideTimeout={this.slideTimeout}
          />
        );

      case "userProfileFamily":
        return (
          <FamilyMembersScreen
            nextSlide="age"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            slideTimeout={this.slideTimeout}
          />
        );

      case "age":
        return (
          <AgeScreen
            nextSlide="area"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            slideTimeout={this.slideTimeout}
          />
        );

      case "area":
        return (
          <AreaScreen
            nextSlide="userProfileNeighbourNoise"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            slideTimeout={this.slideTimeout}
          />
        );

      case "userProfileNeighbourNoise":
        return (
          <NeighbourNoiseScreen
            nextSlide="noiseCollation"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            checkpointDescription="userProfile"
            endCheckpoint={this.props.endCheckpoint}
            slideTimeout={this.slideTimeout}
          />
        );

      case "noiseCollation":
        return (
          <NoiseCollationScreen
            nextSlide="noiseCollationResults"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            postNoiseCollation={this.props.postNoiseCollation}
            checkpointDescription="noiseCollation"
            startCheckpoint={this.props.startCheckpoint}
            slideTimeout={this.slideTimeout}
          />
        );

      case "noiseCollationResults":
        return (
          <NoiseCollationResultsScreen
            nextSlide="title"
            callNextSlide={this.updateActiveSlide}
            getNoiseCollation={this.props.getNoiseCollation}
            checkpointDescription="noiseCollation"
            endCheckpoint={this.props.endCheckpoint}
            endAttempt={this.props.endAttempt}
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
