# Wakeel — Cinematic Landing Update

تم تطبيق التأثيرات على صفحة Landing فقط. صفحات Client وLogin وRegister لم تتغير.

## تشغيل
1. افتح مجلد `The-Master-Peice` في VS Code.
2. شغّل `master-landing-page/landing.html` باستخدام Live Server.
3. يجب توفّر اتصال بالإنترنت لتحميل GSAP وScrollTrigger من CDN.

## ملفات التعديل
- `landing.html`: طبقات المشاهد الخلفية الديكورية + صورة بديلة لفيديو المساعد الذكي.
- `landing.js`: حركة دخول Hero، ScrollTrigger للأقسام، مسار خطوات المعاملة، مؤشر التمرير، والموشن التفاعلي.
- `wakeel-cinematic.css`: طبقة تصميم مستقلة تحتوي المشاهد والألوان الجديدة واستجابة الموبايل.
- `landing.css`: النسخة الأصلية دون تعديل، بكل تنسيقاتك الموجودة.

## خصائص
- لا يوجد scroll hijacking أو pinning ثقيل.
- في إعداد `prefers-reduced-motion` يتم إيقاف حركات GSAP والفيديوهات تلقائيًا.
- عند تعذر تحميل GSAP تبقى جميع العناصر والمحتويات ظاهرة وقابلة للاستخدام.
- كل عناصر المساعد والتتبع كما كانت: أمثلة توضيحية، وليست معاملات حقيقية.
