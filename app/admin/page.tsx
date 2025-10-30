import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UsersIcon, BuildingIcon, DollarSignIcon, CalendarDaysIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Configure from "@/components/admin/configure"
import FieldMapping from "@/components/admin/field-mapping"
import Rules from "@/components/admin/rules"
import MedicalLibrary from "@/components/admin/medical-library"
import BillingReports from "@/components/admin/billing-reports"
import ServicePricing from "@/components/admin/service-pricing"
import Settings from "@/components/admin/settings"

const clinicStats = [
  { name: "Main Clinic", patients: 450, providers: 8, appointments: 120 },
  { name: "North Branch", patients: 320, providers: 5, appointments: 85 },
  { name: "South Branch", patients: 280, providers: 4, appointments: 72 },
]

export default function AdminPage() {
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
        <h1 className="sr-only">Admin</h1>
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-4 rounded-lg bg-accent/20 p-1 ring-1 ring-accent/40">
            <TabsTrigger
              value="dashboard"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Service Pricing
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="configure"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Configure
            </TabsTrigger>
            <TabsTrigger
              value="field-mapping"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Field Mapping
            </TabsTrigger>
            <TabsTrigger
              value="rules"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Rules
            </TabsTrigger>
            <TabsTrigger
              value="medical-library"
              className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Medical Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                    <p className="text-2xl font-bold">1,050</p>
                    <p className="text-xs text-success">+12% this month</p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-chart-3/60" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Providers</p>
                    <p className="text-2xl font-bold">17</p>
                    <p className="text-xs text-muted-foreground">Across 3 clinics</p>
                  </div>
                  <BuildingIcon className="h-8 w-8 text-primary/60" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold">213</p>
                    <p className="text-xs text-muted-foreground">Appointments</p>
                  </div>
                  <CalendarDaysIcon className="h-8 w-8 text-secondary/60" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Weekly Revenue</p>
                    <p className="text-2xl font-bold">$16.4K</p>
                    <p className="text-xs text-success">+8% vs last week</p>
                  </div>
                  <DollarSignIcon className="h-8 w-8 text-success/60" />
                </div>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <div className="border-b p-4">
                  <h2 className="font-semibold text-lg">Billing Reports</h2>
                  <p className="text-sm text-muted-foreground">Recent payment transactions</p>
                </div>
                <div className="p-4">
                  <BillingReports />
                </div>
              </Card>

              <Card>
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Smart Templates Report</h2>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Template usage statistics</p>
                </div>
                <div className="divide-y">
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">General Consultation</span>
                      <Badge className="bg-primary/20 text-primary">142 uses</Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[85%] rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Follow-up Visit</span>
                      <Badge className="bg-secondary/20 text-secondary">98 uses</Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[65%] rounded-full bg-secondary" />
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chronic Care</span>
                      <Badge className="bg-chart-3/20 text-chart-3">76 uses</Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[50%] rounded-full bg-chart-3" />
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pediatric Care</span>
                      <Badge className="bg-success/20 text-success">54 uses</Badge>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[35%] rounded-full bg-success" />
                    </div>
                  </div>
                </div>
                <div className="border-t p-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Templates
                  </Button>
                </div>
              </Card>
            </div>

            <Card>
              <div className="border-b p-4">
                <h2 className="font-semibold text-lg">Clinic Performance</h2>
                <p className="text-sm text-muted-foreground">Overview of all clinic locations</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium">Clinic Name</th>
                      <th className="p-4 text-left text-sm font-medium">Patients</th>
                      <th className="p-4 text-left text-sm font-medium">Providers</th>
                      <th className="p-4 text-left text-sm font-medium">Today's Appointments</th>
                      <th className="p-4 text-left text-sm font-medium">Status</th>
                      <th className="p-4 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {clinicStats.map((clinic, idx) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <BuildingIcon className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{clinic.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{clinic.patients}</td>
                        <td className="p-4 text-sm">{clinic.providers}</td>
                        <td className="p-4 text-sm">{clinic.appointments}</td>
                        <td className="p-4">
                          <Badge className="bg-success/20 text-success hover:bg-success/30">Active</Badge>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <ServicePricing />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          <TabsContent value="configure">
            <Configure />
          </TabsContent>

          <TabsContent value="field-mapping">
            <FieldMapping />
          </TabsContent>

          <TabsContent value="rules">
            <Rules />
          </TabsContent>

          <TabsContent value="medical-library">
            <MedicalLibrary />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
