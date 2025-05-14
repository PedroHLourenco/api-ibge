const axios = require("axios");

const IBGE_API_BASE_URL =
  "https://servicodados.ibge.gov.br/api/v2/censos/nomes";

class IBGEService {
  async getRankingPorNome(nome, decadaInicial, decadaFinal) {
    try {
      console.log(`Buscando dados para o nome: ${nome}`);
      const url = `${IBGE_API_BASE_URL}/${encodeURIComponent(nome)}`;
      console.log("URL da requisição:", url);

      const response = await axios.get(url);
      console.log("Status da resposta:", response.status);
      console.log("Dados recebidos:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Dados inválidos recebidos da API");
      }

      const dadosFiltrados = response.data.filter((item) => {
        const decada = parseInt(item.periodo.split("-")[0]);
        return decada >= decadaInicial && decada <= decadaFinal;
      });

      console.log("Dados filtrados:", dadosFiltrados);
      return dadosFiltrados;
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Erro ao buscar ranking do nome: ${error.message}`);
    }
  }

  async getTopNomesPorLocalidade(localidade, tipo = "UF") {
    try {
      console.log(
        `Buscando top nomes para localidade: ${localidade}, tipo: ${tipo}`
      );
      const url = `${IBGE_API_BASE_URL}/ranking`;
      console.log("URL da requisição:", url);

      const response = await axios.get(url, {
        params: {
          localidade: encodeURIComponent(localidade),
          tipo: tipo,
        },
      });

      console.log("Status da resposta:", response.status);
      console.log("Dados recebidos:", response.data);

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Dados inválidos recebidos da API");
      }

      return response.data.slice(0, 3);
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        `Erro ao buscar top nomes por localidade: ${error.message}`
      );
    }
  }

  async compararNomes(nome1, nome2) {
    try {
      console.log(`Comparando nomes: ${nome1} e ${nome2}`);
      const [dadosNome1, dadosNome2] = await Promise.all([
        this.getRankingPorNome(nome1, 1930, 2020),
        this.getRankingPorNome(nome2, 1930, 2020),
      ]);

      return {
        nome1: dadosNome1,
        nome2: dadosNome2,
      };
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(`Erro ao comparar nomes: ${error.message}`);
    }
  }
}

module.exports = new IBGEService();
