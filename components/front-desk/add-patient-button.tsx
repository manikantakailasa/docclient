"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { createPatient, searchPatients } from "@/lib/actions/patients"
import { createAppointmentWithVitals } from "@/lib/actions/appointments"

export default function AddPatientButton() {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [patientType, setPatientType] = React.useState<"new" | "followup">("new")
  const [visitType, setVisitType] = React.useState<"walkin" | "schedule">("walkin")

  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = React.useState<any>(null)
  const [isSearching, setIsSearching] = React.useState(false)

  // Patient details
  const [fullName, setFullName] = React.useState("")
  const [age, setAge] = React.useState("")
  const [gender, setGender] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [bloodGroup, setBloodGroup] = React.useState("")
  const [allergies, setAllergies] = React.useState("")
  const [conditions, setConditions] = React.useState("")

  const [appointmentDate, setAppointmentDate] = React.useState("")
  const [appointmentTime, setAppointmentTime] = React.useState("")

  async function handleSearch() {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchPatients(searchQuery)
      setSearchResults(results.data || [])
    } catch (err) {
      console.error("[v0] Error searching patients:", err)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectPatient(patient: any) {
    setSelectedPatient(patient)
    setFullName(patient.full_name)
    setAge(patient.age?.toString() || "")
    setGender(patient.gender || "")
    setPhone(patient.phone || "")
    setEmail(patient.email || "")
    setAddress(patient.address || "")
    setBloodGroup(patient.blood_group || "")
    setAllergies(patient.allergies || "")
    setConditions(patient.conditions || "")
    setSearchResults([])
  }

  function resetForm() {
    setPatientType("new")
    setVisitType("walkin")
    setSearchQuery("")
    setSearchResults([])
    setSelectedPatient(null)
    setFullName("")
    setAge("")
    setGender("")
    setPhone("")
    setEmail("")
    setAddress("")
    setBloodGroup("")
    setAllergies("")
    setConditions("")
    setAppointmentDate("")
    setAppointmentTime("")
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let patientId = selectedPatient?.id

      if (patientType === "new") {
        const result = await createPatient({
          fullName,
          age,
          gender,
          phone,
          email,
          address,
          bloodGroup,
          allergies,
          conditions,
        })
        patientId = result.data?.id
      }

      if (!patientId) {
        throw new Error("Patient ID not found")
      }

      const appointmentData = {
        patientId,
        visitType,
        appointmentDate: visitType === "schedule" ? appointmentDate : undefined,
        appointmentTime: visitType === "schedule" ? appointmentTime : undefined,
        chiefComplaint: "", // Empty for now, will be added later
        vitals: {}, // Empty vitals, will be added later
        status: visitType === "walkin" ? "waiting" : "scheduled", // Set status to "waiting" for walk-in, "scheduled" for appointments
      }

      await createAppointmentWithVitals(appointmentData)

      resetForm()
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process patient")
      console.error("[v0] Error processing patient:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1 bg-action-add text-action-add-foreground hover:bg-action-add/90"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add patient</span>
        <span className="sm:hidden">Add</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Check-in</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-alert/10 border border-alert/20 p-3 text-sm text-alert">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="patient-type">Patient Type</Label>
                <select
                  id="patient-type"
                  value={patientType}
                  onChange={(e) => {
                    const newType = e.target.value as "new" | "followup"
                    setPatientType(newType)
                    // Reset patient-specific fields when switching types
                    if (newType === "new") {
                      setSelectedPatient(null)
                      setSearchQuery("")
                      setSearchResults([])
                    }
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="new">New Patient</option>
                  <option value="followup">Follow-up / Review</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="visit-type">Visit Type</Label>
                <select
                  id="visit-type"
                  value={visitType}
                  onChange={(e) => setVisitType(e.target.value as "walkin" | "schedule")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="walkin">Walk-in</option>
                  <option value="schedule">Schedule Appointment</option>
                </select>
              </div>
            </div>

            {patientType === "followup" && (
              <div className="space-y-3 p-4 border rounded-lg">
                <Label>Search Patient</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or Patient ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
                  />
                  <Button type="button" onClick={handleSearch} disabled={isSearching} size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {searchResults.length > 0 && (
                  <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.mrn} • {patient.age} yrs • {patient.phone}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPatient && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                    <div className="font-medium text-primary">Selected: {selectedPatient.full_name}</div>
                    <div className="text-sm text-muted-foreground">{selectedPatient.mrn}</div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Patient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name *</Label>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={patientType === "followup" && !!selectedPatient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={patientType === "followup" && !!selectedPatient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    disabled={patientType === "followup" && !!selectedPatient}
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={patientType === "followup" && !!selectedPatient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={patientType === "followup" && !!selectedPatient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-group">Blood Group</Label>
                  <select
                    id="blood-group"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    disabled={patientType === "followup" && !!selectedPatient}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {visitType === "schedule" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="appt-date">Appointment Date *</Label>
                  <Input
                    id="appt-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appt-time">Appointment Time *</Label>
                  <Input
                    id="appt-time"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setOpen(false)
                  resetForm()
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                disabled={isLoading || (patientType === "followup" && !selectedPatient)}
              >
                {isLoading ? "Processing..." : visitType === "walkin" ? "Add to Queue" : "Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
