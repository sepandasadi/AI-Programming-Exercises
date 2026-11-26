export function formatDeadline(respondBy: string): string {
  const date = respondBy.slice(0, 10);
  const time = respondBy.slice(11, 16);
  return `${date} ${time} UTC`;
}
