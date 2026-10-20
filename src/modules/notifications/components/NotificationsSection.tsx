import { useTranslation } from 'react-i18next'
import { nativeNotifications } from '@/core/notify/bridge'
import { NOTIFY_CATEGORIES } from '@/core/notify/config'
import { useSetting } from '@/modules/settings/hooks'

/** Settings › Notifications: one switch per kind. They take effect in the Android app. */
export function NotificationsSection() {
  const { t } = useTranslation()
  const [prefs, setPrefs] = useSetting('notifications')
  const onPhone = nativeNotifications() !== null

  return (
    <section className="flex flex-col gap-3" aria-labelledby="notify-heading">
      <div className="flex flex-col gap-1">
        <h2 id="notify-heading" className="font-medium">
          {t('notify.settings.title')}
        </h2>
        <p className="text-sm text-muted">
          {onPhone ? t('notify.settings.onPhone') : t('notify.settings.notOnPhone')}
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {NOTIFY_CATEGORIES.map((category) => (
          <li key={category}>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={prefs[category]}
                onChange={(e) => void setPrefs({ ...prefs, [category]: e.target.checked })}
                className="mt-1 size-4 accent-[var(--primary)]"
              />
              <span className="flex flex-col gap-0.5">
                <span>{t(`notify.settings.${category}`)}</span>
                <span className="text-xs text-muted">{t(`notify.settings.${category}Hint`)}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">{t('notify.settings.quiet')}</p>
    </section>
  )
}
