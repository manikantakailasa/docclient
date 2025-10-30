"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ReminderChannels = {
  sms: boolean
  whatsapp: boolean
  email: boolean
}

const currencies = ["USD", "EUR", "INR", "GBP", "AED", "AUD"]
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]
const timezones = ["UTC", "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Singapore", "Australia/Sydney"]

// Mock provider list until wired to backend
const mockDoctors = [
  { id: "d-101", name: "Dr. A. Sharma (FM)" },
  { id: "d-102", name: "Dr. L. Mehta (Peds)" },
  { id: "d-103", name: "Dr. P. Rao (Gyn)" },
]

// Helper to build a preview for Patient ID format
function buildPatientId(format: string, d = new Date(), seq = 42, clinicCode = "CLN") {
  const YYYY = String(d.getFullYear())
  const MM = String(d.getMonth() + 1).padStart(2, "0")
  const DD = String(d.getDate()).padStart(2, "0")
  // Support {SEQ:n} token
  const seqMatch = format.match(/\{SEQ:(\d+)\}/)
  const seqLen = seqMatch ? Number(seqMatch[1]) : 4
  const SEQ = String(seq).padStart(seqLen, "0")

  return format
    .replace(/\{YYYY\}/g, YYYY)
    .replace(/\{MM\}/g, MM)
    .replace(/\{DD\}/g, DD)
    .replace(/\{SEQ:\d+\}/g, SEQ)
    .replace(/\{CLINIC\}/g, clinicCode)
}

// Helper to build a simple receipt preview
function buildReceiptPreview(template: string, org: OrgConfig) {
  const d = new Date()
  const date =
    org.dateFormat === "DD/MM/YYYY"
      ? `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
      : org.dateFormat === "MM/DD/YYYY"
        ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  return template
    .replaceAll("{RECEIPT_NO}", "RCP-0001")
    .replaceAll("{PATIENT_NAME}", "John Doe")
    .replaceAll("{DATE}", date)
    .replaceAll("{CURRENCY}", org.currency)
    .replaceAll("{AMOUNT}", String(org.consultationFee))
    .replaceAll("{CLINIC_NAME}", org.clinicName || "ClinHat")
    .replaceAll("{CLINIC_PHONE}", org.clinicPhone || "+00 000 0000")
}

type OrgConfig = {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  currency: string
  consultationFee: number
  defaultDoctorId: string
  prescriptionHeader: string
  prescriptionFooter: string
  showPrescriptionHeader: boolean
  showPrescriptionFooter: boolean
  includeQrOnReceipt: boolean
  includeLogoOnPrescription: boolean
  patientIdFormat: string
  timezone: string
  dateFormat: string
  appointmentDurationMin: number
  receiptTemplate: string
  reminderDefaultChannels: ReminderChannels
  actionColors: {
    delete: string
    edit: string
    save: string
    add: string
  }
}

export default function Configure() {
  // Feature toggles
  const [features, setFeatures] = useState({
    reminders: true,
    aiAssist: true,
    codingSuggestions: true,
    eRx: false,
    labs: false,
    whiteLabel: true,
  })
  function toggle(key: keyof typeof features) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Organization configuration
  const [org, setOrg] = useState<OrgConfig>({
    clinicName: "ClinHat",
    clinicAddress: "",
    clinicPhone: "",
    clinicEmail: "",
    currency: "INR",
    consultationFee: 500,
    defaultDoctorId: mockDoctors[0]?.id || "",
    prescriptionHeader: "ClinHat — {CLINIC_NAME}",
    prescriptionFooter: "For emergencies, call {CLINIC_PHONE}",
    showPrescriptionHeader: true,
    showPrescriptionFooter: true,
    includeQrOnReceipt: false,
    includeLogoOnPrescription: true,
    patientIdFormat: "CLN-{YYYY}{MM}-{SEQ:4}",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    appointmentDurationMin: 15,
    receiptTemplate:
      "Receipt #{RECEIPT_NO}\nPatient: {PATIENT_NAME}\nDate: {DATE}\nAmount: {CURRENCY} {AMOUNT}\n— {CLINIC_NAME}",
    reminderDefaultChannels: { sms: true, whatsapp: true, email: false },
    actionColors: {
      delete: "oklch(0.577 0.245 27.325)",
      edit: "oklch(0.75 0.18 45)",
      save: "oklch(0.7 0.2 155)",
      add: "oklch(0.6 0.27 293)",
    },
  })

  const patientIdPreview = useMemo(() => buildPatientId(org.patientIdFormat), [org.patientIdFormat])
  const receiptPreview = useMemo(() => buildReceiptPreview(org.receiptTemplate, org), [org.receiptTemplate, org])

  function saveConfiguration() {
    // Persist via server action later; logging for now
    console.log("[v0] Saving configuration:", { features, org })
    alert("Configuration saved (mock).")
  }

  return (
    <div className="space-y-6">
      {/* Feature Toggles */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Feature Toggles</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(
            [
              ["reminders", "Reminders"],
              ["aiAssist", "AI Assist"],
              ["codingSuggestions", "Coding Suggestions"],
              ["eRx", "eRx (Electronic Prescribing)"],
              ["labs", "Labs Integration"],
              ["whiteLabel", "White Labeling"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">Enable or disable this module for your clinics.</p>
              </div>
              <Switch checked={features[key]} onCheckedChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </Card>

      {/* Identity & Contact */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Clinic Identity & Contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Clinic/Brand Name</label>
            <Input
              value={org.clinicName}
              onChange={(e) => setOrg((o) => ({ ...o, clinicName: e.target.value }))}
              placeholder="ClinHat"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contact Phone</label>
            <Input
              value={org.clinicPhone}
              onChange={(e) => setOrg((o) => ({ ...o, clinicPhone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Address</label>
            <Textarea
              value={org.clinicAddress}
              onChange={(e) => setOrg((o) => ({ ...o, clinicAddress: e.target.value }))}
              placeholder="Street, City, State, ZIP"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={org.clinicEmail}
              onChange={(e) => setOrg((o) => ({ ...o, clinicEmail: e.target.value }))}
              placeholder="clinic@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Timezone</label>
            <select
              className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
              value={org.timezone}
              onChange={(e) => setOrg((o) => ({ ...o, timezone: e.target.value }))}
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Patient Identifiers */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Patient Identifiers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Patient ID Format
              <span className="ml-2 text-xs text-muted-foreground">
                Use tokens: {"{YYYY}"}, {"{MM}"}, {"{DD}"}, {"{SEQ:n}"}, {"{CLINIC}"}
              </span>
            </label>
            <Input
              value={org.patientIdFormat}
              onChange={(e) => setOrg((o) => ({ ...o, patientIdFormat: e.target.value }))}
              placeholder="CLN-{YYYY}{MM}-{SEQ:4}"
            />
            <p className="mt-2 text-xs text-muted-foreground">Preview</p>
            <div className="rounded-md border bg-muted/40 p-2 font-mono text-sm">{patientIdPreview}</div>
          </div>
        </div>
      </Card>

      {/* Financials */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Financials</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Currency</label>
            <select
              className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
              value={org.currency}
              onChange={(e) => setOrg((o) => ({ ...o, currency: e.target.value }))}
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Fixed Consultation Fee</label>
            <div className="flex items-center gap-2">
              <span className="rounded-md border bg-muted/40 px-2 py-1 text-xs">{org.currency}</span>
              <Input
                type="number"
                min={0}
                value={org.consultationFee}
                onChange={(e) => setOrg((o) => ({ ...o, consultationFee: Number(e.target.value) }))}
                placeholder="500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Default Doctor</label>
            <select
              className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
              value={org.defaultDoctorId}
              onChange={(e) => setOrg((o) => ({ ...o, defaultDoctorId: e.target.value }))}
            >
              {mockDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Prescription Print */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Prescription Print</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Header</label>
              <Switch
                checked={org.showPrescriptionHeader}
                onCheckedChange={(v) => setOrg((o) => ({ ...o, showPrescriptionHeader: v }))}
              />
            </div>
            <Textarea
              className="mt-2"
              rows={3}
              value={org.prescriptionHeader}
              onChange={(e) => setOrg((o) => ({ ...o, prescriptionHeader: e.target.value }))}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Footer</label>
              <Switch
                checked={org.showPrescriptionFooter}
                onCheckedChange={(v) => setOrg((o) => ({ ...o, showPrescriptionFooter: v }))}
              />
            </div>
            <Textarea
              className="mt-2"
              rows={3}
              value={org.prescriptionFooter}
              onChange={(e) => setOrg((o) => ({ ...o, prescriptionFooter: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border p-3 md:col-span-2">
            <div>
              <p className="text-sm font-medium">Include Logo on Prescription</p>
              <p className="text-xs text-muted-foreground">Render clinic logo in the print header.</p>
            </div>
            <Switch
              checked={org.includeLogoOnPrescription}
              onCheckedChange={(v) => setOrg((o) => ({ ...o, includeLogoOnPrescription: v }))}
            />
          </div>
        </div>
      </Card>

      {/* Defaults & Preferences */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Defaults & Preferences</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Date Format</label>
            <select
              className="mt-1 w-full rounded-md border bg-background p-2 text-sm"
              value={org.dateFormat}
              onChange={(e) => setOrg((o) => ({ ...o, dateFormat: e.target.value }))}
            >
              {dateFormats.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Default Appointment Duration (min)</label>
            <Input
              type="number"
              min={5}
              step={5}
              value={org.appointmentDurationMin}
              onChange={(e) => setOrg((o) => ({ ...o, appointmentDurationMin: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reminder Defaults</label>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={org.reminderDefaultChannels.sms}
                  onChange={(e) =>
                    setOrg((o) => ({
                      ...o,
                      reminderDefaultChannels: { ...o.reminderDefaultChannels, sms: e.target.checked },
                    }))
                  }
                />
                SMS
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={org.reminderDefaultChannels.whatsapp}
                  onChange={(e) =>
                    setOrg((o) => ({
                      ...o,
                      reminderDefaultChannels: { ...o.reminderDefaultChannels, whatsapp: e.target.checked },
                    }))
                  }
                />
                WhatsApp
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={org.reminderDefaultChannels.email}
                  onChange={(e) =>
                    setOrg((o) => ({
                      ...o,
                      reminderDefaultChannels: { ...o.reminderDefaultChannels, email: e.target.checked },
                    }))
                  }
                />
                Email
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Receipts */}
      <Card className="p-4">
        <h2 className="font-semibold text-lg">Clinic Receipts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Receipt Template</label>
            <Textarea
              className="mt-2"
              rows={8}
              value={org.receiptTemplate}
              onChange={(e) => setOrg((o) => ({ ...o, receiptTemplate: e.target.value }))}
              placeholder={"Use tokens like {RECEIPT_NO}, {PATIENT_NAME}, {DATE}, {CURRENCY}, {AMOUNT}, {CLINIC_NAME}"}
            />
            <div className="mt-2 flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Include QR on Receipt</p>
                <p className="text-xs text-muted-foreground">Adds a payment/verify QR code to printed receipts.</p>
              </div>
              <Switch
                checked={org.includeQrOnReceipt}
                onCheckedChange={(v) => setOrg((o) => ({ ...o, includeQrOnReceipt: v }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Live Preview</label>
            <pre className="mt-2 h-[220px] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-5">
              {receiptPreview}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              Tokens: {"{RECEIPT_NO}"}, {"{PATIENT_NAME}"}, {"{DATE}"}, {"{CURRENCY}"}, {"{AMOUNT}"}, {"{CLINIC_NAME}"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold text-lg">Action Button Colors</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the colors for standard action buttons across the application.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              Delete Button Color
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: org.actionColors.delete }} />
            </label>
            <Input
              value={org.actionColors.delete}
              onChange={(e) =>
                setOrg((o) => ({
                  ...o,
                  actionColors: { ...o.actionColors, delete: e.target.value },
                }))
              }
              placeholder="oklch(0.577 0.245 27.325)"
              className="mt-2 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Red by default</p>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              Edit Button Color
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: org.actionColors.edit }} />
            </label>
            <Input
              value={org.actionColors.edit}
              onChange={(e) =>
                setOrg((o) => ({
                  ...o,
                  actionColors: { ...o.actionColors, edit: e.target.value },
                }))
              }
              placeholder="oklch(0.75 0.18 45)"
              className="mt-2 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Orange by default</p>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              Save Button Color
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: org.actionColors.save }} />
            </label>
            <Input
              value={org.actionColors.save}
              onChange={(e) =>
                setOrg((o) => ({
                  ...o,
                  actionColors: { ...o.actionColors, save: e.target.value },
                }))
              }
              placeholder="oklch(0.7 0.2 155)"
              className="mt-2 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Green by default</p>
          </div>
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              Add Button Color
              <div className="w-6 h-6 rounded border" style={{ backgroundColor: org.actionColors.add }} />
            </label>
            <Input
              value={org.actionColors.add}
              onChange={(e) =>
                setOrg((o) => ({
                  ...o,
                  actionColors: { ...o.actionColors, add: e.target.value },
                }))
              }
              placeholder="oklch(0.6 0.27 293)"
              className="mt-2 font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Purple by default</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Use OKLCH color format for best results. Changes will apply to all action buttons across the application.
        </p>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" className="bg-transparent">
          Cancel
        </Button>
        <Button onClick={saveConfiguration}>Save Configuration</Button>
      </div>
    </div>
  )
}
