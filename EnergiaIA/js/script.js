/**
 * ============================================================================
 * ENERGIA.IA — LÓGICA DO FRONTEND (MVP SUAPE)
 * Funções para gráficos (Chart.js), telemetria de equipamentos, relatórios
 * preditivos e simulação Digital Twin.
 * ============================================================================
 */

// Base de dados simulada dos equipamentos do Complexo de Suape
const equipmentsData = [
  { id: 'm01', name: 'Motor 01', sector: 'Operação', power: 78, consumption: 820, fp: 0.94, v: 380, i: 128, status: 'Normal', expPower: 80 },
  { id: 'm02', name: 'Motor 02', sector: 'Operação', power: 82, consumption: 850, fp: 0.92, v: 381, i: 132, status: 'Normal', expPower: 82 },
  { id: 'm03', name: 'Motor 03', sector: 'Operação', power: 75, consumption: 790, fp: 0.95, v: 379, i: 122, status: 'Normal', expPower: 76 },
  { id: 'm04', name: 'Motor 04', sector: 'Operação', power: 105, consumption: 1400, fp: 0.82, v: 372, i: 168, status: 'Anomalia', expPower: 75 },
  { id: 'b01', name: 'Bomba 01', sector: 'Hidráulica', power: 45, consumption: 410, fp: 0.93, v: 380, i: 74, status: 'Normal', expPower: 45 },
  { id: 'b02', name: 'Bomba 02', sector: 'Hidráulica', power: 58, consumption: 530, fp: 0.78, v: 376, i: 96, status: 'Atenção', expPower: 55 },
  { id: 'ref', name: 'Sistema de Refrigeração', sector: 'Armazenamento', power: 140, consumption: 1680, fp: 0.91, v: 380, i: 228, status: 'Atenção', expPower: 120 },
  { id: 'ilum', name: 'Iluminação Pátio', sector: 'Infraestrutura', power: 22, consumption: 240, fp: 0.98, v: 220, i: 100, status: 'Normal', expPower: 22 }
];

// ============================================================================
// 1. GRÁFICO DO DASHBOARD PRINCIPAL (CONSUMO REAL VS ESPERADO)
// ============================================================================
function initDashboardChart() {
  const canvas = document.getElementById('consumptionChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Conjuntos de dados simulados para cada período de filtro
  const datasetsByPeriod = {
    'Hoje': {
      labels: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'],
      real: [280, 260, 310, 340, 350, 378, 330, 290],
      expected: [270, 260, 290, 310, 320, 320, 310, 280]
    },
    '7 dias': {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      real: [8420, 8190, 8650, 8910, 8740, 7200, 6950],
      expected: [8000, 8000, 8100, 8150, 8100, 7000, 6800]
    },
    '30 dias': {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      real: [56400, 58100, 54900, 53200],
      expected: [55000, 55000, 54000, 53500]
    }
  };

  const chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: datasetsByPeriod['Hoje'].labels,
      datasets: [
        {
          label: 'Consumo Real (kW)',
          data: datasetsByPeriod['Hoje'].real,
          borderColor: '#1677FF',
          backgroundColor: 'rgba(22, 119, 255, 0.12)',
          fill: true,
          tension: 0.35
        },
        {
          label: 'Consumo Esperado — IA (kW)',
          data: datasetsByPeriod['Hoje'].expected,
          borderColor: '#20C997',
          borderDash: [5, 5],
          fill: false,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#F8FAFC' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94A3B8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        y: {
          ticks: { color: '#94A3B8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });

  // Interatividade dos botões "Hoje", "7 dias" e "30 dias"
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const period = btn.innerText.trim();
      const selectedData = datasetsByPeriod[period];

      if (selectedData) {
        const unit = period === 'Hoje' ? 'kW' : 'kWh';
        chartInstance.data.labels = selectedData.labels;
        chartInstance.data.datasets[0].label = `Consumo Real (${unit})`;
        chartInstance.data.datasets[0].data = selectedData.real;
        chartInstance.data.datasets[1].label = `Consumo Esperado — IA (${unit})`;
        chartInstance.data.datasets[1].data = selectedData.expected;
        chartInstance.update();
      }
    });
  });
}

// ============================================================================
// 2. TABELA E MODAL DE EQUIPAMENTOS (equipamentos.html)
// ============================================================================
function renderEquipmentsTable() {
  const tbody = document.getElementById('equipments-table-body');
  if (!tbody) return;

  tbody.innerHTML = equipmentsData.map(eq => {
    // Define a classe de cor conforme o status operacional
    let statusClass = 'ok';
    if (eq.status === 'Anomalia') statusClass = 'alert-red';
    else if (eq.status === 'Atenção') statusClass = 'alert-yellow';

    return `
      <tr>
        <td><strong>${eq.name}</strong></td>
        <td>${eq.sector}</td>
        <td>${eq.power} kW</td>
        <td>${eq.consumption} kWh</td>
        <td>${eq.v} V</td>
        <td>${eq.i} A</td>
        <td><span class="${eq.fp < 0.9 ? 'yellow-text' : ''}">${eq.fp.toFixed(2)}</span></td>
        <td><span class="status-pill ${statusClass}">${eq.status}</span></td>
        <td>
          <button class="btn btn-outline" onclick="openDetailsModal('${eq.id}')">Detalhes</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openDetailsModal(id) {
  const eq = equipmentsData.find(item => item.id === id);
  if (!eq) return;

  const modal = document.getElementById('modal-details');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body-content');

  title.innerText = `Telemetria IoT — ${eq.name}`;

  // Calcula o desvio percentual entre potência real e esperada
  const deviation = (((eq.power - eq.expPower) / eq.expPower) * 100).toFixed(1);
  const deviationClass = deviation > 10 ? 'red-text' : deviation > 0 ? 'yellow-text' : 'green-text';
  const sign = deviation > 0 ? '+' : '';

  body.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; font-size: 14px;">
      <div><strong>Setor:</strong> ${eq.sector}</div>
      <div><strong>Status:</strong> ${eq.status}</div>
      <div><strong>Tensão Média:</strong> ${eq.v} V</div>
      <div><strong>Corrente Média:</strong> ${eq.i} A</div>
      <div><strong>Potência Ativa:</strong> ${eq.power} kW</div>
      <div><strong>Potência Esperada:</strong> ${eq.expPower} kW</div>
      <div><strong>Fator de Potência:</strong> ${eq.fp.toFixed(2)}</div>
      <div><strong>Desvio Operacional:</strong> <span class="${deviationClass}"><strong>${sign}${deviation}%</strong></span></div>
    </div>
    <div style="background: var(--bg-dark); padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.5; border: 1px solid var(--border-color);">
      <strong>Diagnóstico da IA:</strong> ${
        eq.status === 'Anomalia'
          ? 'Consumo elétrico elevado fora da curva padrão. Recomenda-se inspeção imediata de carga e alinhamento.'
          : eq.status === 'Atenção'
          ? 'Parâmetro próximo ao limite operacional. Monitorar fator de potência e horário de pico.'
          : 'Equipamento operando dentro da faixa ideal de eficiência energética.'
      }
    </div>
  `;

  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-details');
  if (modal) modal.style.display = 'none';
}

// Fecha o modal ao clicar fora da caixa de conteúdo
window.addEventListener('click', (event) => {
  const modal = document.getElementById('modal-details');
  if (event.target === modal) {
    closeModal();
  }
});

// ============================================================================
// 3. RELATÓRIO PREDITIVO COM IA (analise.html)
// ============================================================================
function generateReport(btn) {
  const status = document.getElementById('report-status');
  if (!status) return;

  btn.disabled = true;
  status.style.color = '#94A3B8';
  status.innerText = 'Analisando séries históricas e curvas de carga com IA...';

  setTimeout(() => {
    btn.disabled = false;
    status.style.color = 'var(--accent-green)';
    status.innerText = 'Diagnóstico concluído! 3 oportunidades de economia identificadas.';
  }, 1200);
}

// ============================================================================
// 4. SIMULAÇÃO DIGITAL TWIN (simulacao.html)
// ============================================================================
function updateSimulation() {
  const sliderM1 = document.getElementById('slider-m1');
  const sliderM2 = document.getElementById('slider-m2');
  const sliderM4 = document.getElementById('slider-m4');
  const sliderHours = document.getElementById('slider-hours');

  // Garante que a função só rode na página de simulação
  if (!sliderM1 || !sliderM2 || !sliderM4) return;

  const s1 = Number(sliderM1.value);
  const s2 = Number(sliderM2.value);
  const s4 = Number(sliderM4.value);
  const hours = sliderHours ? Number(sliderHours.value) : 16;

  // Atualiza os textos percentuais dos controles
  document.getElementById('val-m1').innerText = `${s1}%`;
  document.getElementById('val-m2').innerText = `${s2}%`;
  document.getElementById('val-m4').innerText = `${s4}%`;
  if (document.getElementById('val-hours')) {
    document.getElementById('val-hours').innerText = `${hours}h / dia`;
  }

  // Potências nominais originais (kW)
  const baseM1 = 78;
  const baseM2 = 82;
  const baseM4 = 105;
  const baseDemand = 342;
  const baseHours = 16;

  // Potências simuladas
  const p1 = baseM1 * (s1 / 100);
  const p2 = baseM2 * (s2 / 100);
  const p4 = baseM4 * (s4 / 100);

  // Atualiza valores no diagrama de topologia
  document.getElementById('top-m1').innerText = `${p1.toFixed(0)} kW`;
  document.getElementById('top-m2').innerText = `${p2.toFixed(0)} kW`;
  document.getElementById('top-m4').innerText = `${p4.toFixed(0)} kW`;

  // Cálculo da nova demanda e redução de potência (kW)
  const newDemand = (baseDemand - (baseM1 + baseM2 + baseM4)) + (p1 + p2 + p4);
  const powerReduction = Math.max(0, baseDemand - newDemand);

  // Cálculo de economia mensal em kWh (considerando 30 dias)
  const baseMonthlyKwh = baseDemand * baseHours * 30;
  const newMonthlyKwh = newDemand * hours * 30;
  const kwhSaved = Math.max(0, baseMonthlyKwh - newMonthlyKwh);

  // Tarifa industrial média estimada (R$ 0,68/kWh + demanda contratada)
  const moneySaved = (kwhSaved * 0.68) + (powerReduction * 45);

  document.getElementById('sim-demanda').innerText = `${newDemand.toFixed(0)} kW`;
  document.getElementById('sim-reducao').innerText = `${powerReduction.toFixed(0)} kW`;
  document.getElementById('sim-kwh').innerText = `${kwhSaved.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kWh/mês`;
  document.getElementById('sim-economia').innerText = `R$ ${moneySaved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// 5. GRÁFICO DE RELATÓRIOS MENSAIS (relatorios.html)
// ============================================================================
function initReportsChart() {
  const canvas = document.getElementById('reportsChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
      datasets: [
        {
          label: 'Consumo Anterior (MWh)',
          data: [248, 252, 245, 240, 238, 235],
          backgroundColor: 'rgba(100, 116, 139, 0.5)',
          borderRadius: 6
        },
        {
          label: 'Com Otimização Energia.IA (MWh)',
          data: [245, 241, 229, 221, 214, 206],
          backgroundColor: '#20C997',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#F8FAFC' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#94A3B8' },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#94A3B8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
      }
    }
  });
}

// ============================================================================
// 6. FILTRO DE ALERTAS (alertas.html)
// ============================================================================
function filterAlerts(level, btn) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = document.querySelectorAll('.alert-item');
  items.forEach(item => {
    if (level === 'all' || item.dataset.level === level) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}
