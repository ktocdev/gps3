<template>
  <div
    class="intro"
    :class="{ 'intro--gone': phase === 'gone' }"
    @click="skip"
  >
    <!-- Soft sun/spotlight that swells on reveal -->
    <div class="intro__sun" :class="{ 'intro__sun--reveal': revealing }" aria-hidden="true"></div>

    <!-- The herd -->
    <div class="intro__herd" aria-hidden="true">
      <div
        v-for="(p, i) in PIGS"
        :key="i"
        class="intro-pig"
        :style="pigStyle(p, i)"
      >
        <div :class="{ 'intro-bob': phase === 'reveal' }" :style="{ animationDelay: `${i * 80}ms` }">
          <!-- 2D chrome renders every pig as the American shorthair (breed art deferred) -->
          <PigSvg breed="American" :colors="p.colors" :size="p.size" :uid="`intro-${i}`" />
        </div>
      </div>
    </div>

    <!-- Wordmark -->
    <div class="intro__title">
      <div class="intro__wordmark" :class="{ 'intro__wordmark--reveal': revealing }">
        GPS<span class="intro__wordmark-num">3</span>
      </div>
      <div class="intro__tagline" :class="{ 'intro__tagline--reveal': revealing }">
        Guinea Pig Simulator
      </div>
      <div class="intro__continue" :class="{ 'intro__continue--reveal': revealing }">
        click anywhere to continue
      </div>
    </div>

    <!-- Skip hint -->
    <div class="intro__skip">
      <span>Click to skip intro</span>
      <span aria-hidden="true">→</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import PigSvg from './PigSvg.vue'

const emit = defineEmits<{ done: [] }>()

type Phase = 'run' | 'drop' | 'reveal' | 'gone'
const phase = ref<Phase>('run')
const revealing = ref(false)

interface IntroPig {
  colors: string[]
  size: number
  lane: 0 | 1 | 2
  startDelay: number
  speed: number
}

// lanes 0 + 2 run left→right, lane 1 runs right→left
const PIGS: IntroPig[] = [
  { colors: ['Cream'], size: 92, lane: 0, startDelay: 0, speed: 1.0 },
  { colors: ['Gray'], size: 96, lane: 1, startDelay: 140, speed: 0.98 },
  { colors: ['Orange'], size: 100, lane: 2, startDelay: 280, speed: 0.86 },
  { colors: ['Brown'], size: 88, lane: 0, startDelay: 420, speed: 1.06 },
  { colors: ['Tortoise'], size: 84, lane: 1, startDelay: 560, speed: 0.92 },
  { colors: ['Black'], size: 82, lane: 2, startDelay: 700, speed: 1.04 },
  { colors: ['Tricolor'], size: 92, lane: 0, startDelay: 840, speed: 0.9 }
]

const LANE_TOPS = ['56%', '66%', '76%']
const RUN_TRAVEL_MS = 1800

const timers: number[] = []

function pigStyle(p: IntroPig, index: number): Record<string, string | number> {
  const flip = p.lane === 1 ? -1 : 1
  // settled position used by drop + reveal
  const slot = (index + 0.5) / PIGS.length - 0.5
  const settledLeft = `calc(50% + ${slot * 86}vw - ${p.size / 2}px)`
  const base: Record<string, string | number> = {
    width: `${p.size}px`,
    zIndex: 10 + p.lane
  }

  if (phase.value === 'run') {
    const travelMs = Math.round(RUN_TRAVEL_MS / p.speed)
    const scoot = p.lane === 1 ? 'intro-scoot-l' : 'intro-scoot-r'
    return {
      ...base,
      top: LANE_TOPS[p.lane],
      transform: `scaleX(${flip})`,
      animation:
        `intro-hop 420ms ease-in-out ${p.startDelay}ms infinite, ` +
        `${scoot} ${travelMs}ms linear ${p.startDelay}ms 1 both`
    }
  }

  if (phase.value === 'drop') {
    return {
      ...base,
      top: '78%',
      left: settledLeft,
      ['--sx']: String(flip),
      transform: `translateY(calc(-100vh - 50%)) scaleX(${flip}) scale(0.9)`,
      opacity: 0,
      animation: `intro-drop 1100ms cubic-bezier(.22,.61,.36,1) ${index * 70}ms forwards`
    }
  }

  // reveal / gone
  return {
    ...base,
    top: '78%',
    left: settledLeft,
    transform: `scaleX(${flip})`,
    opacity: 1
  }
}

function finish() {
  if (phase.value === 'gone') return
  phase.value = 'gone'
  window.setTimeout(() => emit('done'), 380)
}

function skip() {
  if (phase.value === 'run' || phase.value === 'drop') {
    timers.forEach(clearTimeout)
    timers.length = 0
    phase.value = 'reveal'
    revealing.value = true
    return
  }
  if (phase.value === 'reveal') finish()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') skip()
}

onMounted(() => {
  timers.push(window.setTimeout(() => { phase.value = 'drop' }, 3200))
  timers.push(window.setTimeout(() => { phase.value = 'reveal'; revealing.value = true }, 4900))
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', onKey)
})
</script>

<style>
.intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  overflow: hidden;
  cursor: pointer;
  font-family: var(--font-family-heading);
  background: radial-gradient(ellipse at 50% 35%, #fff7e0 0%, #fde8b8 50%, #f5cf80 100%);
  opacity: 1;
  transition: opacity 540ms ease;
}

.intro--gone {
  opacity: 0;
  pointer-events: none;
}

.intro__sun {
  position: absolute;
  left: 50%;
  top: 38%;
  inline-size: 720px;
  block-size: 720px;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.6);
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 236, 179, 0.5) 35%, rgba(255, 236, 179, 0) 70%);
  opacity: 0.4;
  transition: opacity 900ms ease, transform 1100ms cubic-bezier(.34, 1.56, .64, 1);
  pointer-events: none;
}

.intro__sun--reveal {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.6);
}

.intro__herd {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.intro-pig {
  position: absolute;
  will-change: transform, left, top;
}

.intro__title {
  position: absolute;
  inset-inline: 0;
  top: 32%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}

.intro__wordmark {
  font-family: var(--font-family-heading);
  font-weight: 700;
  font-size: clamp(120px, 18vw, 240px);
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: var(--color-wood-dark);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, .7),
    0 4px 0 var(--color-wood-mid),
    0 8px 0 var(--color-wood-shadow),
    0 18px 30px rgba(120, 53, 15, .35);
  opacity: 0;
  transform: scale(0.6) translateY(40px);
  transition: opacity 540ms ease 80ms, transform 700ms cubic-bezier(.34, 1.56, .64, 1) 80ms;
}

.intro__wordmark--reveal {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.intro__wordmark-num {
  color: var(--color-pink-deep);
  text-shadow:
    0 1px 0 rgba(255, 255, 255, .7),
    0 4px 0 var(--color-pink-700),
    0 8px 0 var(--color-pink-800),
    0 18px 30px rgba(159, 18, 57, .35);
}

.intro__tagline {
  margin-top: 4px;
  font-family: var(--font-family-heading);
  font-weight: 400;
  font-size: clamp(20px, 2.4vw, 30px);
  color: var(--color-wood-shadow);
  letter-spacing: 0.04em;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 540ms ease 360ms, transform 540ms ease 360ms;
}

.intro__tagline--reveal {
  opacity: 0.95;
  transform: translateY(0);
}

.intro__continue {
  margin-top: 10px;
  font-family: var(--font-family-body);
  font-weight: 500;
  font-size: 12px;
  color: rgba(120, 53, 15, .5);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 540ms ease 720ms;
}

.intro__continue--reveal {
  opacity: 1;
}

.intro__skip {
  position: absolute;
  right: 22px;
  bottom: 18px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(255, 247, 224, .7);
  border: 1.5px solid rgba(120, 53, 15, .35);
  border-radius: var(--radius-full);
  font-family: var(--font-family-body);
  font-weight: 600;
  font-size: 13px;
  color: var(--color-wood-dark);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 4px 8px rgba(120, 53, 15, .18), inset 0 1px 0 rgba(255, 255, 255, .6);
  pointer-events: none;
}

@keyframes intro-hop {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -10px; }
}

@keyframes intro-scoot-r {
  from { left: -20vw; }
  to { left: 110vw; }
}

@keyframes intro-scoot-l {
  from { left: 110vw; }
  to { left: -20vw; }
}

@keyframes intro-drop {
  0% { opacity: 0; transform: translateY(calc(-100vh - 50%)) scaleX(var(--sx, 1)) scale(0.9); }
  30% { opacity: 1; }
  100% { opacity: 1; transform: translateY(0) scaleX(var(--sx, 1)) scale(1); }
}

.intro-bob {
  animation: intro-bob 1100ms ease-in-out infinite;
}

@keyframes intro-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}

@media (prefers-reduced-motion: reduce) {
  .intro-pig, .intro-bob { animation: none !important; }
}
</style>
