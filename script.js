const sources = [
  { name: "Voz 1", icon: "🎤" },
  { name: "Voz 2", icon: "🎤" },
  { name: "Voz 3", icon: "🎤" },
  { name: "Voz 4", icon: "🎤" },
  { name: "Voz 5", icon: "🎤" },
  { name: "Bajo", icon: "🎸" },
  { name: "Guitarra", icon: "🎸" },
  { name: "Piano", icon: "🎹" },
  { name: "Bombo", icon: "🥁" },
  { name: "Redoblante", icon: "🥁" },
  { name: "Platillos", icon: "🥁" }
];

const MAX_HISTORY = 100;

let silenced = new Array(sources.length).fill(false);
let historyData = sources.map(() => []); // guardar valores por fuente

const container = document.getElementById('container');
sources.forEach((source, index) => {
  const sourceDiv = document.createElement('div');
  sourceDiv.className = 'source';

  sourceDiv.innerHTML = `
    <label><span class="icon">${source.icon}</span>${source.name}</label>
    <div class="bar-container">
      <div class="bar" id="bar-${index}"></div>
      <span class="value" id="value-${index}">-- dB</span>
    </div>
    <button class="silence-btn" onclick="toggleSilence(${index}, this)">Silenciar</button>
  `;

  container.appendChild(sourceDiv);
});

const ctx = document.getElementById('gainChart').getContext('2d');
const gainChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: sources.map(s => s.name),
    datasets: [{
      label: 'Promedio de Ganancia (dB)',
      data: new Array(sources.length).fill(0),
      backgroundColor: sources.map((_, i) => getColor(i))
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        title: {
          display: true,
          text: 'Ganancia (dB)'
        }
      }
    }
  }
});

function simulateSignal() {
  const alertsList = document.getElementById('alerts');
  const timeLabel = new Date().toLocaleTimeString();

  sources.forEach((source, index) => {
    let value = 0;

    if (silenced[index]) {
      document.getElementById(`value-${index}`).innerText = "Silenciado";
      document.getElementById(`bar-${index}`).style.width = "0%";
      historyData[index].push(null);
    } else {
      const exceed = Math.random() < 0.15;
      value = exceed ? getRandomInt(71, 100) : getRandomInt(40, 70);

      const bar = document.getElementById(`bar-${index}`);
      const valueText = document.getElementById(`value-${index}`);
      valueText.innerText = value + ' dB';
      bar.style.width = Math.min(value, 100) + '%';
      bar.style.backgroundColor = value > 70 ? 'red' : 'green';

      historyData[index].push(value);

      // Mostrar alerta
      if (value > 70) {
        const li = document.createElement('li');
        li.textContent = `${source.icon} ${source.name}: ${value} dB - ${timeLabel}`;
        alertsList.appendChild(li);
      }
    }

    // Limitar historial
    if (historyData[index].length > MAX_HISTORY) {
      historyData[index].shift();
    }

    // Calcular promedio ignorando nulls
    const validValues = historyData[index].filter(v => v !== null);
    const avg = validValues.length > 0
      ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(1)
      : 0;

    gainChart.data.datasets[0].data[index] = avg;
  });

  gainChart.update();
}

function toggleSilence(index, btn) {
  silenced[index] = !silenced[index];
  btn.textContent = silenced[index] ? "Reactivar" : "Silenciar";
}

function getColor(i) {
  const colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
    '#f58231', '#911eb4', '#46f0f0', '#f032e6',
    '#bcf60c', '#fabebe', '#008080'
  ];
  return colors[i % colors.length];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(simulateSignal, 1000);
simulateSignal();
