interface Env {
  RESEND_API_KEY: string
  CONCIERGE_FROM_DOMAIN: string
  // Override recipient for demo/sandbox — prevents sending to real vendors
  DEMO_RECIPIENT_EMAIL: string
}

interface EnquiryInput {
  recipientName: string
  recipientEmail: string
  subject: string
  bodyMarkdown: string
  replyToEmail?: string
}

interface RequestBody {
  actionId: string
  rawInput: EnquiryInput
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
      status: 500,
      headers: corsHeaders,
    })
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const { rawInput } = body
  if (!rawInput?.recipientEmail || !rawInput?.subject || !rawInput?.bodyMarkdown) {
    return new Response(JSON.stringify({ error: 'rawInput missing required fields' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const fromDomain = env.CONCIERGE_FROM_DOMAIN ?? 'you.com'
  const from = `Concierge <concierge@${fromDomain}>`

  // Demo/sandbox gate: redirect to controlled test address to avoid emailing real vendors
  const to = env.DEMO_RECIPIENT_EMAIL ?? rawInput.recipientEmail

  const resendPayload: Record<string, unknown> = {
    from,
    to,
    subject: rawInput.subject,
    text: rawInput.bodyMarkdown,
  }
  if (rawInput.replyToEmail) {
    resendPayload['reply_to'] = rawInput.replyToEmail
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  })

  if (!resendRes.ok) {
    const err = (await resendRes.json().catch(() => ({}))) as { message?: string }
    return new Response(
      JSON.stringify({ error: `Resend error: ${err.message ?? resendRes.status}` }),
      { status: 502, headers: corsHeaders }
    )
  }

  const resendData = (await resendRes.json()) as { id?: string }

  const receiptMessage = `✓ Enquiry sent to ${rawInput.recipientName} — they'll reply to you directly. Message ID: ${resendData.id ?? 'sent'}`

  return new Response(
    JSON.stringify({ receiptMessage, messageId: resendData.id ?? 'sent', to }),
    { headers: corsHeaders }
  )
}

export const onRequestOptions: PagesFunction = () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
