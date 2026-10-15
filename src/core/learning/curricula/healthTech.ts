import type { DayType } from '@/core/time/config'
import { HEALTH_TECH_MIN } from '../config'
import type { Curriculum, Link, StudyItem, WeekOverview } from '../types'
import {
  HEALTH_TECH_PHASES,
  HEALTH_TECH_RESOURCES,
  HEALTH_TECH_WEEKS,
  type HealthTechPhase,
  type HealthTechWeek,
} from './healthTechData'

function weekData(week: number): HealthTechWeek {
  const index = Math.min(HEALTH_TECH_WEEKS.length, Math.max(1, week)) - 1
  const data = HEALTH_TECH_WEEKS[index]
  if (!data) throw new Error('No Health Tech weeks')
  return data
}

export function healthTechPhase(week: number): HealthTechPhase {
  const found = HEALTH_TECH_PHASES.find((p) => week >= p.from && week <= p.to)
  const last = HEALTH_TECH_PHASES[HEALTH_TECH_PHASES.length - 1]
  if (!found && !last) throw new Error('No Health Tech phases')
  return (found ?? last) as HealthTechPhase
}

function resources(week: number): Link[] {
  return weekData(week).resources.flatMap((key) => {
    const r = HEALTH_TECH_RESOURCES[key]
    return r ? [{ title: r.title, url: r.url }] : []
  })
}

function topic(week: number, n: number): string {
  return weekData(week).topics[n] ?? weekData(week).title
}

function overview(week: number): WeekOverview {
  const data = weekData(week)
  const phase = healthTechPhase(week)
  return {
    week,
    phase: `${phase.code} · ${phase.name}`,
    title: data.title,
    topics: data.topics,
    project: data.project,
    milestone: data.milestone ?? null,
    resources: resources(week),
  }
}

/**
 * Deep-work blocks, in order: two topics + practice, two topics + practice,
 * then the week's project. Keys carry the block, not the day, so a tick stays
 * with its work if a day's type changes.
 */
function deepBlocks(week: number): StudyItem[][] {
  const main = resources(week)[0] ?? null
  const study = (n: number): StudyItem => ({
    key: `w${week}:topic${n}`,
    text: `ذاكر وطبّق: ${topic(week, n)}`,
    minutes: HEALTH_TECH_MIN.topic,
    kind: 'study',
    link: main,
  })
  const practice = (block: number): StudyItem => ({
    key: `w${week}:practice${block}`,
    text: 'تمارين عملية على الموضوعين: اكتب الكود بنفسك',
    minutes: HEALTH_TECH_MIN.practice,
    kind: 'practice',
    link: null,
  })
  return [
    [study(0), study(1), practice(1)],
    [study(2), study(3), practice(2)],
    [
      {
        key: `w${week}:project`,
        text: `مشروع الأسبوع: ${weekData(week).project}`,
        minutes: HEALTH_TECH_MIN.projectStart,
        kind: 'project',
        link: null,
      },
      {
        key: `w${week}:projectPlan`,
        text: 'قسّم المشروع لمهام صغيرة واكتب README مبدئي',
        minutes: HEALTH_TECH_MIN.projectPlan,
        kind: 'project',
        link: null,
      },
    ],
  ]
}

/** Friday: finish and publish, then a three-line note on the week. */
function wrapBlock(week: number): StudyItem[] {
  return [
    {
      key: `w${week}:push`,
      text: 'أكمل المشروع وارفعه على GitHub',
      minutes: HEALTH_TECH_MIN.projectPush,
      kind: 'project',
      link: null,
    },
    {
      key: `w${week}:note`,
      text: 'ملاحظة الأسبوع: خلصت إيه، اتعطلت فين، الأسبوع الجاي إيه',
      minutes: HEALTH_TECH_MIN.weeklyNote,
      kind: 'review',
      link: null,
    },
  ]
}

/** Light sessions for hospital and custom days, in order. */
function lightBlock(week: number, n: number): StudyItem[] {
  const main = resources(week)[0] ?? null
  const key = (slot: string) => `w${week}:light${n}:${slot}`
  switch (n) {
    case 0:
      return [
        {
          key: key('review'),
          text: 'راجع ملاحظات الأسبوع اللي فات',
          minutes: HEALTH_TECH_MIN.lightReview,
          kind: 'review',
          link: null,
        },
        {
          key: key('intro'),
          text: `اقرأ مقدمة عن: ${topic(week, 0)}`,
          minutes: HEALTH_TECH_MIN.lightIntro,
          kind: 'study',
          link: main,
        },
      ]
    case 1:
      return [
        {
          key: key('video'),
          text: `فيديو أو قراءة عن: ${topic(week, 1)}`,
          minutes: HEALTH_TECH_MIN.lightLong,
          kind: 'study',
          link: main,
        },
        {
          key: key('questions'),
          text: 'اكتب 3 أسئلة لسه مش واضحة',
          minutes: HEALTH_TECH_MIN.lightShort,
          kind: 'review',
          link: null,
        },
      ]
    default:
      return [
        {
          key: key('exercises'),
          text: 'تمارين خفيفة على موضوعات الأسبوع',
          minutes: HEALTH_TECH_MIN.lightLong,
          kind: 'practice',
          link: null,
        },
        {
          key: key('refactor'),
          text: 'راجع الكود اللي كتبته وحسّن تسمية واحدة على الأقل',
          minutes: HEALTH_TECH_MIN.lightShort,
          kind: 'practice',
          link: null,
        },
      ]
  }
}

function planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][] {
  const plan: StudyItem[][] = dayTypes.map(() => [])
  const deepDays = dayTypes.flatMap((type, i) => (type === 'deep_work' ? [i] : []))
  const lightDays = dayTypes.flatMap((type, i) =>
    type === 'hospital' || type === 'custom' ? [i] : [],
  )
  const restDay = dayTypes.findIndex((type) => type === 'rest')
  const blocks = deepBlocks(week)

  if (deepDays.length > 0) {
    // Fewer deep days than blocks: share the blocks out, earlier days first.
    const perDay = Math.ceil(blocks.length / deepDays.length)
    deepDays.forEach((day, i) => {
      const share = blocks.slice(i * perDay, (i + 1) * perDay).flat()
      plan[day] = share.length
        ? share
        : [
            {
              key: `w${week}:deepdive${i}`,
              text: 'تعمق في أصعب نقطة هذا الأسبوع، أو خد راحة',
              minutes: HEALTH_TECH_MIN.deepDive,
              kind: 'study',
              link: null,
            },
          ]
    })
  }

  // With no deep day at all (leave, exams), the light days still cover the topics.
  lightDays.forEach((day, i) => {
    plan[day] = lightBlock(week, i)
  })

  const wrap = wrapBlock(week)
  const lastDeep = deepDays[deepDays.length - 1]
  const wrapDay = restDay >= 0 ? restDay : (lastDeep ?? dayTypes.length - 1)
  plan[wrapDay] = [...(plan[wrapDay] ?? []), ...wrap]
  return plan
}

export const healthTech: Curriculum = {
  key: 'health_tech',
  totalWeeks: HEALTH_TECH_WEEKS.length,
  overview,
  planWeek,
  minimum: (week, day) => ({
    key: `w${week}:d${day}:minimum`,
    text: 'الحد الأدنى: راجع ملاحظاتك 10 دقائق',
    minutes: HEALTH_TECH_MIN.minimum,
    kind: 'review',
    link: null,
  }),
}
