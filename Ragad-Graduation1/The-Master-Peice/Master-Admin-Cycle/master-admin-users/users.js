
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("users.view"))return;
function render(){const s=D.state,q=U.$("search").value.trim().toLowerCase(),type=U.$("type").value,status=U.$("status").value;
U.metrics([["العملاء",s.users.filter(u=>u.type==="client").length,"users"],["مقدمو الخدمة",s.users.filter(u=>u.type==="agent").length,"user"],["بانتظار المراجعة",s.users.filter(u=>u.approval==="pending").length,"clock"],["حسابات معلقة",s.users.filter(u=>u.status==="suspended").length,"shield"]]);
const rows=s.users.filter(u=>(type==="all"||u.type===type)&&(status==="all"||u.status===status)&&(u.name+" "+u.id+" "+u.email+" "+u.city).toLowerCase().includes(q));
U.$("usersTable").innerHTML=U.table(["المستخدم","نوع الحساب","الحالة","مراجعة الوكيل","إجراء"],rows.map(u=>['<strong>'+U.esc(u.name)+'</strong><small>'+U.esc(u.id+" · "+u.city)+'</small>',U.esc(U.labels[u.type]),U.badge(u.status),u.type==="agent"?U.badge(u.approval):"—",'<button type="button" class="button secondary" data-user="'+U.esc(u.id)+'">فتح الملف</button>']));
}
function show(id){
const u=D.get("users",id),related=D.state.requests.filter(r=>r.client===id||D.selectedAgent(r)===id);
U.openDialog("ملف "+u.name,'<dl class="detail-meta">'+[["نوع الحساب",U.labels[u.type]],["البريد",u.email],["الهاتف",u.phone],["المحافظة",u.city]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+U.esc(v)+'</dd></div>').join("")+'</dl><div class="action-row">'+U.badge(u.status)+(u.approval?U.badge(u.approval):"")+'</div>'+(u.type==="agent"?'<p>'+U.esc(u.bio||"")+'</p><p>الخدمات: '+U.esc((u.services||[]).map(D.serviceName).join("، "))+'</p><p>التغطية: '+U.esc((u.coverage||[]).join("، "))+'</p><p class="muted">المراجعة تخص معلومات الملف التجريبي، ولا تمثل تحققًا رسميًا من الوثائق.</p>':"")+'<div class="action-row form-actions">'+U.button("تعديل البيانات","edit","users.edit")+U.button(u.status==="active"?"تعليق الحساب":"إعادة التفعيل","suspend","users.suspend")+(u.type==="agent"?U.button("مراجعة ملف الوكيل","review","agents.review"):"")+'</div><h3 style="margin-top:22px">المعاملات المرتبطة</h3>'+ (related.length?related.map(r=>'<div class="event-item"><a class="text-action" href="'+U.href("request-details",r.id)+'">'+U.esc(r.title)+'</a> '+U.badge(r.status)+'</div>').join(""):U.empty("لا توجد معاملات مرتبطة","")));
U.$("adminDialogBody").querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
const finish=()=>{render();show(id);};
if(b.dataset.action==="suspend")U.reasonDialog("تغيير حالة الحساب","user.suspend",{id,status:u.status==="active"?"suspended":"active"},"تغيير الحالة لا يلغي المعاملات النشطة تلقائيًا. عدد المعاملات النشطة المرتبطة: "+related.filter(r=>r.status==="active").length,finish);
if(b.dataset.action==="review")U.reasonDialog("مراجعة ملف الوكيل","agent.review",{id},"سجّل قرار مراجعة بيانات الملف.",finish,'<label>قرار المراجعة<select id="approvalChoice"><option value="approved">اعتماد الملف في التجربة</option><option value="rejected">عدم اعتماد الملف</option><option value="pending">إعادة للمراجعة</option></select></label>',()=>({approval:U.$("approvalChoice").value}));
if(b.dataset.action==="edit"){
U.openDialog("تعديل بيانات المستخدم",'<form id="userForm" class="dialog-form"><label>الاسم<input id="userName" required minlength="2" maxlength="80" value="'+U.esc(u.name)+'"></label><label>البريد<input id="userEmail" type="email" required value="'+U.esc(u.email)+'"></label><label>الهاتف<input id="userPhone" pattern="07[0-9]{8}" required value="'+U.esc(u.phone)+'"></label><label>المحافظة<select id="userCity"></select></label><button class="button primary" type="submit">حفظ البيانات</button></form>');
U.options("userCity",["عمان","إربد","الزرقاء","البلقاء","المفرق","جرش","عجلون","مادبا","الكرك","الطفيلة","معان","العقبة"]);U.$("userCity").value=u.city;
U.$("userForm").addEventListener("submit",e=>{e.preventDefault();if(U.run("user.edit",{id,name:U.$("userName").value.trim(),email:U.$("userEmail").value.trim(),phone:U.$("userPhone").value.trim(),city:U.$("userCity").value})){U.toast("تم حفظ بيانات المستخدم.");finish();}});
}
}));
}
U.bindFilters(["search","type","status"],render);U.$("usersTable").addEventListener("click",e=>{const b=e.target.closest("[data-user]");if(b)show(b.dataset.user);});render();
})();
