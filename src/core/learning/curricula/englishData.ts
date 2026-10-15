/**
 * English A2 → C1 in 78 weeks: three stages of 26 weeks, free sources only.
 * Imported from the owner's "رحلة الإنجليزية A2–C1" plan (October 2026).
 * Links were written without live verification; fix any broken one here.
 */
import type { Link } from '../types'

export interface EnglishStage {
  from: string
  to: string
  /** One grammar topic per week (26 per stage). */
  grammar: readonly string[]
  grammarLinks: readonly Link[]
  listening: readonly Link[]
  reading: readonly Link[]
  vocabulary: Link
  output: readonly Link[]
}

export const ENGLISH_STAGES: readonly EnglishStage[] = [
  {
    from: 'A2',
    to: 'B1',
    grammar: [
      'المضارع البسيط والمستمر',
      'الماضي البسيط (الأفعال الشاذة)',
      'الماضي المستمر',
      'المضارع التام ever/never',
      'المضارع التام مقابل الماضي البسيط',
      'المستقبل will / going to',
      'المضارع المستمر للمستقبل',
      'المقارنة والتفضيل',
      'المعدود وغير المعدود some/any/much/many',
      'أدوات التعريف a/an/the',
      'can/could/must/have to',
      'should/might/may',
      'مراجعة شاملة + اختبار مستوى',
      'الشرط الصفري والأول',
      'المصدر مقابل -ing',
      'used to',
      'أسماء الموصول who/which/that',
      'المبني للمجهول (مضارع وماضٍ)',
      'حروف الجر للزمان والمكان',
      'Phrasal verbs أساسية',
      'صياغة الأسئلة',
      'ظروف التكرار والحال',
      'المضارع التام المستمر',
      'too/enough/so/such',
      'أدوات الربط because/so/although',
      'مراجعة المرحلة + اختبار مستوى',
    ],
    grammarLinks: [
      { title: 'Perfect English Grammar', url: 'https://www.perfect-english-grammar.com' },
      {
        title: 'British Council – قواعد A1–B1',
        url: 'https://learnenglish.britishcouncil.org/grammar',
      },
      { title: 'English with Lucy', url: 'https://www.youtube.com/@EnglishwithLucy' },
      { title: 'mmmEnglish', url: 'https://www.youtube.com/@mmmEnglish_Emma' },
    ],
    listening: [
      { title: "VOA Let's Learn English – Level 2", url: 'https://learningenglish.voanews.com' },
      {
        title: 'BBC 6 Minute English',
        url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
      },
      { title: 'Easy English', url: 'https://www.youtube.com/@EasyEnglishVideos' },
      {
        title: 'BBC Learning English – Pre-intermediate',
        url: 'https://www.bbc.co.uk/learningenglish/english/course',
      },
    ],
    reading: [
      { title: 'News in Levels – Level 2 (خبر يوميًا)', url: 'https://www.newsinlevels.com' },
      { title: 'Breaking News English – Levels 1–3', url: 'https://breakingnewsenglish.com' },
      { title: 'Global Storybooks – قصة', url: 'https://globalstorybooks.net' },
      { title: 'Lit2Go – قصة مقروءة بصوت', url: 'https://etc.usf.edu/lit2go/' },
    ],
    vocabulary: {
      title: 'Oxford 3000',
      url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
    },
    output: [
      { title: 'يوميات 5 جمل يوميًا وصحّحها بـ LanguageTool', url: 'https://languagetool.org' },
      {
        title: 'Shadowing 10 دقائق يوميًا على فيديو VOA',
        url: 'https://learningenglish.voanews.com',
      },
      { title: 'سجّل صوتك دقيقتين عن يومك وراجع النطق على YouGlish', url: 'https://youglish.com' },
    ],
  },
  {
    from: 'B1',
    to: 'B2',
    grammar: [
      'أزمنة السرد',
      'الماضي التام',
      'الماضي التام المستمر',
      'المستقبل المستمر والتام',
      'الشرط الثاني',
      'الشرط الثالث',
      'الشرط المختلط',
      'wish / if only',
      'الكلام المنقول: الجمل',
      'الكلام المنقول: الأسئلة والأوامر',
      'المبني للمجهول في كل الأزمنة',
      'have/get something done',
      'مراجعة + اختبار مستوى',
      "أفعال الاستنتاج للحاضر must/can't",
      'أفعال الاستنتاج للماضي',
      'جمل الموصول المحددة وغير المحددة',
      'Participle clauses',
      'أنماط الأفعال المتقدمة',
      'Phrasal verbs القابلة للفصل',
      'تلازم make/do/take',
      'however / despite / whereas',
      'المحددات الكمية المتقدمة',
      'the more … the more',
      'الإيميل الرسمي وغير الرسمي',
      'بنية مقال الرأي',
      'مراجعة المرحلة + اختبار مستوى',
    ],
    grammarLinks: [
      {
        title: 'British Council – B1–B2 Grammar',
        url: 'https://learnenglish.britishcouncil.org/grammar/b1-b2-grammar',
      },
      {
        title: 'Learn English with TV Series',
        url: 'https://www.youtube.com/@LearnEnglishWithTVSeries',
      },
      {
        title: 'BBC Learning English – Upper-intermediate',
        url: 'https://www.bbc.co.uk/learningenglish/english/course',
      },
      { title: "Rachel's English (نطق)", url: 'https://www.youtube.com/@rachelsenglish' },
    ],
    listening: [
      {
        title: 'BBC The English We Speak',
        url: 'https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak',
      },
      { title: 'TED-Ed بترجمة إنجليزية', url: 'https://www.youtube.com/@TEDEd' },
      { title: 'All Ears English', url: 'https://www.allearsenglish.com' },
      { title: 'حلقة مسلسل بترجمة إنجليزية ثم بدونها', url: null },
    ],
    reading: [
      { title: 'News in Levels – Level 3', url: 'https://www.newsinlevels.com' },
      { title: 'BBC News – مقال يوميًا', url: 'https://www.bbc.com/news' },
      {
        title: 'Sherlock Holmes من Project Gutenberg – 10 صفحات يوميًا',
        url: 'https://www.gutenberg.org/ebooks/1661',
      },
      { title: 'freeCodeCamp News – مقال تقني', url: 'https://www.freecodecamp.org/news' },
    ],
    vocabulary: {
      title: 'Oxford 5000',
      url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
    },
    output: [
      { title: 'محادثتان 30 دقيقة على Tandem أو HelloTalk', url: 'https://www.tandem.net' },
      { title: 'مهمة كتابة على Write & Improve', url: 'https://writeandimprove.com' },
      { title: 'لخّص فيديو TED-Ed بصوتك في دقيقتين', url: 'https://www.youtube.com/@TEDEd' },
    ],
  },
  {
    from: 'B2',
    to: 'C1',
    grammar: [
      'الانقلاب Never have I…',
      'الجمل المشقوقة What I need is…',
      'It is said that…',
      'لغة التحفّظ Hedging',
      'التحويل إلى أسماء Nominalisation',
      'التوكيد بـ do والأفعال المساعدة',
      'الحذف والاستبدال',
      'Should you / Were you to',
      'الصيغ الرسمية والـ Subjunctive',
      'أدوات الخطاب Discourse markers',
      'Academic Word List 1–2',
      'Academic Word List 3–4',
      'مراجعة + اختبار مستوى',
      'Academic Word List 5–6',
      'التعابير الاصطلاحية في سياق',
      'التلازم اللفظي الأكاديمي',
      'إعادة الصياغة Paraphrasing',
      'كتابة الملخص',
      'المقال الجدلي',
      'كتابة التقرير والمقترح',
      'العروض التقديمية ولغة الإشارة',
      'النقاش والاعتراض المهذب',
      'المحاضرات وتدوين الملاحظات',
      'Academic Phrasebank',
      'نماذج C1 Advanced كاملة',
      'اختبار نهائي + مراجعة الرحلة',
    ],
    grammarLinks: [
      {
        title: 'British Council – C1 Grammar',
        url: 'https://learnenglish.britishcouncil.org/grammar/c1-grammar',
      },
      { title: 'engVid', url: 'https://www.engvid.com' },
      { title: 'JenniferESL', url: 'https://www.youtube.com/@JenniferESL' },
      { title: 'Academic Phrasebank – Manchester', url: 'https://www.phrasebank.manchester.ac.uk' },
    ],
    listening: [
      { title: 'TED Talks بدون ترجمة', url: 'https://www.ted.com/talks' },
      { title: 'Lex Fridman Podcast', url: 'https://www.youtube.com/@lexfridman' },
      { title: 'Huberman Lab', url: 'https://www.youtube.com/@hubermanlab' },
      { title: 'محاضرة من MIT OpenCourseWare', url: 'https://ocw.mit.edu' },
    ],
    reading: [
      { title: 'The Conversation – مقال ولخّصه في 5 أسطر', url: 'https://theconversation.com' },
      { title: 'Aeon – مقال طويل', url: 'https://aeon.co' },
      {
        title: 'رواية كلاسيكية من Standard Ebooks – 15 صفحة يوميًا',
        url: 'https://standardebooks.org',
      },
      { title: 'ملخصات أبحاث PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    ],
    vocabulary: {
      title: 'AWL + OPAL + قاموس Ozdic',
      url: 'https://www.oxfordlearnersdictionaries.com/wordlists/opal',
    },
    output: [
      { title: 'مقال رأي 300 كلمة وصحّحه على Write & Improve', url: 'https://writeandimprove.com' },
      { title: 'لخّص محاضرة TED بصوتك دقيقتين يوميًا', url: 'https://www.ted.com/talks' },
      { title: 'نادي Toastmasters أو محادثة طويلة أسبوعيًا', url: 'https://www.toastmasters.org' },
    ],
  },
]

/** Weeks ending a quarter: take the EF SET test and write the score down. */
export const ENGLISH_LEVEL_CHECK_WEEKS: readonly number[] = [13, 26, 39, 52, 65, 78]
/** Weeks with a full timed C1 Advanced practice test. */
export const ENGLISH_MOCK_WEEKS: readonly number[] = [76, 77]

export const EF_SET: Link = { title: 'اختبار EF SET وسجّل نتيجتك', url: 'https://www.efset.org' }
export const C1_PRACTICE: Link = {
  title: 'Cambridge C1 – نماذج مجانية',
  url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/preparation/',
}
