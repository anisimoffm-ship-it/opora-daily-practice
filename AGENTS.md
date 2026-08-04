<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Product library

Before changing product behavior, interface, copy, practices, reminders, visual design, motion, or user data handling:

1. Read `docs/product-library/README.md`.
2. Read the library sections it routes to for the task.
3. Treat the library's `Canonical` decisions as product requirements, not suggestions.
4. If the request conflicts with a canonical principle, identify the conflict before implementing it. A direct user decision can change a principle, but the library and `docs/product-library/decision-log.md` must be updated in the same task.
5. Do not restore routes or concepts marked `Historical` or `Retired` unless the user explicitly decides to bring them back.

When a task creates a lasting product decision, update the relevant library page and add a short entry to `docs/product-library/decision-log.md`. Runtime code remains the source of truth for exact current strings and behavior; the library is the source of truth for why the product works this way and how new work should fit it.
