# 🚀 GUIA COMPLETO DE DEPLOY GRATUITO

## Comparativo: Render vs Railway

| Recurso | Render | Railway |
|---------|--------|---------|
| **Plano Gratuito** | ✅ Ilimitado | ✅ $5 crédito/mês |
| **Horas de Execução** | Ilimitadas (com sleep após 15min inatividade) | 500 horas/mês |
| **Memória RAM** | 512 MB | 1 GB |
| **Armazenamento** | 1 GB (disco persistente) | 1 GB (volume) |
| **SSL/HTTPS** | ✅ Automático | ✅ Automático |
| **Domínio** | *.onrender.com | *.railway.app |
| **Deploy Contínuo** | ✅ GitHub integration | ✅ GitHub integration |
| **Wake-up Time** | ~30-50 segundos | Instantâneo |

---

## 🎯 OPÇÃO 1: RENDER (Recomendado para Uso Contínuo)

### Vantagens do Render:
- **100% gratuito** sem limite de horas
- Ideal para aplicações que precisam estar sempre online
- Configuração automática via `render.yaml`

### Passo a Passo Detalhado:

#### 1. Preparação no GitHub
```bash
# Certifique-se de que seu repositório tem:
- server.js
- package.json
- render.yaml (já criado!)
- .gitignore (já criado!)
```

#### 2. Criar Conta no Render
1. Acesse https://render.com
2. Clique em **"Get Started for Free"**
3. Faça login com sua conta do GitHub
4. Autorize o acesso aos seus repositórios

#### 3. Criar o Serviço
1. No dashboard, clique em **"New +"** → **"Blueprint"**
2. Selecione **"Connect a repository"**
3. Escolha seu repositório do GitHub
4. O Render detectará automaticamente o arquivo `render.yaml`

#### 4. Configurar Variáveis Sensíveis
No painel do Render, vá em **"Environment"** e adicione:

| Chave | Valor |
|-------|-------|
| `WHATSAPP_TOKEN` | `EAAG...` (seu token da Meta) |
| `PHONE_NUMBER_ID` | `123456789012345` |
| `WABA_ID` | `987654321098765` |
| `PUBLIC_URL` | `https://refugio-laguna-crm.onrender.com` |
| `VERIFY_TOKEN` | `ragazzi_verify_2026` |
| `ADMIN_USER` | `Ragazzi` |
| `ADMIN_PASS` | `Operador01` |

⚠️ **Importante:** As variáveis marcadas como `sync: false` no `render.yaml` devem ser configuradas manualmente!

#### 5. Deploy
1. Clique em **"Apply"**
2. Aguarde o build (~2-5 minutos)
3. Quando aparecer **"Live"**, clique na URL

#### 6. Configurar Webhook no Meta
1. Acesse https://developers.facebook.com
2. Vá em **WhatsApp → Configuration**
3. Em **Webhook**, clique em **"Edit"**
4. Callback URL: `https://refugio-laguna-crm.onrender.com/webhook`
5. Verify Token: `ragazzi_verify_2026`
6. Subscribe aos eventos: `messages`, `message_template_status_update`

---

## 🎯 OPÇÃO 2: RAILWAY (Recomendado para Testes)

### Vantagens do Railway:
- **Mais rápido** para deploy inicial
- Interface mais intuitiva
- Melhor para desenvolvimento e testes
- $5 de crédito gratuito (suficiente para ~500 horas)

### Passo a Passo Detalhado:

#### 1. Criar Conta no Railway
1. Acesse https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com GitHub
4. Autorize o acesso

#### 2. Deploy do Repositório
1. Clique em **"New Project"** → **"Deploy from GitHub repo"**
2. Selecione seu repositório
3. Railway detectará automaticamente que é Node.js

#### 3. Configurar Variáveis de Ambiente
Na aba **"Variables"** do seu projeto, adicione:

```env
NODE_VERSION=18
PORT=3011
WHATSAPP_TOKEN=EAAG...
PHONE_NUMBER_ID=123456789012345
WABA_ID=987654321098765
VERIFY_TOKEN=ragazzi_verify_2026
PUBLIC_URL=https://seu-projeto.railway.app
ADMIN_USER=Ragazzi
ADMIN_PASS=Operador01
```

#### 4. Adicionar Volume Persistente (SQLite)
1. Clique em **"+"** abaixo do seu serviço
2. Selecione **"Volume"**
3. Configure:
   - **Mount Path:** `/workspace/database`
   - **Size:** 1 GB
4. Clique em **"Add Volume"**

#### 5. Configurar Domínio Público
1. Vá em **"Settings"** → **"Domains"**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada (ex: `refugio-laguna-crm-production.up.railway.app`)
4. Atualize a variável `PUBLIC_URL` com esta URL

#### 6. Deploy e Webhook
1. Aguarde o deploy automático (~2-3 minutos)
2. Quando estiver **"Running"**, teste acessando a URL
3. Configure o webhook no Meta Developer Console:
   - Callback URL: `https://seu-projeto.railway.app/webhook`
   - Verify Token: `ragazzi_verify_2026`

---

## 🔧 Resolução de Problemas Comuns

### Problema: "Build Failed" no Render/Railway
**Solução:**
```bash
# Verifique se o package.json está correto
cat package.json

# Deve ter:
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Problema: Banco de Dados não Persiste
**Solução:**
- **Render:** O disco já está configurado no `render.yaml`
- **Railway:** Adicione um volume conforme passo 4 acima

### Problema: Webhook não Funciona
**Solução:**
1. Verifique se `PUBLIC_URL` está correto
2. Teste o endpoint: `curl https://sua-url.com/api/health`
3. No Meta, use o mesmo `VERIFY_TOKEN` do `.env`
4. Verifique os logs do servidor

### Problema: Servidor "Dorme" no Render
**Explicação:** No plano free, o Render coloca o servidor em sleep após 15min de inatividade.
**Solução:**
- Use um serviço de uptime (ex: UptimeRobot) para fazer ping a cada 10min
- Ou migre para Railway para testes mais rápidos

---

## 📊 Monitoramento

### Health Check
Acesse: `https://sua-url.com/api/health`

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-07-20T11:18:19.175Z",
  "version": "8.5.0"
}
```

### Logs em Tempo Real
- **Render:** Dashboard → Logs
- **Railway:** Projeto → Deploy → View Logs

---

## 💡 Dicas de Otimização

1. **Use variáveis de ambiente** para tudo que for sensível
2. **Nunca commitar** `.env` no GitHub
3. **Teste localmente** antes de fazer deploy
4. **Monitore o uso** no dashboard do serviço
5. **Configure backups** do banco de dados periodicamente

---

## 🆘 Precisa de Ajuda?

- Documentação Render: https://render.com/docs
- Documentação Railway: https://docs.railway.app
- Meta WhatsApp API: https://developers.facebook.com/docs/whatsapp

---

**✅ Pronto!** Seu sistema estará rodando gratuitamente na nuvem!
