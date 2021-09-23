import React, { Component } from "react";
import { gsap, Power3 } from "gsap";

import { KEY_MAPPING, TIMEOUT_SECONDS, NOISE_CATEGORIES } from "../../config";
import {
  transitionOut,
  transitionIn,
  staticBrownian,
  sideBrownian,
} from "../../utils/animationUtils";
import { getOffset } from "../../utils/ui";

import pets from "../../img/noise-icons/pets.png";
import baby from "../../img/noise-icons/baby.png";
import furniture from "../../img/noise-icons/furniture.png";
import music from "../../img/noise-icons/music.png";
import works from "../../img/noise-icons/works.png";
import others from "../../img/noise-icons/others.png";

import "./NoiseCollation.css";

const NOISE_LOGOS = new Map([
  ["pets", [pets, "Pet Logo"]],
  ["baby", [baby, "Baby Logo"]],
  ["furniture", [furniture, "Furniture Logo"]],
  ["music", [music, "Music Logo"]],
  ["works", [works, "Works Logo"]],
  ["others", [others, "Others Logo"]],
]);

function NoiseOption(props) {
  //   const onClickFn = props.onClick.bind(null, props.iconName);
  const customSelectClass = `noise-collation-btn flex flex--column-centre noise-collation-btn--${props.iconName}`;
  const customColourClass = `heading--S noise-collation-color--${props.iconName}`;
  const customImageClass = `noise-collation-img noise-collation-img--${props.iconName}`;

  return (
    <div className={customSelectClass} onClick={props.onClick}>
      <img
        className={customImageClass}
        src={NOISE_LOGOS.get(props.iconName)[0]}
        alt={NOISE_LOGOS.get(props.iconName)[1]}
      />
      <h2 className={customColourClass}>
        {props.iconName[0].toUpperCase() + props.iconName.substring(1)}
      </h2>
    </div>
  );
}

export default class NoiseCollationScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.timelines = new Map();

    this.state = {
      message: (
        <h1 className="heading--L">
          Which <strong>noise</strong> affects you most?
        </h1>
      ),
      timeline: new Map(),
    };
  }

  addStaticBrownianListener(iconNames) {
    iconNames.forEach((iconName) => {
      this.timelines.set(
        iconName,
        staticBrownian(`.noise-collation-btn--${iconName}`)
      );
      const node = this.slide.current.querySelector(
        `.noise-collation-btn--${iconName}`
      );
      node.addEventListener("mouseenter", () => {
        gsap.to(node, { scale: 1.2, duration: 0.5, ease: Power3.easeIn });
        this.timelines.get(iconName).play();
      });
      node.addEventListener("mouseleave", () => {
        this.timelines.get(iconName).pause();
        gsap.to(node, { scale: 1, duration: 0.5, ease: Power3.easeIn });
      });
    });
  }

  createShadowImg(nodeBtn, numShadowImg) {
    // Add back gsap timeline for current button and play the timeline
    // Get details of current node

    for (let i = 0; i < numShadowImg; ++i) {
      const nodeImg = nodeBtn.querySelector("img").cloneNode();
      const position = getOffset(nodeBtn.querySelector("img"));

      nodeImg.style.position = "absolute";
      nodeImg.style.opacity = "0%";
      nodeImg.classList.add("noise-collation-img--add");
      nodeImg.style.top = `${position.top}px`;
      nodeImg.style.left = `${position.left}px`;
      nodeBtn.after(nodeImg);
    }

    const nodesShadowImg = this.slide.current.querySelectorAll(
      ".noise-collation-img--add"
    );

    sideBrownian(nodesShadowImg[0], 80, 100, -50, -60).play();
    sideBrownian(nodesShadowImg[1], -80, -100, -25, -30).play();
    sideBrownian(nodesShadowImg[2], 80, 100, 50, 60).play();
  }

  updateCollation(
    noiseCategory,
    fadeDuration = 1,
    numShadowImg = 3,
    pauseDuration = 2,
    iconNames = NOISE_CATEGORIES
  ) {
    return () => {
      const strongClass = `noise-collation-color--${noiseCategory} heading--L`;
      this.setState({
        message: (
          <h1 className="noise-collation-title--triggered">
            You are most affected by:{" "}
            <strong className={strongClass}>{noiseCategory}</strong>
          </h1>
        ),
      });

      gsap.to(
        this.slide.current.querySelectorAll(
          `.noise-collation-img--${noiseCategory}`
        )[0],
        { duration: 1, scale: 2 }
      );

      // Remove all current event listeners for other buttons
      this.slide.current
        .querySelectorAll(`.noise-collation-btn`)
        .forEach((btn) => btn.replaceWith(btn.cloneNode(true)));

      const nodeBtn = this.slide.current.querySelector(
        `.noise-collation-btn--${noiseCategory}`
      );

      const timeline = staticBrownian(nodeBtn);
      timeline.play();

      // Create shadow images
      this.createShadowImg(nodeBtn, numShadowImg);

      // Change opacity of all other element
      iconNames.forEach((iconName) => {
        if (iconName === noiseCategory) {
          return;
        }

        const node = this.slide.current.querySelector(
          `.noise-collation-btn--${iconName}`
        );

        gsap.to(node, { opacity: 0.3, duration: fadeDuration });
      });

      this.props.postNoiseCollation(noiseCategory);

      setTimeout(this.exitSlide.bind(this), pauseDuration * 1000);
    };
  }

  exitSlide() {
    clearInterval(this.timeoutTimer);
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

    // IIFE
    this.updateCollation(NOISE_CATEGORIES[keyIndex])();
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    this.props.startCheckpoint(this.props.checkpointDescription);
    this.addStaticBrownianListener(NOISE_CATEGORIES);
    document.addEventListener("keydown", this.handleKeyDown);
    this.timeoutTimer = setTimeout(
      this.props.slideTimeout,
      TIMEOUT_SECONDS * 1000
    );
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <main ref={this.slide}>
        <div className="noise-collation-top grid grid--2row--3col-top-shrink grid--row-gap-L grid--align-justify-center ">
          <div className="grid--span">{this.state.message}</div>
          <NoiseOption iconName="pets" onClick={this.updateCollation("pets")} />
          <NoiseOption
            iconName="furniture"
            onClick={this.updateCollation("furniture")}
          />
          <NoiseOption iconName="baby" onClick={this.updateCollation("baby")} />
          <NoiseOption
            iconName="works"
            onClick={this.updateCollation("works")}
          />
          <NoiseOption
            iconName="music"
            onClick={this.updateCollation("music")}
          />
          <NoiseOption
            iconName="others"
            onClick={this.updateCollation("others")}
          />
        </div>
      </main>
    );
  }
}
