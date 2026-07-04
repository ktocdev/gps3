---
source: src/composables/3d-models/index.ts
source_hash: bf349aa59787e82bdacf9cfdde14a3003d8dc7609e6225972d7f6ecb7a9b68e5
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# 3D Models Index / Factory

`src/composables/3d-models/index.ts`

> This barrel/factory module centralizes creation of Three.js 3D models for habitat items in the gps3 application. It exposes a single `createItemModel` factory that maps an item ID string to the correct model-creator function, and re-exports all individual model creators and shared utilities for direct use.

## Factory logic
`createItemModel(itemId)` inspects the `itemId` string via substring matching and routes to the appropriate creator, returning a `THREE.Group`. Order of checks matters:

- Containers: `bowl` → `createBowlModel(itemId)`; `bottle` → `createWaterBottleModel()`; `hay`+`rack` → `createHayRackModel(itemId)`.
- Shelters: `shelter`/`igloo`/`hideout` → `createShelterModel()`; `tunnel`+`archway` → `createWoodenTunnelModel()`.
- Bedding: `bed`/`mat` → `createBedModel()`.
- Toys: `ball` → `createToyModel('ball', itemId)`; `stick`/`chew` → `createToyModel('stick', itemId)`.
- Default fallback: `createToyModel('other', itemId)`.

## Re-exports
The file re-exports all container, shelter, bedding, and toy model creators, additional food creators (`createHayPile`, `createCucumberSlice`, `createCarrotStick`, `createPelletPile`, `createLettucePile`), `getWaterBottleRotation`, and shared utilities (`createWoodTexture`, `displaceVertices`, `gridToWorld`, `seededRandom`).

## Exports

- **createItemModel** (function) — `createItemModel(itemId: string): THREE.Group`: Factory that returns a Three.js Group model based on substring matching of the item ID, falling back to a generic toy model.
- **createBowlModel** (function) — `createBowlModel(itemId: string)`: Re-exported from ./containers/bowls.
- **createWaterBottleModel** (function) — `createWaterBottleModel()`: Re-exported from ./containers/water-bottles.
- **getWaterBottleRotation** (function) — `getWaterBottleRotation(...)`: Re-exported from ./containers/water-bottles.
- **createHayRackModel** (function) — `createHayRackModel(itemId: string)`: Re-exported from ./containers/hay-racks.
- **createShelterModel** (function) — `createShelterModel()`: Re-exported from ./shelters/igloos.
- **createWoodenTunnelModel** (function) — `createWoodenTunnelModel()`: Re-exported from ./shelters/tunnels.
- **createBedModel** (function) — `createBedModel()`: Re-exported from ./bedding/beds.
- **createToyModel** (function) — `createToyModel(type: string, itemId: string)`: Re-exported from ./toys/chew-toys.
- **createHayPile** (function) — `createHayPile(...)`: Re-exported from ./food/hay.
- **createCucumberSlice** (function) — `createCucumberSlice(...)`: Re-exported from ./food/vegetables.
- **createCarrotStick** (function) — `createCarrotStick(...)`: Re-exported from ./food/vegetables.
- **createPelletPile** (function) — `createPelletPile(...)`: Re-exported from ./food/pellets.
- **createLettucePile** (function) — `createLettucePile(...)`: Re-exported from ./food/greens.
- **createWoodTexture** (function) — `createWoodTexture(...)`: Re-exported shared utility from ./shared/textures.
- **displaceVertices** (function) — `displaceVertices(...)`: Re-exported shared utility from ./shared/geometry.
- **gridToWorld** (function) — `gridToWorld(...)`: Re-exported shared utility from ./shared/utils.
- **seededRandom** (function) — `seededRandom(...)`: Re-exported shared utility from ./shared/utils.

## Internal dependencies

- `./containers/bowls`
- `./containers/water-bottles`
- `./containers/hay-racks`
- `./shelters/igloos`
- `./shelters/tunnels`
- `./bedding/beds`
- `./toys/chew-toys`
- `./food/hay`
- `./food/vegetables`
- `./food/pellets`
- `./food/greens`
- `./shared/textures`
- `./shared/geometry`
- `./shared/utils`
- `three`

## Notes

- Routing relies on substring matching, so check order is significant — e.g. an item containing both 'hay' and 'bottle' would match the bottle branch first.
- A hay rack requires both 'hay' and 'rack' in the ID; a wooden tunnel requires both 'tunnel' and 'archway'. IDs missing the second keyword fall through to later checks or the fallback toy model.
- Any unmatched itemId always returns a generic toy model via createToyModel('other', itemId) rather than throwing.
