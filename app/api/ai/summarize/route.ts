import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { encounterData } = await req.json()

    const prompt = `You are a clinical documentation assistant. Generate a concise SOAP note based on the following encounter data:

Patient Chief Complaint: ${encounterData.chiefComplaint || "Not provided"}
Vital Signs: BP ${encounterData.vitals?.bloodPressure || "N/A"}, HR ${encounterData.vitals?.heartRate || "N/A"}, Temp ${encounterData.vitals?.temperature || "N/A"}
History of Present Illness: ${encounterData.hpi || "Not provided"}
Physical Exam Findings: ${encounterData.physicalExam || "Not provided"}

Generate a structured SOAP note with:
- Subjective
- Objective
- Assessment
- Plan

Keep it concise and professional.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    return Response.json({ soapNote: text })
  } catch (error) {
    console.error("[v0] AI summarization error:", error)
    return Response.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
