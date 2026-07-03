<template>
  <!--
    Panoramic storefront window — ported from gps2-design SuppliesStore.jsx.
    Decoration colors are intentionally literal, matching the documented
    inline-SVG palette in GPS2 Design Elements (Decorations section).
  -->
  <svg
    class="storefront-window__svg"
    viewBox="0 0 1100 190"
    height="190"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="storefrontWinFrame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b45309" />
        <stop offset="50%" stop-color="#92400e" />
        <stop offset="100%" stop-color="#78350f" />
      </linearGradient>
    </defs>
    <rect
      x="6" y="6" width="1088" height="172" rx="14" ry="14"
      fill="#fff7e6" stroke="url(#storefrontWinFrame)" stroke-width="10" stroke-linejoin="round"
    />
    <rect x="0" y="162" width="1100" height="22" rx="4" fill="url(#storefrontWinFrame)" />
    <rect x="20" y="20" width="1060" height="142" fill="#bfe2f4" />
    <!-- clouds -->
    <ellipse cx="240" cy="135" rx="34" ry="11" fill="#fff" opacity=".95" />
    <ellipse cx="262" cy="128" rx="22" ry="9" fill="#fff" opacity=".95" />
    <ellipse cx="640" cy="128" rx="38" ry="12" fill="#fff" opacity=".95" />
    <ellipse cx="666" cy="120" rx="24" ry="10" fill="#fff" opacity=".95" />
    <ellipse cx="430" cy="148" rx="28" ry="9" fill="#fff" opacity=".9" />
    <!-- sun -->
    <circle cx="1015" cy="42" r="22" fill="#ffd97a" opacity=".95" />
    <circle cx="1015" cy="42" r="22" fill="none" stroke="#f5b945" stroke-width="2" opacity=".5" />
    <!-- birds -->
    <path d="M520 142 q6 -6 12 0 q6 -6 12 0" stroke="#5a7385" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M820 150 q5 -5 10 0 q5 -5 10 0" stroke="#5a7385" stroke-width="2" fill="none" stroke-linecap="round" />
    <!-- OPEN sign -->
    <g transform="translate(70 136)">
      <line x1="0" y1="-26" x2="0" y2="-12" stroke="#451a03" stroke-width="1.5" />
      <circle cx="0" cy="-26" r="2" fill="#451a03" />
      <g transform="rotate(-3)">
        <rect x="-36" y="-12" width="72" height="30" rx="5" fill="#fff7e6" stroke="#92400e" stroke-width="3" />
        <circle cx="-30" cy="-6" r="1.6" fill="#92400e" />
        <circle cx="30" cy="-6" r="1.6" fill="#92400e" />
        <text
          x="0" y="9" font-family="'Gaegu', cursive" font-size="20" font-weight="700"
          fill="#92400e" text-anchor="middle" letter-spacing=".04em"
        >OPEN</text>
      </g>
    </g>
    <!-- potted plant -->
    <g transform="translate(1010 138)">
      <ellipse cx="-16" cy="-14" rx="8" ry="16" fill="#5b8c3e" transform="rotate(-28 -16 -14)" opacity=".95" />
      <ellipse cx="16" cy="-15" rx="8" ry="18" fill="#6ba348" transform="rotate(26 16 -15)" opacity=".95" />
      <ellipse cx="-4" cy="-22" rx="9" ry="22" fill="#7cb854" opacity=".95" />
      <ellipse cx="9" cy="-18" rx="7" ry="16" fill="#8ec964" transform="rotate(12 9 -18)" opacity=".95" />
      <ellipse cx="-10" cy="-9" rx="6" ry="11" fill="#4f7a36" transform="rotate(-50 -10 -9)" opacity=".9" />
      <path d="M-16 -28 Q-16 -16 -16 -4" stroke="#3d5f29" stroke-width="1" fill="none" opacity=".5" />
      <path d="M16 -30 Q16 -17 16 -5" stroke="#3d5f29" stroke-width="1" fill="none" opacity=".5" />
      <path d="M-4 -42 Q-4 -22 -4 -4" stroke="#3d5f29" stroke-width="1" fill="none" opacity=".5" />
      <path d="M-22 0 L22 0 L20 4 L-20 4 Z" fill="#c97b4d" />
      <path d="M-20 4 L20 4 L17 24 L-17 24 Z" fill="#b46339" />
      <path d="M-16 5 Q-14 14 -15 22" stroke="#d99064" stroke-width="2" fill="none" opacity=".7" />
    </g>
  </svg>
</template>

<script setup lang="ts">
</script>
