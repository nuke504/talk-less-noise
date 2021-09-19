import React, { Component } from "react";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionIn } from "../../utils/animationUtils";
import gsap from "gsap";
import {
  NOISE_CATEGORIES,
  NOISE_THRESHOLD_NAME,
  KEY_MAPPING,
} from "../../config";
import { range } from "../../utils/ui";

import "./Threshold.css";

function NoiseThreshold(props) {
  // Noise threshold prop
  const classes = `threshold-level-label ${props.className}`;

  if (props.reverse) {
    return (
      <div className={classes}>
        <p>
          {props.description} : <strong>{props.level}</strong>
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ionicon threshold-icon"
          viewBox="0 0 512 512"
          transform="rotate(180)"
        >
          <title>Triangle</title>
          <path
            fill={props.color ? props.color : "none"}
            stroke={props.color ? props.color : "currentColor"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
            d="M48 448L256 64l208 384H48z"
          />
        </svg>
      </div>
    );
  } else {
    return (
      <div className={classes}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ionicon threshold-icon"
          viewBox="0 0 512 512"
        >
          <title>Triangle</title>
          <path
            fill={props.color ? props.color : "none"}
            stroke={props.color ? props.color : "currentColor"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="32"
            d="M48 448L256 64l208 384H48z"
          />
        </svg>
        <p>
          {props.description} : <strong>{props.level}</strong>
        </p>
      </div>
    );
  }
}

function NoiseLabel(props) {
  const classes = `threshold-label ${props.className}`;
  return <div className={classes}>{props.children}</div>;
}

class SoundBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
    };

    this.timeline = gsap.timeline();
    this.soundBar = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.stepCallBack = this.stepCallBack.bind(this);
  }

  stepCallBack() {
    switch (this.state.step) {
      case 3: {
        const label = this.soundBar.current.querySelector(
          ".threshold-label--pos1"
        );
        gsap.to(label, {
          color: "rgba(73,80,87)",
          duration: this.props.stepDuration,
        });
        break;
      }
      case 6: {
        const label = this.soundBar.current.querySelector(
          ".threshold-label--pos2"
        );
        gsap.to(label, {
          color: "rgba(73,80,87)",
          duration: this.props.stepDuration,
        });
        break;
      }
      case this.props.numberSeparators:
        this.stop();
        break;
      default:
    }

    this.setState((state) => ({
      step:
        state.step < this.props.numberSeparators ? state.step + 1 : state.step,
    }));

    console.log(this.state.step);
  }

  start() {
    const thresholdWindows = this.soundBar.current.querySelectorAll(
      ".threshold-blank--thick"
    );

    this.interval = setInterval(
      this.stepCallBack,
      this.props.stepDuration * 1000
    );

    this.timeline.to(thresholdWindows, {
      autoAlpha: 0,
      duration: this.props.stepDuration,
      stagger: this.props.stepDuration,
    });
  }

  stop() {
    this.timeline.pause();
    clearInterval(this.interval);

    const userThresholdLabel = this.soundBar.current.querySelector(
      ".threshold-level-label--user"
    );

    userThresholdLabel.style.left = `${
      ((this.state.step - 1) * 130) / 12 + (130 / (12 * 5)) * 2
    }rem`;

    const blkThresholdLabel = this.soundBar.current.querySelector(
      ".threshold-level-label--blk"
    );

    blkThresholdLabel.style.left = `${
      ((this.props.threshold - 1) * 130) / 12 + (130 / (12 * 5)) * 2
    }rem`;

    gsap.to([userThresholdLabel, blkThresholdLabel], {
      opacity: 1,
      duration: 1,
    });
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1) return;

    this.stop();
  }

  componentDidMount() {
    this.start();
    document.addEventListener("keydown", this.handleKeyDown);

    this.resetThresholdLevels();
  }

  resetThresholdLevels() {
    const thresholdLabels = this.soundBar.current.querySelectorAll(
      ".threshold-level-label"
    );
    gsap.set(thresholdLabels, { opacity: 0 });
  }

  renderSeparators(numSeparators) {
    return range(0, numSeparators).map((x) => {
      return (
        <div key={x} className="threshold-blank">
          <div className="threshold-blank--thick"></div>
          <div className="threshold-blank--thin"></div>
        </div>
      );
    });
  }

  render() {
    const separators = this.renderSeparators(this.props.numberSeparators);

    return (
      <aside
        ref={this.soundBar}
        className="threshold-soundbar bottom-container"
      >
        <NoiseLabel className="threshold-label--pos1">
          <p>Level 4</p>
          <p>Moderate Snoring</p>
        </NoiseLabel>
        <NoiseLabel className="threshold-label--pos2">
          <p>Level 7</p>
          <p>Normal Chatting</p>
        </NoiseLabel>
        <div className="threshold-gradient"></div>
        <div className="threshold-blank-container">{separators}</div>
        <NoiseThreshold
          level={this.state.step}
          className="threshold-level-label--user"
          description="Your Threshold"
          reverse={false}
          color="red"
        />
        <NoiseThreshold
          level={this.props.threshold}
          className="threshold-level-label--blk"
          description="Block Threshold"
          reverse={true}
          color="#ccc"
        />
      </aside>
    );
  }
}

export default class ThresholdScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();

    this.state = {
      stage: "instructions",
      showButton: true,
      color: undefined,
      noiseCategory: undefined,
      percentage: undefined,
      noisyThreshold: undefined,
      niceThreshold: undefined,
      loaded: false,
    };

    this.progress = this.progress.bind(this);
    this.noiseCategories = NOISE_CATEGORIES;
    this.noiseCaptions = NOISE_THRESHOLD_NAME;
  }

  callGetAPI() {
    //  Once mounted, call API
    this.props.getNoiseCollation("noiseCategory").then((results) => {
      const { noiseCategory, percentage } = results.reduce(
        (acc, { percentage, noiseCategory }) => {
          if (percentage > acc.percentage) {
            return { percentage, noiseCategory };
          } else {
            return acc;
          }
        },
        { percentage: 0 }
      );

      this.setState({ noiseCategory, percentage });
      this.props.getThreshold("noiseCategory").then((results) => {
        const [{ noisyThreshold, niceThreshold }] = results.filter(
          ({ noiseCategory }) => noiseCategory === this.state.noiseCategory
        );

        this.setState({ loaded: true, noisyThreshold, niceThreshold });
      });
    });
  }
  componentDidMount() {
    this.callGetAPI();
  }

  progress() {
    switch (this.state.stage) {
      case "instructions":
        if (!this.state.loaded) {
          return;
        }
        this.setState({
          stage: "niceThreshold",
          showButton: false,
        });
        break;

      default:
        throw new Error(`${this.state.stage} is not a valid stage`);
    }
  }

  renderContent() {
    const noiseCategoryClass = `noise-collation-color--${this.state.noiseCategory}`;

    switch (this.state.stage) {
      case "instructions":
        return (
          <section className="grid threshold-container top-container">
            <div className="placeholder">Placeholder</div>
            <article className="flex flex--column-centre">
              <h1 className="heading--XL">How to Play</h1>
              <h2 className="text--L">
                a <strong className="threshold-sound">sound</strong> will play
                at increasing volume, press highlighted <strong>button</strong>{" "}
                to stop when you cannot tahan
              </h2>
            </article>
          </section>
        );
      case "niceThreshold":
        return (
          <>
            <section className="grid threshold-container top-container">
              <div className="placeholder">Placeholder</div>
              <article className="flex threshold-description">
                <h1 className="heading--M">Now Playing</h1>
                <h1 className="heading--LM">Noise of the Week:</h1>
                <h2 className="text--L">
                  <strong className={noiseCategoryClass}>
                    "{this.noiseCaptions.get(this.state.noiseCategory)}"
                  </strong>
                </h2>
                <h2 className="text--S">
                  <em>
                    <strong className={noiseCategoryClass}>
                      {this.state.percentage.toFixed(0)}%
                    </strong>{" "}
                    of the population are most affected by
                    <strong className={noiseCategoryClass}>
                      {" "}
                      {this.state.noiseCategory}
                    </strong>
                    ...
                  </em>
                </h2>
                <h3 className="text--S">
                  <br />
                  Press same button again to stop noise
                </h3>
              </article>
            </section>
            <SoundBar
              numberSeparators={12}
              stepDuration={0.5}
              threshold={this.state.niceThreshold}
            />
          </>
        );
      default:
        throw new Error(`${this.state.stage} is not a valid stage`);
    }
  }

  renderButton() {
    if (this.state.showButton) {
      return (
        <aside className="bottom-container">
          <ButtonContainer
            instructions="Press to Continue!"
            animate={[2]}
            animateHover={[2]}
            functionMap={new Map([[2, this.progress]])}
          />
        </aside>
      );
    }
  }

  render() {
    return (
      <main ref={this.slide} className="results-bg">
        {this.renderContent()}
        {this.renderButton()}
      </main>
    );
  }
}
