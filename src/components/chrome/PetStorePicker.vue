<template>
  <div class="petstore">
    <div class="petstore__inner">
      <!-- Pet-shop scenery layer (window, habitats, plants, chair, treats) -->
      <PetStoreBackdrop />

      <div class="petstore__content">
      <h1 class="petstore__title">Pick your bonded pair</h1>
      <p class="petstore__subtitle">
        Each habitat holds two pigs who've grown up together. Adopt the habitat — take both home.
      </p>

      <!-- Bonded-pair preview slots — show a gray-pig placeholder until a habitat
           is picked, then fill with the selected pair's crate cards. -->
      <div class="petstore__slots">
        <button
          v-if="selectedHabitat !== null"
          class="petstore__slots-clear"
          aria-label="Cancel — unselect this habitat"
          @click="clearSelection"
        >×</button>
        <template v-for="(pig, slot) in slotPigs" :key="slot">
          <div v-if="pig" class="slot slot--filled" :style="slotVars(slot)">
            <span class="slot__stud slot__stud--tl" aria-hidden="true"></span>
            <span class="slot__stud slot__stud--tr" aria-hidden="true"></span>
            <span class="slot__stud slot__stud--bl" aria-hidden="true"></span>
            <span class="slot__stud slot__stud--br" aria-hidden="true"></span>
            <div class="slot__plank" aria-hidden="true"></div>
            <div class="slot__interior">
              <div class="slot__portrait">
                <PigSvg
                  breed="American"
                  :colors="pigColors(pig)"
                  :spots="pigSpots(pig)"
                  :eye="pig.appearance.eyeColor"
                  :size="92"
                  :uid="`slot-${pig.id}`"
                />
              </div>
              <div class="slot__id">
                <div class="slot__plaque">
                  <span class="slot__plaque-stud slot__plaque-stud--tl" aria-hidden="true"></span>
                  <span class="slot__plaque-stud slot__plaque-stud--tr" aria-hidden="true"></span>
                  <span class="slot__plaque-stud slot__plaque-stud--bl" aria-hidden="true"></span>
                  <span class="slot__plaque-stud slot__plaque-stud--br" aria-hidden="true"></span>
                  <div class="slot__plaque-head">
                    <input
                      v-if="editingSlot === slot"
                      v-focus
                      v-model="editingValue"
                      class="slot__name slot__name--input"
                      @keydown.enter.prevent="commitName(pig.id, pig.name, editingValue)"
                      @keydown.escape.prevent="editingSlot = null"
                      @blur="commitName(pig.id, pig.name, editingValue)"
                    />
                    <button
                      v-else
                      class="slot__name slot__name--editable"
                      :title="`Rename ${displayName(pig)}`"
                      @click="startEdit(slot, pig)"
                    >{{ displayName(pig) }}</button>
                    <span class="slot__gender">{{ pig.gender === 'male' ? 'Boar' : 'Sow' }}</span>
                  </div>
                  <div class="slot__breed">
                    <span class="slot__breed-name">{{ pig.breed }}</span>
                    <span class="slot__breed-trait"> · {{ disposition(pig) }}</span>
                  </div>
                </div>
                <div class="slot__swatches">
                  <span
                    v-for="(hex, si) in pigSwatches(pig)"
                    :key="si"
                    class="slot__swatch"
                    :style="{ background: hex }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="slot slot--empty">
            <div class="slot__placeholder">
              <svg class="slot__ghost" width="64" height="48" viewBox="0 0 64 48" aria-hidden="true">
                <ellipse cx="32" cy="32" rx="24" ry="14" fill="#94a3b8" />
                <ellipse cx="22" cy="46" rx="3" ry="2.5" fill="#94a3b8" />
                <ellipse cx="42" cy="46" rx="3" ry="2.5" fill="#94a3b8" />
                <circle cx="50" cy="22" r="9" fill="#94a3b8" />
                <circle cx="46" cy="21" r="1.6" fill="#fff" />
                <circle cx="53" cy="21" r="1.6" fill="#fff" />
                <ellipse cx="55" cy="14" rx="3" ry="4" fill="#94a3b8" />
                <ellipse cx="44" cy="14" rx="3" ry="4" fill="#94a3b8" />
              </svg>
            </div>
          </div>
        </template>
      </div>

      <!-- Adopt CTA bar -->
      <div class="petstore__cta">
        <Transition name="hint-fade" mode="out-in">
          <span
            class="petstore__cta-text"
            :key="selectedHabitat !== null ? 'selected' : hintIndex"
          >{{ ctaHint }}</span>
        </Transition>
        <button class="petstore__adopt" :disabled="!selectedHabitat" @click="adopt">
          Adopt pair
        </button>
      </div>

      <p v-if="errorMessage" class="petstore__error">{{ errorMessage }}</p>

      <!-- Habitat grid -->
      <div v-if="habitats.length > 0" class="petstore__grid">
        <button
          v-for="(h, i) in habitats"
          :key="h.id"
          class="hutch"
          :class="{ 'hutch--picked': selectedHabitat === h.id }"
          :style="hutchVars(i, selectedHabitat === h.id)"
          @click="select(h.id)"
        >
          <span class="hutch__label">{{ h.label }}</span>
          <div class="hutch__stage">
            <!-- Igloo hide on cage floor -->
            <svg class="hutch__igloo" viewBox="0 0 60 44" aria-hidden="true">
              <ellipse cx="30" cy="41.5" rx="26" ry="2.5" fill="rgba(0,0,0,.12)" />
              <path d="M3 38 Q3 9 30 9 Q57 9 57 38 Z" fill="var(--hutch-tint)" stroke="var(--hutch-accent)" stroke-width="0.6" />
              <path d="M3 38 Q3 9 30 9 Q57 9 57 38 Z" fill="rgba(255,255,255,.30)" />
              <ellipse cx="17" cy="20" rx="8" ry="5" fill="rgba(255,255,255,.55)" transform="rotate(-20,17,20)" />
              <ellipse cx="16" cy="19" rx="3.5" ry="2" fill="rgba(255,255,255,.75)" transform="rotate(-20,16,19)" />
              <ellipse cx="30" cy="38" rx="11" ry="13" fill="var(--hutch-deep)" />
              <ellipse cx="30" cy="34" rx="9" ry="10" fill="rgba(0,0,0,.55)" />
              <ellipse cx="30" cy="25.5" rx="6.5" ry="1.2" fill="var(--hutch-tint)" />
            </svg>
            <!-- Hay rack — wooden barrel feeder -->
            <svg class="hutch__hayrack" viewBox="0 0 56 70" aria-hidden="true">
              <!-- Ground shadow -->
              <ellipse cx="28" cy="67" rx="21" ry="2.5" fill="rgba(0,0,0,.15)" />
              <!-- Hay interior background (visible through gaps between planks) -->
              <rect x="8" y="14" width="40" height="40" fill="#cec448" />
              <!-- Interior hay texture strands -->
              <g stroke="#989228" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.6">
                <line x1="10" y1="20" x2="14" y2="30" />
                <line x1="11" y1="33" x2="8" y2="44" />
                <line x1="21" y1="18" x2="24" y2="28" />
                <line x1="19" y1="36" x2="23" y2="47" />
                <line x1="33" y1="22" x2="30" y2="32" />
                <line x1="36" y1="34" x2="39" y2="45" />
                <line x1="44" y1="19" x2="41" y2="30" />
              </g>
              <!-- Vertical wooden planks — 7 planks, wider at center to suggest cylinder curvature -->
              <g stroke="#6b2e08" stroke-width="0.4">
                <rect x="8"     y="14" width="2.5" height="40" rx="0.5" fill="#a06828" />
                <rect x="13.25" y="14" width="3.5" height="40" rx="0.8" fill="#b87832" />
                <rect x="18.75" y="14" width="4.5" height="40" rx="0.8" fill="#c88840" />
                <rect x="25.5"  y="14" width="5"   height="40" rx="1"   fill="#d89448" />
                <rect x="32.5"  y="14" width="4.5" height="40" rx="0.8" fill="#c88840" />
                <rect x="39.25" y="14" width="3.5" height="40" rx="0.8" fill="#b87832" />
                <rect x="45.5"  y="14" width="2.5" height="40" rx="0.5" fill="#a06828" />
              </g>
              <!-- Bottom wooden disc -->
              <ellipse cx="28" cy="54" rx="22" ry="5" fill="#b87428" stroke="#6b2e08" stroke-width="1.2" />
              <ellipse cx="28" cy="53.5" rx="16" ry="3" fill="#cc9040" opacity="0.5" />
              <!-- Hay strands poking up through the top opening gaps -->
              <g stroke="#c8bc40" stroke-width="1.2" stroke-linecap="round" fill="none">
                <line x1="12" y1="14" x2="10" y2="3" />
                <line x1="18" y1="14" x2="17" y2="2" />
                <line x1="24" y1="14" x2="22" y2="1" />
                <line x1="32" y1="14" x2="33" y2="0" />
                <line x1="38" y1="14" x2="40" y2="2" />
                <line x1="44" y1="14" x2="46" y2="4" />
              </g>
              <!-- Top wooden disc (drawn over planks and hay strand bases) -->
              <ellipse cx="28" cy="14" rx="22" ry="5" fill="#b87428" stroke="#6b2e08" stroke-width="1.2" />
              <ellipse cx="28" cy="13" rx="16" ry="3" fill="#e8cc78" />
              <ellipse cx="23" cy="11.5" rx="7" ry="1.8" fill="rgba(255,255,255,.42)" transform="rotate(-12,23,11.5)" />
              <!-- Stray hay scattered on ground -->
              <g stroke="#a0a030" stroke-width="1" stroke-linecap="round" fill="none">
                <line x1="4"  y1="60" x2="1"  y2="63" />
                <line x1="51" y1="59" x2="55" y2="62" />
                <line x1="20" y1="62" x2="15" y2="65" />
              </g>
            </svg>
            <div
              v-for="(pig, pi) in h.pigs"
              :key="pig.id"
              class="hutch__pig"
              :style="pigStyleMap[pig.id]"
            >
              <div class="hutch__pig-bob" :style="{ animationDelay: `${pi * 220}ms` }">
                <!-- 2D chrome renders every pig as the American shorthair (breed art deferred) -->
                <PigSvg breed="American" :colors="pigColors(pig)" :spots="pigSpots(pig)" :eye="pig.appearance.eyeColor" :size="92" :uid="pig.id" :walking="!!pigWalk[pig.id]?.walking" />
              </div>
            </div>
            <!-- Water bottle hanging from cage wall -->
            <svg class="hutch__waterbottle" viewBox="0 0 22 56" aria-hidden="true">
              <rect x="6" y="0" width="10" height="3" fill="#94a3b8" />
              <rect x="9" y="3" width="4" height="6" fill="#cbd5e1" />
              <rect x="3" y="9" width="16" height="32" rx="3" fill="#7dd3fc" stroke="#0284c7" stroke-width="1" />
              <rect x="3" y="9" width="16" height="14" rx="3" fill="rgba(255,255,255,.4)" />
              <rect x="9" y="41" width="4" height="6" fill="#94a3b8" />
              <circle cx="11" cy="50" r="3" fill="#94a3b8" />
            </svg>
          </div>
          <div class="hutch__plates">
            <div v-for="pig in h.pigs" :key="pig.id" class="hutch__plate">
              <div class="hutch__plate-head">
                <span class="hutch__name">{{ pig.name }}</span>
                <span class="hutch__gender">{{ pig.gender === 'male' ? 'Boar' : 'Sow' }}</span>
              </div>
              <div class="hutch__breed">
                <span class="hutch__breed-name">{{ pig.breed }}</span>
                <span class="hutch__breed-trait"> · {{ disposition(pig) }}</span>
              </div>
              <div class="hutch__swatches">
                <span
                  v-for="(hex, si) in pigSwatches(pig)"
                  :key="si"
                  class="hutch__swatch"
                  :style="{ background: hex }"
                ></span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <p v-else class="petstore__empty">The pet store is restocking — check back in a moment.</p>
      </div>
    </div>

    <!-- Certificate of Adoption — confirms the bonded pair before play begins -->
    <AdoptionCertificate
      v-if="showCertificate"
      :pigs="selectedPigs"
      @start="confirmAdopt"
      @cancel="showCertificate = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import PigSvg from './PigSvg.vue'
import PetStoreBackdrop from './PetStoreBackdrop.vue'
import AdoptionCertificate from './AdoptionCertificate.vue'
import { pigColors, pigSpots, pigSwatches, h32 } from './pigColor'
import { usePetStoreManager } from '../../stores/petStoreManager'
import type { GuineaPig, GuineaPigPersonality } from '../../stores/guineaPigStore'

const petStoreManager = usePetStoreManager()

// Auto-focus directive for the name input when it mounts.
const vFocus = {
  mounted(el: HTMLElement) { el.focus(); (el as HTMLInputElement).select() }
}

interface Habitat {
  id: number
  label: string
  pigs: GuineaPig[]
}

// Group the available pool by habitat; each habitat is a bonded pair (take ≤2).
const habitats = computed<Habitat[]>(() => {
  const byHabitat = new Map<number, GuineaPig[]>()
  for (const pig of petStoreManager.availableGuineaPigs) {
    const key = pig.habitat ?? -1
    if (!byHabitat.has(key)) byHabitat.set(key, [])
    byHabitat.get(key)!.push(pig)
  }
  return [...byHabitat.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, pigs], i) => ({
      id,
      label: `Habitat ${i + 1}`,
      pigs: pigs.slice(0, 2)
    }))
})

const selectedHabitat = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const showCertificate = ref(false)

const selectedPigs = computed(() => {
  if (selectedHabitat.value === null) return []
  return habitats.value.find(h => h.id === selectedHabitat.value)?.pigs ?? []
})

const selectedNames = computed(() => selectedPigs.value.map(p => p.name).join(' & '))

const IDLE_HINTS = [
  'Pick a habitat below — adopt the bonded pair inside!',
  'Each habitat holds two pigs who\'ve grown up together.',
  'Adopt a habitat — take both guinea pigs home.',
  'Bonded pairs stay together. Forever friends.',
  'Click a habitat to meet the pair inside.',
]

const hintIndex = ref(0)
let hintTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  hintTimer = setInterval(() => {
    if (selectedHabitat.value === null) {
      hintIndex.value = (hintIndex.value + 1) % IDLE_HINTS.length
    }
  }, 3200)
})

// ── Per-pig walking state machine ────────────────────────────────────────────
interface WalkState {
  x: number           // left% within the stage (5–65)
  facing: 1 | -1     // 1 = right, -1 = left
  walking: boolean
  walkDuration: number
}


const pigWalk = ref<Record<string, WalkState>>({})
const walkTimers: Record<string, ReturnType<typeof window.setTimeout>> = {}

function initWalk(pigId: string, pi: number) {
  // Start pigs in separate halves so they don't overlap on load
  const startX = pi === 0
    ? 5  + (h32(pigId)        % 20)   // 5–24%
    : 38 + (h32(pigId + '~') % 20)   // 38–57%
  pigWalk.value[pigId] = {
    x: startX,
    facing: h32(pigId) % 2 === 0 ? 1 : -1,
    walking: false,
    walkDuration: 0,
  }
  scheduleIdle(pigId)
}

function scheduleIdle(pigId: string) {
  // Idle 1.8–5 s — stopped much more than walking
  walkTimers[pigId] = window.setTimeout(() => startWalk(pigId), 1800 + Math.random() * 3200)
}

function startWalk(pigId: string) {
  const state = pigWalk.value[pigId]
  if (!state) return

  const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1
  const dist = 12 + Math.random() * 28
  const newX = Math.max(5, Math.min(60, state.x + dir * dist))

  if (newX === state.x) { scheduleIdle(pigId); return }

  // Always derive facing from actual movement direction so the pig never walks backward
  const facing: 1 | -1 = newX > state.x ? 1 : -1
  const actualDist = Math.abs(newX - state.x)
  const walkDuration = 600 + actualDist * 28 + Math.random() * 300

  pigWalk.value[pigId] = { x: newX, facing, walking: true, walkDuration }

  walkTimers[pigId] = window.setTimeout(() => {
    if (pigWalk.value[pigId]) {
      pigWalk.value[pigId].walking = false
      pigWalk.value[pigId].walkDuration = 0
    }
    scheduleIdle(pigId)
  }, walkDuration)
}

const pigStyleMap = computed(() => {
  const out: Record<string, Record<string, string | number>> = {}
  for (const [id, s] of Object.entries(pigWalk.value)) {
    out[id] = { '--pig-x': s.x, '--pig-facing': s.facing, '--pig-walk-dur': `${s.walkDuration}ms` }
  }
  return out
})

watch(habitats, (newHabitats) => {
  newHabitats.forEach(h => {
    h.pigs.forEach((pig, pi) => {
      if (!pigWalk.value[pig.id]) initWalk(pig.id, pi)
    })
  })
}, { immediate: true })

onUnmounted(() => {
  if (hintTimer !== null) clearInterval(hintTimer)
  Object.values(walkTimers).forEach(t => clearTimeout(t))
})

const ctaHint = computed(() => {
  if (selectedHabitat.value !== null) {
    const verb = selectedPigs.value.length > 1 ? 'are' : 'is'
    return `${selectedNames.value} ${verb} ready to come home!`
  }
  return IDLE_HINTS[hintIndex.value]
})

// Inline name editing — local overrides keyed by pig id, not persisted to store.
const customNames = ref<Record<string, string>>({})
const editingSlot = ref<number | null>(null)
const editingValue = ref('')

function startEdit(slot: number, pig: GuineaPig) {
  editingValue.value = displayName(pig)
  editingSlot.value = slot
}

function displayName(pig: GuineaPig): string {
  return customNames.value[pig.id] ?? pig.name
}

function commitName(id: string, original: string, next: string) {
  const trimmed = next.trim()
  if (!trimmed || trimmed === original) delete customNames.value[id]
  else customNames.value[id] = trimmed
  editingSlot.value = null
}

function disposition(pig: GuineaPig): string {
  const p = pig.personality
  const traits: [keyof GuineaPigPersonality, string][] = [
    ['friendliness', 'friendly'],
    ['playfulness', 'playful'],
    ['curiosity', 'curious'],
    ['boldness', 'bold'],
    ['cleanliness', 'tidy'],
  ]
  return traits.reduce((best, cur) => p[cur[0]] > p[best[0]] ? cur : best, traits[0])[1]
}

// Two preview slots: null until a habitat is picked, then the bonded pair.
const slotPigs = computed<(GuineaPig | null)[]>(() => [
  selectedPigs.value[0] ?? null,
  selectedPigs.value[1] ?? null
])

// Tint for the filled slot's portrait halo — follows the picked habitat's accent.
const selectedTint = computed(() => {
  if (selectedHabitat.value === null) return 'var(--color-gold-200)'
  const i = habitats.value.findIndex(h => h.id === selectedHabitat.value)
  return ACCENTS[(i < 0 ? 0 : i) % ACCENTS.length].tint
})

function slotVars(slot: number) {
  return {
    '--slot-tilt': slot === 0 ? '-1deg' : '1deg',
    '--slot-tint': selectedTint.value
  }
}

function select(id: number) {
  selectedHabitat.value = selectedHabitat.value === id ? null : id
  errorMessage.value = null
  editingSlot.value = null
}

function clearSelection() {
  selectedHabitat.value = null
  errorMessage.value = null
  editingSlot.value = null
}

// Rotating accent palette (game color tokens) — one per habitat card.
const ACCENTS = [
  { accent: 'var(--color-pink)', deep: 'var(--color-pink-deep)', tint: 'var(--color-pink-200)' },
  { accent: 'var(--color-green)', deep: 'var(--color-green-800)', tint: 'var(--color-green-200)' },
  { accent: 'var(--color-violet-mid)', deep: 'var(--color-violet-deep)', tint: 'var(--color-violet-200)' },
  { accent: 'var(--color-orange)', deep: 'var(--color-gold-700)', tint: 'var(--color-gold-200)' },
  { accent: 'var(--color-sky)', deep: 'var(--color-cyan-700)', tint: 'var(--color-cyan-200)' },
  { accent: 'var(--color-pink-deep)', deep: 'var(--color-pink-800)', tint: 'var(--color-pink-200)' }
]

function hutchVars(i: number, picked: boolean) {
  const a = ACCENTS[i % ACCENTS.length]
  return {
    '--hutch-accent': a.accent,
    '--hutch-deep': a.deep,
    '--hutch-tint': a.tint,
    '--hutch-ring': picked ? a.accent : 'transparent'
  }
}

function adopt() {
  if (selectedHabitat.value === null) return
  const ids = selectedPigs.value.map(p => p.id).slice(0, 2)
  if (ids.length === 0) return
  const validation = petStoreManager.validatePairing(ids)
  if (!validation.valid) {
    errorMessage.value = validation.reason ?? 'These guinea pigs can’t be paired.'
    return
  }
  // Valid pairing — present the Certificate of Adoption. The session only
  // begins once the player confirms on the certificate (confirmAdopt).
  showCertificate.value = true
}

// Player clicked "Adopt" on the Certificate of Adoption — commit the adoption.
function confirmAdopt() {
  const ids = selectedPigs.value.map(p => p.id).slice(0, 2)
  if (ids.length === 0) return
  petStoreManager.startGameSession(ids)
  // activeGameSession is now set — PlayView swaps to the game.
}
</script>

<style scoped>
.petstore {
  position: relative;
  flex: 1;
  min-block-size: 0;
  overflow-y: auto;
  /* Clip the full-bleed backdrop where it hangs past the screen edges. */
  overflow-x: hidden;
  background:
    repeating-linear-gradient(0deg, rgba(146, 64, 14, .025) 0 1px, transparent 1px 9px),
    radial-gradient(ellipse at 50% 0%, var(--color-gold-50) 0%, var(--color-gold-100) 55%, #fde8b8 100%);
}

.petstore__inner {
  position: relative;
  max-inline-size: 1040px;
  margin-inline: auto;
  padding: var(--space-6);
}

/* Picker content sits above the decorative backdrop layer. */
.petstore__content {
  position: relative;
  z-index: 1;
}

.petstore__title {
  font-family: var(--font-family-heading);
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-dark);
  text-align: center;
  margin: var(--space-2) 0 var(--space-1);
  line-height: 1.1;
}

.petstore__subtitle {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-wood-shadow);
  text-align: center;
  margin: 0 0 var(--space-5);
}

/* ── Bonded-pair preview slots ─────────────────────────────────────────── */
.petstore__slots {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-block-end: var(--space-3);
}

.petstore__slots-clear {
  position: absolute;
  inset-block-start: -12px;
  inset-inline-end: -12px;
  z-index: 4;
  inline-size: 32px;
  block-size: 32px;
  border-radius: var(--radius-full);
  background: var(--color-gold-50);
  border: 3px solid var(--color-wood-dark);
  color: var(--color-gold-800);
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, .28);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty placeholder — pale-green card, dashed inner border, gray-pig ghost */
.slot--empty {
  padding: 8px;
  background: rgb(226, 240, 232);
  border: 1px solid rgba(100, 116, 139, .25);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .06);
}

.slot__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: 116px;
  padding: 12px 14px;
  border: 2px dashed var(--color-neutral-300);
  border-radius: 8px;
  opacity: .6;
}

.slot__ghost {
  opacity: .4;
}

/* Filled — amber crate matching the supplies-store / bonded-pair frame */
.slot--filled {
  position: relative;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(180deg, var(--color-wood-amber) 0%, var(--color-wood-mid) 100%);
  transform: rotate(var(--slot-tilt, 0deg));
  box-shadow:
    0 22px 28px -8px rgba(69, 26, 3, .5),
    0 10px 14px -4px rgba(69, 26, 3, .35),
    inset 0 2px 0 rgba(255, 255, 255, .2),
    inset 0 -3px 0 rgba(69, 26, 3, .3);
  transition: transform 200ms cubic-bezier(.34, 1.56, .64, 1);
}

.slot__plank {
  position: absolute;
  inset: 12px;
  border-radius: var(--radius-base);
  pointer-events: none;
  background-image: repeating-linear-gradient(180deg, transparent 0 22px, rgba(0, 0, 0, .18) 22px 24px, transparent 24px 26px);
}

.slot__stud {
  position: absolute;
  inline-size: 8px;
  block-size: 8px;
  border-radius: var(--radius-full);
  background: radial-gradient(circle at 30% 30%, var(--color-gold-200), var(--color-wood-border));
  box-shadow: inset 0 -1px 1px rgba(0, 0, 0, .4);
  pointer-events: none;
}

.slot__stud--tl { inset-block-start: 6px; inset-inline-start: 6px; }
.slot__stud--tr { inset-block-start: 6px; inset-inline-end: 6px; }
.slot__stud--bl { inset-block-end: 6px; inset-inline-start: 6px; }
.slot__stud--br { inset-block-end: 6px; inset-inline-end: 6px; }

.slot__interior {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 14px 16px;
  border-radius: 6px;
  background: linear-gradient(180deg, var(--color-gold-50) 0%, var(--color-gold-100) 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, .18);
}

.slot__portrait {
  position: relative;
  inline-size: 96px;
  block-size: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: radial-gradient(circle at 50% 70%, var(--slot-tint, var(--color-gold-200)) 0%, transparent 70%);
  filter: drop-shadow(0 4px 5px rgba(0, 0, 0, .22));
}

.slot__id {
  flex: 1;
  min-inline-size: 0;
}

.slot__plaque {
  position: relative;
  background: #fff;
  border: 2px solid var(--color-wood-border);
  border-radius: 6px;
  padding: 8px 10px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .15);
}

.slot__plaque-stud {
  position: absolute;
  inline-size: 5px;
  block-size: 5px;
  border-radius: var(--radius-full);
  background: var(--color-wood-border);
}

.slot__plaque-stud--tl { inset-block-start: 3px; inset-inline-start: 3px; }
.slot__plaque-stud--tr { inset-block-start: 3px; inset-inline-end: 3px; }
.slot__plaque-stud--bl { inset-block-end: 3px; inset-inline-start: 3px; }
.slot__plaque-stud--br { inset-block-end: 3px; inset-inline-end: 3px; }

.slot__plaque-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.slot__name {
  font-family: var(--font-family-heading);
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  color: var(--color-gold-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-inline-size: 0;
  flex: 1 1 auto;
}

.slot__name--editable {
  display: inline-block;
  background: none;
  border: none;
  padding: 0;
  cursor: text;
  text-align: start;
  border-block-end: 1.5px dotted var(--color-gold-400);
}

.slot__name--editable:hover {
  border-block-end-color: var(--color-gold-700);
}

.slot__name--input {
  display: block;
  inline-size: 100%;
  background: var(--color-gold-50);
  border: 1.5px solid var(--color-gold-600);
  border-radius: 3px;
  padding: 0 4px;
  outline: none;
  box-shadow: 0 0 0 2px rgba(180, 83, 9, .2);
}

.slot__gender {
  flex-shrink: 0;
  font-size: var(--font-size-3xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--color-gold-800);
}

.slot__breed {
  margin-block-start: 2px;
  font-size: var(--font-size-xs);
  font-style: italic;
  color: var(--color-neutral-500);
  line-height: 1.2;
}

.slot__breed-name {
  font-weight: var(--font-weight-semibold);
  font-style: normal;
  color: var(--color-neutral-800);
}

.slot__breed-trait {
  font-style: italic;
}

.slot__swatches {
  display: flex;
  gap: 4px;
  margin-block-start: 8px;
  padding-inline-start: 4px;
}

.slot__swatch {
  inline-size: 14px;
  block-size: 14px;
  border-radius: var(--radius-full);
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--color-wood-border);
}

.petstore__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-block-end: var(--space-3);
}

.petstore__cta-text {
  flex: 1;
  font-family: var(--font-family-heading);
  font-size: 1.4rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-dark);
}

.petstore__adopt {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: 28px;
  block-size: 52px;
  font-family: var(--font-family-heading);
  font-size: 1.375rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.02em;
  color: #fff;
  background: linear-gradient(180deg, var(--color-pink-500) 0%, var(--color-pink-600) 100%);
  border: 2px solid var(--color-gold-800);
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: var(--shadow-cta);
  text-shadow: 0 1px 0 rgba(69, 26, 3, .25);
  transition: transform 100ms ease, filter 140ms ease;
}

.petstore__adopt:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.petstore__adopt:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.petstore__error {
  margin: 0 0 var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: var(--color-red-50);
  border: 1.5px solid var(--color-red-300);
  border-radius: var(--radius-lg);
  color: var(--color-red-700);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.petstore__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-5);
  margin-block-start: var(--space-3);
}

.petstore__empty {
  text-align: center;
  color: var(--color-wood-shadow);
  font-style: italic;
  margin-block-start: var(--space-8);
}

/* Wooden hutch card */
.hutch {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--color-wood-mid) 0%, var(--color-wood-dark) 50%, var(--color-wood-shadow) 100%);
  border: 3px solid var(--color-wood-border);
  cursor: pointer;
  font-family: inherit;
  text-align: start;
  box-shadow:
    0 0 0 0 var(--hutch-ring),
    0 14px 22px -8px rgba(69, 26, 3, .55),
    inset 0 2px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 0 rgba(69, 26, 3, .35);
  transition: transform 200ms cubic-bezier(.34, 1.56, .64, 1), box-shadow 200ms ease;
}

.hutch:hover {
  transform: translateY(-2px);
}

.hutch--picked {
  border-color: var(--hutch-deep);
  box-shadow:
    0 0 0 4px var(--hutch-accent),
    0 0 0 7px #fff,
    0 18px 28px -8px rgba(69, 26, 3, .5),
    inset 0 2px 0 rgba(255, 255, 255, .22),
    inset 0 -3px 0 rgba(69, 26, 3, .35);
}

.hutch__label {
  align-self: flex-start;
  font-family: var(--font-family-heading);
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: #fff;
  padding: 3px 12px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, var(--hutch-accent) 0%, var(--hutch-deep) 100%);
  border: 1px solid rgba(0, 0, 0, .25);
  box-shadow: 0 3px 5px -2px rgba(0, 0, 0, .3), inset 0 1px 0 rgba(255, 255, 255, .3);
  text-shadow: 0 1px 0 rgba(0, 0, 0, .25);
}

.hutch__stage {
  position: relative;
  min-block-size: 130px;
  padding: 10px;
  background: linear-gradient(180deg, #fffef5 0%, #fdf3c4 100%);
  border-radius: 12px;
  border: 2px solid var(--color-wood-dark);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .5), inset 0 -8px 16px -4px rgba(146, 64, 14, .25);
}

.hutch__igloo {
  position: absolute;
  inset-block-start: 6px;
  inset-inline-start: 6px;
  inline-size: 76px;
  block-size: auto;
  pointer-events: none;
  z-index: 0;
}

.hutch__hayrack {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 30px;
  inline-size: 52px;
  block-size: auto;
  pointer-events: none;
  z-index: 1;
}

.hutch__waterbottle {
  position: absolute;
  inset-block-start: 6px;
  inset-inline-end: 8px;
  inline-size: 20px;
  block-size: auto;
  pointer-events: none;
  z-index: 3;
}

.hutch__pig {
  position: absolute;
  inset-block-end: 8px;
  inset-inline-start: calc(var(--pig-x, 30) * 1%);
  transform: scaleX(var(--pig-facing, 1));
  transform-origin: center bottom;
  transition: inset-inline-start var(--pig-walk-dur, 0ms) linear, transform 80ms ease;
  z-index: 2;
}


.hutch__plates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.hutch__plate {
  background: #fff;
  border: 2px solid var(--color-wood-border);
  border-radius: 6px;
  padding: 6px 8px 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .15);
}

.hutch__plate-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
}

.hutch__name {
  font-family: var(--font-family-heading);
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-gold-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hutch__gender {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-wood-dark);
  flex-shrink: 0;
}

.hutch__breed {
  font-size: var(--font-size-2xs);
  color: var(--color-neutral-600);
  font-weight: var(--font-weight-semibold);
}

.hutch__breed-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-neutral-800);
}

.hutch__breed-trait {
  font-style: italic;
  color: var(--color-neutral-500);
}

.hutch__swatches {
  display: flex;
  gap: 4px;
  margin-block-start: 4px;
}

.hutch__swatch {
  inline-size: 12px;
  block-size: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--color-wood-border);
}

@media (prefers-reduced-motion: reduce) {
  .hutch__pig { transition: none; }
}

/* Hint text crossfade */
.hint-fade-enter-active,
.hint-fade-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
}

.hint-fade-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.hint-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
