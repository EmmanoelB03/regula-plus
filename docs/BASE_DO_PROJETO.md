# Base inicial do projeto — Gestão da Oferta Ambulatorial

**Data:** 11/11/2026  
**Versão:** 0.2 — levantamento com definições do grupo  
**Finalidade:** reunir o entendimento do projeto e orientar a produção posterior dos documentos de requisitos, análise e arquitetura, além do protótipo da disciplina.

Este documento reúne evidências dos materiais fornecidos, interpretações e propostas de escopo. Não representa uma especificação aprovada pela GRAMB ou pelo professor. As dúvidas devem permanecer explícitas até serem esclarecidas.

### Definições do grupo em 11/11/2026

As decisões abaixo foram informadas pelo usuário e orientam as próximas etapas:

- O produto será um **protótipo navegável com banco de dados**. A tecnologia e a estrutura da persistência ainda serão definidas.
- Os dados serão **fictícios**, identificados como demonstrativos.
- Uma **API REST pode ser utilizada para disponibilizar os dados**. É uma opção aceita; os endpoints e a responsabilidade pela geração e persistência ainda serão projetados.
- As fórmulas completas não serão fornecidas neste momento. Será necessário propor cálculos para os indicadores, documentando significado, entradas, unidades, hipóteses e casos excepcionais. Fórmulas ausentes, como score e diagnóstico, serão regras demonstrativas do projeto, sem atribuição de validade oficial à GRAMB.
- A definição de usuários e permissões fica para uma etapa posterior.
- O recorte entre painel, envio de agendas e demais operações continua pendente.

## 1. Contexto e objetivo

O projeto está relacionado à **Gerência de Regulação Ambulatorial (GRAMB) da Secretaria de Saúde de Pernambuco (SES-PE)**, conforme o arquivo `contexto.md`.

A regulação ambulatorial envolve a oferta de consultas e exames, a distribuição de vagas e cotas, a autorização de solicitações, as filas de espera, os agendamentos e o acompanhamento dos atendimentos. Os materiais descrevem dificuldades que podem comprometer o aproveitamento da oferta e o atendimento da demanda.

**Objetivo preliminar da solução:** apoiar a gestão da oferta ambulatorial por meio da organização e apresentação de informações sobre demanda, oferta, ocupação, perdas e filas, permitindo identificar desequilíbrios e subsidiar decisões da regulação.

O painel é o resultado gerencial mais claramente descrito nos documentos. O envio de agendas aparece nas aulas como exemplo de funcionalidade e modelagem. Sua inclusão no protótipo precisa ser confirmada; não se deve concluir que todo o fluxo de regulação será implementado.

## 2. Fontes e limites de interpretação

| ID | Material local | Contribuição |
|---|---|---|
| F01 | [contexto.md](contexto.md) | Identifica a GRAMB/SES-PE como contexto do projeto e informa que o painel do PPTX é usado em outra Secretaria Estadual. |
| F02 | [Levantamento de desafios](<0310 LEVANTAMENTO DE DASAFIOS - GRAMB (7).pdf>) | Apresenta o fluxo de regulação e suas fragilidades. |
| F03 | [Indicadores do painel](<Cópia de PAINEL DE GESTÃO DE OFERTA AMBULATORIAL - Painel de Gestão da Oferta.pdf>) | Define indicadores de interesse e objetivos de acompanhamento. |
| F04 | [Referência visual do painel](<Painel de Gestao de Oferta - DOC-20260925-WA0018.pptx>) | Contém um slide com imagem de painel tabular, dados de abril de 2026, score, faixas de risco e diagnósticos; traz a observação “em ajustes”. |
| F05 | [Quadro: contexto e entregas](<WhatsApp Image 2026-11-11 at 7.58.06 PM.jpeg>) | Relaciona atores e conceitos do domínio e lista as entregas da disciplina. |
| F06 | [Quadro: requisitos e regras](<WhatsApp Image 2026-11-11 at 7.58.06 PM(1).jpeg>) | Exemplifica o caso de uso “Enviar Agenda”, regras de negócio e atores. |
| F07 | [Quadro: análise e projeto](<WhatsApp Image 2026-11-11 at 7.58.07 PM.jpeg>) | Exemplifica classes, sequência de interações e a abordagem BCE. |

Convenções usadas neste documento:

- **Evidência:** informação expressa nos materiais. Isso não significa, por si só, uma obrigação de implementação.
- **Interpretação:** entendimento obtido pela combinação dos materiais.
- **Proposta:** decisão sugerida para o projeto, ainda sujeita à definição do grupo e às orientações da disciplina.
- **Pendente:** informação necessária que os materiais não resolvem completamente.

O painel de outra Secretaria é uma referência. Seus dados, limiares e classificações não devem ser tratados automaticamente como regras oficiais da SES-PE.

## 3. Problemas observados no processo

O levantamento F02 registra, entre outras fragilidades:

- Encaminhamentos com informações insuficientes e solicitações inseridas em especialidades incorretas.
- Dificuldades de observância dos protocolos e de correção das solicitações retornadas.
- Agendamentos que não ocorrem em tempo oportuno, deixando vagas sem aproveitamento.
- Dificuldades de acompanhamento das vagas disponíveis e de remanejamento de cotas.
- Alterações nas agendas, inclusive quando já existem pacientes marcados.
- Cadastros desatualizados, problemas de comunicação e cancelamentos tardios.
- Faltas relacionadas, entre outros fatores, ao contato com pacientes e à acessibilidade.
- Registros incorretos de atendimento, que podem contabilizar como faltas pacientes atendidos.

O painel pode tornar esses problemas mais visíveis por meio dos indicadores. Não há evidência de que o protótipo deva resolver diretamente todos eles.

## 4. Participantes e conceitos do domínio

| Participante | Papel observado no processo |
|---|---|
| GRAMB / gestão central da regulação | Acompanhar a oferta e participar de sua organização e distribuição. |
| Geres | Participar da distribuição regional das cotas e do acompanhamento regional da demanda. |
| Secretarias Municipais de Saúde / unidades solicitantes | Inserir e ajustar solicitações e realizar agendamentos conforme o fluxo descrito. |
| Médicos reguladores | Avaliar solicitações e autorizá-las, retorná-las ou rejeitá-las. |
| Unidades executantes | Disponibilizar agendas, realizar atendimentos e registrar seus resultados. |
| Pacientes | Receber o atendimento; são beneficiários do processo, sem acesso direto ao protótipo definido até aqui. |

Esses participantes não equivalem automaticamente a perfis de acesso. A definição dos usuários efetivos do sistema permanece pendente.

Conceitos principais:

- **Item de agendamento:** procedimento, especialidade ou exame utilizado para organizar oferta e demanda.
- **Agenda:** disponibilidade de atendimento informada pela unidade executante.
- **Oferta:** quantidade de vagas disponibilizadas.
- **Cota:** parcela da oferta distribuída entre os participantes do processo.
- **Solicitação:** pedido de consulta ou exame submetido à regulação.
- **Fila de espera:** conjunto de solicitações aguardando agendamento para um item.
- **Ocupação:** vagas efetivamente agendadas; não equivale necessariamente a atendimentos realizados.
- **Perda primária:** vagas disponibilizadas que não foram agendadas.
- **Perda secundária:** faltas após o agendamento.

## 5. Fluxo de negócio resumido

1. As unidades executantes enviam suas agendas e informam alterações.
2. A regulação recebe, confere e insere as agendas no CMCE.
3. A oferta é distribuída em cotas no nível central e regional.
4. Solicitações originadas no atendimento da atenção primária são inseridas no sistema de regulação quando não há oferta municipal.
5. Os médicos reguladores avaliam as solicitações: autorização, retorno para ajuste ou rejeição.
6. Solicitações autorizadas compõem a fila do item de agendamento.
7. Os municípios agendam conforme disponibilidade, cota, prioridade e tempo de espera.
8. O paciente é informado e comparece ou falta; a unidade executante registra o resultado.
9. A gestão acompanha demanda, oferta, ocupação e perdas para apoiar ajustes.

Os passos relativos a agendas/oferta e solicitações/demanda são frentes relacionadas do processo, não uma sequência obrigatoriamente linear. O CMCE aparece como sistema existente; não foi definida integração técnica nem sua substituição.

## 6. Entregas da disciplina

As fotos F05 e F07 registram:

| Entrega | Evidência e interpretação |
|---|---|
| Documento de requisitos com análise | Explicitamente listado. F06 exemplifica descrição de caso de uso, atores, pré-condição, fluxo principal, pós-condição e regras de negócio. |
| Arquitetura | Explicitamente listada. F07 mostra exemplos de classes e diagramas de sequência; o conjunto obrigatório de diagramas ainda não está definido nos materiais. |
| Protótipo | Explicitamente listado, com anotação de “3,0 pontos” e apresentação em “7/12”. O ano e o nível de implementação exigido devem ser confirmados. |

A abordagem **BCE — Boundary, Control, Entity** e a referência a RUP aparecem no quadro. Isso indica conteúdo ensinado, mas não comprova, isoladamente, que uma arquitetura específica ou todo o processo RUP sejam obrigatórios.

## 7. Proposta inicial de recorte do protótipo

**Proposta para discussão:** começar por uma visão gerencial de oferta por especialidade/procedimento, usando uma base demonstrativa, e considerar o envio de agendas como funcionalidade adicional caso seja exigido pela disciplina.

O núcleo proposto compreende:

- Consultar uma tabela de indicadores por item de agendamento e período.
- Examinar demanda, oferta, ocupação, perdas e fila com definições visíveis.
- Explorar a distribuição por Geres e unidade executante quando os dados permitirem.
- Destacar desequilíbrios por critérios documentados e posteriormente validados.

A utilização de dados fictícios e de banco de dados foi definida pelo grupo. O protótipo deverá permitir navegação pelas funcionalidades selecionadas. Uma API REST é uma opção aceita para disponibilizar os dados. Não estão assumidos: integração em tempo real com CMCE, gestão completa de pacientes, autorização médica, agendamento operacional ou remanejamento automático de cotas.

## 8. Requisitos funcionais candidatos

Os identificadores abaixo permitem rastrear o levantamento e devem ser revisados ao definir o escopo formal.

| ID | Requisito candidato | Origem | Situação |
|---|---|---|---|
| RF-P01 | Apresentar os indicadores por especialidade/exame ou item de agendamento. | F03, F04 | Necessidade evidenciada. |
| RF-P02 | Exibir a fila total e sua distribuição por Geres. | F03 | Necessidade evidenciada. |
| RF-P03 | Exibir a oferta por unidade executante e por Geres. | F03 | Necessidade evidenciada. |
| RF-P04 | Apresentar ocupação, perda primária e perda secundária. | F03 | Necessidade evidenciada; cálculo a detalhar. |
| RF-P05 | Apresentar cobertura da oferta e pressão da fila. | F03, F04 | Necessidade evidenciada; definições a harmonizar. |
| RF-P06 | Apresentar médias mensais de entradas e saídas. | F03 | Necessidade evidenciada; período e contagem a definir. |
| RF-P07 | Apresentar diagnóstico assistencial com critérios documentados. | F03, F04 | Necessidade evidenciada; critérios pendentes. |
| RF-P08 | Permitir selecionar o período de análise. | F03, F04 | Proposta derivada do acompanhamento temporal. |
| RF-P09 | Filtrar informações por Geres, unidade executante e item. | F03 | Proposta de interação. |
| RF-P10 | Receber arquivo de agenda associado à unidade executante e ao mês. | F06 | Exemplo didático; inclusão pendente. |
| RF-P11 | Validar existência e formato do arquivo de agenda antes de armazená-lo. | F06, F07 | Exemplo didático; inclusão pendente. |

O quadro também menciona cadastrar agendas, calcular cotas e recuperar agenda. Essas funcionalidades exigem detalhamento antes de serem adotadas como requisitos do protótipo.

## 9. Indicadores e cuidados de definição

| Indicador | Base disponível | Definição ainda necessária |
|---|---|---|
| Lista total e lista por Geres | Quantidade de solicitações na fila e distribuição regional, conforme F03. | Data de referência, estados incluídos e unidade de contagem. |
| Oferta | Vagas por unidade executante e por Geres. | Período e tratamento de alterações/cancelamentos de agenda. |
| Ocupação | No exemplo F04: ocupação ÷ oferta. | Confirmar a mesma definição e o tratamento de oferta zero. |
| Perda primária | Vagas não agendadas, conforme F03. | Denominador, janela temporal e tratamento de cancelamentos. |
| Perda secundária | Usuários que faltaram, conforme F03. | Denominador e tratamento de registros incompletos. |
| Cobertura | F03 relaciona oferta e demanda na fila; F04 usa oferta ÷ demanda mensal. | Resolver a diferença antes de implementar o indicador. |
| Pressão da fila | F04 usa fila ÷ demanda mensal; F03 traz uma descrição mais geral. | Confirmar fórmula e interpretação adotadas pela GRAMB. |
| Entradas mensais | F03 menciona solicitações “Autorizadas”. | Evento/data de entrada e deduplicação. |
| Saídas mensais | F03 menciona “Marcadas”, “Realizadas”, “Faltou” e “Chegada Confirmada”. | Evitar contar repetidamente uma solicitação que passou por vários estados. |
| Score e diagnóstico | F04 apresenta resultados, faixas e rótulos. | Fórmula do score e critérios completos de diagnóstico não estão explicitados. |
| Prazo para zerar a fila | F04 apresenta estimativas e casos de oferta insuficiente. | Hipóteses, fórmula e tratamento de casos sem redução da fila. |

Na referência F04, as faixas são: verde para score ≤ 1,5; amarelo para 1,5 < score ≤ 3; laranja para 3 < score ≤ 5; vermelho para score > 5. Também aparecem ocupação mínima de 70% e cobertura máxima de 1,30 para equilíbrio. **São parâmetros do exemplo de outra Secretaria, sujeitos a validação para este projeto.**

Não se deve deduzir a fórmula completa do score apenas tentando reproduzir os números da imagem. Os dados de abril de 2026 também não devem ser apresentados como dados da SES-PE.

### Estratégia para definir os cálculos

Como as fórmulas completas não estão disponíveis, o projeto deverá elaborar um catálogo de cálculos antes de implementar os indicadores. Para cada cálculo, registrar: objetivo, dados de entrada, período, unidade, fórmula, tratamento de denominador zero e valores ausentes, exemplo numérico e origem da regra.

Fórmulas expressas nos materiais poderão servir como referência, com suas diferenças resolvidas explicitamente. Para score, diagnósticos e demais regras ausentes, serão propostas fórmulas demonstrativas coerentes com o objetivo do indicador. A interface e a documentação deverão permitir reconhecer essas regras como hipóteses do protótipo. Os dados fictícios devem conter cenários de equilíbrio, oferta insuficiente, ociosidade e ausência de dados para demonstrar os resultados.

## 10. Caso de uso de referência: Enviar Agenda

O conteúdo abaixo sintetiza o exemplo didático de F06/F07, sem confirmar sua inclusão no escopo final.

**Ator:** unidade executante.  
**Objetivo:** enviar um arquivo de agenda para armazenamento no sistema.  
**Pré-condição:** prazo de envio aberto.  
**Pós-condição de sucesso:** arquivo armazenado e associado à unidade executante e ao mês vigente, conforme o exemplo do quadro.

Fluxo principal observado:

1. A unidade executante escolhe um arquivo.
2. Aciona o comando de envio.
3. O sistema verifica a existência do arquivo.
4. Verifica se o formato é válido.
5. Armazena o arquivo e sua associação à unidade e ao mês.
6. Encerra o caso de uso.

Regras exemplificadas no quadro: aceitar PDF e DOCX e usar o dia 18 do mês vigente como referência do prazo de envio. A interpretação exata do prazo e do mês de competência precisa ser confirmada. A descrição do exemplo menciona “unidade solicitante”, enquanto o campo de atores indica “unidade executante”; há uma inconsistência a resolver.

Fluxos alternativos a especificar posteriormente: arquivo inexistente ou não selecionado, formato inválido, prazo encerrado e falha no armazenamento. Esses fluxos são propostas de detalhamento; suas respostas e mensagens não estão integralmente definidas nas fotos.

## 11. Diretrizes preliminares de análise e arquitetura

Como proposta inicial, a solução pode separar interface, regras de aplicação e acesso aos dados. Essa separação facilita relacionar telas, casos de uso e conceitos do domínio, coerentemente com os exemplos de BCE do quadro.

Conceitos candidatos para o modelo de domínio: unidade executante, Geres, município, item de agendamento, período de referência, agenda, oferta, demanda e indicador. Solicitação, agendamento e atendimento devem ser detalhados somente se o recorte exigir dados individuais; um painel com dados agregados pode não precisar dessas entidades na implementação.

O uso de banco de dados está confirmado, mas seu tipo e tecnologia ainda não foram escolhidos. Uma organização inicial possível é interface navegável → API REST → lógica de aplicação e persistência. Tecnologias, infraestrutura e mecanismos de importação ainda serão definidos; usuários e permissões serão discutidos posteriormente. Receber um PDF/DOCX não implica extrair automaticamente suas vagas para alimentar o painel; essa relação precisa ser definida.

Aspectos de qualidade propostos para detalhamento futuro:

- Mostrar período, origem e significado dos dados e indicadores.
- Diferenciar valores ausentes de zero e explicar indicadores indisponíveis.
- Complementar cores com texto, para permitir compreensão das classificações.
- Manter cálculos rastreáveis às regras documentadas.
- Definir permissões conforme os usuários efetivos e as operações escolhidas.

Essas diretrizes ainda precisam ser transformadas em requisitos não funcionais mensuráveis, quando aplicáveis.

## 12. Questões pendentes prioritárias

| ID | Questão | Consequência para o projeto |
|---|---|---|
| Q01 | O protótipo deve focar o painel, a gestão de agendas ou ambos? | Define o escopo das funcionalidades. |
| Q02 | Resolvido pelo grupo: protótipo navegável com banco de dados. | Projetar navegação e persistência. |
| Q03 | Quais diagramas e modelos são exigidos pelo professor? | Define a composição das entregas de análise e arquitetura. |
| Q04 | Definido: dados fictícios; API REST é uma opção aceita. Como gerar e persistir esses dados? | Detalhar a alimentação do painel. |
| Q05 | Quais fórmulas demonstrativas serão propostas para os indicadores sem cálculo definido? | Documentar hipóteses e evitar apresentá-las como regras oficiais. |
| Q06 | Como distinguir demanda mensal, fila acumulada e saídas efetivas? | Garante consistência dos indicadores. |
| Q07 | Quais participantes terão acesso ao protótipo e a quais operações? Discussão adiada pelo grupo. | Definir atores e permissões em etapa posterior. |
| Q08 | O envio de agenda alimenta o painel? Como os dados do arquivo são transformados em oferta? | Esclarece a relação entre as funcionalidades. |
| Q09 | O prazo anotado no quadro e a apresentação em 7/12 se aplicam exatamente a esta entrega? | Confirma regras exemplificadas e cronograma. |

## 13. Como usar esta base nas próximas entregas

1. Delimitar o escopo a partir das questões prioritárias, registrando cada decisão e sua justificativa.
2. Transformar os requisitos candidatos selecionados em requisitos formais, com origem, prioridade e critérios de aceitação.
3. Elaborar os casos de uso, regras de negócio e modelos de análise correspondentes.
4. Definir a arquitetura a partir das funções e dados escolhidos.
5. Construir o protótipo e manter a correspondência entre requisitos, modelos e funcionalidades demonstradas.

Até que novas orientações sejam recebidas, esta base deve ser usada para organizar o entendimento e preparar propostas. A implementação de regras indefinidas deve aguardar sua definição ou adotar uma hipótese explicitamente identificada como demonstrativa.
