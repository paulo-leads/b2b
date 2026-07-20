# 🚀 Deploy no Railway - Guia Passo a Passo

## ✅ Pré-requisitos
- Conta no GitHub (seu código já está versionado)
- Conta no Railway (gratuita)
- Tokens do WhatsApp Business API

---

## 📋 Passo 1: Preparar o Repositório GitHub

### 1.1 Verifique se os arquivos estão no repositório
Certifique-se de que estes arquivos estão no seu repositório GitHub:
- `server.js` (backend principal)
- `package.json` (dependências)
- `railway.toml` (configuração Railway - JÁ CRIADO!)
- `public/index.html` (frontend)
- `database/` (banco de dados SQLite)
- `knowledge_base/` (base de conhecimento)

### 1.2 Faça push para o GitHub (se ainda não fez)
```bash
cd /workspace
git add .
git commit -m "Configuração completa para deploy no Railway"
git push origin main
```

---

## 📋 Passo 2: Criar Projeto no Railway

### 2.1 Acesse o Railway
1. Vá para https://railway.app
2. Clique em **"Sign Up"** e use sua conta do GitHub
3. Após login, clique em **"New Project"**

### 2.2 Conecte ao GitHub
1. Selecione **"Deploy from GitHub repo"**
2. Escolha **"Connect GitHub"** se for a primeira vez
3. Autorize o Railway a acessar seus repositórios
4. Selecione o repositório do seu projeto

---

## 📋 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Acesse as Variáveis
1. No painel do projeto, clique em **"Variables"**
2. Clique em **"+ New Variable"** para cada uma abaixo

### 3.2 Adicione estas variáveis OBRIGATÓRIAS:

| Variável | Valor | Onde obter |
|----------|-------|------------|
| `WHATSAPP_TOKEN` | `EAA...` | Meta Developers → App → WhatsApp → Settings |
| `PHONE_NUMBER_ID` | `123456789` | Meta Developers → WhatsApp → Phone Numbers |
| `WABA_ID` | `987654321` | Meta Developers → Business Settings |
| `VERIFY_TOKEN` | `ragazzi_verify_2026` | (já configurado no railway.toml) |
| `ADMIN_USER` | `Ragazzi` | (já configurado) |
| `ADMIN_PASS` | `Operador01` | (já configurado) |
| `PUBLIC_URL` | *deixe vazio por enquanto* | Será preenchido após deploy |

### 3.3 Como obter os tokens do WhatsApp:
1. Acesse https://developers.facebook.com
2. Vá em **"My Apps"** → Selecione seu app
3. Menu lateral: **WhatsApp** → **Settings**
4. Copie:
   - **Temporary Access Token** (para testes) ou **Permanent Token** (produção)
   - **Phone Number ID**
   - **WhatsApp Business Account ID (WABA)**

---

## 📋 Passo 4: Aguardar Deploy Automático

### 4.1 O Railway fará automaticamente:
- ✅ Detectar que é projeto Node.js
- ✅ Instalar dependências (`npm install`)
- ✅ Build com Nixpacks
- ✅ Iniciar servidor (`npm start`)

### 4.2 Acompanhe o deploy:
1. Na aba **"Deployments"**, veja o log em tempo real
2. Aguarde até aparecer **"SUCCESS"**
3. O Railway gerará uma URL pública: `https://seu-projeto.up.railway.app`

---

## 📋 Passo 5: Configurar URL Pública

### 5.1 Pegue a URL gerada
1. No topo do painel, copie a URL (ex: `https://meu-app-production.up.railway.app`)

### 5.2 Atualize a variável PUBLIC_URL
1. Volte em **"Variables"**
2. Edite `PUBLIC_URL` e cole a URL completa (com https://)

### 5.3 Configure Webhook no WhatsApp
1. Meta Developers → WhatsApp → Configuration
2. Em **"Webhooks"**, clique em **"Edit"**
3. Callback URL: `https://SEU_PROJETO.up.railway.app/webhook`
4. Verify Token: `ragazzi_verify_2026`
5. Subscribe aos eventos: `messages`, `message_deliveries`

---

## 📋 Passo 6: Testar a Aplicação

### 6.1 Acesse o Frontend
- URL: `https://SEU_PROJETO.up.railway.app`
- Login: `Ragazzi` / `Operador01`

### 6.2 Teste as funcionalidades:
- ✅ Dashboard com estatísticas
- ✅ Lista de leads
- ✅ Chat individual
- ✅ Disparos em massa
- ✅ Templates
- ✅ Base de conhecimento

### 6.3 Teste o Webhook
Envie uma mensagem para seu número do WhatsApp e veja se aparece no dashboard.

---

## 🔧 Plano Gratuito do Railway

### O que está incluso:
- 💰 **$5 de crédito mensal** (suficiente para ~500 horas)
- 🚀 **1 GB RAM** por instância
- 💾 **Volume persistente** para banco de dados SQLite
- 🔒 **SSL automático** (HTTPS)
- 🌐 **Domínio gratuito** (*.up.railway.app)
- ⚡ **Deploy contínuo** (atualiza ao fazer push no GitHub)

### Dicas para economizar créditos:
- Desligue o projeto quando não estiver usando (botão "Stop")
- Use apenas 1 réplica (já configurado)
- Monitore o uso na aba "Usage"

---

## 🆘 Solução de Problemas

### ❌ Erro: "Port not specified"
**Solução:** O Railway define a porta automaticamente. Verifique se `server.js` usa `process.env.PORT`.

### ❌ Erro: "Module not found"
**Solução:** Execute `npm install` localmente e faça push do `package-lock.json`.

### ❌ Erro: "Database not found"
**Solução:** O Railway cria volumes persistentes automaticamente. Verifique se o caminho do SQLite está correto.

### ❌ Webhook não funciona
**Solução:** 
1. Verifique se `PUBLIC_URL` está correta
2. Confirme se o verify token bate com o configurado
3. Teste a URL `/api/health` no navegador

---

## 📞 Suporte

- Documentação Railway: https://docs.railway.app
- Discord da comunidade: https://discord.gg/railway
- Meta Developers: https://developers.facebook.com/support

---

**🎉 Pronto! Seu sistema está rodando gratuitamente no Railway!**
