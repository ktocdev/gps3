<template>
  <div class="friendship-debug">
    <DebugPanel
      v-if="activeGuineaPigs.length === 0"
      title="💖 Friendship"
      anchor="no active game"
      accent="var(--color-pink-500)"
    >
      <p class="text-label text-label--muted">No guinea pigs in game</p>
      <p class="text-label--small">Start a game in the Game Controller view to see friendship data.</p>
    </DebugPanel>

    <div v-else class="friendship-debug__layout">
      <div class="friendship-debug__guinea-pigs">
        <DebugPanel
          v-for="guineaPig in activeGuineaPigs"
          :key="guineaPig.id"
          :title="`💖 Friendship · ${guineaPig.name}`"
          :anchor="guineaPig.id"
          accent="var(--color-pink-500)"
          class="friendship-debug__guinea-pig"
        >
          <DebugSlider
            :model-value="Math.round(guineaPig.friendship)"
            label="Friendship Level"
            :min="0"
            :max="100"
            :step="1"
            accent="var(--color-pink-500)"
            @update:model-value="value => setFriendship(guineaPig.id, value)"
          />

          <div class="friendship-debug__tier-row">
            <span class="friendship-debug__tier-label">Relationship tier</span>
            <DebugBadge :variant="getFriendshipTier(guineaPig.friendship).variant">
              {{ getFriendshipTier(guineaPig.friendship).label }}
            </DebugBadge>
          </div>

          <div class="friendship-debug__progress">
            <FriendshipProgress
              :friendship="guineaPig.friendship"
              :threshold="85"
              :show-message="true"
            />
          </div>

          <DebugSection title="Interaction Effects">
            <div class="friendship-debug__controls">
              <div class="btn-row">
                <Button @click="addFriendship(guineaPig.id, 5)" variant="secondary" size="sm">+5 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, 10)" variant="secondary" size="sm">+10 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, -5)" variant="danger" size="sm">-5 Friendship</Button>
                <Button @click="addFriendship(guineaPig.id, -10)" variant="danger" size="sm">-10 Friendship</Button>
              </div>
              <div class="btn-row">
                <Button @click="setFriendship(guineaPig.id, 0)" variant="secondary" size="sm">Set to 0%</Button>
                <Button @click="setFriendship(guineaPig.id, 50)" variant="secondary" size="sm">Set to 50%</Button>
                <Button @click="setFriendship(guineaPig.id, 85)" variant="secondary" size="sm">Set to 85%</Button>
                <Button @click="setFriendship(guineaPig.id, 100)" variant="secondary" size="sm">Set to 100%</Button>
              </div>
            </div>
          </DebugSection>

          <!-- Player Interactions — same real action + feedback pattern as
               Social Bonding's Pair Interactions, but user-to-pig -->
          <DebugSection title="Player Interactions">
            <div class="btn-row">
              <Button
                @click="triggerPlay(guineaPig.id)"
                size="sm"
                variant="secondary"
                :disabled="isOnCooldown(guineaPig.id, 'play')"
                :tooltip="isOnCooldown(guineaPig.id, 'play') ? getPlayCooldownStatus(guineaPig.id) : ''"
              >🎮 Play</Button>
              <Button
                @click="triggerSocial(guineaPig.id)"
                size="sm"
                variant="secondary"
                :disabled="isOnCooldown(guineaPig.id, 'social')"
                :tooltip="isOnCooldown(guineaPig.id, 'social') ? getSocialCooldownStatus(guineaPig.id) : ''"
              >🤗 Social</Button>
            </div>
            <p
              v-if="interactionResults[guineaPig.id]"
              class="text-label--small"
              :class="interactionResults[guineaPig.id]!.success ? 'friendship-debug__result--success' : 'friendship-debug__result--fail'"
            >
              {{ interactionResults[guineaPig.id]!.message }}
            </p>
          </DebugSection>

          <DebugSection title="Telemetry">
            <div class="stats-grid">
              <DebugStatRow label="Friendship" :value="`${Math.round(guineaPig.friendship)}%`" />
              <DebugStatRow label="Wellness" :value="`${Math.round(getWellness(guineaPig.id))}%`" />
              <div class="stat-item">
                <span class="stat-label">Penalty Active</span>
                <DebugBadge :variant="needsController.isPenaltyActive ? 'err' : 'ok'">
                  {{ needsController.isPenaltyActive ? 'Yes' : 'No' }}
                </DebugBadge>
              </div>
              <DebugStatRow label="Penalty Rate" :value="`${needsController.currentPenaltyRate.toFixed(2)}/tick`" />
              <DebugStatRow
                label="Last Interaction"
                :value="formatTimestamp(guineaPig.lastInteraction)"
                :muted="!guineaPig.lastInteraction"
              />
              <DebugStatRow label="Total Interactions" :value="guineaPig.totalInteractions" />
              <div class="stat-item">
                <span class="stat-label">Net Change per Tick (5s)</span>
                <DebugBadge :variant="getNetChangeVariant(guineaPig.id)">
                  {{ getNetChange(guineaPig.id) >= 0 ? '+' : '' }}{{ getNetChange(guineaPig.id).toFixed(2) }}
                </DebugBadge>
              </div>
            </div>
          </DebugSection>

          <DebugSection title="Cooldowns">
            <div class="stats-grid">
              <DebugStatRow label="Play Cooldown" :value="getPlayCooldownStatus(guineaPig.id)" />
              <DebugStatRow label="Social Cooldown" :value="getSocialCooldownStatus(guineaPig.id)" />
              <DebugStatRow
                label="Calculated Play CD"
                :value="`${guineaPigStore.calculateInteractionCooldown(guineaPig, 'play')}s`"
              />
              <DebugStatRow
                label="Calculated Social CD"
                :value="`${guineaPigStore.calculateInteractionCooldown(guineaPig, 'social')}s`"
              />
            </div>
          </DebugSection>
        </DebugPanel>
      </div>

      <!-- Friendship Gains/Losses Legend (Right Column) -->
      <DebugPanel
        class="friendship-debug__legend"
        title="📖 Friendship Gains/Losses"
        anchor="legend"
      >
        <DebugSection title="Active Gains">
          <ul class="friendship-debug__legend-list">
            <li class="friendship-debug__legend-item">✅ Passive gain: +0.1 per tick (when wellness &gt; 50%)</li>
            <li class="friendship-debug__legend-item">🍎 Feed (normal): +1</li>
            <li class="friendship-debug__legend-item">💖 Feed (favorite): +5</li>
            <li class="friendship-debug__legend-item">🎮 Play: +3</li>
            <li class="friendship-debug__legend-item">🤗 Socialize: +2</li>
            <li class="friendship-debug__legend-item">🛁 Clean: +2</li>
            <li class="friendship-debug__legend-item">📊 Need fulfillment: +0.5 to +2</li>
          </ul>
        </DebugSection>

        <DebugSection title="Active Losses">
          <ul class="friendship-debug__legend-list">
            <li class="friendship-debug__legend-item friendship-debug__legend-item--danger">⚠️ Very poor care: -2 per tick (when wellness &lt; 30%)</li>
            <li class="friendship-debug__legend-item friendship-debug__legend-item--warning">⚠️ Poor care: -1 per tick (when wellness &lt; 50%)</li>
            <li class="friendship-debug__legend-item friendship-debug__legend-item--danger">⚠️ Critical needs: -0.5 per tick per need (when need &lt; 30%)</li>
          </ul>
        </DebugSection>
      </DebugPanel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import { useNeedsController } from '../../../stores/needsController'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import FriendshipProgress from '../../game/ui/FriendshipProgress.vue'
import Button from '../../basic/Button.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import DebugBadge from '../ui/DebugBadge.vue'

const guineaPigStore = useGuineaPigStore()
const needsController = useNeedsController()

const activeGuineaPigs = computed(() => guineaPigStore.activeGuineaPigs)

type BadgeVariant = 'ok' | 'warn' | 'err' | 'info'

const getFriendshipTier = (friendship: number): { label: string; variant: BadgeVariant } => {
  if (friendship >= 80) return { label: 'Devoted', variant: 'ok' }
  if (friendship >= 60) return { label: 'Friends', variant: 'info' }
  if (friendship >= 30) return { label: 'Acquainted', variant: 'warn' }
  return { label: 'Wary', variant: 'err' }
}

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

const getNetChangeVariant = (guineaPigId: string): BadgeVariant => {
  const netChange = getNetChange(guineaPigId)
  if (netChange > 0) return 'ok'
  if (netChange < 0) return 'err'
  return 'info'
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

const isOnCooldown = (guineaPigId: string, type: 'play' | 'social'): boolean => {
  return guineaPigStore.checkInteractionCooldown(guineaPigId, type).onCooldown
}

interface InteractionResult {
  success: boolean
  message: string
}

const interactionResults = reactive<Record<string, InteractionResult>>({})

const triggerPlay = (guineaPigId: string) => {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  const before = guineaPig.friendship
  const success = guineaPigStore.playWithGuineaPig(guineaPigId, 'general_play')
  const delta = guineaPig.friendship - before

  interactionResults[guineaPigId] = success
    ? { success: true, message: `✅ Play succeeded — friendship +${delta.toFixed(1)}.` }
    : { success: false, message: `❌ Play failed — ${getPlayCooldownStatus(guineaPigId)}` }
}

const triggerSocial = (guineaPigId: string) => {
  const guineaPig = guineaPigStore.getGuineaPig(guineaPigId)
  if (!guineaPig) return

  const before = guineaPig.friendship
  const success = guineaPigStore.socializeWithGuineaPig(guineaPigId)
  const delta = guineaPig.friendship - before

  interactionResults[guineaPigId] = success
    ? { success: true, message: `✅ Social succeeded — friendship +${delta.toFixed(1)}.` }
    : { success: false, message: `❌ Social failed — ${getSocialCooldownStatus(guineaPigId)}` }
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
.friendship-debug__layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-4);
}

.friendship-debug__guinea-pigs {
  flex: 1;
  min-inline-size: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-4);
}

.friendship-debug__guinea-pig {
  flex: 1 1 320px;
  min-inline-size: 0;
}

.friendship-debug__legend {
  flex: 1 1 100%;
}

@media (min-width: 768px) {
  .friendship-debug__legend {
    flex: 0 0 320px;
  }
}

.friendship-debug__tier-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-block: var(--space-3);
}

.friendship-debug__tier-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.friendship-debug__progress {
  margin-block-end: var(--space-4);
}

.friendship-debug__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friendship-debug__result--success {
  margin-block-start: var(--space-2);
  color: var(--color-success);
}

.friendship-debug__result--fail {
  margin-block-start: var(--space-2);
  color: var(--color-error);
}

.friendship-debug__legend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.friendship-debug__legend-item {
  padding-inline-start: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}

.friendship-debug__legend-item--warning {
  color: var(--color-warning);
}

.friendship-debug__legend-item--danger {
  color: var(--color-error);
}
</style>
