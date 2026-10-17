/**
 * Weeks added so that, by the end of the Health Tech plan, it covers every
 * skill and project on the owner's CV ("Abdelmoamen Gomaa — Resume", October
 * 2026). Nothing in the original 104 weeks was removed or changed: each week
 * here is placed right after the original week named by `after`.
 *
 * CV skill → week(s) here:
 *   PWA, Arabic/English RTL UI ............ i18n و RTL و PWA
 *   Fastify, SQLite, Drizzle .............. Fastify و Drizzle
 *   Web Push, time zones (Drug Dose Reminder) .. Web Push
 *   Redis, BullMQ, WhatsApp/email reminders .... Redis و BullMQ
 *   Monorepo + Docker Compose ............. Monorepo
 *   Online Booking System (Arabic) ........ حجز العيادة (3)
 *   Dart, Flutter ......................... Dart, Flutter 1–2, مشروع Flutter
 *   Dr MoPharmacy (Next.js, SQLite, barcode, OCR, Excel) .. Next.js متقدم, الباركود والـ OCR
 *   C#, ASP.NET Core, EF Core (AI Drug Interaction Checker) .. C# 1–2, ASP.NET Core, EF Core, مشروع .NET
 *   Claude API, Ollama .................... Claude API و Ollama
 *   Image processing (MrTool) ............. معالجة الصور والفيديو
 *   MrTool (monorepo of 4 apps) ........... Capstone 4 (1–2)
 * Links are official documentation, written without live verification; fix
 * any broken one here.
 */
import type { HealthTechResource, HealthTechWeek } from './healthTechData'

export const CV_RESOURCES: Readonly<Record<string, HealthTechResource>> = {
  i18next: { title: 'i18next', url: 'https://www.i18next.com/', group: 'الويب' },
  logical: {
    title: 'MDN: CSS Logical Properties (RTL)',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values',
    group: 'الويب',
  },
  pwa: { title: 'web.dev: Learn PWA', url: 'https://web.dev/learn/pwa', group: 'الويب' },
  vitepwa: { title: 'Vite PWA', url: 'https://vite-pwa-org.netlify.app/', group: 'الويب' },
  push: {
    title: 'MDN: Push API',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Push_API',
    group: 'الويب',
  },
  fastify: { title: 'Fastify Docs', url: 'https://fastify.dev/docs/latest/', group: 'الـ Backend' },
  drizzle: {
    title: 'Drizzle ORM',
    url: 'https://orm.drizzle.team/docs/overview',
    group: 'الـ Backend',
  },
  sqlite: { title: 'SQLite Docs', url: 'https://www.sqlite.org/docs.html', group: 'الـ Backend' },
  bullmq: { title: 'BullMQ Docs', url: 'https://docs.bullmq.io/', group: 'الـ Backend' },
  nodemailer: { title: 'Nodemailer', url: 'https://nodemailer.com/', group: 'الـ Backend' },
  whatsapp: {
    title: 'WhatsApp Cloud API',
    url: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    group: 'الـ Backend',
  },
  pnpmws: {
    title: 'pnpm Workspaces',
    url: 'https://pnpm.io/workspaces',
    group: 'الـ Backend',
  },
  compose: {
    title: 'Docker Compose',
    url: 'https://docs.docker.com/compose/',
    group: 'الـ Backend',
  },
  dart: {
    title: 'Dart Language Tour',
    url: 'https://dart.dev/language',
    group: 'الموبايل والسحابة',
  },
  flutter: { title: 'Flutter Docs', url: 'https://docs.flutter.dev/', group: 'الموبايل والسحابة' },
  riverpod: { title: 'Riverpod', url: 'https://riverpod.dev/', group: 'الموبايل والسحابة' },
  sheetjs: { title: 'SheetJS (Excel)', url: 'https://docs.sheetjs.com/', group: 'الويب' },
  tesseract: {
    title: 'Tesseract.js (OCR)',
    url: 'https://github.com/naptha/tesseract.js',
    group: 'الويب',
  },
  zxing: {
    title: 'ZXing (قراءة الباركود)',
    url: 'https://github.com/zxing-js/library',
    group: 'الويب',
  },
  csharp: {
    title: 'Microsoft Learn: C#',
    url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
    group: '.NET',
  },
  aspnet: {
    title: 'ASP.NET Core Docs',
    url: 'https://learn.microsoft.com/en-us/aspnet/core/',
    group: '.NET',
  },
  efcore: {
    title: 'EF Core Docs',
    url: 'https://learn.microsoft.com/en-us/ef/core/',
    group: '.NET',
  },
  questpdf: { title: 'QuestPDF', url: 'https://www.questpdf.com/', group: '.NET' },
  ollama: { title: 'Ollama', url: 'https://github.com/ollama/ollama', group: 'تعلم الآلة' },
  pillow: {
    title: 'Pillow (معالجة الصور)',
    url: 'https://pillow.readthedocs.io/',
    group: 'تعلم الآلة',
  },
  rembg: {
    title: 'rembg (إزالة الخلفية)',
    url: 'https://github.com/danielgatis/rembg',
    group: 'تعلم الآلة',
  },
  ffmpeg: { title: 'FFmpeg', url: 'https://ffmpeg.org/documentation.html', group: 'تعلم الآلة' },
}

export interface CvWeek {
  /** The original plan week (1–104) this week comes right after. */
  after: number
  week: HealthTechWeek
}

export const CV_WEEKS: readonly CvWeek[] = [
  {
    after: 18,
    week: {
      title: 'تطبيقات عربية: i18n و RTL و PWA',
      topics: [
        'الترجمة بـ i18next وتبديل اللغة',
        'RTL بالـ Logical Properties و Tailwind',
        'Service Worker والتخزين للعمل أوفلاين',
        'تثبيت التطبيق PWA على الموبايل والكمبيوتر',
      ],
      project: 'حوّل تطبيق قائمة أدوية المريض لـ PWA عربي وإنجليزي يشتغل من غير نت',
      resources: ['pwa', 'i18next', 'logical', 'vitepwa'],
    },
  },
  {
    after: 33,
    week: {
      title: 'Fastify و Drizzle مع SQLite',
      topics: [
        'Fastify: الـ Routes والـ Plugins',
        'التحقق بالـ JSON Schema والـ Hooks',
        'SQLite وإمتى تختارها',
        'Drizzle: الـ Schema والـ Migrations والاستعلامات',
      ],
      project: 'API تذكير الجرعات بـ Fastify و Drizzle و SQLite مع اختبارات Vitest',
      resources: ['fastify', 'drizzle', 'sqlite', 'vitest'],
    },
  },
  {
    after: 33,
    week: {
      title: 'Web Push والمناطق الزمنية',
      topics: [
        'Push API و VAPID',
        'إرسال الإشعارات من Node بمكتبة web-push',
        'المناطق الزمنية والتوقيت الصيفي',
        'جدولة التذكيرات من غير حسابات مستخدمين',
      ],
      project: 'Drug Dose Reminder: PWA يبعت تذكير الجرعة والتطبيق مقفول',
      resources: ['push', 'pwa', 'fastify'],
    },
  },
  {
    after: 37,
    week: {
      title: 'Redis و BullMQ والتذكيرات',
      topics: [
        'Redis: الأنواع والتخزين المؤقت Caching',
        'BullMQ: الـ Queues والـ Workers',
        'إعادة المحاولة والمهام المجدولة والمتكررة',
        'التذكير بالبريد (Nodemailer) والواتساب (Cloud API)',
      ],
      project: 'خدمة تذكيرات مواعيد بالبريد والواتساب على BullMQ',
      resources: ['bullmq', 'redis', 'nodemailer', 'whatsapp'],
    },
  },
  {
    after: 38,
    week: {
      title: 'Monorepo و Docker Compose لأكتر من خدمة',
      topics: [
        'pnpm Workspaces وتنظيم الـ Monorepo',
        'حزمة مشتركة للأنواع والتحقق',
        'Docker Compose: ويب و API و Worker و Postgres و Redis',
        'متغيرات البيئة والـ Healthchecks',
      ],
      project: 'حوّل نظام الصيدلية لـ Monorepo يشتغل كله بأمر واحد',
      resources: ['pnpmws', 'compose', 'docker'],
    },
  },
  {
    after: 43,
    week: {
      title: 'مشروع: حجز العيادة (3): نسخة عربية للعيادات والصالونات',
      topics: [
        'واجهة عربية RTL بـ Next.js',
        'تقويم بالمواعيد المتاحة لحظيًا',
        'لوحة صاحب المكان والتقارير',
        'تذكيرات بالواتساب والبريد',
      ],
      project: 'Online Booking System عربي منشور على Vercel برابط Demo',
      resources: ['nextjs', 'prisma', 'whatsapp', 'logical'],
      milestone: 'حجز عربي منشور للعيادات والصالونات',
    },
  },
  {
    after: 48,
    week: {
      title: 'Dart',
      topics: [
        'الأنواع والمتغيرات و Null Safety',
        'الدوال والـ Collections',
        'الكلاسات والـ Mixins',
        'Futures و Streams و async / await',
      ],
      project: 'حاسبة جرعات من سطر الأوامر بـ Dart',
      resources: ['dart', 'flutter'],
    },
  },
  {
    after: 48,
    week: {
      title: 'Flutter (1)',
      topics: [
        'Widgets: Stateless و Stateful',
        'التخطيط: Row و Column و Stack',
        'Material 3 والثيم والعربي RTL',
        'القوائم ListView',
      ],
      project: 'شاشة قائمة أدوية بـ Flutter',
      resources: ['flutter', 'dart'],
    },
  },
  {
    after: 48,
    week: {
      title: 'Flutter (2)',
      topics: [
        'التنقل بين الشاشات go_router',
        'HTTP و JSON',
        'إدارة الحالة بـ Riverpod',
        'التخزين المحلي',
      ],
      project: 'تطبيق Flutter يقرا الأدوية من API نظام الصيدلية',
      resources: ['flutter', 'riverpod'],
    },
  },
  {
    after: 48,
    week: {
      title: 'مشروع Flutter: كاميرا ورفع صور',
      topics: [
        'الكاميرا واختيار الصور',
        'رفع الصور للـ API',
        'بناء APK وتوقيعه',
        'بناء الـ APK تلقائيًا بـ GitHub Actions',
      ],
      project: 'تطبيق أندرويد يصوّر المنتج ويرفعه للـ API',
      resources: ['flutter', 'gha'],
      milestone: 'تطبيق Flutter على أندرويد',
    },
  },
  {
    after: 56,
    week: {
      title: 'Next.js متقدم مع SQLite',
      topics: [
        'Route Handlers و Server Actions مع Drizzle',
        'تسجيل الدخول والصلاحيات',
        'الـ Caching والـ Revalidation',
        'النشر وقاعدة SQLite',
      ],
      project: 'Dr MoPharmacy (1): الأدوية والروشتات والمخزون بـ Next.js و SQLite',
      resources: ['nextjs', 'drizzle', 'sqlite'],
    },
  },
  {
    after: 56,
    week: {
      title: 'الباركود والـ OCR والإكسل',
      topics: [
        'قراءة الباركود من الكاميرا في المتصفح',
        'OCR بـ Tesseract.js',
        'تجهيز الصورة قبل الـ OCR',
        'استيراد وتصدير Excel',
      ],
      project: 'Dr MoPharmacy (2): إدخال دواء بالباركود وقراءة العلبة + Excel',
      resources: ['zxing', 'tesseract', 'sheetjs'],
    },
  },
  {
    after: 60,
    week: {
      title: 'C# (1)',
      topics: [
        '.NET SDK و dotnet CLI',
        'الأنواع والشروط والدوال',
        'الـ Collections والـ Generics',
        'LINQ',
      ],
      project: 'حاسبة CrCl بـ C# من سطر الأوامر',
      resources: ['csharp'],
    },
  },
  {
    after: 60,
    week: {
      title: 'C# (2)',
      topics: [
        'OOP: Classes و Interfaces و Records',
        'async / await والـ Tasks',
        'الأخطاء والـ Nullable',
        'اختبارات xUnit',
      ],
      project: 'مكتبة C# لقواعد التفاعلات الدوائية مع اختبارات',
      resources: ['csharp'],
    },
  },
  {
    after: 60,
    week: {
      title: 'ASP.NET Core Web API',
      topics: [
        'Minimal APIs و Controllers',
        'Dependency Injection والـ Middleware',
        'التحقق و ProblemDetails',
        'Swagger / OpenAPI',
      ],
      project: 'API أدوية بـ ASP.NET Core',
      resources: ['aspnet'],
    },
  },
  {
    after: 60,
    week: {
      title: 'EF Core و PostgreSQL',
      topics: [
        'DbContext والـ Migrations',
        'العلاقات والاستعلامات',
        'JWT و Rate Limiting',
        'الـ Caching و Audit Logging',
      ],
      project: 'اربط API الأدوية بـ PostgreSQL مع تسجيل دخول وسجل عمليات',
      resources: ['efcore', 'aspnet', 'pgtut'],
    },
  },
  {
    after: 60,
    week: {
      title: 'مشروع: مدقق التفاعلات بالـ AI (.NET)',
      topics: [
        'بنية طبقات Layered API',
        'تقييم خطورة التفاعلات',
        'شرح كل خطر بـ Claude API',
        'تقارير PDF بـ QuestPDF',
      ],
      project: 'AI Drug Interaction Checker: ASP.NET Core و React و PostgreSQL و Claude',
      resources: ['aspnet', 'claude', 'questpdf', 'ddinter'],
      milestone: 'مشروع .NET منشور على GitHub',
    },
  },
  {
    after: 89,
    week: {
      title: 'Claude API و Ollama',
      topics: [
        'Claude: الرسائل والـ Tool Use',
        'قراءة الصور Vision والـ Streaming',
        'نماذج محلية بـ Ollama',
        'API ولا محلي: الخصوصية والتكلفة',
      ],
      project: 'أداة تلخيص النشرة تشتغل بـ Claude أو Ollama حسب الإعداد',
      resources: ['claude', 'ollama'],
    },
  },
  {
    after: 89,
    week: {
      title: 'معالجة الصور والفيديو',
      topics: [
        'أساسيات Pillow',
        'إزالة الخلفية بـ rembg',
        'كابشن من صورة بنموذج Vision',
        'فيديو قصير من صور بـ FFmpeg',
      ],
      project: 'خدمة FastAPI تشيل خلفية صورة المنتج وتكتب كابشن',
      resources: ['pillow', 'rembg', 'ffmpeg', 'fastapi'],
    },
  },
  {
    after: 100,
    week: {
      title: 'Capstone 4: MrTool (1)',
      topics: [
        'تصميم Monorepo من 4 تطبيقات',
        'ويب Next.js و API بـ Fastify',
        'خدمة AI بـ FastAPI',
        'Pipeline بـ BullMQ',
      ],
      project: 'من صورة منتج لبوست جاهز: الويب والـ API والـ AI شغالين مع بعض',
      resources: ['pnpmws', 'fastify', 'bullmq', 'fastapi'],
    },
  },
  {
    after: 100,
    week: {
      title: 'Capstone 4: MrTool (2)',
      topics: [
        'تطبيق Flutter للأندرويد',
        'توليد فيديوهات قصيرة',
        'النشر بـ Docker Compose',
        'Case Study وفيديو عرض',
      ],
      project: 'MrTool منشور + Case Study',
      resources: ['flutter', 'compose', 'ffmpeg'],
      milestone: 'كل مهارات ومشاريع الـ CV مغطاة',
    },
  },
]
