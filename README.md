# Análise de Nomes IBGE

## Integrantes do Grupo

- Gabriel Presense - RA: 22143207-2
- Hudson Matias - RA: 22045746-2
- Pedro Henrique de Abreu Lourenço - RA: 22014566-2

## Descrição

Sistema orientado a serviços (SOA) que consome a API de nomes do IBGE para fornecer análises de tendências de nomes próprios no Brasil, ao longo das décadas. O sistema permite visualizar a evolução do ranking de nomes, comparar nomes e analisar tendências por localidade.

## Funcionalidades

1. **Evolução do Ranking de um Nome**

   - Visualização da evolução do ranking de um nome específico
   - Seleção de intervalo de décadas (1930-2020)
   - Gráfico interativo mostrando a tendência

2. **Top Nomes por Localidade**

   - Consulta dos três nomes mais frequentes por UF ou município
   - Exibição em tabela com ranking e frequência
   - Suporte a diferentes localidades

3. **Comparação de Nomes**
   - Comparação da popularidade de dois nomes ao longo do tempo
   - Visualização em gráfico comparativo
   - Análise desde a década de 1930

## Tecnologias Utilizadas

- Backend: Node.js com Express
- Frontend: HTML, CSS, JavaScript
- Visualização: Chart.js
- Estilização: Bootstrap 5
- API: IBGE API de Nomes

## Requisitos

- Node.js (versão 14 ou superior)
- NPM (versão 6 ou superior)

## Instalação

1. Clone o repositório:

```bash
git clone [URL_DO_REPOSITÓRIO]
cd api-ibge
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor:

```bash
npm run dev
```

4. Acesse a aplicação:

```
http://localhost:3001
```

## Estrutura do Projeto

```
api-ibge/
├── src/
│   ├── routes/
│   │   └── nomes.js
│   ├── services/
│   │   └── ibgeService.js
│   └── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
└── README.md
```

## API Endpoints

### 1. Evolução do Ranking

```
GET /api/nomes/evolucao/:nome
Query params:
- decadaInicial: número (1930-2020)
- decadaFinal: número (1930-2020)
```

### 2. Top Nomes por Localidade

```
GET /api/nomes/top-localidade
Query params:
- localidade: string (nome da UF ou município)
- tipo: string ('UF' ou 'municipio')
```

### 3. Comparação de Nomes

```
GET /api/nomes/comparar
Query params:
- nome1: string
- nome2: string
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
