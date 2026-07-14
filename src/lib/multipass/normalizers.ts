export function normalizeMultipassName(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
