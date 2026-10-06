import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { listActiveAreas } from '@/modules/areas/repo'
import { useSetting } from '../hooks'

export function AreasList() {
  const { t } = useTranslation()
  const [language] = useSetting('language')
  const areas = useLiveQuery(listActiveAreas, [])

  return (
    <div>
      <h2 className="font-medium">{t('settings.areas')}</h2>
      <p className="mt-1 text-sm text-muted">{t('settings.areasHint')}</p>
      {areas === undefined ? (
        <p className="mt-3 text-sm text-muted">{t('states.loading')}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {areas.map((area) => (
            <li key={area.id} className="rounded-full bg-accent px-3 py-1 text-sm">
              {language === 'ar' ? area.name_ar : area.name_en}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
