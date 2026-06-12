/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { useGameController } from '../stores/gameController'

/**
 * Creates a promise that resolves after a delay, but pauses when the game is paused
 * @param durationMs - Total duration to wait in milliseconds
 * @returns Promise that resolves when the full duration has elapsed (excluding paused time)
 */
export function pausableDelay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const gameController = useGameController()
    let remainingTime = durationMs
    let startTime = Date.now()

    const checkAndWait = () => {
      if (!gameController.isGameActive) {
        // Game is paused - wait and check again
        setTimeout(checkAndWait, 100)
        return
      }

      // Game is active - calculate how much time has passed
      const now = Date.now()
      const elapsed = now - startTime
      startTime = now

      // If we were previously running, subtract elapsed time
      if (elapsed < 200) { // Only subtract if we were just running (< 200ms check interval)
        remainingTime -= elapsed
      }

      if (remainingTime <= 0) {
        // Timer complete
        resolve()
        return
      }

      // Schedule next check - either after remaining time or 100ms (whichever is shorter)
      const nextCheck = Math.min(remainingTime, 100)
      setTimeout(checkAndWait, nextCheck)
    }

    // Start the timer
    checkAndWait()
  })
}
