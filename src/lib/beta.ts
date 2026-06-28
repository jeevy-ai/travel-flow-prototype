const HARDCODED_TOKENS: Record<string, string> = {
  BETA2024: 'Early Adopter',
  'JEEVY-EARLY': 'Pioneer',
}

function allTokens(): Record<string, string> {
  const env = (((import.meta as unknown) as Record<string, unknown>)['env'] as Record<string, string> | undefined)?.['VITE_BETA_TOKENS'] ?? ''
  const extra = env
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, t) => {
      const [token, name] = t.split(':')
      acc[token.toUpperCase()] = name ?? 'Beta Member'
      return acc
    }, {})
  return { ...HARDCODED_TOKENS, ...extra }
}

export function isValidToken(token: string): boolean {
  return Object.hasOwn(allTokens(), token.toUpperCase())
}

export function getMemberName(token: string): string {
  return allTokens()[token.toUpperCase()] ?? 'Beta Member'
}
