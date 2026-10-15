
(() => {
const D=AgentData,U=AgentUI,kinds={requests:"المعاملات والعروض",payments:"المستحقات",account:"الحساب",other:"استفسار آخر"};
function render(){const q=U.$("ticketSearch").value.trim().toLowerCase(),status=U.$("ticketStatus").value,rows=D.state.tickets.filter(t=>(status==="all"||t.status===status)&&(t.subject+" "+t.description+" "+t.id).toLowerCase().includes(q));
U.$("ticketsList").innerHTML=rows.length?rows.map(t=>'<button class="ticket-item" type="button" data-ticket="'+U.esc(t.id)+'">'+U.icon("message")+'<span class="ticket-copy"><strong>'+U.esc(t.subject)+'</strong><small>'+U.esc(t.id)+" · "+U.date(t.date)+'</small></span>'+U.badge(t.status)+'</button>').join(""):U.empty("لا توجد تذاكر مطابقة","أنشئ تذكرة عند الحاجة إلى مساعدة.");
}
U.$("newTicket").addEventListener("click",()=>{
U.openDialog("إنشاء تذكرة دعم",'<form id="ticketForm" class="dialog-form"><label>عنوان التذكرة<input id="ticketSubject" required minlength="5" maxlength="120"></label><label>نوع الاستفسار<select id="ticketCategory">'+Object.entries(kinds).map(([k,v])=>'<option value="'+k+'">'+v+'</option>').join("")+'</select></label><label>المعاملة المرتبطة<select id="ticketRequest"><option value="">لا توجد معاملة مرتبطة</option>'+D.state.requests.filter(r=>D.offer(r.id)).map(r=>'<option value="'+U.esc(r.id)+'">'+U.esc(r.title+" · "+r.id)+'</option>').join("")+'</select></label><label>وصف الاستفسار<textarea id="ticketDescription" required minlength="20" maxlength="3000" rows="4"></textarea></label><p class="muted">تُحفظ التذكرة في هذا المتصفح، ولا تُرسل إلى فريق دعم.</p><button class="button primary" type="submit">إنشاء التذكرة</button></form>');
U.$("ticketForm").addEventListener("submit",e=>{e.preventDefault();const subject=U.$("ticketSubject").value.trim(),description=U.$("ticketDescription").value.trim();if(subject.length<5||description.length<20){U.toast("اكتب عنوانًا واضحًا ووصفًا من 20 حرفًا على الأقل.");return;}
const item={id:"T-"+Date.now().toString(36).toUpperCase(),subject,description,category:U.$("ticketCategory").value,request:U.$("ticketRequest").value,status:"open",date:new Date().toISOString()};
if(D.mutate(s=>s.tickets.unshift(item))){U.closeDialog();render();U.toast("تم حفظ التذكرة محليًا.");}
});
});
U.$("ticketsList").addEventListener("click",e=>{const b=e.target.closest("[data-ticket]");if(!b)return;const t=D.state.tickets.find(t=>t.id===b.dataset.ticket);if(!t)return;
U.openDialog(t.subject,'<p class="muted">'+U.esc(t.id+" · "+kinds[t.category])+'</p>'+U.badge(t.status)+'<p class="long-text">'+U.esc(t.description)+'</p>'+(t.request?'<a class="text-action" href="'+U.href("request-details",t.request)+'">تفاصيل المعاملة</a>':"")+'<p class="muted">لا توجد ردود فعلية في النسخة التجريبية.</p>'+(t.status==="open"?'<button class="button secondary" id="closeTicket" type="button">إغلاق التذكرة</button>':""));
if(U.$("closeTicket"))U.$("closeTicket").addEventListener("click",()=>{if(D.mutate(s=>s.tickets.find(x=>x.id===t.id).status="closed")){U.closeDialog();render();U.toast("تم إغلاق التذكرة.");}});
});
U.$("ticketSearch").addEventListener("input",render);U.$("ticketStatus").addEventListener("change",render);
U.$("faqSearch").addEventListener("input",()=>{const q=U.$("faqSearch").value.trim().toLowerCase();let count=0;U.$("faqList").querySelectorAll("details").forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(q);if(!el.hidden)count++;});U.$("faqEmpty").hidden=count>0;});
render();
})();
