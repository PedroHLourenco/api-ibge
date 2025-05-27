/**
 * Serviço para consulta à API de nomes do IBGE
 * 
 * Este serviço implementa métodos para consultar a API pública do IBGE sobre nomes,
 * permitindo obter dados históricos sobre a popularidade de nomes próprios no Brasil
 * desde a década de 1930.
 * 
 * API Base: https://servicodados.ibge.gov.br/api/v2/censos/nomes/
 */

class IBGEService {
    constructor() {
        this.baseUrl = 'https://servicodados.ibge.gov.br/api/v2/censos/nomes';
    }

    /**
     * Realiza uma requisição HTTP para a API do IBGE
     * @param {string} endpoint - Endpoint a ser consultado
     * @returns {Promise<Object>} - Promessa com os dados da resposta
     */
    async fetchData(endpoint) {
        try {
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao consultar a API do IBGE:', error);
            throw error;
        }
    }

    /**
     * Obtém a frequência de um nome por década
     * @param {string} nome - Nome a ser consultado
     * @returns {Promise<Object>} - Promessa com os dados de frequência do nome por década
     */
    async getFrequenciaPorNome(nome) {
        const endpoint = `${this.baseUrl}/${encodeURIComponent(nome)}`;
        return this.fetchData(endpoint);
    }

    /**
     * Obtém a frequência de um nome por década em uma localidade específica
     * @param {string} nome - Nome a ser consultado
     * @param {string} localidade - Código da localidade (UF ou município)
     * @returns {Promise<Object>} - Promessa com os dados de frequência do nome por década na localidade
     */
    async getFrequenciaPorNomeELocalidade(nome, localidade) {
        const endpoint = `${this.baseUrl}/${encodeURIComponent(nome)}?localidade=${encodeURIComponent(localidade)}`;
        return this.fetchData(endpoint);
    }

    /**
     * Obtém a frequência de um nome por UF
     * @param {string} nome - Nome a ser consultado
     * @returns {Promise<Object>} - Promessa com os dados de frequência do nome por UF
     */
    async getFrequenciaPorNomeEUF(nome) {
        const endpoint = `${this.baseUrl}/${encodeURIComponent(nome)}?groupBy=UF`;
        return this.fetchData(endpoint);
    }

    /**
     * Obtém o ranking de nomes mais frequentes
     * @param {string} localidade - Código da localidade (opcional)
     * @returns {Promise<Object>} - Promessa com os dados do ranking de nomes
     */
    async getRankingNomes(localidade = null) {
        let endpoint = `${this.baseUrl}/ranking`;
        
        if (localidade) {
            endpoint += `?localidade=${encodeURIComponent(localidade)}`;
        }
        
        return this.fetchData(endpoint);
    }

    /**
     * Obtém o ranking de nomes mais frequentes por década
     * @param {string} decada - Década a ser consultada (ex: 1950, 1960, etc.)
     * @param {string} localidade - Código da localidade (opcional)
     * @returns {Promise<Object>} - Promessa com os dados do ranking de nomes por década
     */
    async getRankingNomesPorDecada(decada, localidade = null) {
        let endpoint = `${this.baseUrl}/ranking/?decada=${encodeURIComponent(decada)}`;
        
        if (localidade) {
            endpoint += `&localidade=${encodeURIComponent(localidade)}`;
        }
        
        return this.fetchData(endpoint);
    }

    /**
     * Compara dois nomes ao longo do tempo
     * @param {string[]} nomes - Array com os nomes a serem comparados
     * @returns {Promise<Object[]>} - Promessa com os dados de frequência dos nomes por década
     */
    async compararNomes(nomes) {
        if (!Array.isArray(nomes) || nomes.length === 0) {
            throw new Error('É necessário fornecer pelo menos um nome para comparação');
        }

        const nomesFormatados = nomes.join('|');
        const endpoint = `${this.baseUrl}/${encodeURIComponent(nomesFormatados)}`;
        
        return this.fetchData(endpoint);
    }
}

// Exporta o serviço para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IBGEService;
}
