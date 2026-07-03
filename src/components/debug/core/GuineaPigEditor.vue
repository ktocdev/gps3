<template>
  <div class="guinea-pig-editor">
    <Details summary="Basic Info" variant="bordered" default-open>
      <div class="flex flex-col gap-3">
        <label for="guinea-pig-name-input" class="form-field-inline">
          Name
          <input
            id="guinea-pig-name-input"
            type="text"
            v-model="guineaPig.name"
            class="input"
            :disabled="disabled"
          />
        </label>
        <Select
          v-model="guineaPig.gender"
          label="Gender"
          :options="genderOptions"
          :disabled="disabled"
          size="sm"
        />
        <Select
          v-model="guineaPig.breed"
          label="Breed"
          :options="selectBreedOptions"
          :disabled="disabled"
          size="sm"
        />
      </div>
    </Details>

    <Details summary="Appearance" variant="bordered">
      <div class="flex flex-col gap-3">
        <Select
          v-model="guineaPig.appearance.furColor"
          label="Color"
          :options="selectFurColorOptions"
          :disabled="disabled"
          size="sm"
        />
        <Select
          v-model="guineaPig.appearance.furPattern"
          label="Pattern"
          :options="selectFurPatternOptions"
          :disabled="disabled"
          size="sm"
        />
        <Select
          v-model="guineaPig.appearance.eyeColor"
          label="Eye Color"
          :options="selectEyeColorOptions"
          :disabled="disabled"
          size="sm"
        />
        <Select
          v-model="guineaPig.appearance.size"
          label="Size"
          :options="sizeOptions"
          :disabled="disabled"
          size="sm"
        />
      </div>
    </Details>

    <Details summary="Personality" variant="bordered">
      <DebugSection>
        <div class="guinea-pig-editor__sliders">
          <DebugSlider
            v-model="guineaPig.personality.friendliness"
            :min="1"
            :max="10"
            label="Friendliness"
            suffix=""
            accent="var(--color-pink-500)"
            :disabled="disabled"
          />
          <DebugSlider
            v-model="guineaPig.personality.playfulness"
            :min="1"
            :max="10"
            label="Playfulness"
            suffix=""
            accent="var(--color-pink-500)"
            :disabled="disabled"
          />
          <DebugSlider
            v-model="guineaPig.personality.curiosity"
            :min="1"
            :max="10"
            label="Curiosity"
            suffix=""
            accent="var(--color-pink-500)"
            :disabled="disabled"
          />
          <DebugSlider
            v-model="guineaPig.personality.boldness"
            :min="1"
            :max="10"
            label="Boldness"
            suffix=""
            accent="var(--color-pink-500)"
            :disabled="disabled"
          />
          <DebugSlider
            v-model="guineaPig.personality.cleanliness"
            :min="1"
            :max="10"
            label="Cleanliness"
            suffix=""
            accent="var(--color-pink-500)"
            :disabled="disabled"
          />
        </div>
      </DebugSection>

      <!-- Need Decay Rate Modifiers -->
      <DebugSection title="Need Decay Rate Modifiers">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Social Need Decay</span>
            <span class="stat-value" :class="getDecayModifierClass(getSocialDecayModifier(guineaPig.personality.friendliness))">
              {{ getSocialDecayModifier(guineaPig.personality.friendliness) }}x
              <span class="guinea-pig-editor__decay-effect">{{ getDecayEffectText(getSocialDecayModifier(guineaPig.personality.friendliness)) }}</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Play Need Decay</span>
            <span class="stat-value" :class="getDecayModifierClass(getPlayDecayModifier(guineaPig.personality.playfulness))">
              {{ getPlayDecayModifier(guineaPig.personality.playfulness) }}x
              <span class="guinea-pig-editor__decay-effect">{{ getDecayEffectText(getPlayDecayModifier(guineaPig.personality.playfulness)) }}</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Stimulation Need Decay</span>
            <span class="stat-value" :class="getDecayModifierClass(getStimulationDecayModifier(guineaPig.personality.curiosity))">
              {{ getStimulationDecayModifier(guineaPig.personality.curiosity) }}x
              <span class="guinea-pig-editor__decay-effect">{{ getDecayEffectText(getStimulationDecayModifier(guineaPig.personality.curiosity)) }}</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Comfort Need Decay</span>
            <span class="stat-value" :class="getDecayModifierClass(getBoldnessDecayModifier(guineaPig.personality.boldness))">
              {{ getBoldnessDecayModifier(guineaPig.personality.boldness) }}x
              <span class="guinea-pig-editor__decay-effect">{{ getDecayEffectText(getBoldnessDecayModifier(guineaPig.personality.boldness)) }}</span>
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hygiene Need Decay</span>
            <span class="stat-value" :class="getDecayModifierClass(getHygieneDecayModifier(guineaPig.personality.cleanliness))">
              {{ getHygieneDecayModifier(guineaPig.personality.cleanliness) }}x
              <span class="guinea-pig-editor__decay-effect">{{ getDecayEffectText(getHygieneDecayModifier(guineaPig.personality.cleanliness)) }}</span>
            </span>
          </div>
        </div>
      </DebugSection>
    </Details>

    <Details summary="Preferences (Likes & Dislikes)" variant="bordered">
      <div class="flex flex-col gap-3">
      <!-- Food Preferences -->
      <div class="form-field-block">
        <!-- Vegetables -->
        <fieldset class="preference-row">
          <legend class="preference-row__label">Vegetables</legend>
          <div class="preference-row__controls">
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Likes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="vegFavorite1"
                  :options="selectVegetableOptions"
                  aria-label="First liked vegetable"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="vegFavorite2"
                  :options="selectVegetableOptions"
                  aria-label="Second liked vegetable"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="vegDislike1"
                  :options="selectVegetableOptions"
                  aria-label="First disliked vegetable"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="vegDislike2"
                  :options="selectVegetableOptions"
                  aria-label="Second disliked vegetable"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </fieldset>
        <hr class="divider">

        <!-- Fruits -->
        <fieldset class="preference-row">
          <legend class="preference-row__label">Fruits</legend>
          <div class="preference-row__controls">
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Likes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="fruitFavorite1"
                  :options="selectFruitOptions"
                  aria-label="First liked fruit"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="fruitFavorite2"
                  :options="selectFruitOptions"
                  aria-label="Second liked fruit"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="fruitDislike1"
                  :options="selectFruitOptions"
                  aria-label="First disliked fruit"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="fruitDislike2"
                  :options="selectFruitOptions"
                  aria-label="Second disliked fruit"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </fieldset>
        <hr class="divider">

        <!-- Hay Types -->
        <fieldset class="preference-row">
          <legend class="preference-row__label">Hay Types</legend>
          <div class="preference-row__controls">
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Likes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="hayFavorite1"
                  :options="selectHayOptions"
                  aria-label="First liked hay type"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="hayFavorite2"
                  :options="selectHayOptions"
                  aria-label="Second liked hay type"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Dislikes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="hayDislike1"
                  :options="selectHayOptions"
                  aria-label="First disliked hay type"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="hayDislike2"
                  :options="selectHayOptions"
                  aria-label="Second disliked hay type"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <hr class="divider">

      <!-- Activity Preferences -->
      <div class="form-field-block">
        <fieldset class="preference-row">
          <legend class="preference-row__label">Activities</legend>
          <div class="preference-row__controls">
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Likes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="activityFavorite1"
                  :options="selectActivityOptions"
                  aria-label="First liked activity"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="activityFavorite2"
                  :options="selectActivityOptions"
                  aria-label="Second liked activity"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <hr class="divider">

      <!-- Habitat Preferences -->
      <div class="form-field-block">
        <fieldset class="preference-row">
          <legend class="preference-row__label">Habitat</legend>
          <div class="preference-row__controls">
            <div class="preference-row__group">
              <span class="preference-row__group-label" aria-hidden="true">Likes</span>
              <div class="preference-row__selects">
                <Select
                  v-model="habitatFavorite1"
                  :options="selectHabitatOptions"
                  aria-label="First liked habitat feature"
                  :disabled="disabled"
                  size="sm"
                />
                <Select
                  v-model="habitatFavorite2"
                  :options="selectHabitatOptions"
                  aria-label="Second liked habitat feature"
                  :disabled="disabled"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      </div>
    </Details>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import Select from '../../basic/Select.vue'
import Details from '../../basic/Details.vue'
import DebugSection from '../ui/DebugSection.vue'
import DebugSlider from '../ui/DebugSlider.vue'
import {
  capitalize,
  getSocialDecayModifier,
  getPlayDecayModifier,
  getStimulationDecayModifier,
  getBoldnessDecayModifier,
  getHygieneDecayModifier,
  getDecayModifierClass,
  getDecayEffectText
} from '../../../utils/personalityDecay'

const props = withDefaults(defineProps<{
  guineaPig: GuineaPig
  disabled?: boolean
}>(), {
  disabled: false
})

const petStoreManager = usePetStoreManager()
const suppliesStore = useSuppliesStore()

// Dynamic option arrays from pet store manager
const furColorOptions = petStoreManager.furColors
const furPatternOptions = petStoreManager.furPatterns
const breedOptions = petStoreManager.breeds
const eyeColorOptions = petStoreManager.eyeColors
const activityOptions = petStoreManager.activities
const habitatOptions = petStoreManager.habitatFeatures

// Select component options
const genderOptions = [
  { label: 'Neutered Boar', value: 'male' },
  { label: 'Sow', value: 'female' }
]

const sizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' }
]

const selectBreedOptions = computed(() => {
  const options = breedOptions.map(breed => ({
    label: capitalize(breed),
    value: breed
  }))

  if (!breedOptions.includes(props.guineaPig.breed)) {
    options.unshift({
      label: capitalize(props.guineaPig.breed),
      value: props.guineaPig.breed
    })
  }

  return options
})

const selectFurColorOptions = computed(() => {
  const options = furColorOptions.map(color => ({
    label: capitalize(color),
    value: color
  }))

  if (!furColorOptions.includes(props.guineaPig.appearance.furColor)) {
    options.unshift({
      label: capitalize(props.guineaPig.appearance.furColor),
      value: props.guineaPig.appearance.furColor
    })
  }

  return options
})

const selectFurPatternOptions = computed(() => {
  const options = furPatternOptions.map(pattern => ({
    label: capitalize(pattern),
    value: pattern
  }))

  if (!furPatternOptions.includes(props.guineaPig.appearance.furPattern)) {
    options.unshift({
      label: capitalize(props.guineaPig.appearance.furPattern),
      value: props.guineaPig.appearance.furPattern
    })
  }

  return options
})

const selectEyeColorOptions = computed(() => {
  const options = eyeColorOptions.map(eyeColor => ({
    label: capitalize(eyeColor),
    value: eyeColor
  }))

  if (!eyeColorOptions.includes(props.guineaPig.appearance.eyeColor)) {
    options.unshift({
      label: capitalize(props.guineaPig.appearance.eyeColor),
      value: props.guineaPig.appearance.eyeColor
    })
  }

  return options
})

// Preference option arrays - pull from Supplies Store
const vegetableOptions = computed(() => suppliesStore.vegetables.map(item => item.id))
const fruitOptions = computed(() => suppliesStore.fruits.map(item => item.id))
const hayOptions = computed(() => suppliesStore.allHay.map(item => item.id))
// Note: Greens and herbs are also available in the store for future use:
// - suppliesStore.greens
// - suppliesStore.herbs

// Helper function for formatting preference names (remove category prefix, snake_case → Title Case)
const formatPreferenceName = (name: string) => {
  // Remove category prefixes: food_, hay_, habitat_
  const withoutPrefix = name.replace(/^(food|hay|habitat)_/, '')

  // Convert snake_case to Title Case
  return withoutPrefix.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

// Select component options for preferences
const selectVegetableOptions = computed(() => [
  { label: 'None', value: '' },
  ...vegetableOptions.value.map((veg: string) => ({
    label: formatPreferenceName(veg),
    value: veg
  }))
])

const selectFruitOptions = computed(() => [
  { label: 'None', value: '' },
  ...fruitOptions.value.map((fruit: string) => ({
    label: formatPreferenceName(fruit),
    value: fruit
  }))
])

const selectHayOptions = computed(() => [
  { label: 'None', value: '' },
  ...hayOptions.value.map((hay: string) => ({
    label: formatPreferenceName(hay),
    value: hay
  }))
])

const selectActivityOptions = computed(() => [
  { label: 'None', value: '' },
  ...activityOptions.map((activity: string) => ({
    label: formatPreferenceName(activity),
    value: activity
  }))
])

const selectHabitatOptions = computed(() => [
  { label: 'None', value: '' },
  ...habitatOptions.map((habitat: string) => ({
    label: formatPreferenceName(habitat),
    value: habitat
  }))
])

// Preference select refs (for v-model binding)
const vegFavorite1 = ref('')
const vegFavorite2 = ref('')
const vegDislike1 = ref('')
const vegDislike2 = ref('')

const fruitFavorite1 = ref('')
const fruitFavorite2 = ref('')
const fruitDislike1 = ref('')
const fruitDislike2 = ref('')

const hayFavorite1 = ref('')
const hayFavorite2 = ref('')
const hayDislike1 = ref('')
const hayDislike2 = ref('')

const activityFavorite1 = ref('')
const activityFavorite2 = ref('')

const habitatFavorite1 = ref('')
const habitatFavorite2 = ref('')

// Helper function to extract category-specific preferences
const getPreferencesForCategory = (allPreferences: string[], category: string[]): string[] => {
  return allPreferences.filter(item => category.includes(item))
}

// Sync preference selects with guinea pig data
watch(() => props.guineaPig, (gp) => {
  // Extract category-specific preferences (with fallbacks for missing fields)
  const vegFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], vegetableOptions.value)
  const vegDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], vegetableOptions.value)
  const fruitFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], fruitOptions.value)
  const fruitDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], fruitOptions.value)
  const hayFavorites = getPreferencesForCategory(gp.preferences.favoriteFood || [], hayOptions.value)
  const hayDislikes = getPreferencesForCategory(gp.preferences.dislikedFood || [], hayOptions.value)

  // Populate selects
  vegFavorite1.value = vegFavorites[0] || ''
  vegFavorite2.value = vegFavorites[1] || ''
  vegDislike1.value = vegDislikes[0] || ''
  vegDislike2.value = vegDislikes[1] || ''

  fruitFavorite1.value = fruitFavorites[0] || ''
  fruitFavorite2.value = fruitFavorites[1] || ''
  fruitDislike1.value = fruitDislikes[0] || ''
  fruitDislike2.value = fruitDislikes[1] || ''

  hayFavorite1.value = hayFavorites[0] || ''
  hayFavorite2.value = hayFavorites[1] || ''
  hayDislike1.value = hayDislikes[0] || ''
  hayDislike2.value = hayDislikes[1] || ''

  activityFavorite1.value = (gp.preferences.favoriteActivity || [])[0] || ''
  activityFavorite2.value = (gp.preferences.favoriteActivity || [])[1] || ''

  habitatFavorite1.value = (gp.preferences.habitatPreference || [])[0] || ''
  habitatFavorite2.value = (gp.preferences.habitatPreference || [])[1] || ''
}, { immediate: true })

// Watch selects and update guinea pig preferences
watch([vegFavorite1, vegFavorite2, fruitFavorite1, fruitFavorite2, hayFavorite1, hayFavorite2], () => {
  const favorites = [
    vegFavorite1.value,
    vegFavorite2.value,
    fruitFavorite1.value,
    fruitFavorite2.value,
    hayFavorite1.value,
    hayFavorite2.value
  ].filter(v => v !== '')
  props.guineaPig.preferences.favoriteFood = favorites
})

watch([vegDislike1, vegDislike2, fruitDislike1, fruitDislike2, hayDislike1, hayDislike2], () => {
  // Initialize dislikedFood if it doesn't exist (for old guinea pigs)
  if (!props.guineaPig.preferences.dislikedFood) {
    props.guineaPig.preferences.dislikedFood = []
  }

  const dislikes = [
    vegDislike1.value,
    vegDislike2.value,
    fruitDislike1.value,
    fruitDislike2.value,
    hayDislike1.value,
    hayDislike2.value
  ].filter(v => v !== '')
  props.guineaPig.preferences.dislikedFood = dislikes
})

watch([activityFavorite1, activityFavorite2], () => {
  // Initialize favoriteActivity if it doesn't exist
  if (!props.guineaPig.preferences.favoriteActivity) {
    props.guineaPig.preferences.favoriteActivity = []
  }

  props.guineaPig.preferences.favoriteActivity = [
    activityFavorite1.value,
    activityFavorite2.value
  ].filter(v => v !== '')
})

watch([habitatFavorite1, habitatFavorite2], () => {
  // Initialize habitatPreference if it doesn't exist
  if (!props.guineaPig.preferences.habitatPreference) {
    props.guineaPig.preferences.habitatPreference = []
  }

  props.guineaPig.preferences.habitatPreference = [
    habitatFavorite1.value,
    habitatFavorite2.value
  ].filter(v => v !== '')
})
</script>

<style>
.guinea-pig-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* === Personality Sliders === */
.guinea-pig-editor__sliders {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* === Disabled Form Controls === */
.guinea-pig-editor .input:disabled,
.guinea-pig-editor select:disabled {
  background-color: var(--color-neutral-600);
  color: var(--color-neutral-200);
  border-color: var(--color-neutral-500);
  cursor: not-allowed;
  opacity: 0.9;
}

/* === Decay Modifier Values === */
.guinea-pig-editor__decay-effect {
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-normal);
}

.decay-modifier--slower {
  color: var(--color-success);
}

.decay-modifier--faster {
  color: var(--color-error);
}

.decay-modifier--normal {
  color: var(--color-text-secondary);
}

/* === Preference Row Layout === */
/* Preference row layout - category on top, likes/dislikes below */
.preference-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-block: var(--space-2);
  border: none;
  padding-inline: 0;
  margin-inline: 0;
  min-inline-size: 0;
}

.preference-row__label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  padding-inline: 0;
  margin-block-end: 0;
}

.preference-row__controls {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.preference-row__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.preference-row__group-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preference-row__selects {
  display: flex;
  gap: var(--space-2);
}
</style>
