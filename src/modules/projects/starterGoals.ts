import type { GoalHorizon } from '@/core/db/types'

/**
 * The goals Moamen described while planning (CLAUDE.md §0 and §5.1), each with
 * a first project and three small first steps (about 25 minutes or less each).
 *
 * They are added on request from the Projects page, all as "Not now": writing
 * a goal down is not committing to it. The owner picks up to 3 to start.
 */
export interface StarterGoal {
  /** Matches `life_areas.name_en` so the goal lands in the right area. */
  area: string
  goal: string
  why: string
  horizon: GoalHorizon
  project: string
  /** What "done" looks like for the project. */
  outcome: string
  steps: ReadonlyArray<{ title: string; minutes: number }>
}

export const STARTER_GOALS: readonly StarterGoal[] = [
  {
    area: "Qur'an",
    goal: 'أثبّت حفظي للقرآن وأزود عليه بهدوء',
    why: 'القرآن أول حاجة في يومي',
    horizon: 'year',
    project: 'خطة مراجعة ثابتة للمحفوظ',
    outcome: 'عندي جدول مراجعة بمشي عليه كل يوم بعد الفجر',
    steps: [
      { title: 'أكتب السور اللي حافظها في ورقة واحدة', minutes: 15 },
      { title: 'أقسّم المحفوظ على 7 أيام', minutes: 20 },
      { title: 'أسمّع صفحة واحدة لحد قريب مني', minutes: 10 },
    ],
  },
  {
    area: 'Deen & Worship',
    goal: 'أحافظ على الأذكار والسنن',
    why: 'تثبيت وطمأنينة في اليوم كله',
    horizon: 'quarter',
    project: 'روتين أذكار الصباح والمساء',
    outcome: 'بقول أذكار الصباح والمساء أغلب أيام الأسبوع',
    steps: [
      { title: 'أختار كتيب أذكار أو تطبيق واحد بس', minutes: 10 },
      { title: 'أقرأ أذكار الصباح بعد الفجر مرة', minutes: 10 },
      { title: 'أحط تذكير هادي بعد العصر لأذكار المساء', minutes: 5 },
    ],
  },
  {
    area: 'Islamic Knowledge',
    goal: 'أبدأ طلب العلم الشرعي بمنهج واضح',
    why: 'أعبد ربنا على علم',
    horizon: 'year',
    project: 'دراسة متن واحد مع شرح',
    outcome: 'خلصت متن قصير (زي الأربعين النووية) بشرح شيخ',
    steps: [
      { title: 'أختار المتن والشرح اللي همشي معاه', minutes: 20 },
      { title: 'أسمع أول درس وأكتب 3 فوائد', minutes: 25 },
      { title: 'أكتب سؤال واحد أسأله لشيخ', minutes: 5 },
    ],
  },
  {
    area: 'Family & Relationships',
    goal: 'أوصل رحمي وأدي أهلي وقتهم',
    why: 'صلة الرحم بركة، والأسرة أولوية',
    horizon: 'quarter',
    project: 'قايمة صلة الرحم',
    outcome: 'بكلم الأقارب المهمين بانتظام من غير ما أنسى حد',
    steps: [
      { title: 'أكتب أسماء الأقارب اللي محتاج أوصلهم', minutes: 10 },
      { title: 'أكلم واحد منهم النهارده', minutes: 10 },
      { title: 'أحدد وقت ثابت للأسرة يوم الجمعة', minutes: 5 },
    ],
  },
  {
    area: 'Health & Recovery',
    goal: 'نوم كويس وجسم نشيط',
    why: 'من غير صحة مفيش حاجة تمشي',
    horizon: 'quarter',
    project: 'تثبيت ميعاد النوم والحركة',
    outcome: 'بنام في ميعاد ثابت وبمشي 3 مرات في الأسبوع',
    steps: [
      { title: 'أحدد ميعاد نوم ثابت وأكتبه', minutes: 5 },
      { title: 'أمشي 15 دقيقة بعد العصر', minutes: 15 },
      { title: 'أشيل الموبايل من جنب السرير', minutes: 5 },
    ],
  },
  {
    area: 'Hospital & Pharmacy',
    goal: 'أطوّر نفسي كصيدلي',
    why: 'شغل أحسن وثقة أكبر في المستشفى',
    horizon: 'year',
    project: 'كروت أدوية المستشفى',
    outcome: '50 كارت لأكتر الأدوية اللي بتعدي عليا في الشغل',
    steps: [
      { title: 'أكتب أسماء 10 أدوية بتتصرف كتير', minutes: 15 },
      { title: 'أعمل 5 كروت (الجرعة، التداخلات، التحذيرات)', minutes: 25 },
      { title: 'أراجع الكروت دي في يوم المستشفى', minutes: 10 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أتعلم البرمجة بمشروع حقيقي',
    why: 'أقدر أبني وأعدّل أدواتي بنفسي',
    horizon: 'year',
    project: 'أفهم كود تطبيق حياة وأعدّل فيه',
    outcome: 'عملت تعديل صغير بنفسي في التطبيق ونشرته',
    steps: [
      { title: 'أقرأ أول جزء من دليل الكود العربي', minutes: 20 },
      { title: 'أشغّل التطبيق على جهازي', minutes: 25 },
      { title: 'أغيّر نص صغير في الواجهة وأشوفه', minutes: 20 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أفهم أساسيات الذكاء الاصطناعي',
    why: 'مجال بيغيّر كل حاجة، ومنها الصيدلة',
    horizon: 'year',
    project: 'كورس مقدمة في تعلم الآلة',
    outcome: 'خلصت كورس واحد وعملت مشروع صغير',
    steps: [
      { title: 'أختار كورس واحد مجاني', minutes: 15 },
      { title: 'أتفرج على الدرس الأول وأكتب 5 ملاحظات', minutes: 25 },
      { title: 'أشرح فكرة الدرس في 3 سطور بكلامي', minutes: 10 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أبني أساس في الأمن السيبراني',
    why: 'فهم إزاي الأنظمة بتتحمي',
    horizon: 'long_term',
    project: 'أساسيات الشبكات والأمن',
    outcome: 'فاهم أساسيات الشبكات وحليت أول 5 تحديات سهلة',
    steps: [
      { title: 'أختار مصدر واحد للمبتدئين', minutes: 15 },
      { title: 'أذاكر درس عن طبقات الشبكة وأكتب ملخص', minutes: 25 },
      { title: 'أحل أول تحدي سهل', minutes: 25 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أربط الصيدلة بالبرمجة (المعلوماتية الحيوية)',
    why: 'مجال بيجمع دراستي واهتمامي',
    horizon: 'long_term',
    project: 'مقدمة في المعلوماتية الحيوية',
    outcome: 'حللت أول تسلسل جيني بسيط بكود',
    steps: [
      { title: 'أقرأ مقال تعريفي وأكتب 5 مصطلحات', minutes: 20 },
      { title: 'أختار كورس مقدمة', minutes: 15 },
      { title: 'أشغّل أول مثال كود', minutes: 25 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أقوّي الرياضيات اللي محتاجها',
    why: 'أساس الذكاء الاصطناعي والفيزياء',
    horizon: 'long_term',
    project: 'مراجعة الجبر الخطي والإحصاء',
    outcome: 'فاهم المصفوفات والاحتمالات الأساسية',
    steps: [
      { title: 'أختار كورس أو كتاب واحد', minutes: 10 },
      { title: 'أحل 5 مسائل على المصفوفات', minutes: 25 },
      { title: 'أشرح فكرة واحدة بكلامي', minutes: 15 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أفهم الفيزياء الأساسية',
    why: 'فهم أعمق للعالم وللروبوتات',
    horizon: 'long_term',
    project: 'ميكانيكا كلاسيكية من الأول',
    outcome: 'خلصت وحدة الحركة وقوانين نيوتن بتمارين',
    steps: [
      { title: 'أختار مصدر واحد', minutes: 10 },
      { title: 'أذاكر درس قوانين نيوتن', minutes: 25 },
      { title: 'أحل 3 تمارين', minutes: 25 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أدخل عالم الدرونز والروبوتات',
    why: 'أطبّق البرمجة والفيزياء على حاجة بتتحرك',
    horizon: 'long_term',
    project: 'أول مشروع إلكترونيات بسيط',
    outcome: 'شغّلت دايرة بسيطة بأردوينو (حقيقية أو محاكاة)',
    steps: [
      { title: 'أتفرج على مقدمة عن مكونات الدرون', minutes: 20 },
      { title: 'أجرب محاكي أردوينو أونلاين', minutes: 25 },
      { title: 'أكتب قايمة القطع اللي محتاجها', minutes: 10 },
    ],
  },
  {
    area: 'Learning',
    goal: 'أفهم تصميم ومعمارية البرمجيات',
    why: 'أبني أنظمة تعيش وتتطور',
    horizon: 'long_term',
    project: 'أساسيات معمارية البرمجيات',
    outcome: 'أقدر أرسم وأشرح معمارية تطبيق حياة',
    steps: [
      { title: 'أقرأ قسم الطبقات في دليل الكود', minutes: 15 },
      { title: 'أرسم طبقات التطبيق على ورقة', minutes: 20 },
      { title: 'أقرأ فصل واحد من كتاب معمارية', minutes: 25 },
    ],
  },
  {
    area: 'Reading',
    goal: 'أقرأ بانتظام',
    why: 'القراءة بتغذي العقل والروح',
    horizon: 'year',
    project: 'كتاب كل شهر',
    outcome: 'خلصت كتاب الشهر ده وكتبت ملخص صغير',
    steps: [
      { title: 'أختار كتاب الشهر', minutes: 10 },
      { title: 'أقرأ 10 صفحات', minutes: 20 },
      { title: 'أكتب 3 أفكار من اللي قريته', minutes: 10 },
    ],
  },
  {
    area: 'Freelancing',
    goal: 'دخل إضافي من العمل الحر',
    why: 'استقلال مادي وخبرة عملية',
    horizon: 'year',
    project: 'أول عميل في العمل الحر',
    outcome: 'سلّمت أول مشروع لعميل واستلمت فلوسه',
    steps: [
      { title: 'أحدد الخدمة اللي هقدمها في جملة واحدة', minutes: 15 },
      { title: 'أعمل بروفايل على منصة واحدة', minutes: 25 },
      { title: 'أبعت أول عرض لمشروع', minutes: 20 },
    ],
  },
  {
    area: 'Ventures & Ideas',
    goal: 'أختبر فكرة مشروع ناشئ',
    why: 'أعرف الفكرة تستاهل قبل ما أصرف عليها وقت',
    horizon: 'long_term',
    project: 'اختبار فكرة واحدة',
    outcome: 'كلمت 5 أشخاص عن المشكلة وعرفت إذا كانت حقيقية',
    steps: [
      { title: 'أكتب المشكلة والمستخدم في سطرين', minutes: 10 },
      { title: 'أكتب 5 أسئلة للمقابلة', minutes: 15 },
      { title: 'أكلم أول شخص', minutes: 20 },
    ],
  },
  {
    area: 'Finance',
    goal: 'أرتّب فلوسي وأحسب زكاتي',
    why: 'راحة بال وأداء حق ربنا في المال',
    horizon: 'quarter',
    project: 'ميزانية شهرية بسيطة',
    outcome: 'عارف دخلي ومصاريفي الشهر ده',
    steps: [
      { title: 'أكتب الدخل الثابت كل شهر', minutes: 10 },
      { title: 'أسجّل مصاريف أسبوع واحد', minutes: 5 },
      { title: 'أحدد ميعاد حول الزكاة', minutes: 10 },
    ],
  },
]
