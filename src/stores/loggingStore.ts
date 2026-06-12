/**
 * Guinea Pig Simulation Game (GPS2)
 * Copyright (c) 2025 ktocdev. All Rights Reserved.
 *
 * This file is part of the GPS2 proprietary software.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// TypeScript interfaces
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type MessageCategory = 'player_action' | 'guinea_pig_reaction' | 'autonomous_behavior' | 'environmental' | 'system' | 'achievement'

export interface ActivityMessage {
  id: string
  timestamp: number
  level: LogLevel
  category: MessageCategory
  message: string
  emoji?: string
  metadata?: Record<string, any>
}

export interface LoggingSettings {
  maxMessages: number
  showDebugMessages: boolean
  enableActivityFeed: boolean
  messageRetentionHours: number
}

interface LoggingState {
  messages: ActivityMessage[]
  isLoggingEnabled: boolean
  settings: LoggingSettings
}

export const useLoggingStore = defineStore('loggingStore', () => {
  // Core state
  const state = ref<LoggingState>({
    messages: [],
    isLoggingEnabled: true,
    settings: {
      maxMessages: 200,
      showDebugMessages: false,
      enableActivityFeed: true,
      messageRetentionHours: 24
    }
  })

  // Computed properties
  const activityMessages = computed(() =>
    state.value.messages.filter(msg =>
      msg.category !== 'system' &&
      (state.value.settings.showDebugMessages || msg.level !== 'debug')
    )
  )

  const debugMessages = computed(() =>
    state.value.messages.filter(msg => msg.level === 'debug')
  )

  const recentMessages = computed(() => {
    const cutoffTime = Date.now() - (state.value.settings.messageRetentionHours * 60 * 60 * 1000)
    return state.value.messages.filter(msg => msg.timestamp > cutoffTime)
  })

  const messagesByCategory = computed(() => {
    const categorized: Record<MessageCategory, ActivityMessage[]> = {
      player_action: [],
      guinea_pig_reaction: [],
      autonomous_behavior: [],
      environmental: [],
      system: [],
      achievement: []
    }

    activityMessages.value.forEach(msg => {
      categorized[msg.category].push(msg)
    })

    return categorized
  })

  // Core logging functions
  const generateId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const addMessage = (
    level: LogLevel,
    category: MessageCategory,
    message: string,
    emoji?: string,
    metadata?: Record<string, any>
  ): ActivityMessage => {
    if (!state.value.isLoggingEnabled) {
      return {} as ActivityMessage
    }

    const newMessage: ActivityMessage = {
      id: generateId(),
      timestamp: Date.now(),
      level,
      category,
      message,
      emoji,
      metadata
    }

    state.value.messages.push(newMessage)

    // Maintain message limit
    if (state.value.messages.length > state.value.settings.maxMessages) {
      state.value.messages = state.value.messages.slice(-state.value.settings.maxMessages)
    }

    return newMessage
  }

  // Specific logging methods
  const logDebug = (message: string, metadata?: Record<string, any>) => {
    return addMessage('debug', 'system', `[DEBUG] ${message}`, '🔧', metadata)
  }

  const logInfo = (message: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'system', `[INFO] ${message}`, 'ℹ️', metadata)
  }

  const logWarn = (message: string, metadata?: Record<string, any>) => {
    return addMessage('warn', 'system', `[WARN] ${message}`, '⚠️', metadata)
  }

  const logError = (message: string, metadata?: Record<string, any>) => {
    return addMessage('error', 'system', `[ERROR] ${message}`, '❌', metadata)
  }

  // Activity feed specific methods
  const addPlayerAction = (message: string, emoji?: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'player_action', message, emoji, metadata)
  }

  const addGuineaPigReaction = (message: string, emoji?: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'guinea_pig_reaction', message, emoji, metadata)
  }

  const addAutonomousBehavior = (message: string, emoji?: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'autonomous_behavior', message, emoji, metadata)
  }

  const addEnvironmentalEvent = (message: string, emoji?: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'environmental', message, emoji, metadata)
  }

  const addAchievement = (message: string, emoji?: string, metadata?: Record<string, any>) => {
    return addMessage('info', 'achievement', message, emoji, metadata)
  }

  // Generic activity logging (for system events with category/action/details structure)
  const logActivity = (activity: { category: string; action: string; details?: Record<string, any> }) => {
    const message = `[${activity.category.toUpperCase()}] ${activity.action}`
    return addMessage('info', 'system', message, '📊', activity.details)
  }

  // Utility functions
  const clearMessages = () => {
    state.value.messages = []
  }

  const clearOldMessages = () => {
    const cutoffTime = Date.now() - (state.value.settings.messageRetentionHours * 60 * 60 * 1000)
    state.value.messages = state.value.messages.filter(msg => msg.timestamp > cutoffTime)
  }

  const getMessagesByTimeRange = (startTime: number, endTime: number): ActivityMessage[] => {
    return state.value.messages.filter(msg =>
      msg.timestamp >= startTime && msg.timestamp <= endTime
    )
  }

  const exportMessages = (): string => {
    return JSON.stringify(state.value.messages, null, 2)
  }

  // Settings management
  const updateSettings = (newSettings: Partial<LoggingSettings>) => {
    state.value.settings = { ...state.value.settings, ...newSettings }
  }

  const toggleLogging = () => {
    state.value.isLoggingEnabled = !state.value.isLoggingEnabled
    logInfo(`Logging ${state.value.isLoggingEnabled ? 'enabled' : 'disabled'}`)
  }

  const toggleDebugMessages = () => {
    state.value.settings.showDebugMessages = !state.value.settings.showDebugMessages
    logInfo(`Debug messages ${state.value.settings.showDebugMessages ? 'enabled' : 'disabled'}`)
  }

  // Save/Load functionality
  const getState = () => ({
    messages: recentMessages.value, // Only save recent messages
    isLoggingEnabled: state.value.isLoggingEnabled,
    settings: state.value.settings
  })

  const loadState = (savedState: any) => {
    if (savedState && typeof savedState === 'object') {
      state.value.messages = savedState.messages || []
      state.value.isLoggingEnabled = savedState.isLoggingEnabled ?? true
      state.value.settings = { ...state.value.settings, ...savedState.settings }
      logInfo('Logging state loaded successfully')
    }
  }

  // Initialize
  logInfo('Logging system initialized')

  return {
    // State
    state: computed(() => state.value),
    activityMessages,
    debugMessages,
    recentMessages,
    messagesByCategory,

    // Core methods
    addMessage,
    logDebug,
    logInfo,
    logWarn,
    logError,

    // Activity feed methods
    addPlayerAction,
    addGuineaPigReaction,
    addAutonomousBehavior,
    addEnvironmentalEvent,
    addAchievement,
    logActivity,

    // Utility methods
    clearMessages,
    clearOldMessages,
    getMessagesByTimeRange,
    exportMessages,

    // Settings methods
    updateSettings,
    toggleLogging,
    toggleDebugMessages,

    // Save/Load methods
    getState,
    loadState
  }
})