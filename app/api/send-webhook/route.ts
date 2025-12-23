import { NextRequest, NextResponse } from 'next/server'

interface WebhookPayload {
  webhookUrl: string
  data: {
    name: string
    email: string
    message: string
    company?: string
    phone?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json()

    // Minimal validation - just check URL exists
    if (!body.webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Webhook URL is required' },
        { status: 400 }
      )
    }

    // Add timestamp
    const timestamp = new Date().toISOString()

    // Prepare payload for n8n
    const webhookPayload = {
      ...body.data,
      timestamp,
    }

    // Send to user's webhook - fire and forget, don't check response
    await fetch(body.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    // Always return success - user is responsible for their webhook URL
    return NextResponse.json({
      success: true,
      timestamp,
    })
  } catch (error) {
    console.error('Webhook error:', error)

    return NextResponse.json(
      { success: false, error: 'Не удалось отправить запрос. Проверьте URL.' },
      { status: 500 }
    )
  }
}
