# Sistema de Análise de Tendências de Nomes no Brasil

Este projeto implementa um sistema orientado a serviços (SOA) que consome a API de nomes do IBGE para fornecer análises de tendências de nomes próprios no Brasil ao longo das décadas. O sistema aplica os conceitos de SOA na prática, promovendo a integração de serviços, separação de responsabilidades e reutilização de componentes.

## Funcionalidades

O sistema oferece três funcionalidades principais:

1. **Evolução do ranking de um nome**
   - O usuário informa um nome e define um intervalo de décadas
   - O sistema exibe a evolução do ranking do nome no período especificado através de um gráfico

2. **Evolução do ranking de nomes em uma localidade**
   - O usuário seleciona uma localidade (UF ou município)
   - O sistema exibe os três nomes mais frequentes ao longo das décadas nessa localidade em uma tabela

3. **Comparação de dois nomes ao longo do tempo (nacional)**
   - O usuário insere dois nomes
   - O sistema compara a popularidade dos dois nomes em todo o Brasil desde a década de 1930 até a década mais recente disponível através de um gráfico

## Arquitetura SOA

O sistema foi desenvolvido seguindo os princípios da Arquitetura Orientada a Serviços (SOA):

- **Desacoplamento**: Os serviços são independentes e podem ser utilizados separadamente
- **Reutilização**: Os componentes são projetados para serem reutilizados em diferentes contextos
- **Comunicação via REST**: A interface se comunica com os serviços através de chamadas REST
- **Separação de responsabilidades**: Cada serviço tem uma função específica e bem definida

### Estrutura do Projeto

```
ibge-nomes-soa/
├── services/
│   ├── ibge-service.js     # Serviço de consulta à API do IBGE
│   └── analise-service.js  # Serviço de análise e tratamento de dados
├── ui/
│   ├── index.html          # Interface do usuário
│   ├── style.css           # Estilos da interface
│   └── script.js           # Scripts de integração com os serviços
├── data/                   # Diretório para armazenamento de dados (se necessário)
└── README.md               # Documentação do projeto
```

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS e JavaScript puros
- **Visualização de Dados**: Chart.js
- **Comunicação**: Fetch API para requisições REST
- **Dados**: API pública do IBGE sobre nomes

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/ibge-nomes-soa.git
   cd ibge-nomes-soa
   ```

2. Abra o arquivo `ui/index.html` em um navegador web:
   - Você pode usar um servidor local como o Live Server do VS Code
   - Ou simplesmente abrir o arquivo diretamente no navegador
   
**Importante**: A estrutura do projeto inclui uma cópia dos arquivos de serviço dentro da pasta `ui/services/` para garantir que o navegador consiga carregá-los corretamente quando o arquivo HTML é aberto diretamente. Isso mantém a arquitetura SOA enquanto resolve questões de carregamento de módulos no ambiente do navegador.

3. Utilize as três funcionalidades disponíveis na interface:
   - Selecione a aba correspondente à análise desejada
   - Preencha os campos solicitados
   - Clique no botão para visualizar os resultados

## Detalhes da Implementação

### Serviço de Consulta à API do IBGE (`ibge-service.js`)

Este serviço encapsula todas as chamadas à API pública do IBGE sobre nomes, fornecendo métodos para:

- Consultar a frequência de um nome por década
- Obter o ranking de nomes mais frequentes
- Comparar múltiplos nomes ao longo do tempo
- Filtrar dados por localidade (UF ou município)

### Serviço de Análise de Dados (`analise-service.js`)

Este serviço processa os dados obtidos da API do IBGE e os prepara para visualização, implementando a lógica de negócio para:

- Processar a evolução do ranking de um nome em um período específico
- Analisar os nomes mais frequentes em uma localidade
- Comparar a popularidade de dois nomes ao longo do tempo

### Interface do Usuário

A interface foi desenvolvida com HTML, CSS e JavaScript puros, seguindo princípios de design responsivo e usabilidade. Ela se comunica com os serviços através de chamadas REST e utiliza a biblioteca Chart.js para visualização de dados.

## API do IBGE

O sistema utiliza a API pública do IBGE sobre nomes, disponível em:
https://servicodados.ibge.gov.br/api/docs/nomes?versao=2

Principais endpoints utilizados:

- `GET /api/v2/censos/nomes/{nome}`: Obtém a frequência de um nome por década
- `GET /api/v2/censos/nomes/ranking`: Obtém o ranking de nomes mais frequentes
- `GET /api/v2/censos/nomes/{nome}?localidade={localidade}`: Obtém a frequência de um nome em uma localidade específica

## Limitações e Considerações

- A API do IBGE não considera nomes compostos, apenas o primeiro nome
- Quando a quantidade de ocorrências for muito pequena (menos de 10 por município, 15 por UF ou 20 no Brasil), o IBGE não informa essa quantidade
- A API não distingue nomes diferenciados apenas pelo uso de sinais diacríticos (acentos)

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests com melhorias.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
