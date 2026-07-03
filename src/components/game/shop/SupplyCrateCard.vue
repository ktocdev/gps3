<template>
  <div class="supply-crate" :style="{ '--crate-tilt': `${tilt}deg` }">
    <div class="supply-crate__slats" aria-hidden="true"></div>
    <div class="supply-crate__stud supply-crate__stud--tl" aria-hidden="true"></div>
    <div class="supply-crate__stud supply-crate__stud--tr" aria-hidden="true"></div>
    <div class="supply-crate__stud supply-crate__stud--bl" aria-hidden="true"></div>
    <div class="supply-crate__stud supply-crate__stud--br" aria-hidden="true"></div>

    <div v-if="owned > 0" class="supply-crate__owned">
      <span class="supply-crate__owned-pin" aria-hidden="true"></span>
      Owned ×{{ owned }}
    </div>

    <div class="supply-crate__face">
      <div class="supply-crate__emoji">{{ item.emoji || fallbackEmoji }}</div>
      <div class="supply-crate__card">
        <div class="supply-crate__card-pin supply-crate__card-pin--start" aria-hidden="true"></div>
        <div class="supply-crate__card-pin supply-crate__card-pin--end" aria-hidden="true"></div>
        <div class="supply-crate__name">{{ item.name }}</div>
        <div class="supply-crate__blurb">{{ item.description }}</div>
      </div>
    </div>

    <div class="supply-crate__footer">
      <div class="supply-crate__price">🪙 {{ item.basePrice }}</div>
      <div class="supply-crate__actions">
        <button
          v-if="returnable > 0"
          class="supply-crate__sell"
          type="button"
          :title="`Sell for 🪙 ${item.basePrice}`"
          @click="$emit('sell', item)"
        >
          Sell <span class="supply-crate__sell-price">🪙{{ item.basePrice }}</span>
        </button>
        <button
          class="supply-crate__buy"
          type="button"
          :disabled="!affordable"
          @click="$emit('buy', item)"
        >Add</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SuppliesItem } from '../../../types/supplies'

defineProps<{
  item: SuppliesItem
  owned: number
  returnable: number
  affordable: boolean
  tilt: number
  fallbackEmoji: string
}>()

defineEmits<{
  buy: [item: SuppliesItem]
  sell: [item: SuppliesItem]
}>()
</script>
