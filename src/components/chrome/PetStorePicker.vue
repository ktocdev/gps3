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

      <!-- Adopt CTA bar -->
      <div class="petstore__cta">
        <span class="petstore__cta-text">
          <template v-if="selectedHabitat">
            {{ selectedNames }} {{ selectedPigs.length > 1 ? 'are' : 'is' }} ready to come home with you.
          </template>
          <template v-else>Pick a habitat — adopt the bonded pair inside!</template>
        </span>
        <button class="petstore__adopt" :disabled="!selectedHabitat" @click="adopt">
          Adopt {{ selectedPigs.length > 1 ? 'pair' : 'pig' }}
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
            <div
              v-for="(pig, pi) in h.pigs"
              :key="pig.id"
              class="hutch__pig"
              :style="{ animationDelay: `${pi * 220}ms` }"
            >
              <!-- 2D chrome renders every pig as the American shorthair (breed art deferred) -->
              <PigSvg breed="American" :colors="pigColors(pig)" :eye="pig.appearance.eyeColor" :size="92" :uid="pig.id" />
            </div>
          </div>
          <div class="hutch__plates">
            <div v-for="pig in h.pigs" :key="pig.id" class="hutch__plate">
              <div class="hutch__plate-head">
                <span class="hutch__name">{{ pig.name }}</span>
                <span class="hutch__gender">{{ pig.gender === 'male' ? '♂' : '♀' }}</span>
              </div>
              <div class="hutch__breed">{{ pig.breed }}</div>
              <div class="hutch__swatches">
                <span
                  class="hutch__swatch"
                  :style="{ background: furHex(pig.appearance.furColor) }"
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
import { computed, ref } from 'vue'
import PigSvg from './PigSvg.vue'
import PetStoreBackdrop from './PetStoreBackdrop.vue'
import AdoptionCertificate from './AdoptionCertificate.vue'
import { pigColors, furHex } from './pigColor'
import { usePetStoreManager } from '../../stores/petStoreManager'
import type { GuineaPig } from '../../stores/guineaPigStore'

const petStoreManager = usePetStoreManager()

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

function select(id: number) {
  selectedHabitat.value = selectedHabitat.value === id ? null : id
  errorMessage.value = null
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
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 8px;
  min-block-size: 130px;
  padding: 10px;
  background: linear-gradient(180deg, #fffef5 0%, #fdf3c4 100%);
  border-radius: 12px;
  border: 2px solid var(--color-wood-dark);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .5), inset 0 -8px 16px -4px rgba(146, 64, 14, .25);
}

.hutch__pig {
  animation: hutch-bob 2600ms ease-in-out infinite;
}

@keyframes hutch-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
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
  .hutch__pig { animation: none; }
}
</style>
