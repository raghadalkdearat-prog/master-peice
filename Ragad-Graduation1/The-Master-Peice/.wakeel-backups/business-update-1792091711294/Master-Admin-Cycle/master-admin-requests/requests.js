
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("requests.view"))return;
U.options("category",D.state.services.map(s=>[s.id,s.name]));U.options("city",[...new Set(D.state.requests.map(r=>r.city))]);
const initial=new URLSearchParams(location.search).get("status");if(["open","active","completed","suspended","cancelled"].includes(initial))U.$("status").value=initial;
function render(){const s=D.state,q=U.$("search").value.trim().toLowerCase(),status=U.$("status").value,category=U.$("category").value,city=U.$("city").value;
U.metrics([["كل المعاملات",s.requests.length,"file"],["بانتظار العروض",s.requests.filter(r=>r.status==="open").length,"offer"],["قيد التنفيذ",s.requests.filter(r=>r.status==="active").length,"clock"],["مكتملة",s.requests.filter(r=>r.status==="completed").length,"check"]]);
const rows=s.requests.filter(r=>(status==="all"||r.status===status)&&(category==="all"||r.service===category)&&(city==="all"||r.city===city)&&(r.title+" "+r.id+" "+D.userName(r.client)+" "+D.userName(D.selectedAgent(r))).toLowerCase().includes(q));
U.$("requestsTable").innerHTML=U.requestTable(rows);
}U.bindFilters(["search","status","category","city"],render);render();
})();
