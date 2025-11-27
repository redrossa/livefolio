export function formatStrategyNameGroup(strategyNames: string[]): string {
  const normalizedNames = strategyNames.map(
    (name) => name.trim() || 'Untitled Strategy',
  );

  let strategiesText = '';
  if (normalizedNames.length === 1) {
    strategiesText = normalizedNames[0];
  } else if (normalizedNames.length > 1) {
    const last = normalizedNames[normalizedNames.length - 1];
    const initial = normalizedNames.slice(0, -1);
    strategiesText = `${initial.join(', ')} and ${last}`;
  }

  return strategiesText;
}
