<template>
  <div class="pet-store-debug">
    <h2>Guinea Pigs</h2>
    <div class="panel-row">
    <!-- First Row: 3 columns on desktop -->
    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Available</h3>
      </div>
      <div class="panel__content">
        <!-- Active Guinea Pigs Section -->
        <div v-if="activeGuineaPigsByHabitat.length > 0" class="pet-store-debug__section">
          <h4 class="pet-store-debug__section-label">Active in Game</h4>
          <div class="pet-store-debug__habitats">
            <div
              v-for="[habitatNumber, guineaPigs] in activeGuineaPigsByHabitat"
              :key="`active-${habitatNumber}`"
              class="pet-store-debug__habitat"
            >
              <h5 class="pet-store-debug__habitat-label">Active Habitat</h5>
              <div class="pet-store-debug__guinea-pig-list">
                <div
                  v-for="guineaPig in guineaPigs"
                  :key="guineaPig.id"
                  class="pet-store-debug__guinea-pig-item"
                  :class="{
                    'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id,
                    'pet-store-debug__guinea-pig-item--active': true
                  }"
                  @click="selectedGuineaPig = guineaPig"
                >
              <div class="pet-store-debug__guinea-pig-header">
                <div class="pet-store-debug__guinea-pig-left">
                  <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
                  <div class="pet-store-debug__guinea-pig-badges">
                    <Badge variant="info" size="sm">ACTIVE</Badge>
                    <Badge
                      v-if="shouldShowRarityBadge(guineaPig.breed)"
                      :variant="getRarityBadgeVariant(guineaPig.breed)"
                      size="sm"
                    >
                      {{ getRarityBadgeText(guineaPig.breed) }}
                    </Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.gender }}</Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furColor }}</Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furPattern }}</Badge>
                  </div>
                </div>
                <div class="pet-store-debug__guinea-pig-right">
                  <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
                  <Button
                    v-if="!guineaPig.observed"
                    @click.stop="observeGuineaPig(guineaPig)"
                    variant="tertiary"
                    size="sm"
                  >
                    Observe {{ guineaPig.name }}
                  </Button>
                  <span
                    v-else
                    class="pet-store-debug__observed-badge"
                    :title="guineaPig.observationMessage"
                  >
                    Observed ✓
                  </span>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inactive Guinea Pigs Section -->
        <div v-if="inactiveGuineaPigsByHabitat.length > 0" class="pet-store-debug__section">
          <h4 v-if="activeGuineaPigsByHabitat.length > 0" class="pet-store-debug__section-label">In Pet Store</h4>
          <div class="pet-store-debug__habitats">
            <div
              v-for="[habitatNumber, guineaPigs] in inactiveGuineaPigsByHabitat"
              :key="`inactive-${habitatNumber}`"
              class="pet-store-debug__habitat"
            >
              <h5 class="pet-store-debug__habitat-label">Habitat {{ habitatNumber }}</h5>
              <div class="pet-store-debug__guinea-pig-list">
                <div
                  v-for="guineaPig in guineaPigs"
                  :key="guineaPig.id"
                  class="pet-store-debug__guinea-pig-item"
                  :class="{
                    'pet-store-debug__guinea-pig-item--selected': selectedGuineaPig?.id === guineaPig.id
                  }"
                  @click="selectedGuineaPig = guineaPig"
                >
              <div class="pet-store-debug__guinea-pig-header">
                <div class="pet-store-debug__guinea-pig-left">
                  <span class="pet-store-debug__guinea-pig-name">{{ guineaPig.name }}</span>
                  <div class="pet-store-debug__guinea-pig-badges">
                    <Badge
                      v-if="shouldShowRarityBadge(guineaPig.breed)"
                      :variant="getRarityBadgeVariant(guineaPig.breed)"
                      size="sm"
                    >
                      {{ getRarityBadgeText(guineaPig.breed) }}
                    </Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.gender }}</Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furColor }}</Badge>
                    <Badge variant="secondary" size="sm">{{ guineaPig.appearance.furPattern }}</Badge>
                  </div>
                  <div class="pet-store-debug__adoption-timer" v-if="guineaPig.adoptionTimer">
                    ⏱️ {{ getAdoptionTimerDisplay(guineaPig.id) }}
                  </div>
                </div>
                <div class="pet-store-debug__guinea-pig-right">
                  <span class="pet-store-debug__guinea-pig-breed">{{ guineaPig.breed }}</span>
                  <Button
                    v-if="!guineaPig.observed"
                    @click.stop="observeGuineaPig(guineaPig)"
                    variant="tertiary"
                    size="sm"
                  >
                    Observe {{ guineaPig.name }}
                  </Button>
                  <span
                    v-else
                    class="pet-store-debug__observed-badge"
                    :title="guineaPig.observationMessage"
                  >
                    Observed ✓
                  </span>
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel panel--compact">
      <div class="panel__header">
        <h3>Guinea Pig Editor</h3>
      </div>
      <div class="panel__content">
        <div v-if="selectedGuineaPig" class="pet-store-debug__editor">
          <BlockMessage v-if="isSelectedGuineaPigActive" variant="warning">
            ⚠️ Cannot edit active guinea pig in game session
          </BlockMessage>
          <Details summary="Basic Info" variant="bordered" default-open>
            <div class="flex flex-col gap-3">
              <label for="guinea-pig-name-input" class="form-field-inline">
                Name:
                <input
                  id="guinea-pig-name-input"
                  type="text"
                  v-model="selectedGuineaPig.name"
                  class="input"
                  :disabled="isSelectedGuineaPigActive"
                />
              </label>
              <Select
                v-model="selectedGuineaPig.gender"
                label="Gender:"
                :options="genderOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
              <Select
                v-model="selectedGuineaPig.breed"
                label="Breed:"
                :options="selectBreedOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
            </div>
          </Details>

          <Details summary="Appearance" variant="bordered">
            <div class="flex flex-col gap-3">
              <Select
                v-model="selectedGuineaPig.appearance.furColor"
                label="Color:"
                :options="selectFurColorOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
              <Select
                v-model="selectedGuineaPig.appearance.furPattern"
                label="Pattern:"
                :options="selectFurPatternOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
              <Select
                v-model="selectedGuineaPig.appearance.eyeColor"
                label="Eye Color:"
                :options="selectEyeColorOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
              <Select
                v-model="selectedGuineaPig.appearance.size"
                label="Size:"
                :options="sizeOptions"
                :disabled="isSelectedGuineaPigActive"
                size="sm"
              />
            </div>
          </Details>

          <Details summary="Personality" variant="bordered">
            <div class="flex flex-col gap-3">
              <SliderField
                v-model="selectedGuineaPig.personality.friendliness"
                :min="1"
                :max="10"
                label="Friendliness"
                size="sm"
                :disabled="isSelectedGuineaPigActive"
              />
              <SliderField
                v-model="selectedGuineaPig.personality.playfulness"
                :min="1"
                :max="10"
                label="Playfulness"
                size="sm"
                :disabled="isSelectedGuineaPigActive"
              />
              <SliderField
                v-model="selectedGuineaPig.personality.curiosity"
                :min="1"
                :max="10"
                label="Curiosity"
                size="sm"
                :disabled="isSelectedGuineaPigActive"
              />
              <SliderField
                v-model="selectedGuineaPig.personality.boldness"
                :min="1"
                :max="10"
                label="Boldness"
                size="sm"
                :disabled="isSelectedGuineaPigActive"
              />
              <SliderField
                v-model="selectedGuineaPig.personality.cleanliness"
                :min="1"
                :max="10"
                label="Cleanliness"
                size="sm"
                :disabled="isSelectedGuineaPigActive"
              />

              <hr class="divider">

              <!-- Need Decay Rate Modifiers -->
              <div class="decay-preview-section">
                <h4 class="decay-preview-section__title">Need Decay Rate Modifiers</h4>
                <div class="decay-preview">
                  <div class="decay-preview__item">
                    <span class="decay-preview__label">Social Need Decay:</span>
                    <span class="decay-preview__value" :class="getDecayModifierClass(getSocialDecayModifier(selectedGuineaPig.personality.friendliness))">
                      {{ getSocialDecayModifier(selectedGuineaPig.personality.friendliness) }}x
                      <span class="decay-preview__effect">{{ getDecayEffectText(getSocialDecayModifier(selectedGuineaPig.personality.friendliness)) }}</span>
                    </span>
                  </div>
                  <div class="decay-preview__item">
                    <span class="decay-preview__label">Play Need Decay:</span>
                    <span class="decay-preview__value" :class="getDecayModifierClass(getPlayDecayModifier(selectedGuineaPig.personality.playfulness))">
                      {{ getPlayDecayModifier(selectedGuineaPig.personality.playfulness) }}x
                      <span class="decay-preview__effect">{{ getDecayEffectText(getPlayDecayModifier(selectedGuineaPig.personality.playfulness)) }}</span>
                    </span>
                  </div>
                  <div class="decay-preview__item">
                    <span class="decay-preview__label">Stimulation Need Decay:</span>
                    <span class="decay-preview__value" :class="getDecayModifierClass(getStimulationDecayModifier(selectedGuineaPig.personality.curiosity))">
                      {{ getStimulationDecayModifier(selectedGuineaPig.personality.curiosity) }}x
                      <span class="decay-preview__effect">{{ getDecayEffectText(getStimulationDecayModifier(selectedGuineaPig.personality.curiosity)) }}</span>
                    </span>
                  </div>
                  <div class="decay-preview__item">
                    <span class="decay-preview__label">Comfort Need Decay:</span>
                    <span class="decay-preview__value" :class="getDecayModifierClass(getBoldnessDecayModifier(selectedGuineaPig.personality.boldness))">
                      {{ getBoldnessDecayModifier(selectedGuineaPig.personality.boldness) }}x
                      <span class="decay-preview__effect">{{ getDecayEffectText(getBoldnessDecayModifier(selectedGuineaPig.personality.boldness)) }}</span>
                    </span>
                  </div>
                  <div class="decay-preview__item">
                    <span class="decay-preview__label">Hygiene Need Decay:</span>
                    <span class="decay-preview__value" :class="getDecayModifierClass(getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness))">
                      {{ getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness) }}x
                      <span class="decay-preview__effect">{{ getDecayEffectText(getHygieneDecayModifier(selectedGuineaPig.personality.cleanliness)) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="vegFavorite2"
                        :options="selectVegetableOptions"
                        aria-label="Second liked vegetable"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="vegDislike2"
                        :options="selectVegetableOptions"
                        aria-label="Second disliked vegetable"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="fruitFavorite2"
                        :options="selectFruitOptions"
                        aria-label="Second liked fruit"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="fruitDislike2"
                        :options="selectFruitOptions"
                        aria-label="Second disliked fruit"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="hayFavorite2"
                        :options="selectHayOptions"
                        aria-label="Second liked hay type"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="hayDislike2"
                        :options="selectHayOptions"
                        aria-label="Second disliked hay type"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="activityFavorite2"
                        :options="selectActivityOptions"
                        aria-label="Second liked activity"
                        :disabled="isSelectedGuineaPigActive"
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
                        :disabled="isSelectedGuineaPigActive"
                        size="sm"
                      />
                      <Select
                        v-model="habitatFavorite2"
                        :options="selectHabitatOptions"
                        aria-label="Second liked habitat feature"
                        :disabled="isSelectedGuineaPigActive"
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
        <p v-else class="pet-store-debug__empty-message">Click a guinea pig to edit</p>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { usePetStoreManager } from '../../../stores/petStoreManager'
import { useSuppliesStore } from '../../../stores/suppliesStore'
import type { GuineaPig } from '../../../stores/guineaPigStore'
import SliderField from '../../basic/SliderField.vue'
import Badge from '../../basic/Badge.vue'
import Select from '../../basic/Select.vue'
import Details from '../../basic/Details.vue'
import BlockMessage from '../../basic/BlockMessage.vue'
import Button from '../../basic/Button.vue'
import { useLoggingStore } from '../../../stores/loggingStore'

const petStoreManager = usePetStoreManager()
const loggingStore = useLoggingStore()
const selectedGuineaPig = ref<GuineaPig | null>(null)

// Reactive time ref to trigger updates
const currentTime = ref(Date.now())

// Update timer display every second
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Update the current time every second to trigger reactivity
  timerInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

const isGuineaPigActive = (guineaPigId: string): boolean => {
  return petStoreManager.activeGameSession?.guineaPigIds.includes(guineaPigId) ?? false
}

const isSelectedGuineaPigActive = computed(() => {
  if (!selectedGuineaPig.value) return false
  return isGuineaPigActive(selectedGuineaPig.value.id)
})

// Sort guinea pigs with active ones at the top
const sortedAvailableGuineaPigs = computed(() => {
  return [...petStoreManager.availableGuineaPigs].sort((a, b) => {
    const aIsActive = isGuineaPigActive(a.id)
    const bIsActive = isGuineaPigActive(b.id)

    // Active guinea pigs come first
    if (aIsActive && !bIsActive) return -1
    if (!aIsActive && bIsActive) return 1

    return 0
  })
})

// Phase 7: Group guinea pigs by habitat - split into active and inactive
const activeGuineaPigsByHabitat = computed(() => {
  const grouped = new Map<number, GuineaPig[]>()

  for (const guineaPig of sortedAvailableGuineaPigs.value) {
    if (!isGuineaPigActive(guineaPig.id)) continue

    const habitat = guineaPig.habitat ?? 0
    if (!grouped.has(habitat)) {
      grouped.set(habitat, [])
    }
    grouped.get(habitat)!.push(guineaPig)
  }

  // Sort by habitat number
  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
})

const inactiveGuineaPigsByHabitat = computed(() => {
  const grouped = new Map<number, GuineaPig[]>()

  for (const guineaPig of sortedAvailableGuineaPigs.value) {
    if (isGuineaPigActive(guineaPig.id)) continue

    const habitat = guineaPig.habitat ?? 0
    if (!grouped.has(habitat)) {
      grouped.set(habitat, [])
    }
    grouped.get(habitat)!.push(guineaPig)
  }

  // Sort by habitat number
  return Array.from(grouped.entries()).sort((a, b) => a[0] - b[0])
})

// Dynamic option arrays from pet store manager
const furColorOptions = petStoreManager.furColors
const furPatternOptions = petStoreManager.furPatterns
const breedOptions = petStoreManager.breeds
const eyeColorOptions = petStoreManager.eyeColors

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

  if (selectedGuineaPig.value && !breedOptions.includes(selectedGuineaPig.value.breed)) {
    options.unshift({
      label: capitalize(selectedGuineaPig.value.breed),
      value: selectedGuineaPig.value.breed
    })
  }

  return options
})

const selectFurColorOptions = computed(() => {
  const options = furColorOptions.map(color => ({
    label: capitalize(color),
    value: color
  }))

  if (selectedGuineaPig.value && !furColorOptions.includes(selectedGuineaPig.value.appearance.furColor)) {
    options.unshift({
      label: capitalize(selectedGuineaPig.value.appearance.furColor),
      value: selectedGuineaPig.value.appearance.furColor
    })
  }

  return options
})

const selectFurPatternOptions = computed(() => {
  const options = furPatternOptions.map(pattern => ({
    label: capitalize(pattern),
    value: pattern
  }))

  if (selectedGuineaPig.value && !furPatternOptions.includes(selectedGuineaPig.value.appearance.furPattern)) {
    options.unshift({
      label: capitalize(selectedGuineaPig.value.appearance.furPattern),
      value: selectedGuineaPig.value.appearance.furPattern
    })
  }

  return options
})

const selectEyeColorOptions = computed(() => {
  const options = eyeColorOptions.map(eyeColor => ({
    label: capitalize(eyeColor),
    value: eyeColor
  }))

  if (selectedGuineaPig.value && !eyeColorOptions.includes(selectedGuineaPig.value.appearance.eyeColor)) {
    options.unshift({
      label: capitalize(selectedGuineaPig.value.appearance.eyeColor),
      value: selectedGuineaPig.value.appearance.eyeColor
    })
  }

  return options
})

// Preference option arrays - pull from Supplies Store
const suppliesStore = useSuppliesStore()
const vegetableOptions = computed(() => suppliesStore.vegetables.map(item => item.id))
const fruitOptions = computed(() => suppliesStore.fruits.map(item => item.id))
const hayOptions = computed(() => suppliesStore.allHay.map(item => item.id))
// Note: Greens and herbs are also available in the store for future use:
// - suppliesStore.greens
// - suppliesStore.herbs
const activityOptions = petStoreManager.activities
const habitatOptions = petStoreManager.habitatFeatures

// Helper function to capitalize first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()

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

// Helper function to get breed rarity
const getBreedRarity = (breed: string) => {
  return petStoreManager.getRarity(breed, petStoreManager.weightedBreeds)
}

// Helper function to determine if rarity should show badge
const shouldShowRarityBadge = (breed: string) => {
  const rarity = getBreedRarity(breed)
  return rarity === 'very-rare' || rarity === 'ultra-rare'
}

// Helper function to get badge variant for rarity
const getRarityBadgeVariant = (breed: string) => {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'warning'
  if (rarity === 'very-rare') return 'primary'
  return 'secondary'
}

// Helper function to get badge text for rarity
const getRarityBadgeText = (breed: string) => {
  const rarity = getBreedRarity(breed)
  if (rarity === 'ultra-rare') return 'ULTRA RARE'
  if (rarity === 'very-rare') return 'VERY RARE'
  return ''
}

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
watch(() => selectedGuineaPig.value, (gp) => {
  if (!gp) {
    // Clear all selects
    vegFavorite1.value = ''
    vegFavorite2.value = ''
    vegDislike1.value = ''
    vegDislike2.value = ''
    fruitFavorite1.value = ''
    fruitFavorite2.value = ''
    fruitDislike1.value = ''
    fruitDislike2.value = ''
    hayFavorite1.value = ''
    hayFavorite2.value = ''
    hayDislike1.value = ''
    hayDislike2.value = ''
    activityFavorite1.value = ''
    activityFavorite2.value = ''
    habitatFavorite1.value = ''
    habitatFavorite2.value = ''
    return
  }

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
  if (!selectedGuineaPig.value) return
  const favorites = [
    vegFavorite1.value,
    vegFavorite2.value,
    fruitFavorite1.value,
    fruitFavorite2.value,
    hayFavorite1.value,
    hayFavorite2.value
  ].filter(v => v !== '')
  selectedGuineaPig.value.preferences.favoriteFood = favorites
})

watch([vegDislike1, vegDislike2, fruitDislike1, fruitDislike2, hayDislike1, hayDislike2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize dislikedFood if it doesn't exist (for old guinea pigs)
  if (!selectedGuineaPig.value.preferences.dislikedFood) {
    selectedGuineaPig.value.preferences.dislikedFood = []
  }

  const dislikes = [
    vegDislike1.value,
    vegDislike2.value,
    fruitDislike1.value,
    fruitDislike2.value,
    hayDislike1.value,
    hayDislike2.value
  ].filter(v => v !== '')
  selectedGuineaPig.value.preferences.dislikedFood = dislikes
})

watch([activityFavorite1, activityFavorite2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize favoriteActivity if it doesn't exist
  if (!selectedGuineaPig.value.preferences.favoriteActivity) {
    selectedGuineaPig.value.preferences.favoriteActivity = []
  }

  selectedGuineaPig.value.preferences.favoriteActivity = [
    activityFavorite1.value,
    activityFavorite2.value
  ].filter(v => v !== '')
})

watch([habitatFavorite1, habitatFavorite2], () => {
  if (!selectedGuineaPig.value) return

  // Initialize habitatPreference if it doesn't exist
  if (!selectedGuineaPig.value.preferences.habitatPreference) {
    selectedGuineaPig.value.preferences.habitatPreference = []
  }

  selectedGuineaPig.value.preferences.habitatPreference = [
    habitatFavorite1.value,
    habitatFavorite2.value
  ].filter(v => v !== '')
})

// Auto-select first guinea pig when available or maintain selection after refresh
watch(() => petStoreManager.availableGuineaPigs, (guineaPigs) => {
  if (guineaPigs.length > 0) {
    // If we have a selected guinea pig, try to find it in the new list by ID
    if (selectedGuineaPig.value) {
      const foundGuineaPig = guineaPigs.find(gp => gp.id === selectedGuineaPig.value!.id)
      if (foundGuineaPig) {
        selectedGuineaPig.value = foundGuineaPig
      } else {
        // If the previously selected guinea pig is not found, select the first one
        selectedGuineaPig.value = guineaPigs[0]
      }
    } else {
      // No guinea pig selected, select the first one
      selectedGuineaPig.value = guineaPigs[0]
    }
  }
}, { immediate: true })

// Phase 2: Adoption timer display
const getAdoptionTimerDisplay = (guineaPigId: string) => {
  const remaining = petStoreManager.getAdoptionTimeRemaining(guineaPigId)
  return petStoreManager.formatAdoptionTimer(remaining)
}

// Phase 7: Observe interaction
const observeGuineaPig = (guineaPig: GuineaPig) => {
  if (guineaPig.observed) return

  // Mark as observed
  guineaPig.observed = true

  // Generate personality glimpse message based on personality traits
  const messages = [
    `${guineaPig.name} is munching hay contentedly. 🌾`,
    `${guineaPig.name} looks at you curiously. 👀`,
    `${guineaPig.name} is sleeping stretched out in the corner. 😴`,
    `${guineaPig.name} is taking cover in an igloo. 🏠`,
    `${guineaPig.name} is popcorning excitedly! 🎉`,
    `${guineaPig.name} is grooming their fur carefully. ✨`
  ]

  // Pick message based on personality (for now, random, but could be smarter)
  const messageIndex = Math.floor(Math.random() * messages.length)
  const message = messages[messageIndex]

  // Store observation message on guinea pig
  guineaPig.observationMessage = message

  // Log to activity feed
  loggingStore.addGuineaPigReaction(message, undefined, { action: 'observe', guineaPigId: guineaPig.id })
}

// Decay modifier helper functions
function getSocialDecayModifier(friendliness: number): string {
  const modifier = 1 + (friendliness - 5) * 0.04
  return modifier.toFixed(2)
}

function getPlayDecayModifier(playfulness: number): string {
  const modifier = 1 + (playfulness - 5) * 0.06
  return modifier.toFixed(2)
}

function getStimulationDecayModifier(curiosity: number): string {
  const modifier = 1 + (curiosity - 5) * 0.08
  return modifier.toFixed(2)
}

function getBoldnessDecayModifier(boldness: number): string {
  const modifier = 1 - (boldness - 5) * 0.05
  return modifier.toFixed(2)
}

function getHygieneDecayModifier(cleanliness: number): string {
  const modifier = 1 - (cleanliness - 5) * 0.06
  return modifier.toFixed(2)
}

function getDecayModifierClass(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  if (modifierValue < 0.9) return 'decay-modifier--slower'
  if (modifierValue > 1.1) return 'decay-modifier--faster'
  return 'decay-modifier--normal'
}

function getDecayEffectText(modifier: string): string {
  const modifierValue = parseFloat(modifier)
  const percentChange = ((modifierValue - 1) * 100).toFixed(0)

  if (modifierValue < 1) {
    return `(${percentChange}%)`
  } else if (modifierValue > 1) {
    return `(+${percentChange}%)`
  }
  return '(±0%)'
}
</script>

<style>
/* === Section Labels === */
.pet-store-debug__section {
  margin-block-end: var(--space-6);
}

.pet-store-debug__section:last-child {
  margin-block-end: 0;
}

.pet-store-debug__section-label {
  margin: 0;
  margin-block-end: var(--space-4);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

/* === Habitat Organization Section === */
.pet-store-debug__habitats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pet-store-debug__habitat {
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  background-color: var(--color-bg-tertiary);
}

.pet-store-debug__habitat-label {
  margin: 0;
  margin-block-end: var(--space-3);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

/* === Guinea Pig List Section === */
.pet-store-debug__guinea-pig-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.pet-store-debug__guinea-pig-item {
  padding-block: 0.75rem;
  padding-inline: 1rem;
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pet-store-debug__guinea-pig-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.pet-store-debug__guinea-pig-item--selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.pet-store-debug__guinea-pig-item--active {
  border-inline-start: 4px solid var(--color-success);
  padding-inline-start: calc(1rem - 3px);
}

.pet-store-debug__guinea-pig-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.pet-store-debug__guinea-pig-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.pet-store-debug__guinea-pig-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
}

.pet-store-debug__guinea-pig-badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.pet-store-debug__adoption-timer {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-block-start: var(--space-2);
  font-weight: 500;
}

.pet-store-debug__guinea-pig-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
}

.pet-store-debug__guinea-pig-breed {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  text-align: end;
}

.pet-store-debug__observed-badge {
  font-size: 0.85rem;
  color: var(--color-success);
  font-weight: 500;
  cursor: help;
  text-decoration: underline dotted;
}

/* === Editor Section === */
.pet-store-debug__editor {
  display: flex;
  flex-direction: column;
}

.pet-store-debug__editor .panel__header:not(:first-child) {
  margin-block-start: var(--space-6);
}

/* === Disabled Form Controls === */
.pet-store-debug__editor .input:disabled,
.pet-store-debug__editor select:disabled {
  background-color: var(--color-neutral-600);
  color: var(--color-neutral-200);
  border-color: var(--color-neutral-500);
  cursor: not-allowed;
  opacity: 0.9;
}

.pet-store-debug__empty-message {
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  margin-block: 1rem;
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

/* === Preference Checkboxes Layout === */
/* Grouped Checkboxes - For preference lists */
.preference-checkboxes {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-inline-start: var(--space-2);
}

.preference-category {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.preference-category-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-block-end: var(--space-1);
}

/* === Cost Sequence Display === */
.cost-sequence-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.cost-sequence {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.cost-badge {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg-secondary);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.cost-badge--current {
  background-color: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.cost-badge--past {
  background-color: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
  opacity: 0.7;
}

/* === Decay Preview Section === */
.decay-preview-section {
  margin-block-start: var(--space-3);
}

.decay-preview-section__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-block-end: var(--space-3);
  color: var(--color-text);
}

.decay-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.decay-preview__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-block: var(--space-2);
  border-block-end: 1px solid var(--color-border-medium);
}

.decay-preview__item:last-child {
  border-block-end: none;
}

.decay-preview__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.decay-preview__value {
  font-size: var(--font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.decay-preview__effect {
  font-size: var(--font-size-xs);
  font-weight: 400;
}

/* Decay Modifier Classes */
.decay-modifier--slower {
  color: var(--color-success);
}

.decay-modifier--faster {
  color: var(--color-error);
}

.decay-modifier--normal {
  color: var(--color-text-secondary);
}
</style>
