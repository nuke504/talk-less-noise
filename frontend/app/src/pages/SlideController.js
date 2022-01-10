import React, { Component } from "react";

import { KEY_MAPPING } from "../config";

import TitleScreen from "./transition/Title";
import StartScreen from "./transition/Start";
import UserProfileIntroScreen from "./userprofile/UserProfileIntro";
import FamilyMembersScreen from "./userprofile/FamilyMembers";
import NeighbourNoiseScreen from "./userprofile/NeighbourNoise";
import AreaScreen from "./userprofile/Area";
import AgeScreen from "./userprofile/Age";

import NoiseCollationScreen from "./survey/NoiseCollation";
import NoiseCollationResultsScreen from "./survey/NoiseCollationResults";

import QuietHoursScreen from "./survey/QuietHours";
import QuietHoursResultsScreen from "./survey/QuietHoursResults";

import ThresholdScreen from "./survey/Threshold";

import EndScreen from "./transition/End";

export default class SlideController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlide: "title",
      slideShowSlideIdx: 0,
    };

    this.slideshowClocks = [];

    // Bind all state uplift methods
    this.updateActiveSlide = this.updateActiveSlide.bind(this);
    this.initSlideshowTimer = this.initSlideshowTimer.bind(this);
    this.slideTimeout = this.slideTimeout.bind(this);
    this.playSlideshow = this.playSlideshow.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.stopSlideShow = this.stopSlideShow.bind(this);
    this.startSlideShow = this.startSlideShow.bind(this);
  }

  slideTimeout() {
    this.props.timeoutAttempt();
    this.setState({ activeSlide: "title" });
  }

  updateActiveSlide(activeSlide) {
    this.setState({ activeSlide });
  }

  // Slideshow functions
  playSlideshow() {
    this.setState((state, props) => ({
      activeSlide: props.slideshowOrder[state.slideShowSlideIdx],
      slideShowSlideIdx:
        (state.slideShowSlideIdx + 1) % props.slideshowOrder.length,
    }));
  }

  reset() {
    this.slideshowClocks.forEach((interval) => clearInterval(interval));
    this.slideshowClocks = [];
    this.setState({ slideShowSlideIdx: 0 });
    this.updateActiveSlide("title");
  }

  initSlideshowTimer() {
    this.reset();
    this.slideshowClocks.push(
      setInterval(this.playSlideshow, this.props.slideshowInterval * 1000)
    );
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1) return;

    this.reset();
  }

  startSlideShow() {
    this.initSlideshowTimer();
    document.addEventListener("mousemove", this.initSlideshowTimer);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  stopSlideShow() {
    this.slideshowClocks.forEach((interval) => clearInterval(interval));
    this.setState({ slideShowSlideIdx: 0 });
    document.removeEventListener("mousemove", this.initSlideshowTimer);
    document.removeEventListener("keydown", this.handleKeyDown);
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
            startSlideShow={this.startSlideShow}
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
            stopSlideShow={this.stopSlideShow}
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
            nextSlide="quietHours"
            callNextSlide={this.updateActiveSlide}
            getNoiseCollation={this.props.getNoiseCollation}
            checkpointDescription="noiseCollation"
            endCheckpoint={this.props.endCheckpoint}
          />
        );

      case "quietHours":
        return (
          <QuietHoursScreen
            nextSlide="threshold"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            getQuietHours={this.props.getQuietHours}
            postQuietHours={this.props.postQuietHours}
            checkpointDescription="quietHours"
            startCheckpoint={this.props.startCheckpoint}
            endCheckpoint={this.props.endCheckpoint}
            errorHandler={this.props.errorHandler}
            slideTimeout={this.slideTimeout}
          />
        );

      case "quietHoursResults":
        return (
          <QuietHoursResultsScreen getQuietHours={this.props.getQuietHours} />
        );

      case "threshold":
        return (
          <ThresholdScreen
            nextSlide="end"
            callNextSlide={this.updateActiveSlide}
            getNoiseCollation={this.props.getNoiseCollation}
            getThreshold={this.props.getThreshold}
            postThreshold={this.props.postThreshold}
            checkpointDescription="threshold"
            startCheckpoint={this.props.startCheckpoint}
            endCheckpoint={this.props.endCheckpoint}
            slideTimeout={this.slideTimeout}
          />
        );

      case "end":
        return (
          <EndScreen
            nextSlide="title"
            callNextSlide={this.updateActiveSlide}
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
