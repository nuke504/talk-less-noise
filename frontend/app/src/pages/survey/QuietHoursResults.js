import React, { Component } from "react";
import Chart from "chart.js/auto";

import { KEY_MAPPING } from "../../config";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import { convertPAM, hexToRGB, range } from "../../utils/ui";

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

    const chartData = hours.map((hour) => {
      const row = dbResult.find((row) => row.quietHour === hour);
      if (!row) return 0;

      return row.count;
    });

    this.setState({ chartData, maxCount, loaded: true });
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

  convertUserData(start, end, fillNum = 1) {
    const userData = new Array(24).fill(0);
    if (start > end) {
      range(start, 24).forEach((idx) => (userData[idx] = fillNum));
      range(0, end).forEach((idx) => (userData[idx] = fillNum));
    } else {
      range(start, end).forEach((idx) => (userData[idx] = fillNum));
    }
    return userData;
  }

  rotateData(data, startHour = 12) {
    return data.slice(startHour, 24).concat(data.slice(0, startHour));
  }

  getDataPlaceholder() {
    return this.state.chartData.map((count) => {
      if (count > 0) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  getColourGradient(maxOpacity = 0.6) {
    let backgroundColoursRaw = [
      "#001D62",
      "#2A3A58",
      "#55574E",
      "#807544",
      "#AA923A",
      "#D5AF30",
      "#FFCC26",
      "#FFD64A",
      "#FFE06E",
      "#FEEB92",
      "#FEF5B6",
      "#FEFFDA",
    ];

    backgroundColoursRaw = backgroundColoursRaw.concat(
      backgroundColoursRaw.slice().reverse()
    );

    return backgroundColoursRaw.map((color, idx) =>
      hexToRGB(
        "#001D62",
        maxOpacity * (this.state.chartData[idx] / this.state.maxCount)
      )
    );
  }

  renderChart() {
    const labels = Array.from(Array(24).keys()).map((hour) => {
      if (hour === 0) return "12 am";

      if (hour === 12) return "12 pm";

      if (hour > 12) return `${hour - 12} pm`;

      return `${hour} am`;
    });

    // const backgroundColours = backgroundColoursRaw.map((color) =>
    //   hexToRGB(color, 0.6)
    // );
    // const backgroundColoursHover = backgroundColoursRaw.map((color) =>
    //   hexToRGB(color, 1)
    // );

    const data = {
      labels: this.rotateData(labels),
      datasets: [
        // {
        //   data: this.rotateData(this.convertUserData(0, 12, 1)),
        //   //   pointRadius: 0,
        //   backgroundColor: hexToRGB("#d9480f", 0.8),
        //   fill: true,
        //   borderWidth: 0,
        //   //   backgroundColor: "rgba(255, 99, 132, 0.2)",
        //   borderColor: "rgb(255, 99, 132)",
        //   //   pointBackgroundColor: "rgb(255, 99, 132)",
        //   //   pointBorderColor: "#fff",
        //   //   pointHoverBackgroundColor: "#fff",
        //   //   pointHoverBorderColor: "rgb(255, 99, 132)",
        // },
        {
          data: this.rotateData(this.getDataPlaceholder()),
          borderWidth: 0,
          backgroundColor: this.rotateData(this.getColourGradient()),
          fill: true,
        },
      ],
    };

    const config = {
      type: "polarArea",
      data: data,

      options: {
        elements: {
          point: { radius: 5, backgroundColor: "#001D62" },
          line: {
            // backgroundColor: hexToRGB("#FFE06E", 0.1),
            tension: 0.1,
          },
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          r: {
            angleLines: {
              display: false,
            },
            suggestedMin: 0,
            suggestedMax: 1,
            ticks: {
              display: false,
              // z: 1,
              // font: {
              //   family: "Comic Neue",
              //   size: 20,
              //   weight: 700,
              // },
            },
            grid: {
              display: false,
              color: "#cfcfcf",
              circular: true,
              // lineWidth: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            },
            pointLabels: {
              display: true,
              font: {
                family: "Comic Neue",
                size: 20,
                weight: 700,
              },
            },
          },
        },
        // cutoutPercentage: 20,
        // legend: {
        //   display: false,
        // },
        // layout: {
        //   padding: 0,
        // },

        // },
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
