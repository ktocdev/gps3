/**
 * Map Serialization Utilities
 * Phase 3 - Safe Map deserialization for localStorage/Pinia persistence
 */

/**
 * Safely deserializes a value into a Map, with fallback on error
 * @param value - The value to deserialize (should be an array of [key, value] tuples)
 * @param fallback - The fallback Map to return if deserialization fails
 * @returns A Map instance
 */
export function safeDeserializeMap<K, V>(
  value: unknown,
  fallback: Map<K, V> = new Map()
): Map<K, V> {
  if (!value || !Array.isArray(value)) {
    return fallback
  }

  try {
    // Validate that all items are arrays with 2 elements
    const isValid = value.every(
      item => Array.isArray(item) && item.length === 2
    )

    if (!isValid) {
      console.warn('[mapSerialization] Invalid Map data structure, using fallback')
      return fallback
    }

    return new Map(value as [K, V][])
  } catch (error) {
    console.error('[mapSerialization] Failed to deserialize Map:', error)
    return fallback
  }
}

/**
 * Serializes a Map into an array of [key, value] tuples for storage
 * @param map - The Map to serialize
 * @returns An array of [key, value] tuples
 */
export function serializeMap<K, V>(map: Map<K, V>): [K, V][] {
  return Array.from(map.entries())
}

/**
 * Safely deserializes multiple Maps from an object
 * @param data - Object containing Map data
 * @param mapKeys - Array of keys that should be deserialized as Maps
 * @returns The data object with Maps properly deserialized
 */
export function deserializeMapsInObject<T extends Record<string, unknown>>(
  data: T,
  mapKeys: (keyof T)[]
): T {
  const result = { ...data }

  for (const key of mapKeys) {
    if (key in result) {
      result[key] = safeDeserializeMap(result[key]) as T[keyof T]
    }
  }

  return result
}
