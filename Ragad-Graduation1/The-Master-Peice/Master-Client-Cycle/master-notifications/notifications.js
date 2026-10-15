(() => {
  "use strict";
  const D=WakeelData;
  
  const kinds = {
    offer: {label:"عرض جديد",symbol:"i-offer",color:"offers"},
    request: {label:"تحديث معاملة",symbol:"i-file",color:"requests"},
    payment: {label:"المدفوعات",symbol:"i-wallet",color:"payments"},
    message:{label:"رسالة معاملة",symbol:"i-help",color:"requests"},
    support:{label:"رد الدعم",symbol:"i-help",color:"system"},
    system: {label:"تنبيه النظام",symbol:"i-shield",color:"system"}
  };
  const byId = id => document.getElementById(id);
  let notices=D.state.notifications.filter(n=>n.role==="client");
  const persist=()=>D.updateNotices("client",()=>notices);
  const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||"&quot;"));
  const countLabel=n=> n===1?"إشعار واحد": `${n} إشعارات`;
  const formatDate=s=>new Intl.DateTimeFormat("ar-JO",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(s));
  function target(n){if(n.type==="message")return "../master-request-details/request-details.html?id="+encodeURIComponent(n.request)+"#messages";if(n.ticket)return "../master-Support-Help/support.html?id="+encodeURIComponent(n.ticket);return n.request?`request-details.html?id=${encodeURIComponent(n.request)}${n.type==="offer"?"#offers":""}`:null;}
  function render(){
    const unread=notices.filter(n=>!n.read).length;
    byId("statTotal").textContent=notices.length;
    byId("statUnread").textContent=unread;
    byId("statOffers").textContent=notices.filter(n=>n.type==="offer").length;
    byId("statRequests").textContent=notices.filter(n=>n.type==="request").length;
    byId("tabUnreadCount").textContent=unread;
    const q=byId("searchNotices").value.trim().toLowerCase(), t=byId("typeFilter").value, r=byId("readFilter").value;
    const visible=notices.filter(n=>(t==="all"||n.type===t)&&(r==="all"||(r==="read"?n.read:!n.read))&&`${n.title} ${n.body} ${n.request||""}`.toLowerCase().includes(q)).sort((a,b)=>new Date(b.date)-new Date(a.date));
    byId("filteredCount").textContent=countLabel(visible.length);
    byId("listSummary").textContent=`عرض ${visible.length} من أصل ${notices.length} إشعارات`;
    byId("bottomSummary").textContent=`${unread} غير مقروءة · تحديثات حسابك`;
    byId("notificationEmpty").hidden=visible.length>0;
    byId("notificationList").innerHTML=visible.map(n=>{
      const k=kinds[n.type]||kinds.system,href=target(n);
      return `<article class="notice-item ${n.read?"is-read":"is-unread"}" data-id="${escapeHTML(n.id)}">
        <span class="notice-item-icon ${k.color}"><svg><use href="#${k.symbol}"/></svg></span>
        <div class="notice-item-body"><div class="notice-item-head"><span class="notice-type">${k.label}</span><time datetime="${escapeHTML(n.date)}">${formatDate(n.date)}</time></div>
        <h3>${escapeHTML(n.title)}${!n.read?'<i class="notice-unread-dot" aria-label="غير مقروء"></i>':""}</h3><p>${escapeHTML(n.body)}</p>
        ${href?`<a href="${href}" data-open="${escapeHTML(n.id)}" class="notice-go">${n.type==="support"?"فتح التذكرة":n.type==="message"?"فتح الرسائل":"فتح المعاملة"} <svg><use href="#i-arrow"/></svg></a>`:""}</div>
        <div class="notice-item-actions"><button type="button" data-toggle="${escapeHTML(n.id)}" title="${n.read?"تحديد كغير مقروء":"تحديد كمقروء"}" aria-label="${n.read?"تحديد كغير مقروء":"تحديد كمقروء"}">${n.read?'<svg><use href="#i-bell"/></svg>':'<svg><use href="#i-check"/></svg>'}</button><button type="button" data-delete="${escapeHTML(n.id)}" title="حذف الإشعار" aria-label="حذف الإشعار"><svg><use href="#i-x"/></svg></button></div>
      </article>`;
    }).join("");
    document.querySelectorAll(".notice-tabs button").forEach(b=>{const active=b.dataset.tab===r;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
    byId("markAllRead").disabled=unread===0;
    byId("deleteRead").disabled=!notices.some(n=>n.read);
  }
  function reset(){byId("searchNotices").value="";byId("typeFilter").value="all";byId("readFilter").value="all";render();}
  byId("searchNotices").addEventListener("input",render);
  byId("typeFilter").addEventListener("change",render);
  byId("readFilter").addEventListener("change",render);
  byId("resetNotices").addEventListener("click",reset);
  byId("emptyReset").addEventListener("click",reset);
  document.querySelectorAll(".notice-tabs button").forEach(b=>b.addEventListener("click",()=>{byId("readFilter").value=b.dataset.tab;render();}));
  byId("markAllRead").addEventListener("click",()=>{notices.forEach(n=>n.read=true);persist();render();});
  byId("deleteRead").addEventListener("click",()=>{if(!notices.some(n=>n.read))return;if(!confirm("هل تريد حذف جميع الإشعارات المقروءة؟"))return;notices=notices.filter(n=>!n.read);persist();render();});
  byId("notificationList").addEventListener("click",e=>{
    const toggle=e.target.closest("[data-toggle]"),del=e.target.closest("[data-delete]"),open=e.target.closest("[data-open]");
    if(toggle){const n=notices.find(x=>x.id===toggle.dataset.toggle);if(n){n.read=!n.read;persist();render();}return;}
    if(del){const id=del.dataset.delete;notices=notices.filter(x=>x.id!==id);persist();render();return;}
    if(open){const n=notices.find(x=>x.id===open.dataset.open);if(n){n.read=true;persist();}}
  });
  render();
})();


