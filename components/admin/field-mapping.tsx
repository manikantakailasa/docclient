"use client"
import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type MappingItem = {
  id: string // stable id
  category: "Patient" | "Appointment" | "Clinical" | "Prescription" | "Payment" | "Admin"
  key: string // internal key
  defaultLabel: string
  label: string
  description: string
  visible: boolean
  notes?: string
}

const DEFAULT_MAPPINGS: MappingItem[] = [
  // Patient
  {
    id: "patientId",
    category: "Patient",
    key: "patientId",
    defaultLabel: "Patient ID",
    label: "Patient ID",
    description: "Unique patient identifier in our system",
    visible: true,
  },
  {
    id: "firstName",
    category: "Patient",
    key: "firstName",
    defaultLabel: "First Name",
    label: "First Name",
    description: "Given name of the patient",
    visible: true,
  },
  {
    id: "lastName",
    category: "Patient",
    key: "lastName",
    defaultLabel: "Last Name",
    label: "Last Name",
    description: "Family name of the patient",
    visible: true,
  },
  {
    id: "dob",
    category: "Patient",
    key: "dateOfBirth",
    defaultLabel: "Date of Birth",
    label: "Date of Birth",
    description: "Birth date in configured date format",
    visible: true,
  },
  {
    id: "gender",
    category: "Patient",
    key: "gender",
    defaultLabel: "Gender",
    label: "Gender",
    description: "Patient gender (M/F/O)",
    visible: true,
  },
  {
    id: "phone",
    category: "Patient",
    key: "phone",
    defaultLabel: "Phone",
    label: "Phone",
    description: "Primary contact number",
    visible: true,
  },
  {
    id: "email",
    category: "Patient",
    key: "email",
    defaultLabel: "Email",
    label: "Email",
    description: "Primary email address",
    visible: true,
  },
  {
    id: "address",
    category: "Patient",
    key: "address",
    defaultLabel: "Address",
    label: "Address",
    description: "Street, city, state, postal code",
    visible: true,
  },
  {
    id: "allergies",
    category: "Patient",
    key: "allergies",
    defaultLabel: "Allergies",
    label: "Allergies",
    description: "Known allergies recorded for the patient",
    visible: true,
  },
  {
    id: "conditions",
    category: "Patient",
    key: "conditions",
    defaultLabel: "Conditions",
    label: "Conditions",
    description: "Chronic or active medical conditions",
    visible: true,
  },

  // Appointment
  {
    id: "appointmentId",
    category: "Appointment",
    key: "appointmentId",
    defaultLabel: "Appointment ID",
    label: "Appointment ID",
    description: "Unique appointment identifier",
    visible: true,
  },
  {
    id: "apptDate",
    category: "Appointment",
    key: "date",
    defaultLabel: "Date",
    label: "Date",
    description: "Appointment date",
    visible: true,
  },
  {
    id: "apptTime",
    category: "Appointment",
    key: "time",
    defaultLabel: "Time",
    label: "Time",
    description: "Appointment time",
    visible: true,
  },
  {
    id: "reason",
    category: "Appointment",
    key: "reason",
    defaultLabel: "Reason",
    label: "Reason",
    description: "Chief complaint or visit reason",
    visible: true,
  },
  {
    id: "status",
    category: "Appointment",
    key: "status",
    defaultLabel: "Status",
    label: "Status",
    description: "Scheduled, Checked-in, In review, Completed, etc.",
    visible: true,
  },

  // Clinical
  {
    id: "vitals",
    category: "Clinical",
    key: "vitals",
    defaultLabel: "Vitals",
    label: "Vitals",
    description: "Height, Weight, BP, SpO₂, etc.",
    visible: true,
  },
  {
    id: "diagnosis",
    category: "Clinical",
    key: "diagnosis",
    defaultLabel: "Diagnosis",
    label: "Diagnosis",
    description: "ICD-10 or clinical impression",
    visible: true,
  },
  {
    id: "orders",
    category: "Clinical",
    key: "orders",
    defaultLabel: "Orders",
    label: "Orders",
    description: "Lab/Radiology orders",
    visible: true,
  },
  {
    id: "labs",
    category: "Clinical",
    key: "labResults",
    defaultLabel: "Lab Results",
    label: "Lab Results",
    description: "Incoming lab results and values",
    visible: true,
  },

  // Prescription
  {
    id: "prescription",
    category: "Prescription",
    key: "prescription",
    defaultLabel: "Prescription",
    label: "Prescription",
    description: "Medications, dosage, frequency, duration, instructions",
    visible: true,
  },
  {
    id: "medication",
    category: "Prescription",
    key: "medicationName",
    defaultLabel: "Medication",
    label: "Medication",
    description: "Drug name",
    visible: true,
  },
  {
    id: "dose",
    category: "Prescription",
    key: "dose",
    defaultLabel: "Dose",
    label: "Dose",
    description: "Strength/dose",
    visible: true,
  },
  {
    id: "frequency",
    category: "Prescription",
    key: "frequency",
    defaultLabel: "Frequency",
    label: "Frequency",
    description: "How often to take",
    visible: true,
  },
  {
    id: "duration",
    category: "Prescription",
    key: "duration",
    defaultLabel: "Duration",
    label: "Duration",
    description: "How long to take",
    visible: true,
  },
  {
    id: "instructions",
    category: "Prescription",
    key: "instructions",
    defaultLabel: "Instructions",
    label: "Instructions",
    description: "SIG or special notes",
    visible: true,
  },

  // Payment (no claims needed, just collection)
  {
    id: "paymentStatus",
    category: "Payment",
    key: "paymentStatus",
    defaultLabel: "Payment Status",
    label: "Payment Status",
    description: "Paid / Pending / Partial",
    visible: true,
  },
  {
    id: "paymentMethod",
    category: "Payment",
    key: "paymentMethod",
    defaultLabel: "Payment Method",
    label: "Payment Method",
    description: "Card, Cash, UPI",
    visible: true,
  },
  {
    id: "receiptNumber",
    category: "Payment",
    key: "receiptNumber",
    defaultLabel: "Receipt Number",
    label: "Receipt Number",
    description: "Clinic receipt identifier",
    visible: true,
  },
  {
    id: "consultationFee",
    category: "Payment",
    key: "consultationFee",
    defaultLabel: "Consultation Fee",
    label: "Consultation Fee",
    description: "Fixed fee configured in Admin",
    visible: true,
  },

  // Admin / Provider / Clinic
  {
    id: "providerId",
    category: "Admin",
    key: "providerId",
    defaultLabel: "Provider ID",
    label: "Provider ID",
    description: "Doctor/provider identifier",
    visible: true,
  },
  {
    id: "providerName",
    category: "Admin",
    key: "providerName",
    defaultLabel: "Provider Name",
    label: "Provider Name",
    description: "Doctor/provider full name",
    visible: true,
  },
  {
    id: "clinicName",
    category: "Admin",
    key: "clinicName",
    defaultLabel: "Clinic Name",
    label: "Clinic Name",
    description: "Display name of the clinic",
    visible: true,
  },
]

export default function FieldMapping() {
  const [query, setQuery] = useState("")
  const [items, setItems] = useState<MappingItem[]>(DEFAULT_MAPPINGS)

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))) as MappingItem["category"][],
    [items],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.category.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        i.label.toLowerCase().includes(q) ||
        i.defaultLabel.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q),
    )
  }, [items, query])

  function updateItem(id: string, patch: Partial<MappingItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  function resetDefaults() {
    setItems(DEFAULT_MAPPINGS)
  }

  function handleSave() {
    // Replace with server action later
    const payload = items.reduce<Record<string, any>>((acc, i) => {
      acc[i.key] = { label: i.label, visible: i.visible, notes: i.notes ?? "" }
      return acc
    }, {})
    // eslint-disable-next-line no-console
    console.log("[v0] Saving field mappings:", payload)
    alert("Field mappings saved (mock).")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Field Mapping</h2>
          <p className="text-sm text-muted-foreground">
            Customize labels and visibility for clinic-facing terminology. For example, map “Patient ID” to “MRN”.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields..."
            className="w-56"
          />
          <Button variant="outline" onClick={resetDefaults}>
            Restore defaults
          </Button>
          <Button onClick={handleSave}>Save mappings</Button>
        </div>
      </div>

      {categories.map((cat) => {
        const rows = filtered.filter((f) => f.category === cat)
        if (rows.length === 0) return null
        return (
          <div key={cat} className="space-y-2">
            <h3 className="text-base font-medium">{cat}</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Internal field</TableHead>
                    <TableHead className="w-[18%]">Default label</TableHead>
                    <TableHead className="w-[28%]">Your label</TableHead>
                    <TableHead className="w-[14%]">Visible</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <code className="text-sm">{r.key}</code>
                          <span className="text-[12px] text-muted-foreground">{r.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>{r.defaultLabel}</TableCell>
                      <TableCell>
                        <Input
                          value={r.label}
                          onChange={(e) => updateItem(r.id, { label: e.target.value })}
                          placeholder={`e.g., ${r.defaultLabel === "Patient ID" ? "MRN" : r.defaultLabel}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={r.visible} onCheckedChange={(v) => updateItem(r.id, { visible: v })} />
                          <span className="text-xs text-muted-foreground">{r.visible ? "Shown" : "Hidden"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={r.notes ?? ""}
                          onChange={(e) => updateItem(r.id, { notes: e.target.value })}
                          placeholder="Optional help text for staff"
                          className="min-h-9"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
