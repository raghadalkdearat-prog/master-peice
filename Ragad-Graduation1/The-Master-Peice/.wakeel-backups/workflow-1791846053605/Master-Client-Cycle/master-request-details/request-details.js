(() => {
  "use strict";
  // Illustrative records matching the IDs in My Requests. No server-side data.
  const requests = {
    "10231": {title:"تجديد رخصة مركبة",category:"معاملات المركبات",city:"إربد",department:"إدارة ترخيص السواقين والمركبات",priority:"عادي",budget:35,deadline:"15/10/2026",date:"08/10/2026",status:"active",description:"أحتاج إلى متابعة إجراءات تجديد رخصة مركبة في إربد واستكمال الخطوات اللازمة.",offers:[{id:"a",name:"أحمد خالد",rating:"4.9",completed:128,price:28,days:3,notes:"متابعة الإجراءات المطلوبة وإرسال تحديثات واضحة."},{id:"b",name:"ليث عمر",rating:"4.7",completed:76,price:32,days:2,notes:"متابعة الطلب والتنسيق على المستندات المطلوبة."}],selected:"a"},
    "10232": {title:"متابعة معاملة أرض",category:"العقارات والأراضي",city:"عمان",department:"دائرة الأراضي والمساحة",priority:"مهم",budget:65,deadline:"20/10/2026",date:"07/10/2026",status:"offers",description:"أحتاج إلى شخص يتابع إجراءات معاملة تخص أرضًا في عمان ويبلغني بالوثائق والخطوات المطلوبة.",offers:[{id:"a",name:"سامي حداد",rating:"4.9",completed:214,price:48,days:4,notes:"أتابع الطلب وأرسل تفاصيل الإجراءات والمواعيد."},{id:"b",name:"نور العبدالله",rating:"4.8",completed:93,price:52,days:3,notes:"تحديثات دورية ومراجعة المستندات المطلوبة."},{id:"c",name:"مروان منصور",rating:"4.6",completed:61,price:43,days:5,notes:"متابعة كاملة بحسب نطاق الطلب والمستندات."}]},
    "10233": {title:"تعديل سجل تجاري",category:"معاملات الشركات",city:"الزرقاء",department:"دائرة مراقبة الشركات",priority:"عادي",budget:45,deadline:"22/10/2026",date:"05/10/2026",status:"active",description:"أريد متابعة تعديل بيانات السجل التجاري والتأكد من استكمال المستندات الضرورية.",offers:[{id:"a",name:"رائد الشامي",rating:"4.8",completed:88,price:38,days:4,notes:"أتابع المعاملة حتى إكمال التحديثات."}],selected:"a"},
    "10230": {title:"استخراج وثائق شركة",category:"الوثائق والمستندات",city:"عمان",department:"دائرة مراقبة الشركات",priority:"عادي",budget:30,deadline:"06/10/2026",date:"02/10/2026",status:"completed",description:"طلب استخراج وثائق مرتبطة بشركة ومتابعة استلامها.",offers:[{id:"a",name:"محمود الزعبي",rating:"4.9",completed:151,price:25,days:2,notes:"تمت متابعة الإجراءات المطلوبة."}],selected:"a"},
    "10225": {title:"تجديد ترخيص مهني",category:"التراخيص",city:"إربد",department:"البلدية المعنية",priority:"عادي",budget:50,deadline:"30/09/2026",date:"24/09/2026",status:"completed",description:"متابعة تجديد رخصة مهنية واستكمال متطلباتها.",offers:[{id:"a",name:"أحمد خالد",rating:"4.9",completed:128,price:40,days:4,notes:"تمت متابعة الإجراءات."}],selected:"a"},
    "10221": {title:"نقل ملكية مركبة",category:"معاملات المركبات",city:"عمان",department:"إدارة ترخيص السواقين والمركبات",priority:"مهم",budget:55,deadline:"22/09/2026",date:"18/09/2026",status:"completed",description:"متابعة طلب نقل ملكية مركبة حسب الإجراءات المعمول بها.",offers:[{id:"a",name:"ليث عمر",rating:"4.7",completed:76,price:47,days:2,notes:"تمت المتابعة."}],selected:"a"},
    "10218": {title:"تصديق مستندات",category:"الوثائق والمستندات",city:"إربد",department:"الجهة المختصة بالتصديق",priority:"عادي",budget:20,deadline:"15/09/2026",date:"11/09/2026",status:"completed",description:"متابعة إجراءات تصديق مستندات رسمية.",offers:[{id:"a",name:"نور العبدالله",rating:"4.8",completed:93,price:18,days:2,notes:"تمت المتابعة."}],selected:"a"},
    "10212": {title:"تحديث بيانات شركة",category:"معاملات الشركات",city:"عمان",department:"دائرة مراقبة الشركات",priority:"عادي",budget:55,deadline:"10/09/2026",date:"04/09/2026",status:"completed",description:"متابعة تحديث بيانات شركة.",offers:[{id:"a",name:"رائد الشامي",rating:"4.8",completed:88,price:45,days:4,notes:"تمت المتابعة."}],selected:"a"}
  };
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "10231";
  const key = "wakeel_request_demo_" + id;
  const base = requests[id];
  const $ = (s) => document.querySelector(s);
  const fmt = (v) => Number(v).toLocaleString("ar-JO") + " د.أ";
  const safe = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  if (!base) {
    $("#reqTitle").textContent = "المعاملة غير موجودة";
    $("#reqId").textContent = id;
    $("#statusHint").textContent = "هذا الرقم غير موجود ضمن بيانات التجربة. ارجع إلى قائمة معاملاتك.";
    $(".detail-grid").hidden = true;
    return;
  }
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch {}
  const state = { ...base, ...saved };
  if (!Array.isArray(state.messages)) state.messages = [];
  const persist = () => { try { localStorage.setItem(key, JSON.stringify({ status:state.status, selected:state.selected, messages:state.messages, rating:state.rating })); } catch {} };
  const statuses = {offers:["بانتظار اختيار عرض","وصلت عروض من مقدمي الخدمة ويمكنك مراجعتها والمقارنة بينها."],active:["قيد التنفيذ","تم اختيار مقدم الخدمة، وتُتابَع الإجراءات حاليًا."],completed:["مكتملة","تم تسجيل انتهاء المعاملة في هذا النموذج التجريبي."]};
  document.title = state.title + " | وكيل";
  [["#reqTitle",state.title],["#reqId","#"+id],["#reqDate",state.date],["#reqCategory",state.category],["#reqCity",state.city],["#reqDepartment",state.department],["#reqPriority",state.priority],["#reqBudget",fmt(state.budget)],["#reqDeadline",state.deadline],["#reqDescription",state.description]].forEach(([s,v])=>$(s).textContent=v);
  function render() {
    const status = statuses[state.status] || statuses.offers;
    $("#statusTitle").textContent=status[0]; $("#statusHint").textContent=status[1]; $("#statusBadge").textContent=status[0]; $("#sideStatus").textContent=status[0];
    $("#statusBadge").className="request-badge status-"+state.status;
    $("#offersCount").textContent=state.offers.length+" عروض";
    $("#sideOffers").textContent=String(state.offers.length);
    const agent=state.offers.find(o=>o.id===state.selected);
    $("#selectedAgent").textContent=agent ? agent.name : "لم يتم الاختيار";
    $("#agreedPrice").textContent=agent ? fmt(agent.price) : "—";
    $("#offersSubtitle").textContent=state.status==="offers"?"اختر العرض الأنسب من حيث التكلفة والمدة والتقييم":"معلومات العروض المقدمة لهذه المعاملة";
    $("#offersList").innerHTML=state.offers.map(o=>`<article class="offer-row"><div class="offer-avatar" aria-hidden="true">${safe(o.name.slice(0,1))}</div><div class="offer-info"><div class="offer-name">${safe(o.name)} ${state.selected===o.id?'<span class="selected-pill">العرض المختار</span>':''}</div><div class="offer-rating">★ ${safe(o.rating)} <span>· ${o.completed} معاملة مكتملة (بيانات تجريبية)</span></div><p>${safe(o.notes)}</p></div><div class="offer-side"><strong>${fmt(o.price)}</strong><small>خلال ${o.days} أيام تقديريًا</small>${state.status==="offers"?`<button type="button" class="accept-offer" data-offer="${safe(o.id)}">اختيار العرض</button>`:''}</div></article>`).join("");
    const steps=["تم إنشاء الطلب","استلام العروض","اختيار مقدم الخدمة","قيد التنفيذ","إتمام المعاملة"];
    const completedCount = state.status==="offers"?2:state.status==="active"?4:5;
    $("#timeline").innerHTML=steps.map((x,i)=>`<div class="track-step ${i<completedCount?'done':''} ${i===completedCount-1?'now':''}"><span class="track-mark">${i<completedCount?'✓':(i+1)}</span><div><strong>${x}</strong><small>${i<completedCount?'تم الوصول لهذه المرحلة (عرض تجريبي)':'بانتظار التقدم للمرحلة التالية'}</small></div></div>`).join("");
    const unlocked=Boolean(state.selected);
    $("#chatLocked").hidden=unlocked; $("#chatPanel").hidden=!unlocked;
    $("#messages").innerHTML=state.messages.length?state.messages.map(m=>`<div class="chat-msg">${safe(m)}</div>`).join(""):'<p class="no-messages">لا توجد رسائل بعد. اكتب أول رسالة تجريبية.</p>';
    $("#paymentText").textContent=agent?`قيمة العرض المختار: ${fmt(agent.price)}. الدفع غير مفعّل في هذه النسخة التجريبية.`:"لا يوجد عرض مقبول. لا توجد عمليات دفع فعلية.";
    const actions=[];
    if(state.status==="offers") actions.push('<a href="#offers" class="primary-action">مقارنة العروض واختيار الوكيل</a>');
    if(state.status==="active") actions.push('<a href="#conversation" class="primary-action">مراسلة مقدم الخدمة</a>');
    if(state.status==="completed" && !state.rating) actions.push('<button class="primary-action" id="rateAction" type="button">تقييم مقدم الخدمة</button>');
    if(state.rating) actions.push(`<div class="rating-done">تقييمك التجريبي: ${safe(state.rating)} من 5 ★</div>`);
    actions.push('<a href="my-requests.html" class="secondary-action">العودة إلى معاملاتي</a>');
    $("#dynamicActions").innerHTML=actions.join("");
    const rateBtn=$("#rateAction");
    if(rateBtn) rateBtn.addEventListener("click",()=>{
      const response=prompt("قيّم مقدم الخدمة من 1 إلى 5 (تقييم تجريبي محفوظ على جهازك):");
      if(response===null) return;
      const score=Number(response);
      if(!Number.isInteger(score)||score<1||score>5){alert("الرجاء إدخال رقم صحيح من 1 إلى 5.");return;}
      state.rating=score; persist(); render();
    });
    document.querySelectorAll("[data-offer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(state.status!=="offers") return;
      const offer=state.offers.find(x=>x.id===btn.dataset.offer);if(!offer)return;
      if(!confirm(`اختيار ${offer.name} بسعر ${fmt(offer.price)}؟ هذا تغيير تجريبي على جهازك فقط، ولا ينشئ اتفاقًا أو دفعًا حقيقيًا.`))return;
      state.selected=offer.id;state.status="active";persist();render();
    }));
  }
  $("#chatForm").addEventListener("submit",e=>{
    e.preventDefault();if(!state.selected)return;
    const input=$("#chatMessage");const value=input.value.trim();if(!value)return;
    state.messages.push(value);input.value="";persist();render();
  });
  render();
})();