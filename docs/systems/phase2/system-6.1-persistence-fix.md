# Guinea Pig Store Persistence Fix - System Documentation

**Phase:** Phase 2 (Core Entities & Timing)
**Status:** ✅ **Complete** - Guinea Pig Store Stable and Persistent
**Created:** September 21, 2025 | Branch: GPS2-7
**Updated:** September 27, 2025 | Branch: GPS2-9
**Completed:** September 27, 2025 | Branch: GPS2-9

## Overview
Guinea pig data persistence issues have been successfully resolved. The guinea pig store now reliably persists data across page refreshes with proper Pinia persistence configuration. Core guinea pig functionality is stable and ready for integration with the pet store & game session manager.

**Next System:** See `save-game-manager-plan.md` for the pet store architecture that builds on this foundation.

## Problem Analysis

### Current Implementation Status
- ✅ **Guinea pig store core**: Complete with TypeScript interfaces, CRUD operations
- ✅ **Debug panel integration**: Full debug interface with working functionality
- ✅ **GameController integration**: Store coordination and state management working
- ✅ **Data persistence**: Fixed - guinea pig data persists across page refreshes
- ✅ **Active guinea pig management**: Support for 1-2 active guinea pigs in game session
- ✅ **Pinia persistence**: Clean configuration with explicit paths

### Issues Resolved

#### 1. Global Store Initialization ✅ FIXED
```typescript
// SOLUTION: Stores now initialize properly on app startup
// Fixed through proper Pinia persistence configuration
```
**Result**: Stores initialize automatically, no longer dependent on debug panel

#### 2. Persistence Systems ✅ FIXED
```typescript
// SOLUTION: Clean Pinia persistence with explicit paths
persist: {
  key: 'gps2-guinea-pig-store',
  storage: localStorage,
  paths: ['collection', 'settings'] // Explicit paths prevent conflicts
}
```
**Result**: Reliable automatic persistence, no conflicts between systems

#### 3. State Coordination ✅ FIXED
```typescript
// SOLUTION: Simplified GameController, removed state clearing
// Guinea pig data managed independently by guinea pig store
// Game controller focuses on game state only, not guinea pig management
```
**Result**: Consistent state management, no data loss during game operations

#### 4. Initialization Order ✅ FIXED
```typescript
// SOLUTION: Pinia persistence handles initialization automatically
// Stores restore from localStorage on creation
// No manual initialization required, data preserved
```
**Result**: Automatic restoration of all persisted data on app startup

## Pet Store Architecture (Next Phase)

### Integration with Pet Store Manager
The guinea pig store provides the foundation for the pet store & game session manager system:

- **Pet Store Manager**: Will manage 10 random guinea pigs in "pet store"
- **Game Session**: Single active game session with 1-2 guinea pigs
- **Session State**: Guinea pig needs reset when returning to store
- **Persistent Progression**: Currency and items persist across sessions

See `save-game-manager-plan.md` for detailed pet store architecture.

## What Was Accomplished

### Core Issues Fixed
1. **Pinia Persistence Configuration**
   - Explicit paths configuration prevents state conflicts
   - Automatic restoration on app startup
   - Clean localStorage structure with proper key naming

2. **Store Initialization**
   - Stores initialize automatically via Pinia persistence
   - No manual initialization code required
   - Validation ensures data integrity on load

3. **Active Guinea Pig Management**
   - Support for 1-2 active guinea pigs per game session
   - Migration from single active ID to array-based system
   - Proper cleanup when guinea pigs are deleted

4. **Data Integrity**
   - Validation of guinea pig data on load
   - Cleanup of invalid references
   - Consistent state across operations

## Verification Results

### Persistence Testing ✅
- ✅ Guinea pig data persists across page refreshes
- ✅ Stores initialize automatically on app startup
- ✅ No conflicts between persistence systems
- ✅ Consistent state management across all operations

### Debug Panel Testing ✅
- ✅ Debug panel shows correct data immediately on load
- ✅ No delay or initialization issues
- ✅ Placeholder state works when no guinea pigs exist
- ✅ All guinea pig operations work reliably

### Edge Cases Handled ✅
- ✅ Empty state on first load
- ✅ Migration from old single active ID to array system
- ✅ Cleanup of invalid guinea pig references
- ✅ Active guinea pig validation on load

## Integration with Other Systems

### Enables
- **Pet Store & Game Session Manager**: Foundation for 10-guinea pig pet store system
- **Needs System**: Reliable guinea pig data for needs tracking
- **Habitat Conditions**: Persistent guinea pig state for habitat interactions
- **Player Progression**: Separation of session state from persistent progression

### Technical Foundation
- **Pinia Persistence**: Proven pattern for other stores to follow
- **Active Management**: Pattern for managing game session entities
- **Data Validation**: Reusable validation approach for other systems
- **Debug Integration**: Template for debug panels in other systems

## Technical Implementation

### Pinia Persistence Configuration
```typescript
export const useGuineaPigStore = defineStore('guineaPigStore', () => {
  // Store implementation
}, {
  persist: {
    key: 'gps2-guinea-pig-store',
    storage: localStorage
    // Explicit paths prevent state conflicts
  }
})
```

### Active Guinea Pig Management
```typescript
// Support for 1-2 active guinea pigs
const collection = ref<GuineaPigCollection>({
  guineaPigs: {},
  activeGuineaPigIds: [],  // Array supports multiple active
  lastUpdated: Date.now()
})

// Computed properties
const activeGuineaPigs = computed(() => {
  return collection.value.activeGuineaPigIds
    .map(id => collection.value.guineaPigs[id])
    .filter(Boolean)
})

const activeGuineaPig = computed(() => {
  // Backward compatibility - returns first active
  return activeGuineaPigs.value[0] || null
})
```

### Data Validation on Load
```typescript
const validateCollection = () => {
  // Ensure activeGuineaPigIds is always initialized
  if (!collection.value.activeGuineaPigIds) {
    collection.value.activeGuineaPigIds = []
  }

  // Migrate from old single active guinea pig
  if ((collection.value as any).activeGuineaPigId) {
    const oldActiveId = (collection.value as any).activeGuineaPigId
    if (oldActiveId && collection.value.guineaPigs[oldActiveId]) {
      collection.value.activeGuineaPigIds = [oldActiveId]
    }
    delete (collection.value as any).activeGuineaPigId
  }

  // Clean up invalid active IDs
  collection.value.activeGuineaPigIds =
    collection.value.activeGuineaPigIds.filter(id =>
      collection.value.guineaPigs[id]
    )
}

## Success Criteria

### All Criteria Met ✅
- [x] Guinea pig data persists across page refreshes
- [x] Stores initialize on app startup automatically
- [x] No conflicts between persistence systems
- [x] State remains consistent across all operations
- [x] Debug panel works immediately on page load
- [x] Empty state handling works correctly
- [x] Guinea pig CRUD operations work reliably
- [x] Active guinea pig management supports 1-2 guinea pigs
- [x] Migration from old single active ID system
- [x] Data validation on load cleans up invalid references

## Summary

The guinea pig store now provides a solid, persistent foundation for the game. All persistence issues have been resolved, and the store is ready for integration with the pet store & game session manager system.

**Next System:** Pet Store & Game Session Manager (`save-game-manager-plan.md`)