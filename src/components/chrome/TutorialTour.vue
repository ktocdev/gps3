<template>
  <Teleport to="body">
    <div class="tutorial-overlay" data-tutorial-overlay="1">
      <!-- Dim layers: four panels around the spotlight hole, or a single
           full overlay on centered intro/outro steps -->
      <template v-if="hole">
        <div
          v-for="(dimStyle, i) in dimStyles"
          :key="i"
          class="tutorial-overlay__dim"
          :class="{ 'tutorial-overlay__dim--through': step.allowClicksThrough }"
          :style="dimStyle"
        ></div>
      </template>
      <div
        v-else
        class="tutorial-overlay__dim"
        :class="{ 'tutorial-overlay__dim--through': step.allowClicksThrough }"
        :style="{ top: '0', left: '0', right: '0', bottom: '0' }"
      ></div>

      <!-- Pulsing ring around the spotlighted element -->
      <div
        v-if="hole"
        class="tutorial-overlay__ring"
        :style="{
          top: `${hole.top}px`,
          left: `${hole.left}px`,
          width: `${hole.width}px`,
          height: `${hole.height}px`
        }"
      ></div>

      <!-- Step card -->
      <div
        :key="step.id"
        class="tutorial-card parchment-panel parchment-panel--animate"
        :style="{
          top: `${cardPos.top}px`,
          left: `${cardPos.left}px`,
          '--accent': isPigVoice ? 'var(--color-pink)' : 'var(--color-gold)'
        }"
      >
        <div class="parchment-panel__awning" aria-hidden="true"></div>
        <span class="parchment-panel__stud parchment-panel__stud--tl" aria-hidden="true"></span>
        <span class="parchment-panel__stud parchment-panel__stud--tr" aria-hidden="true"></span>
        <span class="parchment-panel__stud parchment-panel__stud--bl" aria-hidden="true"></span>
        <span class="parchment-panel__stud parchment-panel__stud--br" aria-hidden="true"></span>
        <div class="parchment-panel__grain" aria-hidden="true"></div>

        <button
          class="tutorial-card__skip-tour"
          type="button"
          title="Skip whole tour"
          aria-label="Skip tour"
          @click="close"
        >✕</button>

        <div class="tutorial-card__body">
          <div class="tutorial-card__counter">
            <span class="tutorial-card__counter-chip">
              <span>{{ tutorial.stepIndex + 1 }}</span>
              <span class="tutorial-card__counter-sep">/</span>
              <span class="tutorial-card__counter-total">{{ steps.length }}</span>
            </span>
          </div>

          <div class="tutorial-card__header">
            <div v-if="isPigVoice" class="tutorial-card__pig" aria-hidden="true">
              <span class="tutorial-card__pig-face">🐹</span>
              <span class="tutorial-card__sparkle">✨</span>
            </div>
            <h2 class="tutorial-card__title">{{ step.title }}</h2>
          </div>

          <p class="tutorial-card__text" :class="{ 'tutorial-card__text--pig': isPigVoice }">
            {{ step.body }}
          </p>

          <div v-if="step.hint" class="tutorial-card__hint">
            <span aria-hidden="true">👉</span>
            <span>{{ step.hint }}</span>
          </div>

          <div class="tutorial-card__dots" aria-hidden="true">
            <span
              v-for="(s, i) in steps"
              :key="s.id"
              class="tutorial-card__dot"
              :class="{
                'tutorial-card__dot--active': i === tutorial.stepIndex,
                'tutorial-card__dot--done': i < tutorial.stepIndex
              }"
            ></span>
          </div>

          <div class="tutorial-card__controls">
            <button
              class="tutorial-card__btn"
              type="button"
              :disabled="tutorial.stepIndex === 0"
              @click="back"
            >← Back</button>
            <button
              v-if="!isLast && tutorial.stepIndex !== 0"
              class="tutorial-card__skip-step"
              type="button"
              @click="next"
            >Skip this step</button>
            <button
              class="tutorial-card__btn tutorial-card__btn--next"
              type="button"
              @click="next"
            >{{ step.nextLabel || (isLast ? 'Done' : 'Next →') }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * First-run guided tour for Live Mode. Ported from the gps2-design prototype
 * (prototype/Tutorial.jsx).
 *
 * A target element marked with [data-tutorial="..."] is spotlighted: four dim
 * panels surround it leaving a hole, ringed with a pulsing amber border.
 * Clicks pass through the hole to the real UI. Interactive steps advance when
 * the spotlighted element (or a specific descendant) is clicked; the Next
 * button is always the fallback. Steps can auto-open chrome panels via the
 * handlers components register on tutorialStore.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useTutorialStore } from '../../stores/tutorialStore'

interface TutorialStep {
  id: string
  /** 'pig' steps show the guide-pig narrator and italic text */
  voice: 'pig' | 'system'
  title: string
  body: string
  /** [data-tutorial] key of the element to spotlight; none = centered card */
  target?: string
  /** Panel-handler key to open on step enter and close on step leave */
  autoOpen?: string
  /** Flip the pig drawer to this tab on step enter */
  setTab?: 'info' | 'needs'
  hint?: string
  /** Any click inside the target advances the tour */
  advanceOnTargetClick?: boolean
  /** Only clicks matching this selector advance (e.g. a specific tab) */
  advanceOnSelector?: string
  /** Dim stays visual-only so multi-region interactions work underneath */
  allowClicksThrough?: boolean
  align?: 'top' | 'bottom' | 'left' | 'right'
  /** Expand the dim cutout beyond the target (popovers, submenus) */
  holePad?: { top?: number; right?: number; bottom?: number; left?: number }
  nextLabel?: string
}

const steps: TutorialStep[] = [
  {
    id: 'welcome',
    voice: 'pig',
    title: 'Wheek! Welcome home!',
    body: "I'm your guide for the next few minutes — I'll point out everything you need to know. Time stays paused while we look around, so take it easy.",
    nextLabel: 'Next →'
  },
  {
    // Spotlight stays on the closed pill so it's obvious what to click;
    // advancing to the next step is what opens the drawer (autoOpen there).
    id: 'pig-pills',
    voice: 'system',
    target: 'pig-pill',
    title: 'Your guinea pigs',
    body: "Each pig gets a signboard on the bar. A green dot means they're doing fine. An orange or red chip means a need is getting low — the number tells you how many.",
    hint: 'Click the guinea pig sign.',
    advanceOnTargetClick: true,
    align: 'right'
  },
  {
    id: 'pig-info',
    voice: 'system',
    target: 'pig-pill',
    autoOpen: 'pig-pill',
    setTab: 'info',
    title: 'Meet each pig',
    body: "The Info tab shows breed, age, personality — plus how much each pig likes you, and how they're bonding with each other.",
    hint: 'Click the Needs tab to see what they want.',
    advanceOnSelector: '[data-tutorial="pig-needs-tab"]',
    align: 'right'
  },
  {
    id: 'pig-needs',
    voice: 'system',
    target: 'pig-pill',
    autoOpen: 'pig-pill',
    setTab: 'needs',
    title: 'All their needs at a glance',
    body: 'This tab shows every need for the selected pig — hunger, thirst, hygiene, social, and the rest. The bars tell you exactly what to top up next.',
    align: 'right'
  },
  {
    id: 'habitat-status',
    voice: 'system',
    target: 'habitat-status',
    autoOpen: 'habitat-status',
    title: 'Habitat health',
    body: 'Water, hay, bedding and overall cleanliness all decay over time. The percentage on the sign is your at-a-glance summary — the panel shows exactly what needs attention.',
    align: 'right'
  },
  {
    id: 'cage',
    voice: 'pig',
    target: 'cage',
    title: 'My home, my rules',
    body: 'Click anything in the cage — the water bottle, hay rack, food bowl, a chew, or me! — to inspect, refill, or interact with it. The poops? Click to clean. Easy!',
    hint: 'Click something in the cage.',
    advanceOnTargetClick: true,
    align: 'top',
    // Item popovers extend upward from the clicked item; keep them inside
    // the cutout so the overlay doesn't cover them.
    holePad: { top: 40, right: 20, bottom: 20, left: 20 }
  },
  {
    // Placing an item takes two regions (pick in the panel, click a spot in
    // the cage) — let clicks land anywhere while this step is up.
    id: 'inventory',
    voice: 'system',
    target: 'inventory',
    autoOpen: 'inventory',
    allowClicksThrough: true,
    title: 'Inventory',
    body: 'Hay, food, bedding and habitat items you buy at the Supplies Store live here. Click an item, then click a spot in the cage to place it.',
    align: 'left'
  },
  {
    id: 'fabs',
    voice: 'system',
    target: 'fabs',
    title: 'Care actions',
    body: 'Give food, help play, give care, socialize, or encourage pig-to-pig bonding. Pick an action, then click the guinea pig who should receive it.',
    hint: 'Open any care menu.',
    advanceOnTargetClick: true,
    align: 'top',
    // Submenus pop upward from the plaques.
    holePad: { top: 220 }
  },
  {
    id: 'activity',
    voice: 'system',
    target: 'activity',
    autoOpen: 'activity',
    title: 'Activity feed',
    body: 'Everything that happens — what you did, how the pigs reacted, automatic events — gets logged here. Great for catching up after stepping away.',
    align: 'right'
  },
  {
    id: 'pause',
    voice: 'system',
    target: 'pause',
    title: 'Pause anytime',
    body: 'While the game runs, pigs wander and needs tick down. The game always starts paused when you arrive in Live Mode — this button starts and stops time whenever you like.',
    align: 'bottom'
  },
  {
    id: 'supplies',
    voice: 'system',
    target: 'supplies-tab',
    title: 'Restock at the Supplies Store',
    body: 'Hay, food, bedding and habitat items run out. Visit the Supplies Store anytime to restock — pay with the coins you earn from caring for your pigs.',
    hint: 'Open the Supplies Store.',
    advanceOnTargetClick: true,
    align: 'bottom'
  },
  {
    id: 'done',
    voice: 'pig',
    title: "You're ready! Popcorn!",
    body: "Wheek wheek! Hit ▶ Resume in Live Mode when you want time to run. Treat me well and we'll have lots of fun together~",
    nextLabel: 'Start playing 🎉'
  }
]

const emit = defineEmits<{
  close: []
}>()

const tutorial = useTutorialStore()

const step = computed(() => steps[Math.min(tutorial.stepIndex, steps.length - 1)])
const isLast = computed(() => tutorial.stepIndex >= steps.length - 1)
const isPigVoice = computed(() => step.value.voice === 'pig')

// ── Target measurement ───────────────────────────────────────────────────
// Re-measured every animation frame: handles layout shifts when dropdowns
// open or pigs wander. If the target contains an open [data-sim-panel]
// dropdown, union both rects so the spotlight covers pill AND panel.

interface Rect { top: number; left: number; width: number; height: number }

const targetRect = ref<Rect | null>(null)
let rafId = 0

function measure() {
  const targetKey = step.value.target
  if (!targetKey) {
    targetRect.value = null
  } else {
    const el = document.querySelector(`[data-tutorial="${targetKey}"]`)
    if (el) {
      const r = el.getBoundingClientRect()
      let top = r.top
      let left = r.left
      let right = r.right
      let bottom = r.bottom
      const panel = el.querySelector('[data-sim-panel]')
      if (panel) {
        const pr = panel.getBoundingClientRect()
        top = Math.min(top, pr.top)
        left = Math.min(left, pr.left)
        right = Math.max(right, pr.right)
        bottom = Math.max(bottom, pr.bottom)
      }
      const next: Rect = { top, left, width: right - left, height: bottom - top }
      const prev = targetRect.value
      if (
        !prev ||
        Math.abs(prev.top - next.top) >= 0.5 ||
        Math.abs(prev.left - next.left) >= 0.5 ||
        Math.abs(prev.width - next.width) >= 0.5 ||
        Math.abs(prev.height - next.height) >= 0.5
      ) {
        targetRect.value = next
      }
    } else {
      targetRect.value = null
    }
  }
  rafId = requestAnimationFrame(measure)
}

// ── Spotlight hole + dim panels ──────────────────────────────────────────

const HOLE_PAD = 10

const hole = computed<Rect | null>(() => {
  const r = targetRect.value
  if (!r) return null
  const pad = step.value.holePad ?? {}
  const padTop = pad.top ?? HOLE_PAD
  const padLeft = pad.left ?? HOLE_PAD
  return {
    top: Math.max(0, r.top - padTop),
    left: Math.max(0, r.left - padLeft),
    width: r.width + padLeft + (pad.right ?? HOLE_PAD),
    height: r.height + padTop + (pad.bottom ?? HOLE_PAD)
  }
})

const dimStyles = computed(() => {
  const h = hole.value
  if (!h) return []
  return [
    { top: '0', left: '0', right: '0', height: `${h.top}px` },
    { top: `${h.top}px`, left: '0', width: `${h.left}px`, height: `${h.height}px` },
    { top: `${h.top}px`, left: `${h.left + h.width}px`, right: '0', height: `${h.height}px` },
    { top: `${h.top + h.height}px`, left: '0', right: '0', bottom: '0' }
  ]
})

// ── Card placement ───────────────────────────────────────────────────────
// Default: opposite the target's vertical half; steps override with `align`.

const cardPos = computed(() => {
  const cardW = 380
  const cardH = 320
  const gap = 24
  const vw = window.innerWidth
  const vh = window.innerHeight
  const h = hole.value
  if (!h) {
    return { top: vh / 2 - cardH / 2, left: vw / 2 - cardW / 2 }
  }
  const align = step.value.align || (h.top + h.height / 2 < vh / 2 ? 'bottom' : 'top')
  let top: number
  let left: number
  if (align === 'bottom') {
    top = h.top + h.height + gap
    left = h.left + h.width / 2 - cardW / 2
  } else if (align === 'top') {
    top = h.top - cardH - gap
    left = h.left + h.width / 2 - cardW / 2
  } else if (align === 'right') {
    top = h.top + h.height / 2 - cardH / 2
    left = h.left + h.width + gap
  } else {
    top = h.top + h.height / 2 - cardH / 2
    left = h.left - cardW - gap
  }
  return {
    top: Math.max(16, Math.min(vh - cardH - 16, top)),
    left: Math.max(16, Math.min(vw - cardW - 16, left))
  }
})

// ── Step choreography: auto-open panels + drawer tab ─────────────────────

watch(
  step,
  (current, previous) => {
    if (previous?.autoOpen && previous.autoOpen !== current.autoOpen) {
      tutorial.callPanelHandler(previous.autoOpen, false)
    }
    if (current.autoOpen) {
      tutorial.callPanelHandler(current.autoOpen, true)
    }
    if (current.setTab) {
      const tab = current.setTab
      // The drawer mounts as a result of autoOpen above — defer so its
      // handler is registered before we flip the tab.
      nextTick(() => tutorial.callPanelHandler('pig-drawer-tab', tab))
    }
  },
  { immediate: true }
)

// ── Interaction gates ────────────────────────────────────────────────────

function onDocumentClick(e: MouseEvent) {
  const s = step.value
  if (!s.advanceOnTargetClick && !s.advanceOnSelector) return
  const clicked = e.target as HTMLElement
  let matched = false
  if (s.advanceOnSelector) {
    matched = !!clicked.closest?.(s.advanceOnSelector)
  } else if (s.target) {
    const el = document.querySelector(`[data-tutorial="${s.target}"]`)
    matched = !!el && el.contains(clicked)
  }
  if (!matched) return
  // Small delay so the target's own click handler runs first (dropdown
  // opens, item gets selected) before the spotlight moves on.
  const idx = tutorial.stepIndex
  window.setTimeout(() => {
    if (tutorial.isActive && tutorial.stepIndex === idx) {
      tutorial.stepIndex = Math.min(steps.length - 1, idx + 1)
    }
  }, 320)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// ── Controls ─────────────────────────────────────────────────────────────

function next() {
  if (isLast.value) {
    close()
    return
  }
  tutorial.stepIndex += 1
}

function back() {
  tutorial.stepIndex = Math.max(0, tutorial.stepIndex - 1)
}

function close() {
  emit('close')
}

onMounted(() => {
  rafId = requestAnimationFrame(measure)
  document.addEventListener('click', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  document.removeEventListener('click', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
  // Don't leave an auto-opened panel behind when the tour ends mid-step.
  if (step.value.autoOpen) {
    tutorial.callPanelHandler(step.value.autoOpen, false)
  }
})
</script>
