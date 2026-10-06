import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { AreasList } from '../components/AreasList'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { VisionForm } from '../components/VisionForm'
import { useSetting } from '../hooks'

export function SettingsPage() {
  const { t } = useTranslation()
  const [language, setLanguage] = useSetting('language')
  const [theme, setTheme] = useSetting('theme')

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>

      <Card className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">{t('settings.language')}</h2>
          <ChoiceGroup
            label={t('settings.language')}
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'ar', label: 'العربية' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">{t('settings.theme')}</h2>
          <ChoiceGroup
            label={t('settings.theme')}
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: t('settings.themes.system') },
              { value: 'light', label: t('settings.themes.light') },
              { value: 'dark', label: t('settings.themes.dark') },
            ]}
          />
        </div>
      </Card>

      <Card id="vision">
        <VisionForm />
      </Card>

      <Card>
        <AreasList />
      </Card>

      <Card>
        <h2 className="font-medium">{t('settings.about')}</h2>
        <p className="mt-1 text-sm text-muted">
          {t('settings.storage')} · v{__APP_VERSION__}
        </p>
      </Card>
    </div>
  )
}
