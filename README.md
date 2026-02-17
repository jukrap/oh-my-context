# Oh My Context!

> 한국어 사용자분들은 [`README.ko.md`](./README.ko.md) 문서를 확인해 주세요.

Context Stack Editor for XML Prompts.

Oh My Context! is a context-first editor for XML prompts. Build prompt trees, attach global include blocks, and export safely to XML/Markdown/JSON.

## Why XML Prompts

This tool is built for preparing prompts for AI systems with explicit structure.

- XML-style sections can make boundaries clearer in complex prompts (rules, context, examples, output schema).
- Clear structure often improves consistency and reduces accidental mixing of instructions.
- XML is not always better than Markdown or plain text. For simple tasks, lighter formats may work equally well.
- Treat format choice as a task-level decision and compare outputs for your model/workflow.

## Features

- Vault: create, duplicate, delete, search, filter, and switch prompt documents
- Context Stack: add/remove/duplicate/toggle/reorder nodes with drag-and-drop
- Node Editor: edit tag names, attributes, content mode, and content
- Global Includes: reusable blocks injected during export
- Preview / Export: XML, Markdown, JSON with copy/download
- Autosave: IndexedDB persistence and workspace restore
- i18n: English/Korean with automatic Korean locale detection

## Tech Stack

- React + TypeScript + Vite
- React Compiler (`babel-plugin-react-compiler`)
- React Router
- Zustand
- TanStack Query
- dnd-kit
- localforage (IndexedDB)

## Getting Started

```bash
pnpm install
pnpm dev
```

Local URL: `http://localhost:5173`

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Project Structure

```text
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

The project follows Feature-Sliced Design (FSD).

## Terms

- `Global Include`: feature concept for export-time auto insertion
- `Global Include Block`: concrete include data unit being edited/stored

## Deployment (Vercel)

SPA rewrite rules are already configured in `vercel.json`.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Deployment steps:

1. Push this repo to GitHub.
2. In Vercel, click `Add New Project` and select this repository.
3. Confirm Framework Preset as `Vite`.
4. Build Command: `pnpm build`
5. Output Directory: `dist`
6. Deploy

If your production branch is `master`, set Vercel Production Branch to `master`.

## Notes

- Favicon path: `public/icon.ico`
- `package-lock.json` is intentionally ignored (`pnpm` workflow)

## License

MIT License. See [`LICENSE`](./LICENSE).
