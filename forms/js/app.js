let currentChart = null;

function switchTab(tabId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.container > div').forEach(d => d.classList.add('hidden'));
    
    document.querySelector(`.nav-tab[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');

    if (tabId === 'dashboard') {
        loadPastorsDropdown();
    }
}

// 1. DASHBOARD LOGIC
async function loadPastorsDropdown() {
    try {
        const res = await fetch('http://localhost:5001/forms/data/pastors');
        const data = await res.json();
        
        const select = document.getElementById('pastor-select');
        select.innerHTML = '<option value="">-- Choose Pastor --</option>';
        
        if (data.status === 'success' && data.data) {
            data.data.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.name} (ID: ${p.id})`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Failed to load pastors", e);
    }
}

async function loadPastorAnalytics() {
    const pastorId = document.getElementById('pastor-select').value;
    const content = document.getElementById('analytics-content');
    
    if (!pastorId) {
        content.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`http://localhost:5001/forms/analytics/pastor/${pastorId}`);
        const data = await res.json();
        
        if (data.status === 'success') {
            content.classList.remove('hidden');
            
            // Update KPIs
            document.getElementById('kpi-baptisms').innerText = data.data.summary.total_baptisms || 0;
            document.getElementById('kpi-attendance').innerText = Math.round(data.data.summary.average_attendance || 0);
            document.getElementById('kpi-churches').innerText = data.data.summary.total_churches || 0;
            
            // Render Chart & Tables
            renderChart(data.data.metrics);
            renderAssignmentsTable(data.data.assignments);
            renderMetricsTable(data.data.metrics);
        }
    } catch (e) {
        console.error("Failed to load analytics", e);
        alert("Could not load analytics. Make sure the backend is running and the database has been populated.");
    }
}

function renderChart(metrics) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    if (currentChart) {
        currentChart.destroy();
    }

    // Sort by date
    metrics.sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = metrics.map(m => `${m.date} (${m.church_id})`);
    const attendanceData = metrics.map(m => m.attendance);

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weekly Attendance',
                data: attendanceData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderAssignmentsTable(assignments) {
    const tbody = document.querySelector('#assignments-table tbody');
    tbody.innerHTML = '';
    
    if (!assignments || assignments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No assignments found.</td></tr>';
        return;
    }
    
    // Sort by start_date descending
    assignments.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    
    assignments.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${a.pastor_id}</strong></td>
                <td><span style="color:var(--primary); font-weight:500;">${a.church_id}</span></td>
                <td>${a.start_date}</td>
                <td>${a.end_date || 'Present'}</td>
                <td>${a.transfer_reason || '-'}</td>
                <td>${a.complaints || 'None'}</td>
            </tr>
        `;
    });
}

function renderMetricsTable(metrics) {
    const tbody = document.querySelector('#metrics-table tbody');
    tbody.innerHTML = '';
    
    if (!metrics || metrics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No metrics found for the assigned timeframe.</td></tr>';
        return;
    }
    
    // Sort by date descending
    metrics.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    metrics.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td><span style="color:var(--primary); font-weight:500;">${m.church_id}</span></td>
                <td>${m.date}</td>
                <td><strong>${m.attendance}</strong></td>
                <td>${m.baptisms}</td>
                <td>${m.membership_count}</td>
            </tr>
        `;
    });
}

// 2. EXCEL UPLOAD LOGIC
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const table = document.getElementById('upload-target').value;
    const statusDiv = document.getElementById('upload-status');
    
    statusDiv.innerHTML = `<span style="color: #2563eb;">⏳ Uploading and processing...</span>`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('table', table);

    try {
        const res = await fetch('http://localhost:5001/forms/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (data.status === 'success') {
            statusDiv.innerHTML = `<span style="color: #16a34a;">✅ ${data.message}</span>`;
            if (table === 'pastors') loadPastorsDropdown(); // Refresh if pastors changed
        } else {
            statusDiv.innerHTML = `<span style="color: #dc2626;">❌ Error: ${data.message}</span>`;
        }
    } catch (e) {
        console.error(e);
        statusDiv.innerHTML = `<span style="color: #dc2626;">❌ Failed to upload. Check backend connection.</span>`;
    }
    
    // Reset file input
    event.target.value = '';
}

// 3. MANUAL ENTRY LOGIC
async function handleManualSubmit(event) {
    event.preventDefault();
    
    const church_id = document.getElementById('manual-church').value;
    const date = document.getElementById('manual-date').value;
    const attendance = document.getElementById('manual-att').value;
    const baptisms = document.getElementById('manual-bap').value;
    
    const record = {
        church_id,
        date,
        attendance: parseInt(attendance),
        baptisms: parseInt(baptisms),
        membership_count: 0 // Default
    };

    try {
        const res = await fetch('http://localhost:5001/forms/submit-single', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table: 'metrics', record: record })
        });
        
        const data = await res.json();
        if (data.status === 'success') {
            alert('✅ Metric logged successfully!');
            document.getElementById('manual-form').reset();
            
            // Refresh chart if a pastor is selected
            if (document.getElementById('pastor-select').value) {
                loadPastorAnalytics();
            }
        } else {
            alert(`❌ Error: ${data.message}`);
        }
    } catch (e) {
        console.error(e);
        alert('❌ Failed to submit data.');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPastorsDropdown();
});
