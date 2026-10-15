
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("services.view"))return;
function render(){const q=U.$("search").value.trim().toLowerCase(),status=U.$("status").value,s=D.state,rows=s.services.filter(x=>(status==="all"||x.status===status)&&(x.name+" "+x.id).toLowerCase().includes(q)).sort((a,b)=>a.order-b.order);
U.$("newService").hidden=!D.can("services.manage");
U.$("servicesTable").innerHTML=U.table(["فئة الخدمة","الترتيب","الحالة","المعاملات المرتبطة","إجراء"],rows.map(x=>['<strong>'+U.esc(x.name)+'</strong><small>'+U.esc(x.id)+'</small>',U.esc(x.order),U.badge(x.status,x.status==="active"?"مفعلة":"معطلة"),String(s.requests.filter(r=>r.service===x.id).length),D.can("services.manage")?'<button class="button secondary" type="button" data-service="'+U.esc(x.id)+'">إدارة الفئة</button>':"—"]));
}
function edit(id){const s=id?D.get("services",id):null;
U.openDialog(s?"إدارة فئة الخدمة":"إضافة فئة خدمة",'<form id="serviceForm" class="dialog-form"><label>اسم الفئة<input id="serviceName" required minlength="3" maxlength="80" value="'+U.esc(s?.name||"")+'"></label><label>ترتيب العرض<input id="serviceOrder" type="number" min="1" max="999" step="1" required value="'+(s?.order||D.state.services.length+1)+'"></label><label>الحالة<select id="serviceStatus"><option value="active">مفعلة</option><option value="disabled">معطلة</option></select></label><label>سبب الإجراء<textarea id="serviceReason" required minlength="5" maxlength="1000" rows="3"></textarea></label><p class="muted">تعطيل الفئة لا يحذف المعاملات المرتبطة بها أو تصنيفها الأصلي في السجل.</p><button class="button primary" type="submit">حفظ الفئة</button></form>');U.$("serviceStatus").value=s?.status||"active";
U.$("serviceForm").addEventListener("submit",e=>{e.preventDefault();const reason=U.$("serviceReason").value.trim();if(reason.length<5){U.toast("أضف سببًا واضحًا.");return;}if(U.run("service.save",{id,name:U.$("serviceName").value.trim(),order:Number(U.$("serviceOrder").value),status:U.$("serviceStatus").value,reason})){U.closeDialog();U.toast("تم حفظ الفئة.");render();}});
}
U.$("newService").addEventListener("click",()=>edit(null));U.$("servicesTable").addEventListener("click",e=>{const b=e.target.closest("[data-service]");if(b)edit(b.dataset.service);});U.bindFilters(["search","status"],render);render();
})();
