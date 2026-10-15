
(() => {
"use strict";
const D=AdminData,$=id=>document.getElementById(id),esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const paths={dashboard:"master-admin-dash/dashboard.html",users:"master-admin-users/users.html",requests:"master-admin-requests/requests.html","request-details":"master-admin-request-details/request-details.html",payments:"master-admin-payments/payments.html",support:"master-admin-support/support.html",reviews:"master-admin-reviews/reviews.html",notifications:"master-admin-notifications/notifications.html",services:"master-admin-services/services.html",settings:"master-admin-settings/settings.html",audit:"master-admin-audit/audit.html"};
const labels={active:"نشط",open:"بانتظار العروض",pending:"بانتظار المراجعة",approved:"معتمد في التجربة",rejected:"غير معتمد",suspended:"موقوف",cancelled:"ملغى",completed:"مكتمل",held:"محجوز",settled:"تمت التسوية",refunded:"مسترد",blocked:"موقوف",visible:"ظاهر",hidden:"مخفي",disabled:"معطل",accepted:"مقبول","in-progress":"قيد المعالجة",closed:"مغلق",normal:"عادية",high:"عالية",review:"بانتظار المراجعة",client:"عميل",agent:"مقدم خدمة"};
const icon=n=>'<svg aria-hidden="true"><use href="#i-'+n+'"></use></svg>',href=(page,id)=>"../"+paths[page]+(id?"?id="+encodeURIComponent(id):"");
const money=n=>Number(n).toLocaleString("ar-JO",{maximumFractionDigits:2})+" د.أ";
const date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"—":new Intl.DateTimeFormat("ar-JO",{timeZone:"Asia/Amman",day:"numeric",month:"short",year:"numeric"}).format(d);};
const badge=(status,text)=>'<span class="status '+esc(status)+'">'+esc(text||labels[status]||status)+'</span>';
const empty=(title="لا توجد نتائج مطابقة",hint="غيّر البحث أو الفلاتر لعرض سجلات أخرى.")=>'<div class="empty-state">'+icon("file")+'<strong>'+esc(title)+'</strong><p>'+esc(hint)+'</p></div>';
const dialog=$("adminDialog");
function toast(text){$("adminToast").textContent=text;$("adminToast").hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("adminToast").hidden=true,4000);}
function openDialog(title,body){$("adminDialogTitle").textContent=title;$("adminDialogBody").innerHTML=body;if(!dialog.open)dialog.showModal();}
function closeDialog(){dialog.close();}
dialog.querySelector("[data-close-dialog]").addEventListener("click",closeDialog);
dialog.addEventListener("click",e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();});
function guard(permission){const allowed=D.can(permission);$("pageContent").hidden=!allowed;$("accessDenied").hidden=allowed;return allowed;}
function applyPermissions(scope=document){scope.querySelectorAll("[data-permission]").forEach(el=>el.hidden=!D.can(el.dataset.permission));}
function run(action,params,done){const result=D.execute(action,params);if(!result.ok){toast(result.error);return false;}if(done)done();return true;}
function reasonDialog(title,action,params,description,done,extra="",readExtra=()=>({})){
openDialog(title,'<form class="dialog-form" id="reasonForm"><p class="muted">'+esc(description)+'</p>'+extra+'<label>سبب الإجراء<textarea id="actionReason" rows="3" required minlength="5" maxlength="1000" placeholder="اكتب سببًا واضحًا للمراجعة"></textarea></label><div class="action-row"><button class="button primary" type="submit">تأكيد الإجراء</button><button class="button secondary" id="cancelAction" type="button">إلغاء</button></div></form>');
$("cancelAction").addEventListener("click",closeDialog);
$("reasonForm").addEventListener("submit",e=>{e.preventDefault();const reason=$("actionReason").value.trim();if(reason.length<5){toast("أدخل سببًا من 5 أحرف على الأقل.");return;}if(run(action,{...params,...readExtra(),reason})){closeDialog();toast("تم حفظ الإجراء في بيانات الإدارة وسجله.");done?.();}});
}
function metrics(items){$("metrics").innerHTML=items.map((x,i)=>'<article class="metric"><div class="metric-top"><span class="metric-icon '+["","violet","green","orange"][i%4]+'">'+icon(x[2]||"file")+'</span><span class="metric-context">مساحة الإدارة</span></div><div class="metric-number">'+esc(x[1])+'</div><div class="metric-bottom"><strong>'+esc(x[0])+'</strong><span>'+esc(x[3]||"بيانات العرض التجريبي")+'</span></div></article>').join("");}
function options(id,items){const el=$(id);items.forEach(item=>{const [value,title]=Array.isArray(item)?item:[item,item];const o=document.createElement("option");o.value=value;o.textContent=title;el.append(o);});}
function bindFilters(ids,render){ids.forEach(id=>$(id).addEventListener($(id).type==="search"?"input":"change",render));$("resetFilters")?.addEventListener("click",()=>{ids.forEach(id=>{$(id).value=$(id).type==="search"?"":"all";});render();});}
function table(headers,rows){return rows.length?'<div class="table-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(cells=>'<tr>'+cells.map(c=>'<td>'+c+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':empty();}
const detailLink=id=>'<a class="text-action" href="'+href("request-details",id)+'">التفاصيل</a>';
function requestTable(rows){return table(["المعاملة","العميل","الوكيل","الحالة","إجراء"],rows.map(r=>['<strong>'+esc(r.title)+'</strong><small>'+esc(r.id+" · "+D.serviceName(r.service)+" · "+r.city)+'</small>',esc(D.userName(r.client)),esc(D.userName(D.selectedAgent(r))),badge(r.status,r.status==="active"?"قيد التنفيذ":r.status==="open"?"بانتظار العروض":null),detailLink(r.id)]));}
function panel(title,body){return '<section class="panel"><div class="panel-heading"><h2>'+esc(title)+'</h2></div><div class="panel-body">'+body+'</div></section>';}
function button(text,action,permission,extra=""){return D.can(permission)?'<button class="button secondary" type="button" data-action="'+action+'" '+extra+'>'+esc(text)+'</button>':"";}
function syncIdentity(){const a=D.actor;document.querySelectorAll("#shared-navbar .nav-user span").forEach(el=>el.textContent=a.name);$("actorRole").textContent=D.state.roles.find(r=>r.id===a.role)?.name||"حساب إدارة";}
async function loadShared(){
const mapping={"master-profile-settings/profile.html":href("settings"),"master-client-dash/client-dash.html":href("dashboard"),"master-my-requests/my-requests.html":href("requests"),"master-creat-request/creat-request.html":href("users")};
await Promise.all([["shared-navbar","nav.html"],["shared-footer","footer.html"]].map(async([id,file])=>{
try{const r=await fetch("../../Master-Client-Cycle/shared/"+file);if(!r.ok)throw new Error("Shared unavailable");const template=document.createElement("template");template.innerHTML=await r.text();template.content.querySelectorAll("a[href]").forEach(a=>{const link=a.getAttribute("href");for(const [tail,value]of Object.entries(mapping))if(link.endsWith(tail)){a.href=value;if(tail.startsWith("master-my-requests"))a.textContent="إدارة المعاملات";if(tail.startsWith("master-creat-request"))a.textContent="إدارة المستخدمين";}});$(id).replaceChildren(template.content);}
catch{$(id).innerHTML='<p class="error-box">تعذر تحميل '+(file==="nav.html"?"شريط التنقل":"التذييل")+'. شغّل الصفحة عبر Live Server.</p>';}
}));
const mobile=$("shared-navbar").querySelector(".mobile-navigation-panel");
if(mobile){mobile.querySelectorAll('a[href^="../master-admin-"]').forEach(a=>a.remove());document.querySelectorAll(".sidebar .side-nav a").forEach(a=>{if(!a.hidden){const link=document.createElement("a");link.href=a.getAttribute("href");link.textContent=a.textContent;mobile.append(link);}});for(const [text,url]of [["مساحة العميل","../../Master-Client-Cycle/master-client-dash/client-dash.html"],["مساحة الوكيل","../../Master-Agent-Cycle/master-agent-dash/dashboard.html"]]){const a=document.createElement("a");a.href=url;a.textContent=text;mobile.append(a);}mobile.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobile.closest("details").open=false));}
syncIdentity();
}
window.AdminUI={$,esc,icon,href,money,date,badge,empty,toast,openDialog,closeDialog,guard,applyPermissions,run,reasonDialog,metrics,options,bindFilters,table,requestTable,panel,button,detailLink,syncIdentity,labels};
applyPermissions();syncIdentity();
if(!D.storageAvailable){$("storageError").hidden=false;$("storageError").textContent="تعذر قراءة البيانات المحلية؛ تُعرض البيانات الافتراضية. تحقق من السماح بالتخزين المحلي.";}
document.addEventListener("keydown",e=>{if(e.key==="Escape"){const menu=$("shared-navbar").querySelector("details[open]");if(menu){menu.open=false;menu.querySelector("summary").focus();}}});
loadShared();
})();
