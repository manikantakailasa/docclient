"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, AlertTriangle, Calendar, DollarSign, Bell } from "lucide-react"

export default function Rules() {
  const [vitalsRules, setVitalsRules] = React.useState({
    bpSystolicNormal: { min: 90, max: 120 },
    bpSystolicWarning: { min: 121, max: 139 },
    bpDiastolicNormal: { min: 60, max: 80 },
    bpDiastolicWarning: { min: 81, max: 89 },
    spo2Normal: { min: 95, max: 100 },
    spo2Warning: { min: 90, max: 94 },
    heartRateNormal: { min: 60, max: 100 },
    heartRateWarning: { min: 50, max: 59 },
    tempNormal: { min: 97.0, max: 99.0 },
    tempWarning: { min: 99.1, max: 100.4 },
    weightChangeWarning: 5, // % change
    bmiNormal: { min: 18.5, max: 24.9 },
    bmiWarning: { min: 25, max: 29.9 },
    bloodSugarNormal: { min: 70, max: 140 },
    bloodSugarWarning: { min: 141, max: 180 },
  })

  const [appointmentRules, setAppointmentRules] = React.useState({
    noShowRiskThreshold: 30, // % probability
    overbookingLimit: 2, // slots per hour
    lateArrivalMinutes: 15,
    autoRescheduleAfterMissed: true,
  })

  const [billingRules, setBillingRules] = React.useState({
    paymentDueDays: 30,
    lateFeePercent: 5,
    autoReminderDays: [7, 3, 1], // days before due
    minimumPaymentAmount: 10,
  })

  const [clinicalAlerts, setClinicalAlerts] = React.useState({
    allergySeverityHigh: ["Anaphylaxis", "Severe"],
    drugInteractionCheck: true,
    ageBasedDosingAlert: true,
    pregnancyWarnings: true,
    renalDoseAdjustment: true,
  })

  const [reminderRules, setReminderRules] = React.useState({
    defaultChannels: ["SMS", "Email"],
    appointmentReminderHours: [24, 2], // hours before
    followUpReminderDays: 7,
    escalationEnabled: true,
  })

  const handleSave = () => {
    console.log("[v0] Saving rules:", {
      vitalsRules,
      appointmentRules,
      billingRules,
      clinicalAlerts,
      reminderRules,
    })
    alert("Rules saved successfully! (Mock)")
  }

  return (
    <div className="space-y-6">
      {/* Vitals Thresholds */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-success" />
            <div>
              <CardTitle>Vitals Thresholds</CardTitle>
              <CardDescription>
                Define normal, warning, and critical ranges for patient vitals. Values outside normal will be
                color-coded.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* BP Systolic */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Blood Pressure - Systolic (mmHg)</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Normal Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={vitalsRules.bpSystolicNormal.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpSystolicNormal: { ...vitalsRules.bpSystolicNormal, min: +e.target.value },
                      })
                    }
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={vitalsRules.bpSystolicNormal.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpSystolicNormal: { ...vitalsRules.bpSystolicNormal, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-success/20 text-success">Green</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Warning Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={vitalsRules.bpSystolicWarning.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpSystolicWarning: { ...vitalsRules.bpSystolicWarning, min: +e.target.value },
                      })
                    }
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={vitalsRules.bpSystolicWarning.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpSystolicWarning: { ...vitalsRules.bpSystolicWarning, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-alert/20 text-alert">Amber</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Critical</Label>
                <p className="text-sm text-muted-foreground">Outside warning range</p>
                <Badge className="bg-action-delete/20 text-action-delete">Red</Badge>
              </div>
            </div>
          </div>

          {/* BP Diastolic */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Blood Pressure - Diastolic (mmHg)</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Normal Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vitalsRules.bpDiastolicNormal.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpDiastolicNormal: { ...vitalsRules.bpDiastolicNormal, min: +e.target.value },
                      })
                    }
                  />
                  <span>–</span>
                  <Input
                    type="number"
                    value={vitalsRules.bpDiastolicNormal.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpDiastolicNormal: { ...vitalsRules.bpDiastolicNormal, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-success/20 text-success">Green</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Warning Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vitalsRules.bpDiastolicWarning.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpDiastolicWarning: { ...vitalsRules.bpDiastolicWarning, min: +e.target.value },
                      })
                    }
                  />
                  <span>–</span>
                  <Input
                    type="number"
                    value={vitalsRules.bpDiastolicWarning.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        bpDiastolicWarning: { ...vitalsRules.bpDiastolicWarning, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-alert/20 text-alert">Amber</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Critical</Label>
                <p className="text-sm text-muted-foreground">Outside warning</p>
                <Badge className="bg-action-delete/20 text-action-delete">Red</Badge>
              </div>
            </div>
          </div>

          {/* SpO2 */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">SpO₂ (%)</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Normal Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vitalsRules.spo2Normal.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        spo2Normal: { ...vitalsRules.spo2Normal, min: +e.target.value },
                      })
                    }
                  />
                  <span>–</span>
                  <Input
                    type="number"
                    value={vitalsRules.spo2Normal.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        spo2Normal: { ...vitalsRules.spo2Normal, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-success/20 text-success">Green</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Warning Range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={vitalsRules.spo2Warning.min}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        spo2Warning: { ...vitalsRules.spo2Warning, min: +e.target.value },
                      })
                    }
                  />
                  <span>–</span>
                  <Input
                    type="number"
                    value={vitalsRules.spo2Warning.max}
                    onChange={(e) =>
                      setVitalsRules({
                        ...vitalsRules,
                        spo2Warning: { ...vitalsRules.spo2Warning, max: +e.target.value },
                      })
                    }
                  />
                </div>
                <Badge className="bg-alert/20 text-alert">Amber</Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Critical</Label>
                <p className="text-sm text-muted-foreground">Below {vitalsRules.spo2Warning.min}</p>
                <Badge className="bg-action-delete/20 text-action-delete">Red</Badge>
              </div>
            </div>
          </div>

          {/* Heart Rate, Temperature, BMI, Blood Sugar - simplified */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Heart Rate Normal (bpm)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={vitalsRules.heartRateNormal.min}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      heartRateNormal: { ...vitalsRules.heartRateNormal, min: +e.target.value },
                    })
                  }
                />
                <span>–</span>
                <Input
                  type="number"
                  value={vitalsRules.heartRateNormal.max}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      heartRateNormal: { ...vitalsRules.heartRateNormal, max: +e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Temperature Normal (°F)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsRules.tempNormal.min}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      tempNormal: { ...vitalsRules.tempNormal, min: +e.target.value },
                    })
                  }
                />
                <span>–</span>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsRules.tempNormal.max}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      tempNormal: { ...vitalsRules.tempNormal, max: +e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>BMI Normal Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsRules.bmiNormal.min}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      bmiNormal: { ...vitalsRules.bmiNormal, min: +e.target.value },
                    })
                  }
                />
                <span>–</span>
                <Input
                  type="number"
                  step="0.1"
                  value={vitalsRules.bmiNormal.max}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      bmiNormal: { ...vitalsRules.bmiNormal, max: +e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Blood Sugar Normal (mg/dL)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={vitalsRules.bloodSugarNormal.min}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      bloodSugarNormal: { ...vitalsRules.bloodSugarNormal, min: +e.target.value },
                    })
                  }
                />
                <span>–</span>
                <Input
                  type="number"
                  value={vitalsRules.bloodSugarNormal.max}
                  onChange={(e) =>
                    setVitalsRules({
                      ...vitalsRules,
                      bloodSugarNormal: { ...vitalsRules.bloodSugarNormal, max: +e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-secondary" />
            <div>
              <CardTitle>Appointment Rules</CardTitle>
              <CardDescription>Configure scheduling, no-show risk, and overbooking policies.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>No-Show Risk Threshold (%)</Label>
            <Input
              type="number"
              value={appointmentRules.noShowRiskThreshold}
              onChange={(e) => setAppointmentRules({ ...appointmentRules, noShowRiskThreshold: +e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Flag appointments above this probability</p>
          </div>
          <div className="space-y-2">
            <Label>Overbooking Limit (slots/hour)</Label>
            <Input
              type="number"
              value={appointmentRules.overbookingLimit}
              onChange={(e) => setAppointmentRules({ ...appointmentRules, overbookingLimit: +e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Late Arrival Grace Period (minutes)</Label>
            <Input
              type="number"
              value={appointmentRules.lateArrivalMinutes}
              onChange={(e) => setAppointmentRules({ ...appointmentRules, lateArrivalMinutes: +e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-alert" />
            <div>
              <CardTitle>Billing & Payment Rules</CardTitle>
              <CardDescription>Payment terms, late fees, and auto-reminder triggers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Payment Due (days)</Label>
            <Input
              type="number"
              value={billingRules.paymentDueDays}
              onChange={(e) => setBillingRules({ ...billingRules, paymentDueDays: +e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Late Fee (%)</Label>
            <Input
              type="number"
              value={billingRules.lateFeePercent}
              onChange={(e) => setBillingRules({ ...billingRules, lateFeePercent: +e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Minimum Payment Amount</Label>
            <Input
              type="number"
              value={billingRules.minimumPaymentAmount}
              onChange={(e) => setBillingRules({ ...billingRules, minimumPaymentAmount: +e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinical Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-action-delete" />
            <div>
              <CardTitle>Clinical Alerts</CardTitle>
              <CardDescription>Drug interactions, allergy severity, and dosing checks.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Drug Interaction Check</p>
              <p className="text-xs text-muted-foreground">Alert on known interactions</p>
            </div>
            <Badge className="bg-success/20 text-success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Age-Based Dosing Alert</p>
              <p className="text-xs text-muted-foreground">Pediatric & geriatric warnings</p>
            </div>
            <Badge className="bg-success/20 text-success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Pregnancy Warnings</p>
              <p className="text-xs text-muted-foreground">Category X/D medications</p>
            </div>
            <Badge className="bg-success/20 text-success">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Renal Dose Adjustment</p>
              <p className="text-xs text-muted-foreground">CrCl-based recommendations</p>
            </div>
            <Badge className="bg-success/20 text-success">Enabled</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Reminder Rules</CardTitle>
              <CardDescription>Default channels, timing, and escalation policies.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Channels</Label>
            <div className="flex flex-wrap gap-2">
              {["SMS", "Email", "WhatsApp", "Push"].map((ch) => (
                <Badge
                  key={ch}
                  className={
                    reminderRules.defaultChannels.includes(ch)
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {ch}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Appointment Reminder Timing (hours before)</Label>
            <p className="text-sm text-muted-foreground">{reminderRules.appointmentReminderHours.join(", ")} hours</p>
          </div>
          <div className="space-y-2">
            <Label>Follow-Up Reminder (days after visit)</Label>
            <Input
              type="number"
              value={reminderRules.followUpReminderDays}
              onChange={(e) => setReminderRules({ ...reminderRules, followUpReminderDays: +e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-action-save hover:bg-action-save/90">
          Save All Rules
        </Button>
      </div>
    </div>
  )
}
