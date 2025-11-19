import { db } from "@/lib/db/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
	try {
		const data = await req.json()
		const {
			id,
			name,
			category,
			dosageForms = [],
			commonStrengths = [],
			commonFrequencies = [],
			instructions,
			specialties = [],
			usageCount = 0,
			isFavorite = false,
		} = data
		
		if (!name || !category) {
			return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
		}

		let medicine

		if (id) {
			medicine = await db.medicine.upsert({
				where: { id },
				update: { name, category, dosageForms, commonStrengths, commonFrequencies, instructions, specialties, usageCount, isFavorite },
				create: { id, name, category, dosageForms, commonStrengths, commonFrequencies, instructions, specialties, usageCount, isFavorite },
			})
		} else {
			medicine = await db.medicine.create({
				data: { id, name, category, dosageForms, commonStrengths, commonFrequencies, instructions, specialties, usageCount, isFavorite },
			})
		}

		return NextResponse.json(medicine)
	} catch (error) {
		console.error("Error saving medicine:", error)
		return NextResponse.json({ error: "Failed to save medicine" }, { status: 500 })
	}
}
