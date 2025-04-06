import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { startOfDay, endOfDay, parseISO } from "date-fns"

// Get all mood entries for the current user
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
    const includeDetails = url.searchParams.get("includeDetails") === "true"

    let moodEntries

    if (date) {
      // Get mood entry for a specific date
      const parsedDate = parseISO(date)
      moodEntries = await prisma.moodEntry.findFirst({
        where: {
          userId: user.id,
          date: {
            gte: startOfDay(parsedDate),
            lte: endOfDay(parsedDate),
          },
        },
      })
    } else if (startDate && endDate) {
      // Get mood entries for a date range
      moodEntries = await prisma.moodEntry.findMany({
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
      // Get all mood entries
      moodEntries = await prisma.moodEntry.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: "desc",
        },
      })
    }

    return NextResponse.json(moodEntries)
  } catch (error) {
    console.error("Error fetching mood entries:", error)
    return NextResponse.json({ error: "Failed to fetch mood entries" }, { status: 500 })
  }
}

// Update the POST function to handle tags
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, moodValue, note, tags } = await request.json()

    // Check if a mood entry already exists for this date
    const existingEntry = await prisma.moodEntry.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: startOfDay(new Date(date)),
          lte: endOfDay(new Date(date)),
        },
      },
    })

    let moodEntry

    if (existingEntry) {
      // Update existing entry
      moodEntry = await prisma.moodEntry.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          moodValue,
          note,
          tags: tags || [],
        },
      })
    } else {
      // Create new entry
      moodEntry = await prisma.moodEntry.create({
        data: {
          date: new Date(date),
          moodValue,
          note,
          tags: tags || [],
          userId: user.id,
        },
      })
    }

    return NextResponse.json(moodEntry)
  } catch (error) {
    console.error("Error creating mood entry:", error)
    return NextResponse.json({ error: "Failed to create mood entry" }, { status: 500 })
  }
}

