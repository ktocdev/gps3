<!--
  Guinea Pig Simulation Game (GPS2)
  Copyright (c) 2025 ktocdev. All Rights Reserved.

  This file is part of the GPS2 proprietary software.
  Unauthorized copying, modification, or distribution is strictly prohibited.
-->
<template>
  <div class="habitat-sidebar bonding-sidebar">
    <div class="habitat-sidebar__header bonding-sidebar__header">
      <h3>💕 Bonding</h3>
      <Button
        v-if="guineaPigStore.activeGuineaPigs.length > 1"
        @click="toggleGuineaPig"
        variant="tertiary"
        size="sm"
      >
        {{ selectedGuineaPig?.name }} ({{ currentGuineaPigIndex + 1 }}/{{ guineaPigStore.activeGuineaPigs.length }})
      </Button>
      <span v-else-if="guineaPigStore.activeGuineaPigs.length === 1" class="bonding-sidebar__guinea-pig-name-static">
        {{ guineaPigStore.activeGuineaPigs[0]?.name }}
      </span>
    </div>

    <div class="bonding-sidebar__content">
      <!-- No Guinea Pigs State -->
      <div v-if="guineaPigStore.activeGuineaPigs.length === 0" class="bonding-sidebar__no-guinea-pigs">
        <p>🐹 Add guinea pigs to see bonding relationships!</p>
      </div>

      <!-- Single Guinea Pig State -->
      <div v-else-if="guineaPigStore.activeGuineaPigs.length === 1" class="bonding-sidebar__no-bonds">
        <p>🐹 Add another guinea pig to see bonding relationships!</p>
      </div>

      <!-- Bonding Content -->
      <template v-else>
        <!-- Social Interaction Triggers -->
        <div v-if="selectedGuineaPig" class="interaction-section">
          <h4 class="interaction-section__title">🤝 Trigger Social Interaction</h4>
          <p class="interaction-section__description">{{ selectedGuineaPig.name }} will initiate the interaction with their companion</p>

          <div class="interaction-buttons">
            <!-- All Tier Interactions -->
            <Button
              @click="triggerInteraction('greet')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion"
              :title="hasCompanion ? 'Friendly greeting' : 'Requires companion'"
            >
              👃 Greet
            </Button>

            <Button
              @click="triggerInteraction('inspect')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion || !canInspect"
              :title="!hasCompanion ? 'Requires companion' : !canInspect ? 'Requires curiosity ≥ 5' : 'Curious investigation'"
            >
              🔍 Inspect
            </Button>

            <Button
              @click="triggerInteraction('play')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion"
              :title="hasCompanion ? 'Play together' : 'Requires companion'"
            >
              🎾 Play
            </Button>

            <!-- Friends/Bonded Tier Interactions -->
            <Button
              @click="triggerInteraction('groom')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion || !canGroom"
              :title="!hasCompanion ? 'Requires companion' : !canGroom ? 'Requires Friends or Bonded tier' : 'Groom companion'"
            >
              🧼 Groom
            </Button>

            <Button
              @click="triggerInteraction('follow')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion || !canFollow"
              :title="!hasCompanion ? 'Requires companion' : !canFollow ? 'Requires Bonded tier or friendliness ≥ 6' : 'Follow companion'"
            >
              🚶 Follow
            </Button>

            <Button
              @click="triggerInteraction('sleep')"
              variant="tertiary"
              size="sm"
              :disabled="isGameInactive || !hasCompanion || !canSleepTogether"
              :title="!hasCompanion ? 'Requires companion' : !canSleepTogether ? 'Requires Friends or Bonded tier' : 'Sleep together'"
            >
              😴 Sleep Together
            </Button>
          </div>
        </div>

        <!-- Bonds List -->
        <div class="bonding-sidebar__bonds-list">
          <div
            v-for="bond in bonds"
            :key="bond.id"
            class="bond-card"
          >
            <!-- Bond Header -->
            <div class="bond-card__header">
              <div class="bond-card__names">
                <span class="bond-card__name">{{ getGuineaPigName(bond.guineaPig1Id) }}</span>
                <span class="bond-card__separator">&</span>
                <span class="bond-card__name">{{ getGuineaPigName(bond.guineaPig2Id) }}</span>
              </div>
              <div class="bond-card__tier" :class="`bond-card__tier--${bond.bondingTier}`">
                {{ getBondingTierLabel(bond.bondingTier) }}
              </div>
            </div>

            <!-- Bonding Level Progress -->
            <div class="bond-card__progress">
              <div class="bond-card__progress-bar">
                <div
                  class="bond-card__progress-fill"
                  :class="`bond-card__progress-fill--${bond.bondingTier}`"
                  :style="{ width: `${bond.bondingLevel}%` }"
                ></div>
              </div>
              <span class="bond-card__progress-text">{{ bond.bondingLevel.toFixed(1) }}%</span>
            </div>

            <!-- Bond Stats -->
            <div class="bond-card__stats">
              <div class="bond-card__stat">
                <span class="bond-card__stat-label">Interactions:</span>
                <span class="bond-card__stat-value">{{ bond.totalInteractions }}</span>
              </div>
              <div class="bond-card__stat">
                <span class="bond-card__stat-label">Compatibility:</span>
                <span class="bond-card__stat-value">{{ (bond.compatibilityScore * 100).toFixed(0) }}%</span>
              </div>
            </div>

            <!-- Recent Interactions -->
            <Details
              v-if="bond.bondingHistory.length > 0"
              summary="Recent Interactions"
              variant="compact"
              :default-open="false"
            >
              <div class="bond-card__interactions">
                <div
                  v-for="(event, index) in bond.bondingHistory.slice(-5).reverse()"
                  :key="index"
                  class="interaction-item"
                >
                  <span class="interaction-item__emoji">{{ getInteractionEmoji(event.type) }}</span>
                  <span class="interaction-item__description">{{ event.description }}</span>
                  <span class="interaction-item__impact interaction-item__impact--positive">
                    +{{ event.bondingChange.toFixed(1) }}%
                  </span>
                </div>
              </div>
            </Details>
          </div>
        </div>

        <!-- Bonding Tips -->
        <div class="panel panel--compact panel--accent">
          <div class="panel__header">
            <h4>💡 Bonding Tips</h4>
          </div>
          <div class="panel__content">
            <ul class="bonding-tips">
              <li><span class="bonding-tips__label">Neutral (0-30%):</span> Guinea pigs are getting acquainted. Keep them together and they'll warm up!</li>
              <li><span class="bonding-tips__label">Friends (31-70%):</span> They enjoy each other's company. More social interactions unlock.</li>
              <li><span class="bonding-tips__label">Bonded (71-100%):</span> Best friends! They'll groom, sleep together, and follow each other.</li>
            </ul>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../../../stores/guineaPigStore'
import { useGameController } from '../../../../stores/gameController'
import { useGuineaPigBehavior } from '../../../../composables/game/useGuineaPigBehavior'
import Button from '../../../basic/Button.vue'
import Details from '../../../basic/Details.vue'

const guineaPigStore = useGuineaPigStore()
const gameController = useGameController()

// Selected guinea pig (default to first active)
const selectedGuineaPig = computed(() => {
  if (guineaPigStore.selectedGuineaPigId) {
    return guineaPigStore.getGuineaPig(guineaPigStore.selectedGuineaPigId)
  }
  return guineaPigStore.activeGuineaPigs[0]
})

// Current guinea pig index for toggle button
const currentGuineaPigIndex = computed(() => {
  if (!selectedGuineaPig.value) return 0
  return guineaPigStore.activeGuineaPigs.findIndex(gp => gp.id === selectedGuineaPig.value!.id)
})

// Toggle to next guinea pig
function toggleGuineaPig() {
  const activeGuineaPigs = guineaPigStore.activeGuineaPigs
  if (activeGuineaPigs.length <= 1) return

  const currentIndex = activeGuineaPigs.findIndex(gp => gp.id === selectedGuineaPig.value?.id)
  const nextIndex = (currentIndex + 1) % activeGuineaPigs.length
  const nextGuineaPig = activeGuineaPigs[nextIndex]

  guineaPigStore.selectGuineaPig(nextGuineaPig.id)
}

// Game state
const isGameInactive = computed(() => !gameController.isGameActive)

// Companion checks
const hasCompanion = computed(() => {
  return guineaPigStore.activeGuineaPigs.length >= 2
})

// Get the bond for the selected guinea pig with their best companion
const primaryBond = computed(() => {
  if (!selectedGuineaPig.value || !hasCompanion.value) return null

  const allBonds = guineaPigStore.getAllBonds()
  const myBonds = allBonds
    .filter(bond => {
      const isMyBond = bond.guineaPig1Id === selectedGuineaPig.value!.id || bond.guineaPig2Id === selectedGuineaPig.value!.id
      if (!isMyBond) return false

      const partnerId = bond.guineaPig1Id === selectedGuineaPig.value!.id ? bond.guineaPig2Id : bond.guineaPig1Id
      const partner = guineaPigStore.getGuineaPig(partnerId)
      return partner && guineaPigStore.activeGuineaPigs.some(gp => gp.id === partnerId)
    })
    .sort((a, b) => b.bondingLevel - a.bondingLevel)

  return myBonds[0] || null
})

// Interaction eligibility checks
const canInspect = computed(() => {
  if (!selectedGuineaPig.value?.personality) return false
  return selectedGuineaPig.value.personality.curiosity >= 5
})

const canGroom = computed(() => {
  if (!primaryBond.value) return false
  return primaryBond.value.bondingTier === 'friends' || primaryBond.value.bondingTier === 'bonded'
})

const canFollow = computed(() => {
  if (!primaryBond.value || !selectedGuineaPig.value?.personality) return false
  return primaryBond.value.bondingTier === 'bonded' || selectedGuineaPig.value.personality.friendliness >= 6
})

const canSleepTogether = computed(() => {
  if (!primaryBond.value) return false
  return primaryBond.value.bondingTier === 'friends' || primaryBond.value.bondingTier === 'bonded'
})

// Cache behavior composables
const behaviorComposables = new Map<string, ReturnType<typeof useGuineaPigBehavior>>()

function getBehaviorComposable(guineaPigId: string) {
  let behavior = behaviorComposables.get(guineaPigId)
  if (!behavior) {
    behavior = useGuineaPigBehavior(guineaPigId)
    behaviorComposables.set(guineaPigId, behavior)
  }
  return behavior
}

// Trigger social interaction
async function triggerInteraction(interactionType: string) {
  if (!selectedGuineaPig.value || !primaryBond.value) {
    console.warn('[BondingSidebar] No selected guinea pig or bond')
    return
  }

  const partnerId = primaryBond.value.guineaPig1Id === selectedGuineaPig.value.id
    ? primaryBond.value.guineaPig2Id
    : primaryBond.value.guineaPig1Id
  const partner = guineaPigStore.getGuineaPig(partnerId)

  if (!partner) {
    console.warn('[BondingSidebar] Partner not found')
    return
  }

  console.log(`[BondingSidebar] ${selectedGuineaPig.value.name} will ${interactionType} with ${partner.name}`)

  const behavior = getBehaviorComposable(selectedGuineaPig.value.id)

  const goal = {
    type: 'socialize' as const,
    target: null,
    priority: 100,
    estimatedDuration: 8000,
    needSatisfied: 'social' as const,
    metadata: {
      partnerId,
      bondId: primaryBond.value.id,
      requestedInteraction: interactionType
    }
  }

  const success = await behavior.executeBehavior(goal)
  if (success) {
    console.log(`✅ Successfully triggered ${interactionType} for ${selectedGuineaPig.value.name}`)
  } else {
    console.warn(`❌ Failed to execute ${interactionType} for ${selectedGuineaPig.value.name}`)
  }
}

// Get all active bonds
const bonds = computed(() => {
  const allBonds = guineaPigStore.getAllBonds()
  // Filter to only show bonds where both guinea pigs are active
  return allBonds.filter(bond => {
    const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
    const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)
    return gp1 && gp2 &&
           guineaPigStore.activeGuineaPigs.some(gp => gp.id === bond.guineaPig1Id) &&
           guineaPigStore.activeGuineaPigs.some(gp => gp.id === bond.guineaPig2Id)
  })
  // Sort by bonding level (highest first)
  .sort((a, b) => b.bondingLevel - a.bondingLevel)
})

function getGuineaPigName(id: string): string {
  const gp = guineaPigStore.getGuineaPig(id)
  return gp?.name || 'Unknown'
}

function getBondingTierLabel(tier: string): string {
  switch (tier) {
    case 'neutral': return 'Neutral'
    case 'friends': return 'Friends'
    case 'bonded': return 'Bonded'
    default: return tier
  }
}

function getInteractionEmoji(type: string): string {
  switch (type) {
    case 'approach': return '👋'
    case 'groom': return '🧼'
    case 'play': return '🎾'
    case 'share_food': return '🍽️'
    case 'sleep': return '😴'
    case 'explore': return '🗺️'
    case 'greet': return '👃'
    case 'inspect': return '🔍'
    case 'follow': return '🚶'
    case 'kick': return '⚠️'
    case 'interaction': return '🤝'
    default: return '💬'
  }
}
</script>

<style>
/* Component-specific styles (shared layout from .habitat-sidebar) */
.bonding-sidebar__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonding-sidebar__content {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bonding-sidebar__no-guinea-pigs,
.bonding-sidebar__no-bonds {
  text-align: center;
  padding: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.bonding-sidebar__guinea-pig-name-static {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Interaction Section */
.interaction-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.interaction-section__title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin: 0;
}

.interaction-section__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin: 0;
}

.interaction-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.bonding-sidebar__bonds-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Bond Card */
.bond-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.bond-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
}

.bond-card__names {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.bond-card__name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.bond-card__separator {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.bond-card__tier {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bond-card__tier--neutral {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.bond-card__tier--friends {
  background: var(--color-info-bg);
  color: var(--color-info-text);
}

.bond-card__tier--bonded {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}

/* Progress Bar */
.bond-card__progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.bond-card__progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bond-card__progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.bond-card__progress-fill--neutral {
  background: var(--color-text-secondary);
}

.bond-card__progress-fill--friends {
  background: var(--color-info);
}

.bond-card__progress-fill--bonded {
  background: var(--color-success);
}

.bond-card__progress-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  min-width: 48px;
  text-align: right;
}

/* Stats */
.bond-card__stats {
  display: flex;
  gap: var(--space-4);
}

.bond-card__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.bond-card__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.bond-card__stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

/* Interactions */
.bond-card__interactions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-block-start: var(--space-2);
}

.interaction-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.interaction-item__emoji {
  font-size: var(--font-size-base);
}

.interaction-item__description {
  flex: 1;
  color: var(--color-text-secondary);
}

.interaction-item__impact {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
}

.interaction-item__impact--positive {
  color: var(--color-success);
}

.interaction-item__impact--negative {
  color: var(--color-danger);
}

/* Bonding Tips */
.bonding-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}

.bonding-tips li {
  padding-inline-start: var(--space-3);
  position: relative;
}

.bonding-tips li::before {
  content: '•';
  position: absolute;
  inset-inline-start: 0;
  color: var(--color-accent);
}

.bonding-tips__label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
</style>
