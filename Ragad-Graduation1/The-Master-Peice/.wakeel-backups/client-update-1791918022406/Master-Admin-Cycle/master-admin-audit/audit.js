
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("audit.view"))return;
U.options("actor",D.state.admins.map(a=>[a.id,a.name]));
const kinds={user:"مستخدم",request:"معاملة",offer:"عرض",payment:"عملية مالية",ticket:"تذكرة",review:"تقييم",notification:"إشعار",service:"فئة",admin:"حساب إدارة",role:"صلاحيات",session:"جلسة عرض"};
function render(){const q=U.$("search").value.trim().toLowerCase(),actor=U.$("actor").value,entity=U.$("entity").value,rows=D.auditEntries.filter(a=>(actor==="all"||a.actor===actor)&&(entity==="all"||a.entity===entity)&&(a.reason+" "+a.actorName+" "+a.target+" "+a.action).toLowerCase().includes(q));
U.$("auditTable").innerHTML=U.table(["وقت الإجراء","صاحب الإجراء","السجل","السبب","إجراء"],rows.map(a=>[U.date(a.date),U.esc(a.actorName),'<strong>'+U.esc(kinds[a.entity]||a.entity)+'</strong><small>'+U.esc(a.target)+'</small>',U.esc(a.reason),'<button class="button secondary" data-log="'+U.esc(a.id)+'" type="button">قبل وبعد</button>']));
}
U.$("auditTable").addEventListener("click",e=>{const b=e.target.closest("[data-log]");if(!b)return;const a=D.get("audit",b.dataset.log);
const exact=new Intl.DateTimeFormat("ar-JO",{timeZone:"Asia/Amman",dateStyle:"medium",timeStyle:"medium"}).format(new Date(a.date));
U.openDialog("تفاصيل الإجراء",'<dl class="detail-meta"><div><dt>صاحب الإجراء</dt><dd>'+U.esc(a.actorName)+'</dd></div><div><dt>التاريخ والوقت</dt><dd>'+U.esc(exact)+'</dd></div><div><dt>نوع الإجراء</dt><dd>'+U.esc(a.action)+'</dd></div><div><dt>السجل</dt><dd>'+U.esc(a.target)+'</dd></div></dl><p>'+U.esc(a.reason)+'</p><h3>قبل الإجراء</h3><pre class="audit-diff">'+U.esc(JSON.stringify(a.before,null,2))+'</pre><h3>بعد الإجراء</h3><pre class="audit-diff">'+U.esc(JSON.stringify(a.after,null,2))+'</pre>');
});
U.bindFilters(["search","actor","entity"],render);render();
})();

