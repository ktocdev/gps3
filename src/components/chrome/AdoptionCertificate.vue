<template>
  <Teleport to="body">
    <div
      class="adopt-cert"
      :class="{ 'adopt-cert--exiting': exiting }"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ac-title"
    >
      <div class="adopt-cert__paper">
        <!-- Inner hairline frame -->
        <div class="adopt-cert__frame" aria-hidden="true"></div>

        <!-- Corner flourishes -->
        <div
          v-for="c in corners"
          :key="c.cls"
          class="adopt-cert__corner"
          :class="c.cls"
          aria-hidden="true"
        >
          <svg viewBox="0 0 60 60" width="42" height="42" :style="{ transform: `rotate(${c.rot}deg)` }">
            <g fill="none" stroke="#451a03" stroke-width="1.6" stroke-linecap="round">
              <path d="M2 2 L18 2" />
              <path d="M2 2 L2 18" />
              <path d="M2 2 C 14 6, 14 14, 6 18 C 14 14, 22 14, 26 22" />
              <path d="M2 2 C 6 14, 14 14, 18 6 C 14 14, 14 22, 22 26" />
              <circle cx="22" cy="22" r="2" fill="#b45309" />
            </g>
          </svg>
        </div>

        <!-- Close -->
        <button class="adopt-cert__close" aria-label="Close" :disabled="stamped" @click="cancel">✕</button>

        <!-- Crest -->
        <div class="adopt-cert__crest" aria-hidden="true">🐹</div>

        <!-- Title block -->
        <div class="adopt-cert__titles">
          <div class="adopt-cert__bureau">— The Cuddly Cavies Adoption Bureau —</div>
          <h1 id="ac-title" class="adopt-cert__title">
            Certificate <span class="adopt-cert__title-of">of</span> Adoption
          </h1>
          <div class="adopt-cert__rule" aria-hidden="true">
            <span class="adopt-cert__rule-line"></span>
            <span class="adopt-cert__rule-mark">✦</span>
            <span class="adopt-cert__rule-line"></span>
          </div>
        </div>

        <!-- Preamble -->
        <p class="adopt-cert__preamble">
          Be it known that on this day, <strong>{{ date }}</strong>,
          <span class="adopt-cert__names">{{ namesPretty }}</span>
          {{ pigs.length > 1 ? 'have' : 'has' }} been lovingly entrusted into the care of their
          new forever home.
        </p>

        <!-- Pig cards -->
        <div class="adopt-cert__cards">
          <div v-for="pig in pigs" :key="pig.id" class="cert-card">
            <div class="cert-card__frame" aria-hidden="true"></div>

            <div class="cert-card__head">
              <div class="cert-card__portrait">
                <!-- 2D chrome renders every pig as the American shorthair (breed art deferred) -->
                <PigSvg
                  breed="American"
                  :colors="pigColors(pig)"
                  :spots="pigSpots(pig)"
                  :eye="pig.appearance.eyeColor"
                  :size="46"
                  :uid="`cert-${pig.id}`"
                />
              </div>
              <div class="cert-card__id">
                <div class="cert-card__name">{{ pig.name }}</div>
                <span class="cert-card__gender">{{ genderLabel(pig) }}</span>
              </div>
            </div>

            <div class="cert-card__stats">
              <span class="cert-card__stat-label">Breed</span>
              <span class="cert-card__stat-value">{{ pig.breed || '—' }}</span>
              <span class="cert-card__stat-label">Disposition</span>
              <span class="cert-card__stat-value cert-card__stat-value--cap">{{ disposition(pig) }}</span>
              <span class="cert-card__stat-label">Coat</span>
              <span class="cert-card__stat-value cert-card__coat">
                <span
                  v-for="(hex, si) in pigSwatches(pig)"
                  :key="si"
                  class="cert-card__swatch"
                  :style="{ background: hex }"
                ></span>
                <span>{{ coatNames(pig) }}</span>
              </span>
            </div>

            <div class="cert-card__fun">
              <span class="cert-card__fun-label">Star sign</span> {{ starSign(pig) }}
            </div>
          </div>
        </div>

        <!-- Endorsement signatures -->
        <div class="adopt-cert__signatures">
          <div v-for="(row, i) in signatures" :key="i" class="adopt-cert__sig">
            <div
              class="adopt-cert__sig-name"
              :class="{ 'adopt-cert__sig-name--you': row.you }"
              :style="{ transform: `rotate(${row.tilt}deg)` }"
            >{{ row.sig }}</div>
            <div class="adopt-cert__sig-title">{{ row.title }}</div>
          </div>
        </div>

        <!-- Footer meta -->
        <div class="adopt-cert__meta">
          <span><strong>Cert. No.</strong>&nbsp; {{ certNo }}</span>
          <span></span>
          <span><strong>Issued</strong>&nbsp; {{ date }}</span>
        </div>

        <!-- Wax seal -->
        <div class="adopt-cert__seal" aria-hidden="true">
          <div class="adopt-cert__seal-inner">
            <div class="adopt-cert__seal-paw">🐾</div>
            <div class="adopt-cert__seal-text">OFFICIAL</div>
            <div class="adopt-cert__seal-text">SEAL</div>
          </div>
        </div>

        <!-- "ADOPTED" rubber stamp — slams down after the user confirms -->
        <div v-if="stamped" class="adopt-cert__stamp" aria-hidden="true">ADOPTED</div>

        <!-- CTA row -->
        <div class="adopt-cert__cta">
          <button class="adopt-cert__choose" :disabled="stamped" @click="cancel">
            Choose different pigs
          </button>
          <button ref="startBtn" class="adopt-cert__adopt" :disabled="stamped" @click="handleAdopt">
            Adopt
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PigSvg from './PigSvg.vue'
import { pigColors, pigSpots, pigSwatches } from './pigColor'
import type { GuineaPig } from '../../stores/guineaPigStore'

const props = defineProps<{ pigs: GuineaPig[] }>()
const emit = defineEmits<{ start: []; cancel: [] }>()

// ── Two-stage exit ──────────────────────────────────────────────────────────
//  1) click "Adopt"  → stamped: the ADOPTED stamp slams onto the certificate.
//  2) ~900ms later    → exiting: the whole overlay fades out.
//  3) ~1400ms total   → emit('start'): parent commits the adoption + starts play.
const stamped = ref(false)
const exiting = ref(false)
const startBtn = ref<HTMLButtonElement | null>(null)
const exitTimers: number[] = []

function handleAdopt() {
  if (stamped.value) return
  stamped.value = true
  exitTimers.push(window.setTimeout(() => { exiting.value = true }, 900))
  exitTimers.push(window.setTimeout(() => emit('start'), 1400))
}

function cancel() {
  if (stamped.value) return
  emit('cancel')
}

// ── Derived "official" data ──────────────────────────────────────────────────
// FNV-1a hash → stable fun stats / serial across re-renders.
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
const pickFrom = (str: string, list: string[]) => list[hash(str) % list.length]

const STAR_SIGN = [
  'Aries 🐏', 'Taurus 🐂', 'Gemini 👯', 'Cancer 🦀', 'Leo 🦁', 'Virgo 🌾',
  'Libra ⚖️', 'Scorpio 🦂', 'Sagittarius 🏹', 'Capricorn 🐐', 'Aquarius 🌊', 'Pisces 🐟',
]
function starSign(pig: GuineaPig): string {
  return pickFrom(`${pig.name}|${pig.breed}sign`, STAR_SIGN)
}

// Map the game's 5-trait personality onto a single disposition word (dominant trait).
const DISPOSITIONS: Array<[keyof GuineaPig['personality'], string]> = [
  ['friendliness', 'friendly'],
  ['playfulness', 'playful'],
  ['curiosity', 'curious'],
  ['boldness', 'bold'],
  ['cleanliness', 'tidy'],
]
function disposition(pig: GuineaPig): string {
  let best = DISPOSITIONS[0]
  for (const d of DISPOSITIONS) {
    if (pig.personality[d[0]] > pig.personality[best[0]]) best = d
  }
  return best[1]
}

function genderLabel(pig: GuineaPig): string {
  return pig.gender === 'male' ? 'Boar' : 'Sow'
}

function coatNames(pig: GuineaPig): string {
  return pigColors(pig).join(', ') || '—'
}

const date = computed(() =>
  new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
)

const certNo = computed(() => {
  const seed = `${props.pigs.map(p => p.name).join('::')}|${new Date().toDateString()}`
  const n = hash(seed) % 99999
  return `GP-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`
})

const namesPretty = computed(() => {
  const names = props.pigs.map(p => p.name)
  return names.length === 2 ? `${names[0]} and ${names[1]}` : names.join(', ')
})

const signatures = [
  { sig: 'Hazel Whiskers', title: 'Head Caretaker', tilt: -2, you: false },
  { sig: 'Dr. P. Pellets', title: 'Cavy Veterinarian', tilt: 1.5, you: false },
  { sig: 'You', title: 'Forever Friend', tilt: -1, you: true },
]

const corners = [
  { cls: 'adopt-cert__corner--tl', rot: 0 },
  { cls: 'adopt-cert__corner--tr', rot: 90 },
  { cls: 'adopt-cert__corner--bl', rot: -90 },
  { cls: 'adopt-cert__corner--br', rot: 180 },
]

// ── Overlay lifecycle: lock body scroll, autofocus, keyboard shortcuts ────────
function onKey(e: KeyboardEvent) {
  if (stamped.value) return
  if (e.key === 'Escape') cancel()
  else if (e.key === 'Enter') handleAdopt()
}

let prevBodyOverflow = ''
let focusTimer = 0
onMounted(() => {
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  focusTimer = window.setTimeout(() => startBtn.value?.focus(), 50)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.body.style.overflow = prevBodyOverflow
  window.clearTimeout(focusTimer)
  exitTimers.forEach(clearTimeout)
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.adopt-cert {
  position: fixed;
  inset: 0;
  z-index: var(--z-index-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow-y: auto;
  background: radial-gradient(ellipse at center, rgba(69, 26, 3, 0.55), rgba(0, 0, 0, 0.85));
  animation: ac-fade-in 240ms ease;
}

.adopt-cert--exiting {
  animation: ac-fade-out 500ms ease forwards;
  pointer-events: none;
}

.adopt-cert__paper {
  position: relative;
  inline-size: 100%;
  max-inline-size: 780px;
  padding: 20px 32px 18px;
  color: #451a03;
  background:
    repeating-linear-gradient(90deg, rgba(146, 64, 14, 0.025) 0 1px, transparent 1px 5px),
    repeating-linear-gradient(0deg, rgba(146, 64, 14, 0.02) 0 1px, transparent 1px 7px),
    radial-gradient(ellipse at 50% 0%, #fffbeb 0%, #fef3c7 60%, #fde68a 100%);
  border: 3px solid #451a03;
  border-radius: 10px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(146, 64, 14, 0.2);
  animation: ac-rise 380ms cubic-bezier(0.2, 0.9, 0.3, 1.1);
}

.adopt-cert__frame {
  position: absolute;
  inset: 10px;
  border: 1px solid rgba(146, 64, 14, 0.35);
  border-radius: 6px;
  pointer-events: none;
}

.adopt-cert__corner {
  position: absolute;
  opacity: 0.55;
  line-height: 0;
}

.adopt-cert__corner--tl { inset-block-start: 18px; inset-inline-start: 18px; }
.adopt-cert__corner--tr { inset-block-start: 18px; inset-inline-end: 18px; }
.adopt-cert__corner--bl { inset-block-end: 18px; inset-inline-start: 18px; }
.adopt-cert__corner--br { inset-block-end: 18px; inset-inline-end: 18px; }

.adopt-cert__close {
  position: absolute;
  inset-block-start: -14px;
  inset-inline-end: -14px;
  z-index: 5;
  inline-size: 28px;
  block-size: 28px;
  padding: 0;
  border: 3px solid #451a03;
  border-radius: 50%;
  background: #fffbeb;
  color: #451a03;
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(69, 26, 3, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.adopt-cert__close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.adopt-cert__crest {
  inline-size: 52px;
  block-size: 52px;
  margin: 2px auto 4px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fffbeb 0%, #fde68a 55%, #b45309 100%);
  border: 2.5px solid #451a03;
  box-shadow:
    inset 0 -3px 5px rgba(69, 26, 3, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    0 2px 3px rgba(69, 26, 3, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
}

.adopt-cert__titles {
  text-align: center;
  margin-block-end: 4px;
}

.adopt-cert__bureau {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 10px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #7c2d12;
  font-weight: 700;
  margin-block-end: 2px;
}

.adopt-cert__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 30px;
  line-height: 1.05;
  font-weight: 700;
  color: #451a03;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
}

.adopt-cert__title-of {
  font-style: italic;
  font-weight: 400;
}

.adopt-cert__rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-block-start: 4px;
}

.adopt-cert__rule-line {
  flex: 0 0 60px;
  block-size: 1px;
  background: linear-gradient(90deg, transparent, #92400e, transparent);
}

.adopt-cert__rule-mark {
  font-size: 11px;
  color: #92400e;
}

.adopt-cert__preamble {
  margin: 6px 24px 10px;
  text-align: center;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 12.5px;
  line-height: 1.4;
  color: #451a03;
}

.adopt-cert__preamble strong {
  font-weight: 700;
}

.adopt-cert__names {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  color: #7c2d12;
  font-weight: 700;
}

.adopt-cert__cards {
  display: flex;
  gap: 10px;
  margin: 0 4px 22px;
}

/* ── Per-pig stat card ──────────────────────────────────────────────────── */
.cert-card {
  position: relative;
  flex: 1;
  min-inline-size: 0;
  padding: 10px;
  background: linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%);
  border: 2px solid #92400e;
  border-radius: 6px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 1px 2px rgba(69, 26, 3, 0.15);
}

.cert-card__frame {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(146, 64, 14, 0.3);
  border-radius: 4px;
  pointer-events: none;
}

.cert-card__head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-block-end: 6px;
}

.cert-card__portrait {
  inline-size: 60px;
  block-size: 60px;
  flex-shrink: 0;
  background: radial-gradient(circle at 40% 35%, #fff7e6 0%, #fde68a 70%, #fbbf24 100%);
  border: 2px solid #92400e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 -3px 4px rgba(146, 64, 14, 0.18), 0 2px 3px rgba(69, 26, 3, 0.25);
}

.cert-card__id {
  flex: 1;
  min-inline-size: 0;
}

.cert-card__name {
  font-family: 'Caveat', cursive;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  color: #451a03;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cert-card__gender {
  display: inline-block;
  margin-block-start: 2px;
  padding-inline: 7px;
  font-size: 8.5px;
  letter-spacing: 0.14em;
  font-weight: 800;
  text-transform: uppercase;
  color: #fef3c7;
  background: linear-gradient(180deg, #b45309 0%, #7c2d12 100%);
  border: 1px solid #451a03;
  border-radius: 3px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.cert-card__stats {
  display: grid;
  grid-template-columns: 78px 1fr;
  row-gap: 2px;
  column-gap: 8px;
  padding: 6px 2px;
  margin-block-end: 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11.5px;
  color: #451a03;
  border-block-start: 1.5px dashed rgba(146, 64, 14, 0.45);
  border-block-end: 1.5px dashed rgba(146, 64, 14, 0.45);
}

.cert-card__stat-label {
  color: #7c2d12;
  font-weight: 700;
  font-variant: small-caps;
  letter-spacing: 0.04em;
}

.cert-card__stat-value {
  font-weight: 600;
}

.cert-card__stat-value--cap {
  text-transform: capitalize;
}

.cert-card__coat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cert-card__swatch {
  inline-size: 12px;
  block-size: 12px;
  border-radius: 50%;
  border: 1px solid #451a03;
  box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.cert-card__fun {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 11px;
  color: #451a03;
  line-height: 1.25;
}

.cert-card__fun-label {
  color: #7c2d12;
  font-variant: small-caps;
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* ── Signatures + footer (right padding reserves room for the wax seal) ──── */
.adopt-cert__signatures {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin: 14px 8px 4px;
  padding-inline-end: 96px;
}

.adopt-cert__sig {
  text-align: center;
}

.adopt-cert__sig-name {
  block-size: 26px;
  font-family: 'Caveat', cursive;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.1;
  color: #451a03;
}

.adopt-cert__sig-name--you {
  color: #b45309;
  font-style: italic;
}

.adopt-cert__sig-title {
  margin-block-start: 0;
  padding-block-start: 2px;
  border-block-start: 1.5px solid #451a03;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7c2d12;
  font-weight: 700;
}

.adopt-cert__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-start: 18px;
  padding: 6px 4px 0;
  padding-inline-end: 96px;
  border-block-start: 1.5px dashed rgba(146, 64, 14, 0.4);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 10.5px;
  color: #7c2d12;
}

.adopt-cert__meta strong {
  color: #451a03;
}

.adopt-cert__seal {
  position: absolute;
  inset-inline-end: 24px;
  inset-block-end: 70px;
  inline-size: 72px;
  block-size: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f59e0b 0%, #b91c1c 55%, #7f1d1d 100%);
  border: 2px solid #450a0a;
  box-shadow: inset 0 -5px 8px rgba(0, 0, 0, 0.4), 0 5px 8px rgba(69, 26, 3, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-8deg);
}

.adopt-cert__seal-inner {
  inline-size: 60px;
  block-size: 60px;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 255, 255, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fef3c7;
  font-family: Georgia, serif;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
}

.adopt-cert__seal-paw {
  font-size: 18px;
  line-height: 1;
}

.adopt-cert__seal-text {
  font-size: 6.5px;
  letter-spacing: 0.16em;
  font-weight: 800;
  margin-block-start: 1px;
}

.adopt-cert__stamp {
  position: absolute;
  inset-inline-start: 150px;
  inset-block-start: 110px;
  z-index: 20;
  padding: 6px 18px;
  border: 4px solid #b91c1c;
  border-radius: 5px;
  color: #b91c1c;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 900;
  font-size: 34px;
  letter-spacing: 0.18em;
  text-shadow: 1px 1px 0 rgba(185, 28, 28, 0.15);
  background: transparent;
  opacity: 0.78;
  transform: translate(-50%, -50%) rotate(-12deg);
  animation: ac-stamp 600ms cubic-bezier(0.2, 0.9, 0.3, 1.5) forwards;
  mix-blend-mode: multiply;
  pointer-events: none;
}

.adopt-cert__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-block-start: 12px;
}

.adopt-cert__choose {
  padding-inline: 14px;
  block-size: 38px;
  background: transparent;
  color: #7c2d12;
  font-weight: 700;
  font-size: 13px;
  font-family: inherit;
  border: 2px dashed rgba(146, 64, 14, 0.6);
  border-radius: 999px;
  cursor: pointer;
}

.adopt-cert__choose:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.adopt-cert__adopt {
  position: relative;
  padding-inline: 28px;
  block-size: 48px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  font-family: var(--font-family-heading);
  background: linear-gradient(180deg, #ec4899 0%, #db2777 100%);
  border: 3px solid #451a03;
  border-radius: 999px;
  cursor: pointer;
  box-shadow:
    0 8px 14px -3px rgba(219, 39, 119, 0.55),
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(0, 0, 0, 0.18);
  text-shadow: 0 1px 0 rgba(69, 26, 3, 0.25);
  transition: transform 100ms ease, filter 140ms ease;
}

.adopt-cert__adopt:hover:not(:disabled) {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

.adopt-cert__adopt:active:not(:disabled) {
  transform: translateY(2px);
  filter: brightness(0.98);
}

.adopt-cert__adopt:disabled {
  cursor: default;
  opacity: 0.85;
}

@keyframes ac-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ac-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes ac-rise {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes ac-stamp {
  0% { opacity: 0; transform: translate(-50%, -50%) rotate(-18deg) scale(2.4); }
  60% { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(1.08); }
  100% { opacity: 0.78; transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .adopt-cert,
  .adopt-cert__paper,
  .adopt-cert__stamp {
    animation: none;
  }
}
</style>
