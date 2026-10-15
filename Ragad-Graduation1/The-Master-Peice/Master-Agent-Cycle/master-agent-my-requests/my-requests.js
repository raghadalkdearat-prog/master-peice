
(() => {
const D=AgentData,U=AgentUI;let status="all";
U.options("category",D.categories);
function render(){
const mine=D.state.requests.filter(r=>D.offer(r.id)),q=U.$("search").value.trim().toLowerCase(),category=U.$("category").value;
U.metrics([["كل معاملاتي وعروضي",mine.length,"file"],["بانتظار القبول",mine.filter(r=>D.status(r)==="pending").length,"offer"],["قيد التنفيذ",mine.filter(r=>D.status(r)==="active").length,"clock"],["مكتملة",mine.filter(r=>D.status(r)==="completed").length,"check"]]);
const rows=mine.filter(r=>(status==="all"||D.status(r)===status)&&(category==="all"||r.category===category)&&(r.title+" "+r.client+" "+r.id).toLowerCase().includes(q));
U.$("resultCount").textContent=rows.length+" معاملات";U.$("requestsTable").innerHTML=U.table(rows);
U.$("tabs").querySelectorAll("button").forEach(b=>{b.classList.toggle("active",b.dataset.status===status);b.setAttribute("aria-pressed",String(b.dataset.status===status));});
}
U.$("tabs").addEventListener("click",e=>{const b=e.target.closest("[data-status]");if(b){status=b.dataset.status;render();}});
U.$("search").addEventListener("input",render);U.$("category").addEventListener("change",render);
U.$("resetFilters").addEventListener("click",()=>{status="all";U.$("search").value="";U.$("category").value="all";render();});window.addEventListener("wakeel:change",render);render();
})();

