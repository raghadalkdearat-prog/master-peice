
/* Independent Agent prototype. Never reads or writes Client storage keys. */
(() => {
"use strict";
const KEY="wakeel_agent_demo_v1";
const categories=["معاملات المركبات","العقارات والأراضي","معاملات الشركات","الوثائق والمستندات","التراخيص"];
const cities=["عمان","إربد","الزرقاء","البلقاء","المفرق","جرش","عجلون","مادبا","الكرك","الطفيلة","معان","العقبة"];
const seed={
version:1,
profile:{name:"أحمد خالد",email:"ahmad@example.com",phone:"0790000000",city:"إربد",bio:"متابعة معاملات المركبات والتراخيص والوثائق، مع تواصل واضح وتحديثات منتظمة.",services:["معاملات المركبات","التراخيص","الوثائق والمستندات"],coverage:["إربد","عمان"]},
preferences:{offers:true,requests:true,messages:true,payments:true},
requests:[
{id:"AG-2101",title:"تجديد رخصة مركبة",category:categories[0],city:"إربد",department:"إدارة ترخيص السواقين والمركبات",client:"محمد العلي",budget:35,deadline:"2026-10-20",date:"2026-10-08",priority:"عادي",description:"أحتاج إلى متابعة إجراءات تجديد رخصة مركبة واستكمال المتطلبات اللازمة.",status:"open",stage:0,messages:[],updates:[]},
{id:"AG-2102",title:"متابعة معاملة أرض",category:categories[1],city:"عمان",department:"دائرة الأراضي والمساحة",client:"ليلى الحسن",budget:65,deadline:"2026-10-23",date:"2026-10-09",priority:"مهم",description:"متابعة معاملة أرض والتأكد من الوثائق المطلوبة ومواعيد المراجعة.",status:"open",stage:0,messages:[],updates:[]},
{id:"AG-2103",title:"تصديق مستندات",category:categories[3],city:"الزرقاء",department:"الجهة المختصة بالتصديق",client:"عمر سالم",budget:25,deadline:"2026-10-21",date:"2026-10-10",priority:"عادي",description:"متابعة تصديق مستندات والتنسيق بشأن إجراءات تسليمها.",status:"open",stage:0,messages:[],updates:[]},
{id:"AG-2104",title:"تعديل سجل تجاري",category:categories[2],city:"عمان",department:"دائرة مراقبة الشركات",client:"نور محمود",budget:50,deadline:"2026-10-25",date:"2026-10-08",priority:"عادي",description:"متابعة تعديل بيانات السجل التجاري واستكمال المستندات.",status:"open",stage:0,messages:[],updates:[]},
{id:"AG-2105",title:"تجديد ترخيص مهني",category:categories[4],city:"إربد",department:"البلدية المعنية",client:"خالد محمد",budget:45,deadline:"2026-10-19",date:"2026-10-06",priority:"عادي",description:"متابعة تجديد ترخيص مهني وإبلاغي بآخر المستجدات.",status:"active",stage:1,messages:[{by:"client",text:"هل يمكنك توضيح المستندات المطلوبة قبل المراجعة؟",date:"2026-10-10T09:30:00+03:00"}],updates:[{text:"تمت مراجعة تفاصيل الطلب والبدء بمتابعة المتطلبات.",date:"2026-10-09T10:00:00+03:00"}]},
{id:"AG-2106",title:"استخراج وثائق شركة",category:categories[3],city:"عمان",department:"دائرة مراقبة الشركات",client:"سارة ناصر",budget:30,deadline:"2026-10-05",date:"2026-10-01",priority:"عادي",description:"استخراج الوثائق المطلوبة للشركة ومتابعة استلامها.",status:"completed",stage:3,messages:[],updates:[]},
{id:"AG-2107",title:"تجديد رخصة مهنية",category:categories[4],city:"إربد",department:"البلدية المعنية",client:"يوسف حسن",budget:55,deadline:"2026-09-29",date:"2026-09-23",priority:"عادي",description:"متابعة تجديد الرخصة واستكمال متطلباتها.",status:"completed",stage:3,messages:[],updates:[]}
],
offers:[
{id:"O-1",request:"AG-2102",price:48,days:4,notes:"متابعة الإجراءات وتقديم تحديثات منتظمة.",status:"pending",date:"2026-10-10"},
{id:"O-2",request:"AG-2104",price:42,days:3,notes:"مراجعة المستندات والتنسيق على المتطلبات.",status:"rejected",date:"2026-10-09"},
{id:"O-3",request:"AG-2105",price:38,days:3,notes:"متابعة الطلب حتى استكمال الإجراءات.",status:"accepted",date:"2026-10-07"},
{id:"O-4",request:"AG-2106",price:25,days:2,notes:"متابعة استخراج الوثائق.",status:"accepted",date:"2026-10-02"},
{id:"O-5",request:"AG-2107",price:40,days:4,notes:"متابعة تجديد الترخيص.",status:"accepted",date:"2026-09-24"}
],
payments:[{id:"PAY-1",request:"AG-2106",amount:25,status:"settled",date:"2026-10-05"},{id:"PAY-2",request:"AG-2107",amount:40,status:"settled",date:"2026-09-29"}],
reviews:[{id:"R-1",request:"AG-2106",rating:5,title:"تواصل واضح وإنجاز مرتب",comment:"التزم بالموعد ووضح خطوات المعاملة، وكانت المتابعة ممتازة.",date:"2026-10-06"},{id:"R-2",request:"AG-2107",rating:4,title:"خدمة جيدة",comment:"متابعة جيدة للمعاملة وتحديثات مفيدة خلال التنفيذ.",date:"2026-09-30"}],
notifications:[
{id:"N-1",type:"offer",title:"تم قبول عرضك",body:"تم إسناد معاملة تجديد الترخيص المهني إليك.",request:"AG-2105",read:false,date:"2026-10-09T10:00:00+03:00"},
{id:"N-2",type:"message",title:"رسالة من العميل",body:"وصل استفسار عن المستندات المطلوبة للمعاملة.",request:"AG-2105",read:false,date:"2026-10-10T09:30:00+03:00"},
{id:"N-3",type:"payment",title:"تمت تسوية مستحقات معاملة",body:"تحديث تجريبي لمستحقات استخراج وثائق الشركة.",request:"AG-2106",read:true,date:"2026-10-05T12:00:00+03:00"}
],
tickets:[]
};
const clone=x=>JSON.parse(JSON.stringify(x));
let state=clone(seed);
let storageAvailable=true;
try {
 const raw=localStorage.getItem(KEY);
 if(raw){
  const parsed=JSON.parse(raw);
  if(parsed.version!==1||!parsed.profile||!parsed.preferences||!["requests","offers","payments","reviews","notifications","tickets"].every(k=>Array.isArray(parsed[k])))throw new Error("Invalid Agent data");
  state=parsed;
 }
}catch {storageAvailable=false;}
function mutate(change){
 const next=clone(state);
 change(next);
 try {localStorage.setItem(KEY,JSON.stringify(next));state=next;storageAvailable=true;return true;}
 catch {window.AgentUI?.toast("تعذر الحفظ في المتصفح. تحقق من السماح بالتخزين المحلي.");return false;}
}
window.AgentData={
get state(){return clone(state);},get storageAvailable(){return storageAvailable;},mutate,categories,cities,
request:id=>clone(state.requests.find(r=>r.id===id)||null),
offer:id=>clone(state.offers.find(o=>o.request===id)||null),
status:r=>{const o=state.offers.find(o=>o.request===r.id);return o?.status==="accepted"?r.status:o?.status||"open";},
addNotice:(s,type,title,body,request)=>s.notifications.unshift({id:"N-"+Date.now(),type,title,body,request,read:false,date:new Date().toISOString()})
};
})();
