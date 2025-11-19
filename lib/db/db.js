import { Pool } from 'pg'
import { PrismaClient } from "@prisma/client"

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
})

export async function query(text, params) {
	const res = await pool.query(text, params)
	return res
}


export const db = new PrismaClient()
