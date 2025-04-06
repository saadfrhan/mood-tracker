import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, parseISO } from "date-fns"

// Get all journal entries for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const date = url.searchParams.get("date")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    let journalEntries

    if (date) {
      // Get journal entry for a specific date
      const parsedDate = parseISO(date)
      journalEntries = await prisma.journalEntry.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay(parsedDate),
            lte: endOfDay(parsedDate),
          },
        },
        orderBy: {
          date: "desc",
        },
      })
    } else if (startDate && endDate) {
      // Get journal entries for a date range
      journalEntries = await prisma.journalEntry.findMany({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay(parseISO(startDate)),
            lte: endOfDay(parseISO(endDate)),
          },
        },
        orderBy: {
          date: "desc",
        },
      })
    } else {
      // Get all journal entries
      journalEntries = await prisma.journalEntry.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: "desc",
        },
      })
    }

    return NextResponse.json(journalEntries)
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

// Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(),
        content,
        userId: user.id,
      },
    })

    return NextResponse.json(journalEntry)
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}

