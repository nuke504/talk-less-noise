import React, { Component } from "react";
import Chart from "chart.js/auto";

import { KEY_MAPPING, TIMEOUT_SECONDS } from "../../config";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import { convertPAM, hexToRGB, range, arrayMax } from "../../utils/ui";

import ButtonContainer from "../../components/ButtonContainer";

import "./QuietHours.css";

class Dial extends Component {
  constructor(props) {
    super(props);

    this.dial = React.createRef();

    this.state = {
      cx: 500,
      cy: 500,
      rx: 350,
      ry: 350,
      startAngle: 150,
      sweepAngle: 135,
      submitted: false,
    };

    this.MAX_OPACITY = 0.6;
    this.DIFFERENTIAL_GRADIENT = [
      "#FF0D0D",
      "#FF270F",
      "#FF4110",
      "#FF5A12",
      "#FF7413",
      "#FF8E15",
      "#FAB733",
      "#DDB638",
      "#C0B53D",
      "#A3B542",
      "#86B447",
      "#69B34C",
    ].map((color) => hexToRGB(color, this.MAX_OPACITY));

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  // All arc callbacks
  adjustStartAngle(add = true, multiplier = 1) {
    const increment = add ? 1 : -1;
    this.setState((state) => ({
      startAngle: state.startAngle + increment * multiplier,
    }));
  }

  adjustSweepAngle(add = true, multiplier = 1) {
    const increment = add ? 1 : -1;
    this.setState((state) => ({
      sweepAngle: state.sweepAngle + increment * multiplier,
    }));
  }

  assignAllEventListeners() {
    const buttons =
      this.dial.current.querySelector(".btn-container").childNodes;

    this.assignArcEventListener(
      buttons[0],
      this.adjustStartAngle.bind(this, true)
    );
    this.assignArcEventListener(
      buttons[3],
      this.adjustStartAngle.bind(this, false)
    );
    this.assignArcEventListener(
      buttons[1],
      this.adjustSweepAngle.bind(this, true)
    );
    this.assignArcEventListener(
      buttons[4],
      this.adjustSweepAngle.bind(this, false)
    );

    buttons[5].addEventListener("mousedown", () => {
      this.submitData();
    });
  }

  assignArcEventListener(node, callbackfn, fps = 1000 / 30) {
    let timer;

    const repeat = function () {
      callbackfn();
      timer = setTimeout(repeat, fps);
    };

    node.addEventListener(
      "mousedown",
      (e) => {
        repeat();
      },
      false
    );

    node.addEventListener(
      "mouseup",
      (e) => {
        clearTimeout(timer);
      },
      false
    );
  }

  getArcPath({ cx, cy, rx, ry, startAngle, sweepAngle }) {
    // 0 degrees, no path
    if (!sweepAngle) return `M${cx} ${cy}`;

    // mod angles to 360 degrees
    startAngle %= 360;
    sweepAngle %= 360;

    // If arc is 360 degrees, the sweep angle is 0 due to mod
    var isClosed = sweepAngle === 0;

    // If closed, we'll need to use 2 arcs with an angle of 180 degrees
    if (isClosed) {
      sweepAngle = 180;
    }

    // Make angle positive to simplify large arc flag
    if (sweepAngle < 0) {
      sweepAngle += 360;
    }

    var largeArc = sweepAngle > 180 ? 1 : 0;

    // Convert degrees to radians
    var a1 = (startAngle * Math.PI) / 180;
    var a2 = ((startAngle + sweepAngle) * Math.PI) / 180;

    // Calculate start and end coords for arc. Starts at 12 o'clock
    var x1 = cx + rx * Math.sin(a1);
    var y1 = cy - ry * Math.cos(a1);

    var x2 = cx + rx * Math.sin(a2);
    var y2 = cy - ry * Math.cos(a2);

    if (isClosed) {
      return `
          M ${x1} ${y1}
          A ${rx} ${ry} 0 1 1 ${x2} ${y2}
          A ${rx} ${ry} 0 1 1 ${x1} ${y1}z`;
    }

    return `
        M ${x1} ${y1}
        A ${rx} ${ry} 0 ${largeArc} 1 ${x2} ${y2}
        L ${cx} ${cy}z`;
  }

  // Calculate start and end hour from angle
  getStartEnd() {
    const interval = 360 / 24;
    let startAngle = (this.state.startAngle + 180) % 360;

    if (startAngle < 0) {
      startAngle = startAngle + 360;
    }

    let endAngle = (startAngle + this.state.sweepAngle) % 360;

    if (endAngle < 0) {
      endAngle = endAngle + 360;
    }

    const start = Math.floor(startAngle / interval);
    const end = Math.floor(endAngle / interval);
    return { start, end };
  }

  // Chart functions
  loadArray(dbResult) {
    const hours = Array.from(Array(24).keys());

    const chartData = hours.map((hour) => {
      const row = dbResult.find((row) => row.quietHour === hour);
      if (!row) return 0;

      return row.count;
    });

    return chartData;
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

  getDataPlaceholder(chartData) {
    // return chartData.map((count) => {
    //   if (count > 0) {
    //     return 1;
    //   } else {
    //     return 0;
    //   }
    // });
    return new Array(24).fill(1);
  }

  getColourGradient({
    chartData,
    color,
    comparisonData = null,
    maxOpacity = this.MAX_OPACITY,
    differentialGradient = this.DIFFERENTIAL_GRADIENT,
  }) {
    // let backgroundColoursRaw = [
    //   "#001D62",
    //   "#2A3A58",
    //   "#55574E",
    //   "#807544",
    //   "#AA923A",
    //   "#D5AF30",
    //   "#FFCC26",
    //   "#FFD64A",
    //   "#FFE06E",
    //   "#FEEB92",
    //   "#FEF5B6",
    //   "#FEFFDA",
    // ];

    // backgroundColoursRaw = backgroundColoursRaw.concat(
    //   backgroundColoursRaw.slice().reverse()
    // );

    // const result = backgroundColoursRaw.map((color, idx) =>

    const maxCount = arrayMax(chartData);

    if (!comparisonData)
      return chartData.map((elem) =>
        hexToRGB(color, maxOpacity * (elem / maxCount))
      );

    const maxCountComparison = arrayMax(comparisonData);

    return chartData.map((elem, idx) => {
      if (elem > 0) {
        // Case of intersection
        const gradientIdx = Math.trunc(
          (comparisonData[idx] / maxCountComparison) *
            (differentialGradient.length - 1)
        );
        return differentialGradient[gradientIdx];
      } else {
        return hexToRGB(color, 0);
      }
    });
  }

  prepareData(chartData, color, comparisonData = null) {
    const labels = Array.from(Array(24).keys()).map((hour) => {
      if (hour === 0) return "12 am";

      if (hour === 12) return "12 pm";

      if (hour > 12) return `${hour - 12} pm`;

      return `${hour} am`;
    });

    const data = {
      labels: this.rotateData(labels),
      datasets: [
        {
          data: this.rotateData(this.getDataPlaceholder(chartData)),
          borderWidth: 0,
          backgroundColor: this.rotateData(
            this.getColourGradient({ chartData, color, comparisonData })
          ),
          fill: true,
        },
      ],
    };

    return data;
  }

  addData() {
    this.props.getQuietHours().then((results) => {
      const chartData = this.loadArray(results);
      this.renderChart(chartData, "#001D62");

      // Add back user data as another dataset
      const { start, end } = this.getStartEnd();
      const userData = this.convertUserData(start, end);
      const { datasets } = this.prepareData(userData, "#0b9906", chartData);

      this.chart.data.datasets.push(datasets[0]);
      this.chart.update();
    });
  }

  renderChart(chartData, color, maxOpacity = this.MAX_OPACITY) {
    const config = {
      type: "doughnut",
      data: this.prepareData(chartData, color),

      options: {
        animation: {
          animateScale: false,
        },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: ({ datasetIndex, dataIndex, dataset }) => {
                if (datasetIndex === 0) {
                  const bgColour = dataset.backgroundColor[dataIndex];
                  const opacity =
                    Number.parseFloat(bgColour.match(/(\d\.?\d*)\)$/)[1]) /
                    maxOpacity;

                  if (opacity === 1) {
                    return "Everybody is sleeping";
                  } else if (opacity > 0.5) {
                    return "Most are sleeping";
                  } else if (opacity > 0) {
                    return "Some are sleeping";
                  } else {
                    return "Everybody is awake!";
                  }
                } else {
                  const bgColour = dataset.backgroundColor[dataIndex];
                  const gradientIndex =
                    this.DIFFERENTIAL_GRADIENT.indexOf(bgColour);

                  if (gradientIndex === -1) return "You are awake!";

                  const overlap =
                    (gradientIndex + 1) / this.DIFFERENTIAL_GRADIENT.length;

                  if (overlap === 1) {
                    return "Coincides with community!";
                  } else if (overlap > 0.5) {
                    return "Conincides with some of the community!";
                  } else {
                    return "You may be disturbed by the community";
                  }
                }
              },
            },
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
            },
            grid: {
              display: false,
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
      },
    };

    this.chart = new Chart(
      this.dial.current.querySelector("#quiet-hours-chart"),
      config
    );
  }

  submitData() {
    this.props.postQuietHours([this.getStartEnd()]);
    this.addData();
    this.setState({ submitted: true });
    transitionOut(this.dial.current.querySelector("svg"));
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  // Event Listeners for
  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1 || keyIndex === 2) return;

    switch (keyIndex) {
      case 0:
        this.adjustStartAngle(true, 5);
        break;
      case 1:
        this.adjustSweepAngle(true, 5);
        break;
      case 3:
        this.adjustStartAngle(false, 5);
        break;
      case 4:
        this.adjustSweepAngle(false, 5);
        break;
      case 5:
        this.submitData();
        break;
      default:
        return;
    }
  }

  componentDidMount() {
    this.assignAllEventListeners();
    // this.renderChart(new Array(24).fill(0), 1);

    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {}

  render() {
    const path = this.getArcPath({ ...this.state });
    const { start, end } = this.getStartEnd();

    return (
      <main ref={this.slide} className="quiet-hours-bg">
        <h1 className="quiet-hours-title">
          {this.state.submitted
            ? "Your Community's Quiet Hours are:"
            : "What are your quiet hours?"}
        </h1>
        <div className="quiet-hours-dial-container" ref={this.dial}>
          <div className="quiet-hours-dial">
            <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
              <path className="arc-path" d={path} />
            </svg>
            <div className="quiet-hours-dial-size">
              <canvas id="quiet-hours-chart"></canvas>
            </div>
          </div>
          <div className="quiet-hours-control">
            <h1>
              Selected Hours: <br />
              Start: {convertPAM(start)} <br />
              End: {convertPAM(end)}
            </h1>
            {this.state.submitted ? null : (
              <ButtonContainer
                buttonClass="btn-dial"
                className="btn-control"
                animateHover={[1, 2, 4, 5, 6]}
              />
            )}
          </div>
        </div>
      </main>
    );
  }
}

export default class QuietHoursScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.postQuietHours = this.postQuietHours.bind(this);
  }

  exitSlide() {
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  postQuietHours(hours) {
    // this.exitSlide();
    // this.props.postQuietHours(hours);
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    this.props.startCheckpoint(this.props.checkpointDescription);
    this.timeoutTimer = setTimeout(
      this.props.slideTimeout,
      TIMEOUT_SECONDS * 1000
    );
  }

  render() {
    return (
      <Dial
        postQuietHours={this.postQuietHours}
        getQuietHours={this.props.getQuietHours}
      />
    );
  }
}
