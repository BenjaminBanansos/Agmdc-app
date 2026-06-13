
const express = require('express');
console.log("🚀 Starting AGMDC Backend Script...");
// const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); // WA Disabled
// const qrcode = require('qrcode-terminal'); // WA Disabled
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// --- Database Logic (JSON File) ---
const DB_FILE = path.join(__dirname, 'db.json');

function loadDb() {
    if (!fs.existsSync(DB_FILE)) return { inbox: [], candidates: [], pipeline: [], hierarchy: [] };
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        const json = JSON.parse(data);
        if (!json.inbox) json.inbox = [];
        if (!json.candidates) json.candidates = [];
        if (!json.pipeline) json.pipeline = [];
        if (!json.hierarchy) json.hierarchy = [];
        return json;
    } catch (err) {
        return { inbox: [], candidates: [], pipeline: [], hierarchy: [] };
    }
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 4));
}

const imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

// --- EMAIL CONFIGURATION (PLACEHOLDER) ---
const emailConfig = {
    imap: {
        user: 'your-email@gmail.com',
        password: 'your-app-password',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

// --- API Endpoints ---

// 1. Send Message (Disabled Check)
app.post('/send', async (req, res) => {
    return res.status(503).json({ status: 'error', message: 'WhatsApp integration is currently paused.' });
});

// 2. Allocate Resource (and Remove from Inbox if applicable)
app.post('/allocate', (req, res) => {
    const { deptKey, resource, inboxId } = req.body;

    if (!deptKey || !resource) {
        return res.status(400).json({ status: 'error', message: 'Missing data' });
    }

    const db = loadDb();
    if (!db[deptKey]) {
        db[deptKey] = [];
    }
    db[deptKey].push(resource);

    // If allocated from inbox, remove it from inbox list
    if (inboxId && db.inbox) {
        db.inbox = db.inbox.filter(item => item.id !== inboxId);
    }

    saveDb(db);

    res.json({ status: 'success', message: 'Resource saved to backend database.' });
});

// 3. Get Dept Resources
app.get('/resources/:deptKey', (req, res) => {
    const { deptKey } = req.params;
    const db = loadDb();
    const resources = db[deptKey] || [];
    res.json(resources);
});

// 4. Get Inbox
app.get('/inbox', (req, res) => {
    const db = loadDb();
    res.json(db.inbox || []);
});

// --- Administration Endpoints ---

// Candidates
app.get('/admin/candidates', (req, res) => {
    const db = loadDb();
    res.json(db.candidates || []);
});

app.post('/admin/candidates', (req, res) => {
    const db = loadDb();
    const candidate = { id: `cand_${Date.now()}`, ...req.body, timestamp: new Date().toISOString() };
    db.candidates.push(candidate);
    saveDb(db);
    res.json({ status: 'success', candidate });
});

// Pipeline
app.get('/admin/pipeline', (req, res) => {
    const db = loadDb();
    res.json(db.pipeline || []);
});

app.post('/admin/pipeline', (req, res) => {
    const db = loadDb();
    const project = { id: `proj_${Date.now()}`, ...req.body, timestamp: new Date().toISOString() };
    db.pipeline.push(project);
    saveDb(db);
    res.json({ status: 'success', project });
});

// Hierarchy
app.get('/admin/hierarchy', (req, res) => {
    const db = loadDb();
    res.json(db.hierarchy || []);
});

app.post('/admin/hierarchy', (req, res) => {
    const db = loadDb();
    // Assuming req.body is the entire updated hierarchy array
    db.hierarchy = req.body;
    saveDb(db);
    res.json({ status: 'success', hierarchy: db.hierarchy });
});


// 5. TEST ENDPOINT: Simulate Incoming Email
app.post('/test/simulate-email', (req, res) => {
    const db = loadDb();

    // Create dummy file
    const timestamp = Date.now();
    const filename = `dummy_email_attachment_${timestamp}.txt`;
    const filepath = path.join(__dirname, 'uploads', filename);

    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
    }
    fs.writeFileSync(filepath, "This is a dummy attachment content for testing.");

    const dummyEmail = {
        id: `email_${timestamp}`,
        source: 'email',
        sender: "test.sender@example.com",
        filename: filename,
        mimetype: "text/plain",
        timestamp: new Date().toISOString(),
        caption: "Subject: Urgent: Quarterly Financial Report Payment"
    };

    db.inbox.push(dummyEmail);
    saveDb(db);

    console.log(`✅ Simulated email received: ${filename}`);
    res.json({ status: 'success', message: 'Dummy email received.' });
});

// 6. MANAGE UPLOADS
app.post('/test/upload-to-inbox', async (req, res) => {
    const { filename, mimetype, data, caption } = req.body;

    if (!filename || !data) {
        return res.status(400).json({ status: 'error', message: 'Missing file data' });
    }

    try {
        const timestamp = Date.now();
        const safeFilename = `manual_${timestamp}_${filename}`;
        const filepath = path.join(__dirname, 'uploads', safeFilename);

        if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
            fs.mkdirSync(path.join(__dirname, 'uploads'));
        }

        // Decode Base64 and Save
        fs.writeFileSync(filepath, data, 'base64');

        const db = loadDb();
        const inboxItem = {
            id: `manual_${timestamp}`,
            source: 'upload', // Mark as manually uploaded
            sender: "Admin Upload",
            filename: safeFilename,
            mimetype: mimetype || 'application/octet-stream',
            timestamp: new Date().toISOString(),
            caption: caption || "(Manual Upload)"
        };

        db.inbox.push(inboxItem);
        saveDb(db);

        console.log(`✅ Manual file added to inbox: ${safeFilename}`);
        res.json({ status: 'success', message: 'File added to inbox' });

    } catch (e) {
        console.error("Upload error:", e);
        res.status(500).json({ status: 'error', message: 'Server upload failed' });
    }
});


app.listen(PORT, () => {
    console.log(`\n🚀 Node.js Backend running on http://localhost:${PORT}`);
    console.log(`Ready for Inbox & Email Simulation.`);
});
