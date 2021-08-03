import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { APP_NAME } from "./config";
import {
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
    this.state = {
      attemptId: null,
      area: null,
      numFamilyMembers: null,
      ageGroup: null,
      neighbourNoiseIsProblem: null,

      // For usageStats
      startTime: null,
      endTime: null,
      checkpoints: [],
      complete: null,
      incompleteReason: null,

      // All survey answers
      noiseCategory: null,
      quietHours: [],
      noisyThreshold: null,
      niceThreshold: null,
    };

    // Bind all state uplift methods
    this.updateParam = this.updateParam.bind(this);

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
    this.setState((state) => {
      state[param] = value;
    });
    // alert(`Updated ${param} ${value}`);
    // console.log(this.state);
  }

  // Survey Methods
  postNoiseCollation(noiseCategory) {
    const documentTime = this.currentTime();
    this.updateParam(noiseCategory, noiseCategory);
    postNoiseCollation({ ...this.state, documentTime, noiseCategory });
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

  endAttempt(complete = true) {
    const endTime = this.currentTime();
    this.updateParam("complete", complete);
    this.updateParam("endTime", endTime);

    putEndAttempt(this.state.attemptId, endTime, complete);
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
          postNoiseCollation={this.postNoiseCollation}
          startCheckpoint={this.startCheckpoint}
          endCheckpoint={this.endCheckpoint}
          endAttempt={this.endAttempt}
        />
      </div>
    );
  }
}
