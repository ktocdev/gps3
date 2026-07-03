<template>
  <div class="personality-panel">
    <DebugPanel title="🎭 Personality" accent="#a78bfa">
      <DebugSection title="Traits">
        <div class="personality-panel__traits">
          <div
            v-for="trait in personalityTraits"
            :key="trait.key"
            class="personality-trait"
          >
            <span class="personality-trait__label">{{ trait.label }}</span>
            <div class="personality-trait__bar-container">
              <div
                class="personality-trait__bar"
                :style="{ width: (trait.value * 10) + '%' }"
              ></div>
            </div>
            <span class="personality-trait__value">{{ trait.value }}</span>
          </div>
        </div>
      </DebugSection>

      <DebugSection title="Preferences">
        <div class="stats-grid">
          <DebugStatRow
            label="Favorite Foods"
            :value="formatPreferenceList(guineaPig.preferences.favoriteFood)"
            :muted="!guineaPig.preferences.favoriteFood?.length"
          />
          <DebugStatRow
            class="stat-item--negative"
            label="Disliked Foods"
            :value="formatPreferenceList(guineaPig.preferences.dislikedFood)"
            :muted="!guineaPig.preferences.dislikedFood?.length"
          />
          <DebugStatRow
            label="Favorite Activities"
            :value="formatPreferenceList(guineaPig.preferences.favoriteActivity)"
            :muted="!guineaPig.preferences.favoriteActivity?.length"
          />
          <DebugStatRow
            label="Habitat Preferences"
            :value="formatPreferenceList(guineaPig.preferences.habitatPreference)"
            :muted="!guineaPig.preferences.habitatPreference?.length"
          />
        </div>
      </DebugSection>
    </DebugPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'

const props = defineProps<{
  guineaPig: GuineaPig
}>()

// Personality trait definitions with labels
const personalityTraits = computed(() => {
  const personality = props.guineaPig.personality
  return [
    { key: 'friendliness', label: 'Friendliness', value: personality.friendliness },
    { key: 'playfulness', label: 'Playfulness', value: personality.playfulness },
    { key: 'curiosity', label: 'Curiosity', value: personality.curiosity },
    { key: 'boldness', label: 'Boldness', value: personality.boldness },
    { key: 'cleanliness', label: 'Cleanliness', value: personality.cleanliness },
  ]
})

/**
 * Format preference list for display
 */
function formatPreferenceList(items: string[]): string {
  if (!items || items.length === 0) return 'None'
  return items.map(item => formatPreferenceName(item)).join(', ')
}

/**
 * Format a preference name for display
 * - Strips common prefixes (food_, hay_, toy_, etc.)
 * - Converts snake_case/kebab-case to Title Case
 */
function formatPreferenceName(name: string): string {
  // Strip common prefixes (with underscore)
  let cleaned = name
    .replace(/^food_/i, '')
    .replace(/^hay_/i, '')
    .replace(/^toy_/i, '')
    .replace(/^item_/i, '')
    .replace(/^chew_/i, '')

  // Convert snake_case or kebab-case to Title Case
  return cleaned
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
</script>

<style>
/* PersonalityPanel styles */
.personality-panel {
  container-type: inline-size;
  container-name: personality-panel;
}

.personality-panel__traits {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.personality-trait {
  display: grid;
  grid-template-columns: 90px 1fr 30px;
  align-items: center;
  gap: var(--space-2);
}

.personality-trait__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.personality-trait__bar-container {
  block-size: 8px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.personality-trait__bar {
  block-size: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width var(--transition-normal);
}

.personality-trait__value {
  font-size: var(--font-size-sm);
  font-family: var(--font-family-mono);
  color: var(--color-text-muted);
  text-align: end;
}

.personality-panel .stat-value {
  text-align: end;
}

.personality-panel .stat-item--negative .stat-value:not(.stat-value--muted) {
  color: var(--color-error);
}
</style>
