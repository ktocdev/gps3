<template>
  <div class="pig-info">
    <!-- Info -->
    <div class="pig-info__section-header"><span>🐹</span><span>Info</span></div>
    <div class="pig-info__rows">
      <div class="pig-info__row">
        <span class="pig-info__row-label">Breed:</span>
        <span class="pig-info__row-value">{{ guineaPig.breed }}</span>
      </div>
      <div class="pig-info__row">
        <span class="pig-info__row-label">Gender:</span>
        <span class="pig-info__row-value">{{ guineaPig.gender === 'male' ? '♂ Male' : '♀ Female' }}</span>
      </div>
      <div class="pig-info__row">
        <span class="pig-info__row-label">Fur:</span>
        <span class="pig-info__row-value">{{ furLabel }}</span>
      </div>
    </div>

    <div class="pig-info__divider"></div>

    <!-- User friendship -->
    <div class="pig-info__section-header"><span>💖</span><span>User Friendship</span></div>
    <div class="pig-info__rows">
      <div class="pig-info__friendship-head">
        <span>Friendship</span>
        <span class="pig-info__friendship-value">{{ Math.round(guineaPig.friendship) }}%</span>
      </div>
      <div class="pig-info__bar-track">
        <div class="pig-info__bar-fill" :style="{ width: `${guineaPig.friendship}%` }"></div>
      </div>
      <div class="pig-info__rows" style="margin-block-start: var(--space-3);">
        <div class="pig-info__row">
          <span class="pig-info__row-label">Last interaction:</span>
          <span class="pig-info__row-value">{{ relTime(guineaPig.lastInteraction) }}</span>
        </div>
        <div class="pig-info__row">
          <span class="pig-info__row-label">Total interactions:</span>
          <span class="pig-info__row-value">{{ guineaPig.totalInteractions }}</span>
        </div>
      </div>
    </div>

    <!-- Bonds with other pigs -->
    <template v-if="bonds.length > 0">
      <div class="pig-info__divider"></div>
      <div v-for="bond in bonds" :key="bond.otherId" class="pig-info__bond">
        <div class="pig-info__section-header"><span>🤝</span><span>Bonding with {{ bond.otherName }}</span></div>
        <div class="pig-info__rows">
          <div class="pig-info__bond-track">
            <div
              class="pig-info__bond-fill"
              :style="{ width: `${bond.level}%`, '--bond-color': bond.color }"
            ></div>
          </div>
          <div class="pig-info__bond-foot">
            <span class="pig-info__friendship-value" :style="{ color: bond.color }">{{ Math.round(bond.level) }}%</span>
            <span class="pig-info__tier">{{ bond.tierLabel }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore, type GuineaPig } from '../../stores/guineaPigStore'

const props = defineProps<{
  guineaPig: GuineaPig
}>()

const guineaPigStore = useGuineaPigStore()

const furLabel = computed(() => {
  const { furColor, furPattern } = props.guineaPig.appearance
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
  return `${cap(furColor)} ${cap(furPattern)}`
})

const bonds = computed(() => {
  return guineaPigStore.activeGuineaPigs
    .filter(other => other.id !== props.guineaPig.id)
    .map(other => {
      const bond = guineaPigStore.getBond(props.guineaPig.id, other.id)
      const level = bond?.bondingLevel ?? 0
      const tier = bond?.bondingTier ?? 'neutral'
      const tierMeta = {
        bonded: { label: 'Bonded', color: 'var(--color-pink)' },
        friends: { label: 'Friends', color: 'var(--color-gold-400)' },
        neutral: { label: 'Neutral', color: 'var(--color-wood-dark)' }
      }[tier]
      return {
        otherId: other.id,
        otherName: other.name,
        level,
        tierLabel: tierMeta.label,
        color: tierMeta.color
      }
    })
})

function relTime(timestamp: number | null): string {
  if (!timestamp) return '—'
  const m = Math.floor((Date.now() - timestamp) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
</script>

<style>
.pig-info__rows {
  padding-inline: var(--space-1);
}

.pig-info__friendship-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: 800;
  color: var(--color-wood-border);
}

.pig-info__friendship-value {
  font-size: var(--font-size-lg);
  font-weight: 900;
  color: var(--color-gold-500);
  font-family: var(--font-family-heading);
}

.pig-info__bond-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-start: var(--space-2);
}

.pig-info__bond {
  margin-block-end: var(--space-2);
}
</style>
