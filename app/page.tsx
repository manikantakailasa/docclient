import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ActivityIcon, ClipboardListIcon, SettingsIcon } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-4 text-center">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Powered by AI
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight md:text-6xl">
              Clinical Management
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Modern, intelligent platform for multi-clinic operations with AI-assisted documentation and smart
              reminders
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Link href="/front-desk" className="group">
              <Card className="flex h-full flex-col items-center gap-4 p-8 transition-all hover:border-secondary">
                <div className="rounded-xl bg-secondary/10 p-4 transition-colors group-hover:bg-secondary/20">
                  <ClipboardListIcon className="h-8 w-8 text-secondary" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold">Front Desk</h2>
                  <p className="text-sm text-muted-foreground">
                    Scheduling, check-in, reminders and patient queue management
                  </p>
                </div>
                <Button variant="ghost" className="mt-auto text-secondary">
                  Access Dashboard →
                </Button>
              </Card>
            </Link>

            <Link href="/doctor" className="group">
              <Card className="flex h-full flex-col items-center gap-4 p-8 transition-all hover:border-primary">
                <div className="rounded-xl bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                  <ActivityIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold">Doctor</h2>
                  <p className="text-sm text-muted-foreground">
                    Patient encounters, vitals, prescriptions and AI-assisted notes
                  </p>
                </div>
                <Button variant="ghost" className="mt-auto text-primary">
                  Access Dashboard →
                </Button>
              </Card>
            </Link>

            <Link href="/admin" className="group">
              <Card className="flex h-full flex-col items-center gap-4 p-8 transition-all hover:border-chart-3">
                <div className="rounded-xl bg-chart-3/10 p-4 transition-colors group-hover:bg-chart-3/20">
                  <SettingsIcon className="h-8 w-8 text-chart-3" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-semibold">Admin</h2>
                  <p className="text-sm text-muted-foreground">
                    Practice setup, analytics, providers and system configuration
                  </p>
                </div>
                <Button variant="ghost" className="mt-auto text-chart-3">
                  Access Dashboard →
                </Button>
              </Card>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-success/50 bg-success/5 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-success/20 p-2">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-success">AI-Powered Documentation</h3>
                  <p className="text-sm text-muted-foreground">Automatic SOAP note generation and coding suggestions</p>
                </div>
              </div>
            </Card>

            <Card className="border-alert/50 bg-alert/5 p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-alert/20 p-2">
                  <svg className="h-5 w-5 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-alert">Smart Reminders</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated appointment reminders and no-show predictions
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
