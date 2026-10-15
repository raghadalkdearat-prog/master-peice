(() => {
  "use strict";
  const KEY = "wakeel_client_notifications_demo_v1";
  const defaults = [
    {id:"n01",type:"offer",title:"وصلتك 3 عروض جديدة",body:"ثلاثة مقدمي خدمة أرسلوا عروضهم على طلب متابعة معاملة أرض. قارن الأسعار والمدة واختر المناسب.",request:"10232",date:"2026-10-10T11:25:00",read:false},
    {id:"n02",type:"request",title:"تم تحديث حالة معاملة تجديد الرخصة",body:"مقدم الخدمة أحمد خالد بدأ تنفيذ معاملة تجديد رخصة المركبة #10231.",request:"10231",date:"2026-10-10T09:30:00",read:false},
    {id:"n03",type:"message",title:"رسالة جديدة من مقدم الخدمة",body:"وصلتك رسالة من أحمد خالد بخصوص الوثائق المطلوبة لمعاملة تجديد رخصة مركبة.",request:"10231",date:"2026-10-09T17:40:00",read:false},
    {id:"n04",type:"payment",title:"تحديث على حالة دفع المعاملة",body:"توجد عملية دفع تجريبية مرتبطة بمعاملة تعديل سجل تجاري. راجع تفاصيل المدفوعات.",request:"10233",date:"2026-10-09T13:10:00",read:false},
    {id:"n05",type:"offer",title:"وصل عرض جديد لمعاملة الأرض",body:"قدم سامي حداد عرضًا جديدًا لمتابعة معاملة أرض #10232.",request:"10232",date:"2026-10-08T15:00:00",read:false},
    {id:"n06",type:"request",title:"اكتملت معاملة استخراج الوثائق",body:"تم تسجيل معاملة استخراج وثائق شركة #10230 باعتبارها مكتملة في بيانات العرض التجريبية.",request:"10230",date:"2026-10-07T10:30:00",read:true},
    {id:"n07",type:"system",title:"مرحبًا بك في وكيل",body:"تقدر تتابع معاملاتك وعروض الوكلاء من خلال لوحة تحكم العميل.",request:null,date:"2026-10-06T12:00:00",read:true},
    {id:"n08",type:"payment",title:"عملية دفع مكتملة",body:"تحديث تجريبي على عملية الدفع المرتبطة بمعاملة تجديد الترخيص المهني #10225.",request:"10225",date:"2026-10-05T10:15:00",read:true}
  ];
  const kinds = {
    offer: {label:"عرض جديد",symbol:"i-offer",color:"offers"},
    request: {label:"تحديث معاملة",symbol:"i-file",color:"requests"},
    payment: {label:"المدفوعات",symbol:"i-wallet",color:"payments"},
    message: {label:"رسالة",symbol:"i-message",color:"messages"},
    system: {label:"تنبيه النظام",symbol:"i-shield",color:"system"}
  };
  const byId = id => document.getElementById(id);
  let notices;
  try {
    const stored=JSON.parse(localStorage.getItem(KEY));
    notices = Array.isArray(stored) && stored.every(item=>item&&typeof item.id==="string"&&kinds[item.type]) ? stored : defaults.map(x=>({...x}));
  } catch { notices=defaults.map(x=>({...x})); }
  const persist=()=>{ try { localStorage.setItem(KEY,JSON.stringify(notices)); } catch {} };
  const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]||"&quot;"));
  const countLabel=n=> n===1?"إشعار واحد": `${n} إشعارات`;
  const formatDate=s=>new Intl.DateTimeFormat("ar-JO",{day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(s));
  function target(n){return n.request?`request-details.html?id=${encodeURIComponent(n.request)}${n.type==="offer"?"#offers":""}`:null;}
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
    byId("bottomSummary").textContent=`${unread} غير مقروءة · بيانات تجريبية محفوظة محليًا`;
    byId("notificationEmpty").hidden=visible.length>0;
    byId("notificationList").innerHTML=visible.map(n=>{
      const k=kinds[n.type],href=target(n);
      return `<article class="notice-item ${n.read?"is-read":"is-unread"}" data-id="${escapeHTML(n.id)}">
        <span class="notice-item-icon ${k.color}"><svg><use href="#${k.symbol}"/></svg></span>
        <div class="notice-item-body"><div class="notice-item-head"><span class="notice-type">${k.label}</span><time datetime="${escapeHTML(n.date)}">${formatDate(n.date)}</time></div>
        <h3>${escapeHTML(n.title)}${!n.read?'<i class="notice-unread-dot" aria-label="غير مقروء"></i>':""}</h3><p>${escapeHTML(n.body)}</p>
        ${href?`<a href="${href}" data-open="${escapeHTML(n.id)}" class="notice-go">فتح المعاملة <svg><use href="#i-arrow"/></svg></a>`:""}</div>
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