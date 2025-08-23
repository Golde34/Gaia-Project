export const buildCommonStringValue = (value: string): string => {
    // HIGH, HiGh, high, hiGH, hIgh -> High
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export const isStringEmpty = (value: string | undefined): boolean => {
    return value === null || value === undefined || value.trim() === '';
}

export function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}