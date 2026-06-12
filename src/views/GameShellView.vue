<template>
  <div class="game-shell">
    <GameHeader />
    <main class="game-shell__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import GameHeader from '../components/chrome/GameHeader.vue'
</script>

<style>
.game-shell {
  display: flex;
  flex-direction: column;
  block-size: 100vh;
  block-size: 100dvh;
  overflow: hidden;
}

.game-shell__main {
  flex: 1;
  min-block-size: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Inside the shell, the game fills the available area (the debug embed
   keeps GameView's default 70vh canvas height) */
.game-shell__main .game-view {
  flex: 1;
  min-block-size: 0;
  display: flex;
  flex-direction: column;
}

.game-shell__main .game-view__canvas-wrapper {
  flex: 1;
  min-block-size: 0;
  block-size: auto;
}
</style>
