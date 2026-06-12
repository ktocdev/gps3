<template>
  <div class="tab-container">
    <div class="tab-container__header">
      <nav class="tab-container__nav" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="getTabClasses(tab.id)"
          :aria-selected="activeTab === tab.id"
          :aria-controls="`panel-${tab.id}`"
          :id="`tab-${tab.id}`"
          role="tab"
          type="button"
          @click="setActiveTab(tab.id)"
        >
          <span v-if="tab.icon" class="tab-container__tab-icon">{{ tab.icon }}</span>
          <span class="tab-container__tab-text">{{ tab.label }}</span>
          <span v-if="tab.badge" class="tab-container__tab-badge">{{ tab.badge }}</span>
        </button>
      </nav>
    </div>

    <div class="tab-container__content">
      <div
        v-for="tab in tabs"
        :key="`panel-${tab.id}`"
        :class="getPanelClasses(tab.id)"
        :aria-labelledby="`tab-${tab.id}`"
        :id="`panel-${tab.id}`"
        role="tabpanel"
        :hidden="activeTab !== tab.id"
      >
        <slot :name="tab.id" :tab="tab" :active="activeTab === tab.id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

export interface Tab {
  id: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
  panelClass?: string
}

interface Props {
  tabs: Tab[]
  modelValue?: string
  variant?: 'default' | 'compact' | 'pills'
  position?: 'top' | 'bottom'
}

interface Emits {
  (e: 'update:modelValue', tabId: string): void
  (e: 'tab-change', tabId: string, previousTabId: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  position: 'top'
})

const emit = defineEmits<Emits>()

// State
const activeTab = ref<string>('')
const previousTab = ref<string | null>(null)

// Computed
const enabledTabs = computed(() => props.tabs.filter(tab => !tab.disabled))

const getTabClasses = (tabId: string) => {
  const base = 'tab-container__tab'
  const variant = `tab-container__tab--${props.variant}`
  const active = activeTab.value === tabId ? 'tab-container__tab--active' : ''
  const disabled = props.tabs.find(t => t.id === tabId)?.disabled ? 'tab-container__tab--disabled' : ''

  return [base, variant, active, disabled].filter(Boolean).join(' ')
}

const getPanelClasses = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  const base = 'tab-container__panel'
  const active = activeTab.value === tabId ? 'tab-container__panel--active' : ''
  const custom = tab?.panelClass || ''

  return [base, active, custom].filter(Boolean).join(' ')
}

// Methods
const setActiveTab = (tabId: string) => {
  const tab = props.tabs.find(t => t.id === tabId)
  if (!tab || tab.disabled) return

  const prevTab = activeTab.value
  previousTab.value = prevTab || null
  activeTab.value = tabId

  emit('update:modelValue', tabId)
  emit('tab-change', tabId, previousTab.value)
}

const getNextTab = () => {
  const currentIndex = enabledTabs.value.findIndex(tab => tab.id === activeTab.value)
  const nextIndex = (currentIndex + 1) % enabledTabs.value.length
  return enabledTabs.value[nextIndex]?.id
}

const getPreviousTab = () => {
  const currentIndex = enabledTabs.value.findIndex(tab => tab.id === activeTab.value)
  const prevIndex = currentIndex === 0 ? enabledTabs.value.length - 1 : currentIndex - 1
  return enabledTabs.value[prevIndex]?.id
}

// Keyboard navigation
const handleKeydown = (event: Event) => {
  const keyboardEvent = event as KeyboardEvent
  switch (keyboardEvent.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      keyboardEvent.preventDefault()
      const nextTab = getNextTab()
      if (nextTab) setActiveTab(nextTab)
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      keyboardEvent.preventDefault()
      const prevTab = getPreviousTab()
      if (prevTab) setActiveTab(prevTab)
      break
    case 'Home':
      keyboardEvent.preventDefault()
      const firstTab = enabledTabs.value[0]?.id
      if (firstTab) setActiveTab(firstTab)
      break
    case 'End':
      keyboardEvent.preventDefault()
      const lastTab = enabledTabs.value[enabledTabs.value.length - 1]?.id
      if (lastTab) setActiveTab(lastTab)
      break
  }
}

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== activeTab.value) {
      setActiveTab(newValue)
    }
  },
  { immediate: true }
)

// Initialize
onMounted(() => {
  // Set initial active tab
  const initialTab = props.modelValue || enabledTabs.value[0]?.id
  if (initialTab) {
    activeTab.value = initialTab
  }

  // Add keyboard event listener
  const nav = document.querySelector('.tab-container__nav')
  nav?.addEventListener('keydown', handleKeydown)
})

// Expose public methods
defineExpose({
  setActiveTab,
  getNextTab,
  getPreviousTab,
  activeTab: computed(() => activeTab.value)
})
</script>

<style>
/* Tab Container Component - BEM Methodology */

/* Base Tab Container */
.tab-container {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  block-size: 100%;
  font-family: var(--font-family-body);
  background-color: var(--color-bg-primary);
}

/* Header */
.tab-container__header {
  border-block-end: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.tab-container__nav {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
}

.tab-container__nav::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

/* Tab Buttons - Mobile First */
.tab-container__tab {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  background: none;
  border: none;
  font-family: var(--font-family-body);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-block-end: 2px solid transparent;
  white-space: nowrap;
  user-select: none;
  position: relative;
  min-inline-size: 60px;
  justify-content: center;
}

.tab-container__tab:hover:not(.tab-container__tab--disabled) {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
}

.tab-container__tab:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.tab-container__tab--active {
  color: var(--color-primary);
  border-block-end-color: var(--color-primary);
  background-color: var(--color-bg-primary);
}

.tab-container__tab--disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Tab Content - Mobile First */
.tab-container__tab-icon {
  font-size: var(--font-size-base);
  line-height: 1;
}

.tab-container__tab-text {
  display: none; /* Hidden on mobile by default */
  line-height: var(--line-height-tight);
}

.tab-container__tab-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding-block: var(--space-1);
  padding-inline: var(--space-2);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  min-inline-size: 18px;
  text-align: center;
  line-height: 1;
}

.tab-container__tab--active .tab-container__tab-badge {
  background-color: var(--color-primary);
}

/* Content Panel - Mobile First */
.tab-container__content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tab-container__panel {
  block-size: 100%;
  overflow-y: auto;
  padding-block: var(--space-3);
  padding-inline: var(--space-3);
  display: none;
}

.tab-container__panel--active {
  display: block;
}

/* Panel Modifiers */
.tab-container__panel--constrained {
  max-inline-size: 1200px;
  margin-inline: auto;
}

/* Variant: Compact */
.tab-container__tab--compact {
  padding-block: var(--space-2);
  padding-inline: var(--space-3);
  font-size: var(--font-size-xs);
}

.tab-container__tab--compact .tab-container__tab-icon {
  font-size: var(--font-size-base);
}

/* Variant: Pills */
.tab-container__tab--pills {
  border-radius: var(--radius-full);
  border-block-end: none;
  margin-inline-end: var(--space-1);
  margin-block: var(--space-1);
}

.tab-container__tab--pills:hover:not(.tab-container__tab--disabled) {
  background-color: var(--color-primary-bg);
}

.tab-container__tab--pills.tab-container__tab--active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Position: Bottom */
.tab-container--bottom {
  flex-direction: column-reverse;
}

.tab-container--bottom .tab-container__header {
  border-block-end: none;
  border-block-start: 1px solid var(--color-border-light);
}

.tab-container--bottom .tab-container__tab {
  border-block-end: none;
  border-block-start: 2px solid transparent;
}

.tab-container--bottom .tab-container__tab--active {
  border-block-start-color: var(--color-primary);
}

/* Responsive Design - Mobile First (Enhanced for larger screens) */
@media (min-width: 641px) {
  .tab-container__tab {
    padding-block: var(--space-3);
    padding-inline: var(--space-4);
    font-size: var(--font-size-sm);
    min-inline-size: auto;
    justify-content: flex-start;
  }

  .tab-container__tab-text {
    display: block; /* Show text labels on larger screens */
  }

  .tab-container__tab-icon {
    font-size: var(--font-size-lg);
  }

  .tab-container__panel {
    padding-block: var(--space-4);
    padding-inline: var(--space-4);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .tab-container__tab:hover:not(.tab-container__tab--disabled) {
    background-color: var(--color-bg-primary);
  }

  .tab-container__tab--active {
    background-color: var(--color-bg-secondary);
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .tab-container__header {
    border-width: 2px;
  }

  .tab-container__tab {
    border-width: 2px;
  }

  .tab-container__tab--active {
    border-block-end-width: 3px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .tab-container__tab {
    transition: none;
  }

  .tab-container__nav {
    scroll-behavior: auto;
  }
}

/* Focus Visible Support */
.tab-container__tab:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
</style>