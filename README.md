# 🚀 Project Tech Stack and Status

This document outlines the technologies used in the project and the current status of their implementation, organized into logical phases.

## I. 🛠️ Project Foundations (Deployment Phase)

This section details the technologies that form the application's core structure.

| Area               | Technology           | Status      | Notes                                                                           |
| :----------------- | :------------------- | :---------- | :------------------------------------------------------------------------------ |
| **Main Framework** | Next.js (with React) | ✅ Deployed | Provides Server-Side Rendering (SSR/SSG/ISR) and routing.                       |
| **Styling**        | Tailwind CSS         | ✅ Deployed | Used for utility-first CSS, foundation for `shadcn/ui`.                         |
| **UI Components**  | shadcn/ui            | ✅ Deployed | Initialized (`npx shadcn@latest init`) with the chosen base color: **Neutral**. |
| **Icons**          | Lucide React         | ✅ Deployed | A lightweight and modern icon set.                                              |
| **Validation**     | Zod                  | ✅ Deployed | Schema validation for data (front-end and Server Actions).                      |

---

## II. 💾 Data Layer (Requires Completion)

This section covers the database connection and backend logic.

| Element            | Technology     | Status         | Next Step                                                                         |
| :----------------- | :------------- | :------------- | :-------------------------------------------------------------------------------- |
| **Database**       | PostgreSQL     | ✅ Deployed    | Requires instance to be provisioned (hosted).                                     |
| **ORM**            | Prisma         | ✅ Deployed    | -                                                                                 |
| **Backend Logic**  | Server Actions | ⬜ In Progress | Implementation of CRUD (Create, Read, Update, Delete) logic using Prisma and Zod. |
| **Authentication** | NextAuth       | ✅ Deployed    | -                                                                                 |

---

## III. 🧪 Testing and Advanced Features (Future Extensions)

These components will be added as the project develops and complexity grows.

| Feature            | Technology          | Status        | Purpose                                                            |
| :----------------- | :------------------ | :------------ | :----------------------------------------------------------------- |
| **Unit Testing**   | Jest                | ⬜ To Install | Testing the logic of Server Actions, services, and Zod validators. |
| **E2E Testing**    | Playwright          | ⬜ To Install | Testing full user scenarios (e.g., login, data submission).        |
| **Charts**         | Recharts            | ⬜ To Install | Data visualization on manager dashboards.                          |
| **Email Service**  | Nodemailer          | ⬜ To Install | Sending notifications and invoices.                                |
| **PDF Generation** | @react-pdf/renderer | ⬜ To Install | Creating dynamic reports and documents.                            |

---

## 🏃 How to Run the Project Locally

To run the project, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [REPOSITORY_ADDRESS]
    cd [PROJECT_NAME]
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Husky and lint-staged:**
    - Replace the default command: `npm test` with `npx lint-staged` in `/.husky/pre-commit` folder to automate eslint check before commit.

4.  **Configure Environment Variables:**
    - Copy the example file: `cp .env.example .env`
    - Fill in `.env` with your local credentials (e.g., for PostgreSQL).

5.  **Database Setup (after migration):**
    - Generate the Prisma Client: `npx prisma generate`
    - Run migrations (if migration files exist): `npx prisma migrate dev`

6.  **Start the development server:**
    ```bash
    npm run dev
    ```
