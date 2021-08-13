import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import Modal from "./components/Modal";
import {
  APP_NAME,
  INITIAL_STATE,
  SLIDESHOW_ORDER,
  SLIDESHOW_INTERVAL,
} from "./config";
import {
  getNoiseCollation,
  getQuietHours,
  postNoiseCollation,
  postQuietHours,
  postStartAttempt,
  putCheckpoint,
  putEndAttempt,
} from "./utils/ajax";
import SlideController from "./pages/SlideController";
import "./App.css";

export default class App extends Component {
  // Set initial state
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;

    // Bind all state uplift methods
    this.updateParam = this.updateParam.bind(this);
    this.timeoutAttempt = this.timeoutAttempt.bind(this);

    this.getNoiseCollation = this.getNoiseCollation.bind(this);
    this.postNoiseCollation = this.postNoiseCollation.bind(this);

    this.postQuietHours = this.postQuietHours.bind(this);

    this.newAttempt = this.newAttempt.bind(this);
    this.startCheckpoint = this.startCheckpoint.bind(this);
    this.endCheckpoint = this.endCheckpoint.bind(this);
    this.endAttempt = this.endAttempt.bind(this);

    this.errorHandler = this.errorHandler.bind(this);
  }

  currentTime() {
    return new Date().toISOString();
  }

  // State Methods
  updateParam(param, value) {
    this.setState(() => {
      const transientState = {};
      transientState[param] = value;
      return transientState;
    });
  }

  timeoutAttempt() {
    this.endAttempt(false, "Timeout");
    this.setState(INITIAL_STATE);
  }

  // Survey Methods
  postNoiseCollation(noiseCategory) {
    const documentTime = this.currentTime();
    this.updateParam("noiseCategory", noiseCategory);
    postNoiseCollation({
      ...this.state,
      documentTime,
      noiseCategory,
      errorHandler: this.errorHandler,
    });
  }

  getNoiseCollation(...columns) {
    return getNoiseCollation(this.errorHandler, ...columns);
  }

  postQuietHours(hours) {
    const documentTime = this.currentTime();
    this.updateParam("hours", hours);
    postQuietHours({
      ...this.state,
      documentTime,
      hours,
      errorHandler: this.errorHandler,
    });
  }

  getQuietHours(...columns) {
    return getQuietHours(this.errorHandler, ...columns);
  }

  // Usage update methods
  newAttempt() {
    // Create a new attemptID and start time
    const startTime = this.currentTime();
    const attemptId = `${APP_NAME}-${uuidv4()}`;

    this.updateParam("startTime", startTime);
    this.updateParam("attemptId", attemptId);
    this.updateParam("complete", false);

    postStartAttempt(attemptId, startTime, this.errorHandler);
  }

  endAttempt(complete = true, failReason = null) {
    const endTime = this.currentTime();
    this.updateParam("complete", complete);
    this.updateParam("endTime", endTime);

    putEndAttempt(
      this.state.attemptId,
      endTime,
      complete,
      this.errorHandler,
      failReason
    );
  }

  // Checkpoint Methods
  startCheckpoint(description) {
    const start = this.currentTime();

    this.setState((state) => {
      state.checkpoints.push({ description, start });
    });

    putCheckpoint(this.state.attemptId, description, start, this.errorHandler);
  }

  endCheckpoint(description) {
    if (!description) {
      throw new Error("description cannot be null");
    }

    const end = this.currentTime();

    const checkpointIndex = this.state.checkpoints.findIndex(
      (checkpoint) => checkpoint.description === description
    );

    if (checkpointIndex === -1) {
      throw new Error(
        `Checkpoint with ${description} not found. Available checkpoints ${this.state.checkpoints}`
      );
    }

    this.setState((state) => {
      state.checkpoints[checkpointIndex].end = end;
    });

    putCheckpoint(
      this.state.attemptId,
      description,
      end,
      this.errorHandler,
      false
    );
  }

  errorHandler(title, message) {
    this.setState({ errorTitle: title, errorMessage: message });
  }

  render() {
    return (
      <div className="App" ref={this.app}>
        <SlideController
          newAttempt={this.newAttempt}
          updateParam={this.updateParam}
          getNoiseCollation={this.getNoiseCollation}
          getQuietHours={this.getQuietHours}
          postNoiseCollation={this.postNoiseCollation}
          postQuietHours={this.postQuietHours}
          startCheckpoint={this.startCheckpoint}
          endCheckpoint={this.endCheckpoint}
          endAttempt={this.endAttempt}
          timeoutAttempt={this.timeoutAttempt}
          errorHandler={this.errorHandler}
          slideshowOrder={SLIDESHOW_ORDER}
          slideshowInterval={SLIDESHOW_INTERVAL}
        />
        <Modal
          hidden={!this.state.errorMessage}
          onClose={() => this.errorHandler(null, null)}
        >
          <h2>{this.state.errorTitle}</h2>
          <p>{this.state.errorMessage}</p>
        </Modal>
      </div>
    );
  }
}
