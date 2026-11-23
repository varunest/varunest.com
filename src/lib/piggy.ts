/** One coin of 10 goes in, then the whole balance grows by 8%. */
export function nextBalance(balance: number): number {
  return (balance + 10) * 1.08;
}

export function formatMoney(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
