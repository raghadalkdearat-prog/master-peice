
(() => {
const D=AgentData,U=AgentUI;function render(){const s=D.state,mine=s.requests.filter(r=>D.offer(r.id));
U.$("pageTitle").textContent="مرحبًا بعودتك، "+s.profile.name.split(/\s+/)[0]+" ✦";
U.metrics([["العروض المقدمة",s.offers.filter(o=>o.status!=="withdrawn").length,"offer"],["معاملات نشطة",mine.filter(r=>r.status==="active"&&D.offer(r.id)?.status==="accepted").length,"clock"],["معاملات مكتملة",mine.filter(r=>r.status==="completed").length,"check"],["بانتظار القبول",s.offers.filter(o=>o.status==="pending").length,"offer"]]);
U.$("recentRequests").innerHTML=U.table(mine.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4));
const active=mine.find(r=>r.status==="active"&&D.offer(r.id)?.status==="accepted");
U.$("activePreview").innerHTML=active?'<h3>'+U.esc(active.title)+'</h3><p>'+U.esc(active.client+" · "+active.city)+'</p>'+U.timeline(active.stage)+'<a class="button secondary" style="margin-top:20px" href="'+U.href("request-details",active.id)+'">متابعة المعاملة</a>':U.empty("لا توجد معاملة نشطة","تظهر هنا معاملاتك بعد قبول عروضك.");
U.$("updates").innerHTML=s.notifications.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3).map(n=>'<div class="event-item"><strong>'+U.esc(n.title)+'</strong><p>'+U.esc(n.body)+'</p><a class="text-action" href="'+U.href("request-details",n.request)+'">'+U.date(n.date)+' · التفاصيل</a></div>').join("")||U.empty("لا توجد تحديثات","ستظهر هنا تحديثات معاملاتك.");
}
window.addEventListener("wakeel:change",render);render();
})();