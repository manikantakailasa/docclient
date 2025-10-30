"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ActivityIcon, ClipboardIcon, PillIcon, FileTextIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" // add useRouter import for navigation to dedicated patient tools page
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MoreHorizontal } from "lucide-react"
import { evaluateBP, evaluateSpO2, getVitalColorClasses } from "@/lib/vitals-rules"
import { getTodayAppointments, updateAppointmentStatus } from "@/lib/actions/appointments"
import { getAppointmentVitals } from "@/lib/actions/vitals"

type Patient = {
  id: string // Use string type for UUID
  name: string
  time: string
  status: "waiting" | "scheduled" | "in-progress" | "completed" | "checked-in"
  chiefComplaint: string
  lastVisit: string
}

const initialTodayPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Martinez",
    time: "09:00 AM",
    status: "in-progress",
    chiefComplaint: "Routine checkup",
    lastVisit: "3 months ago",
  },
  {
    id: "2",
    name: "James Wilson",
    time: "09:30 AM",
    status: "waiting",
    chiefComplaint: "Fever and cough",
    lastVisit: "6 months ago",
  },
  {
    id: "3",
    name: "Emily Chen",
    time: "10:00 AM",
    status: "scheduled",
    chiefComplaint: "Follow-up diabetes",
    lastVisit: "1 month ago",
  },
]

const recentVitals = {
  bloodPressure: "120/80",
  heartRate: "72",
  temperature: "98.6°F",
  weight: "165 lbs",
  height: "5'7\"",
  bmi: "25.8",
}

const aiSuggestions = [
  { type: "coding", message: "ICD-10: Z00.00 (Encounter for general adult medical examination)", confidence: 95 },
  { type: "clinical", message: "Consider ordering HbA1c based on patient history", confidence: 88 },
  { type: "prescription", message: "Patient due for medication refill (Metformin)", confidence: 92 },
]

const pastHistory = [
  { date: "2025-05-21", summary: "Routine follow-up, stable vitals, no changes to meds." },
  { date: "2025-03-08", summary: "Acute URI, supportive care recommended." },
  { date: "2024-12-15", summary: "Annual exam, discussed diet and exercise; ordered labs." },
]

function PrescriptionBuilder({ patientName }: { patientName?: string }) {
  const [rows, setRows] = React.useState<
    Array<{ medication: string; dosage: string; frequency: string; duration: string; notes?: string }>
  >([{ medication: "", dosage: "", frequency: "", duration: "", notes: "" }])

  const addRow = () => setRows((r) => [...r, { medication: "", dosage: "", frequency: "", duration: "", notes: "" }])
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx))
  const updateRow = (idx: number, key: keyof (typeof rows)[number], value: string) =>
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))

  const printSheet = () => {
    window.print()
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header + controls */}
      <div className="flex items-center justify-between gap-2 print:hidden">
        <div>
          <p className="text-sm text-muted-foreground">Prescription for</p>
          <p className="font-semibold">{patientName || "Select a patient"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addRow} type="button">
            Add Row
          </Button>
          <Button onClick={printSheet} type="button" className="bg-primary text-primary-foreground">
            Print Prescription
          </Button>
        </div>
      </div>

      {/* Printable sheet */}
      <div className="rounded-md border bg-background">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-semibold">ClinHat — Prescription</h3>
          <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 text-sm">
          <div>
            <span className="text-muted-foreground">Patient:</span>{" "}
            <span className="font-medium">{patientName || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Doctor:</span> <span className="font-medium">—</span>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>#</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Notes</th>
                <th className="print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-t align-top">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.medication}
                      onChange={(e) => updateRow(idx, "medication", e.target.value)}
                      placeholder="e.g. Metformin"
                      className="h-8 print:border-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.dosage}
                      onChange={(e) => updateRow(idx, "dosage", e.target.value)}
                      placeholder="500 mg"
                      className="h-8 print:border-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.frequency}
                      onChange={(e) => updateRow(idx, "frequency", e.target.value)}
                      placeholder="BID"
                      className="h-8 print:border-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.duration}
                      onChange={(e) => updateRow(idx, "duration", e.target.value)}
                      placeholder="30 days"
                      className="h-8 print:border-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.notes}
                      onChange={(e) => updateRow(idx, "notes", e.target.value)}
                      placeholder="With meals"
                      className="h-8 print:border-0"
                    />
                  </td>
                  <td className="px-3 py-2 print:hidden">
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => removeRow(idx)} type="button">
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer notes */}
        <div className="p-3 text-xs text-muted-foreground">
          Directions: Unless otherwise noted, take medications as prescribed and consult if side effects occur.
        </div>
      </div>
    </div>
  )
}

export default function DoctorPage() {
  const [patients, setPatients] = React.useState<Patient[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [vitalsData, setVitalsData] = React.useState<Record<string, any>>({})
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null)
  const [activeTool, setActiveTool] = React.useState<"vitals" | "history" | "prescription" | "consultation">("vitals")
  const toolsRef = React.useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    async function loadAppointments() {
      try {
        const { data, error } = await getTodayAppointments()
        if (error) {
          console.error("[v0] Error loading appointments:", error)
          return
        }

        const transformedPatients: Patient[] = (data || [])
          .filter((apt: any) => apt.status === "checked-in")
          .map((apt: any) => ({
            id: apt.patient_id || "0",
            name: apt.patients?.full_name || "Unknown",
            time: apt.appointment_time?.substring(0, 5) || "00:00",
            status: "waiting",
            chiefComplaint: apt.patients?.allergies || "No allergies recorded",
            lastVisit: apt.patients?.conditions || "No conditions recorded", // Medical conditions from front-desk
          }))

        setPatients(transformedPatients)

        const vitalsMap: Record<string, any> = {}
        for (const apt of data || []) {
          if (apt.status === "checked-in" && apt.id) {
            const vitals = await getAppointmentVitals(apt.id)
            if (vitals) {
              vitalsMap[apt.patient_id] = vitals
            }
          }
        }
        setVitalsData(vitalsMap)
      } catch (err) {
        console.error("[v0] Error loading appointments:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAppointments()

    const interval = setInterval(loadAppointments, 30000)
    return () => clearInterval(interval)
  }, [])

  const toReviewPatients = React.useMemo(() => patients.filter((p) => p.status !== "completed"), [patients])
  const completedPatients = React.useMemo(() => patients.filter((p) => p.status === "completed"), [patients])

  const openTools = (tab: "vitals" | "history" | "prescription" | "consultation", patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTool(tab)
    queueMicrotask(() => {
      toolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  const handleCheckIn = (patient: Patient) => {
    router.push(`/doctor/patient/${patient.id}?name=${encodeURIComponent(patient.name)}`) // update check-in to navigate to dedicated patient tools page
  }

  const handleComplete = async (patient: Patient) => {
    try {
      await updateAppointmentStatus(patient.id, "completed")
      setPatients((prev) => prev.map((p) => (p.id === patient.id ? { ...p, status: "completed" } : p)))
    } catch (err) {
      console.error("[v0] Error completing appointment:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* <ClinicHeader /> */}
        <main className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Using universal header component */}
      {/* <ClinicHeader /> */}

      <main className="container mx-auto space-y-6 p-4 md:p-6">
        {/* Optional page title since header is removed */}
        <h1 className="sr-only">Doctor Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Today's Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <ActivityIcon className="h-8 w-8 text-primary/60" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedPatients.length}</p>
              </div>
              <ClipboardIcon className="h-8 w-8 text-secondary/60" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Prescriptions</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <PillIcon className="h-8 w-8 text-chart-3/60" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">AI Notes Generated</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <FileTextIcon className="h-8 w-8 text-success/60" />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <Card className="lg:col-span-2">
            <div className="border-b p-4">
              <h2 className="font-semibold text-lg text-primary">Today's Schedule</h2>
              <p className="text-sm text-muted-foreground">Checked-in patients ready for consultation</p>
            </div>
            <div className="divide-y">
              {toReviewPatients.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No patients checked in yet today.</p>
                  <p className="text-sm mt-2">Patients will appear here when front desk checks them in.</p>
                </div>
              ) : (
                toReviewPatients.map((patient) => {
                  const patientVitals = vitalsData[patient.id]
                  const bp = patientVitals ? `${patientVitals.bp_systolic}/${patientVitals.bp_diastolic}` : "N/A"
                  const spo2 = patientVitals ? `${patientVitals.spo2}%` : "N/A"
                  const weight = patientVitals ? `${patientVitals.weight} kg` : "N/A"

                  return (
                    <div key={patient.id} className="space-y-3 p-4 hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Link href={`/patients/${patient.id}?name=${encodeURIComponent(patient.name)}`}>
                              <p className="font-medium text-lg">{patient.name}</p>
                            </Link>
                            {patient.status === "in-progress" && (
                              <Badge className="bg-primary/20 text-primary">In Progress</Badge>
                            )}
                            {patient.status === "waiting" && (
                              <Badge className="bg-alert/20 text-alert hover:bg-alert/30">Waiting</Badge>
                            )}
                            {patient.status === "scheduled" && <Badge variant="outline">Scheduled</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {patient.time} • Last visit: {patient.lastVisit}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Allergies:</span> {patient.chiefComplaint}
                          </p>
                        </div>

                        <div className="flex items-center">
                          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link
                              href={`/doctor/patient/${patient.id}?name=${encodeURIComponent(patient.name)}&tab=consultation`}
                            >
                              Start Review
                            </Link>
                          </Button>
                        </div>

                        <div className="hidden md:flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-md border px-2 py-1 bg-card/50">
                              BP:{" "}
                              <span
                                className={`font-medium ${bp !== "N/A" ? getVitalColorClasses(evaluateBP(bp)) : "text-muted-foreground"}`}
                              >
                                {bp}
                              </span>
                            </span>
                            <span className="rounded-md border px-2 py-1 bg-card/50">
                              SpO2:{" "}
                              <span
                                className={`font-medium ${spo2 !== "N/A" ? getVitalColorClasses(evaluateSpO2(spo2)) : "text-muted-foreground"}`}
                              >
                                {spo2}
                              </span>
                            </span>
                            <span className="rounded-md border px-2 py-1 bg-card/50">
                              Wt: <span className="font-medium text-foreground">{weight}</span>
                            </span>
                          </div>

                          <div className="flex items-start gap-1">
                            <p className="text-sm text-foreground max-w-xs text-right">{patient.lastVisit}</p>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  aria-label="View more details"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>Last visit details</DialogTitle>
                                  <DialogDescription>Recent visit summaries for quick context</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                  {pastHistory.slice(0, 3).map((v) => (
                                    <div key={v.date} className="rounded-md border p-3">
                                      <p className="text-xs text-muted-foreground">{v.date}</p>
                                      <p className="text-sm text-foreground">{v.summary}</p>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </main>

      <section className="container mx-auto p-4 md:p-6 pt-0">
        <Card>
          <div className="border-b p-4">
            <h2 className="font-semibold text-lg text-secondary">Completed Patients</h2>
            <p className="text-sm text-muted-foreground">Patients completed today are listed here.</p>
          </div>
          <div className="divide-y">
            {completedPatients.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No completed patients yet today.</div>
            ) : (
              completedPatients.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.time} • Last visit: {p.lastVisit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Completed</Badge>
                    <Button asChild size="sm" variant="ghost" className="h-8">
                      <Link href={`/patients/${p.id}?name=${encodeURIComponent(p.name)}`}>View Chart</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
