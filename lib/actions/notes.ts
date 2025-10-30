"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export async function saveNote(data: {
  patientId: string
  noteType: "front-desk" | "doctor" | "admin"
  content: string
  createdBy: string
}) {
  try {
    const { error } = await apiRequest(API_ENDPOINTS.notes.create, {
      method: "POST",
      body: JSON.stringify({
        patient_id: data.patientId,
        note_type: data.noteType,
        content: data.content,
        created_by: data.createdBy,
      }),
    })

    if (error) throw new Error(error)

    revalidatePath(`/doctor/patient/${data.patientId}`)
    revalidatePath("/front-desk")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving note:", error)
    return { success: false, error: "Failed to save note" }
  }
}

export async function getPatientNotes(patientId: string) {
  const { data, error } = await apiRequest<any[]>(API_ENDPOINTS.notes.byPatient(patientId), { method: "GET" })

  if (error) {
    console.error("[v0] Error fetching notes:", error)
    return []
  }

  return data || []
}
