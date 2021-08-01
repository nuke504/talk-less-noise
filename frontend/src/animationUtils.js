import { gsap } from "gsap";

export const transitionOut = function (
  slideRef,
  callNextSlide,
  nextSlide,
  duration = 0.5
) {
  gsap.to(slideRef, {
    duration: duration,
    opacity: 0,
    y: -100,
    ease: "back.in",
  });
  setTimeout(callNextSlide, duration * 1000, nextSlide);
};
