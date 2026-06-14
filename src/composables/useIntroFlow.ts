import { ref } from 'vue'

// Module-scoped so the intro splash plays once per page load (before the pet
// store picker) and does NOT replay when navigating away and back. A full
// reload resets it.
const introSeen = ref(false)

export function useIntroFlow() {
  return {
    introSeen,
    markIntroSeen: () => { introSeen.value = true }
  }
}
