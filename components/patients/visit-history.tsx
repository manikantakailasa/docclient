"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, Pill, Activity, FileText, Stethoscope } from "lucide-react"

export type Visit = {
  id: string
  date: string // ISO or human, display string
  summary: string
  prescriptions?: Array<{ drug: string; dose?: string; frequency?: string; duration?: string }>
  vitals?: {
    bp?: string
    hr?: string
    temp?: string
    spo2?: string
    weight?: string
    height?: string
    bmi?: string
  }
  testsPrescribed?: string[]
  notes?: string
}

export function VisitHistory({
  visits,
  className,
  defaultSelectedId,
}: {
  visits: Visit[]
  className?: string
  defaultSelectedId?: string
}) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(defaultSelectedId || visits?.[0]?.id)
  const selected = React.useMemo(() => visits.find((v) => v.id === selectedId), [visits, selectedId])

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      <Card className="md:col-span-1">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-sm text-pretty">
            <Calendar className="h-4 w-4 text-primary" />
            Select Visit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4">
          {visits.map((v) => (
            <Button
              key={v.id}
              variant={v.id === selectedId ? "default" : "ghost"}
              className="w-full justify-between"
              onClick={() => setSelectedId(v.id)}
              aria-pressed={v.id === selectedId}
            >
              <span className="flex items-center gap-2 text-left">
                <Calendar className="h-4 w-4" />
                {v.date}
              </span>
              {v.testsPrescribed && v.testsPrescribed.length > 0 ? (
                <Badge variant="outline" className="ml-2 border-accent/50 bg-accent/10 text-accent">
                  <Stethoscope className="mr-1 h-3 w-3" />
                  Tests
                </Badge>
              ) : null}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-pretty">
            <FileText className="h-5 w-5 text-primary" />
            {selected ? `Visit on ${selected.date}` : "Visit Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {selected ? (
            <>
              <section aria-labelledby="visit-summary" className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h3 id="visit-summary" className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                  <FileText className="h-4 w-4" />
                  Summary
                </h3>
                <p className="text-sm">{selected.summary}</p>
              </section>

              <section aria-labelledby="visit-prescriptions">
                <h3
                  id="visit-prescriptions"
                  className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  <Pill className="h-4 w-4" />
                  Prescriptions
                </h3>
                {selected.prescriptions?.length ? (
                  <div className="space-y-2">
                    {selected.prescriptions.map((p, i) => (
                      <div key={i} className="rounded-lg border border-secondary/20 bg-secondary/5 p-3">
                        <div className="font-medium text-secondary">{p.drug}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {p.dose ? `${p.dose}` : ""} {p.frequency ? ` • ${p.frequency}` : ""}{" "}
                          {p.duration ? ` • ${p.duration}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No prescriptions recorded.</p>
                )}
              </section>

              <section aria-labelledby="visit-vitals">
                <h3 id="visit-vitals" className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Activity className="h-4 w-4" />
                  Vitals
                </h3>
                {selected.vitals ? (
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                    {selected.vitals.bp && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">BP</div>
                        <div className="font-semibold text-sidebar-foreground">{selected.vitals.bp}</div>
                      </div>
                    )}
                    {selected.vitals.hr && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">HR</div>
                        <div className="font-semibold text-accent">{selected.vitals.hr}</div>
                      </div>
                    )}
                    {selected.vitals.temp && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">Temp</div>
                        <div className="font-semibold text-accent">{selected.vitals.temp}</div>
                      </div>
                    )}
                    {selected.vitals.spo2 && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">SpO2</div>
                        <div className="font-semibold text-secondary-foreground">{selected.vitals.spo2}</div>
                      </div>
                    )}
                    {selected.vitals.weight && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">Weight</div>
                        <div className="font-semibold text-secondary-foreground">{selected.vitals.weight}</div>
                      </div>
                    )}
                    {selected.vitals.height && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">Height</div>
                        <div className="font-semibold text-secondary-foreground">{selected.vitals.height}</div>
                      </div>
                    )}
                    {selected.vitals.bmi && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <div className="text-xs text-muted-foreground">BMI</div>
                        <div className="font-semibold text-accent">{selected.vitals.bmi}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No vitals recorded.</p>
                )}
              </section>

              <section aria-labelledby="visit-tests">
                <h3 id="visit-tests" className="mb-3 flex items-center gap-2 text-sm font-semibold text-alert">
                  <Stethoscope className="h-4 w-4" />
                  Tests Prescribed
                </h3>
                {selected.testsPrescribed?.length ? (
                  <div className="space-y-2">
                    {selected.testsPrescribed.map((t, i) => (
                      <div key={i} className="rounded-lg border border-alert/20 bg-alert/5 p-3">
                        <div className="text-sm font-medium text-alert">{t}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tests prescribed.</p>
                )}
              </section>

              {selected.notes ? (
                <section aria-labelledby="visit-notes" className="rounded-lg border p-4">
                  <h3
                    id="visit-notes"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    Notes
                  </h3>
                  <p className="text-sm">{selected.notes}</p>
                </section>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a visit to view details.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
