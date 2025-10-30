export interface VitalsRules {
  bpSystolicNormal: { min: number; max: number }
  bpSystolicWarning: { min: number; max: number }
  bpDiastolicNormal: { min: number; max: number }
  bpDiastolicWarning: { min: number; max: number }
  spo2Normal: { min: number; max: number }
  spo2Warning: { min: number; max: number }
  heartRateNormal: { min: number; max: number }
  heartRateWarning: { min: number; max: number }
  tempNormal: { min: number; max: number }
  tempWarning: { min: number; max: number }
  bmiNormal: { min: number; max: number }
  bmiWarning: { min: number; max: number }
  bloodSugarNormal: { min: number; max: number }
  bloodSugarWarning: { min: number; max: number }
}

// Default rules (can be overridden from admin config)
export const defaultVitalsRules: VitalsRules = {
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
  bmiNormal: { min: 18.5, max: 24.9 },
  bmiWarning: { min: 25, max: 29.9 },
  bloodSugarNormal: { min: 70, max: 140 },
  bloodSugarWarning: { min: 141, max: 180 },
}

type VitalColor = "success" | "alert" | "critical"

/**
 * Evaluate BP (systolic/diastolic) and return color class
 * @param bp - BP string like "120/80"
 * @param rules - Vitals rules config
 * @returns Tailwind color class
 */
export function evaluateBP(bp: string, rules: VitalsRules = defaultVitalsRules): VitalColor {
  const match = bp.match(/(\d+)\/(\d+)/)
  if (!match) return "success"
  const sys = Number.parseInt(match[1], 10)
  const dia = Number.parseInt(match[2], 10)

  // Critical if either is outside warning range
  if (
    sys < rules.bpSystolicNormal.min ||
    sys > rules.bpSystolicWarning.max ||
    dia < rules.bpDiastolicNormal.min ||
    dia > rules.bpDiastolicWarning.max
  ) {
    return "critical"
  }

  // Warning if either is in warning range
  if (
    (sys >= rules.bpSystolicWarning.min && sys <= rules.bpSystolicWarning.max) ||
    (dia >= rules.bpDiastolicWarning.min && dia <= rules.bpDiastolicWarning.max)
  ) {
    return "alert"
  }

  return "success"
}

/**
 * Evaluate SpO2 and return color class
 * @param spo2 - SpO2 string like "98%" or number
 * @param rules - Vitals rules config
 */
export function evaluateSpO2(spo2: string | number, rules: VitalsRules = defaultVitalsRules): VitalColor {
  const val = typeof spo2 === "string" ? Number.parseInt(spo2.replace("%", ""), 10) : spo2
  if (isNaN(val)) return "success"

  if (val < rules.spo2Warning.min) return "critical"
  if (val >= rules.spo2Warning.min && val < rules.spo2Normal.min) return "alert"
  return "success"
}

/**
 * Evaluate Heart Rate and return color class
 */
export function evaluateHeartRate(hr: number, rules: VitalsRules = defaultVitalsRules): VitalColor {
  if (hr < rules.heartRateWarning.min || hr > rules.heartRateNormal.max + 20) return "critical"
  if (
    (hr >= rules.heartRateWarning.min && hr < rules.heartRateNormal.min) ||
    (hr > rules.heartRateNormal.max && hr <= rules.heartRateNormal.max + 20)
  )
    return "alert"
  return "success"
}

/**
 * Evaluate Temperature and return color class
 */
export function evaluateTemp(temp: number, rules: VitalsRules = defaultVitalsRules): VitalColor {
  if (temp < rules.tempNormal.min - 1 || temp > rules.tempWarning.max) return "critical"
  if (
    (temp >= rules.tempNormal.min - 1 && temp < rules.tempNormal.min) ||
    (temp > rules.tempNormal.max && temp <= rules.tempWarning.max)
  )
    return "alert"
  return "success"
}

/**
 * Evaluate Weight change percentage and return color class
 */
export function evaluateWeightChange(changePercent: number): VitalColor {
  if (Math.abs(changePercent) > 10) return "critical"
  if (Math.abs(changePercent) > 5) return "alert"
  return "success"
}

/**
 * Evaluate BMI and return color class
 */
export function evaluateBMI(bmi: number, rules: VitalsRules = defaultVitalsRules): VitalColor {
  if (bmi < 18.5 || bmi >= 30) return "critical"
  if ((bmi >= rules.bmiWarning.min && bmi < rules.bmiWarning.max) || bmi < rules.bmiNormal.min) return "alert"
  return "success"
}

/**
 * Evaluate Blood Sugar and return color class
 */
export function evaluateBloodSugar(bs: number, rules: VitalsRules = defaultVitalsRules): VitalColor {
  if (bs < rules.bloodSugarNormal.min || bs > rules.bloodSugarWarning.max) return "critical"
  if (bs >= rules.bloodSugarWarning.min && bs <= rules.bloodSugarWarning.max) return "alert"
  return "success"
}

/**
 * Get Tailwind color classes for a vital color
 */
export function getVitalColorClasses(color: VitalColor): string {
  switch (color) {
    case "success":
      return "text-success font-semibold"
    case "alert":
      return "text-alert font-semibold"
    case "critical":
      return "text-action-delete font-bold"
    default:
      return "text-foreground"
  }
}
