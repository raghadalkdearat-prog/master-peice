# Wakeel — Master-Agent-Cycle
شغّل master-agent-dash/dashboard.html باستخدام VS Code Live Server من جذر The-Master-Peice.

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
تستخدم الصفحات تنسيقات لوحة العميل وshared.css.
agent-shell.js يحمّل nav.html وfooter.html من Master-Client-Cycle/shared، ويكيّف روابط الحساب والتنقل للوكيل.
agent-shell.css وshared/flow.css يضيفان التنسيقات والاستجابة وتقليل الحركة.

## دورة البيانات الحالية
المفتاح الحالي wakeel_workflow_v2 يربط المعاملات والعروض والدفع وبيانات التواصل اللازمة بين العميل والوكيل، ويستورد البيانات السابقة من wakeel_agent_demo_v1 دون حذف المفتاح الأصلي. بيانات الأدمن مستقلة.
العرض يبقى بانتظار قبول العميل، ثم المعاملة بانتظار الدفع. نجاح الدفع التجريبي يتيح التنفيذ؛ إتمام المعاملة يجعل المستحق بانتظار التسوية. لا توجد تسوية مالية حقيقية.
التواصل مع العميل عبر واتساب أو اتصال من تفاصيل الطلب؛ لا توجد دردشة داخل المنصة.
يمكن تحديث البيانات الشخصية من الإعدادات وفق حقول التسجيل المشتركة.
التذاكر والتقييمات بيانات محلية. لا توجد مصادقة أو عمليات دفع أو رفع ملفات فعلي.
راجع [توثيق دورة المعاملات](../shared/WORKFLOW-README.md) للتشغيل والاختبارات والترحيل وحدود المحاكاة.
