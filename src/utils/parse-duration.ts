// utils/parse-duration.ts
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return NaN;

  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * multipliers[unit as keyof typeof multipliers];
}
