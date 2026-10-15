(() => {
"use strict";
const KEY="wakeel_client_reviews_demo_v1";
const completed=[
 {id:"10230",title:"استخراج وثائق شركة",agent:"محمد أحمد",city:"عمان",date:"2026-10-02"},
 {id:"10225",title:"تجديد ترخيص مهني",agent:"أحمد النجار",city:"إربد",date:"2026-09-24"},
 {id:"10221",title:"نقل ملكية مركبة",agent:"ليث الحسن",city:"عمان",date:"2026-09-18"},
 {id:"10218",title:"تصديق مستندات",agent:"سارة محمود",city:"إربد",date:"2026-09-11"},
 {id:"10212",title:"تحديث بيانات شركة",agent:"عمر الخطيب",city:"عمان",date:"2026-09-04"}
];
const initial=[
 {id:"10230",rating:5,title:"تجربة رائعة",comment:"التزام ممتاز بالموعد وتواصل واضح طوال مراحل المعاملة.",posted:"2026-10-04"},
 {id:"10225",rating:4,title:"خدمة مرتبة",comment:"أنجز المعاملة بشكل جيد، وكان التواصل سهلاً وواضحاً.",posted:"2026-09-27"}
];
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return initial.slice();const parsed=JSON.parse(raw);if(!Array.isArray(parsed))return initial.slice();return parsed.filter(r=>completed.some(x=>x.id===String(r.id))&&Number.isInteger(r.rating)&&r.rating>=1&&r.rating<=5&&typeof r.title==='string'&&typeof r.comment==='string');}catch{return initial.slice();}}
let reviews=load(),chosen=0,activeRequest=null,previousFocus=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(reviews));return true;}catch{return false;}}
const stars=n=>'<span class="review-stars" aria-label="'+n+' من 5 نجوم">'+ '★'.repeat(n)+'<span>'+'☆'.repeat(5-n)+'</span></span>';
function render(){const done=new Set(reviews.map(x=>x.id));const pending=completed.filter(x=>!done.has(x.id));$("statSent").textContent=reviews.length;$("statPending").textContent=pending.length;$("statAverage").textContent=reviews.length?(reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1):"—";$("pendingCount").textContent=pending.length+' معاملات';$("historyCount").textContent=reviews.length+' تقييمات';
 $("pendingList").innerHTML=pending.length?pending.map(x=>`<article class="review-pending-card"><div class="review-entry-icon"><svg><use href="#i-check-circle"></use></svg></div><div class="review-entry-body"><strong>${esc(x.title)}</strong><small>#${esc(x.id)} · ${esc(x.city)} · الوكيل: ${esc(x.agent)}</small><span class="review-complete-tag">مكتملة · جاهزة للتقييم</span></div><div class="review-entry-actions"><button type="button" class="review-primary" data-review="${esc(x.id)}">إضافة تقييم</button><a href="request-details.html?id=${encodeURIComponent(x.id)}">تفاصيل المعاملة</a></div></article>`).join(''):'<div class="review-empty">تم تقييم جميع المعاملات المكتملة في هذه النسخة التجريبية.</div>';
 const q=$("reviewSearch").value.trim().toLocaleLowerCase('ar'),filter=$("ratingFilter").value;
 const shown=reviews.filter(r=>{const x=completed.find(c=>c.id===r.id);return x&&(filter==='all'||String(r.rating)===filter)&&[x.title,x.agent,x.id,r.title,r.comment].join(' ').toLocaleLowerCase('ar').includes(q);});
 $("historyList").innerHTML=shown.length?shown.map(r=>{const x=completed.find(c=>c.id===r.id);return `<article class="review-history-card"><div class="review-history-head"><div><strong>${esc(x.title)}</strong><small>#${esc(x.id)} · ${esc(x.agent)}</small></div><div class="review-history-rate">${stars(r.rating)}<small>${esc(r.posted||'تقييم تجريبي')}</small></div></div><h3>${esc(r.title)}</h3><p>${esc(r.comment)}</p><a href="request-details.html?id=${encodeURIComponent(x.id)}">عرض المعاملة ←</a></article>`;}).join(''):'<div class="review-empty">ما في تقييمات تطابق البحث أو الفلتر الحالي.</div>';
}
function openDialog(id){const x=completed.find(x=>x.id===id);if(!x||reviews.some(r=>r.id===id))return;activeRequest=x;chosen=0;previousFocus=document.activeElement;$("dialogTitle").textContent='تقييم: '+x.title;$("dialogAgent").textContent='مقدم الخدمة: '+x.agent+' · المعاملة #'+x.id;$("requestId").value=x.id;$("reviewForm").reset();$("reviewError").hidden=true;updateStars();$("reviewDialog").hidden=false;document.body.classList.add('review-modal-open');$("closeDialog").focus();}
function closeDialog(){$("reviewDialog").hidden=true;document.body.classList.remove('review-modal-open');activeRequest=null;if(previousFocus&&document.contains(previousFocus))previousFocus.focus();}
function updateStars(){document.querySelectorAll('#starButtons button').forEach(b=>{const on=Number(b.dataset.star)<=chosen;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(Number(b.dataset.star)===chosen));});$("starHint").textContent=chosen?chosen+' من 5 نجوم':'اختر تقييمًا من 1 إلى 5';}
$("pendingList").addEventListener('click',e=>{const b=e.target.closest('[data-review]');if(b)openDialog(b.dataset.review);});
$("starButtons").addEventListener('click',e=>{const b=e.target.closest('[data-star]');if(!b)return;chosen=Number(b.dataset.star);updateStars();});
$("closeDialog").addEventListener('click',closeDialog);$("cancelDialog").addEventListener('click',closeDialog);$("reviewDialog").querySelector('[data-close]').addEventListener('click',closeDialog);
document.addEventListener('keydown',e=>{if($("reviewDialog").hidden)return;if(e.key==='Escape')closeDialog();if(e.key==='Tab'){const available=[...$("reviewDialog").querySelectorAll('button,input,textarea')].filter(el=>!el.disabled);const first=available[0],last=available[available.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
$("reviewForm").addEventListener('submit',e=>{e.preventDefault();if(!activeRequest)return;const title=$("reviewTitle").value.trim(),comment=$("reviewComment").value.trim();if(!chosen||title.length<3||comment.length<15||!$("reviewConfirm").checked){$("reviewError").textContent='اختر عدد النجوم، واكتب عنوانًا ووصفًا لا يقل عن 15 حرفًا، ووافق على التأكيد.';$("reviewError").hidden=false;return;}const record={id:activeRequest.id,rating:chosen,title,comment,posted:new Date().toLocaleDateString('en-CA')};reviews.unshift(record);if(!save()){reviews.shift();$("reviewError").textContent='تعذر الحفظ في المتصفح. تأكد من السماح بالتخزين المحلي.';$("reviewError").hidden=false;return;}closeDialog();render();$("reviewToast").textContent='تم حفظ تقييمك التجريبي على هذا الجهاز.';$("reviewToast").hidden=false;setTimeout(()=>$("reviewToast").hidden=true,4000);});
$("reviewSearch").addEventListener('input',render);$("ratingFilter").addEventListener('change',render);
render();
})();