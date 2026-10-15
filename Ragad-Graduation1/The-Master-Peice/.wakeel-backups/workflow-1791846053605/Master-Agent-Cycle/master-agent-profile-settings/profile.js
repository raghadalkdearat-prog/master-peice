
(() => {
const D=AgentData,U=AgentUI;
U.$("serviceChoices").innerHTML=D.categories.map((v,i)=>'<label class="check"><input type="checkbox" name="services" value="'+U.esc(v)+'" id="service'+i+'">'+U.esc(v)+'</label>').join("");
U.$("coverageChoices").innerHTML=D.cities.map(v=>'<label class="check"><input type="checkbox" name="coverage" value="'+U.esc(v)+'">'+U.esc(v)+'</label>').join("");
function identity(){const p=D.state.profile;U.$("identity").innerHTML='<div class="avatar">'+U.esc(p.name[0])+'</div><h3>'+U.esc(p.name)+'</h3><p>'+U.esc(p.email)+'</p><span class="count-pill">مقدم خدمات متابعة المعاملات</span><p>'+U.esc(p.city)+'</p>';U.syncIdentity();}
function fill(){const p=D.state.profile;["name","email","phone","city","bio"].forEach(k=>U.$(k).value=p[k]||"");U.$("profileForm").querySelectorAll("input[type=checkbox]").forEach(c=>c.checked=(p[c.name]||[]).includes(c.value));identity();}
U.$("profileForm").addEventListener("submit",e=>{
e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
const data=new FormData(form),p={name:String(data.get("name")).trim(),email:String(data.get("email")).trim(),phone:String(data.get("phone")).trim(),city:String(data.get("city")),bio:String(data.get("bio")).trim(),services:data.getAll("services"),coverage:data.getAll("coverage")};
if(p.name.length<2||!p.services.length||!p.coverage.length){U.toast("أدخل اسمًا صحيحًا واختر فئة خدمة ومحافظة تغطيها على الأقل.");return;}
if(D.mutate(s=>s.profile=p)){fill();U.toast("تم حفظ بياناتك محليًا.");}
});
U.$("restoreProfile").addEventListener("click",()=>{fill();U.toast("تم التراجع عن التعديلات غير المحفوظة.");});
U.$("preferencesForm").querySelectorAll("input").forEach(c=>c.checked=Boolean(D.state.preferences[c.name]));
U.$("preferencesForm").addEventListener("submit",e=>{e.preventDefault();const prefs={};e.currentTarget.querySelectorAll("input").forEach(c=>prefs[c.name]=c.checked);if(D.mutate(s=>s.preferences=prefs))U.toast("تم حفظ التفضيلات محليًا.");});
fill();
})();
