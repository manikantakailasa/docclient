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
