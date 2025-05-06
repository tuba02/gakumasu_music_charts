export function formatViewCount(count: number): string {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}億`;
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return count.toString();
} 