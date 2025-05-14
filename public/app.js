const API_URL = "http://localhost:3001/api/nomes";

let graficoEvolucao = null;
let graficoComparacao = null;

function mostrarErro(mensagem, detalhes = "") {
  const mensagemCompleta = detalhes
    ? `${mensagem}\nDetalhes: ${detalhes}`
    : mensagem;
  alert(mensagemCompleta);
}

function mostrarLoading(elemento) {
  elemento.innerHTML =
    '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>';
}

function criarGraficoEvolucao(dados) {
  const ctx = document.getElementById("graficoEvolucao").getContext("2d");

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  if (!dados || dados.length === 0) {
    document.getElementById("graficoEvolucao").parentElement.innerHTML =
      '<p class="text-center">Nenhum dado encontrado para o período selecionado.</p>';
    return;
  }

  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: dados.map((item) => item.periodo),
      datasets: [
        {
          label: "Ranking",
          data: dados.map((item) => item.ranking),
          borderColor: "#0d6efd",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Evolução do Ranking",
        },
      },
      scales: {
        y: {
          reverse: true,
          title: {
            display: true,
            text: "Ranking",
          },
        },
        x: {
          title: {
            display: true,
            text: "Período",
          },
        },
      },
    },
  });
}

function criarGraficoComparacao(dados) {
  const ctx = document.getElementById("graficoComparacao").getContext("2d");

  if (graficoComparacao) {
    graficoComparacao.destroy();
  }

  if (!dados || !dados.nome1 || !dados.nome2) {
    document.getElementById("graficoComparacao").parentElement.innerHTML =
      '<p class="text-center">Nenhum dado encontrado para comparação.</p>';
    return;
  }

  graficoComparacao = new Chart(ctx, {
    type: "line",
    data: {
      labels: dados.nome1.map((item) => item.periodo),
      datasets: [
        {
          label: "Nome 1",
          data: dados.nome1.map((item) => item.ranking),
          borderColor: "#0d6efd",
          tension: 0.1,
        },
        {
          label: "Nome 2",
          data: dados.nome2.map((item) => item.ranking),
          borderColor: "#dc3545",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Comparação de Rankings",
        },
      },
      scales: {
        y: {
          reverse: true,
          title: {
            display: true,
            text: "Ranking",
          },
        },
        x: {
          title: {
            display: true,
            text: "Período",
          },
        },
      },
    },
  });
}

function atualizarTabelaTopNomes(dados) {
  const tbody = document.querySelector("#tabelaTopNomes tbody");
  tbody.innerHTML = "";

  if (!dados || dados.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center">Nenhum dado encontrado para a localidade selecionada.</td></tr>';
    return;
  }

  dados.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.frequencia}</td>
            <td>${item.ranking}</td>
        `;
    tbody.appendChild(tr);
  });
}

document
  .getElementById("formEvolucao")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const decadaInicial = document.getElementById("decadaInicial").value;
    const decadaFinal = document.getElementById("decadaFinal").value;
    const graficoContainer =
      document.getElementById("graficoEvolucao").parentElement;

    try {
      mostrarLoading(graficoContainer);
      const response = await fetch(
        `${API_URL}/evolucao/${encodeURIComponent(
          nome
        )}?decadaInicial=${decadaInicial}&decadaFinal=${decadaFinal}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const dados = await response.json();
      graficoContainer.innerHTML = '<canvas id="graficoEvolucao"></canvas>';
      criarGraficoEvolucao(dados);
    } catch (error) {
      mostrarErro("Erro ao buscar dados: " + error.message);
      graficoContainer.innerHTML = '<canvas id="graficoEvolucao"></canvas>';
    }
  });

document
  .getElementById("formLocalidade")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const localidade = document.getElementById("localidade").value;
    const tipo = document.getElementById("tipoLocalidade").value;
    const tabelaContainer = document.querySelector("#tabelaTopNomes tbody");

    try {
      mostrarLoading(tabelaContainer);
      const response = await fetch(
        `${API_URL}/top-localidade?localidade=${encodeURIComponent(
          localidade
        )}&tipo=${tipo}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const dados = await response.json();
      atualizarTabelaTopNomes(dados);
    } catch (error) {
      mostrarErro("Erro ao buscar dados: " + error.message);
      tabelaContainer.innerHTML =
        '<tr><td colspan="3" class="text-center">Erro ao carregar dados</td></tr>';
    }
  });

document
  .getElementById("formComparacao")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome1 = document.getElementById("nome1").value;
    const nome2 = document.getElementById("nome2").value;
    const graficoContainer =
      document.getElementById("graficoComparacao").parentElement;

    try {
      mostrarLoading(graficoContainer);
      const response = await fetch(
        `${API_URL}/comparar?nome1=${encodeURIComponent(
          nome1
        )}&nome2=${encodeURIComponent(nome2)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Erro ${response.status}: ${response.statusText}`
        );
      }

      const dados = await response.json();
      graficoContainer.innerHTML = '<canvas id="graficoComparacao"></canvas>';
      criarGraficoComparacao(dados);
    } catch (error) {
      mostrarErro("Erro ao buscar dados: " + error.message);
      graficoContainer.innerHTML = '<canvas id="graficoComparacao"></canvas>';
    }
  });
