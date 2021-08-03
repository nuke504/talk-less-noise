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
      activeSlide: "noiseCollationResults",
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
            nextSlide="age"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
          />
        );

      case "age":
        return (
          <AgeScreen
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
            nextSlide="noiseCollation"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            checkpointDescription="userProfile"
            endCheckpoint={this.props.endCheckpoint}
            // endAttempt={this.props.endAttempt}
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
