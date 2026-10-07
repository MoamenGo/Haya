import { Link } from '@tanstack/react-router'
import { Map, Play } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { ProjectRow } from '@/core/db/types'
import type { ProjectWithNext } from '../repo'
import { ProjectWipLimitError, activateProject, setProjectStatus } from '../repo'
import { NextAction } from './NextAction'
import { ProjectManage } from './ProjectManage'
import { ProjectSteps } from './ProjectSteps'

interface ProjectCardProps {
  item: ProjectWithNext
  /** Currently active projects, offered for pausing when the WIP limit is reached. */
  active: ProjectRow[]
  /** On the Projects page, a link to the project's goal map. Off on the map itself. */
  showGoalLink?: boolean
}

export function ProjectCard({ item, active, showGoalLink = true }: ProjectCardProps) {
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
    <Card className="flex flex-col gap-3 transition-shadow duration-200 hover:shadow-card">
      <div>
        <h3 dir="auto" className="font-semibold">
          {project.title}
        </h3>
        {project.outcome && (
          <p dir="auto" className="mt-1 text-sm text-muted">
            {project.outcome}
          </p>
        )}
      </div>

      {project.status === 'active' && <NextAction project={project} task={nextAction} />}
      {project.status !== 'done' && (
        <ProjectSteps projectId={project.id} open={project.status === 'active'} />
      )}

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

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {project.status === 'active' ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void setProjectStatus(project.id, 'paused')}
            >
              {t('projects.pause')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void setProjectStatus(project.id, 'done')}
            >
              {t('projects.finish')}
            </Button>
          </>
        ) : project.status !== 'done' ? (
          <>
            <Button size="sm" onClick={() => void start()}>
              <Play aria-hidden />
              {t('projects.start')}
            </Button>
            {project.status === 'paused' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void setProjectStatus(project.id, 'planned')}
              >
                {t('projects.backToPlanned')}
              </Button>
            )}
          </>
        ) : null}
        <span className="flex-1" />
        {showGoalLink && project.goal_id && (
          <Link
            to="/goals/$goalId"
            params={{ goalId: project.goal_id }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-muted hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Map aria-hidden className="size-4" />
            {t('projects.goalMap')}
          </Link>
        )}
        <ProjectManage project={project} />
      </div>
    </Card>
  )
}
