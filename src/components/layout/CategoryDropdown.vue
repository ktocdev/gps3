<template>
  <div class="category-dropdown">
    <!-- Category dropdown trigger button -->
    <button
      class="category-dropdown__trigger"
      :class="{ 'category-dropdown__trigger--active': isActiveCategory }"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      :aria-label="`${categoryLabel} menu`"
    >
      <span class="category-dropdown__trigger-label">{{ categoryLabel }}</span>
      <span class="category-dropdown__trigger-arrow" :class="{ 'category-dropdown__trigger-arrow--open': isOpen }">▼</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="category-dropdown__menu"
      @click.stop
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="category-dropdown__item"
        :class="{ 'category-dropdown__item--active': modelValue === tab.id }"
        @click="selectTab(tab.id)"
      >
        <span class="category-dropdown__item-icon">{{ tab.icon }}</span>
        <span class="category-dropdown__item-label">{{ tab.label }}</span>
        <span v-if="modelValue === tab.id" class="category-dropdown__item-check">✓</span>
      </button>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isOpen"
      class="category-dropdown__overlay"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Tab } from './TabContainer.vue'

interface Props {
  categoryLabel: string
  tabs: Tab[]
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const isActiveCategory = computed(() => {
  return props.tabs.some(tab => tab.id === props.modelValue)
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
/* Category dropdown - flex item that sizes to content */
.category-dropdown {
  position: relative;
  flex: 0 1 auto;
  min-inline-size: max-content;
}

.category-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
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
  white-space: nowrap;
}

.category-dropdown__trigger:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-medium);
}

.category-dropdown__trigger:active {
  transform: scale(0.98);
}

.category-dropdown__trigger--active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.category-dropdown__trigger-label {
  flex: 1;
  text-align: start;
}

.category-dropdown__trigger-arrow {
  font-size: var(--font-size-sm);
  transition: transform 0.2s ease;
  color: var(--color-text-secondary);
}

.category-dropdown__trigger-arrow--open {
  transform: rotate(180deg);
}

/* Dropdown menu */
.category-dropdown__menu {
  position: absolute;
  inset-block-start: calc(100% + var(--space-2));
  inset-inline-start: 0;
  inline-size: 100%;
  min-inline-size: 200px;
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

.category-dropdown__overlay {
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

.category-dropdown__item {
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

.category-dropdown__item:hover {
  background: var(--color-bg-secondary);
}

.category-dropdown__item--active {
  background: var(--color-primary-bg);
  font-weight: var(--font-weight-medium);
}

.category-dropdown__item-icon {
  font-size: var(--font-size-xl);
  line-height: 1;
}

.category-dropdown__item-label {
  flex: 1;
}

.category-dropdown__item-check {
  font-size: var(--font-size-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-bold);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .category-dropdown__trigger {
    background: var(--color-bg-tertiary);
    border-color: var(--color-border-medium);
  }

  .category-dropdown__trigger:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-light);
  }

  .category-dropdown__trigger--active {
    background: rgba(236, 72, 153, 0.2);
    border-color: var(--color-primary);
  }

  .category-dropdown__menu {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .category-dropdown__overlay {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
