<template>
  <div class="sanctuary-debug">
    <!-- Sanctuary Confirmation Dialog -->
    <ConfirmDialog
      v-model="showSanctuaryDialog"
      title="Move to Stardust Sanctuary?"
      confirm-text="Move to Sanctuary"
      cancel-text="Cancel"
      @confirm="confirmMoveToSanctuary"
      @cancel="cancelMoveToSanctuary"
    >
      <p v-if="selectedGuineaPigForSanctuary">
        <span class="sanctuary-dialog__names">{{ sanctuaryDialogNames }}</span> will be moved to Stardust Sanctuary together.
      </p>
      <div class="sanctuary-dialog__info">
        <p class="sanctuary-dialog__info-text">While in sanctuary:</p>
        <ul class="sanctuary-dialog__list">
          <li>✨ Both guinea pigs will stay until you bring out a new pair</li>
          <li>💖 Their friendship will be frozen at the current level</li>
          <li>💯 Their needs will be reset to 100%</li>
          <li>🏠 The habitat will be reset and cleaned</li>
        </ul>
      </div>
    </ConfirmDialog>

    <DebugPanelRow :columns="3">
      <!-- Active Guinea Pigs Section -->
      <DebugPanel
        title="🐹 Active Guinea Pigs"
        :anchor="`${activeGuineaPigs.length}/2 active`"
      >
        <p v-if="activeGuineaPigs.length === 0" class="sanctuary-debug__empty">
          No guinea pigs in game. Start a game in the Game Controller view to see Stardust Sanctuary data.
        </p>
        <div v-else class="sanctuary-debug__guinea-pig-list">
          <div
            v-for="guineaPig in activeGuineaPigs"
            :key="guineaPig.id"
            class="sanctuary-debug__guinea-pig-card"
          >
            <div class="sanctuary-debug__guinea-pig-header">
              <h4>{{ guineaPig.name }}</h4>
              <DebugBadge variant="info">Active</DebugBadge>
            </div>
            <div class="sanctuary-debug__guinea-pig-info">
              <span>{{ guineaPig.breed }} • {{ guineaPig.gender }}</span>
            </div>
            <FriendshipProgress
              :friendship="guineaPig.friendship"
              :threshold="85"
              :show-message="true"
            />
            <div class="btn-row sanctuary-debug__actions">
              <Button
                @click="handleMoveToSanctuary(guineaPig.id)"
                :disabled="guineaPig.friendship < 85"
                full-width
                size="sm"
                :tooltip="guineaPig.friendship < 85 ? `Need ${Math.ceil(85 - guineaPig.friendship)}% more friendship` : 'Move to Stardust Sanctuary'"
              >
                ✨ Move to Sanctuary
              </Button>
            </div>
          </div>
        </div>
      </DebugPanel>

      <!-- Stardust Sanctuary Section -->
      <DebugPanel
        title="✨ Stardust Sanctuary"
        accent="var(--color-pink-500)"
      >
        <template #header-extra>
          <span class="dbg-anchor">{{ petStoreManager.sanctuaryCount }}/{{ petStoreManager.maxSanctuarySlots }} resting</span>
          <InfoButton
            message="Reach 85% friendship with a guinea pig to unlock Stardust Sanctuary. Guinea pigs in the Sanctuary have their friendship frozen at 100% wellness and can be brought back as companions at any time."
            position="bottom"
          />
        </template>
        <p v-if="petStoreManager.sanctuaryCount === 0" class="sanctuary-debug__empty">
          No guinea pigs in Stardust Sanctuary yet. Build friendship to 85% to unlock!
        </p>
        <div v-else class="sanctuary-debug__guinea-pig-list">
          <div
            v-for="guineaPig in petStoreManager.sanctuaryGuineaPigs"
            :key="guineaPig.id"
            class="sanctuary-debug__guinea-pig-card sanctuary-debug__guinea-pig-card--sanctuary"
          >
            <div class="sanctuary-debug__guinea-pig-header">
              <h4>{{ guineaPig.name }}</h4>
              <DebugBadge variant="ok">Sanctuary</DebugBadge>
            </div>
            <div class="sanctuary-debug__guinea-pig-info">
              <span>{{ guineaPig.breed }} • {{ guineaPig.gender }}</span>
            </div>
            <div class="sanctuary-debug__friendship-frozen">
              <span class="sanctuary-debug__friendship-value">💖 {{ Math.round(guineaPig.friendship) }}%</span>
              <span class="sanctuary-debug__friendship-label">Friendship Frozen</span>
            </div>
            <div class="btn-row sanctuary-debug__actions">
              <Button
                @click="handleMoveFromSanctuary(guineaPig.id)"
                :disabled="activeGuineaPigs.length >= 2"
                full-width
                size="sm"
                variant="secondary"
                :tooltip="activeGuineaPigs.length >= 2 ? 'Deactivate a guinea pig first' : 'Activate from Sanctuary'"
              >
                💚 Activate
              </Button>
            </div>
          </div>
        </div>
      </DebugPanel>

      <!-- Sanctuary Slots Section -->
      <DebugPanel title="📊 Sanctuary Capacity" anchor="read-only">
        <div class="stats-grid">
          <DebugStatRow label="Total Slots" :value="petStoreManager.maxSanctuarySlots" />
          <DebugStatRow label="Used Slots" :value="petStoreManager.sanctuaryCount" />
          <DebugStatRow label="Available Slots" :value="petStoreManager.availableSanctuarySlots" />
        </div>
        <BlockMessage variant="info" class="sanctuary-debug__note">
          <p>Guinea pigs in Stardust Sanctuary:</p>
          <ul>
            <li>✨ Have their friendship frozen at current level</li>
            <li>💯 Have all needs reset to 100%</li>
            <li>💚 Can be reactivated at any time</li>
            <li>🔒 Are permanently adopted (never returned)</li>
          </ul>
        </BlockMessage>
      </DebugPanel>
    </DebugPanelRow>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useGuineaPigStore } from '../../../stores/guineaPigStore'
import FriendshipProgress from '../../game/ui/FriendshipProgress.vue'
import Button from '../../basic/Button.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import InfoButton from '../../basic/InfoButton.vue'
import ConfirmDialog from '../../basic/dialogs/ConfirmDialog.vue'
import DebugPanel from '../ui/DebugPanel.vue'
import DebugPanelRow from '../ui/DebugPanelRow.vue'
import DebugStatRow from '../ui/DebugStatRow.vue'
import DebugBadge from '../ui/DebugBadge.vue'

const petStoreManager = usePetStoreManager()
const guineaPigStore = useGuineaPigStore()

const showSanctuaryDialog = ref(false)
const selectedGuineaPigForSanctuary = ref<string | null>(null)

const activeGuineaPigs = computed(() => {
  return guineaPigStore.activeGuineaPigs
})

const sanctuaryDialogNames = computed(() => {
  if (!selectedGuineaPigForSanctuary.value) return ''

  const guineaPig = guineaPigStore.collection.guineaPigs[selectedGuineaPigForSanctuary.value]
  if (!guineaPig) return ''

  // Find cagemate (the other active guinea pig)
  const cagemate = activeGuineaPigs.value.find(gp => gp.id !== selectedGuineaPigForSanctuary.value)

  if (cagemate) {
    return `${guineaPig.name} and ${cagemate.name}`
  }

  return guineaPig.name
})

const handleMoveToSanctuary = (guineaPigId: string) => {
  selectedGuineaPigForSanctuary.value = guineaPigId
  showSanctuaryDialog.value = true
}

const confirmMoveToSanctuary = () => {
  if (selectedGuineaPigForSanctuary.value) {
    petStoreManager.moveToSanctuary(selectedGuineaPigForSanctuary.value)
  }
  selectedGuineaPigForSanctuary.value = null
}

const cancelMoveToSanctuary = () => {
  selectedGuineaPigForSanctuary.value = null
}

const handleMoveFromSanctuary = (guineaPigId: string) => {
  petStoreManager.moveFromSanctuary(guineaPigId)
}
</script>

<style>
.sanctuary-debug__guinea-pig-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.sanctuary-debug__guinea-pig-card {
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.sanctuary-debug__guinea-pig-card--sanctuary {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: var(--color-primary);
}

.sanctuary-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sanctuary-debug__guinea-pig-header h4 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
}

.sanctuary-debug__guinea-pig-info {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.sanctuary-debug__friendship-frozen {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.sanctuary-debug__friendship-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
  font-family: var(--font-family-stats);
}

.sanctuary-debug__friendship-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.sanctuary-debug__empty {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  margin-block: var(--space-4);
  font-size: var(--font-size-sm);
}

.sanctuary-debug__note {
  margin-block-start: var(--space-4);
}

/* Sanctuary Dialog Styles */
.sanctuary-dialog__names {
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.sanctuary-dialog__info {
  margin-block-start: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.sanctuary-dialog__info-text {
  margin: 0;
  margin-block-end: var(--space-3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.sanctuary-dialog__list {
  margin: 0;
  padding-inline-start: var(--space-5);
  list-style-type: none;
}

.sanctuary-dialog__list li {
  position: relative;
  padding-inline-start: var(--space-2);
  margin-block-end: var(--space-2);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}

.sanctuary-dialog__list li:last-child {
  margin-block-end: 0;
}
</style>
