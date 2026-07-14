export function normalizeOpenStackId(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
