<template>
  <nav class="dbg-nav">
    <template v-for="(category, i) in categories" :key="category.id">
      <div v-if="i > 0" class="dbg-nav__divider"></div>
      <span class="dbg-nav__group">{{ category.label }}</span>
      <button
        v-for="tab in category.tabs"
        :key="tab.id"
        class="dbg-nav__tab"
        :class="{ 'dbg-nav__tab--active': modelValue === tab.id }"
        @click="emit('update:modelValue', tab.id)"
      >
        <span v-if="tab.icon">{{ tab.icon }}</span> {{ tab.label }}
      </button>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { Tab } from '../../layout/TabContainer.vue'

interface TabCategory {
  id: string
  label: string
  tabs: Tab[]
}

defineProps<{
  categories: TabCategory[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
