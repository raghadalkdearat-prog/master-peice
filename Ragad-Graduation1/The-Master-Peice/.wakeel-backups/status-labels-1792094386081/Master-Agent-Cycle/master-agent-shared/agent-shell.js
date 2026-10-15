
(() => {
"use strict";
const D=window.AgentData, $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const icon=name=>'<svg aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
const paths={dashboard:"master-agent-dash/dashboard.html",requests:"master-agent-requests/requests.html","my-requests":"master-agent-my-requests/my-requests.html","request-details":"master-agent-request-details/request-details.html",payments:"master-agent-payments/payments.html",notifications:"master-agent-notifications/notifications.html",profile:"master-agent-profile-settings/profile.html",reviews:"master-agent-reviews/reviews.html",support:"master-agent-support/support.html"};
const href=(page,id)=>"../"+paths[page]+(id?"?id="+encodeURIComponent(id):"");
const money=n=>Number(n).toLocaleString("ar-JO",{maximumFractionDigits:2})+" د.أ";
const date=value=>{const d=new Date(value);return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("ar-JO",{timeZone:"Asia/Amman",year:"numeric",month:"short",day:"numeric"}).format(d);};
const labels={suspended:"موقوفة",cancelled:"ملغاة",blocked:"محظور",refunded:"مستردة","awaiting-payment":"بانتظار دفع العميل",held:"قيد التنفيذ",open:"متاح للعروض",pending:"بانتظار القبول",active:"قيد التنفيذ",completed:"مكتملة",published:"بانتظار العروض",rejected:"غير مقبول",withdrawn:"مسحوب",accepted:"مقبول",settled:"تمت التسوية",closed:"مغلقة"};
const badge=status=>'<span class="status '+esc(status)+'">'+esc(labels[status]||status)+'</span>';
const empty=(title="لا توجد نتائج مطابقة",hint="غيّر البحث أو الفلاتر لعرض نتائج أخرى.")=>'<div class="empty-state">'+icon("file")+'<strong>'+esc(title)+'</strong><p>'+esc(hint)+'</p></div>';
function toast(message){$("agentToast").textContent=message;$("agentToast").hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("agentToast").hidden=true,4000);}
const dialog=$("agentDialog");
function openDialog(title,body){$("agentDialogTitle").textContent=title;$("agentDialogBody").innerHTML=body;dialog.showModal();}
function closeDialog(){dialog.close();}
dialog.querySelector("[data-close-dialog]").addEventListener("click",closeDialog);
dialog.addEventListener("click",e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
function confirmAction(title,message,action){openDialog(title,'<p class="long-text">'+esc(message)+'</p><div class="action-row"><button class="button primary" id="confirmAction" type="button">تأكيد</button><button class="button secondary" id="cancelAction" type="button">إلغاء</button></div>');$("confirmAction").addEventListener("click",()=>{closeDialog();action();});$("cancelAction").addEventListener("click",closeDialog);}
function metrics(items){$("metrics").innerHTML=items.map((x,i)=>'<article class="metric"><div class="metric-top"><span class="metric-icon '+["","violet","green","orange"][i%4]+'">'+icon(x[2]||"file")+'</span><span class="metric-context">مساحة الوكيل</span></div><div class="metric-number">'+esc(x[1])+'</div><div class="metric-bottom"><strong>'+esc(x[0])+'</strong><span>'+esc(x[3]||"بيانات العرض التجريبي")+'</span></div></article>').join("");}
function options(id,values){const el=$(id);values.forEach(v=>{const option=document.createElement("option");option.value=v;option.textContent=v;el.append(option);});}
function table(rows){if(!rows.length)return empty("لا توجد معاملات هنا","تصفح الطلبات المتاحة لتقديم عرض جديد.");return '<div class="table-scroll"><table><thead><tr><th>المعاملة</th><th>العميل</th><th>قيمة العرض</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>'+rows.map(r=>{const o=D.offer(r.id);return '<tr><td><strong>'+esc(r.title)+'</strong><small>'+esc(r.id+" · "+r.category+" · "+r.city)+'</small></td><td>'+esc(r.client)+'</td><td>'+money(o?.price||0)+'</td><td>'+badge(D.status(r))+(window.WakeelFlow?.adminNotice(r,true)||'')+'</td><td><a class="text-action" href="'+href("request-details",r.id)+'">عرض التفاصيل</a></td></tr>';}).join("")+'</tbody></table></div>';}
function card(r){const o=D.offer(r.id);return '<article class="request-card"><div class="card-heading"><span class="count-pill">'+esc(r.category)+'</span>'+badge(D.status(r))+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p><div class="request-meta"><span>'+icon("pin")+esc(r.city)+'</span><span>'+icon("clock")+date(r.deadline)+'</span><span>'+esc(r.id)+'</span></div><div class="card-footer"><strong>الميزانية '+money(r.budget)+'</strong><a class="button secondary" href="'+href("request-details",r.id)+'">'+(o&&o.status!=="withdrawn"?"عرض التفاصيل":"راجع الطلب وقدم عرضًا")+'</a></div></article>';}
function timeline(stage){return '<div class="timeline">'+["تم قبول العرض","بدء التنفيذ","متابعة الإجراءات","إتمام المعاملة"].map((t,i)=>'<div class="track-step '+(i<=stage?"done":"")+'"><span class="track-mark">'+(i<=stage?"✓":i+1)+'</span><div><strong>'+t+'</strong><small>'+(i<=stage?"تم الوصول إلى هذه المرحلة":"بانتظار التقدم")+'</small></div></div>').join("")+'</div>';}
async function loadShared(){
 const mapping={"master-profile-settings/profile.html":href("profile"),"master-client-dash/client-dash.html":href("dashboard"),"master-my-requests/my-requests.html":href("my-requests"),"master-creat-request/creat-request.html":href("requests")};
 const targets=[["shared-navbar","nav.html"],["shared-footer","footer.html"]];
 await Promise.all(targets.map(async ([id,file])=>{
  try{
   const res=await fetch("../../Master-Client-Cycle/shared/"+file);
   if(!res.ok)throw new Error("Shared component unavailable");
   const template=document.createElement("template");template.innerHTML=await res.text();
   template.content.querySelectorAll("a[href]").forEach(a=>{
    const link=a.getAttribute("href");
    for(const [tail,replacement] of Object.entries(mapping))if(link.endsWith(tail)){a.setAttribute("href",replacement);if(tail.startsWith("master-creat-request"))a.textContent="الطلبات المتاحة";}
   });
   $(id).replaceChildren(template.content);
  }catch{
   $(id).innerHTML='<p class="error-box">تعذر تحميل '+(file==="nav.html"?"شريط التنقل":"التذييل")+'. شغّل الصفحة عبر Live Server.</p>';
  }
 }));
 syncIdentity();
 const mobile=$("shared-navbar").querySelector(".mobile-navigation-panel");
 if(mobile){
  const client=document.createElement("a");client.href="../../Master-Client-Cycle/master-client-dash/client-dash.html";client.textContent="مساحة العميل";mobile.append(client);
  mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobile.closest("details").open=false;}));
 }
 document.addEventListener("keydown",e=>{if(e.key==="Escape"){const menu=$("shared-navbar").querySelector("details[open]");if(menu){menu.open=false;menu.querySelector("summary").focus();}}});
}
function syncIdentity(){document.querySelectorAll("#shared-navbar .nav-user span").forEach(el=>el.textContent=D.state.profile.name);}
function panel(title,body){return '<section class="panel"><div class="panel-heading"><h2>'+esc(title)+'</h2></div><div class="panel-body">'+body+'</div></section>';}
window.AgentUI={panel,$,esc,icon,href,money,date,badge,empty,toast,openDialog,closeDialog,confirmAction,metrics,options,table,card,timeline,syncIdentity};
if(!D.storageAvailable){$("storageError").hidden=false;$("storageError").textContent="تعذر قراءة البيانات المحلية. تُعرض البيانات الافتراضية؛ قد تحتاج إلى السماح بالتخزين المحلي.";}
window.addEventListener("wakeel:change",syncIdentity);
loadShared();
})();

