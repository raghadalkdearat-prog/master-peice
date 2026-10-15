
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("payments.view"))return;
function render(){const s=D.state,q=U.$("search").value.trim().toLowerCase(),status=U.$("status").value,sum=rows=>rows.reduce((n,p)=>n+p.amount,0);
U.metrics([["مبالغ محجوزة",U.money(sum(s.payments.filter(p=>p.status==="held"))),"wallet"],["تمت التسوية",U.money(sum(s.payments.filter(p=>p.status==="completed"))),"check"],["مبالغ مستردة",U.money(sum(s.payments.filter(p=>p.status==="refunded"))),"wallet"],["عمليات عليها تعليق",s.payments.filter(p=>p.settlementHold&&p.status==="held").length,"shield"]]);
const rows=s.payments.filter(p=>(status==="all"||p.status===status)&&(p.id+" "+p.request+" "+D.get("requests",p.request)?.title).toLowerCase().includes(q));
U.$("paymentsTable").innerHTML=U.table(["العملية والمعاملة","المبلغ","دفع العميل","مستحق الوكيل","إجراء"],rows.map(p=>['<strong>'+U.esc(D.get("requests",p.request)?.title)+'</strong><small>'+U.esc(p.id+" · "+p.request)+'</small>',U.money(p.amount),U.badge(p.status,p.status==="completed"?"تمت التسوية":null),U.badge(p.entitlement,p.entitlement==="pending"?"بانتظار التسوية":null)+(p.settlementHold&&p.status==="held"?'<small>التسوية معلقة</small>':""),'<button class="button secondary" type="button" data-payment="'+U.esc(p.id)+'">مراجعة العملية</button>']));
}
function show(id){
const p=D.get("payments",id),r=D.get("requests",p.request);
const actions=D.can("payments.manage")?'<div class="action-row">'+(p.status==="held"?'<button class="button secondary" type="button" data-action="hold">'+(p.settlementHold?"رفع تعليق التسوية":"تعليق التسوية")+'</button>'+(r.status==="completed"?'<button class="button primary" type="button" data-action="settle">تسجيل تسوية تجريبية</button>':"")+(["cancelled","suspended"].includes(r.status)?'<button class="button danger" type="button" data-action="refund">تسجيل استرداد تجريبي</button>':""):"")+'<button class="button secondary" type="button" data-action="adjust">طلب تصحيح مبلغ</button></div>':"";
U.openDialog("مراجعة العملية المالية",'<h3>'+U.esc(r.title)+'</h3><p>المبلغ الأصلي: <strong>'+U.money(p.amount)+'</strong></p><div class="action-row">'+U.badge(p.status)+U.badge(p.entitlement)+'</div><p class="muted">لا توجد حركة أموال فعلية. المبلغ الأصلي وقيمة العرض المقبول محفوظان.</p>'+actions+'<h3 style="margin-top:22px">التصحيحات والمعالجات</h3>'+(p.adjustments.length?p.adjustments.map(x=>'<div class="event-item"><strong>'+(x.type==="refund"?"استرداد تجريبي":"طلب تصحيح بانتظار المراجعة")+' · '+U.money(x.amount)+'</strong><p>'+U.esc(x.reason)+'</p><small>'+U.date(x.date)+'</small></div>').join(""):'<p>لا توجد معالجات مسجلة.</p>')+'<a class="text-action" href="'+U.href("request-details",p.request)+'">تفاصيل المعاملة</a>');
U.$("adminDialogBody").querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
const done=()=>{render();show(id);};
if(b.dataset.action==="hold")U.reasonDialog("تعليق أو رفع تعليق التسوية","payment.hold",{id,hold:!p.settlementHold},"رفع التعليق يحتاج معالجة الشكوى أو إيقاف المعاملة أولًا.",done);
if(b.dataset.action==="settle")U.reasonDialog("تسجيل تسوية تجريبية","payment.settle",{id},"التسوية متاحة لمعاملة مكتملة دون شكوى مفتوحة أو تعليق على المستحق.",done);
if(b.dataset.action==="refund")U.reasonDialog("تسجيل استرداد تجريبي","payment.refund",{id},"سيُسجّل الاسترداد في بيانات الإدارة ويُلغى المستحق المرتبط، دون حركة أموال فعلية.",done);
if(b.dataset.action==="adjust")U.reasonDialog("طلب تصحيح مبلغ","payment.adjust",{id},"التصحيح يُسجّل للمراجعة في سجل منفصل؛ لا يغير المبلغ الأصلي أو قيمة العرض المقبول.",done,'<label>قيمة التصحيح بالدينار<input id="adjustAmount" type="number" step="0.01" min="-100000" max="100000" required placeholder="موجب للإضافة، سالب للتخفيض"></label>',()=>({amount:Number(U.$("adjustAmount").value)}));
}));
}
U.bindFilters(["search","status"],render);U.$("paymentsTable").addEventListener("click",e=>{const b=e.target.closest("[data-payment]");if(b)show(b.dataset.payment);});render();
const id=new URLSearchParams(location.search).get("id");if(D.get("payments",id))show(id);
})();
