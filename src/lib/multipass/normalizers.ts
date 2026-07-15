export function normalizeMultipassName(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,62}$/.test(value) ? value : null;
}
