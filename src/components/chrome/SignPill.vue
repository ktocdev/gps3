<template>
  <button
    class="sign-pill"
    :class="{ 'sign-pill--active': active }"
    :style="{
      '--tilt': `${tilt ?? 0}deg`,
      '--accent': accent,
      '--accent-deep': accentDeep ?? accent,
      '--badge-color': badgeColor
    }"
    @click="emit('click')"
  >
    <span class="sign-pill__rivet sign-pill__rivet--tl" aria-hidden="true"></span>
    <span class="sign-pill__rivet sign-pill__rivet--tr" aria-hidden="true"></span>
    <span class="sign-pill__rivet sign-pill__rivet--bl" aria-hidden="true"></span>
    <span class="sign-pill__rivet sign-pill__rivet--br" aria-hidden="true"></span>

    <slot name="icon">
      <span v-if="icon" class="sign-pill__disc">{{ icon }}</span>
    </slot>
    <span class="sign-pill__label">{{ label }}</span>
    <slot />
    <span v-if="badge != null && badge > 0" class="sign-pill__badge">
      {{ badge > 99 ? '99+' : badge }}
    </span>
    <slot name="suffix" />
    <span class="sign-pill__caret" aria-hidden="true">▾</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  icon?: string
  accent?: string
  accentDeep?: string
  badge?: number
  badgeColor?: string
  active?: boolean
  tilt?: number
}>()

const emit = defineEmits<{
  click: []
}>()
</script>
