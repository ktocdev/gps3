<template>
  <div class="bonding-debug">
    <DebugPanel
      v-if="activeGuineaPigs.length === 0"
      title="🤝 Social Bonding · pig-to-pig"
      anchor="no active game"
      accent="var(--color-cyan-500)"
    >
      <p class="text-label text-label--muted">No guinea pigs in game</p>
      <p class="text-label--small">Start a game in the Game Controller view to see social bonding data.</p>
    </DebugPanel>

    <DebugPanel
      v-else-if="activeGuineaPigs.length < 2"
      title="🤝 Social Bonding · pig-to-pig"
      anchor="needs 2 pigs"
      accent="var(--color-cyan-500)"
    >
      <p class="text-label--small">Bonding requires at least 2 active guinea pigs. Add another guinea pig from the Pet Store tab.</p>
    </DebugPanel>

    <!-- Three Column Layout -->
    <DebugPanelRow v-else :columns="3">
      <!-- Active Bonds Overview -->
      <DebugPanel
        title="🤝 Social Bonding · pig-to-pig"
        :anchor="pairAnchor"
        accent="var(--color-cyan-500)"
      >
        <div v-if="allBonds.length === 0" class="bonding-debug__empty">
          No bonds created yet
        </div>
        <div v-else class="bonding-debug__bonds-list">
          <div v-for="bond in allBonds" :key="bond.id" class="bonding-debug__bond-card">
            <div class="bonding-debug__bond-header">
              <span class="bonding-debug__bond-names">{{ getGuineaPigName(bond.guineaPig1Id) }} ↔ {{ getGuineaPigName(bond.guineaPig2Id) }}</span>
              <DebugBadge :variant="getTierVariant(bond.bondingTier)">{{ formatTier(bond.bondingTier) }}</DebugBadge>
            </div>

            <DebugSlider
              :model-value="Math.round(bond.bondingLevel)"
              label="Bond Level"
              accent="var(--color-cyan-500)"
              :hint="`${getBondTierLabel(bond.bondingLevel)} — gates pig-to-pig snuggle / groom / play behaviors`"
              disabled
            />

            <DebugSection title="Telemetry">
              <div class="stats-grid">
                <DebugStatRow label="Bonding Level" :value="`${Math.round(bond.bondingLevel)}%`" />
                <DebugStatRow label="Compatibility" :value="`${bond.compatibilityScore}/100`" />
                <DebugStatRow label="Total Interactions" :value="bond.totalInteractions" />
                <DebugStatRow label="Proximity Time" :value="`${bond.proximityTime.toFixed(1)}h`" />
              </div>
            </DebugSection>

            <DebugSection title="Tier Benefits">
              <div class="stats-grid">
                <DebugStatRow label="Social decay" :value="`${getBenefits(bond.bondingLevel).socialDecayModifier}x`" />
                <DebugStatRow label="Proximity bonus" :value="`${getBenefits(bond.bondingLevel).proximityBonus}x`" />
                <DebugStatRow label="Interaction frequency" :value="`${getBenefits(bond.bondingLevel).interactionFrequency}x`" />
              </div>
            </DebugSection>

            <!-- Manual Triggers -->
            <DebugSection title="Pair Interactions">
              <div class="btn-row">
                <Button @click="triggerGrooming(bond)" size="sm" variant="secondary">🧼 Groom</Button>
                <Button @click="triggerPlayTogether(bond)" size="sm" variant="secondary">🎮 Play</Button>
                <Button @click="triggerExplore(bond)" size="sm" variant="secondary">🗺️ Explore</Button>
              </div>
            </DebugSection>
          </div>
        </div>
      </DebugPanel>

      <!-- Bonding History -->
      <DebugPanel title="📜 Recent Bonding Events" anchor="last 10">
        <div v-if="recentEvents.length === 0" class="bonding-debug__empty">
          No bonding events yet
        </div>
        <div v-else class="bonding-debug__events">
          <div v-for="event in recentEvents" :key="event.id" class="bonding-debug__event">
            <div class="bonding-debug__event-header">
              <span class="bonding-debug__event-type">{{ formatEventType(event.type) }}</span>
              <span class="bonding-debug__event-time">{{ formatTimestamp(event.timestamp) }}</span>
            </div>
            <div class="bonding-debug__event-description">{{ event.description }}</div>
            <div class="bonding-debug__event-change" :class="{ 'bonding-debug__event-change--positive': event.bondingChange > 0 }">
              +{{ event.bondingChange.toFixed(1) }} bonding
            </div>
          </div>
        </div>
      </DebugPanel>

      <!-- Compatibility Breakdown -->
      <DebugPanel title="🧬 Compatibility Analysis" anchor="read-only">
        <DebugSection
          v-for="bond in allBonds"
          :key="bond.id"
          :title="`${getGuineaPigName(bond.guineaPig1Id)} ↔ ${getGuineaPigName(bond.guineaPig2Id)}`"
        >
          <div class="stats-grid">
            <DebugStatRow
              v-for="[factor, score] in getCompatibilityFactors(bond)"
              :key="factor"
              :label="formatFactorName(factor)"
              :value="score"
            />
          </div>
        </DebugSection>
      </DebugPanel>
    </DebugPanelRow>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useSocialBehaviors } from '../../../composables/game/useSocialBehaviors'
import { getBondingTierBenefits } from '../../../utils/bondingProgression'
import { getCompatibilityBreakdown as getCompatibility } from '../../../utils/compatibility'
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import DebugBadge from '../ui/DebugBadge.vue'

const guineaPigStore = useGuineaPigStore()
const socialBehaviors = useSocialBehaviors()

const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)
const allBonds = computed(() => guineaPigStore.getAllBonds())

const pairAnchor = computed(() => {
  if (activeGuineaPigs.value.length < 2) return ''
  return `${activeGuineaPigs.value[0].name} ↔ ${activeGuineaPigs.value[1].name}`
})

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

function getTierVariant(tier: string): 'ok' | 'warn' | 'err' | 'info' {
  if (tier === 'bonded') return 'ok'
  if (tier === 'friends') return 'info'
  return 'warn'
}

function getBondTierLabel(bondingLevel: number): string {
  if (bondingLevel >= 80) return 'Cage-mates'
  if (bondingLevel >= 50) return 'Buddies'
  if (bondingLevel >= 20) return 'Tolerant'
  return 'Hostile'
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
.bonding-debug__empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.bonding-debug__bonds-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.bonding-debug__bond-card {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.bonding-debug__bond-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  margin-block-end: var(--space-3);
}

.bonding-debug__bond-names {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
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
  border-inline-start: 3px solid var(--color-cyan-500);
}

.bonding-debug__event-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  margin-block-end: var(--space-2);
}

.bonding-debug__event-type {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.bonding-debug__event-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.bonding-debug__event-description {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.bonding-debug__event-change {
  margin-block-start: var(--space-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.bonding-debug__event-change--positive {
  color: var(--color-success);
}
</style>
