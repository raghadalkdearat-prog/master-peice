# Wakeel — Master-Agent-Cycle
شغّل master-agent-dash/dashboard.html باستخدام VS Code Live Server.

## الصفحات
- master-agent-dash/dashboard.html
- master-agent-requests/requests.html
- master-agent-my-requests/my-requests.html
- master-agent-request-details/request-details.html?id=AG-2105
- master-agent-payments/payments.html
- master-agent-notifications/notifications.html
- master-agent-profile-settings/profile.html
- master-agent-reviews/reviews.html
- master-agent-support/support.html

## الهوية والمكونات المشتركة
تستخدم الصفحات تنسيقات لوحة العميل وshared.css مباشرة.
agent-shell.js يحمّل nav.html وfooter.html من Master-Client-Cycle/shared.
يكيّف روابط حساب المستخدم والتنقل في الموبايل داخل نسخة DOM الخاصة بالوكيل.
لا يعدّل أي ملف من ملفات دورة العميل.
agent-shell.css يحتوي التنسيقات الإضافية والاستجابة للشاشات الصغيرة وتقليل الحركة.

## البيانات
المفتاح الوحيد: wakeel_agent_demo_v1.
بيانات الوكيل مستقلة تمامًا عن بيانات العميل. رابط مساحة العميل للتنقل فقط.
قبول العروض والتقييمات ومبالغ التسوية بيانات جاهزة للتجربة، ولا تصل من العميل.
العروض الجديدة تبقى بانتظار القبول؛ لا يتم قبولها تلقائيًا.
إتمام معاملة تجريبية يضيف مستحقًا بانتظار التسوية.
المحادثات والتذاكر محلية، دون إرسال إلى خادم.
لا توجد مصادقة أو عمليات دفع أو رفع ملفات فعلي.
لمسح بيانات تجربة الوكيل وحدها، احذف مفتاح wakeel_agent_demo_v1 من Local Storage في أدوات المطور.
