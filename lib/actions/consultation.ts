"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export async function saveConsultation(data: {
  patientId: string
  appointmentId: string
  chiefComplaint: string
  previousComplications: string
  assessmentPlan: string
}) {
  try {
    const { error } = await apiRequest(API_ENDPOINTS.consultations.create, {
      method: "POST",
      body: JSON.stringify({
        patient_id: data.patientId,
        appointment_id: data.appointmentId,
        chief_complaint: data.chiefComplaint,
        previous_complications: data.previousComplications,
        assessment_plan: data.assessmentPlan,
      }),
    })

    if (error) throw new Error(error)

    revalidatePath(`/doctor/patient/${data.patientId}`)
    revalidatePath("/doctor")

    return { success: true }
  } catch (error) {
    console.error("[v0] Error saving consultation:", error)
    return { success: false, error: "Failed to save consultation" }
  }
}
