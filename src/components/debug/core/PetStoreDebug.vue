<template>
  <div class="pet-store-debug">
    <DebugPanelRow :columns="2">
      <!-- Guinea Pig List -->
      <DebugPanel
        title="🐹 Guinea Pigs"
        :anchor="`${totalGuineaPigCount} total`"
        accent="var(--color-pink-500)"
      >
        <!-- Active Guinea Pigs Section -->
        <DebugSection v-if="activeGuineaPigsByHabitat.length > 0" title="Active">
          <div class="pet-store-debug__habitats">
            <div
              v-for="[habitatNumber, guineaPigs] in activeGuineaPigsByHabitat"
              :key="`active-${habitatNumber}`"
              class="pet-store-debug__habitat"
            >
              <h5 class="pet-store-debug__habitat-label">Active Habitat</h5>
              <div class="pet-store-debug__guinea-pig-list">
                <div
                  v-for="guineaPig in guineaPigs"
                  :key="guineaPig.id"
                  class="pet-store-debug__guinea-pig-item"
                  :class="{
                    'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id,
                    'pet-store-debug__guinea-pig-item--active': true
                  }"
                  @click="selectActivePig(guineaPig)"
                >
                  <div class="pet-store-debug__guinea-pig-header">
                    <div class="pet-store-debug__guinea-pig-left">
                      <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
                      <div class="pet-store-debug__guinea-pig-badges">
                        <DebugBadge variant="info">Active</DebugBadge>
                        <Badge
                          v-if="shouldShowRarityBadge(guineaPig.breed)"
                          :variant="getRarityBadgeVariant(guineaPig.breed)"
                          size="sm"
                        >
                          {{ getRarityBadgeText(guineaPig.breed) }}
                        </Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.gender }}</Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furColor }}</Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furPattern }}</Badge>
                      </div>
                    </div>
                    <div class="pet-store-debug__guinea-pig-right">
                      <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DebugSection>

        <!-- Inactive Guinea Pigs Section -->
        <DebugSection
          v-if="inactiveGuineaPigsByHabitat.length > 0"
          title="In Pet Store"
        >
          <div class="pet-store-debug__habitats">
            <div
              v-for="[habitatNumber, guineaPigs] in inactiveGuineaPigsByHabitat"
              :key="`inactive-${habitatNumber}`"
              class="pet-store-debug__habitat"
            >
              <h5 class="pet-store-debug__habitat-label">Habitat {{ habitatNumber }}</h5>
              <div class="pet-store-debug__guinea-pig-list">
                <div
                  v-for="guineaPig in guineaPigs"
                  :key="guineaPig.id"
                  class="pet-store-debug__guinea-pig-item"
                  :class="{
                    'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id
                  }"
                  @click="selectedGuineaPig = guineaPig"
                >
                  <div class="pet-store-debug__guinea-pig-header">
                    <div class="pet-store-debug__guinea-pig-left">
                      <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
                      <div class="pet-store-debug__guinea-pig-badges">
                        <Badge
                          v-if="shouldShowRarityBadge(guineaPig.breed)"
                          :variant="getRarityBadgeVariant(guineaPig.breed)"
                          size="sm"
                        >
                          {{ getRarityBadgeText(guineaPig.breed) }}
                        </Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.gender }}</Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furColor }}</Badge>
                        <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furPattern }}</Badge>
                      </div>
                      <div class="pet-store-debug__adoption-timer" v-if="guineaPig.adoptionTimer">
                        ⏱️ {{ getAdoptionTimerDisplay(guineaPig.id) }}
                      </div>
                    </div>
                    <div class="pet-store-debug__guinea-pig-right">
                      <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DebugSection>
      </DebugPanel>

      <!-- Guinea Pig Info -->
      <DebugPanel
        title="🔍 Guinea Pig Info"
        :anchor="selectedGuineaPig ? selectedGuineaPig.name : 'none selected'"
      >
        <div v-if="selectedGuineaPig" class="pet-store-debug__editor">
          <DebugSection title="Appearance">
            <div class="stats-grid">
              <DebugStatRow label="Fur Color" :value="capitalize(selectedGuineaPig.appearance.furColor)" />
              <DebugStatRow label="Fur Pattern" :value="capitalize(selectedGuineaPig.appearance.furPattern)" />
              <DebugStatRow label="Eye Color" :value="capitalize(selectedGuineaPig.appearance.eyeColor)" />
              <DebugStatRow label="Size" :value="capitalize(selectedGuineaPig.appearance.size)" />
            </div>
          </DebugSection>

          <PersonalityPanel :guinea-pig="selectedGuineaPig" />

          <DebugSection title="Need Decay Rate Modifiers">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Social Need Decay</span>
                <span class="stat-value" :class="getDecayModifierClass(getSocialDecayModifier(selectedGuineaPig.personality.friendliness))">
                  {{ getSocialDecayModifier(selectedGuineaPig.personality.friendliness) }}x
                  <span class="pet-store-debug__decay-effect">{{ getDecayEffectText(getSocialDecayModifier(selectedGuineaPig.personality.friendliness)) }}</span>
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Play Need Decay</span>
                <span class="stat-value" :class="getDecayModifierClass(getPlayDecayModifier(selectedGuineaPig.personality.playfulness))">
                  {{ getPlayDecayModifier(selectedGuineaPig.personality.playfulness) }}x
                  <span class="pet-store-debug__decay-effect">{{ getDecayEffectText(getPlayDecayModifier(selectedGuineaPig.personality.playfulness)) }}</span>
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Stimulation Need Decay</span>
                <span class="stat-value" :class="getDecayModifierClass(getStimulationDecayModifier(selectedGuineaPig.personality.curiosity))">
                  {{ getStimulationDecayModifier(selectedGuineaPig.personality.curiosity) }}x
                  <span class="pet-store-debug__decay-effect">{{ getDecayEffectText(getStimulationDecayModifier(selectedGuineaPig.personality.curiosity)) }}</span>
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Comfort Need Decay</span>
                <span class="stat-value" :class="getDecayModifierClass(getBoldnessDecayModifier(selectedGuineaPig.personality.boldness))">
                  {{ getBoldnessDecayModifier(selectedGuineaPig.personality.boldness) }}x
                  <span class="pet-store-debug__decay-effect">{{ getDecayEffectText(getBoldnessDecayModifier(selectedGuineaPig.personality.boldness)) }}</span>
                </span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Hygiene Need Decay</span>
                <span class="stat-value" :class="getDecayModifierClass(getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness))">
                  {{ getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness) }}x
                  <span class="pet-store-debug__decay-effect">{{ getDecayEffectText(getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness)) }}</span>
                </span>
              </div>
            </div>
          </DebugSection>
        </div>
        <p v-else class="pet-store-debug__empty-message">Click a guinea pig to view its info</p>
      </DebugPanel>
    </DebugPanelRow>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import Badge from '../../basic/Badge.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugBadge from '../ui/DebugBadge.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import PersonalityPanel from '../environment/PersonalityPanel.vue'
import {
  capitalize,
  getSocialDecayModifier,
  getPlayDecayModifier,
  getStimulationDecayModifier,
  getBoldnessDecayModifier,
  getHygieneDecayModifier,
  getDecayModifierClass,
  getDecayEffectText
} from '../../../utils/personalityDecay'

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()
const selectedGuineaPig = ref<GuineaPig | null>(null)

function selectActivePig(guineaPig: GuineaPig) {
  selectedGuineaPig.value = guineaPig
  guineaPigStore.selectGuineaPig(guineaPig.id)
}

// Reactive time ref to trigger updates
const currentTime = ref(Date.now())

// Update timer display every second
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Update the current time every second to trigger reactivity
  timerInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// Phase 7: Group guinea pigs by habitat - split into active and inactive.
const totalGuineaPigCount = computed(() =>
  petStoreManager.availableGuineaPigs.length + petStoreManager.activeSessionGuineaPigs.length
)

// Active guinea pigs live in guineaPigStore (not petStoreManager.availableGuineaPigs —
// startGameSession() removes them from the available pool), so the active group is
// sourced from activeSessionGuineaPigs instead of filtering the available pool.
const activeGuineaPigsByHabitat = computed(() => {
  const grouped = new Map<number, GuineaPig[]>()

  for (const guineaPig of petStoreManager.activeSessionGuineaPigs) {
    const habitat = guineaPig.habitat ?? 0
    if (!grouped.has(habitat)) {
      grouped.set(habitat, [])
    }
    grouped.get(habitat)!.push(guineaPig)
  }

  // Sort by habitat number
  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
})

const inactiveGuineaPigsByHabitat = computed(() => {
  const grouped = new Map<number, GuineaPig[]>()

  for (const guineaPig of petStoreManager.availableGuineaPigs) {
    const habitat = guineaPig.habitat ?? 0
    if (!grouped.has(habitat)) {
      grouped.set(habitat, [])
    }
    grouped.get(habitat)!.push(guineaPig)
  }

  // Sort by habitat number
  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
})


// Helper function to get breed rarity
const getBreedRarity = (breed: string) => {
  return petStoreManager.getRarity(breed, petStoreManager.weightedBreeds)
}

// Helper function to determine if rarity should show badge
const shouldShowRarityBadge = (breed: string) => {
  const rarity = getBreedRarity(breed)
  return rarity === 'very-rare' || rarity === 'ultra-rare'
}

// Helper function to get badge variant for rarity
const getRarityBadgeVariant = (breed: string) => {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'warning'
  if (rarity === 'very-rare') return 'primary'
  return 'secondary'
}

// Helper function to get badge text for rarity
const getRarityBadgeText = (breed: string) => {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'ULTRA RARE'
  if (rarity === 'very-rare') return 'VERY RARE'
  return ''
}

// Auto-select a guinea pig when available or maintain selection after refresh.
// Active guinea pigs take priority — a locked-in pair matters more than the store pool.
watch(() => petStoreManager.availableGuineaPigs, (guineaPigs) => {
  if (selectedGuineaPig.value) {
    // Keep the existing selection valid if it's still in the store pool
    const stillInStore = guineaPigs.find(gp => gp.id === selectedGuineaPig.value!.id)
    if (stillInStore) {
      selectedGuineaPig.value = stillInStore
      return
    }
    // Or still active (activeSessionGuineaPigs always returns live references)
    const stillActive = petStoreManager.activeSessionGuineaPigs.some(gp => gp.id === selectedGuineaPig.value!.id)
    if (stillActive) return
  }

  // No valid selection — default to the first active guinea pig, falling back to the store pool
  if (petStoreManager.activeSessionGuineaPigs.length > 0) {
    selectActivePig(petStoreManager.activeSessionGuineaPigs[0])
  } else if (guineaPigs.length > 0) {
    selectedGuineaPig.value = guineaPigs[0]
  }
}, { immediate: true })

// Phase 2: Adoption timer display
const getAdoptionTimerDisplay = (guineaPigId: string) => {
  const remaining = petStoreManager.getAdoptionTimeRemaining(guineaPigId)
  return petStoreManager.formatAdoptionTimer(remaining)
}

</script>

<style>
/* === Habitat Organization Section === */
.pet-store-debug__habitats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pet-store-debug__habitat {
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
}

.pet-store-debug__habitat-label {
  margin-block: 0 var(--space-3);
  font-size: var(--font-size-2xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

/* === Guinea Pig List Section === */
.pet-store-debug__guinea-pig-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-4);
}

.pet-store-debug__guinea-pig-item {
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pet-store-debug__guinea-pig-item:hover {
  border-color: var(--color-pink-500);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
}

.pet-store-debug__guinea-pig-item--selected {
  border-color: var(--color-pink-500);
  background-color: var(--color-primary-bg);
  box-shadow: 0 0 0 1px var(--color-pink-500);
}

.pet-store-debug__guinea-pig-item--active {
  border-inline-start: 3px solid var(--color-success);
}

.pet-store-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.pet-store-debug__guinea-pig-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.pet-store-debug__guinea-pig-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
}

.pet-store-debug__guinea-pig-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.pet-store-debug__adoption-timer {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-block-start: var(--space-2);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-stats);
}

.pet-store-debug__guinea-pig-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.pet-store-debug__guinea-pig-breed {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: end;
}

/* === Editor Section === */
.pet-store-debug__editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pet-store-debug__empty-message {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  margin-block: var(--space-4);
}

/* === Decay Modifier Values === */
.pet-store-debug__decay-effect {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-normal);
}

.decay-modifier--slower {
  color: var(--color-success);
}

.decay-modifier--faster {
  color: var(--color-error);
}

.decay-modifier--normal {
  color: var(--color-text-secondary);
}
</style>
