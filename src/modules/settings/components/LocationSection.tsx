import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useSetting } from '../hooks'

const COORD_DECIMALS = 4

/** Prayer times need a rough location. It is stored and used on the device only. */
export function LocationSection() {
  const { t } = useTranslation()
  const [location, setLocation] = useSetting('location')
  const [message, setMessage] = useState<string | null>(null)

  function detectLocation() {
    if (!('geolocation' in navigator)) {
      setMessage(t('settings.locationDenied'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        // Rounded (≈10 m): more precision adds nothing to prayer times.
        const round = (n: number) => Number(n.toFixed(COORD_DECIMALS))
        await setLocation({ latitude: round(coords.latitude), longitude: round(coords.longitude) })
        setMessage(t('settings.locationSaved'))
      },
      () => setMessage(t('settings.locationDenied')),
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium">{t('settings.location')}</h2>
      <p className="text-sm text-muted">{t('settings.locationHint')}</p>
      <p className="text-sm tabular-nums text-muted">
        <bdi dir="ltr">
          {location.latitude}, {location.longitude}
        </bdi>
      </p>
      <div>
        <Button variant="outline" onClick={detectLocation}>
          {t('settings.useMyLocation')}
        </Button>
      </div>
      {message && (
        <p role="status" className="text-sm text-muted">
          {message}
        </p>
      )}
    </div>
  )
}
