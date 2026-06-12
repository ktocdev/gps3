<script setup lang="ts">
interface Props {
  poopId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  remove: [poopId: string]
}>()

function handleClick() {
  emit('remove', props.poopId)
}
</script>

<template>
  <div class="poop no-select" @click="handleClick">
    <span class="poop__emoji">💩</span>
  </div>
</template>

<style>
.poop {
  cursor: pointer;
  transition: transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.poop:hover {
  transform: scale(1.2);
}

.poop__emoji {
  font-size: var(--font-size-lg);
}
</style>
