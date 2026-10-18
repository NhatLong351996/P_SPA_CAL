/**
 * P-SPA FINANCIAL DASHBOARD - CORE JAVASCRIPT LOGIC
 * Manages Chart.js visualizations, theme toggling, interactive table filters,
 * and the real-time Break-Even Simulator.
 */

// Global data definitions matching the Excel sheet
const MONTH_LABELS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Sau cưới'];

const MONTHLY_DATA = {
  fixedCosts: [27200000, 13200000, 20200000, 20200000, 20200000, 16200000],
  investCosts: [92000000, 0, 0, 0, 0, 0],
  totalCosts: [119200000, 13200000, 20200000, 20200000, 20200000, 16200000],
  bepDaily: [4110345, 455172, 696552, 696552, 696552, 558621]
};

// Cost breakdown per month
const BREAKDOWN_BY_MONTH = {
  'Tháng 3': [
    { name: 'Mặt bằng', amount: 7000000, color: '#6366f1' },
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#ec4899' },
    { name: 'Tiền trọ', amount: 4000000, color: '#10b981' },
    { name: 'Nợ vay', amount: 2700000, color: '#f59e0b' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ],
  'Tháng 1': [
    { name: 'Sang mặt bằng', amount: 40000000, color: '#ec4899' },
    { name: 'Học liệu trình + bằng', amount: 20000000, color: '#f43f5e' },
    { name: 'Sản phẩm mỹ phẩm', amount: 15000000, color: '#fb923c' },
    { name: 'Mặt bằng (2 tháng)', amount: 14000000, color: '#6366f1' },
    { name: 'Sửa tiệm + loa', amount: 10000000, color: '#a855f7' },
    { name: 'Máy móc dụng cụ', amount: 5000000, color: '#d946ef' },
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#3b82f6' },
    { name: 'Tiền trọ', amount: 4000000, color: '#10b981' },
    { name: 'Nợ vay', amount: 2700000, color: '#eab308' },
    { name: 'Đồng phục', amount: 2000000, color: '#14b8a6' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ],
  'Tháng 2': [
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#ec4899' },
    { name: 'Tiền trọ', amount: 4000000, color: '#10b981' },
    { name: 'Nợ vay', amount: 2700000, color: '#f59e0b' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ],
  'Tháng 4': [
    { name: 'Mặt bằng', amount: 7000000, color: '#6366f1' },
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#ec4899' },
    { name: 'Tiền trọ', amount: 4000000, color: '#10b981' },
    { name: 'Nợ vay', amount: 2700000, color: '#f59e0b' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ],
  'Tháng 5': [
    { name: 'Mặt bằng', amount: 7000000, color: '#6366f1' },
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#ec4899' },
    { name: 'Tiền trọ', amount: 4000000, color: '#10b981' },
    { name: 'Nợ vay', amount: 2700000, color: '#f59e0b' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ],
  'Sau cưới th1': [
    { name: 'Mặt bằng', amount: 7000000, color: '#6366f1' },
    { name: 'Ăn uống sinh hoạt', amount: 5000000, color: '#ec4899' },
    { name: 'Nợ vay', amount: 2700000, color: '#f59e0b' },
    { name: 'Điện nước', amount: 1000000, color: '#0ea5e9' },
    { name: 'Khấu hao thiết bị', amount: 500000, color: '#8b5cf6' }
  ]
};

// Formatter utilities
function formatVND(val) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(val)) + ' đ';
}

function formatVNDNoUnit(val) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(val));
}

let monthlyChart = null;
let pieChart = null;

// ================= Document Ready =================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMonthlyTotalChart();
  initBreakdownPieChart('Tháng 3');
  initTableInteractions();
  initSimulator();
});

// ================= Theme Management =================
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('pspa_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pspa_theme', newTheme);

    // Refresh charts to match theme grid / text colors
    updateChartTheme();
  });
}

function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    textColor: isDark ? '#94a3b8' : '#475569',
    headingColor: isDark ? '#f8fafc' : '#0f172a',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    cardBg: isDark ? '#162035' : '#ffffff'
  };
}

function updateChartTheme() {
  if (monthlyChart) {
    const tc = getThemeColors();
    monthlyChart.options.scales.x.ticks.color = tc.textColor;
    monthlyChart.options.scales.y.ticks.color = tc.textColor;
    monthlyChart.options.scales.y.grid.color = tc.gridColor;
    monthlyChart.options.scales.y1.ticks.color = '#f59e0b';
    monthlyChart.options.scales.y1.grid.color = 'transparent';
    monthlyChart.update();
  }
}

// ================= Chart 1: Monthly Total & BEP (Section B) =================
function initMonthlyTotalChart() {
  const ctx = document.getElementById('monthlyTotalChart');
  if (!ctx) return;

  const tc = getThemeColors();

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: 'Chi phí cố định',
          data: MONTHLY_DATA.fixedCosts,
          backgroundColor: '#6366f1',
          borderRadius: 6,
          stack: 'costStack',
          yAxisID: 'y'
        },
        {
          label: 'Chi phí đầu tư',
          data: MONTHLY_DATA.investCosts,
          backgroundColor: '#ec4899',
          borderRadius: 6,
          stack: 'costStack',
          yAxisID: 'y'
        },
        {
          label: 'Điểm hòa vốn / ngày (29 ngày)',
          data: MONTHLY_DATA.bepDaily,
          type: 'line',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          titleFont: { family: 'Plus Jakarta Sans', size: 14, weight: 'bold' },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
          padding: 12,
          boxPadding: 6,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const val = context.raw || 0;
              return `${label}: ${formatVND(val)}`;
            },
            afterBody: function (contexts) {
              const idx = contexts[0].dataIndex;
              const total = MONTHLY_DATA.totalCosts[idx];
              const bep = MONTHLY_DATA.bepDaily[idx];
              return `\n👉 Tổng chi: ${formatVND(total)}\n⚡ Doanh thu hòa vốn: ${formatVND(bep)}/ngày`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: tc.textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
        },
        y: {
          type: 'linear',
          position: 'left',
          title: {
            display: true,
            text: 'Tổng Chi Tiêu (VNĐ)',
            color: tc.textColor,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          },
          grid: { color: tc.gridColor },
          ticks: {
            color: tc.textColor,
            font: { family: 'JetBrains Mono' },
            callback: (v) => (v >= 1000000 ? (v / 1000000).toFixed(0) + ' Tr' : v)
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: {
            display: true,
            text: 'Hòa Vốn / Ngày (VNĐ)',
            color: '#f59e0b',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          },
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#f59e0b',
            font: { family: 'JetBrains Mono' },
            callback: (v) => (v >= 1000000 ? (v / 1000000).toFixed(1) + ' Tr' : (v / 1000).toFixed(0) + ' K')
          }
        }
      }
    }
  });
}

// ================= Chart 2: Cost Structure Pie/Doughnut (Section A) =================
function initBreakdownPieChart(monthKey) {
  const ctx = document.getElementById('breakdownPieChart');
  const monthSelect = document.getElementById('pieMonthSelect');
  if (!ctx) return;

  const monthItems = BREAKDOWN_BY_MONTH[monthKey] || BREAKDOWN_BY_MONTH['Tháng 3'];
  const labels = monthItems.map(i => i.name);
  const data = monthItems.map(i => i.amount);
  const colors = monthItems.map(i => i.color);
  const totalAmount = data.reduce((a, b) => a + b, 0);

  // Update center text
  document.getElementById('centerMonthName').textContent = monthKey;
  document.getElementById('centerMonthTotal').textContent = formatVND(totalAmount);

  // Render list below
  renderPieBreakdownList(monthItems, totalAmount);

  if (pieChart) {
    pieChart.data.labels = labels;
    pieChart.data.datasets[0].data = data;
    pieChart.data.datasets[0].backgroundColor = colors;
    pieChart.update();
    return;
  }

  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: 'transparent',
          hoverOffset: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function (context) {
              const val = context.raw || 0;
              const pct = ((val / totalAmount) * 100).toFixed(1);
              return `${context.label}: ${formatVND(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // Listener for month selector
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      initBreakdownPieChart(e.target.value);
    });
  }
}

function renderPieBreakdownList(items, total) {
  const container = document.getElementById('pieBreakdownList');
  if (!container) return;

  container.innerHTML = items.map(item => {
    const pct = ((item.amount / total) * 100).toFixed(1);
    return `
      <div class="pie-item">
        <span class="pie-item-name">
          <span class="pie-color-dot" style="background-color: ${item.color}"></span>
          ${item.name}
        </span>
        <span class="pie-item-value">${pct}% (${formatVNDNoUnit(item.amount)})</span>
      </div>
    `;
  }).join('');
}

// ================= Table Filter & Search =================
function initTableInteractions() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('tableSearch');
  const rows = document.querySelectorAll('#expenseTable tbody tr');

  function applyFilters() {
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const query = (searchInput?.value || '').trim().toLowerCase();

    rows.forEach(row => {
      // If it's a section header
      if (row.classList.contains('row-group-header')) {
        const cat = row.dataset.category;
        if (activeFilter === 'all' || activeFilter === cat) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
        return;
      }

      const category = row.dataset.category;
      const itemName = row.querySelector('.cell-item')?.textContent.toLowerCase() || '';

      const matchCategory = (activeFilter === 'all') || (activeFilter === category);
      const matchSearch = !query || itemName.includes(query);

      if (matchCategory && matchSearch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
}

// ================= Break-Even Simulator =================
function initSimulator() {
  const simMonthSelect = document.getElementById('simMonth');
  const avgTicketInput = document.getElementById('avgTicket');
  const costPerTicketInput = document.getElementById('costPerTicket');
  const workDaysInput = document.getElementById('workDays');

  const grossMarginPreview = document.getElementById('grossMarginPreview');
  const resCustomersPerDay = document.getElementById('resCustomersPerDay');
  const resCustomerDesc = document.getElementById('resCustomerDesc');
  const resRevenuePerDay = document.getElementById('resRevenuePerDay');
  const resCustomersPerMonth = document.getElementById('resCustomersPerMonth');
  const resProfitAt6 = document.getElementById('resProfitAt6');
  const resProfitAt8 = document.getElementById('resProfitAt8');

  const MONTH_COSTS = {
    stable: 20200000,
    postWedding: 16200000,
    month2: 13200000,
    month1: 119200000,
    pureSpa: 8500000
  };

  function recalculate() {
    const stageKey = simMonthSelect.value;
    const monthlyTotalCost = MONTH_COSTS[stageKey] || 20200000;

    const avgTicket = parseFloat(avgTicketInput.value) || 200000;
    const costPerTicket = parseFloat(costPerTicketInput.value) || 0;
    const workDays = parseInt(workDaysInput.value, 10) || 29;

    const grossMargin = Math.max(1, avgTicket - costPerTicket);
    grossMarginPreview.textContent = formatVND(grossMargin) + '/khách';

    // Daily required revenue
    const dailyTargetRev = monthlyTotalCost / workDays;
    resRevenuePerDay.textContent = formatVND(dailyTargetRev);

    // Break-even customers per day (to cover total monthly cost with gross margin)
    const custPerDay = monthlyTotalCost / (workDays * grossMargin);
    const roundedCust = Math.ceil(custPerDay * 10) / 10;
    resCustomersPerDay.innerHTML = `${roundedCust} <span class="res-sub">khách/ngày</span>`;

    const totalCustMonth = Math.ceil(custPerDay * workDays);
    resCustomersPerMonth.textContent = `${totalCustMonth} lượt khách`;

    // Dynamic description
    if (roundedCust <= 4) {
      resCustomerDesc.innerHTML = `Mục tiêu <strong>${Math.ceil(roundedCust)} khách/ngày</strong> rất khả thi và nhẹ nhàng với 1 thợ chăm sóc chuyên sâu!`;
    } else if (roundedCust <= 7) {
      resCustomerDesc.innerHTML = `Mục tiêu <strong>${Math.ceil(roundedCust)} khách/ngày</strong> đòi hỏi sắp xếp lịch hẹn kín ca hoặc làm thêm giờ.`;
    } else {
      resCustomerDesc.innerHTML = `Ngưỡng <strong>${Math.ceil(roundedCust)} khách/ngày</strong> là mức rất cao (thường ở T1 do gộp vốn đầu tư 92Tr).`;
    }

    // Profit at 6 customers / day
    const profit6 = (6 * workDays * grossMargin) - monthlyTotalCost;
    const sign6 = profit6 >= 0 ? '+' : '';
    resProfitAt6.textContent = `${sign6}${formatVND(profit6)}`;
    resProfitAt6.className = profit6 >= 0 ? 'text-success' : 'text-accent';

    // Profit at 8 customers / day
    const profit8 = (8 * workDays * grossMargin) - monthlyTotalCost;
    const sign8 = profit8 >= 0 ? '+' : '';
    resProfitAt8.textContent = `${sign8}${formatVND(profit8)}`;
    resProfitAt8.className = profit8 >= 0 ? 'text-success' : 'text-accent';
  }

  [simMonthSelect, avgTicketInput, costPerTicketInput, workDaysInput].forEach(el => {
    if (el) {
      el.addEventListener('input', recalculate);
      el.addEventListener('change', recalculate);
    }
  });

  // Initial calculation
  recalculate();
}
