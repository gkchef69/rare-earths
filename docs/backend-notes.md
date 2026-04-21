# Backend evolution notes

## Frontend swap strategy
Today:
- renderers consume JSON files

Later:
- set `dataMode` to `api`
- keep the same `render*` functions
- replace `fetchJSON('./data/...')` with `fetch('/api/v1/...')`

## Suggested tables

### elements
- id
- symbol
- atomic_number
- category
- image_path

### element_translations
- element_id
- lang
- name
- tagline
- summary
- fact

### element_uses
- id
- element_id
- lang
- sort_order
- text

### applications
- id
- sector
- image_path

### application_translations
- application_id
- lang
- name
- summary
- what_it_does
- how_it_works

### application_elements
- application_id
- element_id

### articles
- id
- category
- cover_path
- reading_time

### article_translations
- article_id
- lang
- title
- excerpt
- intro

### article_sections
- id
- article_id
- lang
- heading
- body
- sort_order

### media_assets
- id
- category
- type
- file_path
- remote_url
- alt_el
- alt_en
- credit

### media_translations
- media_id
- lang
- title
- caption

### sources
- id
- title
- publisher
- url

### source_tags
- id
- source_id
- tag

### article_sources
- article_id
- source_id

## Good next steps
1. Create `/api/v1/elements`, `/applications`, `/articles`, `/sources`
2. Add admin upload handling for images and gallery items
3. Split translations into database-backed tables
4. Add slug fields for SEO-friendly article URLs
