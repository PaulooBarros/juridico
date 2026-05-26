import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'

function makeOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.NEXT_GOOGLE_CLIENT_ID,
    process.env.NEXT_GOOGLE_CLIENT_SECRET,
    process.env.NEXT_GOOGLE_CALENDAR_REDIRECT_URI,
  )
}

export function getGoogleAuthUrl(userId: string): string {
  const oauth2 = makeOAuth2Client()
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: userId,
  })
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2 = makeOAuth2Client()
  const { tokens } = await oauth2.getToken(code)
  return tokens
}

export async function revokeToken(accessToken: string) {
  const oauth2 = makeOAuth2Client()
  oauth2.setCredentials({ access_token: accessToken })
  try { await oauth2.revokeCredentials() } catch {}
}

/** Retorna cliente calendar autenticado ou null se o user não tiver token. */
export async function getCalendarClient(userId: string) {
  const supabase = createClient()
  const { data: row } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!row) return null

  const oauth2 = makeOAuth2Client()
  oauth2.setCredentials({
    access_token:  row.access_token,
    refresh_token: row.refresh_token,
    expiry_date:   new Date(row.expires_at).getTime(),
  })

  // Persiste novo access_token quando o SDK o renova automaticamente
  oauth2.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await supabase
        .from('google_calendar_tokens')
        .update({
          access_token: tokens.access_token,
          expires_at:   new Date(tokens.expiry_date!).toISOString(),
          updated_at:   new Date().toISOString(),
        })
        .eq('user_id', userId)
    }
  })

  return {
    calendar:   google.calendar({ version: 'v3', auth: oauth2 }),
    calendarId: row.calendar_id as string,
  }
}
