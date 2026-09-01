import twilio from 'twilio'

let _twilioClient: ReturnType<typeof twilio> | null = null

export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    console.warn('[Primo Admin] Twilio Account SID or Auth Token missing. Running in simulated SMS mode.')
    return null
  }

  if (!_twilioClient) {
    _twilioClient = twilio(accountSid, authToken)
  }

  return _twilioClient
}

export function formatPhoneNumber(phone: string): string {
  // Strip all non-digit characters except leading +
  let cleaned = phone.trim()
  if (!cleaned.startsWith('+')) {
    const digits = cleaned.replace(/\D/g, '')
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    }
    return `+${digits}`
  }
  return cleaned
}

export async function sendSmsMessage(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getTwilioClient()
  const from = process.env.TWILIO_PHONE_NUMBER
  const formattedTo = formatPhoneNumber(to)

  if (!client || !from) {
    // Return simulated response for development when Twilio credentials are not set
    const mockSid = `SM_SIMULATED_${Date.now()}_${Math.random().toString(36).substring(7)}`
    console.log(`[Primo Admin: Simulated SMS] To: ${formattedTo}, Msg: "${body}", SID: ${mockSid}`)
    return { success: true, sid: mockSid }
  }

  try {
    const message = await client.messages.create({
      body,
      from,
      to: formattedTo
    })
    return { success: true, sid: message.sid }
  } catch (err: any) {
    console.error('[Primo Admin: Twilio Error]', err)
    return { success: false, error: err.message || 'Failed to send SMS' }
  }
}
