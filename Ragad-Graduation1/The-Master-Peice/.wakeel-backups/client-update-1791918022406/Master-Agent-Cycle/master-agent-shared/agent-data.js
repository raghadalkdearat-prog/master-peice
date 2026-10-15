/* Compatibility view over the shared Client/Agent request lifecycle. */
(() => {"use strict";const D=WakeelData,A=WakeelAccount,clone=x=>JSON.parse(JSON.stringify(x));
function view(){const s=D.state,p=s.profiles.agent;
return {profile:{...p,name:p.fullName,city:A.cityName(p.city),coverage:(p.coverage||[]).map(A.cityName)},preferences:s.preferences.agent,
requests:s.requests.map(r=>({...r,client:D.person(r.owner).fullName,city:A.cityName(r.city),status:r.status==="published"?"open":r.status})),
offers:s.offers.filter(o=>o.agent==="agent-1"),payments:s.payments.filter(p=>D.offer(p.offer)?.agent==="agent-1").map(p=>({...p,status:p.entitlement})),
reviews:s.agentReviews||[],notifications:s.notifications.filter(n=>n.role==="agent"),tickets:s.agentTickets||[]};
}
window.AgentData={get state(){return clone(view());},get storageAvailable(){return D.storageAvailable;},get categories(){return [...new Set([...["معاملات المركبات","العقارات والأراضي","معاملات الشركات","الوثائق والمستندات","التراخيص"],...D.state.requests.map(r=>r.category).filter(Boolean)])];},cities:A.provinces.map(p=>p.name),
request:key=>clone(view().requests.find(r=>r.id===String(key))||null),offer:key=>D.ownOffer(key),
status:r=>{const raw=D.request(r.id),o=D.ownOffer(r.id);if(o?.status==="accepted")return raw.status==="published"?"open":raw.status;return o?.status||"open";},
mutate:change=>{const before=view(),after=clone(before);change(after);
if(JSON.stringify(before.tickets)!==JSON.stringify(after.tickets))return WakeelFlow.check(D.updateAgentTickets(after.tickets));
if(JSON.stringify(before.notifications)!==JSON.stringify(after.notifications))return WakeelFlow.check(D.updateNotices("agent",()=>after.notifications));
if(JSON.stringify(before.preferences)!==JSON.stringify(after.preferences))return WakeelFlow.check(D.savePreferences("agent",after.preferences));
if(JSON.stringify(before.profile)!==JSON.stringify(after.profile))return WakeelFlow.check(D.saveProfile("agent",{...after.profile,fullName:after.profile.name}));
return false;
}
};})();