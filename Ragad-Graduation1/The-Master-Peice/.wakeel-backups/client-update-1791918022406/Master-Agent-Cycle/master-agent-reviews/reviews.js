
(() => {
const D=AgentData,U=AgentUI,all=D.state.reviews,average=all.length?(all.reduce((sum,r)=>sum+r.rating,0)/all.length).toFixed(1):"—";
U.metrics([["التقييم العام",average,"star"],["التقييمات المستلمة",all.length,"message"],["تقييمات بخمس نجوم",all.filter(r=>r.rating===5).length,"star"],["معاملات مكتملة",D.state.requests.filter(r=>r.status==="completed").length,"check"]]);
function render(){const q=U.$("search").value.trim().toLowerCase(),rating=U.$("rating").value,rows=D.state.reviews.filter(x=>{const r=D.request(x.request);return(rating==="all"||String(x.rating)===rating)&&(x.title+" "+x.comment+" "+r?.title+" "+r?.client).toLowerCase().includes(q);});
U.$("reviewsList").innerHTML=rows.length?rows.map(x=>{const r=D.request(x.request);return '<article class="review-card"><div class="card-heading"><div><strong>'+U.esc(r?.title||x.request)+'</strong><p>'+U.esc(r?.client||"عميل وكيل")+' · '+U.date(x.date)+'</p></div><span class="stars" aria-label="'+x.rating+' من 5 نجوم">'+ "★".repeat(x.rating)+"☆".repeat(5-x.rating)+'</span></div><h3>'+U.esc(x.title)+'</h3><p>'+U.esc(x.comment)+'</p><a class="text-action" href="'+U.href("request-details",x.request)+'">تفاصيل المعاملة</a></article>';}).join(""):U.empty("لا توجد تقييمات مطابقة","تظهر هنا آراء العملاء عن معاملاتك المكتملة.");}
U.$("search").addEventListener("input",render);U.$("rating").addEventListener("change",render);render();
})();
