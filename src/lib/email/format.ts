export function formatStrategyUrl(strategyLinkId: string): string {
  const params = new URLSearchParams({
    s: strategyLinkId,
  });

  return `${process.env.ORIGIN}/?${params.toString()}`;
}

export function formatStrategyName(strategyName: string): string {
  return strategyName || 'Untitled Strategy';
}
