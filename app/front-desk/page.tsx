import AddPatientButton from "@/components/front-desk/add-patient-button"
import TodayQueue from "@/components/front-desk/today-queue"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  deleteAppointment,
  getCompletedTodayAppointments,
  getTodayAppointments,
  getUpcomingAppointments,
} from "@/lib/actions/appointments"
import { CalendarIcon, CheckCircle2Icon, ClockIcon, UserIcon } from "lucide-react"
import { revalidatePath } from "next/cache"

const FrontDeskPage = async () => {
  const { data: appointments } = await getTodayAppointments()
  const { data: upcomingAppts } = await getUpcomingAppointments()
  const { data: completedAppts } = await getCompletedTodayAppointments()

  const todayQueue =
    appointments?.map((apt: any) => ({
      id: apt.id,
      patient_id: apt.patient_id, // Changed from patientId to patient_id
      patient: apt.patients?.full_name || "Unknown",
      time: apt.appointment_time || "N/A",
      doctor: "Dr. Patel", // TODO: Get from doctor_id
      status: apt.status || "scheduled",
      age: apt.patients?.age,
      bloodGroup: apt.patients?.blood_group,
      visits: 0, // TODO: Calculate from visits table
      hasPendingNotes: false, // TODO: Check notes table
    })) || []

  const upcomingAppointments =
    upcomingAppts?.map((apt: any) => ({
      id: apt.id,
      patient: apt.patients?.full_name || "Unknown",
      time: apt.appointment_time || "N/A",
      date: apt.appointment_date,
      doctor: "Dr. Patel", // TODO: Get from doctor_id
      status: apt.status,
    })) || []

  const completedToday =
    completedAppts?.map((apt: any) => ({
      id: apt.id,
      patient: apt.patients?.full_name || "Unknown",
      time: apt.appointment_time || "N/A",
      doctor: "Dr. Patel", // TODO: Get from doctor_id
      completedAt: apt.updated_at
        ? new Date(apt.updated_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "N/A",
    })) || []

  async function handleRemoveAppointment(appointmentId: string) {
    "use server"
    await deleteAppointment(appointmentId)
    revalidatePath("/front-desk")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold text-primary">
              ClinHat
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 p-4 md:p-6">
        <h1 className="sr-only">Front Desk</h1>
        <Card className="md:hidden">
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">Today</h2>
              <p className="text-sm text-muted-foreground">Real-time appointment tracking</p>
            </div>
            <div>
              <AddPatientButton />
            </div>
          </div>
          <div className="p-4 pt-2">
            <TodayQueue appointments={todayQueue} onRemove={handleRemoveAppointment as (id: string | number) => any } />
          </div>
        </Card>

        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold">{todayQueue.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-secondary/60" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-bold">
                  {todayQueue.filter((a) => a.status === "checked-in" || a.status === "in-consultation").length}
                </p>
              </div>
              <CheckCircle2Icon className="h-8 w-8 text-success/60" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{todayQueue.filter((a) => a.status === "scheduled").length}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-alert/60" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-primary">Today's Queue</h2>
              <p className="text-sm text-muted-foreground">Real-time appointment tracking</p>
            </div>
            <AddPatientButton />
          </div>
          <div className="p-4 pt-2">
            <TodayQueue appointments={todayQueue} onRemove={handleRemoveAppointment as (id: string | number) => any } />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="border-b p-4">
              <h2 className="font-semibold text-lg text-success">Completed Today</h2>
              <p className="text-sm text-muted-foreground">{completedToday.length} consultations completed</p>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {completedToday.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckCircle2Icon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                  <p>No completed consultations yet</p>
                </div>
              ) : (
                completedToday.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                        <UserIcon className="h-6 w-6 text-success" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{apt.patient}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ClockIcon className="h-3 w-3" />
                          {apt.time} → {apt.completedAt}
                          <span>•</span>
                          {apt.doctor}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-success/20 text-success">
                      <CheckCircle2Icon className="mr-1 h-3 w-3" />
                      Done
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="border-b p-4">
              <h2 className="font-semibold text-lg text-primary">Upcoming Appointments</h2>
              <p className="text-sm text-muted-foreground">{upcomingAppointments.length} scheduled</p>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {upcomingAppointments.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{apt.patient}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          {apt.date}
                          <span>•</span>
                          <ClockIcon className="h-3 w-3" />
                          {apt.time}
                          <span>•</span>
                          {apt.doctor}
                        </div>
                      </div>
                    </div>
                    <Badge variant="default" className="capitalize">
                      {apt.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default FrontDeskPage
