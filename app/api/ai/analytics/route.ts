import { NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Build a concise, structured prompt with provided PHI scoped to this request.
    const prompt = `
You are a clinical decision support assistant. Analyze the patient's health based on the provided information.
Return a concise, clinically helpful narrative that includes: current condition overview, notable risks, trend observations, and suggested next steps suitable for primary care (family/peds/OB-GYN). Avoid PII beyond the provided name.

Patient:
- ID: ${body?.patient?.id || "N/A"}
- Name: ${body?.patient?.name || "N/A"}
- Age: ${body?.patient?.age || "N/A"}
- Sex: ${body?.patient?.sex || "N/A"}

Allergies: ${(body?.allergies || []).join(", ") || "None reported"}
Conditions: ${(body?.conditions || []).join(", ") || "None reported"}

Recent Vitals:
${
  Object.entries(body?.recentVitals || {})
    .map(([k, v]: any) => `- ${k}: ${v}`)
    .join("\n") || "- None recorded"
}

Recent Prescriptions:
${
  (body?.recentPrescriptions || []).map((p: any) => `- ${p.drug}${p.dose ? ` (${p.dose})` : ""}`).join("\n") || "- None"
}
    `.trim()

    const { text } = await generateText({
      model: "openai/gpt-5-mini",
      prompt,
    })

    return NextResponse.json({ analysis: text })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
