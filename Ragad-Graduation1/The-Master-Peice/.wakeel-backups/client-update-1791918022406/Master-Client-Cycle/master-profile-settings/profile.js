(() => {const D=WakeelData,U=WakeelFlow,A=WakeelAccount,form=U.$("personalForm");
U.fillSelect(U.$("city"),A.provinces,"اختر المحافظة");
function identity(){const p=D.profile("client");U.$("identityName").textContent=p.fullName;U.$("identityEmail").textContent=p.email;U.$("profileAvatar").textContent=p.fullName[0]||"و";document.querySelectorAll("#shared-navbar .nav-user span").forEach(el=>el.textContent=p.fullName);}
function fill(){const p=D.profile("client");["fullName","email","phone","city","bio"].forEach(k=>U.$(k).value=p[k]||"");identity();}
function announce(text,good=true){U.$("profileAlert").hidden=false;U.$("profileAlert").textContent=text;U.$("profileAlert").classList.toggle("bad",!good);}
form.addEventListener("submit",e=>{e.preventDefault();const input={};["fullName","email","phone","city","bio"].forEach(k=>input[k]=U.$(k).value);const result=D.saveProfile("client",input);if(result.ok){fill();announce("تم تحديث بيانات العميل محليًا وبيانات التواصل المرتبطة به.");}else announce(result.error,false);});
U.$("restorePersonal").addEventListener("click",()=>{fill();announce("تم التراجع عن التعديلات غير المحفوظة.");});
const prefs=U.$("preferencesForm");prefs.querySelectorAll("input").forEach(c=>c.checked=Boolean(D.state.preferences.client[c.name]));prefs.addEventListener("submit",e=>{e.preventDefault();const p={};prefs.querySelectorAll("input").forEach(c=>p[c.name]=c.checked);if(U.check(D.savePreferences("client",p)))announce("تم حفظ تفضيلات الإشعارات.");});
U.methodPanel(U.$("wfPaymentMethods"));document.querySelectorAll(".profile-nav a").forEach(a=>a.addEventListener("click",()=>{document.querySelectorAll(".profile-nav a").forEach(x=>x.classList.remove("active"));a.classList.add("active");}));window.addEventListener("wakeel:change",identity);fill();
})();