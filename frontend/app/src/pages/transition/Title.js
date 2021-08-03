import React, { Component } from "react";
import { transitionOut } from "../../utils/animationUtils";
import "./Title.css";

import pets from "../../img/noise-icons/pets.png";
import baby from "../../img/noise-icons/baby.png";
import furniture from "../../img/noise-icons/furniture.png";
import music from "../../img/noise-icons/music.png";
import works from "../../img/noise-icons/works.png";

const NOISE_LOGOS = [pets, baby, furniture, music, works];
const NOISE_DESCRIPTION = [
  "Pet Logo",
  "Baby Logo",
  "Furniture Logo",
  "Music Logo",
  "Works Logo",
];

function LogoGallery() {
  return NOISE_LOGOS.map((logo, idx) => (
    <img key={NOISE_DESCRIPTION[idx]} src={logo} alt={NOISE_DESCRIPTION[idx]} />
  ));
}

export default class TitleScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  exitSlide() {
    this.props.newAttempt();
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide,
      "slide"
    );
  }

  handleKeyDown(e) {
    this.exitSlide();
  }

  componentDidMount() {
    // document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    return (
      <main className="title-screen" ref={this.slide}>
        <div className="title-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="title-speech-bubble"
            viewBox="0 0 256 256"
            preserveAspectRatio="none"
          >
            <rect width="256" height="256" fill="none"></rect>
            <path
              d="M45.42853,176.99811A95.95978,95.95978,0,1,1,79.00228,210.5717l.00023-.001L45.84594,220.044a8,8,0,0,1-9.89-9.89l9.47331-33.15657Z"
              stroke="#fff"
            ></path>
          </svg>
          <div className="title-speech-container">
            <h1 className="title-primary-top">Let's Talk</h1>
            <h1 className="title-primary-bottom">LESS NOISE!</h1>
            <p className="title-secondary">
              ~ A Campaign by Municipal Services Office and SUTD
            </p>
          </div>
        </div>
        <div className="title-logo-container">
          <LogoGallery />
        </div>
        <button className="title-button-continue" onClick={this.exitSlide}>
          Click to begin!
        </button>
      </main>
    );
  }
}
