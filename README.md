<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="60" alt="Next.js" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/MongoDB.svg" width="60" alt="MongoDB" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Prisma.svg" width="60" alt="Prisma" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="60" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="60" alt="TailwindCSS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Cloudinary.svg" width="60" alt="Cloudinary" />
  
  <br />

  <h1 align="center"><strong>Nexus CRM Enterprise v2.0</strong></h1>
  <p align="center">
    A high-velocity, real-time Customer Relationship Management engine designed for scaled telemarketing teams. Built on Next.js 16 App Router, Prisma, and MongoDB Database.
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#data-models">Database</a> •
    <a href="#getting-started">Installation</a> •
    <a href="#security">Security</a>
  </p>
</div>

---

## 📌 Executive Summary

Nexus CRM Enterprise is an industry-grade Master-Detail application utilizing optimistic UI synchronizations, high-performance batch processing, and edge-routed JWT cryptography. It provides a multi-tenant environment specifically optimized for high-volume outbound lead conversion, featuring a unique "Advisor Desk" for senior closers and real-time operational surveillance for Administrators.

---

## 🏗️ System Architecture

The ecosystem relies on an Edge-Routed security model utilizing **Next.js Middleware**. By keeping JWT Verification isolated at the edge, React Server Components (RSC) securely offload non-authorized loads immediately before hydrating the DOM.

### Multi-Role Hierarchy
1. **System Administrator**: Full operational control, bulk lead ingestion, personnel management, and global analytics.
2. **Floor Employee**: High-velocity outbound calling, interaction logging, and lead escalation.
3. **Senior Advisor**: specialized "Closer" workspace to manage high-value escalated leads.

### Performance Engine
To support datasets of 10,000+ leads, the system utilizes:
- **Batch Processing**: Backend APIs use `createMany` and bulk unique checks to ingest 500+ leads in milliseconds.
- **Debounce Sync**: Auto-saving happens in the background via a 1s debounced timer to prevent DB locks.
- **Poll-Sync**: 30-second background polling keeps the entire floor in sync without manual refreshing.

---

## 🚀 Core Functionalities & Features

### 💼 Executive Control Deck (`/admin`)
- **Real-Time KPI Surveillance**: Instantly monitors Active Loads, Pending Escalations, and Verified Revenue.
- **Bulk Personnel Engineering**: Create dedicated Employee/Advisor profiles or instantly "Promote" top performers to Advisor status.
- **High-Velocity Lead Dumping**: Bulk assign leads (by specific quantity) to employees or advisors in seconds.
- **Operations Feed**: A strictly capped ticker showing the 5 most recent system-wide modifications.

### 📞 Operational Workspace (`/employee`)
- **Concierge View**: Filterable high-density lead table with instant detail modals.
- **Communication Intents**: Native triggers for VoIP Dials (`tel:`), SMS (`sms:`), and direct WhatsApp Web mapping.
- **Clip-Copy Utility**: Instant clipboard integration for Phone Numbers and System IDs.

### 🛡 Escalation Hub (`/advisor`)
- **Bifurcated closer workspace**: Dedicated pool of leads explicitly assigned to the logged-in Advisor.
- **Integrated Control Boxes**: Direct toggles for "Closed", "Verified", and "Paid" statuses with real-time sync.
- **Collaborative Interaction Log**: Floating modal popups for detailed case notes, ensuring no layout shifts while working.

---

## 🗄 Data Models (Prisma/MongoDB)

### **Entity: User**
| Field | Type | Role Support | Description |
|-------|------|--------------|-------------|
| `role` | `String` | `ADMIN \| EMPLOYEE \| ADVISOR` | Defines workspace access. |
| `leadsAsEmployee`| `Relation` | Employee Only | Maps leads currently on the agent's desk. |
| `leadsAsAdvisor`| `Relation` | Advisor Only | Maps leads escalated to this closer. |

### **Entity: Lead**
| Field | Type | Description |
|-------|------|-------------|
| `assignedToId`| `Relational FK`| Link to the handling Employee. |
| `assignedAdvisorId`| `Relational FK`| Link to the specific senior Advisor. |
| `moveToAdvisor`|`Boolean`| Flags lead for Advisor-level intervention. |
| `disposition`| `Enum` | Funnel tracking (Interested, Callback, etc). |

---

## 🔐 Security Posture

1. **Hardware-Level JWT Sessions**: Persistent sessions via `httpOnly`, `secure` cookies with Edge-level verification.
2. **Cloudinary Asset Security**: All file uploads utilize strictly server-side environment variables—no exposing secrets to the client.
3. **Database Integrity**: Native MongoDB unique indexing on Phone Numbers across all ingestion vectors to block duplicates.

---

## 🛠️ API Reference

- `POST /api/admin/employees`: Profile generation for reps.
- `PUT /api/admin/advisors`: Promotion logic for existing staff.
- `POST /api/admin/leads`: Batch ingestion engine with deduplication logic.
- `GET /api/advisor/leads`: Scoped query for closer-specific escalations.

---

## 💻 Installation & Deployment 

### Secure Variable Configuration
Create a `.env` file with the following mapping:
```env
DATABASE_URL="mongodb+srv://..."
JWT_SECRET="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### Setup Execution
1. `npm install`
2. `npx prisma generate` (Updates DB Abstractions)
3. `npx prisma db push` (Syncs MongoDB Schema)
4. `node prisma/seed.js` (Initializes Admin account)
5. `npm run dev`

---
> Engineered with precision for robust call-center telematics. v2.0 - April 2026.
