# 🎬 Movie List — Full-Stack Application

A full-stack movie management and analytics platform built with a **React/TypeScript** client and a **Node.js/Express/MongoDB** server. The application allows users to browse, filter, and visualize movie data, manage related entities (directors, genres, awards, etc.), and add new records through validated forms.

---

## 📁 Monorepo Structure

```
movie-list/
├── client/          # React + TypeScript frontend (Vite)
│   └── README.md    # Client-specific documentation
├── server/          # Node.js + Express + MongoDB backend
│   └── README.md    # Server-specific documentation
└── README.md        # This file — project overview
```

---

## 🧩 Applications Overview

| Layer    | Technology                          | Purpose                                      |
|----------|-------------------------------------|----------------------------------------------|
| Client   | React 18, TypeScript, Vite          | UI, data visualization, form management      |
| Server   | Node.js, Express, TypeScript        | REST API, business logic, data persistence   |
| Database | MongoDB (via Mongoose)              | Persistent storage for all movie-related data|

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 8
- MongoDB instance (local or Atlas)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd movie-list

# Install server dependencies
cd server && pnpm install

# Install client dependencies
cd ../client && pnpm install
```

### Running the Applications

```bash
# Start the server (from /server)
pnpm dev

# Start the client (from /client)
pnpm dev
```

> Refer to each application's individual README for environment variable setup and detailed configuration.

---

## 🌐 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  React + TypeScript + Vite                           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Pages   │  │  Charts  │  │  Forms (Formik/Yup) │ │
│  └────┬─────┘  └────┬─────┘  └─────────┬──────────┘ │
│       └─────────────┴──────────────────┘            │
│                      │ Axios HTTP                    │
└──────────────────────┼──────────────────────────────┘
                        │
┌──────────────────────▼──────────────────────────────┐
│                  Server (REST API)                   │
│  Node.js + Express + TypeScript                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Routes → Controllers → Mongoose Models      │   │
│  └──────────────────────┬───────────────────────┘   │
└─────────────────────────┼───────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────┐
│                  MongoDB Database                    │
│  Collections: movies, directors, genres, awards,    │
│  categories, franchises, universes, languages,      │
│  countries                                          │
└─────────────────────────────────────────────────────┘
```

---

## 📄 Individual READMEs

- [Client README](./client/README.md) — Frontend tech stack, architecture, component structure, data flow
- [Server README](./server/README.md) — Backend tech stack, API routes, schema models, data flow

---

## 📜 License

MIT
