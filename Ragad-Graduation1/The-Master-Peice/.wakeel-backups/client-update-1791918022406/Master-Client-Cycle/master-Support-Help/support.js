(() => {
  'use strict';
  const STORAGE_KEY = 'wakeel_support_tickets_demo_v1';
  const $ = id => document.getElementById(id);
  const escapeHTML = val => String(val ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const categories = {requests:'المعاملات والعروض',payments:'المدفوعات والاسترداد',agents:'الوكيل أو نزاع',account:'الحساب والأمان',other:'استفسار آخر'};
  const readTickets = () => { try {const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); return Array.isArray(value)?value:[];}catch{return [];} };
  let tickets=readTickets(), activeId=null, previousFocus=null;
  const save = () => localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets));
  const dateLabel = value => new Intl.DateTimeFormat('ar-JO',{year:'numeric',month:'short',day:'numeric'}).format(new Date(value));
  const showToast = message => {const el=$('supportToast');el.textContent=message;el.hidden=false;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.hidden=true,3500);};
  const openModal = id => {previousFocus=document.activeElement;$(id).hidden=false;document.body.classList.add('support-modal-open'); $(id).querySelector('button, input')?.focus();};
  const closeModal = id => {$(id).hidden=true;if($('ticketDialog').hidden && $('detailDialog').hidden)document.body.classList.remove('support-modal-open');previousFocus?.focus();};
  const openCreate = () => { $('ticketForm').reset();$('ticketError').hidden=true;openModal('ticketDialog');};
  ['newTicketTop','newTicketInline','newTicketAside','newTicketEmpty'].forEach(id=>$(id).addEventListener('click',openCreate));
  $('closeDialog').addEventListener('click',()=>closeModal('ticketDialog'));
  $('cancelDialog').addEventListener('click',()=>closeModal('ticketDialog'));
  $('ticketDialog').querySelector('[data-close]').addEventListener('click',()=>closeModal('ticketDialog'));
  $('closeDetail').addEventListener('click',()=>closeModal('detailDialog'));
  $('closeDetailBottom').addEventListener('click',()=>closeModal('detailDialog'));
  $('detailDialog').querySelector('[data-close-detail]').addEventListener('click',()=>closeModal('detailDialog'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('detailDialog').hidden)closeModal('detailDialog');else if(!$('ticketDialog').hidden)closeModal('ticketDialog');}});
  $('ticketForm').addEventListener('submit',e=>{
    e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
    const subject=$('ticketSubject').value.trim(),description=$('ticketDescription').value.trim();
    if(subject.length<5 || description.length<20){$('ticketError').textContent='يرجى إدخال عنوان واضح ووصف لا يقل عن 20 حرفًا.';$('ticketError').hidden=false;return;}
    const item={id:'T-'+Date.now().toString(36).toUpperCase(),subject,description,category:$('ticketCategory').value,request:$('ticketRequest').value,status:'open',createdAt:new Date().toISOString()};
    tickets.unshift(item);save();renderTickets();closeModal('ticketDialog');showToast('تم إنشاء التذكرة التجريبية وحفظها في هذا المتصفح.');
    $('tickets').scrollIntoView({behavior:'smooth',block:'start'});
  });
  function renderTickets(){
    const q=$('ticketSearch').value.trim().toLocaleLowerCase(),status=$('ticketStatus').value;
    const filtered=tickets.filter(t=>(status==='all'||t.status===status)&&(t.subject+' '+t.id+' '+t.description).toLocaleLowerCase().includes(q));
    $('totalTickets').textContent=tickets.length;
    $('openTickets').textContent=tickets.filter(t=>t.status==='open').length;
    $('closedTickets').textContent=tickets.filter(t=>t.status==='closed').length;
    $('ticketsList').replaceChildren();
    filtered.forEach(t=>{
      const button=document.createElement('button');button.type='button';button.className='ticket-item';
      button.innerHTML=`<span class="ticket-item-icon"><svg><use href="#i-message"></use></svg></span><span class="ticket-item-copy"><strong>${escapeHTML(t.subject)}</strong><small>${escapeHTML(t.id)} · ${escapeHTML(categories[t.category]||'استفسار')} ${t.request?' · المعاملة #'+escapeHTML(t.request):''}</small></span><span class="ticket-item-end"><span class="ticket-badge ${t.status==='open'?'open':'closed'}">${t.status==='open'?'مفتوحة':'مغلقة'}</span><small>${dateLabel(t.createdAt)}</small></span>`;
      button.addEventListener('click',()=>openDetail(t.id));$('ticketsList').append(button);
    });
    $('ticketsEmpty').hidden=filtered.length>0;$('ticketsEmpty').querySelector('strong').textContent=tickets.length?'لا توجد نتائج مطابقة':'لا توجد تذاكر هنا بعد';
    $('ticketCount').textContent=`عرض ${filtered.length} من ${tickets.length} تذكرة`;
  }
  function openDetail(id){const t=tickets.find(t=>t.id===id);if(!t)return;activeId=id;
    $('detailMeta').textContent=`${t.id} · ${dateLabel(t.createdAt)}`;
    $('detailTitle').textContent=t.subject;
    $('detailBody').innerHTML=`<div class="ticket-detail-meta"><span>${escapeHTML(categories[t.category]||'استفسار')}</span><span class="ticket-badge ${t.status}">${t.status==='open'?'مفتوحة':'مغلقة'}</span></div><p class="ticket-description">${escapeHTML(t.description).replace(/\n/g,'<br>')}</p>${t.request?`<a class="ticket-request-link" href="request-details.html?id=${encodeURIComponent(t.request)}">فتح المعاملة #${escapeHTML(t.request)} ←</a>`:''}<p class="ticket-demo-hint">لم تُرسل هذه التذكرة إلى فريق الدعم. لا توجد ردود حقيقية في النسخة التجريبية.</p>`;
    $('closeTicketButton').hidden=t.status==='closed';openModal('detailDialog');
  }
  $('closeTicketButton').addEventListener('click',()=>{const t=tickets.find(t=>t.id===activeId);if(!t)return;t.status='closed';save();renderTickets();closeModal('detailDialog');showToast('تم إغلاق التذكرة محليًا.');});
  $('ticketSearch').addEventListener('input',renderTickets);$('ticketStatus').addEventListener('change',renderTickets);
  function filterFaq(){const q=$('faqSearch').value.trim().toLocaleLowerCase(),cat=$('faqCategory').value;let shown=0;document.querySelectorAll('#faqList details').forEach(el=>{const show=(cat==='all'||cat===el.dataset.category)&&el.textContent.toLocaleLowerCase().includes(q);el.hidden=!show;if(show)shown++;});$('faqNone').hidden=shown>0;}
  $('faqSearch').addEventListener('input',filterFaq);$('faqCategory').addEventListener('change',filterFaq);
  document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{$('faqCategory').value=a.dataset.topic;$('faqSearch').value='';filterFaq();}));
  renderTickets();filterFaq();
})();