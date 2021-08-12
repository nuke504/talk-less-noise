import React, { Component } from "react";
import Chart from "chart.js/auto";

import { KEY_MAPPING, TIMEOUT_SECONDS } from "../../config";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import {
  convertPAM,
  hexToRGB,
  range,
  arrayMax,
  arrayLast,
} from "../../utils/ui";

// import ButtonContainer from "../../components/ButtonContainer";
import ButtonGallery from "../../components/ButtonGallery";

import "./QuietHours.css";

function DialControl(props) {
  if (props.submitted) {
    return (
      <div className="quiet-hours-control">
        <h2>Your quiet hours are:</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {props.quietHours.map((quietHour, idx) => {
              return (
                <tr key={idx + 1}>
                  <td>Segment {idx + 1}</td>
                  <td>{convertPAM(quietHour.start)}</td>
                  <td>{convertPAM(quietHour.end)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  } else {
    const activeQuietHours = arrayLast(props.quietHours);

    return (
      <div className="quiet-hours-control">
        <h1>
          You are <strong>selecting</strong>: <br />
          Start: {convertPAM(activeQuietHours.start)} <br />
          End: {convertPAM(activeQuietHours.end)}
        </h1>
        {props.quietHours.length <= 1 ? null : (
          <h2>
            You have also <strong>selected</strong>: <br />{" "}
            {convertPAM(props.quietHours[0].start)} to{" "}
            {convertPAM(props.quietHours[0].end)}
          </h2>
        )}
        <ButtonGallery
          buttonClass="btn-dial"
          className="btn-control"
          animateHover={[1, 2, 3, 4, 5, 6]}
          functionMap={props.functionMap}
        />
      </div>
    );
  }
}

class Dial extends Component {
  constructor(props) {
    super(props);

    this.dial = React.createRef();

    this.state = {
      alignHour: 12,
      submitted: false,
      userData: null,
      quietHours: [{ start: 22, end: 7 }],
      functionMap: this.getFunctionMap(),
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

  // Chart functions
  rotateDataset({
    datasetIdx = this.state.quietHours.length - 1,
    steps = 1,
    direction = "clockwise",
  }) {
    const { data, backgroundColor, ...kwargs } =
      this.chart.data.datasets[datasetIdx];
    const newDataset = {
      data: this.rotateArray({ arr: data, steps, direction }),
      backgroundColor: this.rotateArray({
        arr: backgroundColor,
        steps,
        direction,
      }),
      ...kwargs,
    };

    this.chart.data.datasets[datasetIdx] = newDataset;
    this.chart.update();

    this.setState((state) => {
      const lastHour = state.quietHours.pop();

      if (direction === "clockwise") {
        lastHour.end = (lastHour.end + 1) % 24;
        lastHour.start = (lastHour.start + 1) % 24;
      } else if (direction === "anti-clockwise") {
        lastHour.end = (lastHour.end - 1 + 24) % 24;
        lastHour.start = (lastHour.start - 1 + 24) % 24;
      }

      state.quietHours.push(lastHour);

      return state;
    });
  }

  extendDataset({
    datasetIdx = this.state.quietHours.length - 1,
    direction = "clockwise",
  }) {
    const { backgroundColor, ...kwargs } = this.chart.data.datasets[datasetIdx];
    const hours = arrayLast(this.state.quietHours);
    const index = hours.end;

    if (direction === "clockwise" && hours.start - hours.end === 1) {
      // Return if full circle
      return;
    }

    if (direction === "anti-clockwise" && hours.end - hours.start === 1) {
      // Return if no circle
      return;
    }

    const newDataset = {
      backgroundColor: this.extendArrayData({
        arr: backgroundColor,
        index: index + this.state.alignHour,
        alignHour: this.state.alignHour,
        direction,
      }),
      ...kwargs,
    };

    // Update chart
    this.chart.data.datasets[datasetIdx] = newDataset;
    this.chart.update();

    // Update state
    this.setState((state) => {
      const lastHour = state.quietHours.pop();

      if (direction === "clockwise") {
        lastHour.end = (lastHour.end + 1) % 24;
      } else if (direction === "anti-clockwise") {
        lastHour.end = (lastHour.end - 1 + 24) % 24;
      }

      state.quietHours.push(lastHour);

      return state;
    });
  }

  // Add new dataset
  addNewDataset({ color = "#60b28b", start = 15, end = 18 }) {
    const hours = { start, end };

    const userDataset = this.prepareData({
      chartData: this.convertUserData(hours),
      color,
    }).datasets[0];

    this.chart.data.datasets.push(userDataset);
    this.chart.update();

    const thirdButton =
      this.dial.current.querySelector(".btn-dial").parentNode.children[2];

    thirdButton.classList.toggle("btn-dial--minus");

    this.setState((state) => {
      const functionMap = state.functionMap;
      functionMap.set(3, () => {
        this.removeDataset();
      });

      const quietHours = state.quietHours;
      quietHours.push(hours);
      return { quietHours, functionMap };
    });
  }

  removeDataset() {
    this.chart.data.datasets.pop();
    this.chart.update();

    const thirdButton =
      this.dial.current.querySelector(".btn-dial").parentNode.children[2];

    thirdButton.classList.toggle("btn-dial--minus");

    this.setState((state) => {
      const functionMap = state.functionMap;
      functionMap.set(3, () => {
        this.addNewDataset({});
      });

      const quietHours = state.quietHours;
      quietHours.pop();
      return { quietHours, functionMap };
    });
  }

  rotateArray({ arr, steps, direction = "clockwise" }) {
    if (direction === "clockwise") {
      return arr
        .slice(arr.length - 1, arr.length)
        .concat(arr.slice(0, arr.length - 1));
    } else if (direction === "anti-clockwise") {
      return arr.slice(steps, arr.length).concat(arr.slice(0, steps));
    } else {
      throw new Error(
        `direction must be either clockwise or anti-clockwise. You entered ${direction}`
      );
    }
  }

  extendArrayData({ arr, index, direction = "clockwise" }) {
    const arrLength = arr.length;

    if (direction === "clockwise") {
      arr[index % arrLength] = arr[(index - 1) % arrLength];
      return arr;
    } else if (direction === "anti-clockwise") {
      arr[(index - 1) % arrLength] = arr[index % arrLength];
      return arr;
    } else {
      throw new Error(
        `direction must be either clockwise or anti-clockwise. You entered ${direction}`
      );
    }
  }

  getFunctionMap() {
    let functionMap = new Map();
    functionMap.set(1, () => {
      this.rotateDataset({ steps: 1, direction: "clockwise" });
    });

    functionMap.set(2, () => {
      this.extendDataset({ direction: "clockwise" });
    });

    functionMap.set(3, () => {
      this.addNewDataset({});
    });

    functionMap.set(4, () => {
      this.rotateDataset({ steps: 1, direction: "anti-clockwise" });
    });

    functionMap.set(5, () => {
      this.extendDataset({ direction: "anti-clockwise" });
    });

    functionMap.set(6, () => {
      this.submitData();
    });

    return functionMap;
  }

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

  convertUserData({ start, end, fillNum = 1 }) {
    const userData = new Array(24).fill(0);
    if (start > end) {
      range(start, 24).forEach((idx) => (userData[idx] = fillNum));
      range(0, end).forEach((idx) => (userData[idx] = fillNum));
    } else {
      range(start, end).forEach((idx) => (userData[idx] = fillNum));
    }
    return userData;
  }

  rotateData(data) {
    return data
      .slice(this.state.alignHour, 24)
      .concat(data.slice(0, this.state.alignHour));
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

  prepareData({ chartData, color, comparisonData = null }) {
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

  combineHours() {
    const currentQuietHours = this.state.quietHours;
    // Only combine if there is more than 1 quiet hour
    if (currentQuietHours.length === 1) {
      this.setState({ userData: this.convertUserData(currentQuietHours[0]) });
      return;
    }

    const mergedHoursArray = currentQuietHours
      .map((hour) => this.convertUserData(hour))
      .reduce((acc, arr) => {
        return acc.map((indicator, idx) => {
          if (!indicator && arr[idx]) {
            return 1;
          } else {
            return indicator;
          }
        });
      });

    // Throw error if selecting all 24hours of quiet time
    if (
      mergedHoursArray.reduce((arr, indicator) => arr + indicator, 0) === 24
    ) {
      throw new Error(
        "You are not allowed to select all 24 hours of quiet time"
      );
    }

    const mergedHours = mergedHoursArray.reduce((acc, indicator, idx) => {
      if (acc.length === 0 || arrayLast(acc)?.end) {
        // Start of new hour
        if (indicator) {
          acc.push({ start: idx });
        }
        return acc;
      } else {
        // End of new hour
        if (!indicator) {
          acc[acc.length - 1].end = idx;
        }
        return acc;
      }
    }, []);

    if (!arrayLast(mergedHours)?.end) {
      mergedHours[0].start = arrayLast(mergedHours).start;
      mergedHours.pop();
    }

    this.setState({ quietHours: mergedHours, userData: mergedHoursArray });
  }

  addCommunityData() {
    // Set chart animation to true
    this.chart.options.animation.animateScale = true;
    this.chart.options.animation.animateRotate = true;
    this.chart.options.plugins.tooltip.callbacks = {
      label: ({ datasetIndex, dataIndex, dataset }) => {
        if (datasetIndex === 1) {
          const bgColour = dataset.backgroundColor[dataIndex];
          const opacity =
            Number.parseFloat(bgColour.match(/(\d\.?\d*)\)$/)[1]) /
            this.MAX_OPACITY;

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
          const gradientIndex = this.DIFFERENTIAL_GRADIENT.indexOf(bgColour);

          if (gradientIndex === -1) return "You are awake!";

          const overlap =
            (gradientIndex + 1) / this.DIFFERENTIAL_GRADIENT.length;

          if (overlap === 1) {
            return "You are asleep with the community!";
          } else if (overlap > 0.5) {
            return "You are asleep but some others are awake!";
          } else if (overlap > 0.3) {
            return "You may be disturbed by the community";
          } else {
            return "You are likely to be disturbed by the community";
          }
        }
      },
    };

    // Remove all user data first
    this.chart.data.datasets = [];
    this.chart.update();

    this.props
      .getQuietHours()
      .then((results) => {
        const communityData = this.loadArray(results);
        const communityDataset = this.prepareData({
          chartData: communityData,
          color: "#001D62",
        }).datasets[0];

        // Add back user data as another dataset
        const userDataset = this.prepareData({
          chartData: this.state.userData,
          color: "#0b9906",
          comparisonData: communityData,
        }).datasets[0];

        this.chart.data.datasets.push(userDataset);
        this.chart.data.datasets.push(communityDataset);
        this.chart.update();
      })
      .catch((error) =>
        this.props.errorHandler(
          "Error in fetching data",
          "Not able to connect to the server"
        )
      );
  }

  initialiseChart() {
    // Entry point for initialising chartjs
    const userData = this.convertUserData(this.state.quietHours[0]);
    const userDataset = this.prepareData({
      chartData: userData,
      color: "#60b28b",
    });
    this.renderChart(userDataset);
  }

  renderChart(chartData, maxOpacity = this.MAX_OPACITY) {
    const config = {
      type: "doughnut",
      data: chartData,

      options: {
        animation: {
          animateScale: false,
          animateRotate: false,
        },
        // animations: {
        //   colors: {
        //     properties: ["backgroundColor"],
        //     type: "color",
        //   },
        // },
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: ({ datasetIndex, dataIndex, dataset }) => {
                const bgColour = dataset.backgroundColor[dataIndex];
                const opacity =
                  Number.parseFloat(bgColour.match(/(\d\.?\d*)\)$/)[1]) /
                  this.MAX_OPACITY;

                if (opacity === 1) {
                  return "You are sleeping";
                } else {
                  return "You are awake!";
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
    try {
      this.props.postQuietHours(this.state.quietHours);
      this.combineHours();
      this.setState({ submitted: true });
      this.addCommunityData();
    } catch (error) {
      this.props.errorHandler("Error", error.message);
    }
  }

  // Event Listeners for
  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key) + 1;
    // Return if invalid key
    if (keyIndex === -1) return;

    if (!this.state.submitted) this.state.functionMap.get(keyIndex)();
    else this.props.exitSlide();
  }

  componentDidMount() {
    this.initialiseChart();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <section className="quiet-hours-bg">
        <h1 className="quiet-hours-title">
          {this.state.submitted
            ? "Your Community's Quiet Hours are:"
            : "What are your quiet hours?"}
        </h1>
        <div className="quiet-hours-dial-container" ref={this.dial}>
          <div className="quiet-hours-dial">
            <div className="quiet-hours-dial-size">
              <canvas id="quiet-hours-chart"></canvas>
            </div>
          </div>
          <DialControl
            quietHours={this.state.quietHours}
            submitted={this.state.submitted}
            functionMap={this.state.functionMap}
          />
        </div>
      </section>
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
    this.props.endCheckpoint(this.props.checkpointDescription);
    this.props.endAttempt();
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  postQuietHours(hours) {
    this.props.postQuietHours(hours);
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
      <main ref={this.slide}>
        <Dial
          postQuietHours={this.postQuietHours}
          getQuietHours={this.props.getQuietHours}
          errorHandler={this.props.errorHandler}
          exitSlide={this.exitSlide}
        />
      </main>
    );
  }
}
