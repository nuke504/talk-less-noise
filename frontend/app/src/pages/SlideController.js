import React, { Component } from "react";
import { appInsights } from "../appInsights";
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

export default class SlideController extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeSlide: "title",
      slideShowSlideIdx: 0,
    };

    this.slideshowClocks = [];

    // Add slide timing tracking
    this.slideStartTime = Date.now();
    this.slideTimings = {}; // Store timing data for the entire session

    // Bind all state uplift methods
    this.updateActiveSlide = this.updateActiveSlide.bind(this);
    this.initSlideshowTimer = this.initSlideshowTimer.bind(this);
    this.slideTimeout = this.slideTimeout.bind(this);
    this.playSlideshow = this.playSlideshow.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.stopSlideShow = this.stopSlideShow.bind(this);
    this.startSlideShow = this.startSlideShow.bind(this);
  }

  componentDidMount() {
    // Track initial slide view
    this.slideStartTime = Date.now();

    appInsights.trackPageView({
      name: `Slide_${this.state.activeSlide}`,
      properties: {
        slideType: this.state.activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(this.state.activeSlide)
      }
    });

    appInsights.trackEvent({
      name: 'SlideViewed',
      properties: {
        slideName: this.state.activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(this.state.activeSlide),
        isFirstSlide: true
      }
    });
  }

  // Helper method to get consistent session ID
  getSessionId() {
    return this.props.attemptId || `session-${Date.now()}`;
  }

  // Helper method to get slide index for analytics
  getSlideIndex(slideName) {
    const slideOrder = [
      'title', 'start', 'userProfileIntro', 'userProfileFamily',
      'age', 'area', 'userProfileNeighbourNoise', 'noiseCollation',
      'noiseCollationResults', 'quietHours', 'quietHoursResults'
    ];
    return slideOrder.indexOf(slideName);
  }

  slideTimeout() {
    // Track timeout event
    const timeOnSlide = Date.now() - this.slideStartTime;

    appInsights.trackEvent({
      name: 'SlideTimeout',
      properties: {
        slideName: this.state.activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(this.state.activeSlide),
        timeoutReason: 'inactivity'
      },
      measurements: {
        timeOnSlideMs: timeOnSlide,
        timeOnSlideSeconds: Math.round(timeOnSlide / 1000)
      }
    });

    // Track slide exit due to timeout
    appInsights.trackEvent({
      name: 'SlideExited',
      properties: {
        slideName: this.state.activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(this.state.activeSlide),
        exitReason: 'timeout',
        nextSlide: 'title'
      },
      measurements: {
        timeOnSlideMs: timeOnSlide,
        timeOnSlideSeconds: Math.round(timeOnSlide / 1000)
      }
    });

    this.props.timeoutAttempt();
    this.setState({ activeSlide: "title" });
    this.slideStartTime = Date.now(); // Reset timer for new slide
  }

  updateActiveSlide(activeSlide) {
    const currentTime = Date.now();
    const timeOnSlide = currentTime - this.slideStartTime;
    const previousSlide = this.state.activeSlide;

    // Store timing data for session analytics
    this.slideTimings[previousSlide] = (this.slideTimings[previousSlide] || 0) + timeOnSlide;

    // Track slide transition
    appInsights.trackEvent({
      name: 'SlideTransition',
      properties: {
        fromSlide: previousSlide,
        toSlide: activeSlide,
        sessionId: this.getSessionId(),
        fromSlideIndex: this.getSlideIndex(previousSlide),
        toSlideIndex: this.getSlideIndex(activeSlide),
        transitionType: 'user_action'
      },
      measurements: {
        timeOnSlideMs: timeOnSlide,
        timeOnSlideSeconds: Math.round(timeOnSlide / 1000)
      }
    });

    // Track slide exit
    appInsights.trackEvent({
      name: 'SlideExited',
      properties: {
        slideName: previousSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(previousSlide),
        exitReason: 'user_progression',
        nextSlide: activeSlide
      },
      measurements: {
        timeOnSlideMs: timeOnSlide,
        timeOnSlideSeconds: Math.round(timeOnSlide / 1000)
      }
    });

    // Track new slide view
    appInsights.trackPageView({
      name: `Slide_${activeSlide}`,
      properties: {
        slideType: activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(activeSlide),
        previousSlide: previousSlide
      }
    });

    appInsights.trackEvent({
      name: 'SlideViewed',
      properties: {
        slideName: activeSlide,
        sessionId: this.getSessionId(),
        slideIndex: this.getSlideIndex(activeSlide),
        previousSlide: previousSlide,
        isFirstSlide: false
      }
    });

    // Track custom metric for slide duration
    appInsights.trackMetric({
      name: 'SlideViewDuration',
      average: Math.round(timeOnSlide / 1000), // Convert to seconds
      properties: {
        slideName: previousSlide,
        sessionId: this.getSessionId()
      }
    });

    this.setState({ activeSlide });
    this.slideStartTime = currentTime; // Reset timer for new slide
  }

  // Slideshow functions
  playSlideshow() {
    const currentTime = Date.now();
    const timeOnSlide = currentTime - this.slideStartTime;
    const previousSlide = this.state.activeSlide;
    const nextSlideIndex = (this.state.slideShowSlideIdx + 1) % this.props.slideshowOrder.length;
    const nextSlide = this.props.slideshowOrder[this.state.slideShowSlideIdx];

    // Track slideshow auto-progression
    appInsights.trackEvent({
      name: 'SlideshowProgression',
      properties: {
        fromSlide: previousSlide,
        toSlide: nextSlide,
        sessionId: this.getSessionId(),
        slideshowIndex: this.state.slideShowSlideIdx,
        nextSlideshowIndex: nextSlideIndex,
        progressionType: 'automatic'
      },
      measurements: {
        timeOnSlideMs: timeOnSlide,
        timeOnSlideSeconds: Math.round(timeOnSlide / 1000)
      }
    });

    this.setState((state, props) => ({
      activeSlide: props.slideshowOrder[state.slideShowSlideIdx],
      slideShowSlideIdx: nextSlideIndex,
    }));

    this.slideStartTime = currentTime; // Reset timer
  }

  reset() {
    // Track session reset
    appInsights.trackEvent({
      name: 'SessionReset',
      properties: {
        currentSlide: this.state.activeSlide,
        sessionId: this.getSessionId(),
        resetReason: 'user_interaction'
      },
      measurements: {
        totalSlideTimings: Object.keys(this.slideTimings).length,
        sessionDurationMs: Date.now() - (this.sessionStartTime || Date.now())
      }
    });

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

    // Track slideshow start
    appInsights.trackEvent({
      name: 'SlideshowStarted',
      properties: {
        currentSlide: this.state.activeSlide,
        sessionId: this.getSessionId(),
        slideshowInterval: this.props.slideshowInterval
      }
    });
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1) return;

    // Track user interaction
    appInsights.trackEvent({
      name: 'UserInteraction',
      properties: {
        interactionType: 'keypress',
        key: e.key,
        currentSlide: this.state.activeSlide,
        sessionId: this.getSessionId()
      }
    });

    this.reset();
  }

  startSlideShow() {
    this.sessionStartTime = Date.now(); // Track session start time

    appInsights.trackEvent({
      name: 'SlideshowSessionStarted',
      properties: {
        sessionId: this.getSessionId(),
        startSlide: this.state.activeSlide
      }
    });

    this.initSlideshowTimer();
    document.addEventListener("mousemove", this.initSlideshowTimer);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  stopSlideShow() {
    const sessionDuration = Date.now() - (this.sessionStartTime || Date.now());

    // Track session completion with summary metrics
    appInsights.trackEvent({
      name: 'SlideshowSessionEnded',
      properties: {
        sessionId: this.getSessionId(),
        endSlide: this.state.activeSlide,
        totalSlidesViewed: Object.keys(this.slideTimings).length
      },
      measurements: {
        sessionDurationMs: sessionDuration,
        sessionDurationSeconds: Math.round(sessionDuration / 1000),
        averageSlideTime: sessionDuration / Math.max(Object.keys(this.slideTimings).length, 1)
      }
    });

    // Track individual slide timing summary
    Object.entries(this.slideTimings).forEach(([slideName, totalTime]) => {
      appInsights.trackMetric({
        name: 'TotalSlideTime',
        average: Math.round(totalTime / 1000),
        properties: {
          slideName: slideName,
          sessionId: this.getSessionId()
        }
      });
    });

    this.slideshowClocks.forEach((interval) => clearInterval(interval));
    this.setState({ slideShowSlideIdx: 0 });
    document.removeEventListener("mousemove", this.initSlideshowTimer);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    // Track component unmount
    const timeOnSlide = Date.now() - this.slideStartTime;

    appInsights.trackEvent({
      name: 'SlideControllerUnmounted',
      properties: {
        lastSlide: this.state.activeSlide,
        sessionId: this.getSessionId()
      },
      measurements: {
        finalSlideTimeMs: timeOnSlide
      }
    });

    // Clean up event listeners
    document.removeEventListener("mousemove", this.initSlideshowTimer);
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  // Helper Method for render (unchanged)
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
            nextSlide="title"
            callNextSlide={this.updateActiveSlide}
            updateParam={this.props.updateParam}
            getQuietHours={this.props.getQuietHours}
            postQuietHours={this.props.postQuietHours}
            checkpointDescription="quietHours"
            startCheckpoint={this.props.startCheckpoint}
            endCheckpoint={this.props.endCheckpoint}
            endAttempt={this.props.endAttempt}
            errorHandler={this.props.errorHandler}
            slideTimeout={this.slideTimeout}
          />
        );

      case "quietHoursResults":
        return (
          <QuietHoursResultsScreen getQuietHours={this.props.getQuietHours} />
        );

      default:
        throw new Error(`${this.state.activeSlide} is not a valid slide`);
    }
  }

  render() {
    return this.renderSlide();
  }
}
