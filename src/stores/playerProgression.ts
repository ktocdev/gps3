/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLoggingStore } from './loggingStore'

export interface OwnedItem {
  itemId: string
  purchasedAt: number
  timesUsed: number
}

export const usePlayerProgression = defineStore('playerProgression', () => {
  let loggingStore: any = null
  const getLoggingStore = () => {
    if (!loggingStore) {
      loggingStore = useLoggingStore()
    }
    return loggingStore
  }

  const currency = ref<number>(1000)
  const totalCurrencyEarned = ref<number>(1000)
  const ownedItems = ref<Record<string, OwnedItem>>({})
  const consumables = ref<Record<string, number>>({})
  const totalGameSessions = ref<number>(0)
  const totalPlayTime = ref<number>(0)
  const guineaPigsAdopted = ref<number>(0)
  const unlockedAchievements = ref<string[]>([])

  const formattedCurrency = computed(() => {
    return `$${currency.value.toLocaleString()}`
  })

  const formattedTotalEarned = computed(() => {
    return `$${totalCurrencyEarned.value.toLocaleString()}`
  })

  const formattedPlayTime = computed(() => {
    const totalSeconds = Math.floor(totalPlayTime.value / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  })

  function updateCurrency(amount: number): void {
    currency.value += amount

    if (amount > 0) {
      totalCurrencyEarned.value += amount
    }

    const logging = getLoggingStore()
    const symbol = amount > 0 ? '+' : ''
    logging.addPlayerAction(
      `Currency ${symbol}$${amount} (Balance: ${formattedCurrency.value}) 💰`,
      '💰',
      { amount, newBalance: currency.value }
    )
  }

  function deductCurrency(amount: number, reason: string): void {
    if (amount <= 0) return

    const actualDeduction = Math.min(amount, currency.value)
    currency.value -= actualDeduction

    const logging = getLoggingStore()
    logging.addPlayerAction(
      `Currency -$${actualDeduction} (${reason}) 💸`,
      '💸',
      { amount: actualDeduction, reason, newBalance: currency.value }
    )
  }

  function incrementGameSessions(): void {
    totalGameSessions.value++

    const logging = getLoggingStore()
    logging.logInfo(`Total game sessions: ${totalGameSessions.value}`)
  }

  function addPlayTime(milliseconds: number): void {
    totalPlayTime.value += milliseconds

    const logging = getLoggingStore()
    logging.logInfo(`Added ${Math.floor(milliseconds / 1000)}s to total play time`)
  }

  function incrementGuineaPigsAdopted(count: number = 1): void {
    guineaPigsAdopted.value += count

    const logging = getLoggingStore()
    logging.logInfo(`Total guinea pigs adopted: ${guineaPigsAdopted.value}`)
  }

  function resetProgression(): void {
    currency.value = 1000
    totalCurrencyEarned.value = 1000
    ownedItems.value = {}
    consumables.value = {}
    totalGameSessions.value = 0
    totalPlayTime.value = 0
    guineaPigsAdopted.value = 0
    unlockedAchievements.value = []

    const logging = getLoggingStore()
    logging.addPlayerAction('Reset player progression 🔄', '🔄', {})
  }

  function initializeStore(): void {
    const logging = getLoggingStore()
    logging.logInfo(`Player Progression initialized: ${formattedCurrency.value}, ${totalGameSessions.value} sessions`)
  }

  return {
    currency,
    totalCurrencyEarned,
    ownedItems,
    consumables,
    totalGameSessions,
    totalPlayTime,
    guineaPigsAdopted,
    unlockedAchievements,

    formattedCurrency,
    formattedTotalEarned,
    formattedPlayTime,

    updateCurrency,
    deductCurrency,
    incrementGameSessions,
    addPlayTime,
    incrementGuineaPigsAdopted,
    resetProgression,
    initializeStore
  }
}, {
  persist: {
    key: 'gps2-player-progression',
    storage: localStorage
  }
})