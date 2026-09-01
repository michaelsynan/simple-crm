# Primo Admin

A simple mobile-first customer and SMS marketing CMS for **Primo Sewer Cleaning**.

Built with **Nuxt 4**, **Vue 3**, **Nuxt UI**, **Tailwind CSS**, **Better Auth**, **Drizzle ORM**, **Turso/libSQL**, and **Twilio**.

---

## 👥 Test User Credentials

The application includes two pre-configured test accounts (auto-seeded on first run):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Frank** *(Owner)* | `frank@primosewer.com` | `projects2026` | Add customers, search customers, log jobs, view history |
| **Admin** | `admin@primosewer.com` | `projects2026` | All Frank permissions + SMS campaigns, audience targeting, delivery results |

> 💡 *Quick-login buttons for Frank and Admin are also available on the Login screen.*

---

## 📱 Mobile-First Workflow for Frank

1. Frank opens Primo Admin on his phone.
2. Taps **+ New Customer** on the home screen.
3. Enters Name, Mobile Phone, selects Job Type, Date, and checks SMS Marketing consent if given.
4. Taps **Save Customer** — saved in under 10 seconds.

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file from `.env.example`:

```env
# Database (Turso / libSQL)
TURSO_DATABASE_URL="file:local.db"
TURSO_AUTH_TOKEN=""

# Authentication (Better Auth)
BETTER_AUTH_SECRET="development-secret-change-in-production-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# Twilio (SMS Marketing)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`.

### 4. Build for Production

```bash
pnpm build
pnpm preview
```

---

## 🛠 Features

- **Mobile First**: Large touch targets, simplified inputs, bottom tab navigation.
- **Fast Customer & Job History**: Separate records for customers and chronological job history.
- **Audience Filtered SMS Marketing**: Target all opted-in customers, inactive customers (6+ / 12+ months), or specific job types.
- **Compliance & Opt-Outs**: Webhook handling for Twilio delivery receipts and automatic opt-out handling for inbound `STOP`/`UNSUBSCRIBE` messages.
- **Security**: Better Auth session middleware with server-side validation using Zod schemas and role-based route protection.

