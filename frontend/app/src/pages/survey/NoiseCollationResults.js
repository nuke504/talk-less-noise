import React, { Component } from "react";
import { gsap, Power3 } from "gsap";

import { KEY_MAPPING } from "../../config";
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

const ICON_NAMES = ["pets", "furniture", "baby", "music", "works", "others"];

function NoiseResult(props) {
  const ncRankClass = `nc-results-rank${props.rank}`;
  const ncRankClassImg = `nc-results-rank${props.rank}-img`;
  const ncRankClassStrong = `nc-results-rank${props.rank}-strong`;

  if (props.rank === 1 || props.rank === 2) {
    return (
      <div className={ncRankClass}>
        <img
          className={ncRankClassImg}
          src={NOISE_LOGOS.get(props.noiseCategory)[0]}
          alt={NOISE_LOGOS.get(props.noiseCategory)[1]}
        />
        <h1>
          <strong className={ncRankClassStrong}>
            {props.percentage.toFixed(2)}
          </strong>{" "}
          of your neighbours are most affected by{" "}
          <strong className={ncRankClassStrong}>{props.noiseCategory}</strong>
        </h1>
      </div>
    );
  } else {
    return (
      <div className={ncRankClass}>
        <img
          className={ncRankClassImg}
          src={NOISE_LOGOS.get(props.noiseCategory)[0]}
          alt={NOISE_LOGOS.get(props.noiseCategory)[1]}
        />
        <strong className={ncRankClassStrong}>
          {props.percentage.toFixed(2)}
        </strong>
      </div>
    );
  }
}

export default class NoiseCollationResultsScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.timelines = new Map();

    this.state = {
      loaded: true,
      // Preset for now
      works: 42.857142857142854,
      baby: 28.57142857142857,
      furniture: 14.285714285714285,
      pets: 14.285714285714285,
      music: 0,
      others: 0,
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

  transformArray(dbResult, iconNames = ICON_NAMES) {
    const percentages = iconNames.map((noiseCategory) => {
      const row = dbResult.find((row) => row.noiseCategory === noiseCategory);
      if (!row) return 0;

      return row.percentage;
    });

    iconNames.forEach((noiseCategory, idx) =>
      this.setState({ noiseCategory: percentages[idx] })
    );

    this.setState({ loaded: true });
  }

  //   createShadowImg(nodeBtn, numShadowImg) {
  //     // Add back gsap timeline for current button and play the timeline
  //     // Get details of current node

  //     for (let i = 0; i < numShadowImg; ++i) {
  //       const nodeImg = nodeBtn.querySelector("img").cloneNode();
  //       const position = getOffset(nodeBtn.querySelector("img"));

  //       nodeImg.style.position = "absolute";
  //       nodeImg.style.opacity = "0%";
  //       nodeImg.classList.add("noise-collation-img--add");
  //       nodeImg.style.top = `${position.top}px`;
  //       nodeImg.style.left = `${position.left}px`;
  //       nodeBtn.after(nodeImg);
  //     }

  //     const nodesShadowImg = this.slide.current.querySelectorAll(
  //       ".noise-collation-img--add"
  //     );

  //     sideBrownian(nodesShadowImg[0], 80, 100, -50, -60).play();
  //     sideBrownian(nodesShadowImg[1], -80, -100, -25, -30).play();
  //     sideBrownian(nodesShadowImg[2], 80, 100, 50, 60).play();
  //   }

  //   updateCollation(
  //     noiseCategory,
  //     fadeDuration = 1,
  //     numShadowImg = 3,
  //     pauseDuration = 2,
  //     iconNames = ICON_NAMES
  //   ) {
  //     return () => {
  //       const strongClass = `noise-collation-color--${noiseCategory} noise-collation-strong`;
  //       this.setState({
  //         message: (
  //           <h1 className="noise-collation-title--triggered">
  //             You are most affected by:{" "}
  //             <strong className={strongClass}>{noiseCategory}</strong>
  //           </h1>
  //         ),
  //       });

  //       gsap.to(
  //         this.slide.current.querySelectorAll(
  //           `.noise-collation-img--${noiseCategory}`
  //         )[1],
  //         { duration: 1, scale: 2 }
  //       );

  //       // Remove all current event listeners for other buttons
  //       this.slide.current
  //         .querySelectorAll(`.noise-collation-btn`)
  //         .forEach((btn) => btn.replaceWith(btn.cloneNode(true)));

  //       const nodeBtn = this.slide.current.querySelector(
  //         `.noise-collation-btn--${noiseCategory}`
  //       );

  //       const timeline = staticBrownian(nodeBtn);
  //       timeline.play();

  //       // Create shadow images
  //       this.createShadowImg(nodeBtn, numShadowImg);

  //       // Change opacity of all other element
  //       iconNames.forEach((iconName) => {
  //         if (iconName === noiseCategory) {
  //           return;
  //         }

  //         const node = this.slide.current.querySelector(
  //           `.noise-collation-btn--${iconName}`
  //         );

  //         gsap.to(node, { opacity: 0.3, duration: fadeDuration });
  //       });

  //       this.props.postNoiseCollation(noiseCategory);

  //       setTimeout(this.exitSlide.bind(this), pauseDuration * 1000);
  //     };
  //   }

  exitSlide() {
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
    this.updateCollation(ICON_NAMES[keyIndex])();
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    this.addStaticBrownianListener(ICON_NAMES);
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  prepareComponents() {}

  render() {
    return (
      <main ref={this.slide}>
        <div className="noise-collation-result-top"></div>
      </main>
    );
  }
}
