import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendSignInEmail, verifySignInCode } from '@/core/auth/auth'

/** Step 1: email. Step 2: the 6-digit code from the email (or tap the link in it). */
export function SignInForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  function onSend(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      await sendSignInEmail(email.trim())
      setSent(true)
    })
  }

  function onVerify(event: FormEvent) {
    event.preventDefault()
    void run(() => verifySignInCode(email.trim(), code.trim()))
  }

  return (
    <div className="flex flex-col gap-3">
      {!sent ? (
        <form onSubmit={onSend} className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm">
            {t('sync.email')}
            <Input
              type="email"
              dir="ltr"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy}>
            {t('sync.sendCode')}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerify} className="flex flex-col gap-2">
          <p className="text-sm">{t('sync.checkEmail', { email })}</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-sm">
              {t('sync.code')}
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                dir="ltr"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-36 tracking-widest"
              />
            </label>
            <Button type="submit" disabled={busy}>
              {t('sync.signIn')}
            </Button>
            <Button variant="ghost" onClick={() => setSent(false)}>
              {t('sync.changeEmail')}
            </Button>
          </div>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm">
          {t('sync.failed')} <span dir="auto">{error}</span>
        </p>
      )}
    </div>
  )
}
