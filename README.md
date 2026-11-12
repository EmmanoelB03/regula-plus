# Pulso

Protótipo navegável de gestão da oferta ambulatorial, desenvolvido como base para o trabalho da disciplina. **Pulso é um nome provisório.** Todos os dados são fictícios; não há integração com a SES-PE ou com o CMCE.

## Primeira versão

- Interface em React, com Vite.
- API REST em Python e persistência SQLite.
- Base demonstrativa com 8 especialidades, 3 Geres, 4 unidades fictícias e 6 meses (junho a novembro de 2026).
- Filtros de período, Geres, unidade executante e especialidade.
- Oferta, agendamentos, demanda mensal, fila e percentuais de ocupação e perdas.
- Busca, ordenação e exportação CSV da tabela visível.
- Detalhes por especialidade com histórico mensal e página de metodologia.
- Estados de carregamento, erro, recorte vazio e denominador zero.

## Executar em desenvolvimento

Requisitos: Python 3.10+ e Node.js 22 com npm. O backend usa apenas a biblioteca padrão do Python.

Na raiz do repositório:

```bash
npm install
npm run api
```

Em outro terminal:

```bash
npm run dev
```

Abra o endereço apresentado pelo Vite, normalmente **http://127.0.0.1:5173**. O Vite encaminha `/api` para o backend na porta 8000.

O banco `data/pulso.sqlite3` é criado e preenchido na primeira execução da API. Inicializações seguintes preservam seus dados. Arquivos do banco e dependências não são versionados.

## Executar a versão compilada

```bash
npm run build
npm run api
```

Abra **http://127.0.0.1:8000**. O servidor Python entrega a compilação React em `dist/` e a API no mesmo endereço. A navegação usa fragmentos de URL, permitindo abrir e recarregar links de detalhes sem configuração adicional.

O servidor é destinado à demonstração local. Autenticação, implantação e perfis de usuário ainda não foram definidos.

## Verificação

```bash
npm run test:api
npm run build
```

Os testes verificam denominadores, agregação, combinação de filtros, integridade dos registros e preservação dos dados após reinicialização.

## API

| Endpoint GET | Resultado |
|---|---|
| `/api/metadata` | Períodos, Geres, unidades e especialidades disponíveis. |
| `/api/dashboard` | Indicadores agregados e lista por especialidade. |
| `/api/specialties/1` | Indicadores da especialidade e histórico mensal. |

Filtros opcionais: `period=2026-11`, `region=1`, `unit=1`, `specialty=1`. O período padrão é o mais recente. No endpoint de detalhes, o ID do caminho define a especialidade. O histórico mantém Geres/unidade e inclui todos os períodos disponíveis.

Exemplo: `/api/dashboard?period=2026-11&region=1`.

Filtros desconhecidos, repetidos ou com valores inválidos retornam HTTP 400; recursos inexistentes retornam 404. Combinações válidas sem registros retornam lista vazia. Indicadores não calculáveis são representados por `null` e apresentados como “—”.

## Estrutura

```text
app/database.py   esquema SQLite e geração determinística de dados
app/service.py    consultas agregadas e cálculos
app/server.py     endpoints REST e entrega da interface compilada
src/App.jsx       painel, detalhes, filtros e metodologia em React
src/styles.css    layout responsivo
tests/            testes de persistência e regras de cálculo
docs/             referências e documentação do projeto
```

O `index.html` é apenas o ponto de montagem exigido pelo Vite; as telas e interações são implementadas em React.

Consulte [as decisões desta versão](docs/IMPLEMENTACAO_INICIAL.md) para fórmulas e hipóteses e [a base do projeto](docs/BASE_DO_PROJETO.md) para o levantamento da disciplina.
