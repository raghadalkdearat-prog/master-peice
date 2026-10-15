
(() => {
const D=AgentData,U=AgentUI;
U.options("category",D.categories);U.options("city",D.cities);
function render(){
const q=U.$("search").value.trim().toLowerCase(),category=U.$("category").value,city=U.$("city").value;
const rows=D.state.requests.filter(r=>r.status==="open"&&(!D.offer(r.id)||D.offer(r.id).status!=="rejected")&&(category==="all"||r.category===category)&&(city==="all"||r.city===city)&&(r.title+" "+r.id+" "+r.description).toLowerCase().includes(q));
U.$("resultCount").textContent=rows.length+" طلبات";
U.$("requestCards").innerHTML=rows.length?rows.map(U.card).join(""):U.empty();
}
["search","category","city"].forEach(id=>U.$(id).addEventListener(id==="search"?"input":"change",render));
U.$("resetFilters").addEventListener("click",()=>{U.$("search").value="";U.$("category").value="all";U.$("city").value="all";render();});window.addEventListener("wakeel:change",render);render();
})();

