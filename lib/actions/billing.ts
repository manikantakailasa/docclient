"use server"

import { API_ENDPOINTS, apiRequest } from "@/lib/config/api"
import { revalidatePath } from "next/cache"

export async function getBillingReports(filters: {
  startDate?: string
  endDate?: string
  paymentType?: string
}) {
  const queryParams = new URLSearchParams()

  if (filters.startDate) queryParams.append("startDate", filters.startDate)
  if (filters.endDate) queryParams.append("endDate", filters.endDate)
  if (filters.paymentType && filters.paymentType !== "all") {
    queryParams.append("paymentType", filters.paymentType)
  }

  const { data, error } = await apiRequest<any[]>(`${API_ENDPOINTS.billing.reports}?${queryParams.toString()}`, {
    method: "GET",
  })

  if (error) {
    console.error("[v0] Error fetching billing reports:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function getServicePricing() {
  const { data, error } = await apiRequest<any[]>(API_ENDPOINTS.billing.servicePricing, { method: "GET" })

  if (error) {
    console.error("[v0] Error fetching service pricing:", error)
    return { data: null, error }
  }

  return { data, error: null }
}

export async function createServicePrice(service: {
  service_name: string
  service_category: string
  price: number
  description?: string
}) {
  const { data, error } = await apiRequest<any>(API_ENDPOINTS.billing.createService, {
    method: "POST",
    body: JSON.stringify(service),
  })

  if (error) {
    console.error("[v0] Error creating service price:", error)
    return { data: null, error }
  }

  revalidatePath("/admin")
  return { data, error: null }
}

export async function updateServicePrice(
  id: string,
  updates: {
    service_name?: string
    service_category?: string
    price?: number
    description?: string
    is_active?: boolean
  },
) {
  const { data, error } = await apiRequest<any>(API_ENDPOINTS.billing.updateService(id), {
    method: "PUT",
    body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() }),
  })

  if (error) {
    console.error("[v0] Error updating service price:", error)
    return { data: null, error }
  }

  revalidatePath("/admin")
  return { data, error: null }
}

export async function deleteServicePrice(id: string) {
  const { error } = await apiRequest(API_ENDPOINTS.billing.deleteService(id), { method: "DELETE" })

  if (error) {
    console.error("[v0] Error deleting service price:", error)
    return { error }
  }

  revalidatePath("/admin")
  return { error: null }
}
