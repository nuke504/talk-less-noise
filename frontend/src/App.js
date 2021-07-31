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

      // Active Slide
      activeSlide: null,
    };

    // Bind all state uplift methods
    this.newAttempt = this.newAttempt.bind(this);
  }

  // State Methods

  newAttempt() {
    // Create a new attemptID and start time
    this.setState((state) => {
      state.startTime = new Date().toISOString();
      state.attemptId = "reactFrontend-testApp-01";
    });
  }

  render() {
    return (
      <div className="App">
        <SlideController newAttempt={this.newAttempt} />
        {/* <Switch>
          <Route exact path="/">
            <TitleScreen onTransit={this.newAttempt} transitTo="/start" />
          </Route>
          <Route exact path="/start">
            <StartScreen />
          </Route>
          <Route exact path="/test">
            <PlaceHolder />
          </Route>
          <Route path="/about">
                <About />
              </Route>
              <Route path="/dashboard">
                <Dashboard />
              </Route>
        </Switch> */}
      </div>
    );
  }
}
export default App;
