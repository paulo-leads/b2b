# WhatsApp CRM - Refúgio Laguna V8.5

Sistema de CRM e automação para WhatsApp com integração à Meta API.

## 🚀 Deploy Gratuito na Nuvem

### Opção 1: Render (100% Gratuito)

**Vantagens:**
- ✅ Plano free ilimitado
- ✅ SSL automático
- ✅ Deploy contínuo do GitHub
- ✅ Domínio gratuito *.onrender.com

**Passo a passo:**

1. Crie conta em https://render.com
2. Clique em "New +" → "Blueprint"
3. Conecte seu repositório GitHub
4. O Render lerá automaticamente o arquivo `render.yaml`
5. Configure as variáveis sensíveis no painel:
   - `WHATSAPP_TOKEN`
   - `PHONE_NUMBER_ID`
   - `WABA_ID`
   - `PUBLIC_URL` (use a URL gerada pelo Render)
6. Clique em "Apply" e aguarde o deploy

**URL da aplicação:** `https://refugio-laguna-crm.onrender.com`

---

### Opção 2: Railway (Plano Free com $5/mês)

**Vantagens:**
- ✅ $5 de crédito mensal gratuito
- ✅ 500 horas de execução/mês
- ✅ SSL automático
- ✅ Domínio gratuito *.railway.app

**Passo a passo:**

1. Crie conta em https://railway.app
2. Clique em "New Project" → "Deploy from GitHub repo"
3. Selecione este repositório
4. Railway detectará automaticamente o Node.js
5. Na aba "Variables", configure:
   ```
   WHATSAPP_TOKEN=seu_token_aqui
   PHONE_NUMBER_ID=seu_id_aqui
   WABA_ID=seu_waba_id_aqui
   PUBLIC_URL=https://seu-projeto.railway.app
   VERIFY_TOKEN=ragazzi_verify_2026
   ADMIN_USER=Ragazzi
   ADMIN_PASS=Operador01
   ```
6. Adicione um volume persistente para o SQLite:
   - Clique em "+" → "Volume"
   - Mount path: `/workspace/database`
   - Size: 1 GB
7. Aguarde o deploy automático

**URL da aplicação:** `https://seu-projeto.railway.app`

---

## 🖥️ Rodar Localmente

### Pré-requisitos
- Node.js >= 18.0.0
- npm ou yarn

### Instalação

```bash
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3011
WHATSAPP_TOKEN=seu_token_whatsapp
PHONE_NUMBER_ID=seu_phone_number_id
WABA_ID=seu_waba_id
VERIFY_TOKEN=ragazzi_verify_2026
PUBLIC_URL=seudominio.com
ADMIN_USER=Ragazzi
ADMIN_PASS=Operador01
```

### Execução

```bash
npm start
```

Acesse em: `http://localhost:3011`

---

## 📁 Estrutura do Projeto

```
├── server.js              # Backend Node.js
├── public/                # Frontend estático
│   ├── index.html         # Dashboard completo
│   └── uploads/           # Uploads de mídia
├── database/              # Banco de dados SQLite
├── knowledge_base/        # Base de conhecimento
├── package.json           # Dependências
├── render.yaml            # Configuração Render
├── railway.toml           # Configuração Railway
└── .env.example           # Modelo de variáveis
```

---

## 🔧 APIs Disponíveis

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/health` | Health check do servidor |
| `GET /api/leads` | Listar todos os leads |
| `POST /api/leads` | Criar novo lead |
| `PUT /api/leads/:id` | Atualizar lead |
| `DELETE /api/leads/:id` | Remover lead |
| `GET /api/messages/:phone` | Histórico de mensagens |
| `POST /api/send/text` | Enviar mensagem de texto |
| `POST /api/send/media` | Enviar mídia |
| `GET /api/templates` | Listar templates |
| `POST /api/templates` | Criar template |
| `GET /api/knowledge` | Base de conhecimento |
| `POST /api/knowledge` | Adicionar conhecimento |
| `POST /webhook` | Webhook do WhatsApp |

---

## 🔐 Autenticação

O sistema usa autenticação básica HTTP:
- **Usuário:** `Ragazzi`
- **Senha:** `Operador01`

⚠️ **Importante:** Altere essas credenciais em produção!

---

## 📊 Recursos do Frontend

- 📋 Dashboard com métricas em tempo real
- 👥 Lista de leads com filtros e busca
- 💬 Chat integrado com WhatsApp
- 📤 Disparos em massa
- 📝 Templates de mensagens
- 📚 Base de conhecimento com IA
- 📈 Relatórios e estatísticas

---

## ⚠️ Notas Importantes

1. **GitHub Pages:** Só suporta conteúdo estático. Use Render ou Railway para o backend completo.
2. **SQLite em Produção:** Para alta escala, considere migrar para PostgreSQL.
3. **Webhook WhatsApp:** Configure a URL do webhook no Meta Developer Console usando sua URL pública.
4. **Variáveis Sensíveis:** Nunca commitar o arquivo `.env` no GitHub!

---

## 🆘 Suporte

Em caso de dúvidas, consulte a documentação da Meta:
- https://developers.facebook.com/docs/whatsapp/cloud-api
