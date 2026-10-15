(() => {"use strict";const D=AdminData,U=AdminUI;if(!U.guard("settings.view"))return;
function render(){const actor=D.actor;U.$("name").value=actor.name;U.$("email").value=actor.email;U.$("managerName").textContent="مدير المنصة";U.$("managerEmail").textContent=actor.email;
U.$("preferencesForm").querySelectorAll("input").forEach(input=>input.checked=Boolean(actor.preferences[input.name]));
const groups=[["المستخدمون والوكلاء",["users.","agents."]],["المعاملات والمدفوعات",["requests.","offers.","payments."]],["الدعم والمتابعة",["support.","notifications.","audit."]],["إعدادات المنصة",["services.","settings.","dashboard."]]];
U.$("managerPermissions").innerHTML=groups.map(([title,prefixes])=>'<article class="manager-permission-group"><h3>'+title+'</h3>'+Object.entries(D.permissions).filter(([key])=>prefixes.some(p=>key.startsWith(p))).map(([key,label])=>'<div><span class="manager-check" aria-hidden="true">✓</span>'+U.esc(label)+'</div>').join("")+'</article>').join("");U.syncIdentity();
}
U.$("profileForm").addEventListener("submit",ev=>{ev.preventDefault();if(U.run("admin.profile",{name:"مدير المنصة",email:U.$("email").value.trim()})){U.toast("تم تحديث بيانات مدير المنصة.");render();}});
U.$("preferencesForm").addEventListener("submit",ev=>{ev.preventDefault();const preferences={};ev.currentTarget.querySelectorAll("input").forEach(i=>preferences[i.name]=i.checked);if(U.run("admin.preferences",{preferences}))U.toast("تم حفظ تفضيلات التنبيهات.");});render();
})();