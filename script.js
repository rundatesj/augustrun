const SHEET_API_URL = "https://api.sheetbest.com/sheets/c6709219-c2c2-4e16-b8d5-bd57ec77f8bd";

document.getElementById("runForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nickname = document.getElementById("nickname").value;
  const group = document.getElementById("group").value;
  const date = document.getElementById("date").value;
  const distance = parseFloat(document.getElementById("distance").value);

  // 입력값 검사
  if (!nickname || !group || !date || isNaN(distance) || distance <= 0) {
    alert("모든 항목을 올바르게 입력하고, 거리는 0보다 커야 합니다.");
    return;
  }

  const entry = { nickname, group, date, distance };

  await fetch(SHEET_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  document.getElementById("submitMsg").innerText = "✅ 제출 완료!";
  this.reset();
  loadAndRender();
});

function showTab(id) {
  document.querySelectorAll(".tab").forEach((t) => (t.style.display = "none"));
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

  data.forEach((row) => {
    let dateValue = row.date;

    // 엑셀 숫자 형식 날짜 처리
    if (!isNaN(dateValue)) {
      const baseDate = new Date(1899, 11, 30);
      dateValue = new Date(baseDate.getTime() + dateValue * 86400000)
        .toISOString()
        .split("T")[0];
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.nickname}</td>
      <td>${row.group}</td>
      <td>${dateValue}</td>
      <td>${row.distance}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateChart(data) {
  const ctx = document.getElementById("runChart").getContext("2d");

  const summary = {};

  data.forEach((row) => {
    const name = row.nickname;
    const dist = parseFloat(row.distance || 0);
    summary[name] = (summary[name] || 0) + dist;
  });

  // 거리순 정렬
  const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([name]) => name);
  const values = sorted.map(([_, value]) => value);

  const baseColors = ['#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba'];
  const colors = labels.map((_, i) => baseColors[i % baseColors.length]);

  if (window.runChartInstance) window.runChartInstance.destroy();

  window.runChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "개인 누적 거리 (km)",
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateTeamChart(data) {
  const ctx = document.getElementById("teamChart").getContext("2d");
  const summary = {};

  data.forEach((row) => {
    const group = row.group;
    const dist = parseFloat(row.distance || 0);
    summary[group] = (summary[group] || 0) + dist;
  });

  const labels = Object.keys(summary);
  const values = Object.values(summary);

  const groupColors = {
    "뛰어야": "#36A2EB",
    "산다": "#FF6384"
  };

  const backgroundColors = labels.map(group => groupColors[group] || "#AAAAAA");

  if (window.teamChartInstance) window.teamChartInstance.destroy();

  window.teamChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "팀별 누적 거리 (km)",
        data: values,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

loadAndRender();
