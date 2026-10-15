/* Navigation and identity only; request state lives in the shared workflow model. */
(() => {"use strict";const D=WakeelData,A=WakeelAccount;
function links(){document.querySelectorAll(".sidebar .side-nav").forEach((nav,index)=>{if(index!==0||nav.querySelector("[data-posted-link]"))return;const link=document.createElement("a");link.className="nav-item";link.dataset.postedLink="true";link.href="../master-posted-requests/posted-requests.html";link.innerHTML='<svg aria-hidden="true"><use href="#i-file"></use></svg> المعاملات المطروحة';if(location.pathname.endsWith("/posted-requests.html")){link.classList.add("current");link.setAttribute("aria-current","page");}nav.insertBefore(link,nav.querySelector('a[href*="master-my-requests"]')||nav.firstChild);});
const mobile=document.querySelector("#shared-navbar .mobile-navigation-panel");if(mobile&&!mobile.querySelector("[data-posted-link]")){const a=document.createElement("a");a.dataset.postedLink="true";a.href="../master-posted-requests/posted-requests.html";a.textContent="المعاملات المطروحة";mobile.append(a);}
document.querySelectorAll("#shared-navbar .nav-user span").forEach(el=>el.textContent=D.profile("client").fullName);
document.querySelectorAll('a[href="request-details.html"],a[href^="request-details.html?"],a[href="my-requests.html"]').forEach(a=>{const href=a.getAttribute("href");a.setAttribute("href",href.startsWith("request-details")?"../master-request-details/"+href:"../master-my-requests/"+href);});
}
window.addEventListener("wakeel:change",links);document.addEventListener("wakeel:shared-ready",links);links();
})();