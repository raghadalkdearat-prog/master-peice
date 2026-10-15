
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("settings.view"))return;
function render(){
const a=D.actor,s=D.state;U.$("name").value=a.name;U.$("email").value=a.email;
U.$("profileForm").querySelectorAll("input,button").forEach(c=>c.disabled=!D.can("settings.edit"));
U.$("preferencesForm").querySelectorAll("input").forEach(c=>{c.checked=Boolean(a.preferences[c.name]);c.disabled=!D.can("settings.edit");});
U.$("preferencesForm").querySelector("button").disabled=!D.can("settings.edit");
U.$("rolesList").innerHTML=s.roles.map(r=>'<article class="role-card"><div class="card-heading"><h3>'+U.esc(r.name)+'</h3>'+(r.id!=="root"?U.button("تعديل الصلاحيات","permissions","roles.manage",'data-role="'+U.esc(r.id)+'"'):'<span class="count-pill">صلاحيات ثابتة</span>')+'</div><p>'+r.permissions.length+' صلاحيات</p>'+(r.id===a.role?'<span class="count-pill">دور الحساب الحالي</span>':"")+'</article>').join("");
U.$("adminsTable").innerHTML=D.can("roles.manage")?U.table(["الحساب الإداري","الدور","الحالة","إجراء"],s.admins.map(x=>[U.esc(x.name),U.esc(s.roles.find(r=>r.id===x.role)?.name),U.badge(x.status),x.id!==a.id?'<button class="button secondary" type="button" data-admin="'+U.esc(x.id)+'">تغيير الدور</button>':'<span class="muted">حسابك الحالي</span>'])):U.empty("تعديل حسابات الإدارة غير متاح","إدارة الأدوار تحتاج الصلاحية المخصصة لها.");
U.$("sessionActor").replaceChildren();U.options("sessionActor",s.admins.filter(x=>x.status==="active").map(x=>[x.id,x.name+" · "+s.roles.find(r=>r.id===x.role)?.name]));U.$("sessionActor").value=a.id;U.syncIdentity();
}
U.$("profileForm").addEventListener("submit",e=>{e.preventDefault();if(U.run("admin.profile",{name:U.$("name").value.trim(),email:U.$("email").value.trim()})){U.toast("تم حفظ الملف الإداري.");render();}});
U.$("preferencesForm").addEventListener("submit",e=>{e.preventDefault();const preferences={};e.currentTarget.querySelectorAll("input").forEach(c=>preferences[c.name]=c.checked);if(U.run("admin.preferences",{preferences}))U.toast("تم حفظ التفضيلات.");});
U.$("rolesList").addEventListener("click",e=>{const b=e.target.closest("[data-role]");if(!b)return;const r=D.get("roles",b.dataset.role);
U.openDialog("صلاحيات "+r.name,'<form id="permissionsForm" class="dialog-form"><div class="permission-grid">'+Object.entries(D.permissions).map(([key,title])=>'<label class="check"><input type="checkbox" name="permission" value="'+key+'" '+(r.permissions.includes(key)?"checked":"")+'>'+U.esc(title)+'</label>').join("")+'</div><label>سبب تعديل الصلاحيات<textarea id="permissionReason" required minlength="5" maxlength="1000" rows="3"></textarea></label><p class="muted">تبقى لوحة التحكم والإعدادات متاحة. حماية الصلاحيات الفعلية تحتاج خادمًا.</p><button class="button primary" type="submit">حفظ الصلاحيات</button></form>');
U.$("permissionsForm").addEventListener("submit",event=>{event.preventDefault();const reason=U.$("permissionReason").value.trim(),permissions=new FormData(event.currentTarget).getAll("permission");if(U.run("role.permissions",{id:r.id,permissions,reason})){U.closeDialog();U.toast("تم تحديث صلاحيات الدور.");render();}});
});
U.$("adminsTable").addEventListener("click",e=>{const b=e.target.closest("[data-admin]");if(!b)return;const a=D.get("admins",b.dataset.admin);
U.reasonDialog("تغيير دور "+a.name,"admin.role",{id:a.id},"لا يمكن تغيير دور الحساب الحالي، ويجب الحفاظ على مسؤول إدارة كاملة نشط.",render,'<label>الدور الجديد<select id="adminRole"></select></label>',()=>({role:U.$("adminRole").value}));U.options("adminRole",D.state.roles.map(r=>[r.id,r.name]));U.$("adminRole").value=a.role;
});
U.$("switchActor").addEventListener("click",()=>{if(U.run("session.switch",{id:U.$("sessionActor").value}))location.reload();});
render();
})();
