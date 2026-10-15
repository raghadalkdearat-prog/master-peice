
(() => {
"use strict";
const D=AgentData,U=AgentUI,id=new URLSearchParams(location.search).get("id");
const panel=(title,body)=>'<section class="panel"><div class="panel-heading"><h2>'+title+'</h2></div><div class="panel-body">'+body+'</div></section>';
function render(){
const r=D.request(id);
if(!r){U.$("detailContent").innerHTML=U.empty("المعاملة غير موجودة","اختر معاملة من الطلبات المتاحة أو من معاملاتي.")+'<a class="button secondary" href="'+U.href("requests")+'">الطلبات المتاحة</a>';return;}
const o=D.offer(id),assigned=o?.status==="accepted";
U.$("pageTitle").textContent=r.title;document.title=r.title+" | مساحة الوكيل — وكيل";
const info=[["رقم المعاملة",r.id],["العميل",r.client],["الفئة",r.category],["المحافظة",r.city],["الجهة",r.department],["الأولوية",r.priority],["الميزانية",U.money(r.budget)],["الموعد المطلوب",U.date(r.deadline)]];
const meta='<dl class="detail-meta">'+info.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+U.esc(v)+'</dd></div>').join("")+'</dl><p class="long-text">'+U.esc(r.description)+'</p>';
let offer=o?'<div class="action-row">'+U.badge(o.status)+'</div><p><strong>قيمة العرض: '+U.money(o.price)+'</strong> · المدة: '+o.days+' أيام</p><p class="long-text">'+U.esc(o.notes)+'</p>':'<p>لم تقدم عرضًا على هذه المعاملة بعد.</p>';
if(r.status==="open"&&(!o||o.status==="withdrawn"||o.status==="pending"))offer+='<div class="action-row"><button id="editOffer" class="button primary" type="button">'+(o?.status==="pending"?"تعديل العرض":"تقديم عرض")+'</button>'+(o?.status==="pending"?'<button id="withdrawOffer" class="button danger" type="button">سحب العرض</button>':"")+'</div>';
let work=assigned?U.timeline(r.stage):'<p>متابعة التنفيذ تتاح بعد قبول العرض وإسناد المعاملة إليك.</p>';
if(assigned&&r.status==="active")work+='<form id="progressForm" class="dialog-form" style="margin-top:20px"><label>مرحلة التنفيذ<select id="stage"><option value="1">بدء التنفيذ</option><option value="2">متابعة الإجراءات</option><option value="3">إتمام المعاملة</option></select></label><label>ملاحظة على التنفيذ<textarea id="progressNote" rows="3" required minlength="5" maxlength="1000" placeholder="أضف تحديثًا واضحًا للعميل"></textarea></label><button class="button primary" type="submit">حفظ التحديث</button></form>';
work+=(r.updates||[]).slice().reverse().map(x=>'<div class="event-item"><small>'+U.date(x.date)+'</small><p class="long-text">'+U.esc(x.text)+'</p></div>').join("");
const chat=assigned?'<div class="message-list" id="messages">'+((r.messages||[]).length?r.messages.map(m=>'<div class="chat-message '+(m.by==="client"?"client":"")+'"><small>'+U.esc(m.by==="client"?r.client:D.state.profile.name)+' · '+U.date(m.date)+'</small><p>'+U.esc(m.text)+'</p></div>').join(""):'<p>لا توجد رسائل بعد.</p>')+'</div>'+(r.status==="active"?'<form id="chatForm" class="dialog-form"><label>رسالتك للعميل<textarea id="chatText" required maxlength="2000" rows="2" placeholder="اكتب رسالتك"></textarea></label><button class="button primary" type="submit">إرسال الرسالة</button></form>':'<p>هذه معاملة مكتملة؛ المحادثة متاحة للقراءة.</p>'):'<p>تتوفر المحادثة بعد قبول عرضك.</p>';
U.$("detailContent").innerHTML='<div class="agent-columns"><div class="agent-stack">'+panel("معلومات المعاملة",meta)+panel("عرضي على المعاملة",offer)+panel("تتبع مراحل المعاملة",work)+panel("المحادثة مع العميل",chat)+panel("المستندات",'<p>لا توجد مستندات متاحة في بيانات هذه المعاملة. رفع المستندات وتبادلها يحتاجان ربطًا بالخادم.</p>')+'</div><aside class="agent-stack">'+panel("ملخص المعاملة",U.badge(D.status(r))+'<p>'+U.esc(r.client+" · "+r.city)+'</p><p>قيمة العرض: '+(o?U.money(o.price):"—")+'</p><a class="button secondary" href="'+U.href("my-requests")+'">العودة إلى معاملاتي</a>')+panel("المستحقات",'<p>راجع مبالغ المعاملات وحالات التسوية. لا توجد تحويلات مالية فعلية.</p><a class="button secondary" href="'+U.href("payments")+'">عرض المستحقات</a>')+panel("التعامل الآمن",'<p>حدد نطاق العمل والسعر والمدة بوضوح قبل بدء التنفيذ، وتواصل مع الدعم عند الحاجة.</p><a class="text-action" href="'+U.href("support")+'">المساعدة والدعم</a>')+'</aside></div>';
if(U.$("editOffer"))U.$("editOffer").addEventListener("click",()=>editOffer(o));
if(U.$("withdrawOffer"))U.$("withdrawOffer").addEventListener("click",()=>U.confirmAction("سحب العرض","سيصبح عرضك مسحوبًا من هذه المعاملة في بياناتك المحلية.",()=>{if(D.mutate(s=>{s.offers.find(x=>x.request===id).status="withdrawn";})){U.toast("تم سحب العرض.");render();}}));
if(U.$("progressForm")){
U.$("stage").value=String(Math.max(1,r.stage));
U.$("stage").querySelectorAll("option").forEach(x=>x.disabled=Number(x.value)<r.stage);
U.$("progressForm").addEventListener("submit",e=>{
e.preventDefault();const stage=Number(U.$("stage").value),note=U.$("progressNote").value.trim();if(note.length<5){U.toast("أضف ملاحظة من 5 أحرف على الأقل.");return;}
if(stage<r.stage||stage>3)return;
const save=()=>{if(D.mutate(s=>{const record=s.requests.find(x=>x.id===id);record.stage=stage;record.status=stage===3?"completed":"active";record.updates.push({text:note,date:new Date().toISOString()});if(stage===3&&!s.payments.some(x=>x.request===id))s.payments.unshift({id:"PAY-"+Date.now(),request:id,amount:o.price,status:"pending",date:new Date().toISOString()});D.addNotice(s,"request",stage===3?"تم تسجيل إتمام المعاملة":"تم تحديث مرحلة التنفيذ",note,id);})){U.toast("تم حفظ تحديث المعاملة محليًا.");render();}};
if(stage===3)U.confirmAction("إتمام المعاملة","تسجيل المعاملة مكتملة سيوقف تعديل التنفيذ ويضيف مستحقاتها بانتظار التسوية في هذا العرض التجريبي.",save);else save();
});
}
if(U.$("chatForm"))U.$("chatForm").addEventListener("submit",e=>{e.preventDefault();const value=U.$("chatText").value.trim();if(!value)return;if(D.mutate(s=>s.requests.find(x=>x.id===id).messages.push({by:"agent",text:value,date:new Date().toISOString()}))){render();U.$("chatText").focus();U.$("messages").scrollTop=U.$("messages").scrollHeight;}});
}
function editOffer(previous){
const o=previous?.status==="pending"?previous:null;
U.openDialog(o?"تعديل العرض":"تقديم عرض",'<form id="offerForm" class="dialog-form"><label>قيمة العرض بالدينار الأردني<input id="offerPrice" type="number" min="1" max="100000" step="0.01" required value="'+(o?.price||"")+'"></label><label>المدة بالأيام<input id="offerDays" type="number" min="1" max="365" step="1" required value="'+(o?.days||"")+'"></label><label>تفاصيل العرض<textarea id="offerNotes" rows="4" required minlength="10" maxlength="1500">'+U.esc(o?.notes||"")+'</textarea></label><p class="muted">العرض محفوظ محليًا ضمن مساحة الوكيل، ولا يُرسل إلى حساب عميل.</p><button class="button primary" type="submit">حفظ العرض</button></form>');
U.$("offerForm").addEventListener("submit",e=>{e.preventDefault();const price=Number(U.$("offerPrice").value),days=Number(U.$("offerDays").value),notes=U.$("offerNotes").value.trim();if(!(price>=1&&price<=100000)||!Number.isInteger(days)||days<1||days>365||notes.length<10){U.toast("أدخل سعرًا ومدة صحيحين ووصفًا من 10 أحرف على الأقل.");return;}
if(D.mutate(s=>{const existing=s.offers.find(x=>x.request===id);const entry={id:existing?.id||"O-"+Date.now(),request:id,price,days,notes,status:"pending",date:new Date().toISOString()};if(existing)Object.assign(existing,entry);else s.offers.unshift(entry);D.addNotice(s,"offer",o?"تم تعديل عرضك":"تم حفظ عرضك","عرضك على المعاملة بانتظار القبول.",id);})){U.closeDialog();U.toast("تم حفظ العرض محليًا.");render();}
});
}
render();
})();
