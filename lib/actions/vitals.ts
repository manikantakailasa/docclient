"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export async function createVitals(data: {
  patientId: string
  appointmentId: string
  bpSystolic?: number
  bpDiastolic?: number
  spo2?: number
  heartRate?: number
  temperature?: number
  weight?: number
  bmi?: number
  bloodSugar?: number
  allergies?: string
  conditions?: string
}) {
  try {
    const { error } = await apiRequest(API_ENDPOINTS.vitals.create, {
      method: "POST",
      body: JSON.stringify({
        patient_id: data.patientId,
        appointment_id: data.appointmentId,
        bp_systolic: data.bpSystolic,
        bp_diastolic: data.bpDiastolic,
        spo2: data.spo2,
        heart_rate: data.heartRate,
        temperature: data.temperature,
        weight: data.weight,
        bmi: data.bmi,
        blood_sugar: data.bloodSugar,
        allergies: data.allergies,
        conditions: data.conditions,
      }),
    })

    if (error) {
      console.error("[v0] Error creating vitals:", error)
      throw new Error("Failed to create vitals")
    }

    revalidatePath("/front-desk")
    revalidatePath("/doctor")
    revalidatePath(`/patients/${data.patientId}`)
    revalidatePath(`/doctor/patient/${data.patientId}`)

    return { success: true }
  } catch (error) {
    console.error("[v0] Error in createVitals:", error)
    return { success: false, error: "Failed to save vitals" }
  }
}

export async function getPatientVitals(patientId: string) {
  try {
    const { data, error } = await apiRequest<any[]>(API_ENDPOINTS.vitals.byPatient(patientId), {
      method: "GET",
    })

    if (error) {
      console.error("[v0] Error fetching vitals:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("[v0] Error in getPatientVitals:", error)
    return []
  }
}

export async function getAppointmentVitals(appointmentId: string) {
  try {
    const { data, error } = await apiRequest<any>(API_ENDPOINTS.vitals.byAppointment(appointmentId), {
      method: "GET",
    })

    if (error) {
      console.error("[v0] Error fetching appointment vitals:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getAppointmentVitals:", error)
    return null
  }
}

export async function getLatestPatientVitals(patientId: string) {
  try {
    const { data, error } = await apiRequest<any>(API_ENDPOINTS.vitals.latest(patientId), {
      method: "GET",
    })

    if (error) {
      console.error("[v0] Error fetching latest vitals:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getLatestPatientVitals:", error)
    return null
  }
}

export async function getPatientDetails(patientId: string) {
  try {
    const { data, error } = await apiRequest<any>(API_ENDPOINTS.patients.getById(patientId), {
      method: "GET",
    })

    if (error) {
      console.error("[v0] Error fetching patient details:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("[v0] Error in getPatientDetails:", error)
    return null
  }
}
