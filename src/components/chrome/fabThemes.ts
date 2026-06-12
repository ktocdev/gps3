// FAB plaque theme colors (prototype FabMenu.jsx FAB_THEMES), mapped to tokens.

export type FabTheme = 'pink' | 'green' | 'violet' | 'orange' | 'cyan'

export interface FabThemeColors {
  stripe: string
  deep: string
  soft: string
}

export const FAB_THEMES: Record<FabTheme, FabThemeColors> = {
  pink: { stripe: 'var(--color-pink)', deep: 'var(--color-pink-700)', soft: 'var(--color-pink-100)' },
  green: { stripe: 'var(--color-ivy)', deep: 'var(--color-green)', soft: '#ecfccb' },
  violet: { stripe: 'var(--color-violet)', deep: 'var(--color-violet-deep)', soft: 'var(--color-violet-100)' },
  orange: { stripe: '#fb923c', deep: 'var(--color-orange)', soft: '#fff1d6' },
  cyan: { stripe: 'var(--color-cyan)', deep: 'var(--color-cyan-600)', soft: '#e0f7fa' }
}

export interface FabAction {
  id: string
  icon: string
  label: string
}

export interface FabConfig {
  theme: FabTheme
  icon: string
  label: string
  actions: FabAction[]
  emptyMessage?: string
}
