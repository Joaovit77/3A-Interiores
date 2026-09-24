# Luísa Amélia Interiores

Portfólio profissional de Design de Interiores de Luísa Amélia de Andrade.

## Stack

- [Next.js](https://nextjs.org) (App Router) com TypeScript
- Tailwind CSS v4
- Vitest + Testing Library (testes unitários e de componentes)
- Playwright + axe (testes de ponta a ponta e acessibilidade)

## Desenvolvimento

Requer Node.js 20.9 ou superior (a CI usa a versão em `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
```

## Checagens

```bash
npm run lint
npm run typecheck
npm run format:check
npm test             # Vitest
npm run build
npm run test:e2e     # Playwright contra o build de produção
```

## Briefing (protótipo)

`/briefing` é o protótipo de UX do briefing interativo (checkpoint B2), sem
backend. Ver [`docs/briefing/README.md`](docs/briefing/README.md).

## Site legado

A versão anterior do site (HTML/CSS, "3A Interiores") está preservada na tag
`legacy-v1`:

```bash
git checkout legacy-v1
```

## Estado

Em construção. A identidade visual atual é provisória e será definida no
checkpoint C2.
