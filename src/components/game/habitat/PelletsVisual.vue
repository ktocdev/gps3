<template>
  <div class="pellets-visual">
    <span
      v-for="index in 5"
      :key="index"
      class="pellets-visual__pellet no-select"
      :class="`pellets-visual__pellet--${index}`"
    >
      {{ pelletEmoji }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  pelletEmoji: string
}

defineProps<Props>()
</script>

<style>
.pellets-visual {
  position: relative;
  display: inline-block;
  inline-size: 100%;
  block-size: 100%;
}

.pellets-visual__pellet {
  position: absolute;
  font-size: 0.75rem; /* Large enough to be visible but not overwhelming */
  line-height: 1;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  pointer-events: none;
}

/* Pellet 1: Top-left of cluster */
.pellets-visual__pellet--1 {
  transform: translate(-80%, -80%) rotate(15deg);
}

/* Pellet 2: Top-right */
.pellets-visual__pellet--2 {
  transform: translate(-20%, -75%) rotate(-12deg);
}

/* Pellet 3: Center */
.pellets-visual__pellet--3 {
  transform: translate(-50%, -50%) rotate(8deg);
}

/* Pellet 4: Bottom-left */
.pellets-visual__pellet--4 {
  transform: translate(-75%, -20%) rotate(-5deg);
}

/* Pellet 5: Bottom-right */
.pellets-visual__pellet--5 {
  transform: translate(-25%, -25%) rotate(18deg);
}
</style>
