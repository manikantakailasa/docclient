import { NextResponse } from 'next/server'
import { query } from '@/lib/db/db'

export async function GET() {
	try {
		const result = await query('SELECT NOW() AS current_time')
		return NextResponse.json({ success: true, time: result.rows[0].current_time })
	} catch (error) {
		console.error('Database connection failed:', error)
		return NextResponse.json({ success: false, error: 'DB connection failed' }, { status: 500 })
	}
}
