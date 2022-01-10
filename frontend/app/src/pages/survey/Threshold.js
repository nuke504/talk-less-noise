import React, { Component } from "react";
import ButtonContainer from "../../components/ButtonContainer";
import { transitionIn, transitionOut } from "../../utils/animationUtils";
import gsap from "gsap";
import { Power4 } from "gsap/all";

import {
  TIMEOUT_SECONDS,
  NOISE_CATEGORIES,
  NOISE_THRESHOLD_NAME,
  KEY_MAPPING,
} from "../../config";
import { range } from "../../utils/ui";
import dogNoise from "../../sound/labrador-barking.mp3";

import "./Threshold.css";

function NoiseThreshold(props) {
  // Noise threshold prop
  const classes = `threshold-level-label ${props.className}`;

  if (props.reverse) {
    return (
      <div className={classes}>
        <p>
          {props.description} :{" "}
          <strong>{Math.round(props.level).toFixed(0)}</strong>
        </p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ionicon threshold-icon"
          viewBox="0 0 512 512"
          style={{ transform: "rotate(180deg)" }}
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
    this.start = this.start.bind(this);
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

    this.props.sound.volume = this.state.step / this.props.numberSeparators;
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

    this.props.sound.volume = 0;
    this.props.sound.play();
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
      ((Math.round(this.props.threshold) - 1) * 130) / 12 + (130 / (12 * 5)) * 2
    }rem`;

    const endTimeLine = gsap.timeline();

    endTimeLine.to([userThresholdLabel, blkThresholdLabel], {
      opacity: 1,
      duration: 1,
    });

    // Fade out and call transition function
    endTimeLine.fromTo(
      this.soundBar.current,
      {
        autoAlpha: 1,
        scale: 1,
      },
      {
        duration: 1,
        delay: 3,
        autoAlpha: 0,
        scale: 0.8,
        ease: Power4.easeOut,
        onComplete: this.props.progressFunction,
      }
    );
    // Reset sound
    this.props.sound.pause();
    this.props.sound.currentTime = 0;

    // Post state to parent
    switch (this.props.category) {
      case "noise":
        this.props.setParentState({ userNoisyThreshold: this.state.step });
        break;
      case "nice":
        this.props.setParentState({ userNiceThreshold: this.state.step });
        break;
      default:
        throw new Error(`${this.props.category} is not a valid category`);
    }
    document.removeEventListener("keydown", this.handleKeyDown);
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
      userNoisyThreshold: undefined,
      userNiceThreshold: undefined,
      noisyThreshold: undefined,
      niceThreshold: undefined,
      loaded: false,
    };

    this.sounds = new Map([
      ["pets", new Audio(dogNoise)],
      ["furniture", new Audio(dogNoise)],
      ["baby", new Audio(dogNoise)],
      ["works", new Audio(dogNoise)],
      ["music", new Audio(dogNoise)],
      ["others", new Audio(dogNoise)],
      ["nice", new Audio(dogNoise)],
    ]);

    this.progress = this.progress.bind(this);
    this.noiseCategories = NOISE_CATEGORIES;
    this.noiseCaptions = NOISE_THRESHOLD_NAME;
    this.setState = this.setState.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
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

  progress() {
    switch (this.state.stage) {
      case "instructions":
        if (!this.state.loaded) {
          return;
        }
        this.setState({
          stage: "noisyThreshold",
          showButton: false,
        });
        break;
      case "noisyThreshold":
        this.setState({
          stage: "noisyThresholdResult",
          showButton: true,
        });
        document.addEventListener("keydown", this.handleKeyDown);
        break;
      case "noisyThresholdResult":
        this.setState({
          stage: "niceThreshold",
          showButton: false,
        });
        break;
      case "niceThreshold":
        this.setState({
          stage: "niceThresholdResult",
          showButton: true,
        });
        document.addEventListener("keydown", this.handleKeyDown);
        break;

      case "niceThresholdResult":
        this.props.postThreshold(
          this.state.userNoisyThreshold,
          this.state.userNiceThreshold
        );
        this.exitSlide();
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
      case "noisyThreshold":
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
              sound={this.sounds.get(this.state.noiseCategory)}
              numberSeparators={12}
              stepDuration={0.5}
              threshold={this.state.noisyThreshold}
              progressFunction={this.progress}
              setParentState={this.setState}
              category="noise"
            />
          </>
        );
      case "noisyThresholdResult":
        return (
          <section className="grid threshold-container top-container">
            <div className="placeholder">Placeholder</div>
            <article className="flex flex--column-centre">
              <h2 className="text--L">
                {this.state.userNoisyThreshold > this.state.noisyThreshold
                  ? "You seem to have an unusually high tolerance for noise! More so than your blk!"
                  : "You are quite sensitive to this noise! Less than your blk!"}
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
                <h1 className="heading--LM">Music of the Week:</h1>
                <h2 className="text--L">
                  <strong className={noiseCategoryClass}>
                    "Careless Whisper"
                  </strong>
                </h2>
                <h2 className="text--S">
                  <em>One of the most popular songs from the 80s...</em>
                </h2>
                <h3 className="text--S">
                  <br />
                  Press same button again to stop noise
                </h3>
              </article>
            </section>
            <SoundBar
              sound={this.sounds.get("nice")}
              numberSeparators={12}
              stepDuration={0.5}
              threshold={this.state.niceThreshold}
              progressFunction={this.progress}
              setParentState={this.setState}
              category="nice"
            />
          </>
        );
      case "niceThresholdResult":
        return (
          <section className="grid threshold-container top-container">
            <div className="placeholder">Placeholder</div>
            <article className="flex flex--column-centre">
              <h2 className="text--L">
                {this.state.userNiceThreshold > this.state.niceThreshold
                  ? "You like this song more than your blk!"
                  : "Even the most popular songs can be less enjoyable for some..."}
              </h2>
            </article>
          </section>
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
            functionMap={
              new Map([
                [
                  2,
                  () => {
                    document.removeEventListener("keydown", this.handleKeyDown);
                    this.progress();
                  },
                ],
              ])
            }
          />
        </aside>
      );
    }
  }

  handleKeyDown(e) {
    const keyIndex = KEY_MAPPING.indexOf(e.key);
    // Return if invalid key
    if (keyIndex === -1) return;

    document.removeEventListener("keydown", this.handleKeyDown);
    this.progress();
  }

  exitSlide() {
    this.props.endCheckpoint(this.props.checkpointDescription);

    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  componentDidMount() {
    this.callGetAPI();
    transitionIn(this.slide.current);
    this.props.startCheckpoint(this.props.checkpointDescription);
    this.timeoutTimer = setTimeout(
      this.props.slideTimeout,
      TIMEOUT_SECONDS * 1000 * 3
    );
    document.addEventListener("keydown", this.handleKeyDown);
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
