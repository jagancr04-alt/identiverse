/** Normalize editorial line breaks without interpreting markup. */
export function normalizeLines(value: string): string {
  return value.replace(/\\r\\n|\\n|\\r/g, "\n").replace(/\r\n?/g, "\n");
}
export function singleLine(value: string): string { return normalizeLines(value).replace(/\s+/g, " ").trim(); }
