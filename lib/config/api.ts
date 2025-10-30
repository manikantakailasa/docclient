// API Configuration
// Update this with your backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

const isValidApiUrl = API_BASE_URL.startsWith("http://") || API_BASE_URL.startsWith("https://")

export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false" && !isValidApiUrl

// API endpoints configuration
export const API_ENDPOINTS = {
  // Patient endpoints
  patients: {
    list: "/patients",
    search: "/patients/search",
    create: "/patients",
    getById: (id: string) => `/patients/${id}`,
    update: (id: string) => `/patients/${id}`,
    delete: (id: string) => `/patients/${id}`,
  },

  // Appointment endpoints
  appointments: {
    today: "/appointments/today",
    upcoming: "/appointments/upcoming",
    completed: "/appointments/completed",
    create: "/appointments",
    update: (id: string) => `/appointments/${id}`,
    checkIn: (id: string) => `/appointments/${id}/check-in`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
    delete: (id: string) => `/appointments/${id}`,
  },

  // Vitals endpoints
  vitals: {
    create: "/vitals",
    byPatient: (patientId: string) => `/vitals/patient/${patientId}`,
    byAppointment: (appointmentId: string) => `/vitals/appointment/${appointmentId}`,
    latest: (patientId: string) => `/vitals/patient/${patientId}/latest`,
  },

  // Prescription endpoints
  prescriptions: {
    create: "/prescriptions",
    byPatient: (patientId: string) => `/prescriptions/patient/${patientId}`,
    latest: (patientId: string) => `/prescriptions/patient/${patientId}/latest`,
  },

  // Consultation endpoints
  consultations: {
    create: "/consultations",
    byPatient: (patientId: string) => `/consultations/patient/${patientId}`,
  },

  // Notes endpoints
  notes: {
    create: "/notes",
    byPatient: (patientId: string) => `/notes/patient/${patientId}`,
  },

  // Visit history endpoints
  visits: {
    byPatient: (patientId: string) => `/visits/patient/${patientId}`,
  },

  // Billing endpoints
  billing: {
    reports: "/billing/reports",
    servicePricing: "/billing/service-pricing",
    createService: "/billing/service-pricing",
    updateService: (id: string) => `/billing/service-pricing/${id}`,
    deleteService: (id: string) => `/billing/service-pricing/${id}`,
  },
}

// API helper function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  console.log("[v0] USE_MOCK_DATA:", USE_MOCK_DATA, "API_BASE_URL:", API_BASE_URL)

  if (USE_MOCK_DATA) {
    console.log("[v0] Using mock data for:", endpoint)
    const mockResponse = await getMockResponse<T>(endpoint, options.method || "GET", options.body)
    return mockResponse
  }

  try {
    console.log("[v0] Making real API call to:", `${API_BASE_URL}${endpoint}`)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed" }))
      console.error("[v0] API request failed:", errorData)
      return { data: null, error: errorData.message || `HTTP ${response.status}` }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    console.error("[v0] API request failed:", error)
    return { data: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function getMockResponse<T>(
  endpoint: string,
  method: string,
  body?: BodyInit | null,
): Promise<{ data: T | null; error: string | null }> {
  const {
    mockPatients,
    mockAppointments,
    mockVitals,
    mockPrescriptions,
    mockVisits,
    mockNotes,
    mockPayments,
    mockServicePricing,
  } = await import("@/lib/data/mock-data")

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    // Parse body if present
    const bodyData = body ? JSON.parse(body.toString()) : null

    // Patient endpoints
    if (endpoint === "/patients") {
      if (method === "POST") {
        const newPatient = { id: String(Date.now()), ...bodyData, created_at: new Date().toISOString() }
        return { data: newPatient as T, error: null }
      }
      return { data: mockPatients as T, error: null }
    }

    if (endpoint.startsWith("/patients/search")) {
      const query = new URL(`http://dummy${endpoint}`).searchParams.get("q")?.toLowerCase() || ""
      const filtered = mockPatients.filter((p) => p.full_name.toLowerCase().includes(query) || p.phone.includes(query))
      return { data: filtered as T, error: null }
    }

    if (endpoint.match(/^\/patients\/[^/]+$/)) {
      const id = endpoint.split("/")[2]
      const patient = mockPatients.find((p) => p.id === id)
      return { data: patient as T, error: patient ? null : "Patient not found" }
    }

    // Appointment endpoints
    if (endpoint === "/appointments/today") {
      const today = mockAppointments.filter((a) => a.appointment_date === new Date().toISOString().split("T")[0])
      return { data: today as T, error: null }
    }

    if (endpoint === "/appointments/upcoming") {
      const upcoming = mockAppointments.filter((a) => a.status === "scheduled")
      return { data: upcoming as T, error: null }
    }

    if (endpoint === "/appointments/completed") {
      const completed = mockAppointments.filter((a) => a.status === "completed")
      return { data: completed as T, error: null }
    }

    if (endpoint === "/appointments" && method === "POST") {
      const newAppointment = {
        id: Date.now(),
        ...bodyData,
        created_at: new Date().toISOString(),
      }
      return { data: newAppointment as T, error: null }
    }

    if (endpoint.match(/^\/appointments\/\d+$/)) {
      const id = Number.parseInt(endpoint.split("/")[2])
      if (method === "PATCH") {
        const appointment = mockAppointments.find((a) => a.id === id)
        return { data: { ...appointment, ...bodyData } as T, error: null }
      }
      if (method === "DELETE") {
        return { data: { success: true } as T, error: null }
      }
    }

    // Vitals endpoints
    if (endpoint === "/vitals" && method === "POST") {
      const newVital = { id: `v${Date.now()}`, ...bodyData, recorded_at: new Date().toISOString() }
      return { data: newVital as T, error: null }
    }

    if (endpoint.match(/^\/vitals\/patient\/[^/]+$/)) {
      const patientId = endpoint.split("/")[3]
      const vitals = mockVitals.filter((v) => v.patient_id === patientId)
      return { data: vitals as T, error: null }
    }

    if (endpoint.match(/^\/vitals\/patient\/[^/]+\/latest$/)) {
      const patientId = endpoint.split("/")[3]
      const vitals = mockVitals.filter((v) => v.patient_id === patientId)
      const latest = vitals.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0]
      return { data: latest as T, error: null }
    }

    // Prescription endpoints
    if (endpoint === "/prescriptions" && method === "POST") {
      const newPrescription = { id: `p${Date.now()}`, ...bodyData, prescribed_at: new Date().toISOString() }
      return { data: newPrescription as T, error: null }
    }

    if (endpoint.match(/^\/prescriptions\/patient\/[^/]+$/)) {
      const patientId = endpoint.split("/")[3]
      const prescriptions = mockPrescriptions.filter((p) => p.patient_id === patientId)
      return { data: prescriptions as T, error: null }
    }

    if (endpoint.match(/^\/prescriptions\/patient\/[^/]+\/latest$/)) {
      const patientId = endpoint.split("/")[3]
      const prescriptions = mockPrescriptions.filter((p) => p.patient_id === patientId)
      const latest = prescriptions.sort(
        (a, b) => new Date(b.prescribed_at).getTime() - new Date(a.prescribed_at).getTime(),
      )[0]
      return { data: latest as T, error: null }
    }

    // Visit history endpoints
    if (endpoint.match(/^\/visits\/patient\/[^/]+$/)) {
      const patientId = endpoint.split("/")[3]
      const visits = mockVisits.filter((v) => v.patient_id === patientId)
      return { data: visits as T, error: null }
    }

    // Notes endpoints
    if (endpoint === "/notes" && method === "POST") {
      const newNote = { id: `n${Date.now()}`, ...bodyData, created_at: new Date().toISOString() }
      return { data: newNote as T, error: null }
    }

    if (endpoint.match(/^\/notes\/patient\/[^/]+$/)) {
      const patientId = endpoint.split("/")[3]
      const notes = mockNotes.filter((n) => n.patient_id === patientId)
      return { data: notes as T, error: null }
    }

    // Billing endpoints
    if (endpoint === "/billing/reports") {
      return { data: mockPayments as T, error: null }
    }

    if (endpoint === "/billing/service-pricing") {
      if (method === "POST") {
        const newService = { id: `s${Date.now()}`, ...bodyData, is_active: true }
        return { data: newService as T, error: null }
      }
      return { data: mockServicePricing as T, error: null }
    }

    // Consultation endpoints
    if (endpoint === "/consultations" && method === "POST") {
      const newConsultation = { id: `c${Date.now()}`, ...bodyData, created_at: new Date().toISOString() }
      return { data: newConsultation as T, error: null }
    }

    // Default fallback
    console.warn("[v0] No mock data handler for:", endpoint)
    return { data: [] as T, error: null }
  } catch (error) {
    console.error("[v0] Mock data error:", error)
    return { data: null, error: error instanceof Error ? error.message : "Mock data error" }
  }
}
