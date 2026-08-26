import { i18n } from '@/i18n'
import { isNetworkError } from '@/utils/api'

// The API reports auth failures as {code, message, data} with the message taken
// straight from the .NET service layer (MilliyMock.Service/Services/AuthService.cs
// and SmsService.cs). Those strings are English and the backend serves both uz
// and ru clients, so nothing is localized server-side — we match them here.
//
// Ordered: first match wins, so keep specific patterns above general ones. The
// patterns run against the RAW backend message, never against localized text.
const RULES = [
  // SmsService: Eskiz refused the send, or we couldn't authenticate against it.
  [/failed to send sms|sms provider login failed/i, 'smsUnavailable'],
  [/daily sms limit/i, 'smsDailyLimit'],
  // "Please wait 42 seconds before requesting a new code." — the OTP cooldown,
  // which guards both register (on a resumed draft) and resend-otp. The count
  // also picks the plural form, which ru needs ("1 секунду" / "2 секунды").
  [
    /please wait (\d+) seconds/i,
    'cooldown',
    (match) => ({ seconds: match[1] }),
    (match) => Number(match[1]),
  ],
  // The IP-level OTP limiter (RateLimiterConfiguration: 10 calls/hour), which
  // answers before the controller runs and carries no wait time of its own.
  [/too many requests/i, 'tooManyRequests'],
  [/this email is already registered/i, 'emailRegistered'],
  [/this phone number is already registered/i, 'phoneRegistered'],
  // Registration lives in the server's cache until the code is confirmed, so
  // someone else can claim the number in between and verify-otp 409s.
  [/has since been registered by another account/i, 'identifierTakenMeanwhile'],
  [/no pending registration was found/i, 'noPendingRegistration'],
  // "This account is already verified." (resend-otp) and "This phone number is
  // already verified." (verify-my-phone) mean the same thing to the user.
  [/is already verified/i, 'alreadyVerified'],
  // verify-my-phone with nothing to send to, and PUT /user hitting another
  // account's number (UserService.Update).
  [/add a phone number to your profile first/i, 'addPhoneFirst'],
  [/user with this phone number already exists/i, 'phoneTakenByAnother'],
  [/not authenticated/i, 'notAuthenticated'],
  // Telegram sign-up (POST /auth/register/telegram[/verify]). The bot-specific
  // expiry line must stay above the general "code has expired" rule below.
  [/first name and last name are required/i, 'nameRequired'],
  [/^password is required/i, 'passwordMissing'],
  [/ticket and code are required/i, 'codeRequired'],
  [/get the code from the telegram bot first/i, 'botCodeNotIssued'],
  [/too many wrong attempts/i, 'tooManyAttempts'],
  [/code has expired\. share your number with the bot/i, 'botCodeExpired'],
  [/this registration has expired/i, 'registrationExpired'],
  // Two variants: the pending-registration check says only "has expired", the
  // legacy draft path adds "or was never requested".
  [/code has expired/i, 'codeExpired'],
  [/invalid (verification|reset) code/i, 'codeInvalid'],
  [/is not verified for this account/i, 'channelNotVerified'],
  // UserTestAttemptService refuses to mint an attempt on an unconfirmed phone.
  [/verify your phone number/i, 'phoneNotConfirmed'],
  [/verify your account before logging in/i, 'notVerified'],
  [/password or login is incorrect/i, 'badCredentials'],
  [/user not found/i, 'userNotFound'],
  [/phone number must be in international format/i, 'phoneFormat'],
  [/either an email or a phone number is required/i, 'identifierRequired'],
  [/a new password is required/i, 'passwordRequired'],
  [/an account with this email already exists/i, 'googleEmailExists'],
  [/invalid google token|google client id is not configured/i, 'googleFailed'],
  [/validate telegram data|^expired$/i, 'telegramFailed'],
  // MilliyMockException's own default — what every unhandled server-side
  // exception collapses to. Nothing the user did explains it.
  [/^something went wrong/i, 'serverError'],
]

// ASP.NET model validation reports the field as it's named on the DTO
// ("PhoneNumber"), or as a JSON path when the body itself couldn't be bound
// ("$.code"). Both normalize to a key in authErrors.fields.
const FIELD_LABELS = {
  firstname: 'firstName',
  lastname: 'lastName',
  fathername: 'fatherName',
  phonenumber: 'phoneNumber',
  email: 'email',
  password: 'password',
  newpassword: 'newPassword',
  code: 'code',
  token: 'token',
}

// What a status means once the body gave us nothing to match on. Split per
// flow, because the same code says different things per endpoint: 404 on login
// is "no such account", on resend-otp it's "nothing left to resend".
const FLOW_FALLBACKS = {
  login: { 400: 'badCredentials', 401: 'badCredentials', 403: 'notVerified', 404: 'userNotFound' },
  register: { 409: 'phoneRegistered' },
  registerTelegram: { 400: 'invalidRequest' },
  verifyTelegramRegistration: { 400: 'codeInvalid', 404: 'registrationExpired', 409: 'identifierTakenMeanwhile' },
  verifyOtp: { 400: 'codeInvalid', 404: 'noPendingRegistration', 409: 'identifierTakenMeanwhile' },
  resendOtp: { 404: 'noPendingRegistration', 409: 'alreadyVerified' },
  sendMyPhoneOtp: { 400: 'addPhoneFirst', 404: 'userNotFound', 409: 'alreadyVerified' },
  forgotPassword: { 403: 'channelNotVerified', 404: 'userNotFound' },
  resetPassword: { 400: 'codeInvalid', 404: 'userNotFound' },
  googleLogin: { 400: 'googleFailed', 401: 'googleFailed', 409: 'googleEmailExists' },
  telegramLogin: { 400: 'telegramFailed', 401: 'telegramFailed', 409: 'telegramFailed' },
  updateProfile: { 400: 'invalidRequest', 409: 'phoneTakenByAnother' },
}

const STATUS_FALLBACKS = {
  400: 'invalidRequest',
  401: 'notAuthenticated',
  403: 'forbidden',
  413: 'invalidRequest',
  415: 'invalidRequest',
}

// Picks the message for a failure whose body we couldn't read anything useful
// out of. Falling straight through to `generic` here is what produced the
// "Xatolik yuz berdi" screenshots: the status alone already says a lot more.
function fallbackKey(status, flow, hasBody) {
  if (!status) return 'generic'
  if (status === 429) return 'tooManyRequests'
  // 500 is the app's own handler (a bug on our side); 502/503/504 is the app
  // being unreachable behind the proxy — "try again shortly" fits only the latter.
  if (status >= 500) return status === 500 ? 'serverError' : 'serviceUnavailable'
  // A 4xx with no JSON body at all never went through the API's error handler:
  // a missing route, a proxy error page, or a stale bundle calling an endpoint
  // that has since moved. Nothing about what the user typed explains it, so
  // don't blame their input — this is the empty-bodied 404 case.
  if (!hasBody) return 'serviceUnavailable'
  return FLOW_FALLBACKS[flow]?.[status] || STATUS_FALLBACKS[status] || 'generic'
}

// ProblemDetails ({type, title, status, errors, traceId}) — the shape ASP.NET
// returns when the DTO fails validation before the controller runs. It has no
// `message` field, so the rules above never see it.
function localizeValidationProblem(payload) {
  const errors = payload?.errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return null

  const labels = new Set()
  for (const field of Object.keys(errors)) {
    const name = field.replace(/^\$\.?/, '').split('.').pop().toLowerCase()
    const labelKey = FIELD_LABELS[name]
    // An unrecognised field name would only produce a confusing list — say
    // that something is wrong with the input and leave it there.
    if (!labelKey) return i18n.global.t('authErrors.invalidRequest')
    labels.add(i18n.global.t(`authErrors.fields.${labelKey}`))
  }

  if (!labels.size) return i18n.global.t('authErrors.invalidRequest')
  return i18n.global.t('authErrors.missingFields', {
    fields: [...labels].join(', '),
  })
}

// `flow` names the store action that failed, which is what makes a bare status
// meaningful; `status` is the HTTP status, needed because a failure can arrive
// with no readable body at all.
function localizeAuthMessage(payload, status, flow) {
  const rawMessage = typeof payload?.message === 'string' ? payload.message.trim() : ''

  for (const [pattern, key, toParams, toPlural] of RULES) {
    const match = rawMessage.match(pattern)
    if (match) {
      const params = toParams ? toParams(match) : {}
      // A message with plural forms needs the count as the third argument —
      // without it vue-i18n always hands back the first form.
      return toPlural
        ? i18n.global.t(`authErrors.${key}`, params, toPlural(match))
        : i18n.global.t(`authErrors.${key}`, params)
    }
  }

  const validationMessage = localizeValidationProblem(payload)
  if (validationMessage) return validationMessage

  // A message we have no rule for means the backend wording changed (or an
  // unhandled exception leaked its own text). Surfacing it would show English
  // internals, so it goes to the console for us and a status-based line to the
  // user — but it should be picked up and given a rule.
  if (rawMessage && import.meta.env?.DEV) {
    console.warn(`[authErrors] unmatched backend message (${flow} ${status}):`, rawMessage)
  }

  return i18n.global.t(`authErrors.${fallbackKey(status, flow, payload != null)}`)
}

// Builds the Error the auth store throws for a failed API call. `localized`
// marks the message as ours so it survives the store's catch untouched; an
// error without it is something we didn't author and can't safely display.
// `status` is the HTTP status of the response and `flow` the store action that
// made the call — pass both, they're what keeps a body-less failure readable.
export function authApiError(payload, status, flow) {
  const error = new Error(localizeAuthMessage(payload, status, flow))
  error.localized = true
  error.status = status
  error.apiCode = payload?.code
  error.rawMessage = payload?.message
  return error
}

// Whatever reaches a store catch block: one of ours, a TypeError from a dropped
// connection, or something unforeseen.
export function localizeAuthFailure(error) {
  if (isNetworkError(error)) {
    return i18n.global.t('authErrors.network')
  }
  return error?.localized ? error.message : i18n.global.t('authErrors.generic')
}
