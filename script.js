
const SHEET_API_URL = "https://api.sheetbest.com/sheets/c6709219-c2c2-4e16-b8d5-bd57ec77f8bd";

document.getElementById("runForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const nickname = document.getElementById("nickname").value;
  const group = document.getElementById("group").value;
  const date = document.getElementById("date").value;
  const distance = parseFloat(document.getElementById("distance").value);

  const entry = { nickname, group, date, distance };

  await fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });

  document.getElementById("submitMsg").innerText = "✅ 제출 완료!";
  this.reset();
  loadAndRender();
});

function showTab(id) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById(id).style.display = "block";
}

async function loadAndRender() {
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();

  updateTable(data);
  updateChart(data);
  updateTeamChart(data);
}

function updateTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.nickname}</td><td>${row.group}</td><td>${row.date}</td><td>${row.distance}</td>`;
    tbody.appendChild(tr);
  });
}

function updateChart(data) {
  const ctx = document.getElementById('runChart').getContext('2d');
  const summary = {};
  data.forEach(row => {
    summary[row.nickname] = (summary[row.nickname] || 0) + parseFloat(row.distance || 0);
  });
  const labels = Object.keys(summary);
  const values = Object.values(summary);

  if (window.runChartInstance) window.runChartInstance.destroy();

  window.runChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: '개인 누적 거리 (km)', data: values }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function updateTeamChart(data) {
  const ctx = document.getElementById('teamChart').getContext('2d');
  const summary = {};
  data.forEach(row => {
    summary[row.group] = (summary[row.group] || 0) + parseFloat(row.distance || 0);
  });
  const labels = Object.keys(summary);
  const values = Object.values(summary);

  if (window.teamChartInstance) window.teamChartInstance.destroy();

  window.teamChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: '팀별 누적 거리 (km)', data: values }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

loadAndRender();
