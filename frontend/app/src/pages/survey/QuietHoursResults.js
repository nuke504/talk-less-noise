import React, { Component } from "react";
import Chart from "chart.js/auto";

import { QUIET_HOURS_CHART_COLOUR } from "../../config";
import { transitionIn } from "../../utils/animationUtils";
import { hexToRGB, range } from "../../utils/ui";

import "./QuietHoursResults.css";

export default class QuietHoursResultsScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();

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
    return new Array(24)
      .fill(0)
      .map((color, idx) =>
        hexToRGB(
          QUIET_HOURS_CHART_COLOUR,
          maxOpacity * (this.state.chartData[idx] / this.state.maxCount)
        )
      );
  }

  componentDidMount() {
    //  Once mounted, call API
    this.props.getQuietHours().then((results) => {
      this.loadArray(results);
    });
  }

  renderChart() {
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
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
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
      this.slide.current.querySelector("#quiet-hours-results-chart"),
      config
    );
  }

  prepareResults() {
    if (!this.state.loaded) return this.getLoadingScreen();

    return <canvas id="quiet-hours-results-chart"></canvas>;
  }

  render() {
    return (
      <main ref={this.slide} className="results-bg">
        <section className="quiet-hours-results-section">
          <h1 className="quiet-hours-results-title">
            Your Community's Quiet Hours are:
          </h1>
          <div className="quiet-hours-chart-container">
            {this.prepareResults()}
          </div>
          <aside>
            <h2>
              The more opaque the section, the more people are asleep at that
              hour.
            </h2>
          </aside>
        </section>
      </main>
    );
  }
}
