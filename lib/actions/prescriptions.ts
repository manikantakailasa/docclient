"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export async function savePrescription(data: {
  patientId: string
  appointmentId: string
  prescriptions: Array<{
    medicine: string
    dosage: string
    frequency: string
    duration: string
    notes: string
  }>
  diagnosis?: string
  followUpDays?: string
  nextAppointmentNotes?: string
}) {
  try {
    const { error } = await apiRequest(API_ENDPOINTS.prescriptions.create, {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (error) {
      console.error("[v0] Error saving prescription:", error)
      return { success: false, error: "Failed to save prescription" }
    }

    revalidatePath(`/doctor/patient/${data.patientId}`)
    revalidatePath("/doctor")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving prescription:", error)
    return { success: false, error: "Failed to save prescription" }
  }
}

export async function getPatientPrescriptions(patientId: string) {
  const { data, error } = await apiRequest<any[]>(API_ENDPOINTS.prescriptions.byPatient(patientId), {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching prescriptions:", error)
    return []
  }

  return data || []
}

export async function getLastPrescription(patientId: string) {
  const { data, error } = await apiRequest<any[]>(API_ENDPOINTS.prescriptions.latest(patientId), {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching last prescription:", error)
    return []
  }

  return data || []
}
