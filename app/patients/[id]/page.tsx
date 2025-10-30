import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { VisitHistory, type Visit } from "@/components/patients/visit-history"
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertTriangle,
  FileText,
  TrendingUp,
  Info,
  ClipboardList,
} from "lucide-react"
import { getPatientDetails, getPatientVisitHistory } from "@/lib/actions/patient-data"

function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export default async function PatientDetails({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { name?: string }
}) {
  const id = params.id

  if (!isValidUUID(id)) {
    return (
      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Patient ID</h2>
          <p className="text-muted-foreground mb-4">The patient ID format is invalid. Please check the URL.</p>
          <Link href="/front-desk">
            <Button>Back to Front Desk</Button>
          </Link>
        </div>
      </main>
    )
  }

  const { patient, visits, vitals, prescriptions, upcomingAppointments } = await getPatientDetails(id)
  const visitHistory = await getPatientVisitHistory(id)

  // If no patient found, show empty state
  if (!patient) {
    return (
      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="text-center py-12">
          <User className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Patient Not Found</h2>
          <p className="text-muted-foreground mb-4">The patient you're looking for doesn't exist.</p>
          <Link href="/front-desk">
            <Button>Back to Front Desk</Button>
          </Link>
        </div>
      </main>
    )
  }

  const calculateAge = (dob: string) => {
    if (!dob) return null
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = patient.age || (patient.dob ? calculateAge(patient.dob) : null)

  // Transform visit history for display
  const visitsDetailed: Visit[] = visitHistory.map((visit: any) => ({
    id: visit.id,
    date: visit.visit_date,
    summary: visit.notes || visit.diagnosis || "No summary available",
    prescriptions:
      visit.prescriptions?.map((p: any) => ({
        drug: p.medicine,
        dose: `${p.dosage} - ${p.frequency} for ${p.duration}`,
      })) || [],
    vitals: visit.vitals?.[0]
      ? {
          bp: `${visit.vitals[0].bp_systolic}/${visit.vitals[0].bp_diastolic}`,
          spo2: `${visit.vitals[0].spo2}%`,
          weight: `${visit.vitals[0].weight} kg`,
          heartRate: `${visit.vitals[0].heart_rate} bpm`,
          temperature: `${visit.vitals[0].temperature}°F`,
        }
      : undefined,
    testsPrescribed: [],
  }))

  const allergiesArray = patient.allergies ? patient.allergies.split(",").map((a: string) => a.trim()) : []
  const conditionsArray = patient.conditions ? patient.conditions.split(",").map((c: string) => c.trim()) : []

  return (
    <main className="container mx-auto space-y-6 px-4 py-6">
      <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-pretty text-primary">{patient.full_name}</h1>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Patient Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="mt-1 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-xs text-muted-foreground">Full Name</div>
                          <div className="font-medium">{patient.full_name}</div>
                        </div>
                      </div>
                      {patient.mrn && (
                        <div className="flex items-start gap-3">
                          <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">MRN</div>
                            <div className="font-medium">{patient.mrn}</div>
                          </div>
                        </div>
                      )}
                      {age && (
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Age</div>
                            <div className="font-medium">{age} years</div>
                          </div>
                        </div>
                      )}
                      {patient.gender && (
                        <div className="flex items-start gap-3">
                          <User className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Gender</div>
                            <div className="font-medium">{patient.gender}</div>
                          </div>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Phone</div>
                            <div className="font-medium">{patient.phone}</div>
                          </div>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-start gap-3">
                          <Mail className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Email</div>
                            <div className="font-medium">{patient.email}</div>
                          </div>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground">Address</div>
                            <div className="font-medium">{patient.address}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                {age && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                    {age} yrs
                  </span>
                )}
                {patient.phone && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </span>
                )}
                {patient.gender && <Badge variant="secondary">{patient.gender}</Badge>}
              </div>
            </div>
          </div>
          <Link href="/front-desk">
            <Button className="text-primary bg-transparent" variant="outline">
              Back to Front Desk
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Visits</div>
              <div className="text-xl font-bold">{visits.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="text-foreground">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Prescriptions</div>
              <div className="text-xl font-bold">{prescriptions.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-alert/10 text-alert">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Allergies</div>
              <div className="text-xl font-bold">{allergiesArray.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-primary">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Conditions</div>
              <div className="text-xl font-bold">{conditionsArray.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
              {allergiesArray.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergiesArray.map((a: string, i: number) => (
                    <Badge key={i} variant="outline" className="border-alert/50 bg-alert/5 text-alert">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {a}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No known allergies</p>
              )}
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold">Conditions</div>
              {conditionsArray.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditionsArray.map((c: string, i: number) => (
                    <Badge key={i} variant="outline" className="border-accent/50 bg-accent/5 text-primary">
                      <Activity className="mr-1 h-3 w-3" />
                      {c}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No known conditions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-pretty">
              <ClipboardList className="h-5 w-5 text-secondary" />
              Patient Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {patient.health_summary ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-foreground">{patient.health_summary}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No health summary available yet. Doctor will add details after consultation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {visitsDetailed.length > 0 && (
        <Card>
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-pretty">
              <FileText className="h-5 w-5 text-secondary-foreground" />
              Visit History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <VisitHistory visits={visitsDetailed} />
          </CardContent>
        </Card>
      )}

      {visitsDetailed.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Visit History</h3>
            <p className="text-muted-foreground">This patient hasn't had any consultations yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-pretty">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              No upcoming appointments
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {u.appointment_date} at {u.appointment_time}
                      </div>
                      <div className="text-sm text-muted-foreground">Status: {u.status}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/10">
                    Scheduled
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
