
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("requests.view"))return;const id=new URLSearchParams(location.search).get("id");
function render(){
const r=D.get("requests",id);if(!r){U.$("detailContent").innerHTML=U.empty("المعاملة غير موجودة","اختر معاملة من قائمة الإدارة.")+'<a class="button secondary" href="'+U.href("requests")+'">عرض المعاملات</a>';return;}
U.$("pageTitle").textContent=r.title;document.title=r.title+" | مساحة الإدارة — وكيل";
const s=D.state,offers=s.offers.filter(o=>o.request===id),payment=s.payments.find(p=>p.request===id),ticket=s.tickets.find(t=>t.request===id);
const info=[["الرقم",r.id],["العميل",D.userName(r.client)],["الوكيل المختار",D.userName(D.selectedAgent(r))],["الفئة",D.serviceName(r.service)],["المحافظة",r.city],["الجهة",r.department],["الميزانية",U.money(r.budget)],["الموعد المطلوب",U.date(r.deadline)]];
const meta='<dl class="detail-meta">'+info.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+U.esc(v)+'</dd></div>').join("")+'</dl><p class="long-text">'+U.esc(r.description)+'</p>';
const offerRows=offers.map(o=>'<article class="review-card"><div class="card-heading"><strong>'+U.esc(D.userName(o.agent))+'</strong>'+U.badge(o.status)+'</div><p>'+U.money(o.price)+' · '+o.days+' أيام</p><p>'+U.esc(o.notes)+'</p>'+(o.id===r.selected?'<span class="count-pill">العرض المختار من العميل</span>':"")+(o.status==="pending"?U.button("إيقاف العرض المخالف","offer.block","offers.moderate",'data-id="'+U.esc(o.id)+'"'):"")+'</article>').join("")||U.empty("لا توجد عروض","العروض تظهر هنا عند توفرها في بيانات التجربة.");
const actions=(r.status==="open"||r.visibility==="hidden")?U.button(r.visibility==="visible"?"إخفاء الطلب":"إظهار الطلب","visibility","requests.moderate"):"";
let statusActions="";
if(!["completed","cancelled"].includes(r.status))statusActions=U.button("معالجة حالة المعاملة","status","requests.status");
const notes=(r.notes||[]).map(n=>'<div class="event-item"><strong>'+U.esc(D.userName(n.by))+'</strong><p class="long-text">'+U.esc(n.text)+'</p><small>'+U.date(n.date)+'</small></div>').join("")||'<p>لا توجد ملاحظات إدارية.</p>';
const stages=["طلب وعروض","بدء التنفيذ","متابعة الإجراءات","إتمام المعاملة"];
const timeline='<div class="timeline">'+stages.map((t,i)=>'<div class="track-step '+(i<=r.stage?"done":"")+'"><span class="track-mark">'+(i<=r.stage?"✓":i+1)+'</span><div><strong>'+t+'</strong><small>'+(i<=r.stage?"تم الوصول إلى هذه المرحلة":"بانتظار التقدم")+'</small></div></div>').join("")+'</div>';
const financial=D.can("payments.view")?(payment?'<p>إجمالي دفع العميل: '+U.money(payment.amount)+'</p><p>أتعاب الوكيل: '+U.money(payment.agentAmount??payment.amount)+'</p><p>رسوم خدمة وكيل: '+U.money(payment.serviceFee||0)+'</p>'+U.badge(payment.status)+'<p>مستحق الوكيل: '+U.esc(U.labels[payment.entitlement])+'</p><a class="button secondary" href="'+U.href("payments",payment.id)+'">مراجعة العملية المالية</a>':'<p>لا توجد عملية مالية مرتبطة.</p>'):'<p>عرض البيانات المالية غير متاح لهذا الحساب.</p>';
const audit=D.can("audit.view")?D.auditEntries.filter(a=>a.entity==="request"&&a.target===id).slice(0,5).map(a=>'<div class="event-item"><strong>'+U.esc(a.reason)+'</strong><p>'+U.esc(a.actorName)+' · '+U.date(a.date)+'</p></div>').join("")||'<p>لا توجد إجراءات إدارية مسجلة بعد.</p>':'<p>راجع صلاحية عرض السجل.</p>';
U.$("detailContent").innerHTML='<div class="agent-columns"><div class="agent-stack">'+U.panel("معلومات المعاملة",meta)+U.panel("العروض",' <div class="agent-stack">'+offerRows+'</div>')+U.panel("مراحل التنفيذ",timeline)+U.panel("الملاحظات الإدارية",notes+U.button("إضافة ملاحظة","note","requests.status"))+U.panel("المستندات",'<p>لا توجد ملفات فعلية في بيانات التجربة. مراجعة المستندات تتطلب توفرها وربط رفع الملفات بالخادم.</p>')+'</div><aside class="agent-stack">'+U.panel("الحالة والإجراءات",'<div class="action-row">'+U.badge(r.status,r.status==="active"?"قيد التنفيذ":null)+U.badge(r.visibility)+'</div><div class="action-row form-actions">'+actions+statusActions+'</div><p>اختيار العرض يبقى قرار العميل. إلغاء المعاملة أو إيقافها لا ينفذ استردادًا ماليًا تلقائيًا.</p><a class="text-action" href="'+U.href("requests")+'">العودة إلى المعاملات</a>')+U.panel("المدفوعات والمستحقات",financial)+U.panel("الدعم المرتبط",ticket?'<p>'+U.esc(ticket.subject)+'</p>'+(D.can("support.view")?'<a class="text-action" href="'+U.href("support",ticket.id)+'">فتح التذكرة</a>':""):'<p>لا توجد تذكرة مرتبطة.</p>')+U.panel("آخر إجراءات المعاملة",audit)+'</aside></div>';
U.$("detailContent").querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
const action=b.dataset.action;
if(action==="visibility")U.reasonDialog("تغيير ظهور الطلب","request.visibility",{id,visibility:r.visibility==="visible"?"hidden":"visible"},"إخفاء الطلب يحافظ على بياناته والمعاملات المرتبطة به.",render);
if(action==="offer.block")U.reasonDialog("إيقاف عرض مخالف","offer.block",{id:b.dataset.id},"لا يتم اختيار عرض بديل نيابة عن العميل.",render);
if(action==="status"){
let choices=r.status==="suspended"?'<option value="resume">استئناف الحالة السابقة</option>':'<option value="suspended">إيقاف المعاملة للمراجعة</option>';choices+='<option value="cancelled">إلغاء المعاملة</option>';if(r.status==="active")choices+='<option value="completed">تسجيل اكتمال المعاملة</option>';
U.reasonDialog("معالجة حالة المعاملة","request.status",{id},"سجّل سبب المعالجة. الإجراءات المالية تحتاج مراجعة منفصلة.",render,'<label>الإجراء<select id="requestStatus">'+choices+'</select></label>',()=>({status:U.$("requestStatus").value}));
}
if(action==="note")U.reasonDialog("إضافة ملاحظة إدارية","request.note",{id},"الملاحظة تحفظ في سجل المعاملة.",render,"",()=>({text:U.$("actionReason").value.trim()}));
}));
}
window.addEventListener("wakeel:change",render);render();
})();

