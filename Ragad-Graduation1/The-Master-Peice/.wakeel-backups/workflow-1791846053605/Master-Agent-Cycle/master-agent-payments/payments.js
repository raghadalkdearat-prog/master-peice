
(() => {
const D=AgentData,U=AgentUI;
const s=D.state,total=items=>items.reduce((sum,p)=>sum+p.amount,0),settled=s.payments.filter(p=>p.status==="settled"),pending=s.payments.filter(p=>p.status==="pending");
U.metrics([["إجمالي المستحقات",U.money(total(s.payments)),"wallet"],["تمت التسوية",U.money(total(settled)),"check"],["بانتظار التسوية",U.money(total(pending)),"clock"],["المعاملات المالية",s.payments.length,"file"]]);
function render(){const q=U.$("search").value.trim().toLowerCase(),status=U.$("status").value;
const rows=D.state.payments.filter(p=>{const r=D.request(p.request);return(status==="all"||p.status===status)&&(p.id+" "+p.request+" "+r?.title).toLowerCase().includes(q);});
U.$("paymentsTable").innerHTML=rows.length?'<div class="table-scroll"><table><thead><tr><th>المعاملة</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>'+rows.map(p=>'<tr><td><strong>'+U.esc(D.request(p.request)?.title||p.request)+'</strong><small>'+U.esc(p.id)+'</small></td><td>'+U.money(p.amount)+'</td><td>'+U.date(p.date)+'</td><td>'+U.badge(p.status)+'</td><td><button class="button secondary" type="button" data-payment="'+U.esc(p.id)+'">التفاصيل</button></td></tr>').join("")+'</tbody></table></div>':U.empty("لا توجد مستحقات مطابقة","تظهر مستحقات المعاملات المكتملة هنا.");
}
U.$("search").addEventListener("input",render);U.$("status").addEventListener("change",render);
U.$("paymentsTable").addEventListener("click",e=>{const b=e.target.closest("[data-payment]");if(!b)return;const p=D.state.payments.find(p=>p.id===b.dataset.payment);if(!p)return;U.openDialog("تفاصيل المستحقات",'<p>'+U.esc(D.request(p.request)?.title||p.request)+'</p><p><strong>'+U.money(p.amount)+'</strong></p>'+U.badge(p.status)+'<p class="muted">سجل تجريبي محفوظ محليًا. لا يمثل تحويلًا ماليًا فعليًا.</p><a class="button secondary" href="'+U.href("request-details",p.request)+'">تفاصيل المعاملة</a>');});render();
})();
