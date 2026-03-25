# Onboarding and CSV bootstrap flow

SKOSS onboarding now supports two complementary setup paths:

1. **guided quick setup** for workspace basics + a few optional starter records
2. **CSV bootstrap import** for existing business lists that are already in spreadsheets or exports

This keeps first use practical for real small businesses that already have partial data.

## 1. Guided onboarding (still lightweight)

First-run onboarding remains short and skippable:

- business name
- language
- operating mode
- preset
- theme

After those preferences, onboarding also includes optional quick forms for:

- initial users
- initial customers
- initial suppliers
- initial raw materials

All quick forms are optional. Submitting empty forms does nothing, so teams can skip any step and keep moving.

## 2. CSV bootstrap import

CSV import is available from first-run onboarding and Setup.

Entry points now exist in practical admin surfaces so teams do not need to hunt for imports:

- first-run home onboarding
- Setup -> Imports section
- Customers workspace quick action (links to Setup imports)
- Setup supplier and raw-material sections (direct "Import CSV" buttons)

Supported entities in this phase:

- customers
- suppliers
- raw materials

Not included yet:

- recipes
- XLSX / Excel-native parsing
- advanced transformations

## 3. Import flow

Each import follows the same lightweight sequence:

1. upload CSV file
2. map columns to SKOSS fields
3. preview first rows
4. confirm import

### Mapping model

Mapping is intentionally simple:

- one CSV column -> one SKOSS field
- no formulas
- no scripted transforms
- no merge rules

To reduce first-run friction, SKOSS tries lightweight header auto-matching before manual mapping (for example `name` -> customer display name).

## 4. Tolerant handling

The importer is designed for imperfect data:

- missing optional columns are allowed
- partial rows are allowed
- rows missing required identity fields (name/display name) are skipped
- the import continues even if some rows are skipped

After import, SKOSS shows a simple summary:

- imported count
- skipped count

## 5. Practical CSV preparation tips

Use UTF-8 CSV with a header row.

Example headers:

- customers: `name,phone,email,address`
- suppliers: `name,contact,notes`
- raw materials: `name,category,defaultUnit,brand`

Header names do not need to be exact because users can map columns manually.

Practical tip: if headers are close to field names (`name`, `phone`, `email`, `defaultUnit`), auto-mapping usually pre-fills most fields.

## 6. Why this helps adoption

Small businesses often begin with mixed-quality data from phone notes, old POS exports, and spreadsheets.

This onboarding + CSV approach lowers setup friction by allowing teams to:

- start operating quickly
- import what already exists
- clean up structure progressively inside normal work

This keeps SKOSS aligned with draft-first, operator-first adoption.
