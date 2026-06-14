<script lang="ts">
export const FUR_COLORS: Record<string, string> = {
  // Common
  White:     '#f5f5f0',
  Black:     '#2a2520',
  Brown:     '#8b5a2b',
  Cream:     '#f5e6c8',
  Tortoise:  '#b8651e',
  Tricolor:  '#d9b27c',
  Orange:    '#e8862a',
  Gray:      '#8a8a86',
  // Uncommon
  Red:       '#db3a00',
  Gold:      '#daa520',
  Beige:     '#f5f5dc',
  // Rare
  Chocolate: '#5c3317',
  Lilac:     '#c8a2c8',
  Buff:      '#f0dc82',
  Dalmatian: '#f5f5f5',
}

export type Breed   = 'American' | 'Abyssinian' | 'Peruvian' | 'Teddy' | 'Silkie'
export type SpotKey = 'face' | 'neck' | 'back' | 'belly'

export const EYE_COLORS: Record<string, string> = {
  brown: '#5c4033',
  black: '#111111',
  red:   '#8b0000',
  blue:  '#4169e1',
  pink:  '#ffc0cb',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const FOOT_COLOR  = '#f0a8a8'
const BLUSH_COLOR = '#f4b6b6'
const NOSE_COLOR  = '#dd8888'

// Standard DesktopPig body silhouette
const BODY_PATH =
  'M 30 90 C 8 75 12 45 40 38 C 70 30 110 34 140 40 C 165 46 175 65 168 78 C 162 90 145 96 110 98 C 70 100 35 98 30 90 Z'

// Teddy: bumpy scalloped top edge, same smooth bottom
const TEDDY_PATH =
  'M 30 90 C 8 75 20 45 40 38 Q 50 26 60 40 Q 70 26 80 40 Q 90 26 100 40 Q 110 28 122 40 Q 132 30 142 40 C 165 46 175 65 168 78 C 162 90 145 96 110 98 C 70 100 35 98 30 90 Z'

// Abyssinian: plump bean body — rounder and taller than the American oval
const ABYSSINIAN_PATH =
  'M 26 86 C 4 70 10 42 38 34 C 66 27 102 29 132 35 C 162 42 178 58 170 74 C 162 89 142 97 108 98 C 70 100 32 97 26 86 Z'

// Peruvian: same bean body as the Abyssinian but with a smaller rear bump; coat drawn separately
const PERUVIAN_PATH =
  'M 32 86 C 14 72 16 44 42 35 C 70 28 102 30 132 36 C 162 43 178 58 170 74 C 162 89 142 97 108 98 C 72 100 38 96 32 86 Z'

const props = withDefaults(defineProps<{
  breed?: 'American' | 'Abyssinian' | 'Peruvian' | 'Teddy' | 'Silkie'
  colors?: string[]
  spots?: Partial<Record<'face' | 'neck' | 'back' | 'belly', string>>
  eye?: string
  size?: number
  uid?: string
}>(), {
  breed: 'American',
  colors: () => ['Orange'],
  eye: 'black',
  size: 110,
  uid: 'default',
})

const hex = computed(() => props.colors.map(c => FUR_COLORS[c] ?? c))

// c0 = base body, c1 = saddle/ear patch, c2 = rear/face patch
const c0 = computed(() => hex.value[0])
const c1 = computed(() => hex.value[1] ?? null)
const c2 = computed(() => hex.value[2] ?? null)

const earColor    = computed(() => c1.value ?? c0.value)
const saddleColor = computed(() => c1.value)
const rearColor   = computed(() => c2.value ?? c1.value)
const bodyPath    = computed(() =>
  props.breed === 'Teddy'        ? TEDDY_PATH
  : props.breed === 'Abyssinian' ? ABYSSINIAN_PATH
  : props.breed === 'Peruvian'   ? PERUVIAN_PATH
  : BODY_PATH)
const clipId      = computed(() => `pig-clip-${props.uid}`)
const svgH        = computed(() => props.size * (120 / 180))

const eyeHex = computed(() => EYE_COLORS[props.eye] ?? props.eye)

// Feet are black when the lower-body area carries black fur.
// A black saddle alone doesn't darken the feet.
const footColor = computed(() => {
  const black = FUR_COLORS['Black']
  if (
    c0.value === black ||
    spotHex.value.belly === black ||
    rearColor.value === black
  ) return black
  return FOOT_COLOR
})

// Named per-spot colors — each key independently overrides a patch position
const spotHex = computed(() => {
  const s = props.spots
  if (!s) return {} as Partial<Record<'face' | 'neck' | 'back' | 'belly', string>>
  const out: Partial<Record<'face' | 'neck' | 'back' | 'belly', string>> = {}
  for (const k of ['face', 'neck', 'back', 'belly'] as const) {
    const v = s[k]
    if (v !== undefined) out[k] = FUR_COLORS[v] ?? v
  }
  return out
})

// ── Abyssinian fur ───────────────────────────────────────────
// Shade a hex color toward black (amt<0) or white (amt>0)
function shade(color: string, amt: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color
  const n = parseInt(color.slice(1), 16)
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const r = Math.round(((n >> 16) & 255) * (1 - p) + t * p)
  const g = Math.round(((n >> 8)  & 255) * (1 - p) + t * p)
  const b = Math.round((n & 255)         * (1 - p) + t * p)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

const furDark  = computed(() => shade(c0.value, -0.24))
const furLight = computed(() => shade(c0.value,  0.20))

// Deterministic pseudo-random in [0,1) from an integer seed
function rand(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

// Rosette whorl centers — fur radiates outward from each (sunburst)
const ABY_CENTERS = [[40, 56], [70, 50], [100, 52], [126, 56], [74, 80]]

// Fine fur strokes covering the body, each radiating from the nearest rosette
const abyFur = computed(() => {
  if (props.breed !== 'Abyssinian') return []
  const out: { x1: number; y1: number; x2: number; y2: number; light: boolean }[] = []
  let i = 0
  for (let x = 32; x <= 162; x += 6) {
    for (let y = 40; y <= 92; y += 6) {
      i++
      let best = ABY_CENTERS[0], bd = Infinity
      for (const c of ABY_CENTERS) {
        const d = (c[0] - x) ** 2 + (c[1] - y) ** 2
        if (d < bd) { bd = d; best = c }
      }
      const ang = Math.atan2(y - best[1], x - best[0]) + (rand(i) - 0.5) * 1.0
      const len = 4.5 + rand(i + 99) * 3
      const x1  = x + (rand(i + 7)  - 0.5) * 4
      const y1  = y + (rand(i + 13) - 0.5) * 4
      out.push({
        x1, y1,
        x2: x1 + Math.cos(ang) * len,
        y2: y1 + Math.sin(ang) * len,
        light: rand(i + 31) > 0.62,
      })
    }
  }
  return out
})

// Fluffy rounded tufts along the top edge — taller at rear (left) and crest (right)
const ABY_TUFTS = [
  [30, 42, 8], [37, 34, 9], [47, 30, 9], [57, 32, 8],     // rear cluster
  [68, 33, 7], [80, 32, 7], [92, 33, 7],                  // mid back
  [104, 32, 8], [116, 29, 9], [126, 31, 9], [136, 39, 7], // crest cluster
]

// Teddy fur tuft positions along top edge
const TUFTS    = [[50, 40], [66, 33], [82, 34], [98, 34], [114, 37], [130, 41]]
</script>

<template>
  <svg
    :width="size"
    :height="svgH"
    viewBox="0 0 180 120"
    :aria-label="`${breed} guinea pig`"
    style="display:block;overflow:visible"
  >
    <defs>
      <clipPath :id="clipId">
        <path :d="bodyPath" />
      </clipPath>
    </defs>

    <!-- Ground shadow -->
    <ellipse cx="92" cy="108" rx="70" ry="5" fill="#000" opacity="0.12" />

    <!-- Silkie: sleek coat behind body -->
    <template v-if="breed === 'Silkie'">
      <path
        d="M 36 91 Q 30 104 34 112 Q 46 118 60 110 Q 74 118 88 110 Q 102 116 116 106 Q 126 110 134 100 Q 138 94 138 90"
        :fill="c0"
        opacity=".88"
      />
    </template>

    <!-- Far-side feet (hidden under the Peruvian's skirt) -->
    <template v-if="breed !== 'Peruvian'">
      <ellipse cx="62" cy="99" rx="6" ry="4" :fill="footColor" opacity="0.6" />
      <ellipse cx="125" cy="97" rx="6" ry="4" :fill="footColor" opacity="0.6" />
    </template>

    <!-- Far ear (flat, folded — no inner color) -->
    <ellipse cx="146" cy="40" rx="9" ry="8" :fill="earColor" />

    <!-- Abyssinian: fluffy rounded tufts (before body so body covers their bases) -->
    <template v-if="breed === 'Abyssinian'">
      <circle v-for="(t, i) in ABY_TUFTS" :key="i" :cx="t[0]" :cy="t[1]" :r="t[2]" :fill="c0" />
    </template>

    <!-- Body -->
    <path :d="bodyPath" :fill="c0" />

    <!-- Clipped color patches + breed body textures -->
    <g :clip-path="`url(#${clipId})`">
      <ellipse v-if="saddleColor" cx="58"  cy="46" rx="50" ry="22" :fill="saddleColor" />
      <ellipse v-if="rearColor"   cx="68"  cy="88" rx="40" ry="14" :fill="rearColor" />
      <ellipse v-if="rearColor"   cx="142" cy="72" rx="32" ry="24" :fill="rearColor" />
      <ellipse v-if="saddleColor" cx="120" cy="44" rx="14" ry="9"  :fill="saddleColor" />

      <!-- Named spots — each independently colored, rendered over base patches -->
      <ellipse v-if="spotHex.back"   cx="58"  cy="46" rx="50" ry="22" :fill="spotHex.back" />
      <ellipse v-if="spotHex.belly"  cx="68"  cy="88" rx="40" ry="14" :fill="spotHex.belly" />
      <ellipse v-if="spotHex.face"   cx="142" cy="72" rx="32" ry="24" :fill="spotHex.face" />
      <ellipse v-if="spotHex.neck"   cx="120" cy="44" rx="14" ry="9"  :fill="spotHex.neck" />

      <!-- Abyssinian: fine diffused fur — short strokes radiating from each rosette -->
      <template v-if="breed === 'Abyssinian'">
        <line v-for="(f, i) in abyFur" :key="i"
          :x1="f.x1" :y1="f.y1" :x2="f.x2" :y2="f.y2"
          :stroke="f.light ? furLight : furDark"
          stroke-width="1" stroke-linecap="round"
          :opacity="f.light ? 0.3 : 0.38"
        />
      </template>

      <!-- Teddy: fur tuft dots along scalloped top edge -->
      <template v-if="breed === 'Teddy'">
        <circle v-for="(pos, i) in TUFTS" :key="i"
          :cx="pos[0]" :cy="pos[1]" r="5" :fill="c0" opacity="0.45"
        />
      </template>

      <!-- Silkie: silky sheen lines -->
      <template v-if="breed === 'Silkie'">
        <path
          d="M 130 52 Q 108 68 82 80 Q 56 90 34 93"
          fill="none" stroke="#fff" stroke-width="1.5" opacity="0.22" stroke-linecap="round"
        />
        <path
          d="M 126 62 Q 104 76 78 86 Q 52 94 33 97"
          fill="none" stroke="#fff" stroke-width="1" opacity="0.16" stroke-linecap="round"
        />
      </template>
    </g>

    <!-- Near ear -->
    <ellipse cx="128" cy="44" rx="9" ry="10" :fill="earColor" />

    <!-- Near-side feet (hidden under the Peruvian's skirt) -->
    <template v-if="breed !== 'Peruvian'">
      <ellipse cx="50"  cy="101" rx="7" ry="4" :fill="footColor" />
      <ellipse cx="115" cy="101" rx="7" ry="4" :fill="footColor" />
    </template>

    <!-- Peruvian: long skirt flaring outward over the feet, tail tip at rear, + tall forward crest -->
    <template v-if="breed === 'Peruvian'">
      <!-- long ruffly fur skirt — flares out below the body and drapes low, tapering to a tail tip -->
      <path
        d="M 144 74 C 158 84 164 96 159 106 Q 150 114 141 104 Q 132 115 123 104 Q 114 115 105 104 Q 96 115 87 104 Q 78 115 69 103 Q 60 114 51 102 Q 42 112 33 100 Q 24 109 16 97 C 9 93 5 91 5 85 C 9 79 22 72 44 70 C 82 67 118 68 144 74 Z"
        :fill="c0"
      />

      <!-- flowing hair locks sweeping back from the head -->
      <path d="M 138 52 Q 88 70 30 92"  :stroke="furDark" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 140 62 Q 90 80 34 100" :stroke="furDark" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.14" />
      <path d="M 128 46 Q 80 62 26 84"  :stroke="furDark" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.12" />

      <!-- lock separators along the ruffly hem -->
      <path d="M 141 92 Q 140 100 141 104" :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 123 92 Q 122 100 123 104" :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 105 92 Q 104 100 105 104" :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 87 92  Q 86 100 87 104"   :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 69 91  Q 68 99 69 103"    :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 51 90  Q 50 98 51 102"    :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />
      <path d="M 33 88  Q 30 96 28 100"    :stroke="furDark" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.16" />

    </template>

    <!-- Eye -->
    <circle cx="150"   cy="66"   r="3.2" :fill="eyeHex" />
    <circle cx="150"   cy="66"   r="1.6" fill="#000"    opacity="0.35" />
    <circle cx="150.8" cy="64.8" r="1.1" fill="#fff"    opacity="0.9" />

    <!-- Blush -->
    <ellipse cx="156" cy="80" rx="7" ry="4" :fill="BLUSH_COLOR" opacity="0.55" />

    <!-- Nose -->
    <ellipse cx="168" cy="74" rx="2.8" ry="2" :fill="NOSE_COLOR" />

    <!-- Mouth -->
    <path d="M 163 80 q 2.5 2 5 0" stroke="#7a4040" stroke-width="0.8" fill="none" stroke-linecap="round" />
  </svg>
</template>
