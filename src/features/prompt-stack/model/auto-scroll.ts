export function computeAutoScrollDelta(
  pointerClientY: number,
  containerRect: DOMRect,
  edgeSize: number,
  maxStep: number,
): number {
  const topZoneEnd = containerRect.top + edgeSize;
  if (pointerClientY < topZoneEnd) {
    const ratio = (topZoneEnd - pointerClientY) / edgeSize;
    return -Math.ceil(Math.min(Math.max(ratio, 0), 1) * maxStep);
  }

  const bottomZoneStart = containerRect.bottom - edgeSize;
  if (pointerClientY > bottomZoneStart) {
    const ratio = (pointerClientY - bottomZoneStart) / edgeSize;
    return Math.ceil(Math.min(Math.max(ratio, 0), 1) * maxStep);
  }

  return 0;
}
