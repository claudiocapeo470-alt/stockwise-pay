# Architecture Rules

- Use `MinimalList` primitives for simple entity lists across operational pages so mobile and desktop rows stay visually consistent.
- Reuse `CartProductImage` for POS and ordered-item photos with an accessible fallback so missing or broken images remain readable.
- Resolve missing order-item photos from the tenant-scoped product query because legacy and server-normalized order items may omit image URLs.