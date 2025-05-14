const express = require("express");
const router = express.Router();
const ibgeService = require("../services/ibgeService");

const validarParametros = (req, res, next) => {
  const { decadaInicial, decadaFinal } = req.query;

  if (decadaInicial && decadaFinal) {
    const inicial = parseInt(decadaInicial);
    const final = parseInt(decadaFinal);

    if (isNaN(inicial) || isNaN(final)) {
      return res
        .status(400)
        .json({ error: "Décadas devem ser números válidos" });
    }

    if (inicial < 1930 || final > 2020) {
      return res
        .status(400)
        .json({ error: "Décadas devem estar entre 1930 e 2020" });
    }

    if (inicial > final) {
      return res
        .status(400)
        .json({ error: "Década inicial deve ser menor que a década final" });
    }
  }

  next();
};

router.get("/evolucao/:nome", validarParametros, async (req, res) => {
  try {
    const { nome } = req.params;
    const { decadaInicial, decadaFinal } = req.query;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    console.log("Parâmetros recebidos:", { nome, decadaInicial, decadaFinal });

    const dados = await ibgeService.getRankingPorNome(
      nome,
      parseInt(decadaInicial),
      parseInt(decadaFinal)
    );

    if (!dados || dados.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum dado encontrado para o nome especificado" });
    }

    res.json(dados);
  } catch (error) {
    console.error("Erro na rota de evolução:", error);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

router.get("/top-localidade", async (req, res) => {
  try {
    const { localidade, tipo } = req.query;

    if (!localidade) {
      return res.status(400).json({ error: "Localidade é obrigatória" });
    }

    if (tipo && !["UF", "municipio"].includes(tipo)) {
      return res.status(400).json({ error: "Tipo deve ser UF ou municipio" });
    }

    console.log("Parâmetros recebidos:", { localidade, tipo });

    const dados = await ibgeService.getTopNomesPorLocalidade(localidade, tipo);

    if (!dados || dados.length === 0) {
      return res
        .status(404)
        .json({
          error: "Nenhum dado encontrado para a localidade especificada",
        });
    }

    res.json(dados);
  } catch (error) {
    console.error("Erro na rota de top localidade:", error);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

router.get("/comparar", async (req, res) => {
  try {
    const { nome1, nome2 } = req.query;

    if (!nome1 || !nome2) {
      return res.status(400).json({ error: "Ambos os nomes são obrigatórios" });
    }

    console.log("Parâmetros recebidos:", { nome1, nome2 });

    const dados = await ibgeService.compararNomes(nome1, nome2);

    if (!dados || !dados.nome1 || !dados.nome2) {
      return res
        .status(404)
        .json({ error: "Nenhum dado encontrado para os nomes especificados" });
    }

    res.json(dados);
  } catch (error) {
    console.error("Erro na rota de comparação:", error);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;
