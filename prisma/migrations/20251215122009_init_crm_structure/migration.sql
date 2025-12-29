-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE_AVAILABLE', 'ACTIVE_BOOKED', 'ON_LEAVE', 'TERMINATED', 'ONBOARDING');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER');

-- CreateTable
CREATE TABLE "client_addresses" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "postal_code" VARCHAR(6) NOT NULL,
    "street" VARCHAR(100) NOT NULL,
    "building_number" VARCHAR(20) NOT NULL,
    "nip" VARCHAR(15) NOT NULL,

    CONSTRAINT "client_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "is_lead" BOOLEAN NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_technology" (
    "employee_id" INTEGER NOT NULL,
    "technology_id" INTEGER NOT NULL,

    CONSTRAINT "employee_technology_pkey" PRIMARY KEY ("employee_id","technology_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "busy_from" DATE,
    "busy_to" DATE,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE_AVAILABLE',

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_history" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "quote_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "cost" DECIMAL(12,2),
    "currency" VARCHAR(3) DEFAULT 'PLN',
    "status" VARCHAR(50) DEFAULT 'draft',
    "is_paid" BOOLEAN DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "pricing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_details" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "project_name" VARCHAR(200),
    "description" TEXT,
    "technologies" TEXT,
    "estimated_hours" DECIMAL(10,2),
    "estimated_price" DECIMAL(12,2),
    "status" VARCHAR(50) DEFAULT 'new',
    "start_date" DATE DEFAULT CURRENT_DATE,
    "end_date" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "project_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "employee_id" INTEGER,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MANAGER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_addresses_client_id_key" ON "client_addresses"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "employee_technology_emp_idx" ON "employee_technology"("employee_id");

-- CreateIndex
CREATE INDEX "employee_technology_tech_idx" ON "employee_technology"("technology_id");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_key" ON "technologies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "client_addresses" ADD CONSTRAINT "fk_client_address" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_technology" ADD CONSTRAINT "employee_technology_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee_technology" ADD CONSTRAINT "employee_technology_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_history" ADD CONSTRAINT "fk_history_client" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_history" ADD CONSTRAINT "fk_history_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_details" ADD CONSTRAINT "fk_project_details" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "fk_project_client" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "fk_project_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
