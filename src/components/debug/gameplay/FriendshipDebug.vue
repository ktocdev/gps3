<template>
  <div class="friendship-debug debug-view__constrained">
    <h2>Friendship</h2>
    <div v-if="activeGuineaPigs.length === 0" class="panel panel--compact panel--warning mb-6">
      <div class="panel__content text-center">
        <p class="text-label text-label--muted mb-2">No guinea pigs in game</p>
        <p class="text-label--small">Start a game in the Game Controller view to see friendship data.</p>
      </div>
    </div>

    <div v-else>
      <div class="panel-row">
        <!-- Guinea Pig Panels (Left Column) -->
        <div class="friendship-debug__guinea-pigs">
          <div v-for="guineaPig in activeGuineaPigs" :key="guineaPig.id" class="mb-6">
            <div class="panel-row">
          <!-- Guinea Pig Info Panel -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h3>{{ guineaPig.name }}</h3>
            </div>
            <div class="panel__content">
              <div class="stats-grid mb-4">
                <div class="stat-item">
                  <span class="stat-label">Friendship:</span>
                  <span class="stat-value">{{ Math.round(guineaPig.friendship) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Wellness:</span>
                  <span class="stat-value">{{ Math.round(getWellness(guineaPig.id)) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Penalty Active:</span>
                  <span class="stat-value" :class="needsController.isPenaltyActive ? 'text--error' : 'text--success'">
                    {{ needsController.isPenaltyActive ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Penalty Rate:</span>
                  <span class="stat-value">{{ needsController.currentPenaltyRate.toFixed(2) }}/tick</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Last Interaction:</span>
                  <span class="stat-value">{{ formatTimestamp(guineaPig.lastInteraction) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Interactions:</span>
                  <span class="stat-value">{{ guineaPig.totalInteractions }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Net Change per Tick (5s):</span>
                  <span class="stat-value" :class="getNetChangeClass(guineaPig.id)">
                    {{ getNetChange(guineaPig.id) >= 0 ? '+' : '' }}{{ getNetChange(guineaPig.id).toFixed(2) }}
                  </span>
                </div>
              </div>

              <FriendshipProgress
                :friendship="guineaPig.friendship"
                :threshold="85"
                :show-message="true"
              />
            </div>
          </div>

          <!-- Cooldown Status Panel -->
          <div class="panel panel--compact">
            <div class="panel__header">
              <h3>Cooldown Status</h3>
            </div>
            <div class="panel__content">
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Play Cooldown:</span>
                  <span class="stat-value">{{ getPlayCooldownStatus(guineaPig.id) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Social Cooldown:</span>
                  <span class="stat-value">{{ getSocialCooldownStatus(guineaPig.id) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Calculated Play CD:</span>
                  <span class="stat-value">{{ guineaPigStore.calculateInteractionCooldown(guineaPig, 'play') }}s</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Calculated Social CD:</span>
                  <span class="stat-value">{{ guineaPigStore.calculateInteractionCooldown(guineaPig, 'social') }}s</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Debug Controls Panel -->
          <div class="panel panel--compact">
          <div class="panel__header">
            <h3>Debug Controls</h3>
          </div>
          <div class="panel__content">
            <div class="flex flex-col gap-3">
              <SliderField
                v-model="guineaPig.friendship"
                label="Friendship"
                :min="0"
                :max="100"
                :step="1"
              />
              <div class="button-group">
                <Button @click="addFriendship(guineaPig.id, 5)" size="sm">+5 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, 10)" size="sm">+10 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, -5)" variant="danger" size="sm">-5 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, -10)" variant="danger" size="sm">-10 Friendship</Button>
              </div>
              <div class="button-group">
                <Button @click="setFriendship(guineaPig.id, 0)" variant="secondary" size="sm">Set to 0%</Button>
                <Button @click="setFriendship(guineaPig.id, 50)" variant="secondary" size="sm">Set to 50%</Button>
                <Button @click="setFriendship(guineaPig.id, 85)" variant="secondary" size="sm">Set to 85%</Button>
                <Button @click="setFriendship(guineaPig.id, 100)" variant="secondary" size="sm">Set to 100%</Button>
              </div>
              <hr class="divider">
              <Button @click="testPlayInteraction(guineaPig.id)" full-width>Test Play Interaction</Button>
              <Button @click="testSocialInteraction(guineaPig.id)" full-width>Test Social Interaction</Button>
            </div>
          </div>
        </div>
        </div>
          </div>
        </div>

        <!-- Friendship Gains/Losses Legend Panel (Right Column) -->
        <div class="panel panel--compact friendship-debug__legend">
          <div class="panel__header">
            <h3>Friendship Gains/Losses Legend</h3>
          </div>
          <div class="panel__content">
            <div class="friendship-debug__info-section">
              <h5>Active Gains:</h5>
              <ul>
                <li>✅ Passive gain: +0.1 per tick (when wellness &gt; 50%)</li>
                <li>🍎 Feed (normal): +1</li>
                <li>💖 Feed (favorite): +5</li>
                <li>🎮 Play: +3</li>
                <li>🤗 Socialize: +2</li>
                <li>🛁 Clean: +2</li>
                <li>📊 Need fulfillment: +0.5 to +2</li>
              </ul>

              <h5 class="mt-4">Active Losses:</h5>
              <ul>
                <li class="text-danger">⚠️ Very poor care: -2 per tick (when wellness &lt; 30%)</li>
                <li class="text-warning">⚠️ Poor care: -1 per tick (when wellness &lt; 50%)</li>
                <li class="text-danger">⚠️ Critical needs: -0.5 per tick per need (when need &lt; 30%)</li>
              </ul>
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
import { useNeedsController } from '../../../stores/needsController'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import FriendshipProgress from '../../game/ui/FriendshipProgress.vue'
import SliderField from '../../basic/SliderField.vue'
import Button from '../../basic/Button.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()

const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)

const getWellness = (guineaPigId: string): number => {
  return needsController.calculateWellness(guineaPigId)
}

const getCriticalNeedsCount = (guineaPig: GuineaPig): number => {
  return Object.values(guineaPig.needs).filter(value => value < 30).length
}

const getNetChange = (guineaPigId: string): number => {
  let change = 0
  const wellness = getWellness(guineaPigId)
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return 0

  // Passive gain/loss
  if (wellness > 50) {
    change += 0.1
  } else if (wellness < 30) {
    change -= 2
  } else if (wellness < 50) {
    change -= 1
  }

  // Critical needs penalty
  const criticalCount = getCriticalNeedsCount(guineaPig)
  if (criticalCount > 0) {
    change -= 0.5 * criticalCount
  }

  return change
}

const getNetChangeClass = (guineaPigId: string): string => {
  const netChange = getNetChange(guineaPigId)
  if (netChange > 0) return 'text-success'
  if (netChange < 0) return 'text-danger'
  return 'text-muted'
}

const getPlayCooldownStatus = (guineaPigId: string): string => {
  const cooldown = guineaPigStore.checkInteractionCooldown(guineaPigId, 'play')
  if (cooldown.onCooldown) {
    return `⏱️ ${cooldown.remainingSeconds}s remaining`
  }
  return '✅ Ready'
}

const getSocialCooldownStatus = (guineaPigId: string): string => {
  const cooldown = guineaPigStore.checkInteractionCooldown(guineaPigId, 'social')
  if (cooldown.onCooldown) {
    return `⏱️ ${cooldown.remainingSeconds}s remaining`
  }
  return '✅ Ready'
}

const addFriendship = (guineaPigId: string, amount: number) => {
  guineaPigStore.adjustFriendship(guineaPigId, amount)
}

const setFriendship = (guineaPigId: string, value: number) => {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return
  guineaPig.friendship = value
}

const testPlayInteraction = (guineaPigId: string) => {
  guineaPigStore.playWithGuineaPig(guineaPigId, 'general_play')
}

const testSocialInteraction = (guineaPigId: string) => {
  guineaPigStore.socializeWithGuineaPig(guineaPigId)
}

const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return 'Never'
  const now = Date.now()
  const diffMs = now - timestamp
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}
</script>

<style>
.friendship-debug__legend {
  max-inline-size: 100%;
}

@media (min-width: 768px) {
  .friendship-debug__legend {
    max-inline-size: 320px;
  }
}

.friendship-debug__guinea-pigs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.friendship-debug__info-section h5 {
  margin-block-end: var(--space-2);
  color: var(--color-text);
  font-size: 0.95rem;
  font-weight: 600;
}

.friendship-debug__info-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friendship-debug__info-section li {
  padding-inline-start: var(--space-2);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.friendship-debug__net-change {
  display: flex;
  justify-content: center;
  align-items: center;
}

.friendship-debug__net-change-value {
  font-weight: 700;
  font-size: 2rem;
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.text-danger {
  color: var(--color-danger);
}

.text-muted {
  color: var(--color-text-muted);
}

.button-group {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.empty-state {
  padding: var(--space-6);
  text-align: center;
  color: var(--color-text-muted);
}

.mt-4 {
  margin-block-start: var(--space-4);
}
</style>
