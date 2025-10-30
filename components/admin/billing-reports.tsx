"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBillingReports } from "@/lib/actions/billing"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { DollarSignIcon, DownloadIcon } from "lucide-react"

export default function BillingReports() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    paymentType: "all",
    period: "week",
  })

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    const { data } = await getBillingReports({
      startDate: filters.startDate,
      endDate: filters.endDate,
      paymentType: filters.paymentType,
    })
    setReports(data || [])
    setIsLoading(false)
  }

  const handlePeriodChange = (period: string) => {
    const today = new Date()
    let startDate = ""

    if (period === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      startDate = weekAgo.toISOString().split("T")[0]
    } else if (period === "month") {
      const monthAgo = new Date(today)
      monthAgo.setMonth(today.getMonth() - 1)
      startDate = monthAgo.toISOString().split("T")[0]
    }

    setFilters({
      ...filters,
      period,
      startDate,
      endDate: today.toISOString().split("T")[0],
    })
  }

  const totalAmount = reports.reduce((sum, r) => sum + Number.parseFloat(r.amount || 0), 0)
  const cashPayments = reports.filter((r) => r.payment_type === "cash").length
  const cardPayments = reports.filter((r) => r.payment_type === "card").length
  const upiPayments = reports.filter((r) => r.payment_type === "upi").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₹{totalAmount.toFixed(2)}</p>
            </div>
            <DollarSignIcon className="h-8 w-8 text-success/60" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cash Payments</p>
            <p className="text-2xl font-bold">{cashPayments}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Card Payments</p>
            <p className="text-2xl font-bold">{cardPayments}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">UPI Payments</p>
            <p className="text-2xl font-bold">{upiPayments}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="border-b p-4">
          <h2 className="font-semibold text-lg">Billing Reports</h2>
          <p className="text-sm text-muted-foreground">Filter and view payment records</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={filters.period} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.period === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select
                value={filters.paymentType}
                onValueChange={(value) => setFilters({ ...filters, paymentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={loadReports} className="bg-primary text-primary-foreground">
                Apply Filters
              </Button>
              <Button variant="outline">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="p-4 text-left text-sm font-medium">Date</th>
                <th className="p-4 text-left text-sm font-medium">Patient</th>
                <th className="p-4 text-left text-sm font-medium">MRN</th>
                <th className="p-4 text-left text-sm font-medium">Amount</th>
                <th className="p-4 text-left text-sm font-medium">Payment Type</th>
                <th className="p-4 text-left text-sm font-medium">Services</th>
                <th className="p-4 text-left text-sm font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading billing reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No billing records found for the selected filters.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-muted/30">
                    <td className="p-4 text-sm">{new Date(report.payment_date).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-medium">{report.patients?.full_name || "Unknown"}</td>
                    <td className="p-4 text-sm text-muted-foreground">{report.patients?.mrn || "—"}</td>
                    <td className="p-4 text-sm font-semibold">₹{Number.parseFloat(report.amount).toFixed(2)}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          report.payment_type === "cash"
                            ? "bg-success/20 text-success"
                            : report.payment_type === "card"
                              ? "bg-primary/20 text-primary"
                              : report.payment_type === "upi"
                                ? "bg-secondary/20 text-secondary"
                                : "bg-muted text-muted-foreground"
                        }
                      >
                        {report.payment_type}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {report.services
                        ? JSON.parse(report.services)
                            .map((s: any) => s.name)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{report.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
