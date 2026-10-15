(() => {
  "use strict";
  const PROFILE_KEY = "wakeel_client_profile_demo_v1";
  const PREFS_KEY = "wakeel_client_preferences_demo_v1";
  const defaults = {fullName:"محمد", email:"mohammed@example.com", phone:"0790000000", governorate:"إربد", bio:""};
  const prefsDefaults = {offers:true,requests:true,payments:true,messages:true,marketing:false};
  const get = (id) => document.getElementById(id);
  function read(key, fallback) {try {const data=JSON.parse(localStorage.getItem(key));return data && typeof data === "object" && !Array.isArray(data) ? {...fallback,...data}: {...fallback};}catch{return {...fallback};}}
  let profile=read(PROFILE_KEY,defaults);
  const form=get("personalForm"), prefsForm=get("preferencesForm");
  const alertBox=get("profileAlert");
  function announce(message, good=true) {alertBox.hidden=false;alertBox.textContent=message;alertBox.classList.toggle("bad",!good);}
  function showIdentity() {const name=profile.fullName.trim() || "مستخدم وكيل";get("identityName").textContent=name;get("identityEmail").textContent=profile.email;get("profileAvatar").textContent=name[0];document.querySelectorAll(".site-header .nav-user span").forEach(node=>node.textContent=name.split(/\s+/)[0]);}
  function fill() {for (const key of ["fullName","email","phone","governorate","bio"])get(key).value=profile[key]||"";showIdentity();}
  fill();
  form.addEventListener("submit",event=>{event.preventDefault(); const name=get("fullName").value.trim();const email=get("email").value.trim();const phone=get("phone").value.replace(/[\s-]/g,"");if(name.length<2){announce("أدخل اسمًا صحيحًا من حرفين على الأقل.",false);get("fullName").focus();return;}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){announce("أدخل بريدًا إلكترونيًا صحيحًا.",false);get("email").focus();return;}if(!/^07\d{8}$/.test(phone)){announce("رقم الهاتف يجب أن يبدأ بـ07 ويتكون من 10 أرقام.",false);get("phone").focus();return;}profile={fullName:name,email,phone,governorate:get("governorate").value,bio:get("bio").value.trim()};try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));fill();announce("تم حفظ بياناتك محليًا في هذا المتصفح.");}catch{announce("تعذر حفظ البيانات في هذا المتصفح.",false);}});
  get("restorePersonal").addEventListener("click",()=>{fill();announce("تم التراجع عن التعديلات غير المحفوظة.");});
  const prefs=read(PREFS_KEY,prefsDefaults);
  for(const control of prefsForm.querySelectorAll("input[type=checkbox]")) control.checked=Boolean(prefs[control.name]);
  prefsForm.addEventListener("submit",event=>{event.preventDefault();const value={};for(const c of prefsForm.querySelectorAll("input[type=checkbox]"))value[c.name]=c.checked;try{localStorage.setItem(PREFS_KEY,JSON.stringify(value));announce("تم حفظ تفضيلات العرض محليًا؛ إعدادات الخادم لم تتغير بعد.");}catch{announce("تعذر حفظ التفضيلات.",false);}});
  document.querySelectorAll(".profile-nav a").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".profile-nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active");}));
})();