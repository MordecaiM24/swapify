export default function toOrdinal(n: string): string {
  try {
    const num = Number(n);
    const s = ["th", "st", "nd", "rd"],
      v = num % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  } catch (e) {
    return n;
  }
}
