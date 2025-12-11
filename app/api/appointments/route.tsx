import { db } from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json()
    console.log("Received appointment data:", data);

    const {
      id,
      patient_id,
      appointment_date,
      status = "scheduled",
      visit_type,
      chief_complaint,
      notes,
      checked_in_at,
      consultation_started_at,
      consultation_ended_at,
    } = data

    // Basic required fields
    if (!patient_id || !appointment_date) {
      return NextResponse.json(
        { error: "patient_id, appointment_date, and appointment_time are required" },
        { status: 400 }
      )
    }

    let appointment

    // Update when ID is provided
    if (id) {
      appointment = await db.appointments.upsert({
        where: { id },
        update: {
          patient_id,
          appointment_date,
          status,
          visit_type,
          chief_complaint,
          notes,
          checked_in_at,
          consultation_started_at,
          consultation_ended_at,
          updated_at: new Date(),
        },
        create: {
          id,
          patient_id,
          appointment_date,
          status,
          visit_type,
          chief_complaint,
          notes,
          checked_in_at,
          consultation_started_at,
          consultation_ended_at,
        },
      })
    } else {
      // Create new appointment
      appointment = await db.appointments.create({
        data: {
          patient_id,
          appointment_date,
          status,
          visit_type,
          chief_complaint,
          notes,
          checked_in_at,
          consultation_started_at,
          consultation_ended_at,
        },
      })
    }

    return NextResponse.json({
      id : appointment.id,
      patient_id :appointment.patient_id,
      patient: "unknown",
      haspendingNotes: false,
      doctor: "Dr. Patel",
      status: appointment.status,
      visits: 0,
      time: appointment.appointment_date || "N/A",
    })
  } catch (error) {
    console.error("Error saving appointment:", error)
    return NextResponse.json(
      { error: "Failed to save appointment" },
      { status: 500 }
    )
  }
}


// GET /api/appointments
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    // If ID is provided → Get single appointment
    if (id) {
      const appointment = await db.appointments.findUnique({
        where: { id },
      })

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        )
      }

      return NextResponse.json(appointment)
    }

    // Otherwise → Return all appointments
    const appointments = await db.appointments.findMany({
      orderBy: { appointment_date: "desc" },
    })
    console.log("Fetched appointments:", appointments);
    return NextResponse.json(appointments)
  } catch (error) {
    console.error("GET /appointments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      )
    }

    // Check if appointment exists
    const existing = await db.appointments.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    // Delete the appointment
    await db.appointments.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Appointment deleted",
      id,
    })
  } catch (error) {
    console.error("DELETE /appointments error:", error)
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing appointment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "Missing status field" },
        { status: 400 }
      );
    }

    // Check appointment exists
    const existing = await db.appointments.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Update only status
    const updated = await db.appointments.update({
      where: { id },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status updated",
      appointment: updated,
    });
  } catch (error) {
    console.error("PATCH /appointments error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment status" },
      { status: 500 }
    );
  }
}
