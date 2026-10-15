(() => {
 "use strict";
 const KEY = 'wakeel_client_requests_v1';
 const getRequests = () => { try {const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]} catch {return []} };
 const saveRequests = entries => localStorage.setItem(KEY,JSON.stringify(entries));
 const safe = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const here = location.pathname.split('/').pop();
 const root = document.querySelector('.app-shell');
 // Avoid modifying layout or existing demo data. Activate the previously disabled prototype form.
 if (here==='creat-request.html') {
   const form=document.getElementById('createRequestForm');
   const draft=form?.querySelector('.btn-draft');
   const next=form?.querySelector('.btn-next');
   if (form && draft && next) {
     [draft,next].forEach(b=>{b.disabled=false;b.removeAttribute('title')});
     const messages=document.createElement('p');messages.id='requestLocalMessage';messages.style.cssText='margin-top:14px;font-weight:600;color:#2563eb';messages.setAttribute('role','status');
     next.parentElement.appendChild(messages);
     const store = status => {
       if (!form.reportValidity()) return;
       const data=new FormData(form);
       const entries=getRequests();
       const id=String(Date.now());
       const entry={id,title:String(data.get('title')||'معاملة جديدة').trim(),category:String(data.get('category')||''),city:String(data.get('governorate')||''),department:String(data.get('department')||''),description:String(data.get('description')||''),priority:String(data.get('priority')||'عادي'),budget:Number(data.get('budget')||0),deadline:String(data.get('deadline')||''),date:new Date().toLocaleDateString('ar-JO'),status:status,offers:[],selected:null};
       entries.unshift(entry);saveRequests(entries);
       messages.textContent=status==='draft'?'تم حفظ المسودة محليًا على هذا المتصفح.':'تم إنشاء الطلب تجريبيًا وحفظه على جهازك.';
       setTimeout(()=>{location.href='../master-my-requests/my-requests.html';},250);
     };
     draft.addEventListener('click',()=>store('draft'));
     next.addEventListener('click',()=>store('offers'));
     form.addEventListener('submit',e=>e.preventDefault());
   }
 }
 if (here==='my-requests.html') {
   const tbody=document.getElementById('requestsBody');
   if(tbody){
     const rows=getRequests().map(r=>{
       const status=r.status==='draft'?'مسودة':'بانتظار العروض';
       const link='../master-request-details/request-details.html?id='+encodeURIComponent(r.id);
       const tr=document.createElement('tr');tr.dataset.status=r.status==='draft'?'draft':'offers';tr.dataset.category=r.category;
       tr.innerHTML=`<td><div class="request-title"><div><strong>${safe(r.title)}</strong><small>#${safe(r.id)} · ${safe(r.city)}</small></div></div></td><td>${safe(r.category)}</td><td>${safe(r.date)}</td><td>0 عروض</td><td><span class="status status-offers">${status}</span></td><td><a class="details-link" href="${link}">عرض التفاصيل ←</a></td>`;
       return tr;
     });
     // Add before the seed demo requests, retaining existing search/filter listeners.
     rows.reverse().forEach(row=>tbody.prepend(row));
     document.getElementById("requestSearch")?.dispatchEvent(new Event("input"));
   }
 }
 if (here==='request-details.html') {
   const id=new URLSearchParams(location.search).get('id');
   const record=getRequests().find(r=>r.id===id);
   // The existing details.js handles static demo IDs; for user-created requests,
   // populate the same view once the original script finished, without inventing offers.
   if(record){
     const mapping={'#reqTitle':record.title,'#reqId':'#'+record.id,'#reqDate':record.date,'#reqCategory':record.category,'#reqCity':record.city,'#reqDepartment':record.department,'#reqPriority':record.priority,'#reqBudget':record.budget+' د.أ','#reqDeadline':record.deadline,'#reqDescription':record.description,'#statusTitle':record.status==='draft'?'مسودة':'بانتظار العروض','#statusHint':record.status==='draft'?'تم حفظ الطلب كمسودة على جهازك.':'هذا طلب تجريبي محفوظ محليًا، ولم يُرسل إلى أي وكيل.','#statusBadge':record.status==='draft'?'مسودة':'بانتظار العروض','#sideStatus':record.status==='draft'?'مسودة':'بانتظار العروض','#offersCount':'0 عروض','#sideOffers':'0'};
     for(const [selector,value] of Object.entries(mapping)){const el=document.querySelector(selector);if(el)el.textContent=value;}
     document.title=record.title+' | وكيل';
     const grid=document.querySelector('.detail-grid');if(grid)grid.hidden=false;
     for(const selector of ['#offersList','#timeline','#dynamicActions']){const el=document.querySelector(selector);if(el)el.innerHTML='';}
     const offers=document.querySelector('#offersList');if(offers)offers.innerHTML='<p>لا توجد عروض بعد. هذه معاملة تجريبية محفوظة محليًا.</p>';
     const dynamic=document.querySelector('#dynamicActions');if(dynamic)dynamic.innerHTML='<a href="../master-my-requests/my-requests.html" class="secondary-action">العودة إلى معاملاتي</a>';
     const locked=document.querySelector('#chatLocked');if(locked)locked.hidden=false;
     const panel=document.querySelector('#chatPanel');if(panel)panel.hidden=true;
     const payment=document.querySelector('#paymentText');if(payment)payment.textContent='لا توجد عملية دفع فعلية في هذه النسخة التجريبية.';
   }
 }
})();