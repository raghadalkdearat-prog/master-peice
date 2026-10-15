# Wakeel — Master-Admin-Cycle

شغّل master-admin-dash/dashboard.html عبر Live Server من جذر المشروع، أو استخدم Demo Login في master-login/login.html.

## الحساب والإعدادات
مدير المنصة ADM-1 هو المسؤول الوحيد، وله دور root واحد وصلاحيات الإدارة اللازمة. تعرض الإعدادات بياناته وتفضيلات التنبيهات ومجموعات صلاحياته؛ لا توجد إدارة حسابات متعددة أو تبديل أدوار. تُحفظ الحسابات القديمة في أرشيف بيانات داخلي لعدم فقد التاريخ، ولا تكون حسابات إدارية نشطة.

## الصفحات
لوحة التحكم، المستخدمون، المعاملات، تفاصيل المعاملة، المدفوعات والمستحقات، الدعم والشكاوى، الإشعارات، فئات الخدمات، إعدادات مدير المنصة، سجل الإجراءات. أُزيل قسم تقييمات الأدمن وملفاته وصلاحياته؛ تقييمات العميل والوكيل تبقى في دورتيهما.

## البيانات والدعم والسجل
wakeel_admin_demo_v1 يحتفظ ببيانات الإدارة الأساسية. wakeel_workflow_v2 يشارك تذاكر العميل والوكيل والمحادثات مع مدير المنصة وسجل الإجراءات المفصلية. واجهات الدعم تتحقق من صلاحية الرد والتحديث. السجل يتبع المستخدم والوكيل والتذكرة والمعاملة والدفع، ويعرض صاحب الإجراء ووقته وأثره.

السجلات المالية الأساسية القديمة تبقى محلية؛ إغلاق تذكرة لا ينفذ تسوية أو استردادًا تلقائيًا. محادثة تنفيذ المعاملة خاصة بالعميل والوكيل، ولا يوجد زر يتيح للأدمن قراءة محتواها.

## المكونات
admin-shell.js يحمل navbar وfooter من Master-Client-Cycle/shared، مع تكييف روابط الحساب. البروفايل دائري ومعلومات التواصل وأيقوناتها مشتركة.
الدخول وحفظ الرسائل والأموال في المرحلة الحالية محلي، وليس خدمة مصادقة أو دفع على خادم.

راجع [توثيق التشغيل والترحيل والاختبارات](../shared/WORKFLOW-README.md).

## Shared financial and transaction workflow — 2026-10-15

Requests, offers and payments are now read from wakeel_workflow_v2; prior Admin records are imported once with original keys preserved. Administrative actions update Client and Agent views, including visibility, suspension, resumption, cancellation, completion, settlement and refund records. These remain local operations without actual money movement.

The settled financial summary now displays earned Wakeel service fees: 1 JOD per paid, completed eligible request. Client totals include the fee, Agent entitlements exclude it, and existing paid invoices are unchanged. The Agent approval filter was removed from Users; profile review actions remain available.
