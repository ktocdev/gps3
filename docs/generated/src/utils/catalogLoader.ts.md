---
source: src/utils/catalogLoader.ts
source_hash: 68d7883b136116d2af6f3b6958f1dbca5e1680b8f089c0022a54de9ba052155d
doc_class: generated-reference
generated_by: anthropic/claude-opus-4-8
---

# Catalog Loader Utility

`src/utils/catalogLoader.ts`

> This utility loads all supplies catalog items from bundled JSON data files, validates each item against required schema rules, deduplicates by ID, and aggregates them into a single typed array. It exists to centralize catalog data assembly and provide runtime validation/logging when constructing the in-game supplies catalog.

## Data Sources
The file statically imports 13 JSON files covering bedding, hay, food subcategories (greens, herbs, vegetables, fruits, pellets, treats), and habitat subcategories (hideaways, toys, chews, bowls_bottles, enrichment).

## loadCatalog
`loadCatalog()` builds a `dataSources` array pairing each source name with its imported data. For each source it checks the data is an array (logging an error and skipping otherwise), then iterates items. Each item passes through `validateItem`; failures are skipped. Duplicate IDs (tracked via a `Set`) are also skipped with an error log. Valid, unique items are cast to `SuppliesItem` and pushed to the catalog. It logs a summary count and a category breakdown (bedding, hay, food, habitat_item), then returns the catalog array.

## validateItem
A type-guard (`item is SuppliesItem`) that checks presence of required fields (`id`, `name`, `description`, `category`, `basePrice`, `currency`, `availability`). It applies category-specific rules: bedding must have `stats.absorbency`, and both `food` and `habitat_item` categories must have a `subCategory`. Failures log an error and return false.

## getCatalogStats
Given a catalog array, computes aggregate statistics: total count, and counts grouped by `category`, `subCategory`, `availability`, and `tier` (subCategory and tier only counted when present).

## Exports

- **loadCatalog** (function) — `loadCatalog(): SuppliesItem[]`: Loads all items from the 13 imported JSON sources, validating structure, enforcing category-specific rules, and deduplicating by ID. Logs a summary and per-category breakdown, returning the assembled array.
- **getCatalogStats** (function) — `getCatalogStats(catalog: SuppliesItem[]): { total: number; byCategory: Record<string,number>; bySubCategory: Record<string,number>; byAvailability: Record<string,number>; byTier: Record<string,number> }`: Computes aggregate statistics over a catalog array, counting items by category, subCategory, availability, and tier.

## Internal dependencies

- `../types/supplies`
- `../data/supplies/bedding.json`
- `../data/supplies/hay.json`
- `../data/supplies/food/greens.json`
- `../data/supplies/food/herbs.json`
- `../data/supplies/food/vegetables.json`
- `../data/supplies/food/fruits.json`
- `../data/supplies/food/pellets.json`
- `../data/supplies/food/treats.json`
- `../data/supplies/habitat/hideaways.json`
- `../data/supplies/habitat/toys.json`
- `../data/supplies/habitat/chews.json`
- `../data/supplies/habitat/bowls_bottles.json`
- `../data/supplies/habitat/enrichment.json`

## Notes

- Invalid items are silently skipped (only console.error is emitted); loadCatalog never throws, so a malformed source reduces catalog size without failing.
- JSON imports are static, requiring build-tool JSON module support; adding a new data file requires editing both the import list and the dataSources array.
- `validateItem` is a TypeScript type guard, so items passing it are cast to SuppliesItem without deeper field type validation.
