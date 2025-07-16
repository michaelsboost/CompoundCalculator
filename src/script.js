document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'compound-calculator-data';
  const planTableBody = document.getElementById('planTableBody');
  const planContainer = document.getElementById('planContainer');
  const meta = document.getElementById('meta');
  const downloadBtn = document.getElementById('downloadCsv');
  const downloadContainer = document.getElementById('downloadContainer');
  const form = document.getElementById('plannerForm');

  // Group inputs into a single state object
  const state = {
    start: document.getElementById('start'),
    goal: document.getElementById('goal'),
    rate: document.getElementById('rate'),
    riskPerTrade: document.getElementById('riskPerTrade')
  };

  let planData = [];

  // Load defaults or saved values
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const defaults = { start: 100, goal: 1000, rate: 5, riskPerTrade: 1 };

  Object.keys(state).forEach(key => {
    state[key].value = saved[key] ?? defaults[key];
  });

  // Save inputs to localStorage
  function saveInputs() {
    const data = {};
    for (let key in state) {
      data[key] = parseFloat(state[key].value);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Generate the compound plan
  function generatePlan() {
    const values = {};
    for (let key in state) {
      values[key] = parseFloat(state[key].value);
    }

    const { start, goal, rate, riskPerTrade } = values;

    if (Object.values(values).some(v => v <= 0) || start >= goal) {
      alert('Please enter valid values.');
      return;
    }

    saveInputs();
    // localStorage.removeItem(STORAGE_KEY)
    planData = [];
    let current = start;
    let day = 0;
    planTableBody.innerHTML = '';

    while (current < goal) {
      const dailyGain = current * (rate / 100);
      current += dailyGain;
      day++;
      const maxRisk = current * (riskPerTrade / 100);
      planData.push({ day, dailyGain, balance: current, maxRisk });

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="p-2 border-b">${day}</td>
        <td class="p-2 border-b">$${dailyGain.toFixed(2)}</td>
        <td class="p-2 border-b font-medium">$${current.toFixed(2)}</td>
        <td class="p-2 border-b text-red-600 font-medium">$${maxRisk.toFixed(2)}</td>
      `;
      planTableBody.appendChild(row);
    }

    // Target date
    const today = new Date();
    today.setDate(today.getDate() + day);
    document.getElementById('targetDate').textContent = today.toLocaleDateString();
    document.getElementById('daysToGoal').textContent = day;

    planContainer.classList.remove('hidden');
    meta.classList.remove('hidden');
    downloadContainer.classList.remove('hidden');
  }

  function exportCSV(data) {
    const headers = ['Day', 'Daily Gain', 'Balance', 'Max Risk'];
    const rows = data.map(d => [
      d.day, d.dailyGain.toFixed(2), d.balance.toFixed(2), d.maxRisk.toFixed(2)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compound-plan-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    generatePlan();
  });

  downloadBtn.addEventListener('click', () => {
    exportCSV(planData);
  });

  generatePlan(); // initial render
});