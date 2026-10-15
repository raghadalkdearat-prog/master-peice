/* The same personal fields and validation serve registration and both profiles. */
(() => {"use strict";
const provinces=[{"id":"amman","name":"عمان"},{"id":"irbid","name":"إربد"},{"id":"zarqa","name":"الزرقاء"},{"id":"balqa","name":"البلقاء"},{"id":"ajloun","name":"عجلون"},{"id":"jerash","name":"جرش"},{"id":"mafraq","name":"المفرق"},{"id":"madaba","name":"مادبا"},{"id":"karak","name":"الكرك"},{"id":"tafilah","name":"الطفيلة"},{"id":"maan","name":"معان"},{"id":"aqaba","name":"العقبة"}];
const digits=s=>String(s??"").replace(/[٠-٩]/g,c=>String("٠١٢٣٤٥٦٧٨٩".indexOf(c))).replace(/[۰-۹]/g,c=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(c)));
const cityId=v=>provinces.find(p=>p.id===v||p.name===v)?.id||"";
function phone(v){let p=digits(v).replace(/[\s()-]/g,"");if(p.startsWith("+962"))p="0"+p.slice(4);else if(p.startsWith("00962"))p="0"+p.slice(5);else if(p.startsWith("962"))p="0"+p.slice(3);return /^07[789]\d{7}$/.test(p)?p:"";}
function normalize(p){return {fullName:String(p.fullName??p.name??"").trim(),email:String(p.email||"").trim().toLowerCase(),phone:phone(p.phone),city:cityId(p.city||p.governorate),bio:String(p.bio||"").trim()};}
function validate(p){const n=normalize(p);if(n.fullName.length<2||n.fullName.length>90)return "أدخل اسمًا من حرفين إلى 90 حرفًا.";if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email))return "أدخل بريدًا إلكترونيًا صحيحًا.";if(!n.phone)return "أدخل رقمًا أردنيًا صحيحًا يبدأ بـ077 أو 078 أو 079.";if(!n.city)return "اختر المحافظة.";if(n.bio.length>500)return "النبذة يجب ألا تتجاوز 500 حرف.";return "";}
function international(value){const p=phone(value);return p&&!/^07[789]0{7}$/.test(p)?"+962"+p.slice(1):"";}
window.WakeelAccount={provinces,normalize,validate,phone,international,cityId,cityName:v=>provinces.find(p=>p.id===cityId(v))?.name||String(v||""),digits};
})();