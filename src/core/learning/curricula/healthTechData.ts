/**
 * Pharmacy → Health Tech: a shared foundation, the Full-stack Health Tech
 * track, then the healthcare Data & AI track, then capstones.
 * Imported from the owner's "مسار Health Tech" plan (October 2026, 104 weeks),
 * with the weeks from his CV slotted in (healthTechCvData.ts).
 */
import type { Link } from '../types'
import { CV_RESOURCES, CV_WEEKS } from './healthTechCvData'

export interface HealthTechResource extends Link {
  /** Shelf name on the resources list. */
  group: string
}

export interface HealthTechPhase {
  code: string
  name: string
  from: number
  to: number
  track: 'shared' | 'fullstack' | 'data_ai' | 'capstone'
}

export interface HealthTechWeek {
  title: string
  /** Always four topics: two study days of two topics each. */
  topics: readonly string[]
  project: string
  /** Keys of HEALTH_TECH_RESOURCES. */
  resources: readonly string[]
  milestone?: string
}

const BASE_RESOURCES: Readonly<Record<string, HealthTechResource>> = {
  cs50: { title: 'CS50x (Harvard)', url: 'https://cs50.harvard.edu/x/', group: 'أساسيات' },
  cs50p: { title: 'CS50P: Python', url: 'https://cs50.harvard.edu/python/', group: 'أساسيات' },
  elz: {
    title: 'Elzero Web School (عربي)',
    url: 'https://www.youtube.com/@ElzeroWebSchool',
    group: 'أساسيات',
  },
  missing: {
    title: 'The Missing Semester (MIT)',
    url: 'https://missing.csail.mit.edu/',
    group: 'أساسيات',
  },
  progit: { title: 'Pro Git (كتاب مجاني)', url: 'https://git-scm.com/book', group: 'أساسيات' },
  learngit: {
    title: 'Learn Git Branching',
    url: 'https://learngitbranching.js.org/',
    group: 'أساسيات',
  },
  exer: { title: 'Exercism (تمارين)', url: 'https://exercism.org/', group: 'أساسيات' },
  roadmap: { title: 'roadmap.sh', url: 'https://roadmap.sh', group: 'أساسيات' },
  mdn: { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', group: 'الويب' },
  froggy: { title: 'Flexbox Froggy', url: 'https://flexboxfroggy.com/', group: 'الويب' },
  grid: { title: 'Grid Garden', url: 'https://cssgridgarden.com/', group: 'الويب' },
  jsinfo: { title: 'javascript.info', url: 'https://javascript.info/', group: 'الويب' },
  odin: { title: 'The Odin Project', url: 'https://www.theodinproject.com/', group: 'الويب' },
  fso: { title: 'Full Stack Open', url: 'https://fullstackopen.com/en/', group: 'الويب' },
  react: { title: 'React (التوثيق الرسمي)', url: 'https://react.dev/learn', group: 'الويب' },
  ts: {
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    group: 'الويب',
  },
  tw: { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', group: 'الويب' },
  vitest: { title: 'Vitest', url: 'https://vitest.dev/', group: 'الويب' },
  playwright: { title: 'Playwright', url: 'https://playwright.dev/', group: 'الويب' },
  nextjs: { title: 'Next.js Learn', url: 'https://nextjs.org/learn', group: 'الويب' },
  node: { title: 'Node.js Learn', url: 'https://nodejs.org/en/learn', group: 'الـ Backend' },
  express: { title: 'Express', url: 'https://expressjs.com/', group: 'الـ Backend' },
  sqlbolt: { title: 'SQLBolt', url: 'https://sqlbolt.com/', group: 'الـ Backend' },
  pgtut: {
    title: 'PostgreSQL Tutorial',
    url: 'https://www.postgresqltutorial.com/',
    group: 'الـ Backend',
  },
  prisma: { title: 'Prisma Docs', url: 'https://www.prisma.io/docs', group: 'الـ Backend' },
  mongo: { title: 'MongoDB University', url: 'https://learn.mongodb.com/', group: 'الـ Backend' },
  jest: { title: 'Jest', url: 'https://jestjs.io/docs/getting-started', group: 'الـ Backend' },
  fastapi: { title: 'FastAPI Docs', url: 'https://fastapi.tiangolo.com/', group: 'الـ Backend' },
  docker: {
    title: 'Docker: Get Started',
    url: 'https://docs.docker.com/get-started/',
    group: 'الـ Backend',
  },
  owasp: {
    title: 'OWASP Top 10',
    url: 'https://owasp.org/www-project-top-ten/',
    group: 'الـ Backend',
  },
  redis: { title: 'Redis Docs', url: 'https://redis.io/docs/', group: 'الـ Backend' },
  sdp: {
    title: 'System Design Primer',
    url: 'https://github.com/donnemartin/system-design-primer',
    group: 'الـ Backend',
  },
  neetcode: {
    title: 'NeetCode (مسائل المقابلات)',
    url: 'https://neetcode.io/',
    group: 'الـ Backend',
  },
  rn: {
    title: 'React Native Docs',
    url: 'https://reactnative.dev/docs/getting-started',
    group: 'الموبايل والسحابة',
  },
  expo: { title: 'Expo Docs', url: 'https://docs.expo.dev/', group: 'الموبايل والسحابة' },
  aws: { title: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', group: 'الموبايل والسحابة' },
  gha: {
    title: 'GitHub Actions',
    url: 'https://docs.github.com/en/actions',
    group: 'الموبايل والسحابة',
  },
  fhir: { title: 'HL7 FHIR', url: 'https://hl7.org/fhir/', group: 'المعلوماتية الصحية' },
  hapi: {
    title: 'HAPI FHIR (سيرفر تجريبي)',
    url: 'https://hapi.fhir.org/',
    group: 'المعلوماتية الصحية',
  },
  smart: {
    title: 'SMART on FHIR',
    url: 'https://docs.smarthealthit.org/',
    group: 'المعلوماتية الصحية',
  },
  cdshooks: { title: 'CDS Hooks', url: 'https://cds-hooks.org/', group: 'المعلوماتية الصحية' },
  rxnorm: {
    title: 'RxNorm (NLM)',
    url: 'https://www.nlm.nih.gov/research/umls/rxnorm/',
    group: 'المعلوماتية الصحية',
  },
  icd: { title: 'ICD (WHO)', url: 'https://icd.who.int/', group: 'المعلوماتية الصحية' },
  loinc: { title: 'LOINC', url: 'https://loinc.org/', group: 'المعلوماتية الصحية' },
  snomed: {
    title: 'SNOMED International',
    url: 'https://www.snomed.org/',
    group: 'المعلوماتية الصحية',
  },
  medplum: {
    title: 'Medplum (مفتوح المصدر)',
    url: 'https://www.medplum.com/',
    group: 'المعلوماتية الصحية',
  },
  openmrs: { title: 'OpenMRS', url: 'https://openmrs.org/', group: 'المعلوماتية الصحية' },
  openfda: { title: 'openFDA', url: 'https://open.fda.gov/', group: 'بيانات صحية مفتوحة' },
  synthea: {
    title: 'Synthea (مرضى تجريبيين)',
    url: 'https://synthetichealth.github.io/synthea/',
    group: 'بيانات صحية مفتوحة',
  },
  physionet: {
    title: 'PhysioNet / MIMIC-IV',
    url: 'https://physionet.org/',
    group: 'بيانات صحية مفتوحة',
  },
  ddinter: {
    title: 'DDInter (تفاعلات دوائية)',
    url: 'https://ddinter.scbdd.com/',
    group: 'بيانات صحية مفتوحة',
  },
  ucidiab: {
    title: 'Diabetes 130-US Hospitals (UCI)',
    url: 'https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008',
    group: 'بيانات صحية مفتوحة',
  },
  ucidrug: {
    title: 'Drug Review Dataset (UCI)',
    url: 'https://archive.ics.uci.edu/dataset/462/drug+review+dataset+drugs+com',
    group: 'بيانات صحية مفتوحة',
  },
  statquest: {
    title: 'StatQuest',
    url: 'https://www.youtube.com/@statquest',
    group: 'البيانات والإحصاء',
  },
  khan: {
    title: 'Khan Academy: Statistics',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    group: 'البيانات والإحصاء',
  },
  b3: {
    title: '3Blue1Brown: Linear Algebra',
    url: 'https://www.3blue1brown.com/topics/linear-algebra',
    group: 'البيانات والإحصاء',
  },
  kaggle: {
    title: 'Kaggle Learn',
    url: 'https://www.kaggle.com/learn',
    group: 'البيانات والإحصاء',
  },
  pyda: {
    title: 'Python for Data Analysis (مجاني)',
    url: 'https://wesmckinney.com/book/',
    group: 'البيانات والإحصاء',
  },
  mode: {
    title: 'Mode SQL Tutorial',
    url: 'https://mode.com/sql-tutorial/',
    group: 'البيانات والإحصاء',
  },
  streamlit: {
    title: 'Streamlit Docs',
    url: 'https://docs.streamlit.io/',
    group: 'البيانات والإحصاء',
  },
  mlng: {
    title: 'Machine Learning Specialization (Andrew Ng)',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    group: 'تعلم الآلة والـ AI',
  },
  handson: {
    title: 'Hands-On ML (كود الكتاب)',
    url: 'https://github.com/ageron/handson-ml3',
    group: 'تعلم الآلة والـ AI',
  },
  sklearn: {
    title: 'scikit-learn',
    url: 'https://scikit-learn.org/stable/',
    group: 'تعلم الآلة والـ AI',
  },
  shap: { title: 'SHAP', url: 'https://shap.readthedocs.io/', group: 'تعلم الآلة والـ AI' },
  ai4med: {
    title: 'AI for Medicine (DeepLearning.AI)',
    url: 'https://www.coursera.org/specializations/ai-for-medicine',
    group: 'تعلم الآلة والـ AI',
  },
  mlflow: { title: 'MLflow', url: 'https://mlflow.org/', group: 'تعلم الآلة والـ AI' },
  pytorch: {
    title: 'PyTorch Tutorials',
    url: 'https://pytorch.org/tutorials/',
    group: 'تعلم الآلة والـ AI',
  },
  fastai: {
    title: 'fast.ai: Practical Deep Learning',
    url: 'https://course.fast.ai/',
    group: 'تعلم الآلة والـ AI',
  },
  karpathy: {
    title: 'Neural Networks: Zero to Hero',
    url: 'https://karpathy.ai/zero-to-hero.html',
    group: 'تعلم الآلة والـ AI',
  },
  hf: {
    title: 'Hugging Face Learn',
    url: 'https://huggingface.co/learn',
    group: 'تعلم الآلة والـ AI',
  },
  claude: { title: 'Claude API Docs', url: 'https://docs.claude.com', group: 'تعلم الآلة والـ AI' },
  pgvector: {
    title: 'pgvector',
    url: 'https://github.com/pgvector/pgvector',
    group: 'تعلم الآلة والـ AI',
  },
  mostaql: { title: 'مستقل', url: 'https://mostaql.com/', group: 'السوق والشغل' },
  khamsat: { title: 'خمسات', url: 'https://khamsat.com/', group: 'السوق والشغل' },
  upwork: { title: 'Upwork', url: 'https://www.upwork.com/', group: 'السوق والشغل' },
  linkedin: {
    title: 'LinkedIn Jobs',
    url: 'https://www.linkedin.com/jobs/',
    group: 'السوق والشغل',
  },
  wellfound: { title: 'Wellfound', url: 'https://wellfound.com/', group: 'السوق والشغل' },
  depi: { title: 'رواد مصر الرقمية DEPI', url: 'https://depi.gov.eg/', group: 'السوق والشغل' },
}

/** Phases in the original 104-week numbering; see HEALTH_TECH_PHASES for the real one. */
const BASE_PHASES: readonly HealthTechPhase[] = [
  { code: 'A0', name: 'الأساسيات', from: 1, to: 10, track: 'shared' },
  { code: 'B1', name: 'الواجهات Frontend', from: 11, to: 26, track: 'fullstack' },
  { code: 'B2', name: 'الـ Backend وقواعد البيانات', from: 27, to: 44, track: 'fullstack' },
  { code: 'B3', name: 'موبايل وسحابة و FHIR', from: 45, to: 60, track: 'fullstack' },
  { code: 'C1', name: 'البيانات والإحصاء', from: 61, to: 72, track: 'data_ai' },
  { code: 'C2', name: 'تعلم الآلة', from: 73, to: 84, track: 'data_ai' },
  { code: 'C3', name: 'Deep Learning و LLMs', from: 85, to: 94, track: 'data_ai' },
  { code: 'D1', name: 'المشاريع الكبرى والسوق', from: 95, to: 104, track: 'capstone' },
]

/** The original 104 weeks, unchanged. */
const BASE_WEEKS: readonly HealthTechWeek[] = [
  {
    title: 'إعداد البيئة والتفكير البرمجي',
    topics: [
      'تثبيت VS Code و Python و Node و Git',
      'أساسيات الـ Terminal: التنقل والملفات',
      'CS50 Week 0: التفكير الخوارزمي',
      'حساب GitHub وأول Repository',
    ],
    project: 'برنامج صغير في Scratch + README تعريفي على GitHub',
    resources: ['cs50', 'missing', 'elz'],
  },
  {
    title: 'Python 1: البدايات',
    topics: [
      'المتغيرات والأنواع والإدخال والإخراج',
      'الشروط if / elif / else',
      'الحلقات for و while',
      'الدوال والمعاملات',
    ],
    project: 'حاسبة جرعات الأطفال بالوزن (mg/kg) من سطر الأوامر',
    resources: ['cs50p', 'elz', 'exer'],
  },
  {
    title: 'Python 2: البيانات والأخطاء',
    topics: [
      'القوائم والقواميس',
      'التعامل مع الأخطاء try / except',
      'المكتبات و pip',
      'اختبار الدوال بـ pytest',
    ],
    project: 'حاسبة CrCl بمعادلة Cockcroft-Gault مع اختبارات',
    resources: ['cs50p', 'exer'],
  },
  {
    title: 'Git عمليًا',
    topics: [
      'commit و log و diff',
      'الفروع branch و merge',
      'حل التعارضات conflicts',
      'Pull Requests على GitHub',
    ],
    project: 'ارفع مشاريع الأسبوعين 2 و 3 بفروع منفصلة وادمجها بـ PR',
    resources: ['progit', 'learngit', 'missing'],
  },
  {
    title: 'Python 3: الملفات والكائنات',
    topics: [
      'قراءة وكتابة CSV و JSON',
      'الكلاسات والكائنات OOP',
      'التواريخ datetime',
      'Regex أساسي',
    ],
    project: 'متتبع صلاحية الأدوية: يقرا CSV ويطلع ما ينتهي خلال 90 يوم',
    resources: ['cs50p', 'exer'],
  },
  {
    title: 'أساسيات علوم الحاسب',
    topics: [
      'CS50 Weeks 1-2: الذاكرة والمصفوفات',
      'البحث الخطي والثنائي',
      'خوارزميات الترتيب',
      'تعقيد الخوارزميات Big O',
    ],
    project: 'نفّذ البحث الثنائي والترتيب بالدمج في Python وقارن السرعة',
    resources: ['cs50'],
  },
  {
    title: 'HTML',
    topics: [
      'هيكل الصفحة والعناوين',
      'الروابط والصور والقوائم',
      'الجداول',
      'الفورمز والتحقق الأساسي',
    ],
    project: 'صفحة “عني” + جدول أدوية بسيط',
    resources: ['mdn', 'elz', 'odin'],
  },
  {
    title: 'CSS',
    topics: ['Selectors و Box Model', 'Flexbox', 'Grid', 'Responsive و Media Queries'],
    project: 'تصميم صفحة حاسبة طبية متجاوبة مع الموبايل',
    resources: ['mdn', 'froggy', 'grid', 'elz'],
  },
  {
    title: 'JavaScript 1',
    topics: [
      'المتغيرات والأنواع والعمليات',
      'الشروط والحلقات',
      'الدوال و Arrow functions',
      'المصفوفات والكائنات',
    ],
    project: 'اربط حاسبة الأسبوع 8 بـ JavaScript لتحسب الجرعة فعليًا',
    resources: ['jsinfo', 'elz'],
  },
  {
    title: 'JavaScript 2 والـ DOM',
    topics: ['التحكم في الـ DOM', 'الأحداث Events', 'map و filter و reduce', 'localStorage'],
    project: 'تطبيق قائمة أدوية المريض: إضافة وحذف وحفظ + مراجعة المرحلة',
    resources: ['jsinfo', 'odin'],
    milestone: '4 مشاريع صغيرة على GitHub وأساس قوي في Python و JS',
  },
  {
    title: 'JavaScript متقدم',
    topics: [
      'Scope و Closures',
      'this والكلاسات',
      'Modules: import و export',
      'التعامل مع الأخطاء',
    ],
    project: 'أعد كتابة تطبيق الأسبوع 10 بـ modules وكلاسات',
    resources: ['jsinfo'],
  },
  {
    title: 'Async JavaScript',
    topics: ['Callbacks و Promises', 'async / await', 'fetch والـ APIs', 'JSON'],
    project: 'صفحة تبحث في نشرات الأدوية من openFDA وتعرض النتائج',
    resources: ['jsinfo', 'openfda'],
  },
  {
    title: 'أدوات المطور',
    topics: ['npm و package.json', 'Vite', 'ESLint و Prettier', 'DevTools في المتصفح'],
    project: 'حوّل مشروع openFDA لمشروع Vite منظم',
    resources: ['odin', 'mdn'],
  },
  {
    title: 'React 1',
    topics: ['Components و JSX', 'Props', 'State و useState', 'الأحداث والقوائم و keys'],
    project: 'واجهة كروت أدوية من بيانات ثابتة',
    resources: ['react'],
  },
  {
    title: 'React 2',
    topics: ['useEffect', 'الفورمز Controlled', 'رفع الـ State', 'Thinking in React'],
    project: 'فورم إضافة دواء مع تحقق من المدخلات',
    resources: ['react'],
  },
  {
    title: 'React 3',
    topics: ['React Router', 'Context', 'Custom Hooks', 'حالات التحميل والأخطاء'],
    project: 'تطبيق متعدد الصفحات: قائمة أدوية + صفحة تفاصيل من openFDA',
    resources: ['react', 'fso', 'openfda'],
  },
  {
    title: 'TypeScript',
    topics: ['الأنواع الأساسية', 'Interfaces و Types', 'Generics', 'TypeScript مع React'],
    project: 'حوّل مشروع الأسبوع 16 إلى TypeScript',
    resources: ['ts'],
  },
  {
    title: 'Tailwind والتصميم',
    topics: ['أساسيات Tailwind', 'التصميم المتجاوب', 'الثيم الفاتح والداكن', 'مكتبة مكونات جاهزة'],
    project: 'أعد تصميم المشروع بـ Tailwind',
    resources: ['tw'],
  },
  {
    title: 'مشروع: واجهة مخزون صيدلية (1)',
    topics: [
      'تصميم الشاشات على الورق',
      'جدول بالفرز والبحث',
      'فلترة بالصلاحية والكمية',
      'تنبيهات النواقص',
    ],
    project: 'نسخة أولى شغالة ببيانات تجريبية',
    resources: ['react', 'tw'],
  },
  {
    title: 'مشروع: واجهة مخزون صيدلية (2)',
    topics: [
      'إدارة الحالة لكل التطبيق',
      'رسوم بيانية',
      'صفحات التفاصيل والتعديل',
      'النشر على Vercel',
    ],
    project: 'نشر المشروع برابط Live + README كامل',
    resources: ['react'],
  },
  {
    title: 'اختبار الواجهات',
    topics: ['أساسيات الاختبار', 'Vitest', 'React Testing Library', 'مقدمة Playwright'],
    project: '10 اختبارات لمشروع المخزون',
    resources: ['vitest', 'playwright'],
  },
  {
    title: 'Accessibility والأداء',
    topics: ['معايير WCAG الأساسية', 'قارئات الشاشة و ARIA', 'التنقل بالكيبورد', 'Lighthouse'],
    project: 'مشروع المخزون يتخطى 90 في Lighthouse Accessibility',
    resources: ['mdn'],
  },
  {
    title: 'مشروع: مدقق التفاعلات الدوائية (1)',
    topics: [
      'تصميم قاعدة تفاعلات JSON من معرفتك',
      'مستويات الخطورة',
      'مقارنة كل زوج أدوية',
      'واجهة إدخال الأدوية بالبحث',
    ],
    project: '50 تفاعل مهم في ملف JSON + الواجهة',
    resources: ['ddinter', 'react'],
  },
  {
    title: 'مشروع: مدقق التفاعلات الدوائية (2)',
    topics: ['عرض التحذيرات بالألوان', 'توصيات بديلة', 'اختبارات للخوارزمية', 'النشر'],
    project: 'نشر مدقق التفاعلات',
    resources: ['vitest'],
  },
  {
    title: 'مشروع: لوحة متابعة مريض',
    topics: [
      'بيانات مرضى من Synthea',
      'رسوم العلامات الحيوية عبر الزمن',
      'صفحة المريض',
      'فلترة بالتشخيص',
    ],
    project: 'لوحة متابعة منشورة',
    resources: ['synthea', 'react'],
  },
  {
    title: 'مراجعة المرحلة والـ Portfolio',
    topics: [
      'مراجعة نقاط الضعف',
      'موقع Portfolio بسيط',
      'تحسين README لكل المشاريع',
      'بروفايل LinkedIn',
    ],
    project: 'موقع شخصي منشور + LinkedIn محدث',
    resources: ['roadmap', 'linkedin'],
    milestone: '3 تطبيقات React منشورة وموقع شخصي',
  },
  {
    title: 'Node.js',
    topics: [
      'كيف يعمل Node والـ Event Loop',
      'الوحدات و npm',
      'التعامل مع الملفات',
      'HTTP Server بسيط',
    ],
    project: 'سيرفر يرجع قائمة أدوية JSON',
    resources: ['node', 'fso'],
  },
  {
    title: 'Express و REST',
    topics: [
      'Routing و Middleware',
      'تصميم REST وأكواد HTTP',
      'التحقق من المدخلات (zod)',
      'التعامل مع الأخطاء',
    ],
    project: 'API للأدوية CRUD في الذاكرة',
    resources: ['express', 'fso'],
  },
  {
    title: 'SQL 1',
    topics: ['SELECT و WHERE و ORDER BY', 'JOINs', 'GROUP BY والتجميع', 'Subqueries'],
    project: '40 تمرين SQLBolt + استعلامات على قاعدة صيدلية تجريبية',
    resources: ['sqlbolt', 'pgtut'],
  },
  {
    title: 'PostgreSQL وتصميم القواعد',
    topics: ['الجداول والعلاقات', 'Normalization', 'Indexes', 'Constraints و Transactions'],
    project: 'مخطط قاعدة بيانات نظام الصيدلية ERD + افتح حسابك على مستقل وخمسات',
    resources: ['pgtut', 'mostaql', 'khamsat'],
  },
  {
    title: 'Prisma مع Node',
    topics: ['Prisma Schema', 'Migrations', 'CRUD من Express', 'العلاقات في Prisma'],
    project: 'اربط API الأدوية بـ PostgreSQL',
    resources: ['prisma'],
  },
  {
    title: 'المصادقة والصلاحيات',
    topics: ['تشفير كلمات المرور bcrypt', 'JWT', 'Sessions و Cookies', 'الصلاحيات حسب الدور RBAC'],
    project: 'تسجيل دخول بأدوار: مدير وصيدلي وكاشير',
    resources: ['fso', 'owasp'],
  },
  {
    title: 'اختبار الـ Backend',
    topics: ['Jest و Supertest', 'قاعدة بيانات للاختبار', 'اختبار التكامل', 'تغطية الكود'],
    project: 'اختبارات لكل الـ Endpoints',
    resources: ['jest'],
  },
  {
    title: 'MongoDB',
    topics: [
      'المستندات والمجموعات',
      'CRUD والاستعلامات',
      'Aggregation',
      'Mongo مقابل Postgres: متى تختار',
    ],
    project: 'سجل نشاط النظام Audit Log في Mongo',
    resources: ['mongo'],
  },
  {
    title: 'نظام الصيدلية (1): الـ Backend',
    topics: [
      'المخزون والدفعات Batches والصلاحية',
      'المبيعات والفواتير',
      'الروشتات',
      'التقارير اليومية',
    ],
    project: 'API كامل لنظام الصيدلية',
    resources: ['express', 'prisma'],
  },
  {
    title: 'نظام الصيدلية (2): الواجهة',
    topics: ['شاشة البيع POS', 'شاشة المخزون', 'لوحة التقارير', 'ربط المصادقة'],
    project: 'الواجهة متصلة بالـ API',
    resources: ['react'],
  },
  {
    title: 'Docker',
    topics: [
      'Images و Containers',
      'Dockerfile',
      'docker compose: التطبيق + Postgres',
      'متغيرات البيئة والأسرار',
    ],
    project: 'شغّل النظام كله بأمر واحد',
    resources: ['docker'],
  },
  {
    title: 'نظام الصيدلية (3): النشر',
    topics: [
      'النشر على Render أو Railway',
      'قاعدة بيانات سحابية',
      'النطاق و HTTPS',
      'مراقبة الأخطاء',
    ],
    project: 'نظام الصيدلية Live برابط',
    resources: ['docker'],
    milestone: 'نظام صيدلية كامل منشور',
  },
  {
    title: 'Python FastAPI',
    topics: [
      'أساسيات FastAPI',
      'Pydantic',
      'Async و Dependency Injection',
      'توثيق OpenAPI التلقائي',
    ],
    project: 'API لتعديل الجرعات في القصور الكلوي',
    resources: ['fastapi'],
  },
  {
    title: 'الأكواد الدوائية والطبية',
    topics: [
      'RxNorm و RxCUI',
      'تصنيف ATC / DDD',
      'ICD-10 للتشخيصات',
      'ربط الأدوية بالأكواد في نظامك',
    ],
    project: 'أضف RxCUI و ATC لكل دواء في نظام الصيدلية',
    resources: ['rxnorm', 'icd'],
  },
  {
    title: 'الأمان وحماية البيانات الصحية',
    topics: [
      'OWASP Top 10',
      'SQL Injection و XSS و CSRF',
      'Rate Limiting و Helmet',
      'HIPAA وقانون حماية البيانات 151/2020',
    ],
    project: 'مراجعة أمان لنظام الصيدلية وإصلاح الثغرات',
    resources: ['owasp'],
  },
  {
    title: 'مشروع: حجز مواعيد عيادة (1)',
    topics: ['المرضى والأطباء والمواعيد', 'منع تعارض المواعيد', 'إشعارات بالبريد', 'لوحة الطبيب'],
    project: 'نسخة أولى شغالة',
    resources: ['express', 'react'],
  },
  {
    title: 'مشروع: حجز العيادة (2) + الفريلانس',
    topics: ['إكمال وتحسين', 'اختبارات', 'نشر', 'كتابة عروض الفريلانس'],
    project: 'مشروع منشور + أول 5 عروض على مستقل أو Upwork',
    resources: ['mostaql', 'upwork'],
  },
  {
    title: 'خوارزميات المقابلات',
    topics: ['Arrays و Hash Maps', 'Stacks و Queues', 'Two Pointers', 'Recursion'],
    project: '20 مسألة على NeetCode',
    resources: ['neetcode'],
    milestone: 'هدف: أول تاسك فريلانس مدفوع',
  },
  {
    title: 'React Native (1)',
    topics: [
      'Expo والتشغيل على الموبايل',
      'المكونات الأساسية View و Text',
      'التنسيق و Flexbox',
      'القوائم FlatList',
    ],
    project: 'شاشة قائمة أدوية على الموبايل',
    resources: ['rn', 'expo'],
  },
  {
    title: 'React Native (2)',
    topics: ['التنقل Expo Router', 'الفورمز', 'التخزين المحلي SQLite', 'الإشعارات المحلية'],
    project: 'شاشة إضافة دواء مع تنبيه',
    resources: ['expo'],
  },
  {
    title: 'تطبيق تذكير الأدوية (1)',
    topics: ['جدول الجرعات', 'التنبيهات', 'تسجيل الجرعات المأخوذة', 'نسبة الالتزام'],
    project: 'نسخة أولى شغالة على موبايلك',
    resources: ['expo'],
  },
  {
    title: 'تطبيق تذكير الأدوية (2)',
    topics: [
      'المزامنة مع API',
      'تقرير التزام للطبيب',
      'Accessibility على الموبايل',
      'النشر عبر EAS',
    ],
    project: 'التطبيق منشور ومتاح للتجربة',
    resources: ['expo'],
    milestone: 'تطبيق موبايل منشور',
  },
  {
    title: 'FHIR (1)',
    topics: [
      'FHIR والـ Resources',
      'Patient و Practitioner',
      'Observation و MedicationRequest',
      'REST على سيرفر HAPI',
    ],
    project: 'اقرأ وأنشئ Patient على HAPI من Postman أو كود',
    resources: ['fhir', 'hapi'],
  },
  {
    title: 'FHIR (2)',
    topics: [
      'البحث Search Parameters',
      'Bundles',
      'رفع بيانات Synthea لسيرفر FHIR',
      'FHIR من TypeScript',
    ],
    project: 'سكريبت يرفع 50 مريض Synthea ويستعلم عنهم',
    resources: ['fhir', 'synthea'],
  },
  {
    title: 'SMART on FHIR',
    topics: ['OAuth2 و OpenID Connect', 'SMART App Launch', 'Scopes', 'تطبيق SMART تجريبي'],
    project: 'تطبيق SMART بسيط يقرا بيانات المريض',
    resources: ['smart'],
  },
  {
    title: 'مشروع: عارض بيانات مريض FHIR',
    topics: ['قراءة الأدوية والتحاليل', 'الخط الزمني للمريض', 'رسوم التحاليل', 'النشر'],
    project: 'عارض FHIR منشور',
    resources: ['fhir', 'hapi'],
    milestone: 'Full-stack + موبايل + FHIR',
  },
  {
    title: 'AWS (1)',
    topics: ['IAM', 'EC2 و S3', 'RDS', 'مقدمة Lambda'],
    project: 'ارفع ملفات نظام الصيدلية على S3 وقاعدة على RDS',
    resources: ['aws'],
  },
  {
    title: 'AWS (2) والشهادة',
    topics: [
      'VPC وأساسيات الشبكات',
      'التكلفة والفواتير',
      'مراجعة Cloud Practitioner',
      'امتحان تجريبي',
    ],
    project: 'احجز امتحان AWS Cloud Practitioner',
    resources: ['aws'],
  },
  {
    title: 'CI/CD',
    topics: ['GitHub Actions', 'تشغيل الاختبارات تلقائيًا', 'النشر التلقائي', 'حماية الفروع'],
    project: 'Pipeline كامل لنظام الصيدلية',
    resources: ['gha'],
  },
  {
    title: 'Next.js',
    topics: ['App Router', 'Server Components', 'Server Actions', 'الصفحات المحمية'],
    project: 'لوحة إدارة صغيرة بـ Next.js',
    resources: ['nextjs'],
  },
  {
    title: 'System Design (1)',
    topics: ['Scalability', 'Caching و Redis', 'Load Balancing', 'Replication و Sharding'],
    project: 'أضف Redis cache لتقارير نظام الصيدلية',
    resources: ['sdp', 'redis'],
  },
  {
    title: 'System Design (2)',
    topics: [
      'Queues والمهام الخلفية',
      'Webhooks',
      'تصميم نظام صيدليات متعدد الفروع',
      'كتابة Design Doc',
    ],
    project: 'Design Doc لنظام سلسلة صيدليات',
    resources: ['sdp'],
  },
  {
    title: 'HL7 v2 و LOINC و SNOMED',
    topics: [
      'رسائل HL7 v2: ADT و ORM و ORU',
      'LOINC للتحاليل',
      'SNOMED CT',
      'تحويل HL7 v2 إلى FHIR (مفهوم)',
    ],
    project: 'Parser بسيط لرسالة ORU يطلع نتايج التحاليل',
    resources: ['loinc', 'snomed', 'fhir'],
  },
  {
    title: 'المساهمة مفتوحة المصدر',
    topics: [
      'استكشاف Medplum أو OpenMRS',
      'قراءة كود حقيقي',
      'اختيار Issue صغير',
      'أول Pull Request',
    ],
    project: 'أول PR في مشروع صحي مفتوح المصدر',
    resources: ['medplum', 'openmrs'],
    milestone: 'المسار الأول مكتمل',
  },
  {
    title: 'الإحصاء (1)',
    topics: ['الإحصاء الوصفي', 'التوزيعات والتوزيع الطبيعي', 'الاحتمالات', 'Sampling'],
    project: 'Notebook يحلل وصفيًا بيانات تحاليل تجريبية',
    resources: ['statquest', 'khan'],
  },
  {
    title: 'الإحصاء (2)',
    topics: [
      'اختبار الفرضيات و p-value',
      't-test و Chi-square',
      'فترات الثقة',
      'الارتباط والانحدار الخطي',
    ],
    project: 'قارن متوسطين بـ t-test على بيانات حقيقية',
    resources: ['statquest', 'khan'],
  },
  {
    title: 'رياضيات الـ ML',
    topics: ['المتجهات والمصفوفات', 'ضرب المصفوفات', 'المشتقات والتدرج', 'Gradient Descent'],
    project: 'نفّذ Gradient Descent يدويًا بـ NumPy',
    resources: ['b3'],
  },
  {
    title: 'NumPy و pandas (1)',
    topics: ['NumPy Arrays', 'DataFrames', 'التصفية والاختيار', 'Jupyter'],
    project: 'استكشف بيانات Drug Review في Notebook',
    resources: ['kaggle', 'pyda'],
  },
  {
    title: 'pandas (2)',
    topics: ['تنظيف البيانات والقيم المفقودة', 'groupby و merge', 'التواريخ', 'Pivot Tables'],
    project: 'تنظيف بيانات مبيعات صيدلية تجريبية',
    resources: ['pyda'],
  },
  {
    title: 'التصور البصري',
    topics: ['Matplotlib', 'Seaborn', 'Plotly', 'قواعد الرسم الجيد'],
    project: '5 رسوم توضيحية لنفس البيانات',
    resources: ['kaggle'],
  },
  {
    title: 'SQL تحليلي',
    topics: ['Window Functions', 'CTEs', 'Cohort Analysis', 'SQL مع pandas'],
    project: 'تحليل Cohort لعملاء صيدلية تجريبية',
    resources: ['mode'],
  },
  {
    title: 'مشروع: الآثار الجانبية من openFDA',
    topics: ['جلب بيانات FAERS من API', 'التنظيف', 'تحليل استكشافي EDA', 'تقرير النتائج'],
    project: 'تقرير منشور عن مجموعة أدوية من نفس الفئة',
    resources: ['openfda', 'pyda'],
  },
  {
    title: 'Streamlit ولوحات البيانات',
    topics: ['أساسيات Streamlit', 'الفلاتر التفاعلية', 'النشر', 'لوحة لبيانات Synthea'],
    project: 'لوحة Streamlit منشورة',
    resources: ['streamlit', 'synthea'],
  },
  {
    title: 'الإحصاء الإكلينيكي والوبائي',
    topics: ['تصميم الدراسات', 'Relative Risk و Odds Ratio', 'NNT', 'مقدمة Survival Analysis'],
    project: 'احسب RR و OR و NNT من دراسة منشورة',
    resources: ['statquest'],
  },
  {
    title: 'مشروع: إشارات Pharmacovigilance',
    topics: [
      'Disproportionality Analysis',
      'حساب PRR و ROR من FAERS',
      'فترات الثقة',
      'لوحة Streamlit',
    ],
    project: 'لوحة إشارات لـ 10 أدوية',
    resources: ['openfda', 'streamlit'],
  },
  {
    title: 'Kaggle ومراجعة المرحلة',
    topics: [
      'مسابقة Kaggle للمبتدئين',
      'Notebook منشور',
      'مراجعة نقاط الضعف',
      'تحديث الـ Portfolio',
    ],
    project: 'Notebook منشور على Kaggle',
    resources: ['kaggle'],
    milestone: 'محلل بيانات صحية',
  },
  {
    title: 'مقدمة تعلم الآلة',
    topics: ['أنواع التعلم', 'Train / Test Split', 'Overfitting', 'واجهة scikit-learn'],
    project: 'أول نموذج تصنيف على بيانات بسيطة',
    resources: ['mlng', 'sklearn'],
  },
  {
    title: 'الانحدار',
    topics: ['Linear Regression', 'Regularization', 'Logistic Regression', 'مقاييس التقييم'],
    project: 'نموذج يتوقع خطر مرض من بيانات مفتوحة',
    resources: ['mlng'],
  },
  {
    title: 'نماذج الأشجار',
    topics: ['Decision Trees', 'Random Forest', 'Gradient Boosting', 'Feature Importance'],
    project: 'قارن 3 نماذج على نفس البيانات',
    resources: ['handson', 'sklearn'],
  },
  {
    title: 'تقييم النماذج',
    topics: [
      'Cross-Validation',
      'Precision و Recall و F1 و AUC',
      'البيانات غير المتوازنة',
      'Calibration',
    ],
    project: 'تقرير تقييم كامل لنموذج أسبوع نماذج الأشجار',
    resources: ['handson'],
  },
  {
    title: 'Feature Engineering و Pipelines',
    topics: ['Encoding', 'Scaling', 'Pipelines', 'Hyperparameter Tuning'],
    project: 'Pipeline كامل قابل لإعادة التشغيل',
    resources: ['sklearn'],
  },
  {
    title: 'مشروع: إعادة دخول مرضى السكر (1)',
    topics: ['فهم البيانات', 'التنظيف', 'نماذج Baseline', 'المقارنة'],
    project: 'Notebook بنتائج أولية',
    resources: ['ucidiab'],
  },
  {
    title: 'مشروع: إعادة دخول مرضى السكر (2)',
    topics: ['تحسين النموذج', 'تفسير بـ SHAP', 'العدالة بين الفئات', 'التقرير'],
    project: 'مشروع كامل منشور على GitHub',
    resources: ['shap', 'ucidiab'],
  },
  {
    title: 'التعلم غير الموجّه',
    topics: ['K-means', 'PCA', 'تقسيم المرضى لمجموعات', 'Anomaly Detection'],
    project: 'تقسيم مرضى Synthea لمجموعات',
    resources: ['mlng', 'synthea'],
  },
  {
    title: 'AI for Medicine',
    topics: [
      'التشخيص من الصور (مفهوم)',
      'Sensitivity و Specificity',
      'نماذج Prognosis',
      'Treatment Effect',
    ],
    project: 'ملخص مكتوب لأهم دروس الكورس',
    resources: ['ai4med'],
  },
  {
    title: 'MIMIC-IV',
    topics: [
      'الحصول على صلاحية PhysioNet',
      'بنية MIMIC',
      'استعلامات SQL على MIMIC Demo',
      'مشروع صغير',
    ],
    project: 'تحليل مدة البقاء في ICU',
    resources: ['physionet'],
  },
  {
    title: 'مشروع: آراء المرضى في الأدوية',
    topics: ['معالجة النص', 'TF-IDF', 'تصنيف المشاعر', 'التحليل حسب الدواء'],
    project: 'مشروع NLP منشور',
    resources: ['ucidrug'],
  },
  {
    title: 'تعلم الآلة في الإنتاج',
    topics: ['حفظ النماذج', 'تقديم النموذج بـ FastAPI', 'Docker', 'MLflow'],
    project: 'نموذج إعادة الدخول كـ API',
    resources: ['mlflow', 'fastapi'],
    milestone: 'مهندس ML مبتدئ بمشاريع صحية',
  },
  {
    title: 'PyTorch',
    topics: ['Tensors', 'Autograd', 'شبكة عصبية بسيطة', 'Training Loop'],
    project: 'شبكة عصبية تصنف بيانات جدولية',
    resources: ['pytorch'],
  },
  {
    title: 'Deep Learning عمليًا',
    topics: ['fast.ai الدروس 1-2', 'Transfer Learning', 'CNNs', 'تصنيف صور طبية مفتوحة'],
    project: 'نموذج تصنيف صور',
    resources: ['fastai'],
  },
  {
    title: 'الـ LLM من الداخل',
    topics: ['micrograd', 'Embeddings', 'Attention', 'Transformers'],
    project: 'نفّذ micrograd بنفسك',
    resources: ['karpathy'],
  },
  {
    title: 'Hugging Face و NLP',
    topics: ['Tokenizers', 'Pipelines', 'Fine-tuning نموذج تصنيف', 'نماذج طبية مثل BioBERT'],
    project: 'Fine-tune نموذج على Drug Reviews',
    resources: ['hf'],
  },
  {
    title: 'LLM APIs',
    topics: ['استدعاء الـ API', 'Prompt Engineering', 'Structured Output', 'Tool Use'],
    project: 'أداة تلخص نشرة دواء في JSON منظم',
    resources: ['claude'],
  },
  {
    title: 'RAG (1)',
    topics: [
      'Embeddings والبحث الدلالي',
      'Vector DB: pgvector',
      'Chunking',
      'الاسترجاع مع المصادر',
    ],
    project: 'فهرس بحث دلالي لـ 100 نشرة دواء',
    resources: ['pgvector', 'hf'],
  },
  {
    title: 'مشروع: مساعد نشرات الأدوية',
    topics: ['جمع النشرات من openFDA', 'بناء الفهرس', 'واجهة سؤال وجواب', 'ذكر المصدر'],
    project: 'مساعد RAG منشور',
    resources: ['openfda', 'claude'],
  },
  {
    title: 'تقييم الـ LLM والسلامة',
    topics: ['بناء مجموعة تقييم', 'قياس الدقة والهلوسة', 'حدود الاستخدام الطبي', 'SaMD والتنظيم'],
    project: 'تقرير تقييم للمساعد',
    resources: ['claude'],
  },
  {
    title: 'Medical NER',
    topics: ['استخراج الأدوية والجرعات', 'نماذج جاهزة', 'التقييم', 'الدمج في التطبيق'],
    project: 'استخراج الأدوية من نص روشتة',
    resources: ['hf'],
  },
  {
    title: 'MLOps',
    topics: ['مراقبة النماذج', 'Data Drift', 'Versioning', 'إعادة التدريب'],
    project: 'مراقبة نموذج إعادة الدخول',
    resources: ['mlflow'],
    milestone: 'مسار الـ AI مكتمل',
  },
  {
    title: 'Capstone 1: صيدلية ذكية (1)',
    topics: [
      'بيانات الطلب على الأدوية',
      'نموذج Forecasting',
      'ربطه بالنظام',
      'تنبيهات ذكية للنواقص',
    ],
    project: 'توقع الطلب داخل نظام الصيدلية',
    resources: ['sklearn', 'fastapi'],
  },
  {
    title: 'Capstone 1: صيدلية ذكية (2)',
    topics: ['تطبيق موبايل للمخزون', 'لوحة تحليلات', 'اختبارات', 'فيديو عرض'],
    project: 'Capstone 1 منشور + Case Study',
    resources: ['expo'],
  },
  {
    title: 'Capstone 2: دعم القرار الإكلينيكي (1)',
    topics: [
      'قراءة الأدوية والتحاليل من FHIR',
      'قواعد التفاعلات',
      'تعديل الجرعات كلويًا وكبديًا',
      'التكرار العلاجي',
    ],
    project: 'محرك قواعد يعمل على مرضى Synthea',
    resources: ['fhir', 'synthea'],
  },
  {
    title: 'Capstone 2: دعم القرار الإكلينيكي (2)',
    topics: ['CDS Hooks', 'واجهة الصيدلي', 'اختبارات بحالات حقيقية', 'النشر'],
    project: 'Capstone 2 منشور + Case Study',
    resources: ['cdshooks'],
  },
  {
    title: 'Capstone 3: Pharmacovigilance (1)',
    topics: ['Pipeline دوري لبيانات FAERS', 'حساب الإشارات', 'قاعدة بيانات', 'API'],
    project: 'Pipeline شغال تلقائيًا',
    resources: ['openfda'],
  },
  {
    title: 'Capstone 3: Pharmacovigilance (2)',
    topics: ['لوحة تفاعلية', 'ملخصات LLM مع المصادر', 'Case Study', 'النشر'],
    project: 'Capstone 3 منشور',
    resources: ['claude', 'streamlit'],
  },
  {
    title: 'التقديم على الوظائف',
    topics: [
      'CV مخصص لـ Health Tech',
      'تحديث LinkedIn و GitHub',
      'قائمة 30 شركة مستهدفة',
      'أول 10 طلبات',
    ],
    project: '10 طلبات وظيفة مرسلة',
    resources: ['linkedin', 'wellfound'],
  },
  {
    title: 'المقابلات التقنية',
    topics: [
      'NeetCode 75',
      'System Design Interview',
      'الأسئلة السلوكية بطريقة STAR',
      'مقابلات تجريبية',
    ],
    project: '3 مقابلات تجريبية مسجلة',
    resources: ['neetcode', 'sdp'],
  },
  {
    title: 'المقابلات (2) والفريلانس المتقدم',
    topics: [
      'عرض مشاريعك في 5 دقائق',
      'رفع سعرك في الفريلانس',
      'عملاء مباشرين: صيدليات وعيادات',
      '10 طلبات إضافية',
    ],
    project: 'عرض مباشر لصيدلية أو عيادة',
    resources: ['upwork', 'mostaql'],
  },
  {
    title: 'الختام وخطة السنة التالية',
    topics: ['مراجعة السنتين', 'تحديث الـ Portfolio', 'اختيار التخصص العميق', 'خطة السنة الثالثة'],
    project: 'خطة مكتوبة للسنة الثالثة',
    resources: ['roadmap'],
    milestone: 'نهاية الخطة: مهندس Health Tech',
  },
]

export const HEALTH_TECH_RESOURCES: Readonly<Record<string, HealthTechResource>> = {
  ...BASE_RESOURCES,
  ...CV_RESOURCES,
}

/**
 * The plan as followed: each original week, then any CV weeks placed after it.
 * `base` is the week's number in the original plan (null for a CV week).
 */
const MERGED: ReadonlyArray<{ week: HealthTechWeek; base: number | null }> = BASE_WEEKS.flatMap(
  (week, i) => [
    { week, base: i + 1 },
    ...CV_WEEKS.filter((cv) => cv.after === i + 1).map((cv) => ({ week: cv.week, base: null })),
  ],
)

export const HEALTH_TECH_WEEKS: readonly HealthTechWeek[] = MERGED.map((m) => m.week)

/** The real week number of an original week. */
function realWeek(base: number): number {
  return MERGED.findIndex((m) => m.base === base) + 1
}

/** Phases stretched over the added weeks: a CV week belongs to the phase of the week before it. */
export const HEALTH_TECH_PHASES: readonly HealthTechPhase[] = BASE_PHASES.map((phase, i) => {
  const next = BASE_PHASES[i + 1]
  return {
    ...phase,
    from: realWeek(phase.from),
    to: next ? realWeek(next.from) - 1 : HEALTH_TECH_WEEKS.length,
  }
})
