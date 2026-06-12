<template>
  <div
    class="side-panel-3d"
    :class="[
      `side-panel-3d--${side}`,
      `side-panel-3d--${color}`,
      { 'side-panel-3d--collapsed': !isOpen }
    ]"
  >
    <!-- Tab button - visible when collapsed -->
    <button
      class="side-panel-3d__tab"
      @click="$emit('toggle')"
      :title="`Open ${title}`"
    >
      {{ icon }}
    </button>

    <!-- Panel Body -->
    <div class="side-panel-3d__body">
      <div class="side-panel-3d__header">
        <span class="side-panel-3d__title">{{ icon }} {{ title }}</span>
        <slot name="header-extra"></slot>
        <button class="side-panel-3d__close" @click="$emit('toggle')" title="Close">
          {{ side === 'left' ? '◀' : '▶' }}
        </button>
      </div>

      <!-- Internal tabs navigation (when tabs provided) -->
      <div v-if="tabs && tabs.length > 0" class="side-panel-3d__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="side-panel-3d__tab-btn"
          :class="{ 'side-panel-3d__tab-btn--active': activeTab === tab.id }"
          @click="$emit('update:activeTab', tab.id)"
        >
          <span class="side-panel-3d__tab-icon">{{ tab.icon }}</span>
          <span class="side-panel-3d__tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <div class="side-panel-3d__content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TabDefinition {
  id: string
  label: string
  icon: string
}

interface Props {
  isOpen: boolean
  side: 'left' | 'right'
  color: 'yellow' | 'violet' | 'pink' | 'green'
  title: string
  icon: string
  tabs?: TabDefinition[]
  activeTab?: string
}

defineProps<Props>()

defineEmits<{
  toggle: []
  'update:activeTab': [tabId: string]
}>()
</script>

<style>
/* Side Panel 3D - Base overlay panel component */
.side-panel-3d {
  position: absolute;
  inset-block-start: 0;
  block-size: 100%;
  z-index: 20;
  pointer-events: none;
}

/* When panel is expanded, raise z-index so it appears above other panel tabs */
.side-panel-3d:not(.side-panel-3d--collapsed) {
  z-index: 25;
}

/* Side positioning */
.side-panel-3d--left {
  inset-inline-start: 0;
}

.side-panel-3d--right {
  inset-inline-end: 0;
}

/* Tab button - visible when collapsed */
.side-panel-3d__tab {
  position: absolute;
  inset-block-start: var(--spacing-sm);
  inline-size: 48px;
  block-size: 48px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.3s ease, transform 0.15s ease;
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.side-panel-3d__tab:hover {
  transform: scale(1.05);
}

/* Tab positioning by side */
.side-panel-3d--left .side-panel-3d__tab {
  inset-inline-start: var(--spacing-sm);
}

.side-panel-3d--right .side-panel-3d__tab {
  inset-inline-end: var(--spacing-sm);
}

/* Hide tab when panel is expanded */
.side-panel-3d:not(.side-panel-3d--collapsed) .side-panel-3d__tab {
  opacity: 0;
  pointer-events: none;
}

/* Panel Body */
.side-panel-3d__body {
  position: absolute;
  inset-block-start: 0;
  block-size: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(0);
  transition: transform 0.3s ease;
  pointer-events: auto;
}

/* Body positioning and sizing by side */
.side-panel-3d--left .side-panel-3d__body {
  inset-inline-start: 0;
  inline-size: 320px;
  background-color: var(--color-bg-primary);
  border-inline-end: 1px solid var(--color-border);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
}

.side-panel-3d--right .side-panel-3d__body {
  inset-inline-end: 0;
  inline-size: 280px;
  background-color: var(--color-bg-primary);
  border-inline-start: 1px solid var(--color-border);
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

/* Collapsed state transforms */
.side-panel-3d--collapsed.side-panel-3d--left .side-panel-3d__body {
  transform: translateX(-100%);
  box-shadow: none;
}

.side-panel-3d--collapsed.side-panel-3d--right .side-panel-3d__body {
  transform: translateX(100%);
  box-shadow: none;
}

/* Header */
.side-panel-3d__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: white;
  flex-shrink: 0;
}

.side-panel-3d__title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.side-panel-3d__close {
  margin-inline-start: auto;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.side-panel-3d__close:hover {
  opacity: 1;
}

/* Hide close button when collapsed */
.side-panel-3d--collapsed .side-panel-3d__close {
  opacity: 0;
  pointer-events: none;
}

/* Internal tabs navigation */
.side-panel-3d__tabs {
  display: flex;
  gap: 2px;
  padding: 0 var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-block-end: 1px solid var(--color-border);
  flex-shrink: 0;
}

.side-panel-3d__tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  border-block-end: 2px solid transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
}

.side-panel-3d__tab-btn:hover {
  color: var(--color-text-primary);
  background-color: var(--color-bg-tertiary);
}

.side-panel-3d__tab-btn--active {
  color: var(--color-text-primary);
  border-block-end-color: var(--color-primary);
  background-color: var(--color-bg-primary);
}

.side-panel-3d__tab-icon {
  font-size: 1rem;
}

.side-panel-3d__tab-label {
  font-weight: var(--font-weight-medium);
}

/* Content */
.side-panel-3d__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm);
}

/* Color variants - Yellow */
.side-panel-3d--yellow .side-panel-3d__tab {
  background-color: var(--color-accent-yellow-500);
  color: var(--color-neutral-900);
}

.side-panel-3d--yellow .side-panel-3d__tab:hover {
  background-color: var(--color-accent-yellow-600);
}

.side-panel-3d--yellow .side-panel-3d__header {
  background-color: var(--color-accent-yellow-500);
  color: var(--color-neutral-900);
}

/* Color variants - Violet */
.side-panel-3d--violet .side-panel-3d__tab {
  background-color: var(--color-accent-violet-500);
  color: white;
}

.side-panel-3d--violet .side-panel-3d__tab:hover {
  background-color: var(--color-accent-violet-600);
}

.side-panel-3d--violet .side-panel-3d__header {
  background-color: var(--color-accent-violet-500);
}

/* Color variants - Pink */
.side-panel-3d--pink .side-panel-3d__tab {
  background-color: var(--color-accent-pink-600);
  color: white;
}

.side-panel-3d--pink .side-panel-3d__tab:hover {
  background-color: var(--color-accent-pink-600);
}

.side-panel-3d--pink .side-panel-3d__header {
  background-color: var(--color-accent-pink-700);
}

/* Color variants - Green */
.side-panel-3d--green .side-panel-3d__tab {
  background-color: var(--color-accent-green-500);
  color: white;
}

.side-panel-3d--green .side-panel-3d__tab:hover {
  background-color: var(--color-accent-green-600);
}

.side-panel-3d--green .side-panel-3d__header {
  background-color: var(--color-accent-green-500);
}
</style>
