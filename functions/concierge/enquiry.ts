interface Env {
  ANTHROPIC_API_KEY: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  messages: ChatMessage[]
}

const SEND_ENQUIRY_EMAIL_TOOL = {
  name: 'send_enquiry_email',
  description:
    'Compose and send a structured enquiry email to a vendor on behalf of the user. Always requires user confirmation before sending.',
  input_schema: {
    type: 'object' as const,
    properties: {
      recipientName: {
        type: 'string',
        description: 'Full name or business name of the recipient',
      },
      recipientEmail: {
        type: 'string',
        description: 'Email address of the recipient',
      },
      subject: {
        type: 'string',
        description: 'Subject line of the email',
      },
      bodyMarkdown: {
        type: 'string',
        description: 'Body of the email in Markdown format',
      },
      replyToEmail: {
        type: 'string',
        description: 'Reply-to address; defaults to the user session email when omitted',
      },
    },
    required: ['recipientName', 'recipientEmail', 'subject', 'bodyMarkdown'],
  },
}

const SYSTEM_PROMPT = `You are a luxury travel concierge assistant. You help users compose and send enquiry emails to hotels, restaurants, and venues on their behalf.

When the user asks to send an enquiry to a hotel or venue, use the send_enquiry_email tool to compose a polished, professional email. Extract the following from the conversation:
- Recipient name and email (use realistic placeholder emails if not provided, e.g. reservations@hotel-costes.fr)
- Dates and room preferences
- Any special requests

Always compose a complete, professional email body in the bodyMarkdown field. Sign off with "Kind regards" from the user.

If the user hasn't provided enough details, ask for what you need before composing.`

const BODY_PREVIEW_MAX = 500

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  if (!env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
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

  const { messages } = body
  if (!Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: 'messages must be an array' }), {
      status: 400,
      headers: corsHeaders,
    })
  }

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [SEND_ENQUIRY_EMAIL_TOOL],
      messages,
    }),
  })

  if (!claudeRes.ok) {
    const err = (await claudeRes.json().catch(() => ({}))) as { error?: unknown }
    return new Response(
      JSON.stringify({ error: `Claude API error: ${JSON.stringify(err)}` }),
      { status: 502, headers: corsHeaders }
    )
  }

  const result = (await claudeRes.json()) as {
    content: Array<
      | { type: 'text'; text: string }
      | { type: 'tool_use'; name: string; id: string; input: Record<string, string> }
    >
  }

  const toolUse = result.content.find(
    (b): b is { type: 'tool_use'; name: string; id: string; input: Record<string, string> } =>
      b.type === 'tool_use' && b.name === 'send_enquiry_email'
  )
  const textBlock = result.content.find(
    (b): b is { type: 'text'; text: string } => b.type === 'text'
  )

  let pendingAction = null

  if (toolUse) {
    const inp = toolUse.input
    const preview =
      inp.bodyMarkdown.length > BODY_PREVIEW_MAX
        ? `${inp.bodyMarkdown.slice(0, BODY_PREVIEW_MAX)}…`
        : inp.bodyMarkdown

    pendingAction = {
      id: crypto.randomUUID(),
      riskClass: 'irreversible',
      channel: 'email',
      recipient: `${inp.recipientName} <${inp.recipientEmail}>`,
      subject: inp.subject,
      bodyPreview: preview,
      humanSummary: `Send an enquiry email to ${inp.recipientName}`,
      isReversible: false,
      isPaid: false,
      // rawInput preserved for confirm-email dispatch — not rendered in UI
      rawInput: {
        recipientName: inp.recipientName,
        recipientEmail: inp.recipientEmail,
        subject: inp.subject,
        bodyMarkdown: inp.bodyMarkdown,
        ...(inp.replyToEmail ? { replyToEmail: inp.replyToEmail } : {}),
      },
    }
  }

  const reply =
    textBlock?.text ??
    (pendingAction
      ? "I've prepared an enquiry email for you. Please review the details and click Send to dispatch it."
      : "How can I help you today? I can compose and send enquiry emails to hotels, restaurants, and venues.")

  return new Response(JSON.stringify({ reply, pendingAction }), { headers: corsHeaders })
}

export const onRequestOptions: PagesFunction = () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
