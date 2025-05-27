/**
 * Script principal para integração da interface com os serviços
 * Implementa a comunicação REST entre a UI e os serviços de backend
 */

// Inicialização dos serviços
const ibgeService = new IBGEService();
const analiseService = new AnaliseService();
analiseService.setIBGEService(ibgeService);

// Elementos DOM
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.section-content');

// Navegação entre abas
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Atualiza classes ativas
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// Controlador para a funcionalidade de evolução do ranking de um nome
const evolucaoController = {
    form: document.getElementById('form-evolucao'),
    resultContainer: document.getElementById('result-evolucao'),
    loadingElement: document.querySelector('#result-evolucao .loading'),
    errorElement: document.querySelector('#result-evolucao .error'),
    chartElement: document.getElementById('chart-evolucao'),
    infoElement: document.getElementById('info-evolucao'),
    chart: null,
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const nome = document.getElementById('nome-evolucao').value.trim();
        const decadaInicio = parseInt(document.getElementById('decada-inicio').value);
        const decadaFim = parseInt(document.getElementById('decada-fim').value);
        
        if (!nome) {
            this.showError('Por favor, informe um nome válido.');
            return;
        }
        
        if (decadaInicio > decadaFim) {
            this.showError('A década inicial deve ser menor ou igual à década final.');
            return;
        }
        
        this.showLoading();
        
        try {
            const dados = await analiseService.processarEvolucaoRankingNome(nome, decadaInicio, decadaFim);
            
            if (dados.erro) {
                this.showError(dados.erro);
                return;
            }
            
            this.renderChart(dados);
            this.renderInfo(dados);
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao processar evolução do ranking:', error);
            this.showError('Ocorreu um erro ao processar os dados. Por favor, tente novamente.');
        }
    },
    
    renderChart(dados) {
        // Destrói o gráfico anterior se existir
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Verifica se há dados para renderizar
        if (!dados.labels || dados.labels.length === 0) {
            this.chartElement.style.display = 'none';
            return;
        }
        
        this.chartElement.style.display = 'block';
        
        // Formata os dados para o gráfico
        const formattedLabels = dados.labels.map(label => {
            // Remove os colchetes e outros caracteres especiais para melhor visualização
            return label.replace('[', '').replace(']', '');
        });
        
        // Cria um novo gráfico com estilo minimalista
        const ctx = this.chartElement.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedLabels,
                datasets: [{
                    label: `Frequência`,
                    data: dados.frequencias,
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderColor: '#3498db',
                    borderWidth: 2,
                    pointBackgroundColor: '#3498db',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            color: '#666'
                        },
                        title: {
                            display: true,
                            text: 'Frequência',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12,
                                weight: '500'
                            },
                            color: '#666'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            color: '#666'
                        },
                        title: {
                            display: true,
                            text: 'Década',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12,
                                weight: '500'
                            },
                            color: '#666'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `${dados.nome} ${dados.decadaInicio === dados.decadaFim ? `(${dados.decadaInicio})` : `(${dados.decadaInicio} - ${dados.decadaFim})`}`,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 16,
                            weight: '500'
                        },
                        color: '#333',
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#333',
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 13,
                            weight: '600'
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Frequência: ${context.raw.toLocaleString('pt-BR')}`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    renderInfo(dados) {
        // Calcula estatísticas
        const totalFrequencia = dados.frequencias.reduce((acc, freq) => acc + freq, 0);
        const maxFrequencia = Math.max(...dados.frequencias);
        const maxDecada = dados.labels[dados.frequencias.indexOf(maxFrequencia)];
        
        // Formata o período analisado usando as décadas informadas pelo usuário
        let periodoTexto;
        if (dados.decadaInicio === dados.decadaFim) {
            periodoTexto = `${dados.decadaInicio}`;
        } else {
            periodoTexto = `${dados.decadaInicio} a ${dados.decadaFim}`;
        }
        
        // Formata HTML com informações
        let html = `
            <p><strong>Nome:</strong> ${dados.nome}</p>
            <p><strong>Período analisado:</strong> ${periodoTexto}</p>
            <p><strong>Total de registros:</strong> ${totalFrequencia.toLocaleString('pt-BR')}</p>
            <p><strong>Década mais popular:</strong> ${maxDecada} (${maxFrequencia.toLocaleString('pt-BR')} registros)</p>
        `;
        
        this.infoElement.innerHTML = html;
    },
    
    showLoading() {
        this.loadingElement.style.display = 'block';
        this.errorElement.style.display = 'none';
    },
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
    },
    
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.loadingElement.style.display = 'none';
    }
};

// Controlador para a funcionalidade de ranking de nomes em uma localidade
const rankingController = {
    form: document.getElementById('form-ranking'),
    resultContainer: document.getElementById('result-ranking'),
    loadingElement: document.querySelector('#result-ranking .loading'),
    errorElement: document.querySelector('#result-ranking .error'),
    tableElement: document.getElementById('table-ranking'),
    localidadeTipoElement: document.getElementById('localidade-tipo'),
    ufContainerElement: document.getElementById('uf-container'),
    municipioContainerElement: document.getElementById('municipio-container'),
    municipioInputElement: document.getElementById('localidade-municipio-nome'),
    municipioCodigoElement: document.getElementById('localidade-municipio-codigo'),
    municipiosListaElement: document.getElementById('municipios-lista'),
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.localidadeTipoElement.addEventListener('change', this.handleLocalidadeTipoChange.bind(this));
        this.municipioInputElement.addEventListener('input', this.handleMunicipioInput.bind(this));
    },
    
    handleLocalidadeTipoChange() {
        const tipo = this.localidadeTipoElement.value;
        
        if (tipo === 'UF') {
            this.ufContainerElement.style.display = 'block';
            this.municipioContainerElement.style.display = 'none';
        } else {
            this.ufContainerElement.style.display = 'none';
            this.municipioContainerElement.style.display = 'block';
        }
    },
    
    async handleMunicipioInput() {
        const termo = this.municipioInputElement.value.trim();
        
        if (termo.length < 3) {
            this.municipiosListaElement.innerHTML = '';
            this.municipiosListaElement.classList.remove('active');
            return;
        }
        
        try {
            // Consulta a API de localidades do IBGE para buscar municípios
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${encodeURIComponent(termo)}`);
            const municipios = await response.json();
            
            if (municipios.length === 0) {
                this.municipiosListaElement.innerHTML = '<div class="dropdown-item">Nenhum município encontrado</div>';
            } else {
                this.municipiosListaElement.innerHTML = municipios
                    .slice(0, 10) // Limita a 10 resultados
                    .map(municipio => `
                        <div class="dropdown-item" data-id="${municipio.id}" data-nome="${municipio.nome} - ${municipio.microrregiao.mesorregiao.UF.sigla}">
                            ${municipio.nome} - ${municipio.microrregiao.mesorregiao.UF.sigla}
                        </div>
                    `)
                    .join('');
                
                // Adiciona eventos de clique aos itens
                const items = this.municipiosListaElement.querySelectorAll('.dropdown-item');
                items.forEach(item => {
                    item.addEventListener('click', () => {
                        const id = item.getAttribute('data-id');
                        const nome = item.getAttribute('data-nome');
                        
                        this.municipioInputElement.value = nome;
                        this.municipioCodigoElement.value = id;
                        this.municipiosListaElement.classList.remove('active');
                    });
                });
            }
            
            this.municipiosListaElement.classList.add('active');
        } catch (error) {
            console.error('Erro ao buscar municípios:', error);
        }
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        let localidade;
        const tipo = this.localidadeTipoElement.value;
        
        if (tipo === 'UF') {
            localidade = document.getElementById('localidade-uf').value;
        } else {
            localidade = this.municipioCodigoElement.value;
            
            if (!localidade) {
                this.showError('Por favor, selecione um município válido da lista.');
                return;
            }
        }
        
        this.showLoading();
        
        try {
            const dados = await analiseService.processarRankingNomesLocalidade(localidade);
            
            if (dados.erro) {
                this.showError(dados.erro);
                return;
            }
            
            this.renderTable(dados);
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao processar ranking de nomes:', error);
            this.showError('Ocorreu um erro ao processar os dados. Por favor, tente novamente.');
        }
    },
    
    renderTable(dados) {
        const tbody = this.tableElement.querySelector('tbody');
        tbody.innerHTML = '';
        
        dados.nomes.forEach(nome => {
            const tr = document.createElement('tr');
            
            // Coluna do nome
            const tdNome = document.createElement('td');
            tdNome.textContent = nome.nome;
            tr.appendChild(tdNome);
            
            // Coluna do ranking
            const tdRanking = document.createElement('td');
            tdRanking.textContent = nome.ranking;
            tr.appendChild(tdRanking);
            
            // Colunas das décadas
            dados.decadas.forEach(decada => {
                const tdDecada = document.createElement('td');
                tdDecada.textContent = nome.porDecada[decada] ? nome.porDecada[decada].toLocaleString('pt-BR') : '-';
                tr.appendChild(tdDecada);
            });
            
            // Coluna do total
            const tdTotal = document.createElement('td');
            tdTotal.textContent = nome.frequenciaTotal.toLocaleString('pt-BR');
            tr.appendChild(tdTotal);
            
            tbody.appendChild(tr);
        });
    },
    
    showLoading() {
        this.loadingElement.style.display = 'block';
        this.errorElement.style.display = 'none';
    },
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
    },
    
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.loadingElement.style.display = 'none';
    }
};

// Controlador para a funcionalidade de comparação de dois nomes
const comparacaoController = {
    form: document.getElementById('form-comparacao'),
    resultContainer: document.getElementById('result-comparacao'),
    loadingElement: document.querySelector('#result-comparacao .loading'),
    errorElement: document.querySelector('#result-comparacao .error'),
    chartElement: document.getElementById('chart-comparacao'),
    infoElement: document.getElementById('info-comparacao'),
    chart: null,
    
    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const nome1 = document.getElementById('nome1').value.trim();
        const nome2 = document.getElementById('nome2').value.trim();
        
        if (!nome1 || !nome2) {
            this.showError('Por favor, informe dois nomes válidos para comparação.');
            return;
        }
        
        this.showLoading();
        
        try {
            const dados = await analiseService.processarComparacaoNomes(nome1, nome2);
            
            if (dados.erro) {
                this.showError(dados.erro);
                return;
            }
            
            this.renderChart(dados);
            this.renderInfo(dados);
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao processar comparação de nomes:', error);
            this.showError('Ocorreu um erro ao processar os dados. Por favor, tente novamente.');
        }
    },
    
    renderChart(dados) {
        // Destrói o gráfico anterior se existir
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Cores para os datasets
        const cores = [
            { background: 'rgba(52, 152, 219, 0.2)', border: 'rgba(52, 152, 219, 1)' },
            { background: 'rgba(231, 76, 60, 0.2)', border: 'rgba(231, 76, 60, 1)' }
        ];
        
        // Prepara os datasets
        const datasets = dados.dadosGrafico.series.map((serie, index) => ({
            label: serie.nome,
            data: serie.frequencias,
            backgroundColor: cores[index].background,
            borderColor: cores[index].border,
            borderWidth: 2,
            pointBackgroundColor: cores[index].border,
            tension: 0.1
        }));
        
        // Cria um novo gráfico
        const ctx = this.chartElement.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dados.decadas,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frequência'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Década'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Comparação entre os nomes ${dados.nome1} e ${dados.nome2}`
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toLocaleString('pt-BR')}`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    renderInfo(dados) {
        // Calcula estatísticas para cada nome
        const estatisticas = dados.dadosGrafico.series.map(serie => {
            const totalFrequencia = serie.frequencias.reduce((acc, freq) => acc + freq, 0);
            const maxFrequencia = Math.max(...serie.frequencias);
            const maxDecada = dados.decadas[serie.frequencias.indexOf(maxFrequencia)];
            
            return {
                nome: serie.nome,
                totalFrequencia,
                maxFrequencia,
                maxDecada
            };
        });
        
        // Formata HTML com informações
        let html = `
            <p><strong>Período analisado:</strong> ${dados.decadas[0]} a ${dados.decadas[dados.decadas.length - 1]}</p>
            <h4>Estatísticas:</h4>
            <ul>
        `;
        
        estatisticas.forEach(est => {
            html += `
                <li>
                    <strong>${est.nome}:</strong>
                    <ul>
                        <li>Total de registros: ${est.totalFrequencia.toLocaleString('pt-BR')}</li>
                        <li>Década mais popular: ${est.maxDecada} (${est.maxFrequencia.toLocaleString('pt-BR')} registros)</li>
                    </ul>
                </li>
            `;
        });
        
        html += '</ul>';
        
        // Adiciona análise comparativa
        const [est1, est2] = estatisticas;
        const diferencaTotal = Math.abs(est1.totalFrequencia - est2.totalFrequencia);
        const percentualDiferenca = ((diferencaTotal / Math.min(est1.totalFrequencia, est2.totalFrequencia)) * 100).toFixed(2);
        const nomeMaisPopular = est1.totalFrequencia > est2.totalFrequencia ? est1.nome : est2.nome;
        
        html += `
            <h4>Análise Comparativa:</h4>
            <p>O nome <strong>${nomeMaisPopular}</strong> é mais popular no Brasil, com uma diferença de ${diferencaTotal.toLocaleString('pt-BR')} registros (${percentualDiferenca}% a mais).</p>
        `;
        
        this.infoElement.innerHTML = html;
    },
    
    showLoading() {
        this.loadingElement.style.display = 'block';
        this.errorElement.style.display = 'none';
    },
    
    hideLoading() {
        this.loadingElement.style.display = 'none';
    },
    
    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.loadingElement.style.display = 'none';
    }
};

// Inicialização dos controladores quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    evolucaoController.init();
    rankingController.init();
    comparacaoController.init();
});
