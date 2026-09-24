<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Projeto: Luísa Amélia Interiores

- Portfólio de Design de Interiores (Next.js App Router, TypeScript, Tailwind CSS v4).
- O site legado em HTML/CSS está preservado na tag `legacy-v1` e não faz parte da árvore atual.
- Os tokens visuais em `src/styles/globals.css` são provisórios até a identidade do checkpoint C2.
- Checagens locais: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`, `npm run build`, `npm run test:e2e`.
- Os testes e2e rodam contra o build de produção (`next start`); rode `npm run build` antes.
