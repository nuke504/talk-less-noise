import React, { Component } from "react";

import { KEY_MAPPING, NOISE_CATEGORIES, NOISE_DESCRIPTION } from "../../config";
import {
  transitionOut,
  transitionIn,
  staticBrownian,
} from "../../utils/animationUtils";

import pets from "../../img/noise-icons/pets.png";
import baby from "../../img/noise-icons/baby.png";
import furniture from "../../img/noise-icons/furniture.png";
import music from "../../img/noise-icons/music.png";
import works from "../../img/noise-icons/works.png";
import others from "../../img/noise-icons/others.png";

import "./NoiseCollationResults.css";

const NOISE_LOGOS = new Map([
  ["pets", [pets, "Pet Logo"]],
  ["baby", [baby, "Baby Logo"]],
  ["furniture", [furniture, "Furniture Logo"]],
  ["music", [music, "Music Logo"]],
  ["works", [works, "Works Logo"]],
  ["others", [others, "Others Logo"]],
]);

function NoiseResult(props) {
  const ncRankClass = `nc-result nc-results--${props.rank}`;
  const ncRankClassImg = `nc-results-rank${props.rank}-img`;
  const ncRankClassStrong = `noise-collation-color--${props.noiseCategory}`;

  if (props.rank === 1 || props.rank === 2) {
    return (
      <div className={ncRankClass}>
        <img className={ncRankClassImg} src={props.src} alt={props.alt} />
        <h1>
          <strong className={ncRankClassStrong}>
            {props.percentage.toFixed(0)}%
          </strong>{" "}
          of your neighbours are most affected by
          <strong className={ncRankClassStrong}> {props.description}</strong>
        </h1>
      </div>
    );
  } else {
    return (
      <div className={ncRankClass}>
        <img className={ncRankClassImg} src={props.src} alt={props.alt} />
        <h1>
          <strong className={ncRankClassStrong}>
            {props.percentage.toFixed(0)}%
          </strong>
        </h1>
      </div>
    );
  }
}

class NoiseResultContainer extends Component {
  constructor(props) {
    super(props);
    this.container = React.createRef();
  }

  componentDidMount() {
    transitionIn(this.container.current);
    const resultNodes = this.container.current.querySelectorAll(".nc-result");
    staticBrownian(resultNodes).play();
  }

  render() {
    const noiseResults = this.props.noiseCategories.map((noiseCategory) => {
      return (
        <NoiseResult
          key={noiseCategory}
          noiseCategory={noiseCategory}
          rank={this.props.ranks.indexOf(noiseCategory) + 1}
          percentage={this.props.percentages[noiseCategory]}
          description={this.props.descriptions.get(noiseCategory)}
          src={this.props.logos.get(noiseCategory)[0]}
          alt={this.props.logos.get(noiseCategory)[1]}
        />
      );
    });

    return (
      <div ref={this.container} className="noise-collation-results-container">
        {noiseResults}
      </div>
    );
  }
}

export default class NoiseCollationResultsScreen extends Component {
  constructor(props) {
    super(props);

    this.noiseCategories = NOISE_CATEGORIES;
    this.noiseLogos = NOISE_LOGOS;
    this.noiseDescriptions = NOISE_DESCRIPTION;

    this.slide = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.exitSlide = this.exitSlide.bind(this);

    this.state = {
      loaded: false,
    };
  }

  loadArray(dbResult) {
    const percentages = this.noiseCategories.map((noiseCategory) => {
      const row = dbResult.find((row) => row.noiseCategory === noiseCategory);
      if (!row) return 0;

      return row.percentage;
    });

    this.noiseCategories.forEach((noiseCategory, idx) =>
      this.setState(() => {
        const transientState = {};
        transientState[noiseCategory] = percentages[idx];
        return transientState;
      })
    );

    this.setState({ loaded: true });
  }

  exitSlide() {
    this.props.endCheckpoint(this.props.checkpointDescription);
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
    this.props.getNoiseCollation("noiseCategory").then((results) => {
      this.loadArray(results);
    });

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("click", this.exitSlide);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.exitSlide);
  }

  getLoadingScreen() {
    return <h1 className="loading">Loading survey results!</h1>;
  }

  getNoiseCategoryRank() {
    return this.noiseCategories
      .map((noiseCategory) => {
        return [noiseCategory, this.state[noiseCategory]];
      })
      .sort((a, b) => {
        if (a[1] > b[1]) return -1;
        else return 1;
      })
      .map((elem) => elem[0]);
  }

  prepareNoiseResults() {
    if (!this.state.loaded) return this.getLoadingScreen();

    const ranks = this.getNoiseCategoryRank();
    const percentages = { ...this.state };

    return (
      <NoiseResultContainer
        ranks={ranks}
        logos={this.noiseLogos}
        percentages={percentages}
        noiseCategories={this.noiseCategories}
        descriptions={this.noiseDescriptions}
      />
    );
  }

  render() {
    return (
      <main ref={this.slide} className="results-bg">
        {this.prepareNoiseResults()}
      </main>
    );
  }
}
