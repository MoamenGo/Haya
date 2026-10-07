import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { AccountSection } from '@/modules/account/components/AccountSection'
import { AreasList } from '../components/AreasList'
import { DataSection } from '../components/DataSection'
import { LocationSection } from '../components/LocationSection'
import { ChoiceGroup } from '@/components/ui/choice-group'
import { ThemePicker } from '../components/ThemePicker'
import { VisionForm } from '../components/VisionForm'
import { useSetting } from '../hooks'
import { PageHeader } from '@/components/layout/PageHeader'

export function SettingsPage() {
  const { t } = useTranslation()
  const [language, setLanguage] = useSetting('language')
  const [theme, setTheme] = useSetting('theme')

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('settings.title')} />

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
      </Card>

      <Card id="appearance" className="flex scroll-mt-20 flex-col gap-6">
        <h2 className="text-base font-semibold">{t('settings.theme')}</h2>
        <div className="flex flex-col gap-2">
          <h3 className="font-medium">{t('settings.mode')}</h3>
          <ChoiceGroup
            label={t('settings.mode')}
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'system', label: t('settings.themes.system') },
              { value: 'light', label: t('settings.themes.light') },
              { value: 'dark', label: t('settings.themes.dark') },
            ]}
          />
        </div>
        <ThemePicker />
      </Card>

      <Card id="account">
        <AccountSection />
      </Card>

      <Card id="vision">
        <VisionForm />
      </Card>

      <Card>
        <LocationSection />
      </Card>

      <Card>
        <AreasList />
      </Card>

      <Card>
        <DataSection />
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
