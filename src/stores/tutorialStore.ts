/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Session state for the first-run guided tour (TutorialTour.vue).
 *
 * Chrome components own their panel open/close state locally (SimTopBar's
 * dropdown, PigDrawer's tab). Rather than lifting that state up, they
 * register small handlers here on mount so tour steps can choreograph the
 * real UI — open the inventory, flip the pig drawer to Needs — and clean up
 * when the step changes.
 *
 * Completion/mode settings live in gameController.settings.tutorial
 * (persisted); this store is deliberately session-only.
 */

/** Boolean opens/closes a panel; string selects a tab. */
export type TutorialPanelHandler = (value: boolean | string) => void

export const useTutorialStore = defineStore('tutorial', () => {
  const isActive = ref(false)
  const stepIndex = ref(0)

  // Set by the debug panel's Replay button; consumed by GameShellView's
  // auto-start watcher once the user is back in Live Mode with a session.
  const replayRequested = ref(false)

  const panelHandlers = new Map<string, TutorialPanelHandler>()

  function registerPanelHandler(key: string, handler: TutorialPanelHandler): void {
    panelHandlers.set(key, handler)
  }

  function unregisterPanelHandler(key: string, handler?: TutorialPanelHandler): void {
    // When two instances of a component swap (e.g. switching pig drawers),
    // the outgoing one must not remove the incoming one's registration.
    if (handler && panelHandlers.get(key) !== handler) return
    panelHandlers.delete(key)
  }

  function callPanelHandler(key: string, value: boolean | string): void {
    panelHandlers.get(key)?.(value)
  }

  function start(): void {
    stepIndex.value = 0
    replayRequested.value = false
    isActive.value = true
  }

  function stop(): void {
    isActive.value = false
  }

  function requestReplay(): void {
    replayRequested.value = true
  }

  return {
    isActive,
    stepIndex,
    replayRequested,
    registerPanelHandler,
    unregisterPanelHandler,
    callPanelHandler,
    start,
    stop,
    requestReplay
  }
})
