"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export interface Patient {
  id: string
  full_name: string
  age?: number
  gender?: string
  phone?: string
  email?: string
  address?: string
  blood_group?: string
  allergies?: string
  conditions?: string
  health_summary?: string
  mrn?: string
  created_at?: string
  updated_at?: string
}

export async function searchPatients(query: string) {
  const { data, error } = await apiRequest<Patient[]>(
    `${API_ENDPOINTS.patients.search}?q=${encodeURIComponent(query)}`,
    { method: "GET" },
  )

  if (error) {
    console.error("[v0] Error searching patients:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function createPatient(formData: {
  fullName: string
  age: string
  gender: string
  phone: string
  email: string
  bloodGroup?: string
  allergies?: string
  conditions?: string
  status?: string
}) {
  const mrn = `MRN${Date.now().toString().slice(-8)}`

  const { data: patient, error } = await apiRequest<Patient>(API_ENDPOINTS.patients.create, {
    method: "POST",
    body: JSON.stringify({
      full_name: formData.fullName,
      age: formData.age ? Number.parseInt(formData.age) : null,
      gender: formData.gender || null,
      phone: formData.phone || null,
      email: formData.email || null,
      blood_group: formData.bloodGroup || null,
      allergies: formData.allergies || null,
      conditions: formData.conditions || null,
      mrn,
      status: formData.status,
    }),
  })

  if (error || !patient) {
    console.error("[v0] Error creating patient:", error)
    throw new Error(error || "Failed to create patient")
  }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  return { data: patient, error: null }
}

export async function getPatients() {
  const { data, error } = await apiRequest<Patient[]>(API_ENDPOINTS.patients.list, {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching patients:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function getPatientById(id: string) {
  const { data, error } = await apiRequest<Patient>(API_ENDPOINTS.patients.getById(id), {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching patient:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function updatePatient(id: string, updates: Partial<Patient>) {
  const { data, error } = await apiRequest<Patient>(API_ENDPOINTS.patients.update(id), {
    method: "PUT",
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  })

  if (error) {
    console.error("[v0] Error updating patient:", error)
    throw new Error(error)
  }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")
  revalidatePath(`/patients/${id}`)

  return { data, error: null }
}
