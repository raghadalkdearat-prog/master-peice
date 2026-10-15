
(() => {
const D=AgentData,U=AgentUI;
function render(){
const all=D.state.notifications,unread=all.filter(n=>!n.read).length;
U.metrics([["كل الإشعارات",all.length,"bell"],["غير مقروءة",unread,"bell"],["تحديثات العروض",all.filter(n=>n.type==="offer").length,"offer"],["تحديثات المعاملات",all.filter(n=>n.type==="request").length,"file"]]);
const q=U.$("search").value.trim().toLowerCase(),type=U.$("type").value,read=U.$("read").value;
const rows=all.filter(n=>(type==="all"||n.type===type)&&(read==="all"||(read==="read"?n.read:!n.read))&&(n.title+" "+n.body).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
U.$("notificationList").innerHTML=rows.length?rows.map(n=>'<article class="notice '+(n.read?"":"unread")+'"><span class="info-icon">'+U.icon(n.type==="offer"?"offer":n.type==="payment"?"wallet":n.type==="message"?"message":"file")+'</span><div class="notice-copy"><time>'+U.date(n.date)+'</time><h3>'+U.esc(n.title)+'</h3><p>'+U.esc(n.body)+'</p><a class="text-action" data-open="'+U.esc(n.id)+'" href="'+(n.ticket?U.href("support")+"?id="+encodeURIComponent(n.ticket):U.href("request-details",n.request)+(n.type==="message"?"#messages":""))+'">'+(n.ticket?"فتح التذكرة":n.type==="message"?"فتح الرسائل":"فتح المعاملة")+'</a></div><div class="action-row"><button type="button" class="icon-button" data-toggle="'+U.esc(n.id)+'" aria-label="'+(n.read?"تحديد كغير مقروء":"تحديد كمقروء")+'">'+(n.read?"غير مقروء":"مقروء")+'</button><button type="button" class="icon-button" data-delete="'+U.esc(n.id)+'" aria-label="حذف الإشعار">حذف</button></div></article>').join(""):U.empty("لا توجد إشعارات مطابقة","غيّر الفلاتر لعرض إشعارات أخرى.");
U.$("markAllRead").disabled=unread===0;U.$("deleteRead").disabled=!all.some(n=>n.read);
}
["search","type","read"].forEach(id=>U.$(id).addEventListener(id==="search"?"input":"change",render));
U.$("markAllRead").addEventListener("click",()=>{if(D.mutate(s=>s.notifications.forEach(n=>n.read=true)))render();});
U.$("deleteRead").addEventListener("click",()=>U.confirmAction("حذف الإشعارات المقروءة","سيتم حذف الإشعارات المقروءة من مساحة الوكيل.",()=>{if(D.mutate(s=>s.notifications=s.notifications.filter(n=>!n.read)))render();}));
U.$("notificationList").addEventListener("click",e=>{
const toggle=e.target.closest("[data-toggle]"),del=e.target.closest("[data-delete]"),open=e.target.closest("[data-open]");
if(toggle){if(D.mutate(s=>{const n=s.notifications.find(n=>n.id===toggle.dataset.toggle);if(n)n.read=!n.read;}))render();}
if(del){if(D.mutate(s=>s.notifications=s.notifications.filter(n=>n.id!==del.dataset.delete)))render();}
if(open)D.mutate(s=>{const n=s.notifications.find(n=>n.id===open.dataset.open);if(n)n.read=true;});
});window.addEventListener("wakeel:change",render);render();
})();


