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
  // which guards both register (on a resumed draft) and resend-otp.
  [/please wait (\d+) seconds/i, 'cooldown', (match) => ({ seconds: match[1] })],
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
]

function localizeAuthMessage(rawMessage) {
  const message = String(rawMessage || '').trim()

  for (const [pattern, key, toParams] of RULES) {
    const match = message.match(pattern)
    if (match) {
      return i18n.global.t(`authErrors.${key}`, toParams ? toParams(match) : {})
    }
  }

  // Unmatched — including MilliyMockException's own "Something went wrong"
  // default, which is what every unhandled server-side exception collapses to.
  // A generic line beats leaking English internals at the user.
  return i18n.global.t('authErrors.generic')
}

// Builds the Error the auth store throws for a failed API call. `localized`
// marks the message as ours so it survives the store's catch untouched; an
// error without it is something we didn't author and can't safely display.
export function authApiError(payload) {
  const error = new Error(localizeAuthMessage(payload?.message))
  error.localized = true
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
