"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

type AnalyticsInput = {
  patient: {
    id: string
    name: string
    age?: number
    sex?: string
  }
  allergies?: string[]
  conditions?: string[]
  recentVitals?: Record<string, string>
  recentPrescriptions?: Array<{ drug: string; dose?: string }>
}

export function AIHealthAnalytics({ input }: { input: AnalyticsInput }) {
  const [loading, setLoading] = React.useState(false)
  const [analysis, setAnalysis] = React.useState("")

  async function handleGenerate() {
    setLoading(true)
    setAnalysis("")
    try {
      const res = await fetch("/api/ai/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error("Failed to generate analytics")
      const data = await res.json()
      setAnalysis(data.analysis || "")
    } catch (err: any) {
      setAnalysis(`Unable to generate analytics. ${err?.message || ""}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">AI Health Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate an AI summary of the patient’s health status, risk cues, and suggested next steps.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="h-4 w-4" /> Generating...
              </span>
            ) : (
              "Generate Analytics"
            )}
          </Button>
        </div>
        <Textarea readOnly value={analysis} placeholder="Analytics will appear here..." className="min-h-40" />
      </CardContent>
    </Card>
  )
}
