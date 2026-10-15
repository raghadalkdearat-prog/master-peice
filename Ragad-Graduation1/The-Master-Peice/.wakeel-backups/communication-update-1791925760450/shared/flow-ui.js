/* Small UI utilities; page layouts continue to use their existing styles. */
(() => {"use strict";const D=WakeelData,A=WakeelAccount,C=WakeelCatalogue;
const $=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.body.classList.add("wakeel-workflow");
const labels={draft:"مسودة",published:"بانتظار العروض","awaiting-payment":"بانتظار الدفع",active:"قيد التنفيذ",completed:"مكتملة",cancelled:"ملغاة",pending:"بانتظار الدفع",processing:"قيد المعالجة",paid:"مدفوعة",failed:"تعذر الدفع",legacy:"سجل سابق",accepted:"مقبول",rejected:"غير مقبول",withdrawn:"مسحوب"};
const money=n=>Number(n||0).toLocaleString("ar-JO",{maximumFractionDigits:2})+" د.أ",date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("ar-JO",{timeZone:"Asia/Amman",day:"numeric",month:"short",year:"numeric"}).format(d);};
const badge=(status,text)=>'<span class="wf-pill '+esc(status)+'">'+esc(text||labels[status]||status)+'</span>';
const dialog=document.createElement("dialog");dialog.id="wfDialog";dialog.className="wf-dialog";dialog.setAttribute("aria-labelledby","wfDialogTitle");dialog.innerHTML='<div class="wf-dialog-header"><h2 id="wfDialogTitle"></h2><button class="wf-close" type="button" aria-label="إغلاق">×</button></div><div id="wfDialogBody"></div>';document.body.append(dialog);
const toastNode=document.createElement("div");toastNode.id="wfToast";toastNode.className="wf-toast";toastNode.hidden=true;toastNode.setAttribute("role","status");document.body.append(toastNode);
let activeAttempt=null;
function cancelAttempt(){if(activeAttempt){WakeelPaymentProvider.cancel(activeAttempt.attempt.id);D.finishPayment(activeAttempt.payment.id,activeAttempt.attempt.id,"cancelled");activeAttempt=null;}}
dialog.querySelector(".wf-close").addEventListener("click",()=>{cancelAttempt();dialog.close();});
dialog.addEventListener("cancel",cancelAttempt);
window.addEventListener("pagehide",cancelAttempt);
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
window.WakeelFlow={$,esc,money,date,badge,labels,toast,open,close,check,enhance,fillSelect,contacts,refreshSelect:select=>selects.get(select)?.refresh()};
})();
