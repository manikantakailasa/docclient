import { db } from "@/lib/db/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const {
      id,
      full_name,
      age,
      gender,
      phone,
      email,
      blood_group,
      patient_type = "new",
    } = data

    // Basic validation
    if (!full_name || !phone || !gender) {
      return NextResponse.json(
        { error: "full_name, phone, and gender are required" },
        { status: 400 }
      )
    }

    if (age && (age < 0 || age > 150)) {
      return NextResponse.json(
        { error: "Invalid age. Must be between 0 and 150." },
        { status: 400 }
      )
    }

    let patient

    if (id) {
      // Update existing OR create if not exists
      patient = await db.patients.upsert({
        where: { id },
        update: {
          full_name,
          age,
          gender,
          phone,
          email,
          blood_group,
          patient_type,
        },
        create: {
          id,
          full_name,
          age,
          gender,
          phone,
          email,
          blood_group,
          patient_type,
        },
      })
    } else {
      // Create new
      patient = await db.patients.create({
        data: {
          full_name,
          age,
          gender,
          phone,
          email,
          blood_group,
          patient_type,
        },
      })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error saving patient:", error)
    return NextResponse.json(
      { error: "Failed to save patient" },
      { status: 500 }
    )
  }
}
