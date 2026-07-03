<template>
  <div class="poop-debug">
    <template v-if="hasActiveGuineaPigs">
      <DebugSection
        v-for="guineaPig in guineaPigStore.activeGuineaPigs"
        :key="guineaPig.id"
        :title="`${guineaPig.name} · Poop Status`"
      >
        <div class="stats-grid">
          <DebugStatRow label="Last Poop" :value="getTimeSinceLastPoop(guineaPig.id)" />
          <DebugStatRow label="Next Poop In" :value="getTimeUntilNextPoop(guineaPig.id)" />
          <DebugStatRow label="Poop Interval" value="30 seconds" />
        </div>
        <div class="btn-row poop-debug__actions">
          <Button
            @click="triggerManualPoop(guineaPig.id)"
            variant="secondary"
            size="sm"
          >
            💩 Force Poop Now
          </Button>
        </div>
      </DebugSection>

      <DebugSection title="Habitat Poop Stats">
        <div class="stats-grid">
          <DebugStatRow label="Total Poops" :value="totalPoops" />
          <div class="stat-item">
            <span class="stat-label">Hygiene Impact</span>
            <DebugBadge :variant="getHygieneBadgeVariant()">{{ getHygieneImpact() }}</DebugBadge>
          </div>
        </div>
      </DebugSection>
    </template>

    <div v-else class="text-center">
      <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
      <p class="text-label--small">Start a game in the Game Controller view to see poop data.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useHabitatConditions } from '../../../stores/habitatConditions'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import { useLoggingStore } from '../../../stores/loggingStore'
import { MessageGenerator } from '../../../utils/messageGenerator'
import { detectNearbyLocation, gridToSubgridWithOffset, positionToGridCoords } from '../../../utils/locationDetection'
import Button from '../../basic/Button.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import DebugBadge from '../ui/DebugBadge.vue'

const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditions()
const suppliesStore = useSuppliesStore()
const loggingStore = useLoggingStore()

// Constants
const POOP_INTERVAL_MS = 30000 // 30 seconds - matches behavior system

const hasActiveGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs.length > 0)

const totalPoops = computed(() => habitatConditions.poops.length)

function getTimeSinceLastPoop(guineaPigId: string): string {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return 'N/A'

  const timeSince = Date.now() - guineaPig.lastPoopTime
  const seconds = Math.floor(timeSince / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s ago`
}

function getTimeUntilNextPoop(guineaPigId: string): string {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return 'N/A'

  const timeSince = Date.now() - guineaPig.lastPoopTime
  const timeRemaining = Math.max(0, POOP_INTERVAL_MS - timeSince)
  const seconds = Math.floor(timeRemaining / 1000)

  if (timeRemaining === 0) return 'Any moment now!'
  return `${seconds}s`
}

function triggerManualPoop(guineaPigId: string): void {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  // Get guinea pig's current position from habitat conditions
  const position = habitatConditions.guineaPigPositions.get(guineaPigId)

  // Convert position to grid coordinates (position uses x/y where x=col, y=row)
  const currentPos = position ? positionToGridCoords(position) : { row: 1, col: 1 }

  // Convert grid coordinates to subgrid coordinates with random offset
  const subgridPos = gridToSubgridWithOffset(currentPos)
  habitatConditions.addPoop(subgridPos.x, subgridPos.y)

  // Detect nearby items for location context
  const nearbyLocation = detectNearbyLocation(currentPos, habitatConditions, suppliesStore)

  // Log to activity feed with location context
  const msg = MessageGenerator.generateAutonomousPoopMessage(guineaPig.name, nearbyLocation)
  loggingStore.addEnvironmentalEvent(msg.message, msg.emoji)

  // Reset poop timer
  guineaPig.lastPoopTime = Date.now()
}

function getHygieneImpact(): string {
  const poopCount = totalPoops.value
  if (poopCount === 0) return 'Clean'
  if (poopCount < 5) return 'Slightly dirty'
  if (poopCount < 10) return 'Dirty'
  if (poopCount < 20) return 'Very dirty'
  return 'Extremely dirty'
}

function getHygieneBadgeVariant(): 'ok' | 'warn' | 'err' {
  const poopCount = totalPoops.value
  if (poopCount === 0) return 'ok'
  if (poopCount < 10) return 'warn'
  return 'err'
}
</script>

<style>
.poop-debug__actions {
  margin-block-start: var(--space-3);
}
</style>
