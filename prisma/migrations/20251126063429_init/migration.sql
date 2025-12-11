-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- CreateTable
CREATE TABLE "medical_library" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dosageForms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commonStrengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commonFrequencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "medical_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "blood_group" "BloodGroup",
    "patient_type" TEXT NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "visit_type" TEXT,
    "chief_complaint" TEXT,
    "notes" TEXT,
    "checked_in_at" TIMESTAMP(3),
    "consultation_started_at" TIMESTAMP(3),
    "consultation_ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
