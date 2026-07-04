---
source: src/utils/mapSerialization.ts
source_hash: 0134cbfb46a85cfa24b9691d5a81d7e6525fff15a4d65f13691064cdcda61697
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Map Serialization Utilities

`src/utils/mapSerialization.ts`

> Provides safe helper functions for serializing and deserializing JavaScript `Map` instances to and from array-of-tuples format, intended for use with localStorage/Pinia persistence where Maps cannot be directly JSON-serialized.

This file exports three generic utility functions.

`safeDeserializeMap` converts a value (expected to be an array of `[key, value]` tuples) back into a `Map`. It returns a fallback Map if the value is falsy or not an array, validates that every item is a 2-element array (warning and falling back if not), and wraps construction in a try/catch that logs errors and returns the fallback.

`serializeMap` converts a `Map` into an array of `[key, value]` tuples via `Array.from(map.entries())`.

`deserializeMapsInObject` takes an object and a list of keys that should be treated as Maps, shallow-copies the object, and runs `safeDeserializeMap` on each specified key that exists.

## Exports

- **safeDeserializeMap** (function) — `safeDeserializeMap<K, V>(value: unknown, fallback?: Map<K, V>): Map<K, V>`: Deserializes an array of [key,value] tuples into a Map. Returns the provided fallback (default new empty Map) if the value is falsy, not an array, contains invalid items, or throws during construction. Logs warnings/errors to console.
- **serializeMap** (function) — `serializeMap<K, V>(map: Map<K, V>): [K, V][]`: Serializes a Map into an array of [key, value] tuples for storage.
- **deserializeMapsInObject** (function) — `deserializeMapsInObject<T extends Record<string, unknown>>(data: T, mapKeys: (keyof T)[]): T`: Returns a shallow copy of the given object with the specified keys deserialized into Maps via safeDeserializeMap.

## Notes

- deserializeMapsInObject always uses an empty Map fallback (no custom fallback supported per key).
- Uses double type assertions (as [K,V][] and as T[keyof T]) so type safety is not guaranteed at runtime; validation only checks tuple shape, not key/value types.
- Side effects: logs to console.warn/console.error on invalid or failed deserialization.
