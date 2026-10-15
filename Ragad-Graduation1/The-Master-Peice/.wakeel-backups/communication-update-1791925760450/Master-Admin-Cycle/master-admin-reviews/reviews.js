
(() => {
const D=AdminData,U=AdminUI;if(!U.guard("reviews.view"))return;
function render(){const all=D.state.reviews,q=U.$("search").value.trim().toLowerCase(),visibility=U.$("visibility").value,rating=U.$("rating").value;
U.metrics([["التقييمات",all.length,"star"],["تقييمات ظاهرة",all.filter(r=>r.visibility==="visible").length,"message"],["بلاغات تحتاج مراجعة",all.filter(r=>r.reported&&r.visibility==="visible").length,"shield"],["تقييمات مخفية",all.filter(r=>r.visibility==="hidden").length,"file"]]);
const rows=all.filter(r=>(visibility==="all"||r.visibility===visibility)&&(rating==="all"||String(r.rating)===rating)&&(r.title+" "+r.comment+" "+r.request+" "+D.userName(r.client)+" "+D.userName(r.agent)).toLowerCase().includes(q));
U.$("reviewsList").innerHTML=rows.length?rows.map(r=>'<article class="review-card"><div class="card-heading"><div><strong>'+U.esc(D.get("requests",r.request)?.title)+'</strong><p>'+U.esc(D.userName(r.client)+" ← "+D.userName(r.agent))+'</p></div><span class="stars" aria-label="'+r.rating+' من 5 نجوم">'+"★".repeat(r.rating)+"☆".repeat(5-r.rating)+'</span></div><div class="action-row">'+U.badge(r.visibility)+(r.reported?'<span class="count-pill">يوجد بلاغ</span>':"")+'</div><h3 style="margin-top:14px">'+U.esc(r.title)+'</h3><p>'+U.esc(r.comment)+'</p><div class="action-row">'+U.detailLink(r.request)+U.button(r.visibility==="visible"?"إخفاء التقييم":"استعادة التقييم","visibility","reviews.moderate",'data-review="'+U.esc(r.id)+'"')+'</div></article>').join(""):U.empty();
}
U.bindFilters(["search","visibility","rating"],render);
U.$("reviewsList").addEventListener("click",e=>{const b=e.target.closest("[data-review]");if(!b)return;const r=D.get("reviews",b.dataset.review);U.reasonDialog("مراجعة ظهور التقييم","review.visibility",{id:r.id,visibility:r.visibility==="visible"?"hidden":"visible"},"يبقى نص التقييم وعدد النجوم الأصليان محفوظين.",render);});render();
})();
