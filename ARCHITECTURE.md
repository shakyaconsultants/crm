# System Architecture & Technical Specifications
**Project Name:** Nexus CRM Enterprise v2.0  
**Stack:** Next.js 16 (App Router), React 18, Prisma ORM, MongoDB (Atlas), Cloudinary.

---

## 1. System Philosophy: The Three Pillars

Nexus CRM Enterprise is built on a high-availability, low-latency architecture designed to maximize lead-conversion velocity while maintaining strict administrative oversight.

1. **Surveillance & Control**: Real-time KPI polling and centralized lead distribution.
2. **Velocity & Automation**: No manual saves, batch processing, and native telematics intents.
3. **Escalation & Closure**: Distinct, isolated environments for agents and senior advisors.

---

## 2. Security Infrastructure

### 2.1 Edge Guard (Middleware)
**Path:** `/src/proxy.ts`
- **Symmetric Authentication**: Utilizes `jose` for Edge-compatible JWT verification.
- **Route Gating**:
    - `/admin/*` -> Requires `payload.role === 'ADMIN'`
    - `/advisor/*` -> Requires `payload.role === 'ADVISOR'`
    - `/employee/*` -> Requires non-admin role session.
- Failure to validate roles triggers a hard `302 Redirect` back to `/login` before the page is even rendered.

### 2.2 Asset Security (Cloudinary)
- **Private Signatures**: No `NEXT_PUBLIC_` keys are used. All Cloudinary interactions occur in the server runtime (`src/lib/cloudinary.ts`), preventing API Key leaks in the browser network inspector.

---

## 3. Database Architecture (BSON Pattern)

Leveraging Prisma with MongoDB allows for high-flexibility "Schema-on-Read" behavior while maintaining relational integrity.

### 3.1 Relational Mapping (Multi-Parent)
The schema supports a "Dual Assignment" model:
- `Lead.assignedToId`: Maps to a `User` with role `EMPLOYEE`.
- `Lead.assignedAdvisorId`: Maps to a `User` with role `ADVISOR`.
- This allows a lead to be concurrently "owned" by an agent for calling and an advisor for closing without losing the history of either relation.

### 3.2 Performance Constraints
- **Unique Constraints**: `Lead.phone` is unique. 
- **Indexing**: MongoDB indexes are created on `assignedToId` and `assignedAdvisorId` to ensure fetch calls remain `<100ms` even as the table scale grows to 50k+ rows.

---

## 4. Operational Workflows

### 4.1 The High-Performance Batch Ingester
- **Problem**: Classic loops cause server timeouts on 500+ record uploads.
- **Solution**: The `api/admin/leads/route.ts` implementation:
    1. Collects all incoming phone numbers.
    2. Performs a **single batch query** (`findMany { in: [...] }`) to find existing duplicates.
    3. Filters the set locally in memory.
    4. Executes a **single transaction** (`createMany`) to write the remaining leads.
    5. Result: 1000 leads ingest in < 2 seconds.

### 4.2 The Unified Debounce Sync
**Location:** `/src/app/employee/page.tsx`, `/src/app/advisor/page.tsx`
- All changes to remarks, dispositions, or closure checks trigger a React state update + an 800ms timer.
- Consecutive keystrokes reset the timer.
- Only the final state is sent via `PATCH`, significantly reducing database load on busy call floors.

### 4.3 The "Limiting" Operations Feed
- **Component**: Admin Dashboard Feed.
- **Optimization**: To prevent DOM bloat, the feed uses `take: 5` in the server query.
- **UI Logic**: A `max-h-[600px]` constraint with `overflow-y-auto` ensures the dashboard layout remains fixed regardless of feed activity.

---

## 5. UI/UX Design System

- **Glassmorphism**: Built using `backdrop-blur` and translucent `neutral-900/50` backgrounds for a premium, high-tech dashboard aesthetic.
- **Non-Invasive Modals**: Interaction logs and lead details pop up in fixed `inset-0` overlays with `framer-motion` scaling. This removes "layout jumping" associated with inline expansion.
- **Telemetry Icons**: `lucide-react` provides standardized semantic iconography across the three separate workspaces.

---

## 6. Directory Topology

```text
📁 src
 ├── 📁 app
 │    ├── 📁 admin              # Executive Control (Leads/Personnel/Metrics)
 │    ├── 📁 advisor            # Closer Dashboard (Tabular view, specific leads)
 │    ├── 📁 employee           # Agent Dashboard (Telemetry, high-velocity)
 │    ├── 📁 api                # Multi-role API Gateway (advisor/ admin/ employee/)
 │    └── login                 # Multi-role Auth Handler
 ├── 📁 components
 │    └── Navigation.tsx        # JWT-State-Aware Global Header
 ├── 📁 lib
 │    ├── db.ts                 # Prisma Singleton
 │    └── cloudinary.ts         # Secure Storage Adaptor
 └── proxy.ts                   # Edge-Runtime Security Guard
```

---
> v2.0 - Technical Documentation for Nexus CRM Enterprise. Refined for transparency and scalability.
