"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { checkInPatient } from "@/lib/actions/appointments"
import { createVitals } from "@/lib/actions/vitals"
import { cn } from "@/lib/utils"
import { Activity, Bell, CalendarClock, CreditCard, Info, MessageSquare, Trash2, UserCheck } from "lucide-react"
import Link from "next/link"
import * as React from "react"

type Appointment = {
  id: number | string
  patient_id?: string // Add patient_id field for UUID
  patient: string
  time: string
  doctor: string
  status: string // "scheduled" | "checked-in" | "in-consultation" | "consultation-complete" | "payment-pending" | "completed"
  age?: number
  bloodGroup?: string
  visits?: number
}

interface TodayQueueProps {
  appointments: Appointment[]
  className?: string
  onRemove?:  (id: string | number) => Promise<void> // Add onRemove callback prop
}

const statusColor: Record<string, string> = {
  scheduled: "bg-primary text-primary-foreground",
  "checked-in": "bg-success text-success-foreground",
  "in-consultation": "bg-warning text-warning-foreground",
  "consultation-complete": "bg-info text-info-foreground",
  "payment-pending": "bg-secondary text-secondary-foreground",
  completed: "bg-accent text-accent-foreground",
}

export default function TodayQueue({ appointments, className, onRemove }: TodayQueueProps) {
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Appointment | null>(null)

  const [infoOpen, setInfoOpen] = React.useState(false)

  const [paymentOpen, setPaymentOpen] = React.useState(false)
  const [reminderOpen, setReminderOpen] = React.useState(false)
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [vitalsOpen, setVitalsOpen] = React.useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [patientToDelete, setPatientToDelete] = React.useState<string | number | null>(null)

  const [reminderType, setReminderType] = React.useState<string>("appointment")
  const [reminderChannels, setReminderChannels] = React.useState<Set<"sms" | "whatsapp" | "email">>(new Set())
  const toggleReminderChannel = (ch: "sms" | "whatsapp" | "email", checked: boolean | "indeterminate") => {
    setReminderChannels((prev) => {
      const next = new Set(prev)
      if (checked) next.add(ch)
      else next.delete(ch)
      return next
    })
  }

  const [scheduleDate, setScheduleDate] = React.useState<string>("")
  const [scheduleTime, setScheduleTime] = React.useState<string>("")
  const [scheduleChannels, setScheduleChannels] = React.useState<Set<"sms" | "whatsapp" | "email">>(new Set())
  const toggleScheduleChannel = (ch: "sms" | "whatsapp" | "email", checked: boolean | "indeterminate") => {
    setScheduleChannels((prev) => {
      const next = new Set(prev)
      if (checked) next.add(ch)
      else next.delete(ch)
      return next
    })
  }

  const [paymentMethod, setPaymentMethod] = React.useState<"card" | "cash" | "upi">("card")
  const [paymentAmount, setPaymentAmount] = React.useState<string>("")

  const [vHeight, setVHeight] = React.useState<string>("")
  const [vWeight, setVWeight] = React.useState<string>("")
  const [vBpSys, setVBpSys] = React.useState<string>("")
  const [vBpDia, setVBpDia] = React.useState<string>("")
  const [vSpo2, setVSpo2] = React.useState<string>("")
  const [vPbs, setVPbs] = React.useState<string>("")
  const [vAllergies, setVAllergies] = React.useState<string>("")
  const [vConditions, setVConditions] = React.useState<string>("")
  const [vHeartRate, setVHeartRate] = React.useState<string>("")
  const [vTemperature, setVTemperature] = React.useState<string>("")

  const [done, setDone] = React.useState<
    Record<string | number, { vitals?: boolean; payment?: boolean; reminder?: boolean; schedule?: boolean }>
  >({})
  const markDone = (id: string | number, key: "vitals" | "payment" | "reminder" | "schedule") =>
    setDone((prev) => ({ ...prev, [id]: { ...prev[id], [key]: true } }))
  const isAllDone = (id: string | number) => {
    const s = done[id] || {}
    return !!(s.vitals && s.payment && s.reminder && s.schedule)
  }

  const [patientStatus, setPatientStatus] = React.useState<Record<string | number, string>>({})

  const handleCheckIn = async (id: string | number) => {
    try {
      await checkInPatient(String(id))
      setPatientStatus((prev) => ({ ...prev, [id]: "checked-in" }))
    } catch (error) {
      console.error("[v0] Error checking in patient:", error)
      alert("Failed to check in patient. Please try again.")
    }
  }

  const handlePaymentComplete = (id: string | number) => {
    setPatientStatus((prev) => ({ ...prev, [id]: "completed" }))
    markDone(id, "payment")
    // In real app: API call to mark consultation as fully complete
    console.log("[v0] Payment complete, consultation done:", id)
  }

  const priority = (s: string) => {
    switch (s) {
      case "scheduled":
        return 0
      case "checked-in":
        return 1
      case "in-consultation":
        return 2
      case "consultation-complete":
        return 3
      case "payment-pending":
        return 4
      case "completed":
        return 99
      default:
        return 50
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? appointments.filter(
          (a) =>
            a.patient.toLowerCase().includes(q) ||
            a.doctor.toLowerCase().includes(q) ||
            a.status.toLowerCase().includes(q) ||
            a.time.toLowerCase().includes(q),
        )
      : appointments

    return [...base].sort((a, b) => {
      const pa = priority(a.status)
      const pb = priority(b.status)
      if (pa !== pb) return pa - pb
      return a.time.localeCompare(b.time)
    })
  }, [appointments, query])

  const circleCls = (active?: boolean) =>
    cn(
      "inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors",
      active ? "ring-2 ring-success bg-success/10 text-success" : "ring-1 ring-border text-foreground",
    )

  const pendingNotes: Record<string | number, boolean> = {
    1: true, // Patient ID 1 has pending notes from doctor
  }

  const getPatientStatus = (apt: Appointment) => {
    return patientStatus[apt.id] || apt.status
  }

  const handleRemove = (id: string | number) => {
    setPatientToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmRemove = () => {
    if (patientToDelete !== null) {
      onRemove?.(patientToDelete)
      setPatientToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const handleVitalsSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    try {
      const weight = Number.parseFloat(vWeight)
      const height = Number.parseFloat(vHeight)
      const bmi = weight && height ? weight / (height / 100) ** 2 : undefined

      const result = await createVitals({
        patientId: selected.patient_id || String(selected.id),
        appointmentId: String(selected.id),
        bpSystolic: vBpSys ? Number.parseInt(vBpSys) : undefined,
        bpDiastolic: vBpDia ? Number.parseInt(vBpDia) : undefined,
        spo2: vSpo2 ? Number.parseInt(vSpo2) : undefined,
        heartRate: vHeartRate ? Number.parseInt(vHeartRate) : undefined,
        temperature: vTemperature ? Number.parseFloat(vTemperature) : undefined,
        weight: weight || undefined,
        bmi: bmi,
        bloodSugar: undefined,
        allergies: vAllergies || undefined,
        conditions: vConditions || undefined,
      })

      if (result.success) {
        markDone(selected.id, "vitals")
        // Reset form
        setVHeight("")
        setVWeight("")
        setVBpSys("")
        setVBpDia("")
        setVSpo2("")
        setVPbs("")
        setVAllergies("")
        setVConditions("")
        setVHeartRate("")
        setVTemperature("")
        setVitalsOpen(false)
      } else {
        alert("Failed to save vitals. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Error saving vitals:", error)
      alert("Failed to save vitals. Please try again.")
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <label htmlFor="patient-search" className="sr-only">
          Search patients
        </label>
        <Input
          id="patient-search"
          placeholder="Search patients, doctors, status, or time"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="rounded-lg border bg-card">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No patients found.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((apt) => {
              const currentStatus = getPatientStatus(apt)
              return (
                <li
                  key={apt.id}
                  className={cn(
                    "p-4 flex items-center justify-between gap-4",
                    pendingNotes[apt.id] && "bg-alert/10 border-l-4 border-l-alert",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/patients/${apt.patient_id || apt.id}?name=${encodeURIComponent(apt.patient)}`}
                        className="text-base font-semibold text-pretty text-primary hover:underline"
                      >
                        {apt.patient}
                      </Link>
                      <Badge className={cn("capitalize", statusColor[currentStatus] || "")}>
                        {currentStatus.replace("-", " ")}
                      </Badge>
                      {pendingNotes[apt.id] && (
                        <Badge className="bg-alert/20 text-alert animate-pulse">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Pending Action
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: <span className="tabular-nums">{String(apt.id)}</span> • {apt.doctor}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-2">
                    {(currentStatus === "waiting" || currentStatus === "scheduled") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setInfoOpen(true)
                          }}
                        >
                          <Info className="mr-1 h-3.5 w-3.5" />
                          Info
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setVitalsOpen(true)
                          }}
                        >
                          <Activity className="mr-1 h-3.5 w-3.5" />
                          Vitals
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          className="bg-primary"
                          onClick={() => handleCheckIn(apt.id)}
                        >
                          <UserCheck className="mr-1 h-3.5 w-3.5" />
                          Check-in
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-action-delete border-action-delete hover:bg-action-delete hover:text-white bg-transparent"
                          onClick={() => handleRemove(apt.id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </>
                    )}

                    {currentStatus !== "scheduled" && currentStatus !== "waiting" && currentStatus !== "completed" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setInfoOpen(true)
                          }}
                        >
                          <Info className="mr-1 h-3.5 w-3.5" />
                          Info
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setVitalsOpen(true)
                          }}
                          disabled={done[apt.id]?.vitals}
                        >
                          <Activity className="mr-1 h-3.5 w-3.5" />
                          Vitals
                        </Button>

                        {currentStatus === "consultation-complete" || currentStatus === "payment-pending" ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-success"
                            onClick={() => handlePaymentComplete(apt.id)}
                          >
                            <CreditCard className="mr-1 h-3.5 w-3.5" />
                            Mark Done
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelected(apt)
                              setPaymentAmount("")
                              setPaymentOpen(true)
                            }}
                          >
                            <CreditCard className="mr-1 h-3.5 w-3.5" />
                            Payment
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setReminderOpen(true)
                          }}
                        >
                          <Bell className="mr-1 h-3.5 w-3.5" />
                          Reminder
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelected(apt)
                            setScheduleOpen(true)
                          }}
                        >
                          <CalendarClock className="mr-1 h-3.5 w-3.5" />
                          Schedule
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-action-delete border-action-delete hover:bg-action-delete hover:text-white bg-transparent"
                          onClick={() => handleRemove(apt.id)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Information</DialogTitle>
            <DialogDescription>Basic details for quick reference</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selected.patient}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{selected.age || "N/A"} yrs</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-semibold">{selected.bloodGroup || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Appointment Time</p>
                  <p className="font-semibold">{selected.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-semibold">{selected.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="font-semibold">{selected.visits || 0}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setInfoOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accept payment</DialogTitle>
            <DialogDescription>
              {selected ? `Record payment for ${selected.patient} (${selected.time}).` : "Record payment."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (selected) {
                markDone(selected.id, "payment")
                setPatientStatus((prev) => ({ ...prev, [selected.id]: "payment-pending" }))
              }
              setPaymentOpen(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-sm">Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as "card" | "cash" | "upi")}
                className="grid grid-cols-3 gap-3"
              >
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem id="pm-card" value="card" />
                  <Label htmlFor="pm-card" className="cursor-pointer">
                    Card
                  </Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem id="pm-cash" value="cash" />
                  <Label htmlFor="pm-cash" className="cursor-pointer">
                    Cash
                  </Label>
                </div>
                <div className="flex items-center gap-2 rounded-md border p-2">
                  <RadioGroupItem id="pm-upi" value="upi" />
                  <Label htmlFor="pm-upi" className="cursor-pointer">
                    UPI
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pm-amount">Amount</Label>
              <Input
                id="pm-amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setPaymentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Mark as paid</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send reminder</DialogTitle>
            <DialogDescription>
              {selected ? `Choose reminder for ${selected.patient}.` : "Choose reminder and channel(s)."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (selected) markDone(selected.id, "reminder")
              setReminderOpen(false)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="reminder-type">Reminder type</Label>
              <select
                id="reminder-type"
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="appointment">Appointment reminder</option>
                <option value="previsit">Pre-visit instructions</option>
                <option value="reports">Bring previous reports</option>
                <option value="fasting">Fasting required</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={reminderChannels.has("sms")}
                    onCheckedChange={(c) => toggleReminderChannel("sms", c)}
                    id="ch-sms"
                  />
                  <span className="text-sm">SMS</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={reminderChannels.has("whatsapp")}
                    onCheckedChange={(c) => toggleReminderChannel("whatsapp", c)}
                    id="ch-wa"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={reminderChannels.has("email")}
                    onCheckedChange={(c) => toggleReminderChannel("email", c)}
                    id="ch-email"
                  />
                  <span className="text-sm">Email</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-msg">Message (optional)</Label>
              <Textarea id="reminder-msg" placeholder="Include details or instructions..." />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setReminderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule appointment</DialogTitle>
            <DialogDescription>
              {selected ? `Select date & time for ${selected.patient}.` : "Select date & time."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (selected) markDone(selected.id, "schedule")
              setScheduleOpen(false)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Date</Label>
                <input
                  id="schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <input
                  id="schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Share details via</Label>
              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={scheduleChannels.has("sms")}
                    onCheckedChange={(c) => toggleScheduleChannel("sms", c)}
                    id="sc-sms"
                  />
                  <span className="text-sm">SMS</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={scheduleChannels.has("whatsapp")}
                    onCheckedChange={(c) => toggleScheduleChannel("whatsapp", c)}
                    id="sc-wa"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border p-2 cursor-pointer">
                  <Checkbox
                    checked={scheduleChannels.has("email")}
                    onCheckedChange={(c) => toggleScheduleChannel("email", c)}
                    id="sc-email"
                  />
                  <span className="text-sm">Email</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={vitalsOpen} onOpenChange={setVitalsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter vitals</DialogTitle>
            <DialogDescription>
              {selected ? `Record vitals, allergies, and conditions for ${selected.patient}.` : "Record vitals."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVitalsSave} className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Vital Signs</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="v-height">Height (cm)</Label>
                  <input
                    id="v-height"
                    type="number"
                    inputMode="decimal"
                    placeholder="170"
                    value={vHeight}
                    onChange={(e) => setVHeight(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-weight">Weight (kg)</Label>
                  <input
                    id="v-weight"
                    type="number"
                    inputMode="decimal"
                    placeholder="65"
                    value={vWeight}
                    onChange={(e) => setVWeight(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-bp-sys">BP Systolic (mmHg)</Label>
                  <input
                    id="v-bp-sys"
                    type="number"
                    inputMode="numeric"
                    placeholder="120"
                    value={vBpSys}
                    onChange={(e) => setVBpSys(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-bp-dia">BP Diastolic (mmHg)</Label>
                  <input
                    id="v-bp-dia"
                    type="number"
                    inputMode="numeric"
                    placeholder="80"
                    value={vBpDia}
                    onChange={(e) => setVBpDia(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-spo2">SpO₂ (%)</Label>
                  <input
                    id="v-spo2"
                    type="number"
                    inputMode="numeric"
                    placeholder="98"
                    value={vSpo2}
                    onChange={(e) => setVSpo2(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-heart-rate">Heart Rate (bpm)</Label>
                  <input
                    id="v-heart-rate"
                    type="number"
                    inputMode="numeric"
                    placeholder="72"
                    value={vHeartRate}
                    onChange={(e) => setVHeartRate(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-temperature">Temperature (°F)</Label>
                  <input
                    id="v-temperature"
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder="98.6"
                    value={vTemperature}
                    onChange={(e) => setVTemperature(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-foreground">Allergies & Conditions</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="v-allergies">Allergies</Label>
                  <Textarea
                    id="v-allergies"
                    placeholder="e.g., Penicillin, Peanuts, Latex..."
                    value={vAllergies}
                    onChange={(e) => setVAllergies(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="v-conditions">Medical Conditions</Label>
                  <Textarea
                    id="v-conditions"
                    placeholder="e.g., Diabetes, Hypertension, Asthma..."
                    value={vConditions}
                    onChange={(e) => setVConditions(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setVitalsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Vitals</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Patient from Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this patient from the queue? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-action-delete hover:bg-action-delete/90 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
