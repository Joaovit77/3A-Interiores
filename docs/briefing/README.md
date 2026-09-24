# Briefing interativo — protótipo B2

Protótipo de UX do briefing aprovado no checkpoint B1. Roda só no navegador:
sem backend, sem banco, sem autenticação, sem envio de e-mail e sem upload real.

- `/briefing` — abertura e consentimento.
- `/briefing/responder?passo=<tela>` — o fluxo, uma tela por passo.

## Onde está cada coisa

```
src/features/briefing/
  definition/   conteúdo do B1 (tipado)
    sources.ts    itens O01–O90 do briefing original (+ O36b, repetição exata)
    options.ts    listas de opções PROVISÓRIAS
    stages.ts     etapas globais (1–5, 7–10)
    modules.ts    módulos profissionais: Sala, Cozinha, Banheiro
    rooms.ts      tipos de ambiente; os sem módulo pertencem ao B1.1
    rules.ts      regras condicionais nomeadas
  engine/       lógica pura, testada sem interface
    flow.ts       telas visíveis, valores efetivos, herdados e pré-marcados
    validation.ts campos obrigatórios e formatos
    summary.ts    resumo final
    progress.ts   progresso por etapa
    state.ts      estado e reducer (só em memória)
  state/        provider React
  components/   interface (visual provisório até o C2)
```

## Como o fluxo é calculado

`buildFlow(answers)` percorre a definição em ordem e decide o que aparece.
Cada regra só enxerga valores de telas e campos visíveis anteriores.

- **Respostas escondidas** (comportamento de UX do protótipo): quando a condição
  de uma pergunta deixa de valer, a resposta continua guardada em memória, mas
  não aparece no resumo e não influencia nenhuma regra. Se a condição voltar,
  ela reaparece. A persistência desses dados no produto real será decidida no B3.
- **Valores pré-marcados**: os usos da sala vêm marcados a partir da Etapa 4
  (trabalho em casa na sala; refeições no sofá). Uma escolha explícita vence.
- **Banheiros**: do segundo em diante, «Quer manter a mesma direção visual do
  banheiro anterior?». Com «Sim», cores, armazenamento, espelho, iluminação e
  metais são herdados do anterior. Quem usa, uso para se arrumar e
  acessibilidade continuam sendo perguntados em cada banheiro.
- **Piso antiderrapante**: aparece com mobilidade ou acessibilidade indicada,
  idosos (60+) ou crianças pequenas (até 5 anos). O critério por característica
  do ambiente está desligado até a Luísa definir uma regra.
- **Ambientes do B1.1** (quarto, escritório, sala de jantar, área de serviço,
  varanda, lavabo, outro): selecionáveis, sem perguntas, anotados no resumo.

## Rastreabilidade

Cada tela declara em `sources` os itens do briefing original que atende. Telas
novas têm `isNew: true`. O teste `tests/unit/briefing/traceability.test.ts`
garante que todos os itens têm destino, exceto O04 (sexo), retirado com
aprovação.

## Adicionar um módulo do B1.1

Crie um `ModuleDef` em `definition/modules.ts`, registre-o em `MODULES` e marque
o tipo em `rooms.ts` com `hasModule: true`. O motor não precisa mudar.

## DevPanel

Só em `npm run dev`. Mostra respostas efetivas, telas visíveis e escondidas,
regras ativas, valores herdados e pré-marcados, módulos selecionados e o estado
de reaproveitamento entre banheiros. Não existe no build de produção.

## Imagens

Os quatro renders da pergunta de estilos são trabalhos reais da Luísa (site
legado). As demais imagens são placeholders marcados como «Imagem provisória».
A curadoria final fica para o C2/B4.
