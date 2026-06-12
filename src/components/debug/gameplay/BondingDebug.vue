<template>
  <div class="bonding-debug debug-view__constrained">
    <h2>Social Bonding System</h2>

    <div v-if="activeGuineaPigs.length === 0" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see social bonding data.</p>
      </div>
    </div>

    <div v-else-if="activeGuineaPigs.length < 2" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p>Bonding requires at least 2 active guinea pigs. Add another guinea pig from the Pet Store tab.</p>
      </div>
    </div>

    <div v-else>
      <!-- Three Column Layout -->
      <div class="panel-row panel-row--grid-3">
        <!-- Active Bonds Overview -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Active Bonds</h3>
          </div>
          <div class="panel__content">
            <div v-if="allBonds.length === 0" class="text-center text--muted">
              No bonds created yet
            </div>
            <div v-else class="bonding-debug__bonds-list">
              <div v-for="bond in allBonds" :key="bond.id" class="bonding-debug__bond-card">
                <div class="bond-header">
                  <span class="bond-names">{{ getGuineaPigName(bond.guineaPig1Id) }} & {{ getGuineaPigName(bond.guineaPig2Id) }}</span>
                  <span class="bond-tier" :class="`bond-tier--${bond.bondingTier}`">{{ formatTier(bond.bondingTier) }}</span>
                </div>

                <div class="stats-grid mb-3">
                  <div class="stat-item">
                    <span class="stat-label">Bonding Level:</span>
                    <span class="stat-value">{{ Math.round(bond.bondingLevel) }}%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Compatibility:</span>
                    <span class="stat-value">{{ bond.compatibilityScore }}/100</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Total Interactions:</span>
                    <span class="stat-value">{{ bond.totalInteractions }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Proximity Time:</span>
                    <span class="stat-value">{{ bond.proximityTime.toFixed(1) }}h</span>
                  </div>
                </div>

                <div class="progress-bar mb-3">
                  <div class="progress-bar__fill" :style="{ width: bond.bondingLevel + '%' }"></div>
                </div>

                <div class="bond-benefits">
                  <span class="text-label text-label--muted">Benefits:</span>
                  <ul class="text-label--small">
                    <li>Social decay: {{ getBenefits(bond.bondingLevel).socialDecayModifier }}x</li>
                    <li>Proximity bonus: {{ getBenefits(bond.bondingLevel).proximityBonus }}x</li>
                    <li>Interaction frequency: {{ getBenefits(bond.bondingLevel).interactionFrequency }}x</li>
                  </ul>
                </div>

                <!-- Manual Triggers -->
                <div class="button-group mt-3">
                  <Button @click="triggerGrooming(bond)" size="sm" variant="secondary">🧼 Groom</Button>
                  <Button @click="triggerPlayTogether(bond)" size="sm" variant="secondary">🎮 Play</Button>
                  <Button @click="triggerExplore(bond)" size="sm" variant="secondary">🗺️ Explore</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bonding History -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Recent Bonding Events</h3>
          </div>
          <div class="panel__content">
            <div v-if="recentEvents.length === 0" class="text-center text--muted">
              No bonding events yet
            </div>
            <div v-else class="bonding-debug__events">
              <div v-for="event in recentEvents" :key="event.id" class="bonding-debug__event">
                <div class="event-header">
                  <span class="event-type">{{ formatEventType(event.type) }}</span>
                  <span class="event-time">{{ formatTimestamp(event.timestamp) }}</span>
                </div>
                <div class="event-description text-label--small">{{ event.description }}</div>
                <div class="event-change text-label--small" :class="event.bondingChange > 0 ? 'text--success' : ''">
                  +{{ event.bondingChange.toFixed(1) }} bonding
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compatibility Breakdown -->
        <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Compatibility Analysis</h3>
          </div>
          <div class="panel__content">
            <div v-for="bond in allBonds" :key="bond.id" class="mb-4">
              <h4 class="text-label mb-2">{{ getGuineaPigName(bond.guineaPig1Id) }} & {{ getGuineaPigName(bond.guineaPig2Id) }}</h4>
              <div class="stats-grid">
                <div v-for="[factor, score] in getCompatibilityFactors(bond)" :key="factor" class="stat-item">
                  <span class="stat-label">{{ formatFactorName(factor) }}:</span>
                  <span class="stat-value">{{ score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useSocialBehaviors } from '../../../composables/game/useSocialBehaviors'
import { getBondingTierBenefits } from '../../../utils/bondingProgression'
import { getCompatibilityBreakdown as getCompatibility } from '../../../utils/compatibility'
import Button from '../../basic/Button.vue'

const guineaPigStore = useGuineaPigStore()
const socialBehaviors = useSocialBehaviors()

const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)
const allBonds = computed(() => guineaPigStore.getAllBonds())

const recentEvents = computed(() => {
  const events = allBonds.value.flatMap(bond =>
    bond.bondingHistory.map(event => ({ ...event, bondId: bond.id }))
  )
  return events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
})

function getGuineaPigName(id: string): string {
  const gp = guineaPigStore.getGuineaPig(id)
  return gp?.name || 'Unknown'
}

function formatTier(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function formatEventType(type: string): string {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

function getBenefits(bondingLevel: number) {
  return getBondingTierBenefits(bondingLevel)
}

async function triggerGrooming(bond: any) {
  const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
  const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)
  if (!gp1 || !gp2) return

  await socialBehaviors.groomPartner(gp1, gp2, bond)
}

async function triggerPlayTogether(bond: any) {
  const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
  const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)
  if (!gp1 || !gp2) return

  await socialBehaviors.playTogether(gp1, gp2, bond)
}

async function triggerExplore(bond: any) {
  const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
  const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)
  if (!gp1 || !gp2) return

  await socialBehaviors.exploreTogether(gp1, gp2, bond)
}

function getCompatibilityFactors(bond: any): [string, number][] {
  const gp1 = guineaPigStore.getGuineaPig(bond.guineaPig1Id)
  const gp2 = guineaPigStore.getGuineaPig(bond.guineaPig2Id)
  if (!gp1 || !gp2) return []

  const breakdown = getCompatibility(gp1, gp2)
  return Object.entries(breakdown)
}

function formatFactorName(factor: string): string {
  return factor.charAt(0).toUpperCase() + factor.slice(1)
}
</script>

<style>
.bonding-debug__bonds-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bonding-debug__bond-card {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.bond-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-3);
}

.bond-names {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.bond-tier {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.bond-tier--neutral {
  background: var(--color-neutral-200);
  color: var(--color-neutral-700);
}

.bond-tier--friends {
  background: var(--color-secondary-bg);
  color: var(--color-secondary);
}

.bond-tier--bonded {
  background: var(--color-accent-pink-100);
  color: var(--color-accent-pink-700);
}

.bond-benefits {
  margin-block-start: var(--space-3);
}

.bond-benefits ul {
  margin-block-start: var(--space-1);
  padding-inline-start: var(--space-4);
}

.bonding-debug__events {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.bonding-debug__event {
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border-inline-start: 3px solid var(--color-primary);
}

.event-header {
  display: flex;
  justify-content: space-between;
  margin-block-end: var(--space-2);
}

.event-type {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.event-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.event-change {
  margin-block-start: var(--space-1);
  font-weight: var(--font-weight-medium);
}
</style>
