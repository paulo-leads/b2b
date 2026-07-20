require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// ==========================================
// VARIÁVEIS DE AMBIENTE
// ==========================================
const PORT = process.env.PORT || 3011;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WABA_ID = process.env.WABA_ID; // NOVO: ID da Conta do WhatsApp (WABA)
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ragazzi_verify_2026";
const PUBLIC_URL = process.env.PUBLIC_URL || "ragazzi.clonedocorretor.com";
const ADMIN_USER = process.env.ADMIN_USER || "Ragazzi";
const ADMIN_PASS = process.env.ADMIN_PASS || "Operador01";
const FACADE_URL = process.env.PUBLIC_URL;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = req.path.includes('knowledge') ? 'knowledge_base' : 'public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});

const upload = multer({ storage });
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', (req, res, next) => {
    if (req.hostname === FACADE_URL) return res.sendFile(path.join(__dirname, 'public/index.html'));
    next();
});

app.use((req, res, next) => {
    if (req.path === '/webhook' || req.path.startsWith('/api/webhook') || req.path.startsWith('/uploads') || req.path.startsWith('/api/media')) return next();
    if (req.hostname === FACADE_URL) return next();
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
    if (login && password && login === ADMIN_USER && password === ADMIN_PASS) return next();
    res.set('WWW-Authenticate', 'Basic realm="REFUGIO LAGUNA V8.5 - AREA RESTRITA"');
    res.status(401).send('🔒 ACESSO NEGADO.');
});

app.use(express.static(path.join(__dirname, 'public')));
let db;

app.post('/api/webhook/erp', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer refugiolaguna_erp_integra_2026') return res.status(401).json({ error: 'Não Autorizado - Token Inválido' });
    console.log(`\n🚀 [ERP WEBHOOK RECEBIDO] Evento: ${req.body.evento || 'Desconhecido'}`);
    res.status(200).json({ success: true, message: "Payload recebido." });
});

// ==============================================================
// 🔥 GERENCIADOR DE TEMPLATES (META API)
// ==============================================================
app.get('/api/templates', async (req, res) => {
    try {
        if (!WABA_ID) return res.status(400).json({ error: "WABA_ID não configurado no .env" });
        const response = await axios.get(`https://graph.facebook.com/v19.0/${WABA_ID}/message_templates?limit=50`, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
        });
        res.json({ success: true, data: response.data.data });
    } catch (e) {
        res.status(500).json({ success: false, error: e.response?.data || e.message });
    }
});

app.post('/api/templates', async (req, res) => {
    try {
        if (!WABA_ID) return res.status(400).json({ error: "WABA_ID não configurado no .env" });
        const response = await axios.post(`https://graph.facebook.com/v19.0/${WABA_ID}/message_templates`, req.body, {
            headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' }
        });
        res.json({ success: true, data: response.data });
    } catch (e) {
        res.status(400).json({ success: false, error: e.response?.data || e.message });
    }
});

// ==============================================================
// 🔥 RADAR DE ERROS DA META INJETADO
// ==============================================================
async function sendWhatsAppMessage(data) {
    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
    try {
        let content = data.type === 'text' ? data.text.body : (data.type === 'template' ? `Template: ${data.template.name}` : (data[data.type]?.link || `[Mídia: ${data.type}]`));

        await db.run(`INSERT INTO leads (phone, name, last_message_at, status) VALUES (?, NULL, CURRENT_TIMESTAMP, 'frio') ON CONFLICT(phone) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP`, [data.to]);
        await db.run(`INSERT INTO messages (lead_phone, direction, type, content) VALUES (?, 'outbound', ?, ?)`, [data.to, data.type, content]);

        const res = await axios.post(url, data, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } });

        console.log(`✅ [DISPARO OK] Alvo: ${data.to} | Template: ${data.template?.name || 'Texto'}`);
        return { success: true };
    } catch (error) {
        console.error(`\n❌ [ERRO DE DISPARO NA META API]`);
        console.error(`💀 Alvo: ${data.to}`);
        console.error(`💀 Motivo do bloqueio:`, JSON.stringify(error.response?.data || error.message, null, 2));
        return { success: false };
    }
}

(async () => {
    db = await open({ filename: path.join(__dirname, 'database', 'leads.db'), driver: sqlite3.Database });
    await db.exec(`CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT NOT NULL UNIQUE, name TEXT, status TEXT DEFAULT 'novo', last_message_at DATETIME, ai_active BOOLEAN DEFAULT 1)`);
    await db.exec(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, lead_phone TEXT NOT NULL, wa_message_id TEXT, direction TEXT NOT NULL, type TEXT NOT NULL, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);
})();

app.get('/api/leads', async (req, res) => {
    try {
        const leads = await db.all(`
            SELECT l.*,
            (SELECT content FROM messages m WHERE m.lead_phone = l.phone ORDER BY timestamp DESC LIMIT 1) as last_message
            FROM leads l
            WHERE l.status != 'morto'
            ORDER BY l.last_message_at DESC
        `);
        res.json({ leads });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/leads/:phone/messages', async (req, res) => res.json(await db.all('SELECT * FROM messages WHERE lead_phone = ? ORDER BY timestamp ASC', [req.params.phone])));
app.post('/api/leads/:phone/toggle_ai', async (req, res) => { await db.run(`UPDATE leads SET ai_active = ? WHERE phone = ?`, [req.body.ai_active ? 1 : 0, req.params.phone]); res.json({ success: true }); });
app.post('/api/leads/:phone/mark_read', async (req, res) => { await db.run(`UPDATE leads SET status = 'lido' WHERE phone = ? AND status = 'respondido'`, [req.params.phone]); res.json({ success: true }); });

app.get('/api/knowledge', (req, res) => {
    try {
        const dir = 'knowledge_base';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        res.json({ files: fs.readdirSync(dir).filter(f => !f.startsWith('.') && !fs.statSync(path.join(dir, f)).isDirectory()) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/knowledge/:file', (req, res) => {
    try {
        const filePath = path.join('knowledge_base', req.params.file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.post('/api/knowledge/upload', upload.single('file'), (req, res) => res.json({ success: true }));

// ==============================================================
// 🔥 MOTOR DE DISPARO (MASTIGADOR DE CSV INJETADO)
// ==============================================================
app.post('/api/hunt/batch', async (req, res) => {
    const { phones, templateName, imageUrl } = req.body;

    if (!phones) return res.status(400).json({ success: false, error: "Lista vazia." });

    let lines = [];
    if (Array.isArray(phones)) {
        lines = phones;
    } else if (typeof phones === 'string') {
        lines = phones.split('\n');
    }

    const validLines = lines.map(l => typeof l === 'string' ? l.trim() : '').filter(l => l.length > 0);
    if (validLines.length === 0) return res.status(400).json({ success: false, error: "Nenhum dado válido." });

    res.json({ success: true, message: `Processo iniciado para ${validLines.length} alvos.` });

    (async () => {
        for (const line of validLines) {
            const parts = line.split(',').map(p => p.trim());

            let phone = parts[0].replace(/\D/g, '');
            if (!phone) continue;
            if (!phone.startsWith('55')) phone = '55' + phone;

            const variables = parts.slice(1);

            let d = {
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "pt_BR" }
                }
            };

            let components = [];

            if (imageUrl) {
                components.push({
                    "type": "header",
                    "parameters": [{"type": "image", "image": { "link": imageUrl }}]
                });
            }

            if (variables.length > 0) {
                components.push({
                    "type": "body",
                    "parameters": variables.map(v => ({ "type": "text", "text": v }))
                });
            }

            if (components.length > 0) {
                d.template.components = components;
            }

            await sendWhatsAppMessage(d);
            await new Promise(r => setTimeout(r, 1200));
        }
    })();
});

app.post('/api/actions/last_chance_blast', async (req, res) => {
    const targets = await db.all(`SELECT phone FROM leads WHERE status = 'respondido' AND last_message_at >= datetime('now', '-23 hours')`);
    for (const t of targets) { await sendWhatsAppMessage({ messaging_product: "whatsapp", to: t.phone, type: "text", text: { body: req.body.message } }); await new Promise(r => setTimeout(r, 800)); }
    res.json({ success: true });
});

app.post('/api/send/text', async (req, res) => res.json(await sendWhatsAppMessage({ messaging_product: "whatsapp", to: req.body.phone, type: "text", text: { body: req.body.message } })));

app.post('/api/send/media', upload.single('file'), async (req, res) => {
    try {
        let t = req.file.mimetype.split('/')[0];
        let finalFilename = req.file.filename;
        if (t === 'application' || t === 'text') t = 'document';
        if (t === 'voice') t = 'audio';
        let mediaData = { link: `https://${PUBLIC_URL}/uploads/${finalFilename}` };
        if (t === 'document' || t === 'video') mediaData.caption = req.file.originalname;
        const result = await sendWhatsAppMessage({ messaging_product: "whatsapp", to: req.body.phone, type: t, [t]: mediaData });
        res.json(result);
    } catch (e) { res.status(500).json({ success: false }); }
});

app.get('/api/media/:media_id', async (req, res) => {
    try {
        const u = await axios.get(`https://graph.facebook.com/v19.0/${req.params.media_id}`, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } });
        const m = await axios.get(u.data.url, { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }, responseType: 'stream' });
        res.setHeader('Content-Type', m.headers['content-type'] || 'application/octet-stream');
        m.data.pipe(res);
    } catch (e) { res.status(500).send("Erro na mídia."); }
});

app.get('/api/export/csv', async (req, res) => {
    try {
        const leads = await db.all(`SELECT phone, name, status, datetime(last_message_at, 'localtime') as data_contato FROM leads ORDER BY last_message_at DESC`);
        let csv = '\uFEFFTelefone,Nome,Status,Último Contato\n';
        leads.forEach(l => {
            const safeName = l.name ? l.name.replace(/,/g, '') : 'Desconhecido';
            csv += `${l.phone},${safeName},${l.status},${l.data_contato}\n`;
        });
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment('dossie_alvos.csv');
        res.send(csv);
    } catch (e) { res.status(500).send('Erro na extração dos dados.'); }
});

app.get('/webhook', (req, res) => {
    const token = req.query['hub.verify_token'] || res.query?.['hub.verify_token'];
    token === VERIFY_TOKEN ? res.send(req.query['hub.challenge']) : res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
    res.sendStatus(200);
    try {
        const body = req.body;

        // 🔥 BARREIRA DE ISOLAMENTO WABA (PREVENÇÃO DE CROSS-TALK)
        const payloadValue = body.entry?.[0]?.changes?.[0]?.value;
        if (payloadValue && payloadValue.metadata && payloadValue.metadata.phone_number_id) {
            if (payloadValue.metadata.phone_number_id !== process.env.PHONE_NUMBER_ID) {
                // Se o pacote não for para o nosso número (PHONE_NUMBER_ID do container atual), dropa silenciosamente.
                return; 
            }
        }

        // 🔥 CAPTURA DE STATUS DE TEMPLATE (Aprovação/Rejeição)
        const changeField = body.entry?.[0]?.changes?.[0]?.field;
        if (changeField === 'message_template_status_update') {
            const tmpl = body.entry[0].changes[0].value;
            console.log(`\n🔔 [ALERTA META] Template: ${tmpl.message_template_name} | Evento: ${tmpl.event} | Razão: ${tmpl.reason || 'N/A'}`);
            return;
        }

        if (body.entry?.[0]?.changes?.[0]?.value?.statuses) return;

        if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            const val = body.entry[0].changes[0].value;
            const msg = val.messages[0];
            const from = msg.from;
            const profileName = val.contacts?.[0]?.profile?.name || "Desconhecido";

            await db.run(`INSERT INTO leads (phone, name, last_message_at, status) VALUES (?, ?, CURRENT_TIMESTAMP, 'respondido') ON CONFLICT(phone) DO UPDATE SET last_message_at = CURRENT_TIMESTAMP, name = excluded.name, status = 'respondido'`, [from, profileName]);

            let content = '';
            if (msg.type === 'text') {
                content = msg.text.body;
            } else if (['image', 'video', 'audio', 'voice', 'document', 'sticker'].includes(msg.type)) {
                const mediaId = msg[msg.type]?.id;
                const caption = msg[msg.type]?.caption || '';
                content = mediaId ? `${caption} /api/media/${mediaId}`.trim() : `[Mídia: ${msg.type}]`;
            } else if (msg.type === 'contacts') {
                const cName = msg.contacts?.[0]?.name?.formatted_name || "Contato";
                const cPhone = msg.contacts?.[0]?.phones?.[0]?.phone || "";
                content = `[Cartão de Contato recebido: ${cName} | ${cPhone}]`;
            } else if (msg.type === 'button') {
                content = `[Botão Clicado]: ${msg.button.text}`;
            } else if (msg.type === 'interactive') {
                if (msg.interactive.type === 'button_reply') {
                    content = `[Botão Interativo]: ${msg.interactive.button_reply.title}`;
                } else if (msg.interactive.type === 'list_reply') {
                    content = `[Opção de Lista]: ${msg.interactive.list_reply.title}`;
                } else {
                    content = `[Interação não mapeada]`;
                }
            } else {
                content = `[Formato não suportado: ${msg.type}]`;
            }

            await db.run(`INSERT INTO messages (lead_phone, wa_message_id, direction, type, content) VALUES (?, ?, 'inbound', ?, ?)`, [from, msg.id, msg.type, content]);
            console.log(`📩 [MENSAGEM RECEBIDA] De: ${from} | Tipo: ${msg.type} | Conteúdo: ${content}`);
        }
    } catch(err) {
        console.error("💀 [ERRO CRÍTICO NO WEBHOOK]:", err.message);
    }
});

// Endpoint de Health Check para monitoramento
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '8.5.0' });
});

app.listen(PORT, () => console.log(`🚀 OPERAÇÃO MANUAL BLINDADA - PORTA ${PORT}`));
