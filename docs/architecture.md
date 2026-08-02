# System Architecture — A² ReVamp Gym

The platform follows an **Enterprise Monorepo Architecture**:

```
/
├── apps/
│   ├── web/            # Vite Frontend (PWA, AI Chatbot, 3 Dashboards)
│   └── api/            # Express REST API (MVC, Security, Mongoose, Redis)
├── packages/
│   ├── ui/             # UI Tokens & Styles
│   ├── hooks/          # Shared hooks
│   ├── utils/          # Exporters & helpers
│   ├── types/          # Entity definitions
│   └── config/         # System defaults
├── docs/               # System documentation
├── docker/             # Container orchestration
└── .github/            # GitHub Actions CI/CD workflows
```
