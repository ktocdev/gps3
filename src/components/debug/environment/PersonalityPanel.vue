<template>
  <div class="personality-panel">
    <div v-if="hasActiveGuineaPigs" class="panel panel--compact panel--accent">
      <div class="panel__header">
        <h3>🎭 Personality</h3>
        <!-- Toggle between guinea pigs if there are multiple -->
        <Button
          v-if="guineaPigStore.activeGuineaPigs.length > 1"
          @click="toggleGuineaPig"
          variant="tertiary"
          size="sm"
        >
          {{ selectedGuineaPig?.name }} ({{ selectedGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
        </Button>
      </div>
      <div v-if="selectedGuineaPig" class="panel__content">
        <!-- Personality Traits -->
        <div class="personality-category mb-4">
          <h4 class="personality-category__title">Traits</h4>
          <div class="personality-list">
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
        </div>

        <!-- Preferences -->
        <div class="personality-category mb-4">
          <h4 class="personality-category__title">Preferences</h4>
          <div class="personality-panel__prefs">
            <div class="personality-panel__pref">
              <span class="personality-panel__pref-label">Favorite Foods</span>
              <span class="personality-panel__pref-value">
                {{ formatPreferenceList(selectedGuineaPig.preferences.favoriteFood) }}
              </span>
            </div>
            <div class="personality-panel__pref">
              <span class="personality-panel__pref-label">Disliked Foods</span>
              <span class="personality-panel__pref-value personality-panel__pref-value--negative">
                {{ formatPreferenceList(selectedGuineaPig.preferences.dislikedFood) }}
              </span>
            </div>
            <div class="personality-panel__pref">
              <span class="personality-panel__pref-label">Favorite Activities</span>
              <span class="personality-panel__pref-value">
                {{ formatPreferenceList(selectedGuineaPig.preferences.favoriteActivity) }}
              </span>
            </div>
            <div class="personality-panel__pref">
              <span class="personality-panel__pref-label">Habitat Preferences</span>
              <span class="personality-panel__pref-value">
                {{ formatPreferenceList(selectedGuineaPig.preferences.habitatPreference) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel panel--compact panel--warning">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game to see personality data.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import Button from '../../basic/Button.vue'

const guineaPigStore = useGuineaPigStore()

// Track which guinea pig is selected (for multi-pig scenarios)
const selectedGuineaPigIndex = ref(0)

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

const selectedGuineaPig = computed(() => {
  if (!hasActiveGuineaPigs.value) return null
  return guineaPigStore.activeGuineaPigs[selectedGuineaPigIndex.value]
})

// Personality trait definitions with labels
const personalityTraits = computed(() => {
  if (!selectedGuineaPig.value) return []
  const personality = selectedGuineaPig.value.personality
  return [
    { key: 'friendliness', label: 'Friendliness', value: personality.friendliness },
    { key: 'playfulness', label: 'Playfulness', value: personality.playfulness },
    { key: 'curiosity', label: 'Curiosity', value: personality.curiosity },
    { key: 'boldness', label: 'Boldness', value: personality.boldness },
    { key: 'cleanliness', label: 'Cleanliness', value: personality.cleanliness },
  ]
})

/**
 * Toggle to next guinea pig
 */
function toggleGuineaPig() {
  const total = guineaPigStore.activeGuineaPigs.length
  selectedGuineaPigIndex.value = (selectedGuineaPigIndex.value + 1) % total
}

/**
 * Watch for guinea pig selection changes from sprite clicks
 * and update local index to match
 */
watch(
  () => guineaPigStore.selectedGuineaPigId,
  (selectedId) => {
    if (!selectedId) return

    // Find the index of the selected guinea pig in active guinea pigs
    const index = guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === selectedId)
    if (index !== -1) {
      selectedGuineaPigIndex.value = index
    }
  }
)

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

.personality-category {
  margin-block-end: var(--space-4);
}

.personality-category:last-child {
  margin-block-end: 0;
}

.personality-category__title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-block-end: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.personality-list {
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

.personality-panel__prefs {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.personality-panel__pref {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.personality-panel__pref-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.personality-panel__pref-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.personality-panel__pref-value--negative {
  color: var(--color-danger);
}

/* Container query for wider layouts */
@container personality-panel (min-width: 300px) {
  .personality-panel__pref {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
