import type { DayType } from '@/core/time/config'
import { ENGLISH_MIN, ENGLISH_STAGE_WEEKS, ENGLISH_WEEKS } from '../config'
import type { Curriculum, Link, StudyItem, WeekOverview } from '../types'
import {
  C1_PRACTICE,
  EF_SET,
  ENGLISH_LEVEL_CHECK_WEEKS,
  ENGLISH_MOCK_WEEKS,
  ENGLISH_STAGES,
  type EnglishStage,
} from './englishData'

/** Sources rotate week by week so the same link isn't used every week. */
function pick<T>(list: readonly T[], week: number): T {
  const item = list[(week - 1) % list.length]
  if (item === undefined) throw new Error('A source list is empty')
  return item
}

function stageOf(week: number): EnglishStage {
  const index = Math.min(ENGLISH_STAGES.length - 1, Math.floor((week - 1) / ENGLISH_STAGE_WEEKS))
  const stage = ENGLISH_STAGES[index]
  if (!stage) throw new Error('No English stages')
  return stage
}

function grammarTopic(week: number): string {
  const stage = stageOf(week)
  return stage.grammar[(week - 1) % ENGLISH_STAGE_WEEKS] ?? stage.grammar[0] ?? ''
}

function overview(week: number): WeekOverview {
  const stage = stageOf(week)
  const resources: Link[] = [
    pick(stage.grammarLinks, week),
    pick(stage.listening, week),
    pick(stage.reading, week),
    stage.vocabulary,
    pick(stage.output, week),
  ]
  if (ENGLISH_LEVEL_CHECK_WEEKS.includes(week)) resources.push(EF_SET)
  if (ENGLISH_MOCK_WEEKS.includes(week)) resources.push(C1_PRACTICE)
  return {
    week,
    phase: `${stage.from} → ${stage.to}`,
    title: grammarTopic(week),
    topics: [
      `قواعد: ${grammarTopic(week)}`,
      'استماع وقراءة 20 دقيقة يوميًا',
      '10 كلمات جديدة يوميًا في Anki',
      'تحدث وكتابة',
    ],
    project: null,
    milestone: ENGLISH_LEVEL_CHECK_WEEKS.includes(week)
      ? `قياس المستوى: الهدف ${stage.to} بنهاية المرحلة`
      : null,
    resources,
  }
}

function anki(week: number, day: number): StudyItem {
  const stage = stageOf(week)
  return {
    key: `w${week}:d${day}:anki`,
    text: '10 كلمات جديدة + مراجعة Anki',
    minutes: ENGLISH_MIN.anki,
    kind: 'review',
    link: stage.vocabulary,
  }
}

function listening(week: number, day: number): StudyItem {
  return {
    key: `w${week}:d${day}:listening`,
    text: 'استماع 20 دقيقة',
    minutes: ENGLISH_MIN.listening,
    kind: 'practice',
    link: pick(stageOf(week).listening, week),
  }
}

function deepDay(
  week: number,
  day: number,
  isFirstDeep: boolean,
  isLastDeep: boolean,
): StudyItem[] {
  const stage = stageOf(week)
  const items: StudyItem[] = []
  if (isFirstDeep) {
    items.push({
      key: `w${week}:grammar`,
      text: `درس القواعد: ${grammarTopic(week)} + تمارينه`,
      minutes: ENGLISH_MIN.grammarLesson,
      kind: 'study',
      link: pick(stage.grammarLinks, week),
    })
  } else {
    items.push(listening(week, day))
  }

  // The level check takes the place of reading and writing on the week's last deep day.
  const check = isLastDeep ? levelCheck(week) : null
  if (check) {
    items.push(check)
  } else {
    items.push({
      key: `w${week}:d${day}:reading`,
      text: 'قراءة 20 دقيقة',
      minutes: ENGLISH_MIN.reading,
      kind: 'practice',
      link: pick(stage.reading, week),
    })
    items.push({
      key: `w${week}:d${day}:output`,
      text: isFirstDeep ? 'كتابة أو تحدث' : 'تحدث وكتابة (أطول)',
      minutes: isFirstDeep ? ENGLISH_MIN.output : ENGLISH_MIN.longOutput,
      kind: 'practice',
      link: pick(stage.output, week),
    })
  }
  items.push(anki(week, day))
  return items
}

/** Every 13 weeks an EF SET test; weeks 76–77 a timed C1 practice test. */
function levelCheck(week: number): StudyItem | null {
  if (ENGLISH_MOCK_WEEKS.includes(week)) {
    return {
      key: `w${week}:mock`,
      text: 'نموذج C1 Advanced بالتوقيت (جزء واحد)',
      minutes: ENGLISH_MIN.levelCheck,
      kind: 'check',
      link: C1_PRACTICE,
    }
  }
  if (ENGLISH_LEVEL_CHECK_WEEKS.includes(week)) {
    return {
      key: `w${week}:efset`,
      text: 'اختبار EF SET وسجّل نتيجتك',
      minutes: ENGLISH_MIN.levelCheck,
      kind: 'check',
      link: EF_SET,
    }
  }
  return null
}

function planWeek(week: number, dayTypes: readonly DayType[]): StudyItem[][] {
  const deepDays = dayTypes.flatMap((type, i) => (type === 'deep_work' ? [i] : []))
  const firstDeep = deepDays[0]
  const lastDeep = deepDays[deepDays.length - 1]

  return dayTypes.map((type, day) => {
    if (type === 'deep_work') {
      return deepDay(week, day, day === firstDeep, day === lastDeep)
    }
    if (type === 'rest') return [anki(week, day)]
    // Hospital and custom days: light. With no deep day this week, the grammar
    // lesson still happens once, on the first light day.
    if (firstDeep === undefined && day === dayTypes.findIndex((t) => t !== 'rest')) {
      return deepDay(week, day, true, false).filter((item) => item.kind !== 'practice')
    }
    return [listening(week, day), anki(week, day)]
  })
}

export const english: Curriculum = {
  key: 'english_a2_c1',
  totalWeeks: ENGLISH_WEEKS,
  overview,
  planWeek,
  minimum: (week, day) => ({ ...anki(week, day), text: 'الحد الأدنى: مراجعة Anki 10 دقائق' }),
}
