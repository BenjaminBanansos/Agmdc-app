console.log("AGMDC App initialized");

document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;
    console.log(`Loaded page: ${pageTitle}`);

    // Initial Load
    populateDepartments();
    updateDashboardStats();
});

// --- Admin Dashboard Logic ---

function switchView(viewName) {
    const dashboardView = document.getElementById('view-dashboard');
    const inboxView = document.getElementById('view-inbox');
    const candidatesView = document.getElementById('view-candidates');
    const pipelineView = document.getElementById('view-pipeline');

    // Hide all
    if (dashboardView) dashboardView.style.display = 'none';
    if (inboxView) inboxView.style.display = 'none';
    if (candidatesView) candidatesView.style.display = 'none';
    if (pipelineView) pipelineView.style.display = 'none';

    // Show selected
    if (viewName === 'inbox' && inboxView) {
        inboxView.style.display = 'block';
        populateDepartments();
        loadInbox('all');
    } else if (viewName === 'candidates' && candidatesView) {
        candidatesView.style.display = 'block';
        loadCandidates();
    } else if (viewName === 'pipeline' && pipelineView) {
        pipelineView.style.display = 'block';
        loadPipeline();
    } else if (dashboardView) {
        // Default to dashboard
        dashboardView.style.display = 'block';
        updateDashboardStats();
    }
}

// Helper: Convert File to Base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// --- HIERARCHY / DEPARTMENT MANAGEMENT ---

const DEFAULT_DEPARTMENTS = [
    "Youth Movement",
    "Sunday School",
    "Sevini Samajam",
    "Lay Ministry",
    "Edavaka Mission",
    "Choir",
    "Yuvajana Sakhyam"
];

function getDepartments() {
    const stored = localStorage.getItem('agmdc_departments');
    if (stored) return JSON.parse(stored);

    // Seed defaults if empty
    localStorage.setItem('agmdc_departments', JSON.stringify(DEFAULT_DEPARTMENTS));
    return DEFAULT_DEPARTMENTS;
}

function populateDepartments() {
    const select = document.getElementById('wa-allocate-dept');
    if (!select) return;

    const depts = getDepartments();

    // Keep the placeholder
    select.innerHTML = '<option value="">-- Select Destination --</option>';

    depts.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept; // Using Name as Key for simplicity
        opt.innerText = dept;
        select.appendChild(opt);
    });
}

function promptAddDepartment() {
    const newDept = prompt("Enter new Department / Category Name:");
    if (newDept && newDept.trim() !== "") {
        const depts = getDepartments();
        if (!depts.includes(newDept.trim())) {
            depts.push(newDept.trim());
            localStorage.setItem('agmdc_departments', JSON.stringify(depts));
            populateDepartments(); // Refresh dropdown

            // Auto-select the new one
            setTimeout(() => {
                const select = document.getElementById('wa-allocate-dept');
                if (select) select.value = newDept.trim();
            }, 100);

            alert(`✅ Added "${newDept}"`);
        } else {
            alert("⚠️ Department already exists.");
        }
    }
}
// Expose to global scope for button onclick
window.promptAddDepartment = promptAddDepartment;


// --- OFFLINE / MOCK MODE HELPERS ---
function getLocalInbox() {
    return JSON.parse(localStorage.getItem('agmdc_inbox') || '[]');
}

function saveLocalInbox(items) {
    localStorage.setItem('agmdc_inbox', JSON.stringify(items));
}

function getLocalResources(deptKey) {
    const allResources = JSON.parse(localStorage.getItem('agmdc_resources') || '{}');
    return allResources[deptKey] || [];
}

function saveLocalResource(deptKey, resource) {
    const allResources = JSON.parse(localStorage.getItem('agmdc_resources') || '{}');
    if (!allResources[deptKey]) allResources[deptKey] = [];
    allResources[deptKey].push(resource);
    localStorage.setItem('agmdc_resources', JSON.stringify(allResources));
}

function createOfflineBadge() {
    if (document.getElementById('offline-badge')) return document.getElementById('offline-badge');
    const b = document.createElement('div');
    b.id = 'offline-badge';
    b.innerText = '⚠️ Offline Mode';
    b.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: #fff3cd; color: #856404; padding: 5px 10px; border-radius: 4px; font-size: 12px; border: 1px solid #ffeeba; display: none; z-index: 9999;';
    document.body.appendChild(b);
    return b;
}

// Filter Inbox Tabs
let currentFilter = 'all';

function filterInbox(type, btn) {
    currentFilter = type;

    // Update active button
    if (btn) {
        document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    loadInbox(type);
}

// 2. Load Inbox Items (Hybrid: Online -> Offline Fallback)
async function loadInbox(filter = 'all') {
    let inboxItems = [];
    let isOffline = false;

    try {
        const response = await fetch('http://localhost:5001/inbox');
        if (!response.ok) throw new Error("Server Error");
        inboxItems = await response.json();
    } catch (error) {
        console.warn("Server offline, switching to local storage.");
        inboxItems = getLocalInbox();
        isOffline = true;
    }

    // Filter Items
    if (filter !== 'all') {
        inboxItems = inboxItems.filter(item => item.source === filter);
    }

    const list = document.getElementById('inbox-list');
    const select = document.getElementById('wa-allocate-inbox-id');
    const loading = document.getElementById('inbox-loading');

    if (list) list.innerHTML = '';
    if (select) select.innerHTML = '<option value="">-- Choose from Inbox --</option>';
    if (loading) loading.style.display = 'none';

    // Show Offline Indicator
    const badge = createOfflineBadge();
    badge.style.display = isOffline ? 'block' : 'none';

    if (inboxItems.length === 0) {
        if (list) list.innerHTML = `<div class="alert alert-light text-center">No files found (${isOffline ? 'Offline Mode' : 'Online'}).</div>`;
        return;
    }

    inboxItems.forEach(item => {
        // Determine Icon
        let icon = '📄';
        if (item.source === 'whatsapp') icon = '📱';
        if (item.source === 'email') icon = '📧';
        if (item.source === 'upload') icon = '📤';

        // Add to Display List
        if (list) {
            const div = document.createElement('div');
            div.className = "list-group-item d-flex justify-content-between align-items-center";
            div.innerHTML = `
                <div>
                    <strong>${icon} ${item.filename}</strong><br>
                    <small class="text-muted">From: ${item.sender} | ${new Date(item.timestamp).toLocaleDateString()}</small>
                    <div class="text-truncate" style="max-width: 300px; font-size: 0.85rem;">${item.caption}</div>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="prefillAllocation('${item.id}')">Select</button>
            `;
            list.appendChild(div);
        }

        // Add to Dropdown
        if (select) {
            const option = document.createElement('option');
            option.value = item.id;
            // Truncate name if too long
            const displayName = item.filename.length > 25 ? item.filename.substring(0, 22) + '...' : item.filename;
            option.text = `${icon} ${displayName}`;
            select.appendChild(option);
        }
    });
}

// Helper to select item in allocation dropdown
function prefillAllocation(id) {
    const select = document.getElementById('wa-allocate-inbox-id');
    select.value = id;
    select.scrollIntoView({ behavior: 'smooth' });
    select.focus();
}

// Simulate Email for Testing
async function simulateEmail() {
    try {
        const res = await fetch('http://localhost:5001/test/simulate-email', { method: 'POST' });
        const data = await res.json();
        if (data.status === 'success') {
            alert("📧 Dummy Email Received (Server)!");
            loadInbox();
        }
    } catch (e) {
        // Offline Fallback
        const dummy = {
            id: `offline_email_${Date.now()}`,
            source: 'email',
            sender: "test.local@example.com",
            filename: "offline_dummy.txt",
            mimetype: "text/plain",
            timestamp: new Date().toISOString(),
            caption: "Subject: Offline Test Email"
        };
        const local = getLocalInbox();
        local.push(dummy);
        saveLocalInbox(local);
        alert("📧 Dummy Email Received (Offline Mode)!");
        loadInbox();
    }
}

// Dev Tool: Manual Upload to Inbox
async function handleManualInboxUpload(input) {
    if (!input || input.files.length === 0) return;

    const file = input.files[0];
    const btn = document.querySelector('button[title="Upload File"]');
    const originalText = btn ? btn.innerText : 'Upload File';
    if (btn) btn.innerText = "⏳ Uploading...";

    try {
        const base64Len = await toBase64(file);

        const payload = {
            filename: file.name,
            mimetype: file.type,
            data: base64Len,
            caption: `Manual Upload (${file.size} bytes)`
        };

        const res = await fetch('http://localhost:5001/test/upload-to-inbox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.status === 'success') {
            alert(`✅ Success: "${file.name}" added to Inbox.`);
            loadInbox();
        } else {
            alert("❌ Upload failed: " + data.message);
        }
    } catch (e) {
        // Offline Fallback
        console.warn("Upload failed, saving locally.");
        const localItem = {
            id: `offline_upload_${Date.now()}`,
            source: 'upload',
            sender: "Offline Admin",
            filename: file.name,
            mimetype: file.type,
            timestamp: new Date().toISOString(),
            caption: `Manual Upload (${file.size} bytes) - Offline`
        };
        const inbox = getLocalInbox();
        inbox.push(localItem);
        saveLocalInbox(inbox);
        alert(`✅ Saved Locally: "${file.name}" (Server Offline)`);
        loadInbox();
    } finally {
        if (btn) btn.innerText = originalText;
        input.value = '';
    }
}

// Allocate Logic
async function handleWAAllocate() {
    const inboxId = document.getElementById('wa-allocate-inbox-id').value;
    const deptKey = document.getElementById('wa-allocate-dept').value;
    const title = document.getElementById('wa-allocate-title').value;

    // Feature: Hierarchy Fields
    const region = document.getElementById('wa-allocate-region').value;
    const section = document.getElementById('wa-allocate-section').value;

    if (!deptKey || !title) {
        alert("Please provide Department and Title.");
        return;
    }

    const payload = {
        deptKey: deptKey,
        resource: {
            title: title,
            date: new Date().toISOString().split('T')[0],
            fileName: "Allocated File", // In a real app, we'd copy the actual file/link
            region: region || "General",
            section: section || "General"
        },
        inboxId: inboxId || null
    };

    try {
        const res = await fetch('http://localhost:5001/allocate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
            alert("✅ Resource Allocated Successfully!");
            loadInbox();
        }
    } catch (e) {
        // Offline Fallback
        console.warn("Allocation failed, saving locally.");
        saveLocalResource(deptKey, payload.resource);

        // Remove from local inbox if needed
        if (inboxId) {
            let inbox = getLocalInbox();
            inbox = inbox.filter(i => i.id !== inboxId);
            saveLocalInbox(inbox);
        }

        alert("✅ Allocated Locally (Server Offline)");
        loadInbox();
    }
}

// Function to render resources on department pages
async function loadDepartmentResources(deptKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let resources = [];
    try {
        const response = await fetch(`http://localhost:5001/resources/${deptKey}`);
        if (!response.ok) throw new Error("Server Error");
        resources = await response.json();
    } catch (error) {
        // Offline fallback
        resources = getLocalResources(deptKey);
    }

    if (resources.length === 0) {
        container.innerHTML = `<p style="color: #888; font-style: italic;">No specific documents available yet.</p>`;
        return;
    }

    let html = `<ul class="resource-list" style="list-style: none; padding: 0;">`;
    resources.forEach(res => {
        // Show hierarchy tags if present
        const hierarchyTags = (res.region || res.section) ?
            `<small style="color: #666; display: block; margin-top: 2px;">${res.region || ''} ${res.section ? ' • ' + res.section : ''}</small>` : '';

        html += `
            <li style="background: #fff; padding: 15px; border: 1px solid #eee; margin-bottom: 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="display: block; color: var(--primary-color);">${res.title}</strong>
                    ${hierarchyTags}
                    <span style="font-size: 0.8rem; color: #999;">Uploaded: ${res.date}</span>
                </div>
                <a href="#" onclick="alert('Downloading: ${res.fileName}'); return false;" style="color: #fff; background: var(--primary-color); padding: 5px 12px; border-radius: 4px; text-decoration: none; font-size: 0.85rem;">Download</a>
            </li>
        `;
    });
    html += `</ul>`;

    container.innerHTML = html;
}

// --- ADMINISTRATION MANAGEMENT (Candidates & Pipeline) ---

async function updateDashboardStats() {
    try {
        const candRes = await fetch('http://localhost:5001/admin/candidates');
        const pipeRes = await fetch('http://localhost:5001/admin/pipeline');
        const candidates = await candRes.json();
        const pipeline = await pipeRes.json();
        
        const statCand = document.getElementById('stat-candidates');
        const statPipe = document.getElementById('stat-pipeline');
        const pipeTable = document.getElementById('dashboard-pipeline-table');
        
        if (statCand) statCand.innerText = candidates.length;
        if (statPipe) statPipe.innerText = pipeline.length;
        
        if (pipeTable) {
            pipeTable.innerHTML = '';
            pipeline.slice(0, 5).forEach(p => {
                let badgeClass = 'badge-active';
                if (p.status === 'Pending Review') badgeClass = 'badge-pending';
                if (p.status === 'Inactive') badgeClass = 'badge-danger';
                
                pipeTable.innerHTML += `
                    <tr>
                        <td>
                            <div style="font-weight: 600; color: var(--primary-color);">${p.name}</div>
                        </td>
                        <td>${p.type}</td>
                        <td><span class="badge ${badgeClass}">${p.status}</span></td>
                        <td>${new Date(p.timestamp).toLocaleDateString()}</td>
                        <td><button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;">Details</button></td>
                    </tr>
                `;
            });
        }
    } catch (e) {
        console.warn("Failed to load dashboard stats", e);
    }
}

async function loadCandidates() {
    const list = document.getElementById('candidates-list');
    if (!list) return;
    try {
        const res = await fetch('http://localhost:5001/admin/candidates');
        const data = await res.json();
        list.innerHTML = '';
        data.forEach(c => {
            list.innerHTML += `
                <tr>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.role}</td>
                    <td>${c.status}</td>
                    <td>${new Date(c.timestamp).toLocaleDateString()}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error loading candidates", e);
        list.innerHTML = '<tr><td colspan="4">Failed to load candidates (Offline)</td></tr>';
    }
}

async function handleAddCandidate(e) {
    const name = document.getElementById('cand-name').value;
    const role = document.getElementById('cand-role').value;
    const status = document.getElementById('cand-status').value;
    
    try {
        const res = await fetch('http://localhost:5001/admin/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role, status })
        });
        if (res.ok) {
            document.getElementById('add-candidate-form').reset();
            loadCandidates();
        }
    } catch (err) {
        alert('Failed to add candidate');
    }
}

async function loadPipeline() {
    const list = document.getElementById('pipeline-list');
    if (!list) return;
    try {
        const res = await fetch('http://localhost:5001/admin/pipeline');
        const data = await res.json();
        list.innerHTML = '';
        data.forEach(p => {
            list.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.type}</td>
                    <td>${p.status}</td>
                    <td>${new Date(p.timestamp).toLocaleDateString()}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error("Error loading pipeline", e);
        list.innerHTML = '<tr><td colspan="4">Failed to load pipeline (Offline)</td></tr>';
    }
}

async function handleAddPipeline(e) {
    const name = document.getElementById('pipe-name').value;
    const type = document.getElementById('pipe-type').value;
    const status = document.getElementById('pipe-status').value;
    
    try {
        const res = await fetch('http://localhost:5001/admin/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, status })
        });
        if (res.ok) {
            document.getElementById('add-pipeline-form').reset();
            loadPipeline();
        }
    } catch (err) {
        alert('Failed to add pipeline item');
    }
}

// Auto-run when switching to inbox view
window.switchView = switchView;
window.handleAddCandidate = handleAddCandidate;
window.handleAddPipeline = handleAddPipeline;
