<template>
  <div class="item-list-view">
    <table class="item-list-view__table">
      <thead class="item-list-view__header">
        <tr>
          <th class="item-list-view__th">Item</th>
          <th v-if="showPrice" class="item-list-view__th item-list-view__th--center">Price</th>
          <th v-if="showOwned" class="item-list-view__th item-list-view__th--center">Owned</th>
          <th v-if="showReturnable" class="item-list-view__th item-list-view__th--center">Returnable</th>
          <th v-if="showStatus" class="item-list-view__th item-list-view__th--center">Status</th>
          <th v-if="showActions" class="item-list-view__th item-list-view__th--right">Actions</th>
        </tr>
      </thead>
      <tbody class="item-list-view__body">
        <tr
          v-for="item in items"
          :key="item.id"
          class="item-list-view__row"
        >
          <!-- Item Name & Description -->
          <td class="item-list-view__td">
            <div class="item-list-view__item-info">
              <span v-if="item.emoji" class="item-list-view__emoji">{{ item.emoji }}</span>
              <div class="item-list-view__item-details">
                <div class="item-list-view__item-name">
                  {{ item.name }}
                  <Badge v-if="item.isEssential" variant="warning" size="sm">Essential</Badge>
                  <Badge v-if="item.availability === 'seasonal'" variant="seasonal" size="sm">Seasonal</Badge>
                  <Badge v-else-if="item.availability === 'limited'" variant="info" size="sm">Limited</Badge>
                </div>
                <div class="item-list-view__item-description">{{ item.description }}</div>
              </div>
            </div>
          </td>

          <!-- Price (optional) -->
          <td v-if="showPrice" class="item-list-view__td item-list-view__td--center">
            <span class="item-list-view__price">${{ item.basePrice.toFixed(2) }}</span>
          </td>

          <!-- Owned Count (optional) -->
          <td v-if="showOwned" class="item-list-view__td item-list-view__td--center">
            <span class="item-list-view__owned">{{ item.owned || 0 }}</span>
          </td>

          <!-- Returnable Count (optional) -->
          <td v-if="showReturnable" class="item-list-view__td item-list-view__td--center">
            <span class="item-list-view__returnable">{{ item.returnable || 0 }}</span>
          </td>

          <!-- Status Badges (optional) -->
          <td v-if="showStatus" class="item-list-view__td item-list-view__td--center">
            <div class="item-list-view__status">
              <slot name="status" :item="item"></slot>
            </div>
          </td>

          <!-- Actions (optional) -->
          <td v-if="showActions" class="item-list-view__td item-list-view__td--right">
            <div class="item-list-view__actions">
              <slot name="actions" :item="item">
                <!-- Default: Buy button -->
                <Button
                  variant="primary"
                  size="sm"
                  @click="$emit('purchase', item.id)"
                >
                  Buy
                </Button>
              </slot>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import Badge from '../../basic/Badge.vue'
import Button from '../../basic/Button.vue'

interface Item {
  id: string
  emoji?: string
  name: string
  description?: string
  basePrice: number
  owned?: number
  isEssential?: boolean
  availability?: 'always' | 'seasonal' | 'limited'
  returnable?: number
  [key: string]: any
}

interface Props {
  items: Item[]
  showOwned?: boolean
  showStatus?: boolean
  showPrice?: boolean
  showReturnable?: boolean
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showOwned: false,
  showStatus: false,
  showPrice: true,
  showReturnable: false,
  showActions: true
})

defineEmits<{
  purchase: [itemId: string]
  sellback: [itemId: string]
}>()
</script>

<style>
.item-list-view {
  inline-size: 100%;
  overflow-x: auto;
}

.item-list-view__table {
  inline-size: 100%;
  border-collapse: collapse;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.item-list-view__header {
  background: var(--color-bg-tertiary);
  border-block-end: 2px solid var(--color-border);
}

.item-list-view__th {
  padding: var(--space-3) var(--space-4);
  text-align: start;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.item-list-view__th--center {
  text-align: center;
}

.item-list-view__th--right {
  text-align: end;
}

.item-list-view__body {
  background: var(--color-bg-secondary);
}

.item-list-view__row {
  border-block-end: 1px solid var(--color-border-light);
  transition: background-color 0.2s ease;
}

.item-list-view__row:hover {
  background: var(--color-bg-tertiary);
}

.item-list-view__row:last-child {
  border-block-end: none;
}

.item-list-view__td {
  padding: var(--space-4);
  vertical-align: middle;
}

.item-list-view__td--center {
  text-align: center;
}

.item-list-view__td--right {
  text-align: end;
}

.item-list-view__item-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.item-list-view__emoji {
  font-size: var(--font-size-2xl);
  line-height: 1;
  flex-shrink: 0;
}

.item-list-view__item-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-inline-size: 0;
}

.item-list-view__item-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.item-list-view__item-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.item-list-view__price {
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  font-size: var(--font-size-base);
}

.item-list-view__owned {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.item-list-view__returnable {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.item-list-view__status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.item-list-view__actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  align-items: center;
}

/* Responsive: Stack on small screens */
@media (max-width: 768px) {
  .item-list-view__table,
  .item-list-view__header,
  .item-list-view__body,
  .item-list-view__row,
  .item-list-view__th,
  .item-list-view__td {
    display: block;
  }

  .item-list-view__header {
    display: none;
  }

  .item-list-view__row {
    margin-block-end: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .item-list-view__td {
    display: flex;
    justify-content: space-between;
    padding: var(--space-3);
    border-block-end: 1px solid var(--color-border-light);
  }

  .item-list-view__td:last-child {
    border-block-end: none;
  }

  .item-list-view__td::before {
    content: attr(data-label);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    margin-inline-end: var(--space-3);
  }

  .item-list-view__td--center,
  .item-list-view__td--right {
    text-align: start;
  }

  .item-list-view__actions {
    justify-content: flex-start;
  }
}
</style>
