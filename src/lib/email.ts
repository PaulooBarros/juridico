import { Resend } from 'resend'

const FROM     = process.env.RESEND_FROM     ?? 'Leea <onboarding@resend.dev>'
const BASE_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

// Design tokens (light mode)
const C = {
  bg:         '#F6F4EF', // warm paper
  card:       '#FFFFFF',
  border:     '#E0DAD2',
  footer:     '#FBFAF6',
  primary:    '#6E1A1E', // oxblood
  primaryFg:  '#FBFAF6',
  fg:         '#1A1714',
  fgMuted:    '#5C554C',
  fgSubtle:   '#9C9187',
}

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY não configurada')
  return new Resend(key)
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:48px 16px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0"
        style="background:${C.card};border:1px solid ${C.border};border-radius:6px;overflow:hidden;max-width:540px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:24px 36px;border-bottom:1px solid ${C.border};">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:22px;height:22px;background:${C.primary};border-radius:3px;text-align:center;vertical-align:middle;">
                  <span style="font-family:Georgia,serif;font-style:italic;font-weight:600;font-size:13px;color:${C.primaryFg};line-height:22px;">V</span>
                </td>
                <td style="padding-left:8px;">
                  <span style="font-family:Georgia,serif;font-size:15px;font-weight:500;color:${C.fg};letter-spacing:-0.01em;">
                    Vetor <em style="color:${C.primary};">Jurídico</em>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 36px;border-top:1px solid ${C.border};background:${C.footer};">
            <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:${C.fgSubtle};text-transform:uppercase;letter-spacing:0.07em;">
              © 2026 Leea · Aracaju, Brasil
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(label: string, url: string) {
  return `<a href="${url}"
    style="display:inline-block;background:${C.primary};color:${C.primaryFg};text-decoration:none;
           padding:11px 26px;border-radius:5px;font-family:system-ui,sans-serif;
           font-size:13px;font-weight:600;letter-spacing:0.01em;">
    ${label}
  </a>`
}

function fallbackUrl(url: string) {
  return `<p style="margin:20px 0 0;font-size:11px;color:${C.fgSubtle};line-height:1.7;">
    Ou cole no navegador:<br/>
    <span style="color:${C.fgMuted};word-break:break-all;">${url}</span>
  </p>`
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, url: string) {
  const html = baseTemplate(`
    <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:500;
               color:${C.fg};letter-spacing:-0.015em;line-height:1.2;">
      Redefinição de senha
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${C.fgMuted};line-height:1.65;">
      Recebemos um pedido para redefinir a senha da sua conta.<br/>
      Clique no botão abaixo para criar uma nova senha.
    </p>
    ${btn('Redefinir minha senha', url)}
    <p style="margin:28px 0 0;font-size:12px;color:${C.fgSubtle};line-height:1.65;">
      O link expira em <strong style="color:${C.fgMuted};">1 hora</strong>.
      Se você não solicitou a redefinição, ignore este e-mail — sua senha não será alterada.
    </p>
    ${fallbackUrl(url)}
  `)

  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: 'Redefina sua senha — Leea',
    html,
  })
}

// ─── Convite de equipe ────────────────────────────────────────────────────────

export async function sendConviteEmail(opts: {
  email:            string
  nomeEscritorioR:  string
  role:             string
  token:            string
  nomeConvidadoPor?: string
}) {
  const { email, nomeEscritorioR, role, token, nomeConvidadoPor } = opts
  const url = `${BASE_URL}/convite?token=${token}`

  const ROLE_LABEL: Record<string, string> = {
    admin:     'Sócio / Admin',
    lawyer:    'Advogado',
    assistant: 'Assistente',
  }

  const quem = nomeConvidadoPor
    ? `<strong style="color:${C.fg};">${nomeConvidadoPor}</strong> convidou você`
    : 'Você foi convidado'

  const html = baseTemplate(`
    <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:500;
               color:${C.fg};letter-spacing:-0.015em;line-height:1.2;">
      Convite para escritório
    </h1>
    <p style="margin:0 0 4px;font-size:14px;color:${C.fgMuted};line-height:1.65;">
      ${quem} para integrar
      <strong style="color:${C.fg};">${nomeEscritorioR}</strong>
      como <strong style="color:${C.fg};">${ROLE_LABEL[role] ?? role}</strong>.
    </p>
    <p style="margin:0 0 28px;font-size:14px;color:${C.fgMuted};line-height:1.65;">
      Aceite o convite para acessar casos, clientes e documentos do escritório.
    </p>
    ${btn('Aceitar convite', url)}
    <p style="margin:28px 0 0;font-size:12px;color:${C.fgSubtle};line-height:1.65;">
      O convite expira em <strong style="color:${C.fgMuted};">7 dias</strong>.
      Se você não conhece este escritório, ignore este e-mail.
    </p>
    ${fallbackUrl(url)}
  `)

  await getResend().emails.send({
    from:    FROM,
    to:      email,
    subject: `Convite para ${nomeEscritorioR} — Leea`,
    html,
  })
}
