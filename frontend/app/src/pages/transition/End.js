import React, { Component } from "react";
import convoImage from "../../img/misc/people_talking.png";
import { transitionOut, transitionIn } from "../../utils/animationUtils";

import "./End.css";

export default class EndScreen extends Component {
  constructor(props) {
    super(props);

    this.slide = React.createRef();
    this.exitSlide = this.exitSlide.bind(this);
  }

  exitSlide() {
    clearTimeout(this.timeout);
    this.props.endAttempt();
    transitionOut(
      this.slide.current,
      this.props.callNextSlide,
      this.props.nextSlide
    );
  }

  componentDidMount() {
    transitionIn(this.slide.current);
    this.timeout = setTimeout(this.exitSlide, 5000);
  }

  render() {
    return (
      <main className="end-screen" ref={this.slide}>
        <div className="flex end-screen-text-container flex--column-centre">
          <h1 className="heading--M">
            Remember that the same sound can be perceived differently by
            different residents!
          </h1>
          <img src={convoImage} alt="Two people talking" />
          <p className="text--M">
            Thank you for being part of this experience on Neighbourly Noise!
          </p>
        </div>
      </main>
    );
  }
}
