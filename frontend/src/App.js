import React, { Component } from "react";
import axios from "axios";

import SlideController from "./pages/SlideController";
import "./App.css";

class App extends Component {
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
      noiseCollation: {},
      quietHours: {},
      threshold: {},
    };

    // Bind all state uplift methods
    this.newAttempt = this.newAttempt.bind(this);
    this.updateParam = this.updateParam.bind(this);
    this.startCheckpoint = this.startCheckpoint.bind(this);
    this.endCheckpoint = this.endCheckpoint.bind(this);
    this.endAttempt = this.endAttempt.bind(this);
  }

  currentTime() {
    return new Date().toISOString();
  }

  // State Methods
  newAttempt() {
    // Create a new attemptID and start time
    this.updateParam("startTime", this.currentTime());
    this.updateParam("attemptId", "reactFrontend-testApp-01");
    this.updateParam("complete", false);
  }

  updateParam(param, value) {
    this.setState((state) => {
      state[param] = value;
    });
    // alert(`Updated ${param} ${value}`);
    console.log(this.state);
  }

  startCheckpoint(description) {
    this.setState((state) => {
      state.checkpoints.push({ description, start: this.currentTime() });
    });
  }

  endCheckpoint(description) {
    const checkpointIndex = this.state.checkpoints.findIndex(
      (checkpoint) => checkpoint.description === description
    );
    this.setState((state) => {
      state.checkpoints[checkpointIndex].end = this.currentTime();
    });
  }

  endAttempt() {
    this.updateParam("complete", true);
    this.updateParam("endTime", this.currentTime());
  }

  render() {
    return (
      <div className="App">
        <SlideController
          newAttempt={this.newAttempt}
          updateParam={this.updateParam}
          startCheckpoint={this.startCheckpoint}
          endCheckpoint={this.endCheckpoint}
          endAttempt={this.endAttempt}
        />
      </div>
    );
  }
}
export default App;
