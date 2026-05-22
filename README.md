# ⚔️ Guild Portal — tooburnnt (Raven 2)

Plataforma web de coordenação e gerenciamento da guild **tooburnnt** no jogo Raven 2. Permite aos membros acompanhar leilões de loot, eventos da guild, sistema de pontos (GP) e perfil de personagem.

## 🖼️ Visão Geral

- **Dashboard** — Painel principal com resumo de leilões ativos, eventos e avisos da guild
- **Leilões** — Sistema de leilão interno com lances em GP para itens dropados em raids/bosses
- **Eventos** — Calendário de eventos da guild (Rift, Boss, GvG, Raid) com confirmação de presença (RSVP)
- **Level Up** — Tela de organização para ajuda mútua de level entre membros
- **Perfil** — Edição de stats, gear e informações do personagem
- **Admin Panel** — Gerenciamento de membros, pontos e ranks (apenas admins/officers)

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 19 | UI |
| TypeScript | Tipagem |
| Vite | Build & Dev Server |
| Tailwind CSS 4 | Estilização |
| Framer Motion | Animações |
| Lucide React | Ícones |
| LocalStorage | Persistência de dados (client-side) |

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3003`.

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes de UI organizados por domínio
│   ├── admin/               # Painel administrativo
│   │   ├── AdminPanel.tsx       # Orquestrador (tabs + modal)
│   │   ├── MembersTable.tsx     # Tabela de membros com filtros
│   │   ├── PointsAdjustPanel.tsx# Ajuste GP individual
│   │   ├── BulkPointsPanel.tsx  # Ajuste GP em massa
│   │   ├── InviteForm.tsx       # Formulário de convite
│   │   └── AuditLogs.tsx        # Logs de transações
│   ├── auctions/            # Sistema de leilões
│   │   ├── AuctionsScreen.tsx   # Orquestrador
│   │   ├── AuctionCard.tsx      # Card de item
│   │   ├── BidPanel.tsx         # Painel de lance
│   │   └── CreateAuctionForm.tsx# Formulário de criação
│   ├── events/              # Eventos da guild
│   │   ├── EventsScreen.tsx     # Orquestrador
│   │   ├── EventCard.tsx        # Card de evento
│   │   └── EventForm.tsx        # Formulário de criação
│   ├── levelup/             # Sistema de level up cooperativo
│   │   ├── LevelUpScreen.tsx    # Orquestrador
│   │   ├── RequestCard.tsx      # Card de pedido de ajuda
│   │   ├── RequestForm.tsx      # Formulário de request
│   │   ├── HelperCard.tsx       # Card de helper disponível
│   │   ├── HelperForm.tsx       # Formulário de registro
│   │   └── JoinSlotModal.tsx    # Modal de join em party
│   ├── login/               # Autenticação
│   │   └── AccountSelector.tsx  # Modal de seleção de conta
│   ├── profile/             # Perfil do jogador
│   │   └── GearRow.tsx          # Componente reutilizável de gear
│   ├── Dashboard.tsx        # Dashboard principal
│   ├── LoginScreen.tsx      # Tela de login/registro
│   ├── MyAuctionsScreen.tsx # Meus lances
│   ├── Navbar.tsx           # Navegação
│   └── ProfileScreen.tsx    # Perfil e equipamentos
├── data/                    # Dados iniciais e constantes
│   ├── constants.ts             # Classes, item presets
│   └── seeds.ts                 # Dados mock iniciais
├── hooks/                   # Custom hooks de estado
│   ├── useAuth.ts               # Login/logout/currentUser
│   ├── useAuctions.ts           # Estado dos leilões
│   ├── useEvents.ts             # Estado dos eventos
│   ├── useMembers.ts            # Estado dos membros
│   └── useTransactions.ts       # Estado das transações
├── services/                # Camada de persistência
│   └── storage.ts               # Abstração do localStorage
├── types/                   # Interfaces e tipos TypeScript
│   └── index.ts
├── utils/                   # Funções utilitárias
│   └── time.ts                  # Conversão EST → BRT
├── App.tsx                  # Componente raiz (orquestra hooks)
├── types.ts                 # Barrel re-export (compatibilidade)
├── main.tsx                 # Entry point
└── index.css                # Estilos globais (Tailwind)
```

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o dev server na porta 3003 |
| `npm run build` | Gera build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Verifica tipos com TypeScript |

## 🎮 Classes Suportadas (Raven 2)

Assassin, Night Ranger, Berserker, Deathbringer, Divine Caster, Elementalist, Destroyer, Gunslinger, Vanguard, Warlord

## 📝 Licença

Projeto privado — © 2026 tooburnnt. Todos os direitos reservados.
