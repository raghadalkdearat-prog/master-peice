
"use strict";
const fs=require("fs"),path=require("path"),http=require("http"),os=require("os"),{spawn}=require("child_process");
const root=path.resolve(__dirname,"../.."),sleep=ms=>new Promise(r=>setTimeout(r,ms)),output=fs.mkdtempSync(path.join(os.tmpdir(),"wakeel-workflow-qa-"));
const checks=[],errors=[];let server,browser,ws;
const assert=(ok,name)=>{if(!ok)throw new Error(name);checks.push(name);};
(async()=>{
server=http.createServer((req,res)=>{let file;try{file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://local").pathname));}catch{res.writeHead(400).end();return;}if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}const type={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".png":"image/png",".svg":"image/svg+xml",".json":"application/json; charset=utf-8"}[path.extname(file)]||"application/octet-stream";res.writeHead(200,{"Content-Type":type}).end(data);});});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port;
browser=spawn("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",["--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check","--remote-debugging-port=9353","--user-data-dir="+path.join(output,"profile"),"about:blank"],{windowsHide:true,stdio:"ignore"});
let ready=false;for(let i=0;i<100;i++){try{await fetch("http://127.0.0.1:9353/json/version");ready=true;break;}catch{await sleep(100);}}if(!ready)throw new Error("Browser startup failed");
const tabs=await(await fetch("http://127.0.0.1:9353/json/list")).json(),tab=tabs.find(t=>t.type==="page");ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
let counter=0;const pending=new Map();ws.addEventListener("message",e=>{const msg=JSON.parse(e.data);if(msg.id){const cb=pending.get(msg.id);if(cb){pending.delete(msg.id);msg.error?cb.reject(new Error(msg.error.message)):cb.resolve(msg.result);}}if(msg.method==="Runtime.exceptionThrown")errors.push(msg.params.exceptionDetails.exception?.description||msg.params.exceptionDetails.text);});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++counter,timer=setTimeout(()=>{pending.delete(id);reject(new Error("CDP timeout "+method));},20000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
await send("Page.enable");await send("Runtime.enable");await send("Network.enable");await send("Network.setBlockedURLs",{urls:["*fonts.googleapis.com*","*fonts.gstatic.com*","*lottie.host*"]});await send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
const client="Master-Client-Cycle/",agent="Master-Agent-Cycle/",admin="Master-Admin-Cycle/";
async function go(page,shared=true){await send("Page.navigate",{url:origin+"/"+page});for(let i=0;i<160;i++){await sleep(50);const expression=shared?'document.readyState!=="loading"&&Boolean(window.WakeelFlow)&&Boolean(document.querySelector("#shared-navbar .nav-user"))&&Boolean(document.querySelector("#shared-footer footer"))':page.startsWith(admin)?'document.readyState!=="loading"&&Boolean(window.AdminUI)&&Boolean(document.querySelector("#shared-navbar .nav-user"))':'document.readyState!=="loading"&&Boolean(window.WakeelData)';if(await evaluate(expression)){await sleep(450);return;}}console.error(await evaluate('JSON.stringify({state:document.readyState,ui:typeof WakeelFlow,agent:typeof AgentUI,body:document.body.textContent.slice(0,400)})'));throw new Error("Page readiness "+page);}
async function screenshot(name){const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+".png"),Buffer.from(shot.data,"base64"));}
async function select(id,value){await evaluate('document.getElementById('+JSON.stringify(id)+').value='+JSON.stringify(value)+';document.getElementById('+JSON.stringify(id)+').dispatchEvent(new Event("change",{bubbles:true}))');}
await go(client+"master-client-dash/client-dash.html");
await evaluate('localStorage.clear()');await go(client+"master-client-dash/client-dash.html");
await evaluate('localStorage.setItem("wakeel_admin_demo_v1","{\\"sentinel\\":true}");localStorage.setItem("wakeel_client_requests_v1","[]")');
await go(client+"master-profile-settings/profile.html");
await evaluate('document.getElementById("fullName").value="عميل الاختبار";document.getElementById("email").value="client@test.example";document.getElementById("phone").value="+962791234567";document.getElementById("city").value="irbid";document.getElementById("personalForm").requestSubmit()');
assert(await evaluate('WakeelData.profile("client").phone==="0791234567"&&WakeelData.profile("client").city==="irbid"'),"Client profile uses registration schema");
await go(agent+"master-agent-profile-settings/profile.html");
await evaluate('document.getElementById("fullName").value="وكيل الاختبار";document.getElementById("email").value="agent@test.example";document.getElementById("phone").value="0787654321";document.getElementById("city").value="amman";document.getElementById("profileForm").requestSubmit()');
assert(await evaluate('WakeelData.profile("agent").fullName==="وكيل الاختبار"'),"Agent profile uses registration schema");
await go(client+"master-creat-request/creat-request.html");
await evaluate('document.getElementById("ministrySearch").focus();document.getElementById("ministrySearch").value="الداخلية";document.getElementById("ministrySearch").dispatchEvent(new Event("input",{bubbles:true}))');
assert(await evaluate('document.querySelectorAll("#ministryOptions [role=option]").length===1'),"Search inside ministry dropdown");
await evaluate('document.querySelector("#ministryOptions [role=option]").click()');await select("governorate","irbid");
assert(await evaluate('[...document.getElementById("department").options].some(o=>o.value==="dvld")&&![...document.getElementById("department").options].some(o=>o.value==="cspd-amman-0")'),"Directorates filtered by ministry and province");
await select("department","dvld");await select("transactionType","dvld-1");
await select("governorate","amman");assert(await evaluate('document.getElementById("department").value===""&&document.getElementById("transactionType").value===""'),"Changing province clears dependent fields");
await select("governorate","irbid");await select("department","dvld");await select("transactionType","other");
assert(await evaluate('!document.getElementById("exactTitleField").hidden&&document.getElementById("exactTitle").required'),"Other reveals exact title");
await select("transactionType","dvld-1");assert(await evaluate('document.getElementById("exactTitleField").hidden&&!document.getElementById("exactTitle").required'),"Choosing known service hides exact title");
await select("budget","35");await select("targetDays","7");await evaluate('document.getElementById("description").value="أحتاج إلى متابعة إجراءات تجديد رخصة المركبة واستكمال الوثائق المطلوبة.";document.getElementById("createRequestForm").requestSubmit()');
assert(await evaluate('document.getElementById("wfDialog").open&&document.getElementById("wfPublish")!==null'),"Request review appears");
const before=await evaluate('WakeelData.state.requests.length');await evaluate('document.getElementById("wfPublish").click()');await sleep(750);
assert(await evaluate('location.pathname.endsWith("/posted-requests.html")&&WakeelData.state.requests.length==='+String(before+1)),"Publish routes to posted requests");
const requestId=await evaluate('WakeelData.state.requests.find(r=>!r.legacy&&r.owner==="client-1").id');
await screenshot("posted-desktop");assert(await evaluate('(()=>{const a=document.querySelector(".nav-user");return getComputedStyle(a).borderRadius==="50%"&&Math.abs(a.getBoundingClientRect().width-a.getBoundingClientRect().height)<1;})()'),"Shared profile is circular");assert(await evaluate('[...document.links].some(a=>a.getAttribute("href")==="tel:+962777459814")&&[...document.links].some(a=>a.getAttribute("href")==="mailto:wakeeljo@gmail.com")&&document.querySelector(".footer-location").textContent.includes("الأردن")&&document.querySelectorAll("[data-wakeel-social]").length===3'),"Footer contains Jordan, contacts and configurable social links");
await go(agent+"master-agent-requests/requests.html");assert(await evaluate('document.getElementById("requestCards").textContent.includes("تجديد رخصة مركبة")'),"Posted Client request appears for Agent");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(requestId));
await evaluate('document.getElementById("editOffer").click();document.getElementById("offerPrice").value="28";document.getElementById("offerDays").value="3";document.getElementById("offerNotes").value="متابعة المعاملة وإبلاغ العميل بالتحديثات اللازمة.";document.getElementById("offerForm").requestSubmit()');
assert(await evaluate('WakeelData.offersFor('+JSON.stringify(requestId)+').length===1'),"Agent submits shared offer");
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(requestId));
assert(await evaluate('document.getElementById("offersList").textContent.includes("وكيل الاختبار")'),"Client sees live Agent identity and offer");
await evaluate('document.querySelector("[data-offer]").click();document.getElementById("wfAcceptOffer").click()');
assert(await evaluate('WakeelData.request('+JSON.stringify(requestId)+').status==="awaiting-payment"'),"Accepted offer awaits payment");
assert(await evaluate('document.querySelector("#contactActions a.whatsapp").href.includes("962787654321")&&document.querySelector("#contactActions a[href^=\\"tel:\\"]").getAttribute("href")==="tel:+962787654321"'),"Client WhatsApp and call target selected Agent");
assert(await evaluate('document.getElementById("chatForm")===null'),"Client internal chat removed");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(requestId));
assert(await evaluate('document.getElementById("progressForm")===null&&document.querySelector("a.whatsapp").href.includes("962791234567")'),"Agent contacts Client and waits for payment");
assert(await evaluate('document.getElementById("chatForm")===null'),"Agent internal chat removed");
await go(client+"master-payments/payments.html?request="+encodeURIComponent(requestId));
assert(await evaluate('document.getElementById("wfPayForm")!==null'),"Payment checkout linked to request");assert(await evaluate('getComputedStyle(document.querySelector(".pay-ef-logo b")).color==="rgb(88, 182, 107)"&&getComputedStyle(document.querySelector(".pay-ef-logo>span>span")).color==="rgb(88, 182, 107)"'),"e and .com use green brand treatment");assert(await evaluate('!document.getElementById("wfDialog").textContent.includes("تجريب")&&getComputedStyle(document.querySelector(".pay-logo text")).fill==="rgb(20, 52, 203)"'),"Payment uses brand colors and clean UI labels");await screenshot("checkout-desktop");
await evaluate('document.getElementById("wfPayAddCard").click();document.getElementById("wfCardNumber").value="4000000000000002";document.getElementById("wfMethodForm").requestSubmit()');
await evaluate('document.getElementById("wfCvc").value="123";document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');await sleep(600);
assert(await evaluate('WakeelData.request('+JSON.stringify(requestId)+').status==="awaiting-payment"&&document.getElementById("wfPayStatus").textContent.includes("تعذر")'),"Card decline keeps request awaiting payment");
await select("wfPayType","bill");await evaluate('document.getElementById("wfBillReference").value="WRONG-BILL";document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');
assert(await evaluate('document.getElementById("wfPayStatus").textContent.includes("لا يطابق")'),"Wrong invoice reference rejected");
await evaluate('document.getElementById("wfBillReference").value=WakeelData.paymentForRequest('+JSON.stringify(requestId)+').billReference;document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayCancel").click();WakeelFlow.open("حوار جديد","<p>يبقى الحوار الحالي مفتوحًا</p>")');await sleep(600);
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(requestId)+').status==="cancelled"&&document.getElementById("wfDialogTitle").textContent==="حوار جديد"'),"Cancellation preserves request and does not replace a newer dialog");
await evaluate('WakeelFlow.close();WakeelData.beginPayment('+JSON.stringify(requestId)+',"bill")');
await go(client+"master-payments/payments.html?request="+encodeURIComponent(requestId));
assert(await evaluate('document.getElementById("wfRecoverPayment")!==null'),"Interrupted payment exposes recovery");
await evaluate('document.getElementById("wfRecoverPayment").click()');
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(requestId)+').status==="cancelled"&&document.getElementById("wfPayForm")!==null'),"Interrupted mock payment can be cancelled and retried");
await evaluate('document.getElementById("wfBillReference").value=WakeelData.paymentForRequest('+JSON.stringify(requestId)+').billReference;document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');await sleep(600);
assert(await evaluate('WakeelData.request('+JSON.stringify(requestId)+').status==="active"&&WakeelData.paymentForRequest('+JSON.stringify(requestId)+').status==="paid"'),"Invoice simulation starts execution");
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(requestId)+').methodType==="bill"&&!JSON.stringify(WakeelData.state).includes("\\"cvv\\"")'),"Payment methods separated and CVV not stored");
await go(client+"master-my-requests/my-requests.html");assert(await evaluate('document.getElementById("requestsBody").textContent.includes('+JSON.stringify(requestId)+')'),"Paid request moves into My Requests");
await go(client+"master-posted-requests/posted-requests.html");assert(await evaluate('!document.getElementById("postedList").textContent.includes('+JSON.stringify(requestId)+')'),"Paid request leaves posted list");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(requestId));

await evaluate('document.getElementById("stage").value="2";document.getElementById("progressNote").value="تمت مراجعة المستندات ونحتاج إلى تأكيد موعد تسليمها.";document.getElementById("progressForm").requestSubmit()');
const noteId=await evaluate('WakeelData.request('+JSON.stringify(requestId)+').updates.at(-1).id');
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(requestId));
assert(await evaluate('document.getElementById("wfAgentNotes").closest(".track-step").textContent.includes("قيد التنفيذ")&&document.getElementById("wfAgentNotes").textContent.includes("ملاحظات الوكيل!")'),"Execution notes appear next to active timeline stage");
await evaluate('document.getElementById("wfAgentNotes").click()');
assert(await evaluate('document.getElementById("wfConversation").textContent.includes("تأكيد موعد تسليمها")'),"Client opens actual Agent execution note");
await evaluate('document.getElementById("wfMessageText").value="يمكنني تسليم المستندات صباح الغد، هل يناسبك؟";document.getElementById("wfMessageForm").requestSubmit()');
assert(await evaluate('WakeelData.request('+JSON.stringify(requestId)+').messages.at(-1).replyTo==='+JSON.stringify(noteId)),"Instant Client reply is linked to execution note");
await screenshot("client-note-chat-desktop");assert(await evaluate('document.querySelector(".request-message-list").querySelector("p").textContent.includes("تأكيد موعد")'),"Opened note is visible in conversation");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(requestId));await evaluate('document.getElementById("wfOpenMessages").click()');
assert(await evaluate('document.getElementById("wfConversation").textContent.includes("صباح الغد")'),"Agent sees Client reply");
await evaluate('document.getElementById("wfMessageText").value="نعم، يناسبني الموعد وسأتابع الإجراءات.";document.getElementById("wfMessageForm").requestSubmit()');
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(requestId)+"#messages");
assert(await evaluate('document.getElementById("wfConversation").textContent.includes("يناسبني الموعد")'),"Client sees Agent message while WhatsApp and call remain");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(requestId));

await evaluate('document.getElementById("stage").value="3";document.getElementById("progressNote").value="تمت متابعة المعاملة واستكمال إجراءات الإنجاز.";document.getElementById("progressForm").requestSubmit();document.getElementById("confirmAction").click()');
assert(await evaluate('WakeelData.request('+JSON.stringify(requestId)+').status==="completed"&&WakeelData.paymentForRequest('+JSON.stringify(requestId)+').entitlement==="pending"'),"Agent completion updates Client request and entitlement");
await go(client+"master-profile-settings/profile.html");await evaluate('document.getElementById("wfAddMethod").click();document.getElementById("wfCardNumber").value="4242424242424242";document.getElementById("wfMethodForm").requestSubmit()');
assert(await evaluate('WakeelData.state.methods.length===2'),"Add payment method from settings");
await evaluate('document.querySelector("[data-default]").click()');assert(await evaluate('WakeelData.state.methods.filter(m=>m.isDefault).length===1'),"Exactly one default payment method");
await screenshot("profile-desktop");
await go(client+"master-creat-request/creat-request.html");await select("ministry","education");await select("governorate","amman");await select("department","education-central");await select("transactionType","other");
await evaluate('document.getElementById("exactTitle").value="معاملة أخرى محددة";document.getElementById("description").value="وصف واضح للمعاملة الخاصة المطلوب متابعتها مع الوزارة.";document.getElementById("createRequestForm").requestSubmit();document.getElementById("wfPublish").click()');await sleep(750);
const second=await evaluate('WakeelData.state.requests.find(r=>r.title==="معاملة أخرى محددة").id');await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(second));
await evaluate('document.getElementById("editOffer").click();document.getElementById("offerPrice").value="22";document.getElementById("offerDays").value="2";document.getElementById("offerNotes").value="متابعة نوع المعاملة وتقديم تحديثات واضحة.";document.getElementById("offerForm").requestSubmit()');
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(second));await evaluate('document.querySelector("[data-offer]").click();document.getElementById("wfAcceptOffer").click()');
await go(client+"master-payments/payments.html?request="+encodeURIComponent(second));await evaluate('document.getElementById("wfCvc").value="123";document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');await sleep(600);
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(second)+').status==="paid"&&WakeelData.paymentForRequest('+JSON.stringify(second)+').methodType==="card"'),"Successful card payment");
const receipt=await evaluate('WakeelData.paymentForRequest('+JSON.stringify(second)+').receipt');
await go(client+"master-profile-settings/profile.html");const defaultId=await evaluate('WakeelData.state.methods.find(m=>m.isDefault).id');await evaluate('document.querySelector("[data-edit=\\"'+defaultId+'\\"]").click();document.getElementById("wfHolder").value="اسم بطاقة محدّث";document.getElementById("wfMethodForm").requestSubmit()');
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(second)+').receipt==='+JSON.stringify(receipt)+'&&WakeelData.paymentForRequest('+JSON.stringify(second)+').methodSnapshot.holder!=="اسم بطاقة محدّث"'),"Updating card preserves prior payment snapshot");
await evaluate('document.querySelector("[data-remove=\\"'+defaultId+'\\"]").click();document.getElementById("wfConfirmRemove").click()');
assert(await evaluate('WakeelData.state.methods.length===1&&WakeelData.paymentForRequest('+JSON.stringify(second)+').status==="paid"'),"Deleting card preserves payment history");
await go("master-register/register.html",false);
await evaluate('document.getElementById("fullName").value="اسم التسجيل";document.getElementById("email").value="register@test.example";document.getElementById("phone").value="0791112223";document.getElementById("city").value="amman";document.getElementById("password").value="testpassword123";document.getElementById("confirmPassword").value="mismatchpass";document.querySelector("input[name=terms]").checked=true;document.getElementById("registerForm").requestSubmit()');
assert(await evaluate('WakeelData.profile("client").fullName!=="اسم التسجيل"'),"Mismatched registration passwords rejected");
await evaluate('document.getElementById("confirmPassword").value="testpassword123";document.getElementById("confirmPassword").dispatchEvent(new Event("input"));document.getElementById("registerForm").requestSubmit()');
assert(await evaluate('WakeelData.profile("client").fullName==="اسم التسجيل"&&!localStorage.getItem(WakeelData.KEY).includes("testpassword123")'),"Registration stores canonical profile without password");

await go(client+"master-Reviews/reviews.html");
assert(await evaluate('document.querySelector("#pendingList [data-review]").dataset.review==='+JSON.stringify(requestId)),"Latest completed transaction appears first");
await evaluate('document.querySelector("[data-review="+CSS.escape('+JSON.stringify(requestId)+')+"]").click();document.querySelector("#wfStars button").dispatchEvent(new KeyboardEvent("keydown",{key:"End",bubbles:true}));document.getElementById("wfReviewTitle").value="خدمة ممتازة";document.getElementById("wfReviewComment").value="تواصل واضح وإنجاز مرتب للمعاملة واستكمال إجراءاتها.";document.getElementById("wfReviewForm").requestSubmit()');
assert(await evaluate('WakeelData.state.reviews.find(r=>r.request==='+JSON.stringify(requestId)+').rating===5'),"Accessible five-star review saved");
await go(agent+"master-agent-reviews/reviews.html");
assert(await evaluate('document.getElementById("reviewsList").textContent.includes("خدمة ممتازة")&&AgentData.state.reviews.some(r=>r.request==='+JSON.stringify(requestId)+')'),"Client rating appears for selected Agent");
const ratingBefore=await evaluate('WakeelData.agentRating("agent-1").count');
await go(client+"master-Reviews/reviews.html");await evaluate('document.querySelector("[data-review="+CSS.escape('+JSON.stringify(requestId)+')+"]").click();document.querySelectorAll("#wfStars button")[3].click();document.getElementById("wfReviewForm").requestSubmit()');
assert(await evaluate('WakeelData.agentRating("agent-1").count==='+String(ratingBefore)+'&&WakeelData.state.reviews.find(r=>r.request==='+JSON.stringify(requestId)+').rating===4'),"Editing rating recalculates without double-counting");
await go(client+"master-Support-Help/support.html");await evaluate('document.getElementById("newTicketTop").click()');await select("ticketCategory","requests");
assert(await evaluate('[...document.getElementById("ticketReason").options].some(o=>o.value==="delay")&&![...document.getElementById("ticketReason").options].some(o=>o.value==="failed")'),"Support reasons follow selected problem type");
await select("ticketReason","delay");await evaluate('document.getElementById("ticketRequestSearch").value='+JSON.stringify(requestId)+';document.getElementById("ticketRequestSearch").dispatchEvent(new Event("input",{bubbles:true}))');
assert(await evaluate('document.querySelectorAll("#ticketRequestOptions [role=option]").length===1'),"Support request searchable by transaction number");
await evaluate('document.querySelector("#ticketRequestOptions [role=option]").click()');
assert(await evaluate('document.getElementById("ticketAssignee").textContent.includes("وكيل الاختبار")'),"Ticket shows selected Agent");
await evaluate('document.getElementById("ticketDescription").value="أحتاج إلى متابعة توضيح حالة المعاملة وتفاصيل الإجراءات.";document.getElementById("ticketForm").requestSubmit()');
const ticketId=await evaluate('WakeelData.state.supportTickets[0].id');
await evaluate('document.getElementById("ticketReplyText").value="توضيح إضافي بشأن المشكلة والمعاملة.";document.getElementById("ticketReplyForm").requestSubmit()');
await evaluate('localStorage.removeItem("wakeel_admin_demo_v1")');
await go(admin+"master-admin-support/support.html",false);
assert(await evaluate('document.getElementById("ticketsTable").textContent.includes('+JSON.stringify(ticketId)+')'),"Client ticket reaches Admin");
await evaluate('document.querySelector("[data-ticket="+CSS.escape('+JSON.stringify(ticketId)+')+"]").click();document.getElementById("replyText").value="تم استلام المشكلة وجارٍ مراجعة تفاصيلها.";document.getElementById("replyForm").requestSubmit()');
assert(await evaluate('WakeelData.state.supportTickets.find(t=>t.id==='+JSON.stringify(ticketId)+').messages.at(-1).role==="admin"'),"Admin sends shared reply");
await go(client+"master-Support-Help/support.html?id="+encodeURIComponent(ticketId));
assert(await evaluate('document.getElementById("ticketChat").textContent.includes("تم استلام المشكلة")'),"Client sees Admin reply");
await go(admin+"master-admin-support/support.html?id="+encodeURIComponent(ticketId),false);
await evaluate('document.querySelector("[data-action=update]").click();document.getElementById("ticketState").value="resolved";document.getElementById("actionReason").value="تمت مراجعة المشكلة وتوضيح الإجراءات.";document.getElementById("reasonForm").requestSubmit()');
await go(client+"master-Support-Help/support.html?id="+encodeURIComponent(ticketId));
assert(await evaluate('document.getElementById("ticketLiveStatus").textContent==="محلولة"&&document.getElementById("ticketReplyForm").hidden'),"Resolved ticket status reaches Client and locks replies");

await go(agent+"master-agent-support/support.html");
await evaluate('document.getElementById("newTicket").click()');await select("ticketCategory","requests");await select("ticketReason","delay");await select("ticketRequest",second);
await evaluate('document.getElementById("ticketDescription").value="أحتاج إلى توضيح الإجراءات المطلوبة ومتابعة الشكوى المرتبطة بالمعاملة.";document.getElementById("ticketForm").requestSubmit()');
const agentTicket=await evaluate('WakeelData.state.supportTickets.find(t=>t.owner==="agent-1").id');
await evaluate('document.getElementById("agentTicketText").value="هذه ملاحظتي الإضافية من حساب الوكيل.";document.getElementById("agentTicketReply").requestSubmit()');
await go(admin+"master-admin-support/support.html?id="+encodeURIComponent(agentTicket),false);
assert(await evaluate('document.getElementById("adminTicketChat").textContent.includes("حساب الوكيل")'),"Manager receives Agent ticket and messages");
await evaluate('document.getElementById("replyText").value="استلمت الشكوى وسأراجع تفاصيل المعاملة.";document.getElementById("replyForm").requestSubmit()');
await go(agent+"master-agent-support/support.html?id="+encodeURIComponent(agentTicket));
assert(await evaluate('document.getElementById("agentTicketChat").textContent.includes("استلمت الشكوى")'),"Agent sees Manager reply in ticket chat");
await screenshot("agent-support-chat-desktop");
await go(admin+"master-admin-settings/settings.html",false);
assert(await evaluate('AdminData.state.admins.length===1&&AdminData.actor.name==="مدير المنصة"&&document.getElementById("sessionActor")===null&&document.getElementById("adminsTable")===null'),"Settings contain only Manager with no account switching");
assert(await evaluate('!document.querySelector("a[href*=master-admin-reviews]")&&!AdminData.can("reviews.view")'),"Admin review module and permissions removed");
await screenshot("manager-settings-desktop");
await go(admin+"master-admin-audit/audit.html",false);
assert(await evaluate('[...document.getElementById("entity").options].map(o=>o.value).join(",")==="all,user,agent,ticket,request,payment"&&AdminData.auditEntries.some(a=>a.action==="request.progress")'),"Audit lists real project events with focused record types");
await screenshot("audit-desktop");
for(const role of ["client","agent","admin"]){await go("master-login/login.html",false);await evaluate('document.querySelector("[data-demo="+CSS.escape('+JSON.stringify(role)+')+"]").click();document.getElementById("loginForm").requestSubmit()');await sleep(650);assert(await evaluate('WakeelSession.current().role==='+JSON.stringify(role)+'&&location.pathname.endsWith(WakeelSession.accounts.find(a=>a.role==='+JSON.stringify(role)+').path)'),"Demo login routes: "+role);}
await evaluate('document.querySelector("#shared-navbar .nav-logout").click()');await sleep(500);
assert(await evaluate('WakeelSession.current()===null'),"Logout clears demo session");
await go("master-login/login.html",false);await evaluate('document.getElementById("email").value="admin@wakeel.test";document.getElementById("password").value="wrong-pass";document.getElementById("loginForm").requestSubmit()');
assert(await evaluate('!document.getElementById("loginError").hidden&&location.pathname.endsWith("/master-login/login.html")'),"Wrong demo password does not navigate");
await screenshot("demo-login-desktop");
await go(client+"master-payments/payments.html?request="+encodeURIComponent(second));
await screenshot("payment-receipt-desktop");
await go(client+"master-profile-settings/profile.html");await evaluate('document.getElementById("wfAddMethod").click()');await screenshot("add-card-desktop");await evaluate('WakeelFlow.close()');
await go(client+"master-payments/payments.html");
await evaluate('document.getElementById("payLookupOpen").click();document.getElementById("payLookupNumber").value='+JSON.stringify(second)+';document.getElementById("payLookupForm").requestSubmit()');
assert(await evaluate('document.getElementById("wfDialogTitle").textContent==="إيصال الدفع"'),"Payment lookup finds only linked invoice");


async function readyPayment(title){return evaluate('(()=>{const r=WakeelData.create({ministryId:"education",city:"amman",departmentId:"education-central",serviceId:"other",exactTitle:'+JSON.stringify(title)+',description:"طلب متابعة إجراء مرتبط بالوزارة لاستكمال المستندات المطلوبة.",budget:35,targetDays:7}).value;const o=WakeelData.submitOffer(r.id,{price:24,days:3,notes:"متابعة كاملة للمعاملة والوثائق المطلوبة."}).value;WakeelData.acceptOffer(r.id,o.id);return r.id;})()');}
await go(client+"master-payments/payments.html");
const efRequest=await readyPayment("معاملة الدفع عبر إي فواتيركم");
await go(client+"master-payments/payments.html?request="+encodeURIComponent(efRequest));await select("wfPayType","efawateercom");
await evaluate('document.getElementById("wfBillReference").value=WakeelData.paymentForRequest('+JSON.stringify(efRequest)+').billReference;document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');await sleep(600);
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(efRequest)+').methodType==="efawateercom"&&WakeelData.request('+JSON.stringify(efRequest)+').status==="active"'),"eFAWATEERcom checkout records its own method");
const orangeRequest=await readyPayment("معاملة الدفع عبر Orange Money");
await go(client+"master-payments/payments.html?request="+encodeURIComponent(orangeRequest));await select("wfPayType","orange-money");
await evaluate('document.getElementById("payWalletPhone").value="07123";document.getElementById("wfPayForm").requestSubmit()');
assert(await evaluate('document.getElementById("wfPayStatus").textContent.includes("رقم محفظة")&&WakeelData.paymentForRequest('+JSON.stringify(orangeRequest)+').status==="pending"'),"Orange Money validates wallet before confirmation");
await evaluate('document.getElementById("payWalletPhone").value="+962791234567"');await screenshot("orange-checkout-desktop");
await evaluate('document.getElementById("wfPayForm").requestSubmit();document.getElementById("wfPayForm").requestSubmit()');await sleep(600);
assert(await evaluate('WakeelData.paymentForRequest('+JSON.stringify(orangeRequest)+').methodType==="orange-money"&&WakeelData.paymentForRequest('+JSON.stringify(orangeRequest)+').methodSnapshot.last4==="4567"'),"Orange Money has separate masked payment snapshot");
await go(client+"master-notifications/notifications.html");
assert(await evaluate('document.getElementById("notificationList").textContent.includes("تحديث حالة تذكرة الدعم")&&document.querySelector("a[href*=master-Support-Help]")!==null'),"Support notification opens linked ticket");

const rolePages=[client+"master-client-dash/client-dash.html",client+"master-creat-request/creat-request.html",client+"master-posted-requests/posted-requests.html",client+"master-my-requests/my-requests.html",client+"master-request-details/request-details.html?id="+encodeURIComponent(requestId),client+"master-payments/payments.html",client+"master-profile-settings/profile.html",client+"master-notifications/notifications.html",client+"master-Reviews/reviews.html",client+"master-Support-Help/support.html",agent+"master-agent-dash/dashboard.html",agent+"master-agent-requests/requests.html",agent+"master-agent-my-requests/my-requests.html",agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(second),agent+"master-agent-payments/payments.html",agent+"master-agent-profile-settings/profile.html",agent+"master-agent-notifications/notifications.html",agent+"master-agent-reviews/reviews.html",agent+"master-agent-support/support.html"];
for(const page of rolePages){await go(page);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),"Desktop fits: "+page);if(page.startsWith(client)){assert(await evaluate('[...document.querySelectorAll(".sidebar .side-nav a")].map(a=>a.dataset.nav).join(",")==="dashboard,posted,requests,create,payments,notifications,profile,reviews,support"&&document.querySelectorAll(".sidebar [aria-current=page]").length==='+(page.includes("request-details")?"0":"1")), "Stable Client navigation: "+page);}}
console.log("Client/Agent workflow and desktop regression verified.");
await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
for(const page of rolePages){await go(page);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),"Mobile fits: "+page);}
await go(client+"master-profile-settings/profile.html");await evaluate('document.getElementById("wfAddMethod").click()');await screenshot("add-card-mobile");assert(await evaluate('document.getElementById("wfDialog").scrollWidth<=document.getElementById("wfDialog").clientWidth+1'),"Add card fits mobile");await go(client+"master-payments/payments.html");const mobileRequest=await readyPayment("معاملة لمراجعة الدفع على الهاتف");await go(client+"master-payments/payments.html?request="+encodeURIComponent(mobileRequest));await screenshot("checkout-mobile");assert(await evaluate('document.getElementById("wfDialog").scrollWidth<=document.getElementById("wfDialog").clientWidth+1'),"Checkout fits mobile");await go(client+"master-Support-Help/support.html");await evaluate('document.getElementById("newTicketTop").click()');await screenshot("support-form-mobile");assert(await evaluate('document.getElementById("wfDialog").scrollWidth<=document.getElementById("wfDialog").clientWidth+1'),"Support form fits mobile");await go(client+"master-creat-request/creat-request.html");await screenshot("create-mobile");await go(client+"master-posted-requests/posted-requests.html");await screenshot("posted-mobile");
await evaluate('localStorage.removeItem("wakeel_admin_demo_v1")');
await go(admin+"master-admin-request-details/request-details.html?id=REQ-3002",false);
assert(await evaluate('!document.querySelector("[data-action=conversation]")&&!AdminData.can("conversations.view")'),"Admin conversation access removed");
await go(admin+"master-admin-settings/settings.html",false);
assert(await evaluate('!Object.hasOwn(AdminData.permissions,"conversations.view")'),"Conversation permission removed");

await go(admin+"master-admin-settings/settings.html",false);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),"Manager settings fit mobile");await screenshot("manager-settings-mobile");
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(requestId));await evaluate('document.getElementById("wfAgentNotes").click()');assert(await evaluate('document.getElementById("wfDialog").scrollWidth<=document.getElementById("wfDialog").clientWidth+1'),"Execution note chat fits mobile");await screenshot("client-note-chat-mobile");
await go(agent+"master-agent-support/support.html?id="+encodeURIComponent(agentTicket));await screenshot("agent-support-chat-mobile");
await go("master-login/login.html",false);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),"Demo login fits mobile");await screenshot("demo-login-mobile");
await go(client+"master-client-dash/client-dash.html");await evaluate('document.querySelector("#shared-footer").scrollIntoView({behavior:"instant",block:"start"})');await sleep(500);assert(await evaluate('document.querySelector(".footer-contact").getBoundingClientRect().height>0&&[...document.querySelectorAll(".footer-social")].every(a=>a.getBoundingClientRect().width>0)'),"Footer contact column and social icons stay visible on mobile");await evaluate('document.querySelector(".footer-contact").scrollIntoView({behavior:"instant",block:"center"})');await sleep(100);await screenshot("footer-mobile");

/* Shared administration, fixed service fee, cascading filters and compact history. */
await send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await go(agent+"master-agent-requests/requests.html");
assert(await evaluate('["ministry","governorate","department"].every(id=>document.getElementById(id+"Search")?.getAttribute("role")==="combobox")'),"Agent filters reuse searchable Client controls");
await select("ministry","interior");await select("governorate","irbid");
assert(await evaluate('[...document.getElementById("department").options].filter(o=>o.value).every(o=>{const d=WakeelCatalogue.get("departments",o.value);return d.ministry==="interior"&&(!d.city||d.city==="irbid")})'),"Agent directorates match ministry and governorate");
await select("department","dvld");await select("governorate","amman");
assert(await evaluate('document.getElementById("department").value===""'),"Changing governorate clears directorate filter");
await evaluate('document.getElementById("resetFilters").click()');
assert(await evaluate('document.getElementById("ministry").value===""&&document.getElementById("department").disabled'),"Reset restores all available requests");
await go(client+"master-payments/payments.html");
const feeRequest=await readyPayment("اختبار الرسوم الثابتة");
await go(client+"master-payments/payments.html?request="+encodeURIComponent(feeRequest));
assert(await evaluate('document.querySelector(".pay-summary").textContent.includes("رسوم خدمة وكيل")&&document.querySelector(".pay-summary-total strong").textContent===WakeelFlow.money(25)&&WakeelData.paymentForRequest('+JSON.stringify(feeRequest)+').agentAmount===24'),"Checkout total includes exactly one dinar service fee");
await screenshot("checkout-service-fee-desktop");
await evaluate('WakeelFlow.close()');
const hiddenRequest=await evaluate('WakeelData.create({ministryId:"interior",city:"irbid",departmentId:"dvld",serviceId:"other",exactTitle:"معاملة فحص حظر الإدارة",description:"معاملة خاصة للتحقق من انعكاس الحظر بين الأدوار.",budget:35,targetDays:7}).value.id');
await go(admin+"master-admin-request-details/request-details.html?id="+encodeURIComponent(hiddenRequest),false);
await evaluate('document.querySelector("[data-action=visibility]").click();document.getElementById("actionReason").value="حظر الطلب للمراجعة من مدير المنصة.";document.getElementById("reasonForm").requestSubmit()');
assert(await evaluate('WakeelData.request('+JSON.stringify(hiddenRequest)+').visibility==="hidden"'),"Admin hide updates canonical request");
await go(client+"master-posted-requests/posted-requests.html");
assert(await evaluate('[...document.querySelectorAll("#postedList article")].find(a=>a.textContent.includes('+JSON.stringify(hiddenRequest)+'))?.querySelector(".wf-pill.blocked")?.textContent==="محظورة"'),"Client sees concise blocked status on posted request");
await go(agent+"master-agent-requests/requests.html");
await evaluate('document.getElementById("search").value='+JSON.stringify(hiddenRequest)+';document.getElementById("search").dispatchEvent(new Event("input",{bubbles:true}))');
assert(await evaluate('document.querySelectorAll("#requestCards .request-card").length===0'),"Hidden request disappears from Agent available list");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(hiddenRequest));
assert(await evaluate('!document.getElementById("editOffer")&&document.querySelector("#detailContent .wf-pill.blocked")?.textContent==="محظورة"&&!document.querySelector(".wf-admin-notice")'),"Direct stale request page blocks new offers");
await go(admin+"master-admin-request-details/request-details.html?id="+encodeURIComponent(hiddenRequest),false);
await evaluate('document.querySelector("[data-action=visibility]").click();document.getElementById("actionReason").value="تمت مراجعة الطلب وإعادة إظهاره.";document.getElementById("reasonForm").requestSubmit()');
await changeAdminStatus(hiddenRequest,"suspended");
await go(client+"master-posted-requests/posted-requests.html");
assert(await evaluate('[...document.querySelectorAll("#postedList article")].find(a=>a.textContent.includes('+JSON.stringify(hiddenRequest)+'))?.querySelector(".wf-pill.suspended")?.textContent==="موقوفة"'),"Suspended unassigned request remains visible in Client posted list");
await changeAdminStatus(hiddenRequest,"resume");
await go(client+"master-payments/payments.html");
const historyIds=[];
async function addHistoryPayment(index){const rid=await readyPayment("سجل مالي للاختبار "+index);await evaluate('(()=>{const t=WakeelData.beginPayment('+JSON.stringify(rid)+',"bill").value;const result=WakeelData.finishPayment(t.payment.id,t.attempt.id,"success");if(!result.ok)throw Error(result.error);})()');historyIds.push(rid);}
for(let i=1;i<=4;i++)await addHistoryPayment(i);
await evaluate('document.getElementById("paySearch").value="سجل مالي للاختبار";document.getElementById("paySearch").dispatchEvent(new Event("input"))');
assert(await evaluate('document.querySelectorAll(".pay-history-item").length===4&&document.getElementById("showAllPayments").hidden'),"Four operations have no show-all link");
await addHistoryPayment(5);
assert(await evaluate('document.querySelectorAll(".pay-history-item").length===5&&document.getElementById("showAllPayments").hidden'),"Exactly five operations have no redundant show-all link");
await addHistoryPayment(6);
assert(await evaluate('document.querySelectorAll(".pay-history-item").length===5&&!document.getElementById("showAllPayments").hidden&&document.querySelector(".pay-history-item").textContent.includes("سجل مالي للاختبار 6")'),"History shows five latest operations with show-all for sixth");
await evaluate('document.getElementById("showAllPayments").click()');
assert(await evaluate('document.querySelectorAll(".pay-history-item").length===6&&getComputedStyle(document.getElementById("paymentsBody")).overflowY==="auto"'),"Show-all expands entire filtered history with scrolling");
assert(await evaluate('document.getElementById("history").parentElement.classList.contains("pay-aside")&&!document.querySelector(".pay-fees")'),"History occupies removed fee explanation card position");
await screenshot("payment-history-desktop");
async function changeAdminStatus(rid,status){await go(admin+"master-admin-request-details/request-details.html?id="+encodeURIComponent(rid),false);await evaluate('document.querySelector("[data-action=status]").click()');await select("requestStatus",status);await evaluate('document.getElementById("actionReason").value="تحديث حالة المعاملة للتحقق من الربط المشترك.";document.getElementById("reasonForm").requestSubmit()');}
const activeId=historyIds[0];
await changeAdminStatus(activeId,"suspended");
await go(client+"master-my-requests/my-requests.html");
assert(await evaluate('[...document.querySelectorAll("#requestsBody tr")].find(r=>r.textContent.includes('+JSON.stringify(activeId)+'))?.querySelector(".wf-pill.suspended")?.textContent==="موقوفة"'),"Client request list reflects Admin suspension");
await go(agent+"master-agent-request-details/request-details.html?id="+encodeURIComponent(activeId));
assert(await evaluate('!document.getElementById("progressForm")&&document.querySelector("#detailContent .wf-pill.suspended")?.textContent==="موقوفة"&&!document.querySelector(".wf-admin-notice")'),"Agent sees suspension and cannot progress");
await changeAdminStatus(activeId,"resume");
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(activeId));
assert(await evaluate('document.getElementById("statusBadge").textContent==="قيد التنفيذ"&&!document.querySelector(".wf-admin-notice")&&document.getElementById("statusHint").textContent===""'),"Resume restores actual status without an administrative sentence");
await changeAdminStatus(activeId,"cancelled");
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(activeId));
assert(await evaluate('document.getElementById("statusBadge").textContent==="ملغاة"&&!document.getElementById("requestAdminNotice")&&!document.querySelector(".wf-admin-notice")&&document.getElementById("statusHint").textContent===""&&WakeelData.request('+JSON.stringify(activeId)+').status==="cancelled"'),"Admin cancellation appears in Client details");
await changeAdminStatus(historyIds[1],"completed");
await go(client+"master-request-details/request-details.html?id="+encodeURIComponent(historyIds[1]));
assert(await evaluate('document.getElementById("statusBadge").textContent==="مكتملة"&&!document.getElementById("requestAdminNotice")&&WakeelData.request('+JSON.stringify(historyIds[1])+').status==="completed"'),"Admin completion appears in Client details");
await go(admin+"master-admin-payments/payments.html",false);
assert(await evaluate('document.querySelectorAll(".metric-number")[1].textContent===AdminUI.money(WakeelData.platformRevenue())&&document.querySelectorAll(".metric")[1].textContent.includes("إيراد رسوم خدمة وكيل")'),"Admin settled card shows earned service fees rather than Agent payouts");
await screenshot("admin-service-revenue-desktop");
await go(agent+"master-agent-payments/payments.html");
assert(await evaluate('document.getElementById("paymentsTable").textContent.includes(WakeelFlow.money(24))'),"Agent financial view retains offer fees without platform charge");
await go(admin+"master-admin-users/users.html",false);
assert(await evaluate('!document.getElementById("approval")&&["search","type","status"].every(id=>document.getElementById(id))'),"Only requested Agent review filter is removed");
await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
for(const page of [agent+"master-agent-requests/requests.html",client+"master-payments/payments.html",admin+"master-admin-payments/payments.html",admin+"master-admin-users/users.html"]){await go(page,!page.startsWith(admin));assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),"Updated page fits mobile: "+page);await screenshot(page.includes("master-agent-requests")?"available-filters-mobile":page.includes("master-admin-payments")?"admin-revenue-mobile":page.includes("master-admin-users")?"admin-users-mobile":"history-mobile");}

/* Verify actual cross-tab storage events, without reloading either role page. */
await go(admin+"master-admin-users/users.html",false);
const liveId=await evaluate('WakeelData.create({ministryId:"interior",city:"irbid",departmentId:"dvld",serviceId:"dvld-1",description:"Cross-tab administrative visibility verification.",budget:35,targetDays:7}).value.id');
const liveTarget=await send("Target.createTarget",{url:origin+"/"+client+"master-posted-requests/posted-requests.html"});
let secondSocket;
try{
let target;for(let i=0;i<50&&!target;i++){target=(await (await fetch("http://127.0.0.1:9353/json/list")).json()).find(t=>t.id===liveTarget.targetId);if(!target)await sleep(50);}
secondSocket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{secondSocket.addEventListener("open",resolve,{once:true});secondSocket.addEventListener("error",reject,{once:true});});
let serial=0;const requests=new Map();secondSocket.addEventListener("message",event=>{const r=JSON.parse(event.data);if(r.id&&requests.has(r.id)){const done=requests.get(r.id);requests.delete(r.id);r.error?done.reject(Error(r.error.message)):done.resolve(r.result);}});
function otherSend(method,params={}){return new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{requests.delete(id);reject(Error("Other tab timeout"));},20000);requests.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});secondSocket.send(JSON.stringify({id,method,params}));});}
async function otherEval(expression){const r=await otherSend("Runtime.evaluate",{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
await otherSend("Runtime.enable");await otherSend("Network.enable");await otherSend("Network.setBlockedURLs",{urls:["*fonts.googleapis.com*","*fonts.gstatic.com*","*lottie.host*"]});
for(let i=0;i<160;i++){if(await otherEval('document.readyState!=="loading"&&Boolean(window.WakeelData)&&Boolean(document.getElementById("postedList"))'))break;await sleep(50);}
await evaluate('(()=>{const r=AdminData.execute("request.visibility",{id:'+JSON.stringify(liveId)+',visibility:"hidden",reason:"Cross-tab hide action."});if(!r.ok)throw Error(r.error);})()');await sleep(350);
assert(await otherEval('[...document.querySelectorAll("#postedList article")].find(a=>a.textContent.includes('+JSON.stringify(liveId)+'))?.querySelector(".wf-pill.blocked")?.textContent==="محظورة"'),"Admin hide reaches already-open Client tab via storage event");
await otherSend("Page.navigate",{url:origin+"/"+agent+"master-agent-requests/requests.html"});
for(let i=0;i<160;i++){if(await otherEval('document.readyState!=="loading"&&Boolean(window.AgentUI)&&Boolean(document.getElementById("requestCards"))'))break;await sleep(50);}
await evaluate('AdminData.execute("request.visibility",{id:'+JSON.stringify(liveId)+',visibility:"visible",reason:"Cross-tab show action."})');await sleep(350);
assert(await otherEval('document.getElementById("requestCards").textContent.includes('+JSON.stringify(liveId)+')'),"Admin restore reaches already-open Agent list via storage event");
}finally{secondSocket?.close();await send("Target.closeTarget",{targetId:liveTarget.targetId});}
await go(client+"master-payments/payments.html");await evaluate('document.getElementById("history").scrollIntoView({block:"start",behavior:"instant"})');await sleep(100);await screenshot("history-detail-mobile");
await go(agent+"master-agent-requests/requests.html");await evaluate('document.getElementById("ministrySearch").focus()');await screenshot("agent-filter-search-mobile");

assert(errors.length===0,"No JavaScript runtime errors");
console.log(JSON.stringify({passed:checks.length,runtimeErrors:errors,artifacts:output,checks},null,2));
})().catch(e=>{console.error(e.stack);console.error(JSON.stringify({passed:checks.length,runtimeErrors:errors,artifacts:output}));process.exitCode=1;}).finally(()=>{ws?.close();server?.close();browser?.kill();setTimeout(()=>process.exit(process.exitCode||0),500);});


