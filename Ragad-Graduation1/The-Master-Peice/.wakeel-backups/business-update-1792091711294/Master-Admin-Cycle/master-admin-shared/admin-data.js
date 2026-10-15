
/* Browser-local Admin prototype. All state belongs to wakeel_admin_demo_v1. */
(() => {
"use strict";
const KEY="wakeel_admin_demo_v1",clone=x=>JSON.parse(JSON.stringify(x));
const permissions={
"dashboard.view":"عرض لوحة التحكم","users.view":"عرض المستخدمين","users.edit":"تعديل بيانات المستخدم","users.suspend":"تعليق المستخدم وإعادة تفعيله","agents.review":"مراجعة ملف الوكيل",
"requests.view":"عرض المعاملات","requests.moderate":"إدارة ظهور الطلبات","requests.status":"معالجة حالة المعاملة","offers.moderate":"مراجعة العروض المخالفة",
"payments.view":"عرض المدفوعات","payments.manage":"معالجة المدفوعات والمستحقات","support.view":"عرض تذاكر الدعم","support.manage":"معالجة تذاكر الدعم",
"notifications.view":"عرض الإشعارات","notifications.create":"إنشاء إشعار تجريبي",
"services.view":"عرض فئات الخدمات","services.manage":"إدارة فئات الخدمات","settings.view":"عرض الإعدادات","settings.edit":"تحديث الملف والتفضيلات","audit.view":"عرض سجل الإجراءات"
};
const common=["dashboard.view","users.view","requests.view","notifications.view","settings.view","settings.edit","audit.view"];
const seed={
version:1,session:{actor:"ADM-1"},
roles:[{id:"root",name:"مدير المنصة",permissions:Object.keys(permissions)}],
admins:[{id:"ADM-1",name:"مدير المنصة",email:"admin@wakeel.test",role:"root",status:"active",preferences:{requests:true,support:true,payments:true}}],
users:[{id:"U-1",type:"client",name:"محمد العلي",email:"mohammed@example.com",phone:"0791111111",city:"إربد",status:"active",date:"2026-10-01"},{id:"U-2",type:"client",name:"ليلى الحسن",email:"layla@example.com",phone:"0792222222",city:"عمان",status:"active",date:"2026-10-02"},{id:"U-3",type:"agent",name:"أحمد خالد",email:"ahmad@example.com",phone:"0793333333",city:"إربد",status:"active",approval:"approved",services:["S-1","S-4"],coverage:["إربد","عمان"],bio:"متابعة معاملات المركبات والوثائق.",date:"2026-09-20"},{id:"U-4",type:"agent",name:"نور العبدالله",email:"noor@example.com",phone:"0794444444",city:"عمان",status:"active",approval:"approved",services:["S-2","S-3"],coverage:["عمان","الزرقاء"],bio:"متابعة معاملات الأراضي والشركات.",date:"2026-09-25"},{id:"U-5",type:"agent",name:"ليث عمر",email:"laith@example.com",phone:"0795555555",city:"الزرقاء",status:"active",approval:"pending",services:["S-1","S-5"],coverage:["الزرقاء"],bio:"متابعة المعاملات والتراخيص.",date:"2026-10-10"}],
services:[{id:"S-1",name:"معاملات المركبات",status:"active",order:1},{id:"S-2",name:"العقارات والأراضي",status:"active",order:2},{id:"S-3",name:"معاملات الشركات",status:"active",order:3},{id:"S-4",name:"الوثائق والمستندات",status:"active",order:4},{id:"S-5",name:"التراخيص",status:"active",order:5}],
requests:[
{id:"REQ-3001",title:"تجديد رخصة مركبة",client:"U-1",service:"S-1",categorySnapshot:"معاملات المركبات",city:"إربد",department:"إدارة ترخيص السواقين والمركبات",budget:35,deadline:"2026-10-20",date:"2026-10-10",description:"متابعة إجراءات تجديد رخصة مركبة واستكمال المتطلبات.",status:"open",visibility:"visible",selected:null,stage:0,notes:[],messages:[]},
{id:"REQ-3002",title:"متابعة معاملة أرض",client:"U-2",service:"S-2",categorySnapshot:"العقارات والأراضي",city:"عمان",department:"دائرة الأراضي والمساحة",budget:65,deadline:"2026-10-23",date:"2026-10-09",description:"متابعة إجراءات معاملة أرض والتنسيق على المستندات.",status:"active",visibility:"visible",selected:"O-2",stage:1,notes:[],messages:[{by:"client",text:"أحتاج إلى توضيح موعد المراجعة القادم.",date:"2026-10-10T10:00:00+03:00"},{by:"agent",text:"سأراجع الموعد وأبلغك بالتحديث.",date:"2026-10-10T11:00:00+03:00"}]},
{id:"REQ-3003",title:"استخراج وثائق شركة",client:"U-1",service:"S-4",categorySnapshot:"الوثائق والمستندات",city:"عمان",department:"دائرة مراقبة الشركات",budget:30,deadline:"2026-10-07",date:"2026-10-03",description:"استخراج الوثائق المطلوبة للشركة.",status:"completed",visibility:"visible",selected:"O-3",stage:3,notes:[],messages:[]},
{id:"REQ-3004",title:"تجديد ترخيص مهني",client:"U-2",service:"S-5",categorySnapshot:"التراخيص",city:"إربد",department:"البلدية المعنية",budget:50,deadline:"2026-09-30",date:"2026-09-24",description:"متابعة تجديد الترخيص واستكمال المتطلبات.",status:"completed",visibility:"visible",selected:"O-4",stage:3,notes:[],messages:[]},
{id:"REQ-3005",title:"تعديل سجل تجاري",client:"U-2",service:"S-3",categorySnapshot:"معاملات الشركات",city:"عمان",department:"دائرة مراقبة الشركات",budget:45,deadline:"2026-10-15",date:"2026-10-04",description:"متابعة تعديل السجل التجاري.",status:"cancelled",visibility:"hidden",selected:"O-5",stage:1,notes:[{text:"تم إلغاء المعاملة في بيانات العرض.",by:"ADM-1",date:"2026-10-08"}],messages:[]}
],
offers:[{id:"O-1",request:"REQ-3001",agent:"U-3",price:28,days:3,notes:"متابعة الإجراءات وإبلاغ العميل بالتحديثات.",status:"pending"},{id:"O-2",request:"REQ-3002",agent:"U-4",price:48,days:4,notes:"متابعة المعاملة والتنسيق على المستندات.",status:"accepted"},{id:"O-3",request:"REQ-3003",agent:"U-3",price:25,days:2,notes:"متابعة استخراج الوثائق.",status:"accepted"},{id:"O-4",request:"REQ-3004",agent:"U-3",price:40,days:4,notes:"متابعة تجديد الترخيص.",status:"accepted"},{id:"O-5",request:"REQ-3005",agent:"U-4",price:38,days:3,notes:"متابعة تعديل بيانات السجل.",status:"accepted"}],
payments:[{id:"PAY-2",request:"REQ-3002",amount:48,status:"held",entitlement:"held",settlementHold:true,date:"2026-10-09",adjustments:[]},{id:"PAY-3",request:"REQ-3003",amount:25,status:"held",entitlement:"pending",settlementHold:false,date:"2026-10-06",adjustments:[]},{id:"PAY-4",request:"REQ-3004",amount:40,status:"completed",entitlement:"settled",settlementHold:false,date:"2026-09-30",adjustments:[]},{id:"PAY-5",request:"REQ-3005",amount:38,status:"held",entitlement:"held",settlementHold:true,date:"2026-10-05",adjustments:[]}],
tickets:[{id:"T-1",user:"U-2",request:"REQ-3002",subject:"استفسار عن موعد المعاملة",description:"أحتاج إلى مراجعة موعد الإنجاز وتوضيح التأخير في متابعة المعاملة.",category:"dispute",priority:"high",status:"open",date:"2026-10-10",replies:[]},{id:"T-2",user:"U-3",request:"REQ-3003",subject:"استفسار عن المستحقات",description:"أرجو توضيح حالة مستحقات معاملة استخراج الوثائق المكتملة.",category:"payment",priority:"normal",status:"in-progress",date:"2026-10-09",replies:[{by:"ADM-1",text:"تم تسجيل الاستفسار للمراجعة مع القسم المختص.",date:"2026-10-10"}]}],
reviews:[{id:"REV-1",request:"REQ-3003",client:"U-1",agent:"U-3",rating:5,title:"متابعة ممتازة",comment:"تواصل واضح والتزام بمتابعة خطوات المعاملة.",visibility:"visible",reported:false,date:"2026-10-08"},{id:"REV-2",request:"REQ-3004",client:"U-2",agent:"U-3",rating:4,title:"خدمة جيدة",comment:"أنجز المعاملة، وأحتاج إلى توضيح بعض تفاصيل التواصل.",visibility:"visible",reported:true,date:"2026-10-01"}],
notifications:[{id:"N-1",recipient:"ADM-1",request:"REQ-3002",title:"شكوى تحتاج متابعة",body:"توجد تذكرة مفتوحة مرتبطة بمعاملة أرض.",read:false,date:"2026-10-10"},{id:"N-2",recipient:"ADM-1",request:null,title:"ملف وكيل بانتظار المراجعة",body:"راجع معلومات مقدم الخدمة ليث عمر.",read:false,date:"2026-10-10"}],
audit:[]
};
let state=clone(seed),storageAvailable=true;
try{const raw=localStorage.getItem(KEY);if(raw){const p=JSON.parse(raw);if(p.version!==1||!p.session||!["roles","admins","users","services","requests","offers","payments","tickets","reviews","notifications","audit"].every(k=>Array.isArray(p[k]))||!p.admins.some(a=>a.id===p.session.actor))throw new Error("Invalid Admin data");state=p;}}catch{storageAvailable=false;}
if(state.singleAdminVersion!==1){
state.retiredAdmins=(state.retiredAdmins||[]).concat(state.admins.filter(a=>a.id!=="ADM-1"));state.retiredRoles=state.roles.filter(r=>r.id!=="root");state.retiredReviews=state.reviews;
const manager=state.admins.find(a=>a.id==="ADM-1")||clone(seed.admins[0]);manager.name="مدير المنصة";manager.role="root";manager.status="active";delete manager.preferences.reviews;
state.admins=[manager];state.roles=[{id:"root",name:"مدير المنصة",permissions:Object.keys(permissions)}];state.session={actor:"ADM-1"};state.reviews=[];state.audit=state.audit.filter(x=>!(x.id==="LOG-1"&&x.reason?.includes("بيانات العرض")));state.singleAdminVersion=1;
try{localStorage.setItem(KEY,JSON.stringify(state));}catch{storageAvailable=false;}
}

const must=(condition,message)=>{if(!condition)throw new Error(message);};
const actor=()=>state.admins.find(a=>a.id===state.session.actor);
state.roles.forEach(r=>r.permissions=r.permissions.filter(p=>Object.hasOwn(permissions,p)));
const can=permission=>{if(!Object.hasOwn(permissions,permission))return false;const a=actor();return Boolean(a?.status==="active"&&state.roles.find(r=>r.id===a.role)?.permissions.includes(permission));};
const snapshot=x=>{const c=clone(x===undefined?null:x);if(c&&typeof c==="object")delete c.messages;return c;};
const needs={
"user.edit":"users.edit","user.suspend":"users.suspend","agent.review":"agents.review","request.visibility":"requests.moderate","request.status":"requests.status","request.note":"requests.status","offer.block":"offers.moderate",
"payment.hold":"payments.manage","payment.settle":"payments.manage","payment.refund":"payments.manage","payment.adjust":"payments.manage",
"ticket.update":"support.manage","ticket.reply":"support.manage","notification.create":"notifications.create","notification.read":"notifications.view",
"service.save":"services.manage","admin.profile":"settings.edit","admin.preferences":"settings.edit"
};
function execute(action,p={}){
try{
if(action==="session.switch"){must(p.id==="ADM-1","مدير المنصة هو الحساب الإداري الوحيد.");return {ok:true};}
must(action==="session.switch"||can(needs[action]),"لا تملك صلاحية تنفيذ هذا الإجراء.");
if(["ticket.update","ticket.reply"].includes(action)&&window.WakeelData?.state.supportTickets.some(t=>t.id===p.id))return window.WakeelData.supportAction(p.id,action==="ticket.reply"?"reply":"update",p);
const a=actor(),next=clone(state);
let before,after,target=p.id,entity,reason=String(p.reason||"").trim();
const find=(key,id)=>{const item=next[key].find(x=>x.id===id);must(item,"السجل غير موجود.");return item;};
const itemBefore=(key,id,kind)=>{const item=find(key,id);before=snapshot(item);entity=kind;return item;};
const sensitive=["user.suspend","agent.review","request.visibility","request.status","offer.block","payment.hold","payment.settle","payment.refund","payment.adjust","review.visibility","role.permissions","admin.role","ticket.update","service.save"];
if(sensitive.includes(action))must(reason.length>=5,"أدخل سببًا واضحًا من 5 أحرف على الأقل.");
switch(action){
case "user.edit":{const u=itemBefore("users",p.id,"user");must(String(p.name).trim().length>=2&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)&&/^07\d{8}$/.test(p.phone),"تحقق من الاسم والبريد ورقم الهاتف.");Object.assign(u,{name:p.name.trim(),email:p.email.trim(),phone:p.phone,city:p.city});after=u;reason=reason||"تحديث البيانات الأساسية للمستخدم.";break;}
case "user.suspend":{const u=itemBefore("users",p.id,"user");must(["active","suspended"].includes(p.status),"حالة حساب غير صالحة.");u.status=p.status;after=u;break;}
case "agent.review":{const u=itemBefore("users",p.id,"user");must(u.type==="agent"&&["approved","rejected","pending"].includes(p.approval),"حالة مراجعة غير صالحة.");u.approval=p.approval;after=u;break;}
case "request.visibility":{const r=itemBefore("requests",p.id,"request");must(["visible","hidden"].includes(p.visibility),"حالة ظهور غير صالحة.");r.visibility=p.visibility;after=r;break;}
case "request.status":{const r=itemBefore("requests",p.id,"request"),payment=next.payments.find(x=>x.request===r.id);must(!["completed","cancelled"].includes(r.status),"المعاملة نهائية؛ سجّل طلب معالجة عبر الدعم.");if(p.status==="suspended"){must(r.status!=="suspended","المعاملة موقوفة بالفعل.");r.previousStatus=r.status;r.status="suspended";if(payment&&payment.status==="held")payment.settlementHold=true;}
else if(p.status==="resume"){must(r.status==="suspended","يمكن استئناف معاملة موقوفة فقط.");r.status=r.previousStatus||"open";delete r.previousStatus;}
else if(p.status==="cancelled"){r.status="cancelled";next.offers.filter(o=>o.request===r.id&&o.status==="pending").forEach(o=>o.status="cancelled");if(payment&&payment.status==="held")payment.settlementHold=true;}
else if(p.status==="completed"){must(r.status==="active"&&r.selected&&find("offers",r.selected).status==="accepted","الإتمام يتطلب معاملة نشطة وعرضًا مقبولًا.");r.status="completed";r.stage=3;}
else throw new Error("انتقال غير صالح للحالة.");
r.notes.push({text:reason,by:a.id,date:new Date().toISOString()});after={request:snapshot(r),payment:payment?snapshot(payment):null,offers:next.offers.filter(o=>o.request===r.id).map(snapshot)};before={request:before,payment:state.payments.find(x=>x.request===r.id)||null,offers:state.offers.filter(o=>o.request===r.id)};break;}
case "request.note":{const r=itemBefore("requests",p.id,"request");must(String(p.text).trim().length>=5,"أضف ملاحظة واضحة.");r.notes.push({text:p.text.trim(),by:a.id,date:new Date().toISOString()});after=r;reason=reason||"إضافة ملاحظة إدارية.";break;}
case "offer.block":{const o=itemBefore("offers",p.id,"offer");must(o.status==="pending","يمكن إيقاف عرض بانتظار القبول فقط؛ العرض المقبول يعالج من المعاملة.");o.status="blocked";after=o;break;}
case "payment.hold":{const payment=itemBefore("payments",p.id,"payment");must(payment.status==="held","التعليق متاح للمبالغ المحجوزة فقط.");must(typeof p.hold==="boolean","حالة تعليق غير صالحة.");const req=find("requests",payment.request);if(!p.hold)must(!["suspended","cancelled"].includes(req.status)&&!next.tickets.some(t=>t.request===req.id&&t.category==="dispute"&&t.status!=="closed"),"عالج الشكوى أو إيقاف المعاملة قبل رفع التعليق.");payment.settlementHold=p.hold;after=payment;break;}
case "payment.settle":{const payment=itemBefore("payments",p.id,"payment"),r=find("requests",payment.request);must(r.status==="completed"&&payment.status==="held"&&!payment.settlementHold,"التسوية تتطلب معاملة مكتملة ومبلغًا محجوزًا دون تعليق.");must(!next.tickets.some(t=>t.request===r.id&&t.category==="dispute"&&t.status!=="closed"),"لا يمكن التسوية أثناء وجود شكوى مفتوحة.");const selected=find("offers",r.selected),agent=find("users",selected.agent);must(agent.status==="active"&&agent.approval==="approved","راجع حالة حساب الوكيل قبل التسوية.");payment.status="completed";payment.entitlement="settled";after=payment;break;}
case "payment.refund":{const payment=itemBefore("payments",p.id,"payment"),r=find("requests",payment.request);must(payment.status==="held"&&["cancelled","suspended"].includes(r.status),"الاسترداد التجريبي يتطلب مبلغًا محجوزًا ومعاملة ملغاة أو موقوفة.");payment.status="refunded";payment.entitlement="cancelled";payment.adjustments.push({id:"ADJ-"+Date.now(),type:"refund",amount:payment.amount,reason,by:a.id,date:new Date().toISOString()});after=payment;break;}
case "payment.adjust":{const payment=itemBefore("payments",p.id,"payment");must(Number.isFinite(p.amount)&&p.amount!==0&&Math.abs(p.amount)<=100000,"أدخل قيمة تصحيح صالحة غير صفرية.");payment.adjustments.push({id:"ADJ-"+Date.now(),type:"correction",amount:p.amount,status:"review",reason,by:a.id,date:new Date().toISOString()});after=payment;break;}
case "ticket.update":{const t=itemBefore("tickets",p.id,"ticket");must(["open","in-progress","resolved","closed"].includes(p.status)&&["normal","high"].includes(p.priority),"تحقق من حالة التذكرة وأولويتها.");t.status=p.status;t.priority=p.priority;after=t;reason=reason||"تحديث حالة التذكرة وأولويتها.";break;}
case "ticket.reply":{const t=itemBefore("tickets",p.id,"ticket");must(t.status!=="closed","أعد فتح التذكرة لإضافة رد.");must(String(p.text).trim().length>=10,"أضف ردًا من 10 أحرف على الأقل.");t.replies.push({by:a.id,text:p.text.trim(),date:new Date().toISOString()});after=t;reason="إضافة رد إداري محفوظ محليًا.";break;}
case "notification.create":{must(String(p.title).trim().length>=3&&String(p.body).trim().length>=10,"أضف عنوانًا ووصفًا واضحين.");must(next.users.some(u=>u.id===p.recipient)||next.admins.some(u=>u.id===p.recipient),"اختر مستلمًا صحيحًا.");must(!p.request||next.requests.some(r=>r.id===p.request),"المعاملة غير موجودة.");entity="notification";target="N-"+Date.now();before=null;after={id:target,title:p.title.trim(),body:p.body.trim(),recipient:p.recipient,request:p.request||null,read:false,createdBy:a.id,date:new Date().toISOString()};next.notifications.unshift(after);reason="إنشاء إشعار تجريبي، دون إرسال خارجي.";break;}
case "notification.read":{entity="notification";target="inbox:"+a.id;const visible=n=>n.recipient===a.id||(a.role==="root"&&Boolean(n.createdBy));before=next.notifications.filter(visible).map(snapshot);next.notifications.filter(n=>visible(n)&&(!p.id||n.id===p.id)).forEach(n=>n.read=true);after=next.notifications.filter(visible);reason="تحديد إشعارات الإدارة كمقروءة.";break;}
case "service.save":{must(String(p.name).trim().length>=3&&Number.isInteger(p.order)&&p.order>=1&&p.order<=999&&["active","disabled"].includes(p.status),"تحقق من الاسم والترتيب وحالة الفئة.");must(!next.services.some(s=>s.id!==p.id&&s.name===p.name.trim()),"توجد فئة بهذا الاسم.");entity="service";if(p.id){const s=itemBefore("services",p.id,"service");Object.assign(s,{name:p.name.trim(),order:p.order,status:p.status});after=s;}else{target="S-"+Date.now();before=null;after={id:target,name:p.name.trim(),order:p.order,status:p.status};next.services.push(after);}reason=reason||"تحديث فئات خدمات وكيل.";break;}
case "admin.profile":{target=a.id;const admin=itemBefore("admins",a.id,"admin");must(String(p.name).trim().length>=2&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email),"تحقق من الاسم والبريد.");admin.name=p.name.trim();admin.email=p.email.trim();after=admin;reason="تحديث الملف الإداري.";break;}
case "admin.preferences":{target=a.id;const admin=itemBefore("admins",a.id,"admin");admin.preferences={requests:Boolean(p.preferences.requests),support:Boolean(p.preferences.support),payments:Boolean(p.preferences.payments)};after=admin;reason="تحديث تفضيلات تنبيهات الإدارة.";break;}
default:throw new Error("إجراء غير معروف.");
}
next.audit.unshift({id:"LOG-"+Date.now()+"-"+next.audit.length,actor:a.id,actorName:a.name,action,entity,target,reason,before:snapshot(before),after:snapshot(after),date:new Date().toISOString()});
localStorage.setItem(KEY,JSON.stringify(next));state=next;storageAvailable=true;return {ok:true};
}catch(error){return{ok:false,error:error.message==="QuotaExceededError"?"تعذر الحفظ المحلي.":error.message};}
}
window.AdminData={get state(){const view=clone(state);if(window.WakeelData&&can("support.view"))view.tickets.push(...WakeelData.state.supportTickets.map(t=>({...t,user:t.owner,replies:t.messages,shared:true})));return view;},get auditEntries(){
const logs=[...state.audit,...(window.WakeelData?[...WakeelData.state.supportAudit,...WakeelData.state.activity]:[])];
return clone(logs.filter(log=>log.action!=="session.switch").map(log=>{let entity=log.entity;if(entity==="user"&&state.users.find(u=>u.id===log.target)?.type==="agent")entity="agent";if(entity==="offer")entity="request";if(entity==="admin")entity="user";return {...log,entity};}).filter(log=>["user","agent","ticket","request","payment"].includes(log.entity)).sort((a,b)=>String(b.date).localeCompare(String(a.date))));
},get actor(){return clone(actor());},get storageAvailable(){return storageAvailable;},permissions,can,execute,
get:(key,id)=>{if(window.WakeelData&&can("support.view")){if(key==="tickets"){const t=WakeelData.state.supportTickets.find(t=>t.id===id);if(t)return clone({...t,user:t.owner,replies:t.messages,shared:true});}if(key==="audit"){const log=[...WakeelData.state.supportAudit,...WakeelData.state.activity].find(x=>x.id===id);if(log)return clone(log);}}return clone(state[key]?.find(x=>x.id===id)||null);},
userName:id=>window.WakeelData&&["client-1","agent-1"].includes(id)?WakeelData.person(id).fullName:state.users.find(x=>x.id===id)?.name||state.admins.find(x=>x.id===id)?.name||state.retiredAdmins?.find(x=>x.id===id)?.name||id||"—",
serviceName:id=>state.services.find(x=>x.id===id)?.name||"—",
selectedAgent:r=>state.offers.find(o=>o.id===r.selected)?.agent||null
};
})();



