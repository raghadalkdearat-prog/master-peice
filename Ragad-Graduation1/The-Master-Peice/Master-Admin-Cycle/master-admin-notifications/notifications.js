
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("notifications.view"))return;
const visible=n=>n.recipient===D.actor.id||(D.actor.role==="root"&&Boolean(n.createdBy));
function render(){const all=D.state.notifications.filter(visible),q=U.$("search").value.trim().toLowerCase(),read=U.$("read").value;
U.metrics([["إشعارات الإدارة",all.length,"bell"],["غير مقروءة",all.filter(n=>!n.read).length,"bell"],["إشعارات منشأة",all.filter(n=>n.createdBy).length,"message"],["مرتبطة بمعاملة",all.filter(n=>n.request).length,"file"]]);
const rows=all.filter(n=>(read==="all"||(read==="read"?n.read:!n.read))&&(n.title+" "+n.body+" "+D.userName(n.recipient)).toLowerCase().includes(q));
U.$("notificationList").innerHTML=rows.length?rows.map(n=>'<article class="notice '+(n.read?"":"unread")+'"><div class="info-icon">'+U.icon("bell")+'</div><div class="notice-copy"><h3>'+U.esc(n.title)+'</h3><p>'+U.esc(n.body)+'</p><p>المستلم: '+U.esc(D.userName(n.recipient))+' · '+U.date(n.date)+'</p>'+(n.request&&D.can("requests.view")?U.detailLink(n.request):"")+(n.createdBy?'<p class="muted">إشعار تجريبي محفوظ، دون إرسال خارجي.</p>':"")+'</div>'+(!n.read?'<button class="button secondary" data-read="'+U.esc(n.id)+'" type="button">تحديد كمقروء</button>':"")+'</article>').join(""):U.empty("لا توجد إشعارات مطابقة");
U.$("markAllRead").disabled=!all.some(n=>!n.read);U.$("newNotification").hidden=!D.can("notifications.create");
}
U.$("markAllRead").addEventListener("click",()=>{if(U.run("notification.read",{}))render();});
U.$("notificationList").addEventListener("click",e=>{const b=e.target.closest("[data-read]");if(b&&U.run("notification.read",{id:b.dataset.read}))render();});
U.$("newNotification").addEventListener("click",()=>{
U.openDialog("إنشاء إشعار تجريبي",'<form id="notificationForm" class="dialog-form"><label>المستلم<select id="recipient" required></select></label><label>المعاملة المرتبطة<select id="notificationRequest"><option value="">دون معاملة</option></select></label><label>العنوان<input id="notificationTitle" required minlength="3" maxlength="120"></label><label>المحتوى<textarea id="notificationBody" required minlength="10" maxlength="2000" rows="4"></textarea></label><p class="muted">سيُحفظ الإشعار داخل بيانات الإدارة فقط، دون إرساله لحساب العميل أو الوكيل.</p><button class="button primary" type="submit">حفظ الإشعار</button></form>');
U.options("recipient",[...D.state.users,...D.state.admins].map(u=>[u.id,u.name]));U.options("notificationRequest",D.state.requests.map(r=>[r.id,r.title+" · "+r.id]));
U.$("notificationForm").addEventListener("submit",e=>{e.preventDefault();if(U.run("notification.create",{recipient:U.$("recipient").value,request:U.$("notificationRequest").value,title:U.$("notificationTitle").value.trim(),body:U.$("notificationBody").value.trim()})){U.closeDialog();U.toast("تم حفظ الإشعار التجريبي.");render();}});
});
U.bindFilters(["search","read"],render);render();
})();
