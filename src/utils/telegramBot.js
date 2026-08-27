// The Telegram bot that hands out phone-verification codes (@milliymock_bot).
//
// Two ways into it:
//  - a per-registration deep link (`botUrl` from POST /auth/register/telegram),
//    which carries the ticket — ALWAYS use the value the API returns for that;
//  - the generic `?start=verify` link below, for someone who already has an
//    account and is waiting for a login / password-reset / verify-my-phone code:
//    in the bot they tap 📱, share their number, and the bot shows the pending
//    code. Covers users the bot doesn't know yet, and SMS outages.
export const TELEGRAM_BOT_USERNAME = 'milliymock_bot'
export const TELEGRAM_BOT_VERIFY_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=verify`

// For existing accounts the backend pushes the code to Telegram when it knows
// the user's number there, and falls back to SMS otherwise. The only signal is
// the response `message` ("…sent to your Telegram." / "…sent to your phone
// number."), so the code screens read it to word their copy. Anything we can't
// recognise is treated as SMS — the older wording.
export function codeChannelFromMessage(message) {
  return /telegram/i.test(String(message || '')) ? 'telegram' : 'sms'
}

// Buying tanga also goes through the bot: `?start=pay_coins<N>_<userId>` opens
// it straight at the payment step for the N-tanga package (5 / 10 / 25 — the
// bot keys packages by their tanga count, so N must be the plan's `tokens`).
// The user id is the DB id from the JWT's `nameid` claim; it's how the bot
// credits the right account. Without one (shouldn't happen — both buy
// buttons sit behind the auth gate) the link still opens the package and the
// bot has to ask who is paying.
export function telegramBotPayUrl(tokens, userId) {
  const count = Number(tokens) || 0
  const suffix = userId ? `_${userId}` : ''
  return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=pay_coins${count}${suffix}`
}
