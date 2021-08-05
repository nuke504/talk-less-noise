import React, { Component } from "react";
import Chart from "chart.js/auto";

import { KEY_MAPPING } from "../../config";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import { convertPAM } from "../../utils/ui";

import "./QuietHoursResults.css";

export default class QuietHoursResultsScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.exitSlide = this.exitSlide.bind(this);

    this.state = {
      loaded: false,
    };
  }

  loadArray(dbResult) {
    const hours = Array.from(Array(24).keys());
    const maxCount = dbResult.reduce((acc, elem) => {
      return elem.count > acc ? elem.count : acc;
    }, 0);

    const percentages = hours.map((hour) => {
      const row = dbResult.find((row) => row.quietHour === hour);
      if (!row) return 0;

      return row.count / maxCount;
    });

    this.setState({ percentages });

    this.setState({ loaded: true });
    this.renderChart();
    transitionIn(this.slide.current);
  }

  exitSlide() {
    this.props.endCheckpoint(this.props.checkpointDescription);
    this.props.endAttempt();
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1) return;

    this.exitSlide();
  }

  componentDidMount() {
    //  Once mounted, call API
    this.props.getQuietHours().then((results) => {
      this.loadArray(results);
    });

    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  getLoadingScreen() {
    return <h1 className="loading">Loading survey results!</h1>;
  }

  renderChart() {
    const labels = Array.from(Array(24).keys()).map((hour) => {
      if (hour === 0) return "12 am";

      if (hour === 12) return "12 pm";

      if (hour > 12) return `${hour - 12} pm`;

      return `${hour} am`;
    });

    const backgroundColours = [
      "001D62",
      "2A3A58",
      "55574E",
      "807544",
      "AA923A",
      "D5AF30",
      "FFCC26",
      "FFD64A",
      "FFE06E",
      "FEEB92",
      "FEF5B6",
      "FEFFDA",
    ].map((elem) => `#${elem}`);

    const data = {
      labels: labels,
      datasets: [
        {
          label: "Percentage of Neighbours Sleeping",
          data: this.state.percentages.map((num) => (num * 100).toFixed(2)),
          backgroundColor: backgroundColours.concat(
            backgroundColours.slice().reverse()
          ),
          // borderColor: [
          //   'rgb(255, 99, 132)',
          //   'rgb(255, 159, 64)',
          //   'rgb(255, 205, 86)',
          //   'rgb(75, 192, 192)',
          //   'rgb(54, 162, 235)',
          //   'rgb(153, 102, 255)',
          //   'rgb(201, 203, 207)'
          // ],
          borderWidth: 1,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data,
      options: {
        // responsive: true,
        // maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Hour of Day",
            },
          },
          y: {
            ticks: {
              precision: 2,
            },
            beginAtZero: true,
            title: {
              display: true,
              text: "Percentage of Community (%)",
            },
          },
        },
        ticks: { min: 0 },
      },
    };

    this.chart = new Chart(
      this.slide.current.querySelector("#quiet-hours-chart"),
      config
    );
  }

  prepareResults() {
    if (!this.state.loaded) return this.getLoadingScreen();

    return <canvas id="quiet-hours-chart"></canvas>;
  }

  render() {
    return (
      <main ref={this.slide} className="results-bg">
        <section className="quiet-hours-section">
          <h1 className="quiet-hours-title">
            Your Community's Quiet Hours are:
          </h1>
          <div className="quiet-hours-chart-container">
            {this.prepareResults()}
          </div>
          {this.props.startQuiet ? (
            <h2 className="quiet-hours-caption">
              Your Quiet Hours are from {convertPAM(this.props.startQuiet)} to{" "}
              {convertPAM(this.props.endQuiet)}
            </h2>
          ) : (
            ""
          )}
        </section>
      </main>
    );
  }
}
