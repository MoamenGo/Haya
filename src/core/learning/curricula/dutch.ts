import type { DayType } from '@/core/time/config'
import { DUTCH_MIN, DUTCH_WEEKS } from '../config'
import type { Curriculum, Link, StudyItem, WeekOverview } from '../types'
import {
  DUTCH_EXIT_CHECKS,
  DUTCH_SOURCES,
  DUTCH_STAGES,
  type DutchSourceId,
  type DutchStage,
} from './dutchData'

/** Where a week sits: its stage and the week's position inside that stage (0-based). */
interface WeekPlace {
  stage: DutchStage
  index: number
}

function placeOf(week: number): WeekPlace {
  let first = 1
  for (const stage of DUTCH_STAGES) {
    if (week < first + stage.weeks) return { stage, index: week - first }
    first += stage.weeks
  }
  const last = DUTCH_STAGES[DUTCH_STAGES.length - 1]
  if (!last) throw new Error('No Dutch stages')
  return { stage: last, index: last.weeks - 1 }
}

function source(id: DutchSourceId): Link {
  const s = DUTCH_SOURCES[id]
  return { title: s.paid ? `${s.title} (مدفوع)` : s.title, url: s.url }
}

/** Sources rotate week by week, as in the original map. */
function rotate(ids: readonly DutchSourceId[], index: number): Link | null {
  const id = ids[index % ids.length]
  return id ? source(id) : null
}

function youtubeSearch(title: string, query: string): Link {
  return { title, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` }
}

function topic(week: number): string {
  const { stage, index } = placeOf(week)
  return stage.grammar[index] ?? stage.grammar[0] ?? ''
}

function overview(week: number): WeekOverview {
  const { stage, index } = placeOf(week)
  const query = stage.searchQueries[index] ?? ''
  const resources: Link[] = [
    youtubeSearch(`شرح عربي: ${topic(week)}`, `${query} شرح بالعربي`),
    youtubeSearch(`شرح بالإنجليزي: ${query}`, query),
    ...[
      rotate(stage.grammarSources, index),
      rotate(stage.listening, index),
      rotate(stage.reading, index),
      source(stage.vocabulary),
      rotate(stage.output, index),
    ].filter((l): l is Link => l !== null),
    ...stage.extra.map(source),
  ]
  const check = DUTCH_EXIT_CHECKS[week]
  // One source can serve two roles in a week (say, reading and vocabulary): list it once.
  const unique = resources.filter((r, i) => resources.findIndex((o) => o.url === r.url) === i)
  return {
    week,
    phase: `${stage.level} · ${stage.name}`,
    title: topic(week),
    topics: [
      `قواعد: ${topic(week)}`,
      'استماع وقراءة 20 دقيقة',
      '10 كلمات جديدة يوميًا في Anki مع de/het',
      'تحدث وكتابة',
    ],
    project: null,
    milestone: check ? `امتحان تجريبي · ${check}` : null,
    resources: unique,
  }
}

function anki(week: number, day: number): StudyItem {
  return {
    key: `w${week}:d${day}:anki`,
    text: '10 كلمات جديدة في Anki مع de/het + مراجعة',
    minutes: DUTCH_MIN.anki,
    kind: 'review',
    link: source(placeOf(week).stage.vocabulary),
  }
}

function listening(week: number, day: number): StudyItem {
  const { stage, index } = placeOf(week)
  return {
    key: `w${week}:d${day}:listening`,
    text: 'استماع 20 دقيقة',
    minutes: DUTCH_MIN.listening,
    kind: 'practice',
    link: rotate(stage.listening, index),
  }
}

/** The week's grammar again, explained in Arabic. Stages without Arabic sources skip it. */
function arabicReview(week: number): StudyItem | null {
  const { stage, index } = placeOf(week)
  const link = rotate(stage.arabic, index)
  if (!link) return null
  return {
    key: `w${week}:arabic`,
    text: `راجع درس القواعد بشرح عربي: ${topic(week)}`,
    minutes: DUTCH_MIN.arabicReview,
    kind: 'review',
    link,
  }
}

/** At the end of each stage, a practice exam takes the place of reading and writing. */
function exitCheck(week: number): StudyItem | null {
  if (!DUTCH_EXIT_CHECKS[week]) return null
  const last = week === DUTCH_WEEKS
  return {
    key: `w${week}:exam`,
    text: 'امتحان تجريبي وسجّل نتيجتك',
    minutes: DUTCH_MIN.exam,
    kind: 'check',
    link: source(last ? 'cnavt' : 'oefenex'),
  }
}

function deepDay(week: number, day: number, nth: number, isLastDeep: boolean): StudyItem[] {
  const { stage, index } = placeOf(week)
  const items: StudyItem[] = []
  if (nth === 0) {
    items.push({
      key: `w${week}:grammar`,
      text: `درس القواعد: ${topic(week)} + تمارينه`,
      minutes: DUTCH_MIN.grammarLesson,
      kind: 'study',
      link: rotate(stage.grammarSources, index),
    })
  } else {
    items.push((nth === 1 ? arabicReview(week) : null) ?? listening(week, day))
  }

  const check = isLastDeep ? exitCheck(week) : null
  if (check) {
    items.push(check)
  } else {
    items.push({
      key: `w${week}:d${day}:reading`,
      text: 'قراءة 20 دقيقة',
      minutes: DUTCH_MIN.reading,
      kind: 'practice',
      link: rotate(stage.reading, index),
    })
    items.push({
      key: `w${week}:d${day}:output`,
      // The first two stages lean on pronunciation; later ones on conversation.
      text: stage.level === 'A1' || stage.level === 'A2' ? 'نطق بصوت عالي وكتابة' : 'تحدث وكتابة',
      minutes: nth === 0 ? DUTCH_MIN.output : DUTCH_MIN.longOutput,
      kind: 'practice',
      link: rotate(stage.output, index),
    })
  }
  items.push(anki(week, day))
  return items
}

function planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][] {
  const deepDays = dayTypes.flatMap((type, i) => (type === 'deep_work' ? [i] : []))
  const lastDeep = deepDays[deepDays.length - 1]

  return dayTypes.map((type, day) => {
    if (type === 'deep_work') return deepDay(week, day, deepDays.indexOf(day), day === lastDeep)
    if (type === 'rest') return [anki(week, day)]
    // Hospital and custom days: light. With no deep day this week, the grammar
    // lesson still happens once, on the first light day.
    if (deepDays.length === 0 && day === dayTypes.findIndex((t) => t !== 'rest')) {
      return deepDay(week, day, 0, false).filter((item) => item.kind !== 'practice')
    }
    return [listening(week, day), anki(week, day)]
  })
}

export const dutch: Curriculum = {
  key: 'dutch_a1_c1',
  totalWeeks: DUTCH_WEEKS,
  overview,
  planWeek,
  minimum: (week, day) => ({ ...anki(week, day), text: 'الحد الأدنى: مراجعة Anki 10 دقائق' }),
}
