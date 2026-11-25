
/* Campusly rubric module: role-aware demo auth + React admin console.
   This is a browser-only teaching prototype, not production authentication. */
(function () {
  "use strict";
  const USERS_KEY = "campuslyUsers";
  const SESSION_KEY = "campuslySession";
  const ADMIN_EMAIL = "admin@campusly.com";
  const ADMIN_PASSWORD = "Admin@123";
  const STUDENT_EMAIL = "demo@campusly.com";
  const STUDENT_PASSWORD = "campusly123";

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const currentSession = () => read(SESSION_KEY, null);
  const showApp = (session) => {
    write(SESSION_KEY, session);
    const auth = document.getElementById("authScreen");
    if (auth) auth.style.display = "none";
    const adminNav = document.getElementById("adminNav");
    if (adminNav) adminNav.style.display = session.role === "admin" ? "flex" : "none";
    const topName = document.querySelector(".top .user span, .top .user");
    if (topName && session.name) topName.textContent = session.name;
    document.body.dataset.role = session.role;
    document.body.classList.toggle("admin-mode", session.role === "admin");
    document.dispatchEvent(new CustomEvent("campusly:session", { detail: session }));
  };
  const showAuth = () => {
    localStorage.removeItem(SESSION_KEY);
    const auth = document.getElementById("authScreen");
    if (auth) auth.style.display = "";
    const adminNav = document.getElementById("adminNav");
    if (adminNav) adminNav.style.display = "none";
    const adminModal = document.getElementById("adminConsoleModal");
    if (adminModal) { adminModal.classList.remove("open"); adminModal.setAttribute("aria-hidden","true"); }
    document.body.dataset.role = "guest";
    document.body.classList.remove("admin-mode");
    const loginForm = document.getElementById("loginForm");
    if (loginForm) loginForm.reset();
    setError("loginError","You have been signed out successfully.");
    document.dispatchEvent(new CustomEvent("campusly:session-ended"));
  };
  window.campuslyLogout = function(requireConfirmation=true) {
    if (requireConfirmation && !window.confirm("Are you sure you want to sign out of Campusly?")) return false;
    showAuth();
    return true;
  };
  const setError = (id, message) => { const el = document.getElementById(id); if (el) el.textContent = message; };

  // Seed transparent demonstration accounts. Never use real passwords here.
  const users = read(USERS_KEY, []);
  if (!users.some(u => u.email === ADMIN_EMAIL)) users.push({name:"Campusly Administrator",email:ADMIN_EMAIL,password:ADMIN_PASSWORD,role:"admin",course:"Campus Administration"});
  if (!users.some(u => u.email === STUDENT_EMAIL)) users.push({name:"Bandile Dlamini",email:STUDENT_EMAIL,password:STUDENT_PASSWORD,role:"student",course:"Data Science & AI"});
  write(USERS_KEY, users);

  // Capture phase makes these checks authoritative over the original front-end demo handlers.
  document.addEventListener("click", function (event) {
    const target = event.target.closest("#demoBtn");
    if (!target) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    if (email) email.value = STUDENT_EMAIL;
    if (password) password.value = STUDENT_PASSWORD;
    showApp({name:"Bandile Dlamini",email:STUDENT_EMAIL,role:"student"});
  }, true);

  document.addEventListener("submit", function (event) {
    const form = event.target;
    if (form.id === "loginForm") {
      event.preventDefault(); event.stopImmediatePropagation();
      const email = (document.getElementById("loginEmail")?.value || "").trim().toLowerCase();
      const password = document.getElementById("loginPassword")?.value || "";
      if (!email || !password) return setError("loginError","Enter your email and password.");
      const account = read(USERS_KEY, []).find(u => u.email.toLowerCase() === email && u.password === password);
      if (!account) return setError("loginError","Account not found or password incorrect. Try the demo account.");
      if (account.status === "Suspended") return setError("loginError","This account is suspended. Contact Campusly support.");
      setError("loginError","");
      const profile = read("campuslyProfile",{});
      if (account.role !== "admin" && account.name) write("campuslyProfile",{...profile,name:account.name,course:account.course||profile.course});
      showApp({name:account.name,email:account.email,role:account.role});
    }
    if (form.id === "registerForm") {
      event.preventDefault(); event.stopImmediatePropagation();
      if (read("campuslyAdminSettings",{}).registration === false) return setError("registerError","Student registration is temporarily paused.");
      const name=(document.getElementById("regName")?.value||"").trim();
      const course=(document.getElementById("regCourse")?.value||"").trim();
      const email=(document.getElementById("regEmail")?.value||"").trim().toLowerCase();
      const password=document.getElementById("regPassword")?.value||"";
      const confirm=document.getElementById("regConfirm")?.value||"";
      const terms=document.getElementById("terms");
      if(!name||!course||!email||!password||!confirm) return setError("registerError","Complete every field.");
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("registerError","Enter a valid email address.");
      if(password.length<8) return setError("registerError","Use at least 8 characters for your password.");
      if(password!==confirm) return setError("registerError","Your passwords do not match.");
      if(terms&&!terms.checked) return setError("registerError","Please accept the community guidelines.");
      const list=read(USERS_KEY,[]);
      if(list.some(u=>u.email===email)) return setError("registerError","An account with this email already exists.");
      const account={name,email,password,course,role:"student"};
      list.push(account); write(USERS_KEY,list);
      write("campuslyProfile",{name,course,bio:"New Campusly student"});
      setError("registerError","");
      showApp({name,email,role:"student"});
    }
  }, true);

  document.addEventListener("click", function (event) {
    if (!event.target.closest("#logoutBtn")) return;
    event.preventDefault(); event.stopImmediatePropagation();
    window.campuslyLogout(true);
  }, true);

  // Restore an active demo session after refresh.
  const session=currentSession();
  if(session && ["admin","student"].includes(session.role)) showApp(session);

  const modal=document.getElementById("adminConsoleModal");
  const nav=document.getElementById("adminNav");
  const close=document.getElementById("closeAdminConsole");
  function openAdmin(){
    const s=currentSession();
    if(!s || s.role!=="admin"){ alert("Administrator access is required."); return; }
    if(!window.React || !window.ReactDOM){ alert("React could not load. Check your internet connection."); return; }
    modal.classList.add("open"); modal.setAttribute("aria-hidden","false");
    window.dispatchEvent(new Event("campusly:admin-open"));
  }
  nav?.addEventListener("click",openAdmin);
  close?.addEventListener("click",()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");});
  modal?.addEventListener("click",e=>{if(e.target===modal){modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && modal?.classList.contains("open")){
      modal.classList.remove("open");modal.setAttribute("aria-hidden","true");
    }
    if((e.ctrlKey||e.metaKey) && e.shiftKey && e.key.toLowerCase()==="a"){
      const session=currentSession();
      if(session?.role==="admin"){e.preventDefault();openAdmin();}
    }
  });

  if(window.React && window.ReactDOM && document.getElementById("campusly-admin-root")){
    const h=React.createElement;
    const AUDIT_KEY="campuslyAdminAudit";
    const REPORTS_KEY="campuslyReports";
    const SUPPORT_KEY="campuslySupport";
    const FEEDBACK_KEY="campuslyFeedback";
    const logAction=(action,detail)=>{
      const rows=read(AUDIT_KEY,[]);
      rows.unshift({id:Date.now()+Math.random(),action,detail,by:currentSession()?.email||"admin",at:new Date().toLocaleString()});
      write(AUDIT_KEY,rows.slice(0,100));
    };
    function AdminStat({label,value,caption,icon}){return h("article",{className:"control-stat"},h("span",{className:"control-stat-icon"},icon),h("div",null,h("small",null,label),h("strong",null,value),h("em",null,caption)));}
    function AdminControlCenter(){
      const [section,setSection]=React.useState("Overview");
      const [posts,setPosts]=React.useState(()=>read("campuslyPosts",[]));
      const [events,setEvents]=React.useState(()=>read("campuslyAdminEvents",[
        {id:"event-afro",name:"Afro Fest 2026",date:"06 Dec 2026 · 6:00 PM",place:"Main Auditorium",description:"Campus cultural celebration",status:"Published"},
        {id:"event-soccer",name:"Inter-Dept Soccer",date:"10 Dec 2026 · 3:00 PM",place:"Sports Complex",description:"Inter-department tournament",status:"Published"},
        {id:"event-hack",name:"Campus Hackathon",date:"14 Dec 2026 · 9:00 AM",place:"Innovation Lab",description:"Student build challenge",status:"Pending"}
      ]));
      const [clubs,setClubs]=React.useState(()=>read("campuslyAdminClubs",[
        {id:"club-code",name:"Coding Club",description:"Build and learn together",status:"Active",members:1200},
        {id:"club-photo",name:"Photography Club",description:"Campus photography community",status:"Active",members:840},
        {id:"club-robot",name:"Robotics Club",description:"Hands-on robotics",status:"Pending",members:510}
      ]));
      const [people,setPeople]=React.useState(()=>read(USERS_KEY,[]));
      const [reports,setReports]=React.useState(()=>read(REPORTS_KEY,[]));
      const [support,setSupport]=React.useState(()=>read(SUPPORT_KEY,[]));
      const [feedback,setFeedback]=React.useState(()=>read(FEEDBACK_KEY,[]));
      const [audit,setAudit]=React.useState(()=>read(AUDIT_KEY,[]));
      const [query,setQuery]=React.useState("");
      const [notice,setNotice]=React.useState("Welcome back. All control-centre changes are saved in this browser.");
      const [showEventForm,setShowEventForm]=React.useState(false);
      const [showClubForm,setShowClubForm]=React.useState(false);
      const [eventDraft,setEventDraft]=React.useState({name:"",date:"",place:"",description:""});
      const [clubDraft,setClubDraft]=React.useState({name:"",description:""});
      const [selectedUser,setSelectedUser]=React.useState(null);
      const [settings,setSettings]=React.useState(()=>read("campuslyAdminSettings",{maintenance:false,registration:true,posts:true,comments:true}));
      const refresh=()=>{
        setPosts(read("campuslyPosts",[]));setEvents(read("campuslyAdminEvents",[]));setClubs(read("campuslyAdminClubs",[]));
        setPeople(read(USERS_KEY,[]));setReports(read(REPORTS_KEY,[]));setSupport(read(SUPPORT_KEY,[]));
        setFeedback(read(FEEDBACK_KEY,[]));setAudit(read(AUDIT_KEY,[]));
      };
      const filtered=(items,fields)=>items.filter(item=>fields.some(k=>String(item[k]||"").toLowerCase().includes(query.toLowerCase())));
      const persist=(key,next,setter,msg)=>{
        write(key,next);setter(next);setNotice(msg);
      };
      const updatePosts=next=>{write("campuslyPosts",next);setPosts(next);document.dispatchEvent(new CustomEvent("campusly:posts-updated",{detail:next}));};
      const updateEvents=next=>persist("campuslyAdminEvents",next,setEvents,"Event records updated.");
      const updateClubs=next=>persist("campuslyAdminClubs",next,setClubs,"Club records updated.");
      const updateUsers=next=>persist(USERS_KEY,next,setPeople,"User records updated.");
      const updateReports=next=>persist(REPORTS_KEY,next,setReports,"Report queue updated.");
      const updateSupport=next=>persist(SUPPORT_KEY,next,setSupport,"Support request updated.");
      const updateFeedback=next=>persist(FEEDBACK_KEY,next,setFeedback,"Feedback status updated.");
      function action(label,detail){logAction(label,detail);setAudit(read(AUDIT_KEY,[]));setNotice(detail);}
      function moderate(post,status){
        const next=posts.map(p=>p.id===post.id?{...p,moderationStatus:status}:p);
        updatePosts(next);action("Post moderation",post.author+" — "+status);
      }
      function removePost(post){
        if(!window.confirm("Permanently remove this post from the local demo feed?"))return;
        updatePosts(posts.filter(p=>p.id!==post.id));action("Post removed",post.author+" — "+post.id);
      }
      function handleReport(report,status){
        const next=reports.map(r=>r.id===report.id?{...r,status,reviewedAt:new Date().toLocaleString()}:r);
        updateReports(next);action("Report "+status,report.postAuthor||report.postId);
      }
      function createEvent(e){
        e.preventDefault();if(!eventDraft.name.trim())return;
        const next=[{id:Date.now(),...eventDraft,status:"Published",createdAt:new Date().toLocaleString()},...events];
        updateEvents(next);logAction("Event created",eventDraft.name);setEventDraft({name:"",date:"",place:"",description:""});setShowEventForm(false);
      }
      function createClub(e){
        e.preventDefault();if(!clubDraft.name.trim())return;
        const next=[{id:Date.now(),...clubDraft,status:"Active",members:0},...clubs];
        updateClubs(next);logAction("Club created",clubDraft.name);setClubDraft({name:"",description:""});setShowClubForm(false);
      }
      function updateSetting(key,value){
        const next={...settings,[key]:value};setSettings(next);write("campuslyAdminSettings",next);logAction("Setting changed",key+" = "+value);
      }
      const navGroups=[
        {label:"WORKSPACE",items:[["Overview","▦"],["Analytics","▥"]]},
        {label:"MANAGEMENT",items:[["Posts","▤"],["Reports","⚑"],["Events","▣"],["Clubs","♧"],["Users","♙"]]},
        {label:"COMMUNITY",items:[["Support","✉"],["Feedback","☆"],["Activity log","◷"]]},
        {label:"SYSTEM",items:[["Settings","⚙"]]}
      ];
      const allOpenReports=reports.filter(r=>!["Resolved","Dismissed"].includes(r.status));
      const totalLikes=posts.reduce((n,p)=>n+Number(p.likes||0),0);
      const totalReactions=posts.reduce((n,p)=>n+Object.values(p.reactions||{}).reduce((a,b)=>a+Number(b||0),0),0);
      const stat= (label,value,caption,icon)=>h(AdminStat,{label,value,caption,icon});
      const searchBox=h("input",{className:"control-search",value:query,onChange:e=>setQuery(e.target.value),placeholder:"Search this section…"});
      const row=(title,subtitle,buttons,key)=>h("article",{className:"control-row",key},h("div",{className:"control-row-copy"},h("b",null,title),h("p",null,subtitle)),h("div",{className:"control-row-actions"},buttons));
      const btn=(label,onClick,kind)=>h("button",{className:"control-btn "+(kind||""),onClick},label);
      let body=null;
      if(section==="Overview") body=h(React.Fragment,null,
        h("div",{className:"control-welcome"},h("div",null,h("span",{className:"control-kicker"},"CAMPUSLY ADMINISTRATION"),h("h2",null,"Good evening, Administrator"),h("p",null,"Here's what's happening across your campus community.")),h("button",{className:"control-refresh",onClick:refresh},"↻ Refresh data")),
        h("div",{className:"control-stats"},stat("Total posts",posts.length,"Community feed","▤"),stat("Student accounts",people.length,"Registered locally","♙"),stat("Open reports",allOpenReports.length,"Needs attention","⚑"),stat("Events & clubs",events.length+" / "+clubs.length,"Managed spaces","▣")),
        h("div",{className:"control-two-col"},h("section",{className:"control-panel"},h("h3",null,"Platform health"),h("div",{className:"health-line"},h("span",null,"Student registration"),h("b",null,settings.registration?"Enabled":"Paused")),h("div",{className:"health-line"},h("span",null,"Posting"),h("b",null,settings.posts?"Enabled":"Paused")),h("div",{className:"health-line"},h("span",null,"Comments"),h("b",null,settings.comments?"Enabled":"Paused")),h("div",{className:"health-line"},h("span",null,"Maintenance mode"),h("b",null,settings.maintenance?"On":"Off"))),
          h("section",{className:"control-panel"},h("h3",null,"Recent admin activity"),(audit.slice(0,5).length?audit.slice(0,5).map(x=>h("div",{className:"activity-line",key:x.id},h("b",null,x.action),h("small",null,x.detail+" · "+x.at))):h("p",{className:"control-empty"}, "No administrative actions recorded yet.")))),
        h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("h3",null,"Quick actions"),h("span",null,"Common tasks")),h("div",{className:"quick-actions"},btn("Review reports",()=>setSection("Reports")),btn("Manage posts",()=>setSection("Posts")),btn("Add event",()=>{setSection("Events");setShowEventForm(true)}),btn("Manage users",()=>setSection("Users"))))
      );
      else if(section==="Analytics") body=h(React.Fragment,null,
        h("div",{className:"control-welcome"},h("div",null,h("span",{className:"control-kicker"},"CAMPUS INSIGHTS"),h("h2",null,"Community analytics"),h("p",null,"A quick snapshot of activity in this browser demo."))),
        h("div",{className:"control-stats"},stat("Posts",posts.length,"Total feed posts","▤"),stat("Likes",totalLikes,"Legacy likes","♥"),stat("Reactions",totalReactions,"Emoji reactions","☺"),stat("Comments",posts.reduce((n,p)=>n+Number(p.comments||0),0),"Comment count","☷")),
        h("section",{className:"control-panel"},h("h3",null,"Content distribution"),["Academic","Campus Life","Events","Creative","Technology"].map(cat=>{const n=posts.filter(p=>p.category===cat).length;return h("div",{className:"analytics-bar-row",key:cat},h("span",null,cat),h("div",{className:"analytics-track"},h("i",{style:{width:(posts.length?Math.max(4,n/posts.length*100):0)+"%"}})),h("b",null,n));})),
        h("p",{className:"control-disclaimer"},"Analytics are calculated from locally stored demonstration data, not a shared production database.")
      );
      else if(section==="Posts") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Post management"),h("p",null,"Review, hide, restore or remove feed content.")),searchBox),
        filtered(posts,["author","text"]).map(p=>row(p.author||"Student",(p.text||"").slice(0,150)+" · "+(p.moderationStatus||"Visible"),[
          btn("Review",()=>moderate(p,"reviewed")),
          btn(p.moderationStatus==="hidden"?"Restore":"Hide",()=>moderate(p,p.moderationStatus==="hidden"?"visible":"hidden")),
          btn("Remove",()=>removePost(p),"danger")
        ],p.id)),posts.length===0&&h("p",{className:"control-empty"},"No posts found."))
      else if(section==="Reports") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Moderation & reports"),h("p",null,"Investigate reported content and record a decision.")),searchBox),
        filtered(reports,["postAuthor","reason","status","postId"]).map(r=>row((r.postAuthor||"Reported post")+" · "+(r.reason||"Community report"),"Status: "+(r.status||"Open")+" · "+(r.details||r.postId||""),[
          btn("Resolve",()=>handleReport(r,"Resolved")),
          btn("Dismiss",()=>handleReport(r,"Dismissed"),"danger")
        ],r.id)),reports.length===0&&h("p",{className:"control-empty"},"No reports have been submitted. Reports created from the student feed will appear here."))
      else if(section==="Events") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Event management"),h("p",null,"Create, publish, unpublish and remove campus events.")),btn(showEventForm?"Close form":"＋ Create event",()=>setShowEventForm(!showEventForm))),
        showEventForm&&h("form",{className:"control-form",onSubmit:createEvent},h("input",{placeholder:"Event name",value:eventDraft.name,onChange:e=>setEventDraft({...eventDraft,name:e.target.value}),required:true}),h("input",{placeholder:"Date and time",value:eventDraft.date,onChange:e=>setEventDraft({...eventDraft,date:e.target.value})}),h("input",{placeholder:"Venue",value:eventDraft.place,onChange:e=>setEventDraft({...eventDraft,place:e.target.value})}),h("textarea",{placeholder:"Event description",value:eventDraft.description,onChange:e=>setEventDraft({...eventDraft,description:e.target.value})}),h("button",{className:"control-btn primary"},"Save event")),
        events.map(ev=>row(ev.name,ev.date+" · "+(ev.place||"Venue not set")+" · "+ev.status,[
          btn(ev.status==="Published"?"Unpublish":"Publish",()=>updateEvents(events.map(x=>x.id===ev.id?{...x,status:x.status==="Published"?"Pending":"Published"}:x))),
          btn("Delete",()=>{if(confirm("Delete this event?")){updateEvents(events.filter(x=>x.id!==ev.id));logAction("Event deleted",ev.name);}},"danger")
        ],ev.id)),events.length===0&&h("p",{className:"control-empty"},"No managed events yet. Create your first campus event."))
      else if(section==="Clubs") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Club management"),h("p",null,"Manage student clubs and their visibility.")),btn(showClubForm?"Close form":"＋ Add club",()=>setShowClubForm(!showClubForm))),
        showClubForm&&h("form",{className:"control-form",onSubmit:createClub},h("input",{placeholder:"Club name",value:clubDraft.name,onChange:e=>setClubDraft({...clubDraft,name:e.target.value}),required:true}),h("textarea",{placeholder:"Club description",value:clubDraft.description,onChange:e=>setClubDraft({...clubDraft,description:e.target.value})}),h("button",{className:"control-btn primary"},"Save club")),
        clubs.map(cl=>row(cl.name,(cl.members||0)+" members · "+cl.status,[
          btn(cl.status==="Active"?"Suspend":"Activate",()=>updateClubs(clubs.map(x=>x.id===cl.id?{...x,status:x.status==="Active"?"Suspended":"Active"}:x))),
          btn("Delete",()=>{if(confirm("Delete this club?"))updateClubs(clubs.filter(x=>x.id!==cl.id));},"danger")
        ],cl.id)),clubs.length===0&&h("p",{className:"control-empty"},"No managed clubs yet. Add a club to get started."))
      else if(section==="Users") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Student & staff accounts"),h("p",null,"Manage account status and roles.")),searchBox),
        filtered(people,["name","email","course","role"]).map((u,i)=>row(u.name,u.email+" · "+(u.course||"No course")+" · "+u.role+" · "+(u.status||"Active"),[
          btn(u.status==="Suspended"?"Reactivate":"Suspend",()=>{const next=people.map(x=>x.email===u.email?{...x,status:x.status==="Suspended"?"Active":"Suspended"}:x);updateUsers(next);logAction("Account status changed",u.email);},u.status==="Suspended"?"primary":""),
          btn(u.role==="admin"?"Make student":"Make admin",()=>{if(u.email===ADMIN_EMAIL){setNotice("The primary demo administrator role cannot be changed.");return;}const next=people.map(x=>x.email===u.email?{...x,role:x.role==="admin"?"student":"admin"}:x);updateUsers(next);logAction("Role changed",u.email);}),
        ],u.email)),people.length===0&&h("p",{className:"control-empty"},"No user accounts found."))
      else if(section==="Support") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Support requests"),h("p",null,"Track student help requests and follow-up.")),searchBox),
        filtered(support,["name","email","subject","message","status"]).map(t=>row(t.subject||"Support request",(t.name||"Student")+" · "+(t.email||"")+" · "+(t.status||"Open"),[
          btn("Mark resolved",()=>updateSupport(support.map(x=>x.id===t.id?{...x,status:"Resolved"}:x))),
          btn("Delete",()=>updateSupport(support.filter(x=>x.id!==t.id)),"danger")
        ],t.id)),support.length===0&&h("p",{className:"control-empty"},"No support requests submitted yet."))
      else if(section==="Feedback") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Student feedback"),h("p",null,"Review suggestions and feedback from the community.")),searchBox),
        filtered(feedback,["name","message","category","status"]).map(f=>row(f.category||"Student feedback",f.message+" · "+(f.status||"New"),[
          btn("Mark reviewed",()=>updateFeedback(feedback.map(x=>x.id===f.id?{...x,status:"Reviewed"}:x))),
          btn("Delete",()=>updateFeedback(feedback.filter(x=>x.id!==f.id)),"danger")
        ],f.id)),feedback.length===0&&h("p",{className:"control-empty"},"No feedback submitted yet."))
      else if(section==="Activity log") body=h("section",{className:"control-panel"},h("div",{className:"control-panel-head"},h("div",null,h("h3",null,"Administrator activity log"),h("p",null,"A local audit trail of actions taken in this dashboard.")),btn("Refresh",()=>setAudit(read(AUDIT_KEY,[])))),audit.map(x=>row(x.action,x.detail+" · "+x.by+" · "+x.at,[],x.id)),audit.length===0&&h("p",{className:"control-empty"},"No actions recorded yet."))
      else if(section==="Settings") body=h("section",{className:"control-panel"},h("h3",null,"Platform settings"),h("p",{className:"control-disclaimer"},"Switches control the local demo experience only. Production enforcement must happen on the server."),
        [["registration","Student registration"],["posts","New posts"],["comments","Comments"],["maintenance","Maintenance mode"]].map(([key,label])=>h("label",{className:"setting-row",key},h("span",null,label),h("input",{type:"checkbox",checked:!!settings[key],onChange:e=>updateSetting(key,e.target.checked)})))
      );
      return h("div",{className:"campusly-control-shell"},
        h("aside",{className:"control-sidebar"},h("div",{className:"control-brand"},h("span",{className:"control-brand-mark"},"C"),h("span",null,"CAMPUSLY",h("small",null,"CONTROL CENTRE"))),
          h("div",{className:"control-admin-card"},h("span",{className:"control-admin-avatar"},"A"),h("div",null,h("b",null,"Administrator"),h("small",null,"Platform manager"))),
          navGroups.map(group=>h("div",{className:"control-nav-group",key:group.label},h("small",null,group.label),group.items.map(([name,ico])=>h("button",{key:name,className:section===name?"active":"",onClick:()=>{setSection(name);setQuery("");}},h("i",null,ico),h("span",null,name),name==="Reports"&&allOpenReports.length>0?h("em",null,allOpenReports.length):null)))),
          h("div",{className:"control-sidebar-bottom"},h("span",null,"Campusly Admin v3.1"),h("button",{className:"control-back-app",onClick:()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");}},"← Back to Campusly"),h("button",{className:"control-signout",onClick:()=>window.campuslyLogout(true)},"↪ Sign out"))
        ),
        h("main",{className:"control-main"},h("header",{className:"control-topbar"},h("div",null,h("span",null,"Admin / "),h("b",null,section)),h("div",null,h("span",{className:"control-online-dot"},"●")," Local demo workspace")),
          h("div",{className:"control-content"},h("div",{className:"control-feedback",role:"status"},notice),body),
          h("footer",{className:"control-footer"},"Campusly Administration · Demo data is stored in this browser only")
        )
      );
    }
    const adminRoot=ReactDOM.createRoot(document.getElementById("campusly-admin-root"));
    const mount=()=>adminRoot.render(h(AdminControlCenter));
    nav?.addEventListener("click",()=>setTimeout(mount,0));
  }

  // Small quality-of-life utilities shared by student and admin screens.
  const scrollTopButton=document.createElement("button");
  scrollTopButton.type="button";
  scrollTopButton.className="campusly-scrolltop";
  scrollTopButton.setAttribute("aria-label","Back to top");
  scrollTopButton.title="Back to top";
  scrollTopButton.textContent="↑";
  document.body.appendChild(scrollTopButton);
  const toast=document.createElement("div");
  toast.className="campusly-toast";
  toast.setAttribute("role","status");
  toast.setAttribute("aria-live","polite");
  document.body.appendChild(toast);
  let toastTimer=null;
  window.campuslyToast=function(message){
    toast.textContent=message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove("visible"),2200);
  };
  function activeScrollContainer(){
    if(modal?.classList.contains("open")) return document.querySelector(".control-content");
    return document.scrollingElement || document.documentElement;
  }
  function updateScrollButton(){
    const area=activeScrollContainer();
    const y=area===document.scrollingElement||area===document.document.documentElement?window.scrollY:(area?.scrollTop||0);
    scrollTopButton.classList.toggle("visible",y>260);
  }
  window.addEventListener("scroll",updateScrollButton,{passive:true});
  document.addEventListener("scroll",updateScrollButton,true);
  scrollTopButton.addEventListener("click",()=>{
    const area=activeScrollContainer();
    if(area && area!==document.scrollingElement && area!==document.documentElement) area.scrollTo({top:0,behavior:"smooth"});
    else window.scrollTo({top:0,behavior:"smooth"});
  });
  document.addEventListener("campusly:session-ended",()=>{scrollTopButton.classList.remove("visible");});
  // Keep Escape behavior and the scroll helper available on touch and keyboard devices.

})();
