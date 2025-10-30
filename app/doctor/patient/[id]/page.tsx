"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  User,
  Activity,
  Heart,
  Stethoscope,
  FileText,
  Clock,
  AlertTriangle,
  MessageSquare,
} from "lucide-react"
import { evaluateBP, evaluateSpO2, getVitalColorClasses } from "@/lib/vitals-rules"
import PrescriptionAutocomplete from "@/components/prescription-autocomplete"
import { getLatestPatientVitals, getPatientDetails } from "@/lib/actions/vitals"
import { getPatientVisitHistory } from "@/lib/actions/patient-data"
import { savePrescription, getLastPrescription } from "@/lib/actions/prescriptions"
import { saveConsultation } from "@/lib/actions/consultation"
import { saveNote, getPatientNotes } from "@/lib/actions/notes"
import { toast } from "sonner"
import { getTodayAppointments } from "@/lib/actions/appointments"

export default function PatientToolsPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const search = useSearchParams()
  const patientName = search.get("name") || `Patient ${params.id}`

  const [patientData, setPatientData] = useState<any>(null)
  const [latestVitals, setLatestVitals] = useState<any>(null)
  const [visitHistory, setVisitHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [appointmentId, setAppointmentId] = useState<string>("")
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null)
  const [isNewPatient, setIsNewPatient] = useState(true)

  useEffect(() => {
    async function loadPatientData() {
      try {
        const patient = await getPatientDetails(params.id)
        setPatientData(patient)

        const vitals = await getLatestPatientVitals(params.id)
        setLatestVitals(vitals)

        const history = await getPatientVisitHistory(params.id)
        setVisitHistory(history)

        // Determine if new patient and last visit date
        setIsNewPatient(history.length === 0)
        if (history.length > 0) {
          setLastVisitDate(history[0].visit_date)
        }

        const aptId = search.get("appointmentId")
        if (aptId) {
          setAppointmentId(aptId)
        } else {
          // Find active checked-in appointment for this patient
          const { data: appointments } = await getTodayAppointments()
          const activeApt = appointments?.find(
            (apt: any) => apt.patient_id === params.id && apt.status === "checked-in",
          )
          if (activeApt) {
            setAppointmentId(activeApt.id)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading patient data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPatientData()
  }, [params.id, search])

  const handleMarkComplete = () => {
    router.push("/doctor")
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print()
  }

  // Prescription state and handlers
  type RxRow = {
    medicine: string
    dose: string
    frequency: string
    duration: string
    notes: string
  }

  const blankRow: RxRow = { medicine: "", dose: "", frequency: "", duration: "", notes: "" }
  const [rxRows, setRxRows] = useState<RxRow[]>([blankRow])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [diagnosis, setDiagnosis] = useState("")
  const [followUpDays, setFollowUpDays] = useState("")
  const [nextAppointmentNotes, setNextAppointmentNotes] = useState("")
  const [hasPreviousPrescriptions, setHasPreviousPrescriptions] = useState(false)

  useEffect(() => {
    async function checkPreviousPrescriptions() {
      const lastRx = await getLastPrescription(params.id)
      setHasPreviousPrescriptions(lastRx.length > 0)
    }
    checkPreviousPrescriptions()
  }, [params.id])

  const copyLastPrescription = async () => {
    const lastRx = await getLastPrescription(params.id)
    if (!lastRx.length) {
      toast.error("No previous prescriptions found")
      return
    }
    setRxRows(
      lastRx.map((p: any) => ({
        medicine: p.medicine || "",
        dose: p.dosage || "",
        frequency: p.frequency || "",
        duration: p.duration || "",
        notes: p.notes || "",
      })),
    )
    toast.success("Previous prescription copied")
  }

  const addRow = () => setRxRows((rows) => [...rows, { ...blankRow }])
  const removeRow = (index: number) => setRxRows((rows) => rows.filter((_, i) => i !== index))
  const updateRow = (index: number, field: keyof RxRow, value: string) =>
    setRxRows((rows) => rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)))

  const handlePreview = () => setPreviewOpen(true)

  const handleSavePrescription = async () => {
    if (!appointmentId) {
      toast.error("No active appointment found. Please check in the patient first.")
      return
    }

    const result = await savePrescription({
      patientId: params.id,
      appointmentId,
      prescriptions: rxRows.map((r) => ({
        medicine: r.medicine,
        dosage: r.dose,
        frequency: r.frequency,
        duration: r.duration,
        notes: r.notes,
      })),
      diagnosis,
      followUpDays,
      nextAppointmentNotes,
    })

    if (result.success) {
      toast.success("Prescription saved successfully")
      setRxRows([blankRow])
      setDiagnosis("")
      setFollowUpDays("")
      setNextAppointmentNotes("")
    } else {
      toast.error(result.error || "Failed to save prescription")
    }
  }

  const [chiefComplaint, setChiefComplaint] = useState("")
  const [previousComplications, setPreviousComplications] = useState("")
  const [assessmentPlan, setAssessmentPlan] = useState("")

  const handleSaveConsultation = async () => {
    if (!appointmentId) {
      toast.error("No active appointment found. Please check in the patient first.")
      return
    }

    const result = await saveConsultation({
      patientId: params.id,
      appointmentId,
      chiefComplaint,
      previousComplications,
      assessmentPlan,
    })

    if (result.success) {
      toast.success("Consultation saved successfully")
    } else {
      toast.error(result.error || "Failed to save consultation")
    }
  }

  const [noteRole, setNoteRole] = useState<"front-desk" | "doctor" | "admin">("front-desk")
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState<any[]>([])

  useEffect(() => {
    async function loadNotes() {
      const patientNotes = await getPatientNotes(params.id)
      setNotes(patientNotes)
    }
    loadNotes()
  }, [params.id])

  const handleAddNote = async () => {
    if (!noteText.trim()) return

    const result = await saveNote({
      patientId: params.id,
      noteType: noteRole,
      content: noteText,
      createdBy: "Current User", // TODO: Replace with actual user
    })

    if (result.success) {
      toast.success("Note saved successfully")
      setNoteText("")
      // Reload notes
      const patientNotes = await getPatientNotes(params.id)
      setNotes(patientNotes)
    } else {
      toast.error("Failed to save note")
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8">
      <div className="mb-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-pretty text-2xl font-bold tracking-tight text-primary md:text-3xl">
                  {patientName}
                </h1>
                <Badge
                  variant="outline"
                  className={
                    isNewPatient
                      ? "border-success bg-success/10 text-success"
                      : "border-secondary bg-secondary/10 text-secondary"
                  }
                >
                  {isNewPatient ? "New Patient" : "Follow-up"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Patient ID: {params.id.slice(0, 8)}</p>
              {lastVisitDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Last Visit: {new Date(lastVisitDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/doctor")}>
              Back to Today
            </Button>
            <Button
              onClick={handleMarkComplete}
              className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
            >
              <FileText className="mr-2 h-4 w-4" />
              Mark as complete
            </Button>
          </div>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-pretty">
              <AlertTriangle className="h-5 w-5 text-alert" />
              Allergies & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <div className="mb-2 text-sm font-semibold">Allergies</div>
              <div className="flex flex-wrap gap-2">
                {patientData?.allergies ? (
                  patientData.allergies.split(",").map((allergy: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-alert/50 bg-alert/5 text-alert">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {allergy.trim()}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No allergies recorded</span>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Conditions</div>
              <div className="flex flex-wrap gap-2">
                {patientData?.conditions ? (
                  patientData.conditions.split(",").map((condition: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="border-accent/50 bg-accent/5 text-primary">
                      <Activity className="mr-1 h-3 w-3" />
                      {condition.trim()}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No conditions recorded</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-pretty">
              <FileText className="h-5 w-5 text-secondary" />
              Patient Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-foreground">
                {patientData?.health_summary || "No health summary available yet."}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="border-success/50 bg-success/5 text-success">
                  <Activity className="mr-1 h-3 w-3" />
                  Stable
                </Badge>
                <Badge variant="outline" className="border-secondary/50 bg-secondary/5 text-primary">
                  Regular Follow-up
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="consultation" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger
            value="consultation"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Consultation
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Clock className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Heart className="mr-2 h-4 w-4" />
            Vitals
          </TabsTrigger>
          <TabsTrigger
            value="prescription"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="mr-2 h-4 w-4" />
            Prescription
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Stethoscope className="h-5 w-5" />
                Patient Concerns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chief Complaint & HPI</label>
                <Textarea
                  placeholder="Describe the patient's main concerns and history of present illness..."
                  className="min-h-[100px]"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Previous Complications / Relevant Conditions</label>
                <Textarea
                  placeholder="Note any previous complications or relevant medical history..."
                  className="min-h-[80px]"
                  value={previousComplications}
                  onChange={(e) => setPreviousComplications(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment & Plan</label>
                <Textarea
                  placeholder="Your clinical assessment and treatment plan..."
                  className="min-h-[100px]"
                  value={assessmentPlan}
                  onChange={(e) => setAssessmentPlan(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveConsultation}
                  className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Save Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-background text-primary">
                <Clock className="h-5 w-5" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {visitHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Visit History</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    This is the patient's first visit. Visit history will appear here after completing the consultation.
                  </p>
                </div>
              ) : (
                visitHistory.map((v: any) => (
                  <details
                    key={v.id}
                    className="group rounded-lg border border-secondary/20 bg-secondary/5 p-4 transition-all hover:border-secondary/40"
                  >
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-secondary" />
                        {new Date(v.visit_date).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground group-open:hidden">+ Expand</span>
                      <span className="hidden text-xs text-muted-foreground group-open:inline">− Collapse</span>
                    </summary>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="space-y-2 rounded-md border border-accent/20 bg-accent/5 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                          <Heart className="h-3 w-3" />
                          Vitals
                        </div>
                        <div className="space-y-1 text-xs text-foreground">
                          {v.vitals && v.vitals.length > 0 ? (
                            v.vitals.map((vital: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div>
                                  Height: <span className="font-medium">{vital.height_cm} cm</span>
                                </div>
                                <div>
                                  Weight: <span className="font-medium">{vital.weight} kg</span>
                                </div>
                                <div>
                                  BP:{" "}
                                  <span
                                    className={`font-medium ${getVitalColorClasses(evaluateBP(`${vital.bp_systolic}/${vital.bp_diastolic}`))}`}
                                  >
                                    {vital.bp_systolic}/{vital.bp_diastolic}
                                  </span>
                                </div>
                                <div>
                                  SpO₂:{" "}
                                  <span
                                    className={`font-medium ${getVitalColorClasses(evaluateSpO2(`${vital.spo2}%`))}`}
                                  >
                                    {vital.spo2}%
                                  </span>
                                </div>
                                <div>
                                  PBS: <span className="font-medium">{vital.pbs}</span>
                                </div>
                                <div>
                                  Temperature: <span className="font-medium">{vital.temperature_f} °F</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted-foreground">No vitals recorded</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 rounded-md border border-success/20 bg-success/5 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-success">
                          <FileText className="h-3 w-3" />
                          Prescriptions
                        </div>
                        {v.prescriptions && v.prescriptions.length > 0 ? (
                          <ul className="space-y-1 text-xs text-foreground">
                            {v.prescriptions.map((p: any, i: number) => (
                              <li key={i} className="rounded bg-success/10 p-1">
                                <div className="font-medium">{p.medicine}</div>
                                <div className="text-muted-foreground">
                                  {p.dosage}, {p.frequency}, {p.duration}
                                </div>
                                {p.notes && <div className="text-muted-foreground italic">{p.notes}</div>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-xs text-muted-foreground">None prescribed</div>
                        )}
                      </div>
                      <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <Activity className="h-3 w-3" />
                          Notes
                        </div>
                        <div className="text-xs text-foreground">{v.notes || "No notes"}</div>
                      </div>
                    </div>
                    {v.notes && (
                      <div className="mt-3 rounded-md border border-muted bg-muted/50 p-2 text-xs text-foreground">
                        <span className="font-semibold">Notes:</span> {v.notes}
                      </div>
                    )}
                  </details>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Heart className="h-5 w-5" />
                Vitals Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestVitals ? (
                <div className="rounded-lg border border-accent/20 bg-accent/5 p-6">
                  <h3 className="text-sm font-semibold mb-4 text-accent">Vitals Recorded at Front Desk</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Blood Pressure</span>
                      <span
                        className={`font-semibold text-lg ${getVitalColorClasses(evaluateBP(`${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}`))}`}
                      >
                        {latestVitals.bp_systolic}/{latestVitals.bp_diastolic} mmHg
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">SpO₂</span>
                      <span
                        className={`font-semibold text-lg ${getVitalColorClasses(evaluateSpO2(`${latestVitals.spo2}%`))}`}
                      >
                        {latestVitals.spo2}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Weight</span>
                      <span className="font-semibold text-lg text-foreground">{latestVitals.weight} kg</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Heart Rate</span>
                      <span className="font-semibold text-lg text-foreground">{latestVitals.heart_rate} bpm</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block">Temperature</span>
                      <span className="font-semibold text-lg text-foreground">{latestVitals.temperature}°F</span>
                    </div>
                    {latestVitals.bmi && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground block">BMI</span>
                        <span className="font-semibold text-lg text-foreground">{latestVitals.bmi}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <span className="text-xs text-muted-foreground">
                      Recorded on: {new Date(latestVitals.recorded_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Vitals Recorded</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Vitals have not been recorded by the front desk yet. Please ask the front desk to record vitals
                    before consultation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescription" className="space-y-4">
          <Card className="">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-success">
                <FileText className="h-5 w-5" />
                Prescription
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLastPrescription}
                  disabled={!hasPreviousPrescriptions}
                  aria-label="Copy last prescription"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy last
                </Button>
                <Button
                  size="sm"
                  onClick={addRow}
                  aria-label="Add prescription row"
                  className="bg-action-add text-action-add-foreground hover:bg-action-add/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add row
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rxRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <PrescriptionAutocomplete
                            value={row.medicine}
                            onChange={(value) => updateRow(idx, "medicine", value)}
                            placeholder="e.g., Amoxicillin"
                            aria-label={`Medicine row ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., 500mg"
                            value={row.dose}
                            onChange={(e) => updateRow(idx, "dose", e.target.value)}
                            aria-label={`Dose row ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., TID"
                            value={row.frequency}
                            onChange={(e) => updateRow(idx, "frequency", e.target.value)}
                            aria-label={`Frequency row ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., 5 days"
                            value={row.duration}
                            onChange={(e) => updateRow(idx, "duration", e.target.value)}
                            aria-label={`Duration row ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Instructions"
                            value={row.notes}
                            onChange={(e) => updateRow(idx, "notes", e.target.value)}
                            aria-label={`Notes row ${idx + 1}`}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove row ${idx + 1}`}
                            onClick={() => removeRow(idx)}
                            className="text-action-delete hover:bg-action-delete/10 hover:text-action-delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <Input
                  placeholder="Diagnosis / ICD-10 (optional)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
                <Input
                  placeholder="Follow-up in (days)"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                />
                <Input
                  placeholder="Next appointment notes"
                  value={nextAppointmentNotes}
                  onChange={(e) => setNextAppointmentNotes(e.target.value)}
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="secondary" onClick={handlePreview} aria-label="Preview prescription">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  Print
                </Button>
                <Button
                  onClick={handleSavePrescription}
                  className="bg-action-save text-action-save-foreground hover:bg-action-save/90"
                >
                  Save Prescription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prescription preview modal */}
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Prescription Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{patientName}</div>
                    <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Prescription summary</div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Dose</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rxRows.length ? (
                        rxRows.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.medicine || "—"}</TableCell>
                            <TableCell>{r.dose || "—"}</TableCell>
                            <TableCell>{r.frequency || "—"}</TableCell>
                            <TableCell>{r.duration || "—"}</TableCell>
                            <TableCell>{r.notes || "—"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                            No items
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handlePrint}>Print</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-chart-3">
                <MessageSquare className="h-5 w-5" />
                Internal Notes & Communication
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add notes for front desk, doctors, or admin. Front desk will be notified of additional charges.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Note Type</label>
                <select
                  value={noteRole}
                  onChange={(e) => setNoteRole(e.target.value as "front-desk" | "doctor" | "admin")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="front-desk">Front Desk (Billing & Charges)</option>
                  <option value="doctor">Doctor (Clinical Notes)</option>
                  <option value="admin">Admin (Administrative)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Textarea
                  placeholder="e.g., Patient requires additional ECG test. Please charge ₹500 extra for the procedure."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleAddNote}
                className="bg-action-add text-action-add-foreground hover:bg-action-add/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>

              <div className="space-y-3 mt-6">
                <h3 className="text-sm font-semibold">Recent Notes</h3>
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={
                            note.note_type === "front-desk"
                              ? "border-alert text-alert"
                              : note.note_type === "doctor"
                                ? "border-primary text-primary"
                                : "border-secondary text-secondary"
                          }
                        >
                          {note.note_type === "front-desk"
                            ? "Front Desk"
                            : note.note_type === "doctor"
                              ? "Doctor"
                              : "Admin"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                      <p className="text-sm text-muted-foreground">By: {note.created_by}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
