import { gsap, Power4 } from "gsap";

export const transitionIn = function (slideRef, duration = 0.5, mode = "fade") {
  const timeline = gsap.timeline();
  switch (mode) {
    case "fade":
      timeline.fromTo(
        slideRef,
        {
          duration,
          autoAlpha: 0,
          scale: 1.5,
        },
        {
          duration,
          autoAlpha: 1,
          scale: 1,
          transformOrigin: "50% 50%",
          ease: Power4.easeOut,
        }
      );
      break;
    default:
      throw new Error(`${mode} does not exist`);
  }

  return timeline;
};

export const transitionOut = function (
  slideRef,
  callNextSlide,
  nextSlide,
  mode = "fade",
  duration = 0.5
) {
  const timeline = gsap.timeline();
  switch (mode) {
    case "fade":
      timeline.fromTo(
        slideRef,
        {
          duration,
          autoAlpha: 1,
          scale: 1,
        },
        {
          duration,
          autoAlpha: 0,
          scale: 0.8,
          ease: Power4.easeOut,
        }
      );
      break;
    case "slide":
      timeline.to(slideRef, {
        duration,
        opacity: 0,
        y: -100,
        stagger: 0.1,
        ease: "back.in",
      });
      break;
    default:
      throw new Error(`${mode} does not exist`);
  }

  setTimeout(callNextSlide, duration * 1000, nextSlide);
};

export const staticBrownian = function (className) {
  const timeline = gsap.timeline({ paused: true });
  timeline.to(className, {
    x: "random(-20, 20, 5)",
    y: "random(-20, 10, 3)",
    duration: 0.5,
    ease: "none",
    repeat: -1,
    repeatRefresh: true,
  });

  return timeline;
};

export const sideBrownian = function (className, xStart, xEnd, yStart, yEnd) {
  const timeline = gsap.timeline({ paused: true });
  timeline.set(className, {
    xPercent: `random(${xStart}, ${xEnd}, 5)`,
    yPercent: `random(${yStart}, ${yEnd}, 5)`,
    rotation: "random(-20, 20)",
    scale: 0.6,
  });
  timeline.to(className, { opacity: 30, duration: 0.5 });
  timeline.to(className, {
    x: "random(-10, 10, 5)",
    y: "random(-10, 5, 3)",
    duration: 0.5,
    ease: "none",
    repeat: -1,
    repeatRefresh: true,
  });

  return timeline;
};
