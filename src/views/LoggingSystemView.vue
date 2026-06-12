<template>
  <div class="logging-system-view">
    <LoggingSystem />
  </div>
</template>

<script setup lang="ts">
import LoggingSystem from '../components/debug/core/LoggingSystem.vue'
</script>

<style>
.logging-system-view {
  inline-size: 100%;
  block-size: 100%;
  overflow-y: auto;
}
</style>