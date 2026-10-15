
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("dashboard.view"))return;function render(){const s=D.state;
U.$("pageTitle").textContent="مرحبًا، "+D.actor.name+" ✦";
U.metrics([["المستخدمون",s.users.length,"users"],["معاملات نشطة",s.requests.filter(r=>r.status==="active").length,"clock"],["معاملات مكتملة",s.requests.filter(r=>r.status==="completed").length,"check"],["تذاكر مفتوحة",s.tickets.filter(t=>!["closed","resolved"].includes(t.status)).length,"help"]]);
U.$("recentRequests").innerHTML=D.can("requests.view")?U.requestTable(s.requests.slice(0,4)):U.empty("عرض المعاملات غير متاح","راجع صلاحيات الحساب.");
const cards=[];
if(D.can("users.view"))cards.push(["users","ملفات وكلاء تحتاج مراجعة",s.users.filter(u=>u.type==="agent"&&u.approval==="pending").length]);
if(D.can("support.view"))cards.push(["support","تذاكر وشكاوى تحتاج متابعة",s.tickets.filter(t=>!["closed","resolved"].includes(t.status)).length]);
if(D.can("payments.view"))cards.push(["payments","مبالغ محجوزة بانتظار المعالجة",s.payments.filter(p=>p.status==="held").length]);
if(D.can("reviews.view"))cards.push(["reviews","تقييمات أُبلغ عنها",s.reviews.filter(r=>r.reported&&r.visibility==="visible").length]);
U.$("attention").innerHTML=cards.length?cards.map(([page,title,n])=>'<a class="filter-link" href="'+U.href(page)+'"><strong>'+U.esc(title)+'</strong><small>'+n+' سجلات · فتح الصفحة</small></a>').join(""):U.empty("لا توجد أقسام متاحة للمراجعة");
U.$("recentAudit").innerHTML=D.can("audit.view")?D.auditEntries.slice(0,3).map(a=>'<div class="event-item"><strong>'+U.esc(a.reason)+'</strong><p>'+U.esc(a.actorName+" · "+a.target)+'</p><small>'+U.date(a.date)+'</small></div>').join(""):U.empty("سجل الإجراءات غير متاح");
}
window.addEventListener("wakeel:change",render);render();})();