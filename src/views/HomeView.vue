<!--
  Guinea Pig Simulation Game (GPS2)
  Copyright (c) 2025 ktocdev. All Rights Reserved.

  This file is part of the GPS2 proprietary software.
  Unauthorized copying, modification, or distribution is strictly prohibited.
-->
<template>
  <div class="home-view">
    <div class="home-view__hero">
      <h1 class="home-view__title">Guinea Pig Simulator</h1>
      <p class="home-view__subtitle">Coming Soon!</p>
      <p class="home-view__description">
        The main game interface will be built here during Phase 2 development.
        For now, visit the debug dashboard to test the foundational systems.
      </p>
      <div class="home-view__actions">
        <router-link to="/" class="home-view__button">
          🔧 Debug Dashboard
        </router-link>
      </div>
    </div>

    <div class="home-view__preview">
      <div class="home-view__placeholder">
        <span class="home-view__placeholder-icon">🐹</span>
        <p class="home-view__placeholder-text">Game interface placeholder</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameController } from '../stores/gameController'

const gameController = useGameController()

// Page lifecycle management for automatic pause
onMounted(() => {
  // Auto-pause game when entering main game view
  // User must manually resume if they want the game to run
  gameController.pauseGame('navigation')
})

onUnmounted(() => {
  // Auto-pause when leaving main game view if game is active
  if (gameController.isGameActive) {
    gameController.pauseGame('navigation')
  }
})

// Future game interface will be implemented here
</script>

<style>
/* Home View - Future Game Interface - Mobile First */
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-block-size: 100vh;
  padding-block: var(--space-6);
  padding-inline: var(--space-3);
  background: linear-gradient(135deg, var(--color-primary-bg), var(--color-secondary-bg));
}

.home-view__hero {
  text-align: center;
  max-inline-size: 600px;
  margin-block-end: var(--space-8);
}

.home-view__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  margin-block-end: var(--space-3);
}

.home-view__subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  margin: 0;
  margin-block-end: var(--space-4);
}

.home-view__description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
  margin-block-end: var(--space-6);
}

.home-view__actions {
  display: flex;
  justify-content: center;
}

.home-view__button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-3);
  padding-inline: var(--space-6);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.home-view__button:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-text-inverse);
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.home-view__preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-inline-size: 800px;
  inline-size: 100%;
}

.home-view__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 300px;
  background-color: var(--color-bg-secondary);
  border: 2px dashed var(--color-border-medium);
  border-radius: var(--radius-xl);
  text-align: center;
}

.home-view__placeholder-icon {
  font-size: 3rem;
  margin-block-end: var(--space-4);
  opacity: 0.6;
}

.home-view__placeholder-text {
  font-size: var(--font-size-lg);
  color: var(--color-text-muted);
  margin: 0;
}

/* Enhanced for larger screens */
@media (min-width: 769px) {
  .home-view {
    padding-block: var(--space-8);
    padding-inline: var(--space-4);
  }

  .home-view__title {
    font-size: var(--font-size-4xl);
  }

  .home-view__subtitle {
    font-size: var(--font-size-xl);
  }

  .home-view__description {
    font-size: var(--font-size-base);
  }

  .home-view__placeholder {
    block-size: 400px;
  }

  .home-view__placeholder-icon {
    font-size: 4rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .home-view {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(34, 197, 94, 0.1));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .home-view__button {
    transition: none;
  }

  .home-view__button:hover {
    transform: none;
  }
}
</style>