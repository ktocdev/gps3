<template>
  <div class="navigation-dropdown">
    <!-- Mobile dropdown trigger button -->
    <button
      class="navigation-dropdown__trigger"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      aria-label="Navigation menu"
    >
      <span class="navigation-dropdown__trigger-icon">{{ currentTab?.icon || '📋' }}</span>
      <span class="navigation-dropdown__trigger-label">{{ currentTab?.label || 'Select View' }}</span>
      <span class="navigation-dropdown__trigger-arrow" :class="{ 'navigation-dropdown__trigger-arrow--open': isOpen }">▼</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="navigation-dropdown__menu"
      @click.stop
    >
      <div
        v-for="category in categories"
        :key="category.id"
        class="navigation-dropdown__category"
      >
        <div class="navigation-dropdown__category-label">{{ category.label }}</div>

        <button
          v-for="tab in category.tabs"
          :key="tab.id"
          class="navigation-dropdown__item"
          :class="{ 'navigation-dropdown__item--active': modelValue === tab.id }"
          @click="selectTab(tab.id)"
        >
          <span class="navigation-dropdown__item-icon">{{ tab.icon }}</span>
          <span class="navigation-dropdown__item-label">{{ tab.label }}</span>
          <span v-if="modelValue === tab.id" class="navigation-dropdown__item-check">✓</span>
        </button>
      </div>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isOpen"
      class="navigation-dropdown__overlay"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Tab } from './TabContainer.vue'

export interface TabCategory {
  id: string
  label: string
  tabs: Tab[]
}

interface Props {
  categories: TabCategory[]
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const currentTab = computed(() => {
  for (const category of props.categories) {
    const tab = category.tabs.find(t => t.id === props.modelValue)
    if (tab) return tab
  }
  return null
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectTab = (tabId: string) => {
  emit('update:modelValue', tabId)
  closeDropdown()
}

// Close dropdown on escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Mobile-first: Dropdown visible on mobile */
.navigation-dropdown {
  position: relative;
  inline-size: 100%;
}

.navigation-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  inline-size: 100%;
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.navigation-dropdown__trigger:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
}

.navigation-dropdown__trigger:active {
  transform: scale(0.98);
}

.navigation-dropdown__trigger-icon {
  font-size: var(--font-size-xl);
  line-height: 1;
}

.navigation-dropdown__trigger-label {
  flex: 1;
  text-align: start;
}

.navigation-dropdown__trigger-arrow {
  font-size: var(--font-size-sm);
  transition: transform 0.2s ease;
  color: var(--color-text-secondary);
}

.navigation-dropdown__trigger-arrow--open {
  transform: rotate(180deg);
}

/* Dropdown menu */
.navigation-dropdown__menu {
  position: absolute;
  inset-block-start: calc(100% + var(--space-2));
  inset-inline-start: 0;
  inline-size: 100%;
  max-block-size: 70vh;
  overflow-y: auto;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: dropdownSlideIn 0.2s ease;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navigation-dropdown__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
  animation: overlayFadeIn 0.2s ease;
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.navigation-dropdown__category {
  padding-block: var(--space-2);
}

.navigation-dropdown__category:not(:last-child) {
  border-block-end: 1px solid var(--color-border-light);
}

.navigation-dropdown__category-label {
  padding-block: var(--space-2);
  padding-inline: var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.navigation-dropdown__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  inline-size: 100%;
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
  background: transparent;
  border: none;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 0.15s ease;
  text-align: start;
}

.navigation-dropdown__item:hover {
  background: var(--color-bg-secondary);
}

.navigation-dropdown__item--active {
  background: var(--color-primary-bg);
  font-weight: var(--font-weight-medium);
}

.navigation-dropdown__item-icon {
  font-size: var(--font-size-xl);
  line-height: 1;
}

.navigation-dropdown__item-label {
  flex: 1;
}

.navigation-dropdown__item-check {
  font-size: var(--font-size-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

/* Note: Display toggle is controlled by parent container queries in DebugView */

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .navigation-dropdown__trigger {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border-medium);
  }

  .navigation-dropdown__trigger:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-light);
  }

  .navigation-dropdown__menu {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .navigation-dropdown__overlay {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
