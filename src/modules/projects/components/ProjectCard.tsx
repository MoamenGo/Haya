import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ProjectRow } from '@/core/db/types'
import type { ProjectWithNext } from '../repo'
import { ProjectWipLimitError, activateProject, setProjectStatus } from '../repo'
import { NextAction } from './NextAction'

interface ProjectCardProps {
  item: ProjectWithNext
  /** Currently active projects, offered for pausing when the WIP limit is reached. */
  active: ProjectRow[]
}

export function ProjectCard({ item, active }: ProjectCardProps) {
  const { t } = useTranslation()
  const { project, nextAction } = item
  const [choosing, setChoosing] = useState(false)

  async function start(pauseId?: string) {
    try {
      await activateProject(project.id, pauseId)
      setChoosing(false)
    } catch (error) {
      if (error instanceof ProjectWipLimitError) setChoosing(true)
      else throw error
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 dir="auto" className="font-medium">
          {project.title}
        </h3>
        {project.outcome && (
          <p dir="auto" className="mt-1 text-sm text-muted">
            {project.outcome}
          </p>
        )}
      </div>

      {project.status === 'active' && <NextAction project={project} task={nextAction} />}

      {choosing && (
        <div role="status" className="flex flex-col gap-2 rounded-lg bg-accent p-3 text-sm">
          <p>{t('projects.pickToPause', { title: project.title })}</p>
          <div className="flex flex-wrap gap-2">
            {active.map((other) => (
              <Button key={other.id} variant="outline" onClick={() => void start(other.id)}>
                {other.title}
              </Button>
            ))}
            <Button variant="ghost" onClick={() => setChoosing(false)}>
              {t('projects.cancel')}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {project.status === 'active' ? (
          <>
            <Button variant="outline" onClick={() => void setProjectStatus(project.id, 'paused')}>
              {t('projects.pause')}
            </Button>
            <Button variant="ghost" onClick={() => void setProjectStatus(project.id, 'done')}>
              {t('projects.finish')}
            </Button>
          </>
        ) : project.status !== 'done' ? (
          <>
            <Button onClick={() => void start()}>{t('projects.start')}</Button>
            {project.status === 'paused' && (
              <Button variant="ghost" onClick={() => void setProjectStatus(project.id, 'planned')}>
                {t('projects.backToPlanned')}
              </Button>
            )}
          </>
        ) : null}
      </div>
    </Card>
  )
}
