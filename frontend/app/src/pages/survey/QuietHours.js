import React, { Component } from "react";

import { KEY_MAPPING, TIMEOUT_SECONDS } from "../../config";
import { transitionOut, transitionIn } from "../../utils/animationUtils";
import { convertPAM } from "../../utils/ui";

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
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  // All arc callbacks
  adjustStartAngle(add = true) {
    const increment = add ? 1 : -1;
    this.setState((state) => ({
      startAngle: state.startAngle + increment,
    }));
  }

  adjustSweepAngle(add = true) {
    const increment = add ? 1 : -1;
    this.setState((state) => ({
      sweepAngle: state.sweepAngle + increment,
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
      this.props.postQuietHours([this.getStartEnd()]);
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

  // Event Listeners for
  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1 || keyIndex === 2) return;

    switch (keyIndex) {
      case 0:
        this.adjustStartAngle(true);
        break;
      case 1:
        this.adjustSweepAngle(true);
        break;
      case 3:
        this.adjustStartAngle(false);
        break;
      case 4:
        this.adjustSweepAngle(false);
        break;
      case 5:
        this.props.postQuietHours([this.getStartEnd()]);
        break;
      default:
        return;
    }
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

  componentDidMount() {
    this.assignAllEventListeners();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const path = this.getArcPath({ ...this.state });
    const { start, end } = this.getStartEnd();

    return (
      <div className="quiet-hours-dial-container" ref={this.dial}>
        <div className="quiet-hours-dial">
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
            <path className="arc-path" d={path} />
          </svg>
        </div>
        <div className="quiet-hours-control">
          <h1>
            Selected Hours: <br />
            Start: {convertPAM(start)} <br />
            End: {convertPAM(end)}
          </h1>
          <ButtonContainer
            buttonClass="btn-dial"
            className="btn-control"
            animateHover={[1, 2, 4, 5, 6]}
          />
        </div>
      </div>
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
    this.exitSlide();
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
      <main ref={this.slide} className="quiet-hours-bg">
        <h1 className="quiet-hours-title">What are your quiet hours?</h1>
        <Dial postQuietHours={this.postQuietHours} />
      </main>
    );
  }
}
