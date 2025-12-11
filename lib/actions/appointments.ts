"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export interface Appointment {
  id: string
  patient_id: string
  doctor_id?: string
  appointment_date: string
  appointment_time: string
  status: string
  chief_complaint?: string
  created_at?: string
  updated_at?: string
  patients?: any
  vitals?: any[]
}

export async function getTodayAppointments() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL +"/api/appointments", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data: Appointment[] = await res.json();
    return { data, error: null };
  }
  catch (error) {
    console.error("[v0] Error fetching today's appointments:", error);
    return { data: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  const { data, error } = await apiRequest<Appointment>(API_ENDPOINTS.appointments.update(id), {
    method: "PATCH",
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  })

  if (error) {
    console.error("[v0] Error updating appointment:", error)
    throw new Error(error)
  }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  return { data, error: null }
}

export async function checkInPatient(appointmentdata: string) {
  const id = JSON.parse(appointmentdata).id;
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL +`/api/appointments?id=${id}` , {
    method: "PATCH",
      headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: JSON.parse(appointmentdata).status,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  return { error: null }
}

export async function createAppointmentWithVitals(data: {
  patientId: string
  visitType: "walkin" | "schedule"
  appointmentDate?: string
  appointmentTime?: string
  chiefComplaint: string
  vitals: {
    bpSystolic?: number
    bpDiastolic?: number
    spo2?: number
    heartRate?: number
    temperature?: number
    weight?: number
  }
}) {
  const today = new Date()
  const apptDate = data.visitType === "walkin" ? today.toISOString().split("T")[0] : data.appointmentDate
  const apptTime = data.visitType === "walkin" ? today.toTimeString().split(" ")[0] : data.appointmentTime
  const status = data.visitType === "walkin" ? "waiting" : "scheduled"

  const { data: appointment, error } = await apiRequest<Appointment>(API_ENDPOINTS.appointments.create, {
    method: "POST",
    body: JSON.stringify({
      patient_id: data.patientId,
      appointment_date: apptDate,
      appointment_time: apptTime,
      status,
      chief_complaint: data.chiefComplaint,
      vitals: data.vitals,
    }),
  })

  if (error || !appointment) {
    console.error("[v0] Error creating appointment:", error)
    throw new Error(error || "Failed to create appointment")
  }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  return { data: appointment, error: null }
}

export async function getUpcomingAppointments() {
  const { data, error } = await apiRequest<Appointment[]>(API_ENDPOINTS.appointments.upcoming, {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching upcoming appointments:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function getCompletedTodayAppointments() {
  const { data, error } = await apiRequest<Appointment[]>(API_ENDPOINTS.appointments.completed, {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching completed appointments:", error)
    return { data: [], error }
  }

  return { data: data || [], error: null }
}

export async function cancelAppointment(id: string) {
  const { data, error } = await apiRequest<Appointment>(API_ENDPOINTS.appointments.cancel(id), {
    method: "POST",
  })

  if (error) {
    console.error("[v0] Error cancelling appointment:", error)
    throw new Error(error)
  }

  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  return { data, error: null }
}

export async function deleteAppointment(id: string) {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL+`/api/appointments?id=${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
  }
  revalidatePath("/front-desk")
  revalidatePath("/doctor")

  const data: Appointment[] = await res.json();
  return { data, error: null };

}
