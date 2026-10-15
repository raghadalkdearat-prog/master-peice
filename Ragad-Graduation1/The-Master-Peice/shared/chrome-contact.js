/* Shared profile avatar and editable footer destinations. */
(() => {"use strict";
const role=()=>location.pathname.includes("/Master-Admin-Cycle/")?"admin":location.pathname.includes("/Master-Agent-Cycle/")?"agent":"client";
function profile(){const r=role();return r==="admin"?(window.AdminData?.actor||{name:"مدير المنصة",email:"admin@wakeel.test"}):WakeelData.profile(r);}
function refresh(){const p=profile(),name=p.fullName||p.name||"حسابي";document.querySelectorAll("#shared-navbar .nav-user").forEach(a=>{a.classList.add("profile-orb");a.setAttribute("aria-label","الملف الشخصي — "+name);a.title=name;const monogram=a.querySelector(".profile-monogram");if(monogram)monogram.textContent=name.trim().split(/\s+/).slice(0,2).map(v=>v[0]).join("");a.querySelector(".profile-name")?.setAttribute("data-role",role());});
document.querySelectorAll("[data-wakeel-social]").forEach(a=>{const url=WakeelContacts.social[a.dataset.wakeelSocial];if(url&&/^https:\/\//.test(url)){a.href=url;a.removeAttribute("aria-disabled");}else{a.href="#";a.setAttribute("aria-disabled","true");}});
}
document.addEventListener("click",ev=>{const link=ev.target.closest("[data-wakeel-social]");if(link&&link.getAttribute("aria-disabled")==="true")ev.preventDefault();});
document.addEventListener("wakeel:shared-ready",refresh);window.addEventListener("wakeel:change",refresh);
const node=document.getElementById("shared-navbar"),foot=document.getElementById("shared-footer");if(node)new MutationObserver(refresh).observe(node,{childList:true});if(foot)new MutationObserver(refresh).observe(foot,{childList:true});refresh();
})();