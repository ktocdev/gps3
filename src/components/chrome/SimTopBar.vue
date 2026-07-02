<template>
  <div ref="rootRef" class="sim-topbar wood-bar">
    <div class="wood-bar__grain" aria-hidden="true"></div>
    <span class="wood-bar__rivet sim-topbar__rivet--tl" aria-hidden="true"></span>
    <span class="wood-bar__rivet sim-topbar__rivet--tr" aria-hidden="true"></span>
    <span class="wood-bar__rivet sim-topbar__rivet--bl" aria-hidden="true"></span>
    <span class="wood-bar__rivet sim-topbar__rivet--br" aria-hidden="true"></span>

    <!-- LEFT: Activity -->
    <div class="sim-topbar__slot">
      <SignPill
        icon="📓"
        label="Activity"
        accent="var(--color-gold)"
        accent-deep="var(--color-wood-amber)"
        :badge="activityCount"
        badge-color="var(--color-violet-mid)"
        :active="openPanel === 'activity'"
        :tilt="-1"
        @click="togglePanel('activity')"
      />
      <PillDropdown
        v-if="openPanel === 'activity'"
        side="left"
        accent="var(--color-gold)"
        show-grain
        icon="📓"
        title="Activity"
      >
        <ActivityFeedPanel />
      </PillDropdown>
    </div>

    <!-- CENTER: Habitat + per-pig pills -->
    <div class="sim-topbar__center">
      <div class="sim-topbar__slot">
        <SignPill
          icon="🏠"
          label="Habitat"
          accent="var(--color-ivy)"
          accent-deep="var(--color-green)"
          :active="openPanel === 'habitat'"
          :tilt="0.6"
          @click="togglePanel('habitat')"
        >
          <template #suffix>
            <span class="sign-pill__chip" :style="{ '--chip-color': cleanlinessColor }">
              {{ Math.round(habitatConditions.cleanliness) }}%
            </span>
          </template>
        </SignPill>
        <PillDropdown
          v-if="openPanel === 'habitat'"
          side="center"
          width="380px"
          accent="var(--color-ivy)"
          show-grain
        >
          <HabitatStatusPanel />
        </PillDropdown>
      </div>

      <div
        v-for="(pig, i) in guineaPigStore.activeGuineaPigs"
        :key="pig.id"
        class="sim-topbar__slot"
      >
        <SignPill
          :label="pig.name"
          accent="var(--color-pink)"
          accent-deep="var(--color-pink-deep)"
          :active="openPanel === pig.id"
          :tilt="i % 2 === 0 ? -0.5 : 0.5"
          @click="togglePanel(pig.id)"
        >
          <template #icon>
            <span class="sign-pill__portrait">🐹</span>
          </template>
          <template #suffix>
            <span v-if="health(pig).status === 'ok'" class="sign-pill__dot"></span>
            <span
              v-else
              class="sign-pill__chip"
              :style="{ '--chip-color': health(pig).status === 'critical' ? 'var(--color-red-500)' : 'var(--color-gold-500)' }"
            >
              {{ worstNeedEmoji(pig) }} {{ health(pig).count }}
            </span>
          </template>
        </SignPill>
        <PillDropdown
          v-if="openPanel === pig.id"
          side="center"
          width="380px"
          accent="var(--color-pink)"
          no-padding
          flex-col
        >
          <PigDrawer :guinea-pig="pig" />
        </PillDropdown>
      </div>
    </div>

    <!-- RIGHT: Inventory -->
    <div class="sim-topbar__slot">
      <SignPill
        icon="🎒"
        label="Inventory"
        accent="var(--color-violet)"
        accent-deep="var(--color-violet-deep)"
        :active="openPanel === 'inventory'"
        :tilt="1"
        @click="togglePanel('inventory')"
      />
      <PillDropdown
        v-if="openPanel === 'inventory'"
        side="right"
        width="400px"
        accent="var(--color-violet)"
        show-grain
        icon="🎒"
        title="Inventory"
      >
        <InventoryPanel
          ref="inventoryPanelRef"
          @select="onInventorySelect"
          @deselect="emit('deselect-inventory-item')"
        />
      </PillDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SignPill from './SignPill.vue'
import PillDropdown from './PillDropdown.vue'
import ActivityFeedPanel from './ActivityFeedPanel.vue'
import HabitatStatusPanel from './HabitatStatusPanel.vue'
import InventoryPanel from './InventoryPanel.vue'
import PigDrawer from './PigDrawer.vue'
import { pigHealth, NEED_META } from './needMeta'
import { useGuineaPigStore, type GuineaPig } from '../../stores/guineaPigStore'
import { useHabitatConditions } from '../../stores/habitatConditions'
import { useLoggingStore } from '../../stores/loggingStore'

const emit = defineEmits<{
  'select-inventory-item': [itemId: string]
  'deselect-inventory-item': []
}>()

const guineaPigStore = useGuineaPigStore()
const habitatConditions = useHabitatConditions()
const loggingStore = useLoggingStore()

const rootRef = ref<HTMLElement | null>(null)
const inventoryPanelRef = ref<InstanceType<typeof InventoryPanel> | null>(null)

// One dropdown open at a time: 'activity' | 'habitat' | 'inventory' | <pigId>
const openPanel = ref<string | null>(null)

// When mousedown closes a panel, remember which one so the subsequent
// click event on the same pill doesn't immediately reopen it.
let closedByMousedown: string | null = null

function togglePanel(id: string) {
  const suppress = closedByMousedown
  closedByMousedown = null
  if (suppress === id) return
  openPanel.value = openPanel.value === id ? null : id
}

const activityCount = computed(() => loggingStore.activityMessages.length)

const cleanlinessColor = computed(() => {
  const dirty = 100 - habitatConditions.cleanliness
  if (dirty > 60) return 'var(--color-red-500)'
  if (dirty > 30) return 'var(--color-gold-500)'
  return 'var(--color-green)'
})

function health(pig: GuineaPig) {
  return pigHealth(pig.needs)
}

function worstNeedEmoji(pig: GuineaPig): string {
  const worst = pigHealth(pig.needs).worstNeed
  return worst ? NEED_META[worst].emoji : ''
}

// Close the open dropdown on any mousedown that doesn't land inside it.
// Keeps the panel open only when interacting with its own content ([data-sim-panel]).
// Clicks on the bar background, rivets, or other pills all dismiss.
// Must NOT stopPropagation — the same click still raycasts into the canvas.
function onDocumentMouseDown(e: MouseEvent) {
  if (!openPanel.value) return
  const target = e.target as HTMLElement
  if (target.closest?.('[data-sim-panel]')) return
  closedByMousedown = openPanel.value
  openPanel.value = null
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown)
})

function onInventorySelect(itemId: string) {
  emit('select-inventory-item', itemId)
  // Close the dropdown so the player can see the scene to place/fill
  openPanel.value = null
}

defineExpose({
  clearInventorySelection: () => inventoryPanelRef.value?.clearSelection()
})
</script>
