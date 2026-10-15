/* Small UI utilities; page layouts continue to use their existing styles. */
(() => {"use strict";const D=WakeelData,A=WakeelAccount,C=WakeelCatalogue;
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.body.classList.add("wakeel-workflow");
const labels={draft:"مسودة",published:"بانتظار العروض","awaiting-payment":"بانتظار الدفع",active:"قيد التنفيذ",completed:"مكتملة",cancelled:"ملغاة",pending:"بانتظار الدفع",processing:"جاري معالجة التجربة",paid:"دُفع تجريبيًا",failed:"فشلت تجربة الدفع",legacy:"سجل تجريبي سابق",accepted:"مقبول",rejected:"غير مقبول",withdrawn:"مسحوب"};
const money=n=>Number(n||0).toLocaleString("ar-JO",{maximumFractionDigits:2})+" د.أ",date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("ar-JO",{timeZone:"Asia/Amman",day:"numeric",month:"short",year:"numeric"}).format(d);};
const badge=(status,text)=>'<span class="wf-pill '+esc(status)+'">'+esc(text||labels[status]||status)+'</span>';
const dialog=document.createElement("dialog");dialog.id="wfDialog";dialog.className="wf-dialog";dialog.setAttribute("aria-labelledby","wfDialogTitle");dialog.innerHTML='<div class="wf-dialog-header"><h2 id="wfDialogTitle"></h2><button class="wf-close" type="button" aria-label="إغلاق">×</button></div><div id="wfDialogBody"></div>';document.body.append(dialog);
const toastNode=document.createElement("div");toastNode.id="wfToast";toastNode.className="wf-toast";toastNode.hidden=true;toastNode.setAttribute("role","status");document.body.append(toastNode);
let activeAttempt=null;
function cancelAttempt(){if(activeAttempt){WakeelPaymentProvider.cancel(activeAttempt.attempt.id);D.finishPayment(activeAttempt.payment.id,activeAttempt.attempt.id,"cancelled");activeAttempt=null;}}
dialog.querySelector(".wf-close").addEventListener("click",()=>{cancelAttempt();dialog.close();});
dialog.addEventListener("cancel",cancelAttempt);
function toast(message){toastNode.textContent=message;toastNode.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastNode.hidden=true,4500);}
function open(title,body){$("wfDialogTitle").textContent=title;$("wfDialogBody").innerHTML=body;if(!dialog.open)dialog.showModal();}
function close(){cancelAttempt();dialog.close();}
function check(result,message){if(!result.ok){toast(result.error);return false;}if(message)toast(message);return true;}
const selects=new WeakMap();
function enhance(select){
if(selects.has(select))return selects.get(select);
const wrap=document.createElement("div");wrap.className="wf-combobox";select.before(wrap);wrap.append(select);select.classList.add("wf-native-select");select.tabIndex=-1;
const input=document.createElement("input");input.type="search";input.id=select.id+"Search";input.autocomplete="off";input.setAttribute("role","combobox");input.setAttribute("aria-autocomplete","list");input.setAttribute("aria-expanded","false");input.setAttribute("aria-label",select.labels?.[0]?.textContent.trim()||select.getAttribute("aria-label")||"اختر من القائمة");
const list=document.createElement("ul");list.id=select.id+"Options";list.className="wf-options";list.setAttribute("role","listbox");list.hidden=true;input.setAttribute("aria-controls",list.id);wrap.prepend(input);wrap.append(list);
let rows=[],active=0;
function closeList(){list.hidden=true;input.setAttribute("aria-expanded","false");input.removeAttribute("aria-activedescendant");}
function choose(option){select.value=option.value;input.value=option.textContent;input.setCustomValidity("");closeList();select.dispatchEvent(new Event("change",{bubbles:true}));}
function highlight(){[...list.children].forEach((el,i)=>el.setAttribute("aria-selected",String(i===active)));if(rows[active]){input.setAttribute("aria-activedescendant",select.id+"Opt"+active);list.children[active]?.scrollIntoView({block:"nearest"});}}
function render(){if(select.disabled)return;const query=C.searchText(input.value);rows=[...select.options].filter(o=>o.value&&!o.disabled&&(!query||C.searchText(o.textContent+" "+o.value).includes(query)));list.replaceChildren();active=0;
rows.forEach((o,i)=>{const item=document.createElement("li");item.id=select.id+"Opt"+i;item.setAttribute("role","option");item.textContent=o.textContent;item.addEventListener("mousedown",e=>e.preventDefault());item.addEventListener("click",()=>choose(o));list.append(item);});
if(!rows.length){const item=document.createElement("li");item.className="wf-no-results";item.textContent="لا توجد نتائج";list.append(item);}
list.hidden=false;input.setAttribute("aria-expanded","true");highlight();
}
function refresh(){input.disabled=select.disabled;input.placeholder=select.options[0]?.textContent||"ابحث واختر";input.value=select.value?select.selectedOptions[0]?.textContent||"":"";input.setCustomValidity("");closeList();}
input.addEventListener("focus",()=>{if(select.value){input.value="";}render();});
input.addEventListener("input",()=>{if(select.value){select.value="";select.dispatchEvent(new Event("change",{bubbles:true}));}render();});
input.addEventListener("keydown",e=>{if(e.key==="Escape"){closeList();refresh();return;}if(["ArrowDown","ArrowUp","Enter"].includes(e.key)){e.preventDefault();if(list.hidden){render();return;}if(e.key==="Enter"){if(rows[active])choose(rows[active]);}else{active=Math.max(0,Math.min(rows.length-1,active+(e.key==="ArrowDown"?1:-1)));highlight();}}});
input.addEventListener("blur",()=>{setTimeout(()=>{if(!wrap.contains(document.activeElement)){if(!select.value){const exact=[...select.options].find(o=>o.value&&C.searchText(o.textContent)===C.searchText(input.value));if(exact)choose(exact);else input.value="";}else refresh();closeList();}},120);});
select.addEventListener("change",()=>{if(select.value)refresh();});select.addEventListener("invalid",e=>{e.preventDefault();input.setCustomValidity("اختر قيمة من القائمة.");input.focus();input.reportValidity();});
select.addEventListener("focus",()=>input.focus());
const control={refresh,choose};selects.set(select,control);refresh();return control;
}
function fillSelect(select,items,placeholder,disabled=false){select.replaceChildren();const initial=document.createElement("option");initial.value="";initial.textContent=placeholder||"اختر";select.append(initial);items.forEach(x=>{const option=document.createElement("option");option.value=x.id??x.value;option.textContent=x.name??x.label;select.append(option);});select.disabled=disabled;selects.get(select)?.refresh();}
const phoneSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.6 2.6a2 2 0 0 1-.5 1.9L9 10.5a16 16 0 0 0 4.5 4.5l1.3-1.2a2 2 0 0 1 1.9-.5l2.6.6a2 2 0 0 1 1.7 2Z"/></svg>';
const waSVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.8a9 9 0 0 1-13.4 7.9L3 21l1.3-4.5A9 9 0 1 1 21 11.8Z"/><path d="m8 7 2 3-1 1a8 8 0 0 0 4 4l1-1 3 2c-1 3-4 2-6 1s-5-5-4-8Z"/></svg>';
function contacts(person,requestId){const p=A.international(person?.phone);if(!p)return '<div class="wf-row"><span class="wf-contact whatsapp" aria-disabled="true" title="رقم التواصل غير متوفر">'+waSVG+'</span><span class="wf-contact" aria-disabled="true" title="رقم التواصل غير متوفر">'+phoneSVG+'</span><span class="wf-help">رقم التواصل غير متوفر في بيانات هذا الحساب.</span></div>';return '<div class="wf-row"><a class="wf-contact whatsapp" href="https://wa.me/'+p.slice(1)+'?text='+encodeURIComponent("السلام عليكم، بخصوص معاملة وكيل "+requestId)+'" target="_blank" rel="noopener noreferrer" aria-label="التواصل مع '+esc(person.fullName)+' عبر واتساب" title="واتساب">'+waSVG+'</a><a class="wf-contact" href="tel:'+p+'" aria-label="الاتصال بـ'+esc(person.fullName)+'" title="اتصال">'+phoneSVG+'</a></div>';}
function methodForm(methodId=null,done=()=>{}){
const m=D.state.methods.find(m=>m.id===methodId);
open(m?"تحديث طريقة الدفع":"إضافة بطاقة تجريبية",'<form id="wfMethodForm" class="wf-form"><p class="wf-help">بطاقات اختبار فقط، دون إدخال أو حفظ بيانات بطاقة حقيقية.</p><label>اسم صاحب البطاقة<input id="wfHolder" required minlength="2" maxlength="90" value="'+esc(m?.holder||D.profile("client").fullName)+'"></label><label>بطاقة الاختبار<select id="wfTestCard"><option value="demo-visa">Visa ···· 4242 — دفع ناجح</option><option value="demo-mastercard">Mastercard ···· 4444 — دفع ناجح</option><option value="demo-declined">Visa ···· 0002 — تجربة رفض الدفع</option></select></label><div class="wf-grid"><label>شهر الانتهاء<select id="wfExpiryMonth"></select></label><label>سنة الانتهاء<select id="wfExpiryYear"></select></label></div><button class="wf-button primary" type="submit">حفظ البطاقة التجريبية</button></form>');
const now=new Date();for(let i=1;i<=12;i++)$("wfExpiryMonth").add(new Option(String(i).padStart(2,"0"),String(i)));for(let i=now.getFullYear();i<=now.getFullYear()+15;i++)$("wfExpiryYear").add(new Option(String(i),String(i)));
$("wfTestCard").value=m?.testCard||"demo-visa";$("wfExpiryMonth").value=String(m?.expiryMonth||now.getMonth()+1);$("wfExpiryYear").value=String(m?.expiryYear||now.getFullYear()+2);
$("wfMethodForm").addEventListener("submit",e=>{e.preventDefault();const result=D.addMethod({holder:$("wfHolder").value.trim(),testCard:$("wfTestCard").value,month:Number($("wfExpiryMonth").value),year:Number($("wfExpiryYear").value)},methodId);if(check(result,"تم حفظ طريقة الدفع التجريبية.")){dialog.close();done(result.value);}});
}
function methodPanel(container){function render(){const methods=D.state.methods;container.innerHTML='<div class="wf-card-heading"><h3>طرق الدفع</h3><button class="wf-button primary" id="wfAddMethod" type="button">إضافة طريقة دفع</button></div><p class="wf-help">البطاقات المحفوظة تجريبية. مرجع الفاتورة خاص بكل معاملة ويظهر في قسم الدفع.</p>'+(methods.length?methods.map(m=>'<article class="wf-card"><div class="wf-card-heading"><strong>'+esc(m.brand)+' ···· '+esc(m.last4)+'</strong>'+(m.isDefault?badge("paid","الافتراضية"):"")+'</div><p>'+esc(m.holder)+' · '+m.expiryMonth+'/'+m.expiryYear+'</p><div class="wf-row"><button class="wf-button" data-edit="'+m.id+'" type="button">تحديث</button>'+(!m.isDefault?'<button class="wf-button" data-default="'+m.id+'" type="button">تعيين افتراضية</button>':"")+'<button class="wf-button danger" data-remove="'+m.id+'" type="button">حذف</button></div></article>').join(""):'<div class="wf-empty">لم تضف بطاقة تجريبية بعد.</div>');$("wfAddMethod").addEventListener("click",()=>methodForm(null,render));}
container.addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),def=e.target.closest("[data-default]"),remove=e.target.closest("[data-remove]");if(edit)methodForm(edit.dataset.edit,render);if(def&&check(D.defaultMethod(def.dataset.default),"تم تحديث الطريقة الافتراضية."))render();if(remove){open("حذف البطاقة المحفوظة",'<p>يبقى سجل المدفوعات السابقة محفوظًا بعد حذف البطاقة.</p><button class="wf-button danger" type="button" id="wfConfirmRemove">تأكيد الحذف</button>');$("wfConfirmRemove").addEventListener("click",()=>{if(check(D.removeMethod(remove.dataset.remove),"تم حذف البطاقة.")){dialog.close();render();}});}});
window.addEventListener("wakeel:change",render);render();
}
function checkout(requestId){
const r=D.request(requestId),p=D.paymentForRequest(requestId);if(!r||!p){toast("لا توجد مطالبة دفع مرتبطة بهذه المعاملة.");return;}
const offer=D.offer(r.selected),agent=D.person(offer?.agent);
if(p.status==="paid"||p.status==="legacy"){open("سجل الدفع",'<h3>'+esc(r.title)+'</h3><p>'+money(p.amount)+'</p>'+badge(p.status)+'<p class="wf-reference">'+esc(p.receipt||"سجل تجريبي سابق")+'</p><p>'+esc(p.methodSnapshot?.brand||p.methodSnapshot?.label||"")+" "+esc(p.methodSnapshot?.last4||"")+'</p>');return;}
open("إكمال الدفع التجريبي",'<div class="wf-payment-summary"><h3>'+esc(r.title)+'</h3><p>الوكيل: '+esc(agent.fullName)+'</p><strong>'+money(p.amount)+'</strong><p class="wf-help">أتعاب العرض المقبول · لا يتم تحصيل أي أموال أو احتساب رسوم حكومية تلقائيًا.</p></div><form id="wfPayForm" class="wf-form"><label>طريقة الدفع<select id="wfPayType"><option value="card">بطاقة تجريبية</option><option value="bill">مرجع دفع إلكتروني لفاتورة</option></select></label><div id="wfCardFields"><label>البطاقة المحفوظة<select id="wfCardChoice"></select></label><button type="button" id="wfPayAddCard" class="wf-button" style="margin-top:12px">إضافة بطاقة تجريبية</button><label style="margin-top:12px">رمز تحقق تجريبي<input id="wfCvc" type="password" inputmode="numeric" maxlength="3" pattern="123" autocomplete="off" placeholder="123" required></label><small class="wf-help">استخدم 123 للتجربة. لا يُحفظ هذا الرمز.</small></div><div id="wfBillFields" hidden><p>مرجع الفاتورة الخاص بهذه المعاملة:</p><p class="wf-reference">'+esc(p.billReference)+'</p><label>مرجع الفاتورة لتأكيد السداد التجريبي<input id="wfBillReference" dir="ltr" autocomplete="off" placeholder="انسخ المرجع أعلاه"></label><small class="wf-help">هذا مرجع محاكاة، غير صادر عن إي فواتيركم ولا يمكن دفعه خارج هذه التجربة.</small></div><p id="wfPayStatus" role="status" class="wf-help"></p><div class="wf-row"><button type="submit" class="wf-button primary" id="wfPaySubmit">تأكيد الدفع التجريبي</button><button type="button" class="wf-button" id="wfPayCancel">إلغاء</button></div></form>');
const choice=$("wfCardChoice"),methods=D.state.methods;choice.add(new Option(methods.length?"اختر بطاقة":"أضف بطاقة من الإعدادات أو الزر أدناه",""));methods.forEach(m=>choice.add(new Option(m.brand+" ···· "+m.last4,m.id)));choice.value=methods.find(m=>m.isDefault)?.id||"";$("wfPayType").value=p.methodType==="bill"?"bill":"card";
function toggle(){const bill=$("wfPayType").value==="bill";$("wfBillFields").hidden=!bill;$("wfCardFields").hidden=bill;$("wfCvc").required=!bill;$("wfBillReference").required=bill;$("wfCardChoice").required=!bill;}
$("wfPayType").addEventListener("change",toggle);toggle();
$("wfPayAddCard").addEventListener("click",()=>methodForm(null,()=>checkout(requestId)));
$("wfPayCancel").addEventListener("click",()=>{cancelAttempt();dialog.close();toast("أُلغيت تجربة الدفع، والمعاملة تبقى بانتظار الدفع.");});
$("wfPayForm").addEventListener("submit",async e=>{
e.preventDefault();const type=$("wfPayType").value;
if(type==="bill"&&$("wfBillReference").value.trim()!==p.billReference){$("wfPayStatus").textContent="مرجع الفاتورة لا يطابق هذه المعاملة.";return;}
if(type==="card"&&$("wfCvc").value!=="123"){$("wfPayStatus").textContent="استخدم رمز التحقق التجريبي 123.";return;}
const result=D.beginPayment(requestId,type,$("wfCardChoice").value);if(!check(result))return;
const request=result.value;activeAttempt=request;$("wfPaySubmit").disabled=true;$("wfPayType").disabled=true;$("wfPayStatus").textContent="جاري معالجة تجربة الدفع…";$("wfCvc").value="";
try{const response=await WakeelPaymentProvider.pay(request);const finish=D.finishPayment(request.payment.id,request.attempt.id,response.result);if(activeAttempt?.attempt.id===request.attempt.id)activeAttempt=null;if(!check(finish))return;
if(response.result==="success"&&finish.value.status==="paid"){
open("نجحت تجربة الدفع",'<div class="wf-receipt"><h3>تم تسجيل الدفع التجريبي</h3><p>'+esc(r.title)+' · '+money(p.amount)+'</p><p class="wf-reference">'+esc(finish.value.receipt)+'</p></div><p>أصبحت المعاملة قيد التنفيذ. الإيصال محفوظ في سجل المدفوعات.</p><a class="wf-button primary" href="../master-my-requests/my-requests.html">متابعة معاملاتي</a>');
}else if(dialog.open){checkout(requestId);$("wfPayStatus").textContent=response.result==="cancelled"?"أُلغيت المحاولة. يمكنك المحاولة مجددًا.":"رُفضت بطاقة الاختبار. اختر بطاقة نجاح أو استخدم مرجع الفاتورة.";}
}catch{D.finishPayment(request.payment.id,request.attempt.id,"cancelled");activeAttempt=null;toast("تعذرت معالجة التجربة. حاول مجددًا.");}
});
}
window.WakeelFlow={$,esc,money,date,badge,labels,toast,open,close,check,enhance,fillSelect,contacts,methodForm,methodPanel,checkout,refreshSelect:select=>selects.get(select)?.refresh()};
})();