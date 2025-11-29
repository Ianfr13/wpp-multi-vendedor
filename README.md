# WPP Connect - Sistema Multi-Vendedor

Sistema completo de gerenciamento WhatsApp com múltiplos vendedores.

## 🚀 Tecnologias

- **Next.js 16** - Framework React
- **Supabase** - Backend e banco de dados
- **WPPConnect Server** - Integração WhatsApp
- **Socket.IO** - Tempo real
- **TailwindCSS** - Estilização

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Configurar .env.local
cp .env.example .env.local

# Rodar desenvolvimento
pnpm dev
```

## 🔧 Configuração

### 1. Supabase
- Aplicar schema: `wppconnect-schema-v2.sql`
- Deploy Edge Functions

### 2. WPPConnect Server
- URL: http://199.127.60.186:21465
- Secret Key: THISISMYSECURETOKEN

## 📚 Documentação

Ver pasta `/docs` para guias completos.

## 🎯 Features

- ✅ Múltiplos vendedores
- ✅ Tempo real (Socket.IO + Realtime)
- ✅ Envio de mensagens
- ✅ Status de leitura
- ✅ QR Code para conexão

## 📄 Licença

MIT
