/**
 * Serviço para análise e tratamento de dados de nomes do IBGE
 * 
 * Este serviço implementa métodos para processar e analisar os dados obtidos da API do IBGE,
 * fornecendo funcionalidades específicas para as visualizações e comparações solicitadas.
 */

class AnaliseService {
    constructor() {
        // Dependência do serviço IBGE
        this.ibgeService = null;
    }

    /**
     * Define o serviço IBGE a ser utilizado
     * @param {Object} ibgeService - Instância do serviço IBGE
     */
    setIBGEService(ibgeService) {
        this.ibgeService = ibgeService;
    }

    /**
     * Processa os dados de evolução do ranking de um nome ao longo das décadas
     * @param {string} nome - Nome a ser analisado
     * @param {number} decadaInicio - Década inicial (ex: 1970)
     * @param {number} decadaFim - Década final (ex: 2000)
     * @returns {Promise<Object>} - Dados processados para visualização
     */
    async processarEvolucaoRankingNome(nome, decadaInicio, decadaFim) {
        if (!this.ibgeService) {
            throw new Error('IBGEService não configurado');
        }

        try {
            // Obtém os dados do nome
            const dadosNome = await this.ibgeService.getFrequenciaPorNome(nome);
            
            if (!dadosNome || dadosNome.length === 0) {
                return { erro: `Não foram encontrados dados para o nome ${nome}` };
            }

            // Filtra os dados pelo período solicitado
            const dadosFiltrados = dadosNome[0].res.filter(item => {
                const decada = parseInt(item.periodo.substring(0, 4));
                return decada >= decadaInicio && decada <= decadaFim;
            });

            // Formata os dados para visualização
            const labels = dadosFiltrados.map(item => item.periodo);
            const frequencias = dadosFiltrados.map(item => item.frequencia);
            const proporcoes = dadosFiltrados.map(item => item.proporcao);

            return {
                nome: dadosNome[0].nome,
                labels: labels,
                frequencias: frequencias,
                proporcoes: proporcoes,
                dadosOriginais: dadosFiltrados
            };
        } catch (error) {
            console.error('Erro ao processar evolução do ranking:', error);
            throw error;
        }
    }

    /**
     * Processa os dados dos nomes mais frequentes em uma localidade ao longo das décadas
     * @param {string} localidade - Código da localidade (UF ou município)
     * @returns {Promise<Object>} - Dados processados para visualização
     */
    async processarRankingNomesLocalidade(localidade) {
        if (!this.ibgeService) {
            throw new Error('IBGEService não configurado');
        }

        try {
            // Obtém o ranking de nomes para a localidade
            const dadosRanking = await this.ibgeService.getRankingNomes(localidade);
            
            if (!dadosRanking || dadosRanking.length === 0) {
                return { erro: `Não foram encontrados dados para a localidade ${localidade}` };
            }

            // Seleciona os três nomes mais frequentes
            const topNomes = dadosRanking[0].res.slice(0, 3);
            
            // Para cada nome, obtém a evolução por década
            const evolucaoNomes = await Promise.all(
                topNomes.map(async (item) => {
                    const dadosNome = await this.ibgeService.getFrequenciaPorNomeELocalidade(item.nome, localidade);
                    return {
                        nome: item.nome,
                        ranking: item.ranking,
                        frequencia: item.frequencia,
                        evolucao: dadosNome[0].res
                    };
                })
            );

            // Formata os dados para visualização em tabela
            const decadas = ['1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010'];
            
            const dadosTabela = evolucaoNomes.map(nome => {
                const dadosPorDecada = {};
                
                decadas.forEach(decada => {
                    const dadoDecada = nome.evolucao.find(item => item.periodo.startsWith(decada));
                    dadosPorDecada[decada] = dadoDecada ? dadoDecada.frequencia : 0;
                });
                
                return {
                    nome: nome.nome,
                    ranking: nome.ranking,
                    frequenciaTotal: nome.frequencia,
                    porDecada: dadosPorDecada
                };
            });

            return {
                localidade: localidade,
                decadas: decadas,
                nomes: dadosTabela
            };
        } catch (error) {
            console.error('Erro ao processar ranking de nomes por localidade:', error);
            throw error;
        }
    }

    /**
     * Compara dois nomes ao longo do tempo em nível nacional
     * @param {string} nome1 - Primeiro nome a ser comparado
     * @param {string} nome2 - Segundo nome a ser comparado
     * @returns {Promise<Object>} - Dados processados para visualização
     */
    async processarComparacaoNomes(nome1, nome2) {
        if (!this.ibgeService) {
            throw new Error('IBGEService não configurado');
        }

        try {
            // Obtém os dados dos dois nomes
            const dadosComparacao = await this.ibgeService.compararNomes([nome1, nome2]);
            
            if (!dadosComparacao || dadosComparacao.length !== 2) {
                return { erro: `Não foi possível comparar os nomes ${nome1} e ${nome2}` };
            }

            // Extrai as décadas disponíveis (podem ser diferentes para cada nome)
            const todasDecadas = new Set();
            dadosComparacao.forEach(nome => {
                nome.res.forEach(item => {
                    todasDecadas.add(item.periodo);
                });
            });
            
            // Converte para array e ordena
            const decadasOrdenadas = Array.from(todasDecadas).sort();

            // Prepara os dados para o gráfico
            const dadosGrafico = {
                labels: decadasOrdenadas,
                series: dadosComparacao.map(nome => {
                    // Cria um mapa de período para frequência para facilitar o acesso
                    const mapaPeriodoFrequencia = {};
                    nome.res.forEach(item => {
                        mapaPeriodoFrequencia[item.periodo] = item.frequencia;
                    });
                    
                    // Para cada década, obtém a frequência correspondente ou zero
                    const frequencias = decadasOrdenadas.map(decada => 
                        mapaPeriodoFrequencia[decada] || 0
                    );
                    
                    return {
                        nome: nome.nome,
                        frequencias: frequencias
                    };
                })
            };

            return {
                nome1: dadosComparacao[0].nome,
                nome2: dadosComparacao[1].nome,
                decadas: decadasOrdenadas,
                dadosGrafico: dadosGrafico
            };
        } catch (error) {
            console.error('Erro ao processar comparação de nomes:', error);
            throw error;
        }
    }
}

// Exporta o serviço para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnaliseService;
}
