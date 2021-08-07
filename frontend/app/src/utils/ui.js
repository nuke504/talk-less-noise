export function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY,
  };
}

export function convertPAM(timeHour) {
  if (timeHour === 12) {
    return `12 pm`;
  }

  if (timeHour > 12) {
    return `${timeHour - 12} pm`;
  }

  if (timeHour === 0) {
    return `12 am`;
  }

  return `${timeHour} am`;
}

export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

export function range(start, end) {
  return Array.from(new Array(end - start), (x, i) => i + start);
}
