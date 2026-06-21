<template>
  <!--
    Pet-shop scenery scattered behind the "Pick your bonded pair" screen.
    All shapes are inline SVG — no external assets. The layer is full-bleed
    (100vw, centred on the screen) and spans the picker's full scroll height,
    so it must be the first child of a `position: relative` ancestor. Low
    opacity / desaturated palette keeps it from competing with the cage cards.
  -->
  <div class="psbk" aria-hidden="true">
    <!-- Window — top-left, hung on the wall -->
    <div class="psbk__slot psbk__window">
      <svg viewBox="0 0 220 240" width="210" height="229">
        <rect x="6" y="6" width="208" height="228" rx="6" fill="#fff7e6" stroke="#92400e" stroke-width="6" />
        <rect x="0" y="222" width="220" height="14" rx="3" fill="#92400e" />
        <rect x="18" y="18" width="88" height="98" fill="#bfe2f4" />
        <rect x="114" y="18" width="88" height="98" fill="#bfe2f4" />
        <rect x="18" y="124" width="88" height="98" fill="#a9d6ec" />
        <rect x="114" y="124" width="88" height="98" fill="#a9d6ec" />
        <rect x="104" y="14" width="12" height="212" fill="#fff7e6" stroke="#92400e" stroke-width="3" />
        <rect x="14" y="116" width="192" height="10" fill="#fff7e6" stroke="#92400e" stroke-width="3" />
        <ellipse cx="46" cy="46" rx="18" ry="7" fill="#fff" opacity=".9" />
        <ellipse cx="58" cy="42" rx="12" ry="6" fill="#fff" opacity=".9" />
        <ellipse cx="156" cy="62" rx="20" ry="8" fill="#fff" opacity=".9" />
        <path d="M150 38 q5 -5 10 0 q5 -5 10 0" stroke="#5a7385" stroke-width="2" fill="none" />
        <circle cx="180" cy="40" r="14" fill="#ffd97a" opacity=".7" />
      </svg>
    </div>

    <!-- Habitats row — top-right, like a shelf of empty starter cages -->
    <div class="psbk__slot psbk__habitats">
      <svg viewBox="0 0 280 180" width="260" height="167">
        <rect x="0" y="148" width="280" height="10" fill="#92400e" />
        <rect x="0" y="158" width="280" height="4" fill="#5c2a0a" />
        <!-- Cage 1 -->
        <g transform="translate(10 60)">
          <rect x="0" y="0" width="80" height="88" fill="#fde8b8" stroke="#92400e" stroke-width="3" rx="4" />
          <line x1="12" y1="4" x2="12" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="24" y1="4" x2="24" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="36" y1="4" x2="36" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="48" y1="4" x2="48" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="60" y1="4" x2="60" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="72" y1="4" x2="72" y2="84" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <rect x="3" y="74" width="74" height="12" fill="#e9c878" rx="2" />
          <rect x="58" y="14" width="6" height="22" fill="#a9d6ec" stroke="#3a5a72" stroke-width="1" rx="1" />
        </g>
        <!-- Cage 2 -->
        <g transform="translate(100 50)">
          <rect x="0" y="0" width="80" height="98" fill="#fbcfe8" stroke="#92400e" stroke-width="3" rx="4" />
          <line x1="12" y1="4" x2="12" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="24" y1="4" x2="24" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="36" y1="4" x2="36" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="48" y1="4" x2="48" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="60" y1="4" x2="60" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="72" y1="4" x2="72" y2="94" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <rect x="3" y="84" width="74" height="12" fill="#e9c878" rx="2" />
          <path d="M28 84 q12 -16 24 0 Z" fill="#fff" stroke="#92400e" stroke-width="1.5" />
        </g>
        <!-- Cage 3 -->
        <g transform="translate(190 64)">
          <rect x="0" y="0" width="80" height="84" fill="#bbf7d0" stroke="#92400e" stroke-width="3" rx="4" />
          <line x1="12" y1="4" x2="12" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="24" y1="4" x2="24" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="36" y1="4" x2="36" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="48" y1="4" x2="48" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="60" y1="4" x2="60" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <line x1="72" y1="4" x2="72" y2="80" stroke="#92400e" stroke-width="1.5" opacity=".7" />
          <rect x="3" y="70" width="74" height="12" fill="#e9c878" rx="2" />
          <ellipse cx="40" cy="74" rx="14" ry="5" fill="#c4a55a" />
        </g>
        <!-- Shelf brackets -->
        <path d="M14 158 L14 174 L24 174" stroke="#5c2a0a" stroke-width="3" fill="none" />
        <path d="M266 158 L266 174 L256 174" stroke="#5c2a0a" stroke-width="3" fill="none" />
      </svg>
    </div>

    <!-- Potted plant — mid-left -->
    <div class="psbk__slot psbk__plant-1">
      <svg viewBox="0 0 120 160" width="170" height="227">
        <g transform="translate(60 78)">
          <ellipse cx="-22" cy="-30" rx="14" ry="34" fill="#5b8c3e" transform="rotate(-30 -22 -30)" opacity=".95" />
          <ellipse cx="22" cy="-32" rx="14" ry="36" fill="#6ba348" transform="rotate(28 22 -32)" opacity=".95" />
          <ellipse cx="-6" cy="-38" rx="13" ry="40" fill="#7cb854" opacity=".95" />
          <ellipse cx="12" cy="-40" rx="11" ry="34" fill="#8ec964" transform="rotate(14 12 -40)" opacity=".95" />
          <ellipse cx="-14" cy="-20" rx="10" ry="22" fill="#4f7a36" transform="rotate(-50 -14 -20)" opacity=".9" />
          <path d="M-22 -54 Q-22 -30 -22 -8" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
          <path d="M22 -56 Q22 -32 22 -10" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
          <path d="M-6 -74 Q-6 -42 -6 -10" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
        </g>
        <path d="M16 80 L104 80 L100 90 L20 90 Z" fill="#c97b4d" />
        <path d="M22 90 L98 90 L92 148 L28 148 Z" fill="#b46339" />
        <path d="M22 90 L98 90 L92 148 L28 148 Z" fill="url(#psbk-pot-a)" opacity=".4" />
        <path d="M28 92 Q34 100 32 144" stroke="#d99064" stroke-width="3" fill="none" opacity=".7" />
        <defs>
          <linearGradient id="psbk-pot-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#fff" stop-opacity=".25" />
            <stop offset="50%" stop-color="#fff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000" stop-opacity=".35" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Wooden chair — mid-right -->
    <div class="psbk__slot psbk__chair">
      <svg viewBox="0 0 120 180" width="150" height="225">
        <rect x="20" y="20" width="10" height="148" fill="#8b5a2b" rx="2" />
        <rect x="90" y="20" width="10" height="148" fill="#8b5a2b" rx="2" />
        <rect x="14" y="92" width="9" height="76" fill="#a06b34" rx="2" />
        <rect x="97" y="92" width="9" height="76" fill="#a06b34" rx="2" />
        <rect x="10" y="78" width="100" height="14" fill="#a87445" rx="2" />
        <rect x="10" y="78" width="100" height="14" fill="url(#psbk-seat)" opacity=".5" />
        <rect x="30" y="28" width="60" height="6" fill="#a87445" rx="2" />
        <rect x="30" y="42" width="60" height="6" fill="#a87445" rx="2" />
        <rect x="30" y="56" width="60" height="6" fill="#a87445" rx="2" />
        <rect x="14" y="130" width="92" height="6" fill="#8b5a2b" rx="2" />
        <ellipse cx="60" cy="78" rx="48" ry="6" fill="#e6b07d" opacity=".6" />
        <defs>
          <linearGradient id="psbk-seat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fff" stop-opacity=".4" />
            <stop offset="100%" stop-color="#000" stop-opacity=".3" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <!-- Treats box — bottom-left, tucked slightly off-edge.
         Oblique projection: front face + slanted right side + open top.
         The clipPath masks the items so the box walls occlude them. -->
    <div class="psbk__slot psbk__treats">
      <svg viewBox="0 0 200 170" width="170" height="145">
        <defs>
          <linearGradient id="psbk-treats-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#c79b6a" />
            <stop offset="100%" stop-color="#9a6c43" />
          </linearGradient>
          <linearGradient id="psbk-treats-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a87a4f" />
            <stop offset="100%" stop-color="#754f2e" />
          </linearGradient>
          <clipPath id="psbk-treats-clip">
            <path d="M-200,-200 L400,-200 L400,45 L185,45 L170,60 L30,60 L45,45 L-200,45 Z" />
          </clipPath>
        </defs>
        <path d="M30,60 L170,60 L185,45 L45,45 Z" fill="#3d2410" />
        <path d="M30,60 L170,60 L177,52 L37,52 Z" fill="#52331a" opacity=".7" />
        <g clip-path="url(#psbk-treats-clip)">
          <g transform="translate(112 22) rotate(8)">
            <rect x="0" y="0" width="40" height="34" fill="#e3c17a" rx="2" />
            <line x1="2" y1="6" x2="38" y2="6" stroke="#b89546" stroke-width="1" />
            <line x1="2" y1="14" x2="38" y2="14" stroke="#b89546" stroke-width="1" />
            <line x1="2" y1="22" x2="38" y2="22" stroke="#b89546" stroke-width="1" />
            <line x1="2" y1="30" x2="38" y2="30" stroke="#b89546" stroke-width="1" />
            <rect x="14" y="-3" width="6" height="40" fill="#8b5a2b" opacity=".7" />
          </g>
          <rect x="50" y="14" width="6" height="50" fill="#a87445" transform="rotate(-14 53 39)" />
          <rect x="60" y="10" width="6" height="52" fill="#bd8a55" transform="rotate(-6 63 36)" />
          <circle cx="44" cy="52" r="11" fill="#d94a4a" />
          <path d="M44 41 q2 -6 6 -6" stroke="#5b8c3e" stroke-width="2" fill="none" />
          <ellipse cx="41" cy="48" rx="2" ry="3" fill="#fff" opacity=".5" />
        </g>
        <path d="M170,60 L185,45 L185,135 L170,150 Z" fill="url(#psbk-treats-side)" />
        <path d="M170,60 L185,45" stroke="#dcb380" stroke-width="1.5" fill="none" />
        <path d="M30,60 L170,60 L170,150 L30,150 Z" fill="url(#psbk-treats-front)" />
        <path d="M30,60 L170,60" stroke="#e3c08a" stroke-width="2.5" fill="none" />
        <path d="M30,150 L170,150" stroke="#5c3a1f" stroke-width="1.5" fill="none" />
        <path d="M170,60 L170,150" stroke="#7a5430" stroke-width="1" fill="none" opacity=".5" />
        <path d="M33,58 L167,58 L182,46 L48,46 Z" fill="none" stroke="#dcb380" stroke-width="1" opacity=".55" />
        <path d="M30,60 L170,60 L185,45 L45,45 Z" fill="none" stroke="#5c3a1f" stroke-width="1.2" opacity=".65" />
        <g transform="translate(58 100) rotate(-4)">
          <rect x="0" y="0" width="80" height="22" fill="#fff7e6" stroke="#92400e" stroke-width="2" rx="2" />
          <text x="40" y="16" text-anchor="middle" font-family="'Gaegu', cursive" font-size="14" font-weight="700" fill="#92400e">TREATS</text>
        </g>
      </svg>
    </div>

    <!-- A second, smaller potted plant — bottom-right for balance -->
    <div class="psbk__slot psbk__plant-2">
      <svg viewBox="0 0 120 160" width="130" height="173">
        <g transform="translate(60 78)">
          <ellipse cx="-22" cy="-30" rx="14" ry="34" fill="#5b8c3e" transform="rotate(-30 -22 -30)" opacity=".95" />
          <ellipse cx="22" cy="-32" rx="14" ry="36" fill="#6ba348" transform="rotate(28 22 -32)" opacity=".95" />
          <ellipse cx="-6" cy="-38" rx="13" ry="40" fill="#7cb854" opacity=".95" />
          <ellipse cx="12" cy="-40" rx="11" ry="34" fill="#8ec964" transform="rotate(14 12 -40)" opacity=".95" />
          <ellipse cx="-14" cy="-20" rx="10" ry="22" fill="#4f7a36" transform="rotate(-50 -14 -20)" opacity=".9" />
          <path d="M-22 -54 Q-22 -30 -22 -8" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
          <path d="M22 -56 Q22 -32 22 -10" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
          <path d="M-6 -74 Q-6 -42 -6 -10" stroke="#3d5f29" stroke-width="1.2" fill="none" opacity=".5" />
        </g>
        <path d="M16 80 L104 80 L100 90 L20 90 Z" fill="#c97b4d" />
        <path d="M22 90 L98 90 L92 148 L28 148 Z" fill="#b46339" />
        <path d="M22 90 L98 90 L92 148 L28 148 Z" fill="url(#psbk-pot-b)" opacity=".4" />
        <path d="M28 92 Q34 100 32 144" stroke="#d99064" stroke-width="3" fill="none" opacity=".7" />
        <defs>
          <linearGradient id="psbk-pot-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#fff" stop-opacity=".25" />
            <stop offset="50%" stop-color="#fff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000" stop-opacity=".35" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
// Purely decorative — no props, no state. Positioning/opacity live in scoped CSS.
</script>

<style scoped>
/*
  Full-bleed layer: 100vw centred on the screen, spanning the picker's full
  scroll height (inset-block: 0 against the positioned .petstore__inner).
  z-index 0 sits below .petstore__content (z-index 1). overflow: hidden clips
  decorations that hang past the screen edges.
*/
.psbk {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 50%;
  inline-size: 100vw;
  transform: translateX(-50%);
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.psbk__slot {
  position: absolute;
}

.psbk__slot > svg {
  display: block;
}

.psbk__window {
  inset-block-start: 24px;
  inset-inline-start: -30px;
  opacity: 0.55;
  transform: rotate(-2deg);
}

.psbk__habitats {
  inset-block-start: 60px;
  inset-inline-end: -40px;
  opacity: 0.5;
  transform: rotate(1.5deg);
}

.psbk__plant-1 {
  inset-block-start: 46%;
  inset-inline-start: -50px;
  opacity: 0.6;
  transform: rotate(-3deg);
}

.psbk__chair {
  inset-block-start: 40%;
  inset-inline-end: -20px;
  opacity: 0.55;
}

.psbk__treats {
  inset-block-end: 20px;
  inset-inline-start: 30px;
  opacity: 0.6;
  transform: rotate(-5deg);
}

.psbk__plant-2 {
  inset-block-end: 10px;
  inset-inline-end: 20px;
  opacity: 0.55;
  transform: rotate(5deg) scale(0.78);
}
</style>
