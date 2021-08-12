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

export function hexToRGB(hex, alpha = 1) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

export function range(start, end) {
  return Array.from(new Array(end - start), (x, i) => i + start);
}

export function arrayMax(arr, initialVal = 0) {
  return arr.reduce((acc, count) => {
    return count > acc ? count : acc;
  }, initialVal);
}

export function arrayLast(arr) {
  return arr[arr.length - 1];
}
