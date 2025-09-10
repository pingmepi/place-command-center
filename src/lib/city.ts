export function toTitleCaseCity(input: string): string {
  if (!input) return '';
  const s = String(input).trim().toLowerCase();
  // Keep punctuation like hyphens and apostrophes; title-case each token
  return s
    .split(/\s+/)
    .map((word) =>
      word
        .split(/(-|')/)
        .map((part) => (/[-']/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join('')
    )
    .join(' ');
}

export function normalizeCity(input: string): string {
  return toTitleCaseCity(input).trim();
}

export function uniqueSortedCities(values: string[]): string[] {
  const seen = new Set<string>();
  for (const v of values || []) {
    const n = normalizeCity(v || '');
    if (n) seen.add(n);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

