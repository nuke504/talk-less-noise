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
