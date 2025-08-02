
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbytyVGj_B1zveR3DgtRGKAygazAwAd9_CitBRBRH2td3q6krWiKRs4Ue0E5zVxuhTry/exec';
const crewMembers = { "goinggoing": "우유", "포도맨": "포도" };
let records = [];

document.addEventListener('DOMContentLoaded', function() {
    const memberSelect = document.getElementById('memberSelect');
    memberSelect.innerHTML = '<option value="">크루원을 선택하세요</option>';
    for (const member in crewMembers) {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        memberSelect.appendChild(option);
    }

    memberSelect.addEventListener('change', function() {
        const team = crewMembers[this.value];
        document.getElementById('teamDisplay').value = team ? team + '팀' : '팀 정보 없음';
    });

    document.getElementById('recordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const member = document.getElementById('memberSelect').value;
        const team = crewMembers[member];
        const date = document.getElementById('dateInput').value;
        const distance = parseFloat(document.getElementById('distance').value);
        if (!member || !date || !distance) return alert('모든 항목을 입력해주세요.');

        const record = { date, team, name: member, distance };
        records.push(record);
        updateDisplay();
        saveRecordToSheet(record);
        this.reset();
    });
});

function updateDisplay() {
    const teamATotal = records.filter(r => r.team === '우유').reduce((sum, r) => sum + r.distance, 0);
    const teamBTotal = records.filter(r => r.team === '포도').reduce((sum, r) => sum + r.distance, 0);
    document.getElementById('teamATotal').textContent = teamATotal.toFixed(1);
    document.getElementById('teamBTotal').textContent = teamBTotal.toFixed(1);

    const historyList = document.getElementById('historyList');
    historyList.innerHTML = records.slice().reverse().map(r => 
        `<div>${r.date} - ${r.team}팀 ${r.name}: ${r.distance}km</div>`).join('');
}

async function saveRecordToSheet(record) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        const result = await response.json();
        if (result.success) console.log('Google Sheets 저장 성공');
    } catch (error) {
        console.error('저장 실패', error);
    }
}
