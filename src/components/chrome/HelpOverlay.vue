<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="help-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Live Mode help"
      @click="close"
    >
      <div
        class="help-overlay__board"
        :style="{ '--help-accent': topic.accent }"
        @click.stop
      >
        <div class="help-overlay__awning" aria-hidden="true"></div>
        <span class="help-overlay__stud help-overlay__stud--tl" aria-hidden="true"></span>
        <span class="help-overlay__stud help-overlay__stud--tr" aria-hidden="true"></span>
        <span class="help-overlay__stud help-overlay__stud--bl" aria-hidden="true"></span>
        <span class="help-overlay__stud help-overlay__stud--br" aria-hidden="true"></span>

        <!-- Title bar -->
        <div class="help-overlay__titlebar">
          <div class="help-overlay__title">
            <span class="help-overlay__title-icon" aria-hidden="true">📖</span>
            <span>Help — Live Mode</span>
          </div>
          <button class="help-overlay__close" type="button" aria-label="Close help" @click="close">
            ✕ Close
          </button>
        </div>

        <!-- Body: tab rail + content panel -->
        <div class="help-overlay__body">
          <nav class="help-overlay__rail" aria-label="Help topics">
            <button
              v-for="t in HELP_TOPICS"
              :key="t.id"
              class="help-overlay__tab"
              :class="{ 'help-overlay__tab--active': t.id === activeId }"
              :style="{ '--help-accent': t.accent }"
              type="button"
              @click="activeId = t.id"
            >
              <span class="help-overlay__tab-emoji" aria-hidden="true">{{ t.emoji }}</span>
              <span>{{ t.title }}</span>
            </button>
          </nav>

          <section :key="topic.id" class="help-overlay__content">
            <div class="help-overlay__content-head">
              <span class="help-overlay__content-icon" aria-hidden="true">{{ topic.emoji }}</span>
              <h2 class="help-overlay__content-title">{{ topic.title }}</h2>
            </div>

            <div class="help-overlay__blocks">
              <template v-for="(block, i) in topic.body" :key="i">
                <p v-if="block.kind === 'lede'" class="help-overlay__lede">{{ block.text }}</p>

                <h3 v-else-if="block.kind === 'h'" class="help-overlay__h">{{ block.text }}</h3>

                <p v-else-if="block.kind === 'p'" class="help-overlay__p">{{ block.text }}</p>

                <ul v-else-if="block.kind === 'list'" class="help-overlay__list">
                  <li
                    v-for="(it, j) in (block.items as HelpListItem[])"
                    :key="j"
                    class="help-overlay__list-item"
                  >
                    <span class="help-overlay__list-emoji" aria-hidden="true">{{ it.emoji }}</span>
                    <span class="help-overlay__list-label">{{ it.label }}</span>
                    <span class="help-overlay__list-text">{{ it.text }}</span>
                  </li>
                </ul>

                <ol v-else-if="block.kind === 'steps'" class="help-overlay__steps">
                  <li
                    v-for="(text, j) in (block.items as string[])"
                    :key="j"
                    class="help-overlay__step"
                  >
                    <span class="help-overlay__step-num" aria-hidden="true">{{ j + 1 }}</span>
                    <span>{{ text }}</span>
                  </li>
                </ol>

                <div v-else-if="block.kind === 'grid'" class="help-overlay__grid">
                  <div
                    v-for="(it, j) in (block.items as HelpGridItem[])"
                    :key="j"
                    class="help-overlay__grid-item"
                    :style="{ '--help-swatch': it.color }"
                  >
                    <span class="help-overlay__grid-emoji" aria-hidden="true">{{ it.emoji }}</span>
                    <span>{{ it.label }}</span>
                  </div>
                </div>

                <dl v-else-if="block.kind === 'keys'" class="help-overlay__keys">
                  <div
                    v-for="(it, j) in (block.items as HelpKeyItem[])"
                    :key="j"
                    class="help-overlay__key-row"
                  >
                    <dt class="help-overlay__key-combo">
                      <template v-for="(key, k) in it.keys" :key="k">
                        <span v-if="k > 0" class="help-overlay__key-join">{{ it.joiner ?? '' }}</span>
                        <kbd class="help-overlay__kbd">{{ key }}</kbd>
                      </template>
                    </dt>
                    <dd class="help-overlay__key-text">{{ it.text }}</dd>
                  </div>
                </dl>

                <div v-else-if="block.kind === 'tip'" class="help-overlay__tip">
                  <span class="help-overlay__tip-icon" aria-hidden="true">💡</span>
                  <span><span class="help-overlay__tip-label">Tip — </span>{{ block.text }}</span>
                </div>
              </template>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Live Mode help center. Ported from the gps2-design prototype
 * (prototype/HelpOverlay.jsx): a full-screen parchment notice-board with a
 * vertical topic rail on the left and a scrollable content panel on the
 * right, re-tinting its awning to the active topic's accent.
 *
 * Adapted for gps3: needs grid uses the real 10-need set (NEED_META), the
 * actions topic reflects the real FAB menus, and a gps3-only "Controls"
 * topic preserves the camera/keyboard shortcuts the old HelpDialog carried.
 */
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { NEED_META } from './needMeta'

interface HelpListItem { emoji: string; label: string; text: string }
interface HelpGridItem { emoji: string; label: string; color: string }
interface HelpKeyItem { keys: string[]; joiner?: string; text: string }
type HelpItem = HelpListItem | HelpGridItem | HelpKeyItem | string

interface HelpBlock {
  kind: 'lede' | 'h' | 'p' | 'list' | 'steps' | 'grid' | 'keys' | 'tip'
  text?: string
  items?: HelpItem[]
}

interface HelpTopic {
  id: string
  title: string
  emoji: string
  /** CSS color (token) used for the awning stripe, rail marker, and accents */
  accent: string
  body: HelpBlock[]
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// The needs grid mirrors the real 10-need set so it can never drift from the
// pig signs and needs panels.
const NEED_GRID: HelpGridItem[] = Object.values(NEED_META).map((m) => ({
  emoji: m.emoji,
  label: m.label,
  color: m.color
}))

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    emoji: '🏠',
    accent: 'var(--color-pink)',
    body: [
      { kind: 'lede', text: 'Welcome to Live Mode — the cozy playspace where your guinea pigs wander, snack, snooze, and react to everything you do.' },
      { kind: 'h', text: 'What you see on screen' },
      { kind: 'list', items: [
        { emoji: '🐹', label: 'Your guinea pigs', text: 'wander the 3D cage. Click any pig to inspect its needs.' },
        { emoji: '🧺', label: 'Habitat items', text: 'water bottle, hay rack, food bowl, igloo, chew — click them for details and actions.' },
        { emoji: '🎯', label: 'Care actions', text: 'the plaques on the bottom rail: feed, play, care, socialize, and encourage pig-to-pig bonding.' },
        { emoji: '📊', label: 'Top bar', text: 'shows the activity feed, habitat status, per-pig health signs, and inventory.' }
      ] },
      { kind: 'h', text: 'The basic loop' },
      { kind: 'steps', items: [
        'Watch your pigs and their needs.',
        'Use the care actions to feed, play, clean, and pet them.',
        'Refill water and hay from the cage items as they run low.',
        'Buy more supplies from the Supplies Store when stocks dwindle.'
      ] },
      { kind: 'tip', text: 'Hit "Replay Tutorial" in the Debug panel anytime to walk through Live Mode again.' }
    ]
  },
  {
    id: 'guinea-pigs',
    title: 'Your Guinea Pigs',
    emoji: '🐹',
    accent: 'var(--color-pink)',
    body: [
      { kind: 'lede', text: 'Every pig has a personality, a breed, an age, and a unique relationship with you and the other pig.' },
      { kind: 'h', text: 'Inspecting a pig' },
      { kind: 'p', text: "Click any pig in the cage to open its menu, or open its sign on the top bar for the full drawer with profile and needs." },
      { kind: 'h', text: 'The pig signs' },
      { kind: 'p', text: "The pink signs along the top of Live Mode are one per adopted pig. Click a sign to open a drawer with their profile, friendship meter, and pig-to-pig bond." },
      { kind: 'h', text: 'Friendship & bonds' },
      { kind: 'list', items: [
        { emoji: '💖', label: 'Friendship', text: 'how close YOU are with that pig. Grows every time you interact directly (pet, hold, feed).' },
        { emoji: '🤝', label: 'Bonds', text: 'how close two pigs are with each other. Grows when you use the Encourage actions on the pair.' }
      ] },
      { kind: 'tip', text: 'Pigs glow when they are selectable as the target for a pending action.' }
    ]
  },
  {
    id: 'needs',
    title: 'The 10 Needs',
    emoji: '❤️',
    accent: 'var(--color-pink)',
    body: [
      { kind: 'lede', text: 'Every guinea pig tracks ten needs that gradually decay over time. Your job is to keep them topped up.' },
      { kind: 'grid', items: NEED_GRID },
      { kind: 'h', text: 'Reading the bars' },
      { kind: 'list', items: [
        { emoji: '🟢', label: '60–100', text: 'all good. Pig is content.' },
        { emoji: '🟡', label: '20–60', text: 'declining. Address soon.' },
        { emoji: '🔴', label: '0–20', text: 'critical! The pig sign glows red.' }
      ] },
      { kind: 'tip', text: 'Pause time anytime if you want to plan without things ticking down.' }
    ]
  },
  {
    id: 'actions',
    title: 'Care Actions',
    emoji: '🎯',
    accent: 'var(--color-green)',
    body: [
      { kind: 'lede', text: 'The plaques on the bottom rail are your main way to interact with pigs. Each one expands into a menu of options.' },
      { kind: 'list', items: [
        { emoji: '🍎', label: 'Give Food', text: 'offer produce from your inventory. Boosts Hunger.' },
        { emoji: '🎾', label: 'Help Play', text: 'show a toy. Boosts Play.' },
        { emoji: '🧼', label: 'Give Care', text: 'gentle wipe, trim nails, quick or deep clean, refill water, fill hay. Boosts Hygiene, Nails, and cage cleanliness.' },
        { emoji: '🤗', label: 'Socialize', text: 'pet, hold, talk to. Boosts Social & Comfort, raises Friendship with you.' },
        { emoji: '💞', label: 'Encourage', text: 'pig-to-pig only: greet, groom, play together, share food, approach. Builds the bond between the two pigs.' }
      ] },
      { kind: 'h', text: 'How targeting works' },
      { kind: 'steps', items: [
        'Click a plaque to expand its menu.',
        'Pick the specific action (e.g. a food).',
        'If a target is needed, the banner prompts you — click the pig to commit.',
        'Press Esc to cancel a pending action.'
      ] }
    ]
  },
  {
    id: 'items',
    title: 'Habitat Items',
    emoji: '🧺',
    accent: 'var(--color-wood-amber)',
    body: [
      { kind: 'lede', text: 'The cage comes furnished. Click any item to open its parchment popover with details and actions.' },
      { kind: 'list', items: [
        { emoji: '🧴', label: 'Water Bottle', text: 'shows water level. Refill when it gets low to keep Thirst up.' },
        { emoji: '🌾', label: 'Hay Rack', text: 'tracks freshness and serving count. Pigs nibble from here passively.' },
        { emoji: '🧺', label: 'Food Bowl', text: 'holds foods at once. Empty or refill it from the popover.' },
        { emoji: '🏠', label: 'Cozy Igloo', text: 'shelter spot. Pigs nap here when Energy is low.' },
        { emoji: '🌿', label: 'Chew', text: 'durability decays as it gets gnawed on. Keeps the Chew need topped up.' },
        { emoji: '💩', label: 'Droppings', text: 'click to clean instantly. Builds up over time and tanks Cleanliness.' }
      ] },
      { kind: 'tip', text: 'Most popovers include a "Return to Inventory" button so you can swap out worn items.' }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory & Placement',
    emoji: '📦',
    accent: 'var(--color-violet)',
    body: [
      { kind: 'lede', text: "Inventory is the stack of supplies you own but haven't placed in the cage yet. Open it from the top bar." },
      { kind: 'h', text: 'Placing an item' },
      { kind: 'steps', items: [
        'Open Inventory from the top bar.',
        'Find the item you want to place.',
        'Click a tile — you enter placement mode.',
        'Click a spot in the cage to drop it.',
        'Press Esc to cancel placement.'
      ] },
      { kind: 'h', text: 'Returning to inventory' },
      { kind: 'p', text: "Click any item you placed and choose 'Return to Inventory' to take it back. It re-stacks with the same kind." }
    ]
  },
  {
    id: 'supplies',
    title: 'Supplies Store',
    emoji: '🛒',
    accent: 'var(--color-violet)',
    body: [
      { kind: 'lede', text: 'Switch to the Supplies Store tab to buy more food, hay, bedding, and habitat items.' },
      { kind: 'list', items: [
        { emoji: '🪙', label: 'Coins', text: 'earn coins by caring for happy pigs. Your balance is in the top right.' },
        { emoji: '🛍️', label: 'Buy', text: 'purchases land in Inventory. You can place them in the cage afterward.' },
        { emoji: '💰', label: 'Sell', text: 'sells back at a reduced price. Frees up inventory and converts surplus into coins.' }
      ] },
      { kind: 'tip', text: 'Featured items are department picks — they auto-sort into the right inventory category.' }
    ]
  },
  {
    id: 'habitat-status',
    title: 'Habitat Status',
    emoji: '🧹',
    accent: 'var(--color-green)',
    body: [
      { kind: 'lede', text: 'Open the Habitat panel in the top bar to see at-a-glance bars for the cage as a whole.' },
      { kind: 'list', items: [
        { emoji: '💧', label: 'Water Level', text: 'how full the water bottle is. Drops slowly over time.' },
        { emoji: '🌾', label: 'Hay Freshness', text: 'fresh hay is more nutritious. Empty and refill from the rack.' },
        { emoji: '💩', label: 'Poop Cleanliness', text: '100 = no droppings. Click poops in the cage to clean.' },
        { emoji: '🛏️', label: 'Bedding Cleanliness', text: 'replace bedding from the inventory before it bottoms out.' },
        { emoji: '✨', label: 'Overall Cleanliness', text: 'the combined cage cleanliness — affects Hygiene for everyone.' }
      ] }
    ]
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    emoji: '📜',
    accent: 'var(--color-sky)',
    body: [
      { kind: 'lede', text: 'A running log of everything that happens in the habitat — what you do, what the pigs say, and system events.' },
      { kind: 'h', text: 'Entry categories' },
      { kind: 'list', items: [
        { emoji: '👋', label: 'Player', text: "things YOU did: 'Gave Pickle: Carrot'." },
        { emoji: '✨', label: 'Reaction', text: "what the pigs say back: 'Pickle: Wheek! I love this!'." },
        { emoji: '⚙️', label: 'System', text: "events: welcomes home, purchases, sales." }
      ] },
      { kind: 'tip', text: "Open the feed from the top bar's leftmost sign. Latest activity is at the top." }
    ]
  },
  {
    id: 'pause-time',
    title: 'Pause & Time',
    emoji: '⏸️',
    accent: 'var(--color-green)',
    body: [
      { kind: 'lede', text: "Time passes in Live Mode whether you're watching or not. Needs decay, hay goes stale, poops appear." },
      { kind: 'h', text: 'The Pause button' },
      { kind: 'p', text: 'In the top right of the header. It reads ▶ Resume while paused and ⏸ Pause while playing. Live Mode always starts paused when you arrive.' },
      { kind: 'h', text: 'What pause freezes' },
      { kind: 'list', items: [
        { emoji: '🐹', label: 'Pig movement', text: 'pigs stop wandering the cage.' },
        { emoji: '📉', label: 'Needs decay', text: 'all needs and habitat status bars hold steady.' },
        { emoji: '💭', label: 'Idle bubbles', text: 'pigs stop saying things on their own.' }
      ] },
      { kind: 'tip', text: 'Pausing is a great time to read this Help center, plan your next move, or take a screenshot.' }
    ]
  },
  {
    id: 'controls',
    title: 'Controls',
    emoji: '⌨️',
    accent: 'var(--color-wood-amber)',
    body: [
      { kind: 'lede', text: 'Live Mode is a 3D scene. Move the camera, control a pig directly, and manage the game with mouse and keyboard.' },
      { kind: 'h', text: 'Camera' },
      { kind: 'keys', items: [
        { keys: ['W', 'A', 'S', 'D'], text: 'Pan the camera' },
        { keys: ['Arrows'], text: 'Pan the camera (when not controlling a pig)' },
        { keys: ['Q', 'E'], text: 'Rotate the view' },
        { keys: ['Drag'], text: 'Rotate the view' },
        { keys: ['Shift', 'Drag'], joiner: '+', text: 'Pan the camera' },
        { keys: ['Scroll'], text: 'Zoom in / out' },
        { keys: ['Z', 'X'], text: 'Zoom in / out' },
        { keys: ['R'], text: 'Reset the camera' }
      ] },
      { kind: 'h', text: 'Controlling a guinea pig' },
      { kind: 'keys', items: [
        { keys: ['Click'], text: 'Select a pig & open its menu' },
        { keys: ['Take Control'], text: 'Drive the selected pig' },
        { keys: ['Arrows'], text: 'Move the pig (while controlling)' },
        { keys: ['Click'], text: 'Ground: walk the pig there' },
        { keys: ['Esc'], text: 'Release control' }
      ] },
      { kind: 'h', text: 'Game' },
      { kind: 'keys', items: [
        { keys: ['Space'], text: 'Pause / Resume (with dialog)' },
        { keys: ['Shift', 'Space'], joiner: '+', text: 'Pause / Resume (silent)' },
        { keys: ['Esc'], text: 'Cancel a pending action or placement' }
      ] }
    ]
  }
]

const activeId = ref(HELP_TOPICS[0].id)

const topic = computed<HelpTopic>(
  () => HELP_TOPICS.find((t) => t.id === activeId.value) ?? HELP_TOPICS[0]
)

// Reset to the first topic each time the overlay opens.
watch(
  () => props.modelValue,
  (open) => {
    if (open) activeId.value = HELP_TOPICS[0].id
  }
)

function close() {
  emit('update:modelValue', false)
}

function onKeydown(e: KeyboardEvent) {
  if (props.modelValue && e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
