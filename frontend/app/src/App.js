import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { APP_NAME, INITIAL_STATE } from "./config";
import {
  getNoiseCollation,
  postNoiseCollation,
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

    this.newAttempt = this.newAttempt.bind(this);
    this.startCheckpoint = this.startCheckpoint.bind(this);
    this.endCheckpoint = this.endCheckpoint.bind(this);
    this.endAttempt = this.endAttempt.bind(this);
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
    // alert(`Updated ${param} ${value}`);
    // console.log(this.state);
  }

  timeoutAttempt() {
    this.endAttempt(false, "Timeout");
    this.setState(INITIAL_STATE);
  }

  // Survey Methods
  postNoiseCollation(noiseCategory) {
    const documentTime = this.currentTime();
    this.updateParam(noiseCategory, noiseCategory);
    postNoiseCollation({ ...this.state, documentTime, noiseCategory });
  }

  getNoiseCollation(...columns) {
    return getNoiseCollation(...columns);
  }

  // Usage update methods
  newAttempt() {
    // Create a new attemptID and start time
    const startTime = this.currentTime();
    const attemptId = `${APP_NAME}-${uuidv4()}`;

    this.updateParam("startTime", startTime);
    this.updateParam("attemptId", attemptId);
    this.updateParam("complete", false);

    postStartAttempt(attemptId, startTime);
  }

  endAttempt(complete = true, failReason = null) {
    const endTime = this.currentTime();
    this.updateParam("complete", complete);
    this.updateParam("endTime", endTime);

    console.log("Ended", this.state);

    putEndAttempt(this.state.attemptId, endTime, complete, failReason);
  }

  // Checkpoint Methods
  startCheckpoint(description) {
    const start = this.currentTime();

    this.setState((state) => {
      state.checkpoints.push({ description, start });
    });

    putCheckpoint(this.state.attemptId, description, start);
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

    putCheckpoint(this.state.attemptId, description, end, false);
  }

  render() {
    return (
      <div className="App">
        <SlideController
          newAttempt={this.newAttempt}
          updateParam={this.updateParam}
          getNoiseCollation={this.getNoiseCollation}
          postNoiseCollation={this.postNoiseCollation}
          startCheckpoint={this.startCheckpoint}
          endCheckpoint={this.endCheckpoint}
          endAttempt={this.endAttempt}
          timeoutAttempt={this.timeoutAttempt}
        />
      </div>
    );
  }
}
