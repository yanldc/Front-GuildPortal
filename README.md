# ⚔️ TooBurnt Union — Frontend (Raven 2)

Plataforma web de coordenação e gerenciamento da guild **tooburnnt** no jogo Raven 2. Interface conectada ao backend via API REST + WebSocket para atualizações em tempo real.

## 🖼️ Funcionalidades

- **Dashboard** — Resumo de leilões ativos/finalizados, eventos e avisos da guild
- **Leilões** — Sistema de leilão com lances em GP, countdown ao vivo, imagem expandível e atualização real-time via WebSocket
- **Eventos** — Calendário semanal com RSVP, criação/edição/exclusão (admin)
- **Level Up** — Organização cooperativa de level entre membros
- **Perfil** — Edição de stats, gear, acessórios e símbolos do personagem
- **Admin Panel** — Gerenciamento de membros, GP, ranks, convites e exclusão com dupla confirmação
- **Notificações** — Sistema de toast global para feedback de todas as operações

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | UI |
| TypeScript | Tipagem |
| Vite | Build & Dev Server + Proxy |
| Tailwind CSS 4 | Estilização |
| Motion (Framer) | Animações |
| Lucide React | Ícones |
| WebSocket | Atualizações em tempo real |
| httpOnly Cookies | Autenticação segura (JWT) |

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (requer backend rodando na porta 3333)
npm run dev
```

A aplicação estará disponível em `http://localhost:3003`.

O Vite proxy redireciona automaticamente `/api/*` para o backend e suporta WebSocket.

## 🔐 Autenticação

- Login via Google (em dev, aceita email diretamente)
- JWT armazenado em httpOnly cookie (não acessível via JavaScript)
- Auto-refresh do token a cada 50 minutos
- Detecção automática de sessão expirada (401) com redirect para login
- Reconexão WebSocket automática a cada 3s se a conexão cair

## 📁 Estrutura do Projeto

```
public/
└── avatars/                 # Imagens de avatar por classe (PNG)
src/
├── components/              # Componentes de UI organizados por domínio
│   ├── admin/               # Painel administrativo (roster, GP, invites, logs)
│   ├── auctions/            # Sistema de leilões (cards, bid panel, criação)
│   ├── events/              # Eventos da guild (cards, form, filtros)
│   ├── levelup/             # Sistema de level up cooperativo
│   ├── profile/             # Componentes de perfil (gear row)
│   ├── Dashboard.tsx        # Dashboard principal
│   ├── LoginScreen.tsx      # Tela de login Google
│   ├── Navbar.tsx           # Navegação
│   ├── ProfileScreen.tsx    # Perfil e equipamentos
│   └── ToastContainer.tsx   # Notificações globais
├── data/
│   └── constants.ts         # Classes do jogo, presets
├── hooks/
│   ├── useAuth.ts           # Login/logout/refresh/session
│   ├── useAuctions.ts      # Fetch de leilões
│   ├── useEvents.ts        # Fetch de eventos
│   ├── useMembers.ts       # Fetch de membros
│   ├── useTransactions.ts  # Fetch de transações
│   ├── useToast.ts         # Sistema de notificações
│   └── useWebSocket.ts     # Conexão WebSocket real-time
├── services/                # Camada HTTP (API client)
│   ├── api.ts              # Fetch wrapper com credentials e interceptor 401
│   ├── auth.ts             # Login, logout, refresh, getMe
│   ├── auctions.ts         # CRUD de leilões + bid
│   ├── events.ts           # CRUD de eventos + RSVP
│   ├── invites.ts          # CRUD de convites + verificação pública
│   ├── levelup.ts          # Requests e helpers
│   ├── members.ts          # CRUD de membros + perfil
│   └── transactions.ts     # Ajuste de GP individual e bulk
├── types/
│   └── index.ts            # Interfaces TypeScript
├── utils/
│   ├── classAvatar.ts      # Mapeamento classe → imagem de avatar
│   └── time.ts             # Conversão EST → BRT
├── App.tsx                  # Componente raiz
├── types.ts                # Barrel re-export
├── main.tsx                # Entry point
└── index.css               # Estilos globais (Tailwind)
```

## 🖼️ Avatares por Classe

Coloque imagens PNG em `public/avatars/` com os nomes:

```
assassin.png
night-ranger.png
berserker.png
deathbringer.png
divine-caster.png
elementalist.png
destroyer.png
gunslinger.png
vanguard.png
warlord.png
default.png
```

O avatar é atualizado automaticamente ao alterar a classe no perfil.

## 📜 Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server na porta 3003 |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de tipos TypeScript |

## 🎮 Classes Suportadas (Raven 2)

Assassin, Night Ranger, Berserker, Deathbringer, Divine Caster, Elementalist, Destroyer, Gunslinger, Vanguard, Warlord

## 📝 Licença

Projeto privado — © 2026 tooburnnt. Todos os direitos reservados.
