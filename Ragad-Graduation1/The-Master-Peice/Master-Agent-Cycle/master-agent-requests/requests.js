(() => {"use strict";
const D=AgentData,U=AgentUI,F=WakeelFlow,C=WakeelCatalogue,A=WakeelAccount;
const ministry=U.$("ministry"),province=U.$("governorate"),department=U.$("department");
F.fillSelect(ministry,C.ministries,"كل الوزارات");F.fillSelect(province,A.provinces,"كل المحافظات");F.fillSelect(department,[],"اختر الوزارة والمحافظة أولًا",true);
[ministry,province,department].forEach(F.enhance);
function departments(){const available=ministry.value&&province.value?C.departmentsFor(ministry.value,province.value):[];F.fillSelect(department,available.map(d=>({id:d.id,name:d.name+(d.scope==="central"?" — خدمة مركزية":"")})),available.length?"كل المديريات":"اختر الوزارة والمحافظة أولًا",!available.length);}
function catalogue(r){const known=C.get("departments",r.departmentId);if(known)return {ministry:r.ministryId||known.ministry,department:known.id};const matches=C.departments.filter(d=>C.searchText(d.name)===C.searchText(r.department)&&(!d.city||d.city===A.cityId(r.city)));return {ministry:r.ministryId||(matches.length===1?matches[0].ministry:""),department:matches.length===1?matches[0].id:""};}
function render(){const q=C.searchText(U.$("search").value),rows=D.state.requests.filter(r=>{const c=catalogue(r);return r.status==="open"&&r.visibility!=="hidden"&&(!D.offer(r.id)||!["rejected","blocked"].includes(D.offer(r.id).status))&&(!ministry.value||c.ministry===ministry.value)&&(!province.value||A.cityId(r.city)===province.value)&&(!department.value||c.department===department.value)&&C.searchText(r.title+" "+r.id+" "+r.description).includes(q);});
U.$("resultCount").textContent=rows.length+" طلبات";U.$("requestCards").innerHTML=rows.length?rows.map(U.card).join(""):U.empty();}
ministry.addEventListener("change",()=>{departments();render();});province.addEventListener("change",()=>{departments();render();});department.addEventListener("change",render);U.$("search").addEventListener("input",render);
U.$("resetFilters").addEventListener("click",()=>{U.$("search").value="";ministry.value="";province.value="";[ministry,province].forEach(F.refreshSelect);departments();render();});window.addEventListener("wakeel:change",render);render();
})();
