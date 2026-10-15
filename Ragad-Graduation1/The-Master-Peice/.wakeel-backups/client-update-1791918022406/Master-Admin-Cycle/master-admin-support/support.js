
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("support.view"))return;
function render(){const all=D.state.tickets,q=U.$("search").value.trim().toLowerCase(),status=U.$("status").value,priority=U.$("priority").value;
U.metrics([["كل التذاكر",all.length,"help"],["مفتوحة",all.filter(t=>t.status==="open").length,"message"],["قيد المعالجة",all.filter(t=>t.status==="in-progress").length,"clock"],["أولوية عالية",all.filter(t=>t.priority==="high"&&t.status!=="closed").length,"shield"]]);
const rows=all.filter(t=>(status==="all"||t.status===status)&&(priority==="all"||t.priority===priority)&&(t.subject+" "+t.id+" "+t.request+" "+D.userName(t.user)).toLowerCase().includes(q));
U.$("ticketsTable").innerHTML=U.table(["التذكرة","المستخدم","الحالة","الأولوية","إجراء"],rows.map(t=>['<strong>'+U.esc(t.subject)+'</strong><small>'+U.esc(t.id+" · "+t.request)+'</small>',U.esc(D.userName(t.user)),U.badge(t.status,t.status==="open"?"مفتوحة":null),U.badge(t.priority),'<button class="button secondary" type="button" data-ticket="'+U.esc(t.id)+'">فتح التذكرة</button>']));
}
function show(id){
const t=D.get("tickets",id);
U.openDialog(t.subject,'<p class="muted">'+U.esc(t.id+" · "+D.userName(t.user))+'</p><div class="action-row">'+U.badge(t.status,t.status==="open"?"مفتوحة":null)+U.badge(t.priority)+'</div><p class="long-text">'+U.esc(t.description)+'</p><a class="text-action" href="'+U.href("request-details",t.request)+'">تفاصيل المعاملة المرتبطة</a><div class="action-row form-actions">'+U.button("تحديث الحالة والأولوية","update","support.manage")+'</div><h3 style="margin-top:22px">الردود الإدارية</h3>'+ (t.replies.length?t.replies.map(r=>'<div class="reply"><strong>'+U.esc(D.userName(r.by))+'</strong><small> · '+U.date(r.date)+'</small><p>'+U.esc(r.text)+'</p></div>').join(""):'<p>لا توجد ردود بعد.</p>')+(D.can("support.manage")&&t.status!=="closed"?'<form id="replyForm" class="dialog-form"><label>رد الإدارة<textarea id="replyText" rows="3" required minlength="10" maxlength="2000"></textarea></label><p class="muted">الرد محفوظ محليًا ولا يُرسل إلى المستخدم.</p><button class="button primary" type="submit">حفظ الرد</button></form>':""));
U.$("adminDialogBody").querySelector("[data-action=update]")?.addEventListener("click",()=>{
U.reasonDialog("تحديث التذكرة","ticket.update",{id},"إغلاق التذكرة لا ينفذ تسوية مالية أو يغير حالة المعاملة تلقائيًا.",()=>{render();show(id);},'<label>الحالة<select id="ticketState"><option value="open">مفتوحة</option><option value="in-progress">قيد المعالجة</option><option value="closed">مغلقة</option></select></label><label>الأولوية<select id="ticketPriority"><option value="normal">عادية</option><option value="high">عالية</option></select></label>',()=>({status:U.$("ticketState").value,priority:U.$("ticketPriority").value}));U.$("ticketState").value=t.status;U.$("ticketPriority").value=t.priority;
});
U.$("replyForm")?.addEventListener("submit",e=>{e.preventDefault();if(U.run("ticket.reply",{id,text:U.$("replyText").value.trim()})){U.toast("تم حفظ الرد المحلي.");render();show(id);}});
}
U.bindFilters(["search","status","priority"],render);U.$("ticketsTable").addEventListener("click",e=>{const b=e.target.closest("[data-ticket]");if(b)show(b.dataset.ticket);});render();
const id=new URLSearchParams(location.search).get("id");if(D.get("tickets",id))show(id);
})();
