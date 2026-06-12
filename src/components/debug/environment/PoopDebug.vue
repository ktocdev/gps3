<template>
  <div class="poop-debug">
    <div v-if="hasActiveGuineaPigs">
      <div v-for="guineaPig in guineaPigStore.activeGuineaPigs" :key="guineaPig.id" class="guinea-pig-poop">
        <div class="panel panel--compact mb-4">
          <div class="panel__header">
            <h5>{{ guineaPig.name }} - Poop Status</h5>
          </div>
          <div class="panel__content">
            <!-- Poop Timer Info -->
            <div class="poop-info mb-3">
              <div class="info-row">
                <span class="info-label">Last Poop:</span>
                <span class="info-value">{{ getTimeSinceLastPoop(guineaPig.id) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Next Poop In:</span>
                <span class="info-value">{{ getTimeUntilNextPoop(guineaPig.id) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Poop Interval:</span>
                <span class="info-value">30 seconds</span>
              </div>
            </div>

            <!-- Manual Poop Button -->
            <div class="poop-actions">
              <Button
                @click="triggerManualPoop(guineaPig.id)"
                variant="secondary"
                size="sm"
              >
                💩 Force Poop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Poop Stats -->
      <div class="panel panel--compact">
        <div class="panel__header">
          <h5>Habitat Poop Stats</h5>
        </div>
        <div class="panel__content">
          <div class="poop-stats">
            <div class="stat-row">
              <span class="stat-label">Total Poops:</span>
              <span class="stat-value">{{ totalPoops }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Hygiene Impact:</span>
              <span class="stat-value" :class="getHygieneClass()">
                {{ getHygieneImpact() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="panel panel--compact panel--warning">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see poop data.</p>
      </div>
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

function getHygieneClass(): string {
  const poopCount = totalPoops.value
  if (poopCount === 0) return 'stat-value--good'
  if (poopCount < 10) return 'stat-value--warning'
  return 'stat-value--error'
}
</script>

<style scoped>
.poop-debug {
  margin-block-end: var(--spacing-6);
}

.guinea-pig-poop {
  margin-block-end: var(--spacing-4);
}

.poop-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background-color: var(--color-surface-secondary);
  border-radius: var(--radius-md);
}

.info-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.info-value {
  font-weight: 600;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
}

.poop-actions {
  margin-block-start: var(--spacing-3);
}

.poop-stats {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background-color: var(--color-surface-secondary);
  border-radius: var(--radius-md);
}

.stat-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: 600;
  font-family: var(--font-mono);
}

.stat-value--good {
  color: var(--color-success);
}

.stat-value--warning {
  color: var(--color-warning);
}

.stat-value--error {
  color: var(--color-error);
}

.no-guinea-pigs {
  padding: var(--spacing-4);
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
