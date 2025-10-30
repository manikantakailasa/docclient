"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"

export async function getPatientDetails(patientId: string) {
  const { data: patient, error: patientError } = await apiRequest<any>(API_ENDPOINTS.patients.getById(patientId), {
    method: "GET",
  })

  if (patientError) {
    console.error("[v0] Error fetching patient:", patientError)
    return { patient: null, visits: [], vitals: [], prescriptions: [], upcomingAppointments: [] }
  }

  // Fetch visit history
  const { data: visits, error: visitsError } = await apiRequest<any[]>(API_ENDPOINTS.visits.byPatient(patientId), {
    method: "GET",
  })

  if (visitsError) {
    console.error("[v0] Error fetching visits:", visitsError)
    return { patient, visits: [], vitals: [], prescriptions: [], upcomingAppointments: [] }
  }

  // Fetch vital signs
  const { data: vitals, error: vitalsError } = await apiRequest<any[]>(API_ENDPOINTS.vitals.byPatient(patientId), {
    method: "GET",
  })

  if (vitalsError) {
    console.error("[v0] Error fetching vitals:", vitalsError)
    return { patient, visits: visits || [], vitals: [], prescriptions: [], upcomingAppointments: [] }
  }

  // Fetch prescriptions
  const { data: prescriptions, error: prescriptionsError } = await apiRequest<any[]>(
    API_ENDPOINTS.prescriptions.byPatient(patientId),
    { method: "GET" },
  )

  if (prescriptionsError) {
    console.error("[v0] Error fetching prescriptions:", prescriptionsError)
    return { patient, visits: visits || [], vitals: vitals || [], prescriptions: [], upcomingAppointments: [] }
  }

  // Fetch upcoming appointments
  const { data: upcomingAppointments, error: upcomingAppointmentsError } = await apiRequest<any[]>(
    API_ENDPOINTS.appointments.upcoming,
    { method: "GET" },
  )

  if (upcomingAppointmentsError) {
    console.error("[v0] Error fetching upcoming appointments:", upcomingAppointmentsError)
    return {
      patient,
      visits: visits || [],
      vitals: vitals || [],
      prescriptions: prescriptions || [],
      upcomingAppointments: [],
    }
  }

  return {
    patient,
    visits: visits || [],
    vitals: vitals || [],
    prescriptions: prescriptions || [],
    upcomingAppointments: upcomingAppointments || [],
  }
}

export async function getPatientVisitHistory(patientId: string) {
  try {
    const { data: visits, error } = await apiRequest<any[]>(API_ENDPOINTS.visits.byPatient(patientId), {
      method: "GET",
    })

    if (error) {
      console.error("[v0] Error fetching visit history:", error)
      return []
    }

    return visits || []
  } catch (error) {
    console.error("[v0] Error in getPatientVisitHistory:", error)
    return []
  }
}
