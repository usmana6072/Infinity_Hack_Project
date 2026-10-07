/* NovaWorks CRM – MOCK UI (no backend). All data lives in JS / localStorage. */

/* ---------- Seed data ---------- */
const USERS = [
  {id:'ADMIN',name:'Admin',email:'admin@novaworks.example',role:'ADMIN',spec:'Administrator',skills:['Company overview','Transcript creation']},
  {id:'PM01',name:'Ayesha Khan',email:'ayesha@novaworks.example',role:'MANAGER',spec:'Manager / Web PM',skills:['Web projects','Client coordination']},
  {id:'PM02',name:'Bilal Ahmed',email:'bilal@novaworks.example',role:'MANAGER',spec:'Manager / Mobile PM',skills:['Mobile projects','Delivery planning']},
  {id:'PM03',name:'Hina Malik',email:'hina@novaworks.example',role:'MANAGER',spec:'Manager / AI PM',skills:['AI projects','Requirement review']},
  {id:'DEV01',name:'Ali Raza',email:'ali@novaworks.example',role:'AGENT',spec:'Agent / Full-Stack',skills:['React','Frontend integration']},
  {id:'DEV02',name:'Hamza Shah',email:'hamza@novaworks.example',role:'AGENT',spec:'Agent / Full-Stack',skills:['Node.js','Databases','APIs']},
  {id:'DEV03',name:'Sara Noor',email:'sara@novaworks.example',role:'AGENT',spec:'Agent / App Developer',skills:['Flutter','Mobile UI']},
  {id:'DEV04',name:'Usman Tariq',email:'usman@novaworks.example',role:'AGENT',spec:'Agent / App Developer',skills:['Flutter','Integration','Testing']},
  {id:'DEV05',name:'Zain Abbas',email:'zain@novaworks.example',role:'AGENT',spec:'Agent / AI Developer',skills:['LLMs','Extraction','Prompts']},
  {id:'DEV06',name:'Maryam Asif',email:'maryam@novaworks.example',role:'AGENT',spec:'Agent / AI Developer',skills:['Retrieval','Document processing']},
];
const PASSWORD = 'Demo123!';
const userById = id => USERS.find(u => u.id === id);

/* Stand-in for the AI response (real app: LLM call on the server). */
const MOCK_AI_RESULT = { projects: [
  { name:'UrbanCart Website', clientName:'UrbanCart Clothing', managerId:'PM01', deadline:'2026-10-20',
    description:'Responsive website to browse products, view details and use a demo cart. Demo scope only: no payment gateway or inventory integration.',
    tasks:[
      {title:'Product catalog UI',description:'Product listing, product detail screen and responsive layout.',assigneeId:'DEV01',deadline:'2026-10-12',estimatedHours:12},
      {title:'Demo cart UI',description:'Add/remove items, quantities and a visible total.',assigneeId:'DEV01',deadline:'2026-10-15',estimatedHours:8},
      {title:'Product and cart APIs',description:'Product data responses and basic demo cart endpoints (no payments).',assigneeId:'DEV02',deadline:'2026-10-14',estimatedHours:14},
      {title:'Website integration and testing',description:'Connect screens to APIs and check the demo flow.',assigneeId:'DEV01',deadline:'2026-10-19',estimatedHours:6}]},
  { name:'QuickServe Mobile App', clientName:'QuickServe Services', managerId:'PM02', deadline:'2026-10-24',
    description:'Flutter customer app demo: login, service booking and booking status. Maps, driver tracking and payments excluded.',
    tasks:[
      {title:'Login and profile screens',description:'Customer login interface and a basic profile screen.',assigneeId:'DEV03',deadline:'2026-10-12',estimatedHours:8},
      {title:'Service booking screens',description:'Select a service, enter request details, see a confirmation screen.',assigneeId:'DEV03',deadline:'2026-10-17',estimatedHours:12},
      {title:'Booking and account APIs',description:'Basic customer account handling, service requests and request status.',assigneeId:'DEV02',deadline:'2026-10-16',estimatedHours:16},
      {title:'Mobile integration and testing',description:'Connect mobile UI to API, show request status, test the full customer flow.',assigneeId:'DEV04',deadline:'2026-10-22',estimatedHours:10}]},
  { name:'HelpDeskPro AI Assistant', clientName:'HelpDeskPro Solutions', managerId:'PM03', deadline:'2026-10-22',
    description:'Support assistant that answers from a supplied FAQ and escalates unresolved questions to a human team (saved record in demo).',
    tasks:[
      {title:'FAQ document processing',description:'Prepare the supplied FAQ so the assistant can retrieve relevant content.',assigneeId:'DEV06',deadline:'2026-10-13',estimatedHours:10},
      {title:'Assistant answer generation',description:'Use prepared content, connect the model, handle response structure; say "cannot resolve" when unsupported.',assigneeId:'DEV05',deadline:'2026-10-17',estimatedHours:14},
      {title:'Human escalation flow',description:'Save unresolved questions so a person can review them.',assigneeId:'DEV05',deadline:'2026-10-18',estimatedHours:6},
      {title:'Assistant evaluation and testing',description:'Test FAQ answers, unsupported questions and the escalation path.',assigneeId:'DEV06',deadline:'2026-10-21',estimatedHours:8}]},
]};

const SAMPLE_TRANSCRIPT = `Meeting: NovaWorks Client Delivery Planning
Date: 7 October 2026 | Scheduled duration: 60 minutes
Participants: Ayesha, Bilal, Hina, Ali, Hamza, Sara, Usman, Zain, Maryam

09:00-09:04 | Opening and company workflow
Ayesha: Good morning. We have three client engagements to plan today: UrbanCart Clothing's website, QuickServe's customer mobile app, and HelpDeskPro's AI support assistant. Please keep these as three separate projects.
...
09:56-10:00 | Final recap
Ayesha: Final recap: UrbanCart Website, client UrbanCart Clothing, manager Ayesha, deadline 20 October. Ali owns Product catalog UI: 12 hours, 12 October. ...
Ayesha: Those are the final decisions. Keep the rejected features out. Create three projects with twelve tasks, then show them in the CRM.

(Paste the full supplied transcript here)`;

/* ---------- State ---------- */
const store = {
  get session(){ return localStorage.getItem('nw_session'); },
  set session(v){ v ? localStorage.setItem('nw_session', v) : localStorage.removeItem('nw_session'); },
  get data(){ try{ return JSON.parse(localStorage.getItem('nw_data')) || {projects:[],tasks:[]}; }catch{ return {projects:[],tasks:[]}; } },
  set data(v){ localStorage.setItem('nw_data', JSON.stringify(v)); },
};
const me = () => userById(store.session);
let uid = 1; const genId = p => `${p}-${Date.now().toString(36)}${uid++}`;

/* ---------- Access rules (mirror of the backend pseudocode) ---------- */
function getProjects(u){
  const {projects,tasks} = store.data;
  if(u.role==='ADMIN') return projects;
  if(u.role==='MANAGER') return projects.filter(p=>p.managerId===u.id);
  const ids = new Set(tasks.filter(t=>t.assigneeId===u.id).map(t=>t.projectId));
  return projects.filter(p=>ids.has(p.id));
}
function getTasks(u,projectId){
  const {tasks,projects} = store.data;
  const inProject = tasks.filter(t=>t.projectId===projectId);
  if(u.role==='ADMIN') return inProject;
  if(u.role==='MANAGER'){ const p=projects.find(x=>x.id===projectId); return p&&p.managerId===u.id?inProject:[]; }
  return inProject.filter(t=>t.assigneeId===u.id);
}
function getProjectById(u,id){
  const p = getProjects(u).find(x=>x.id===id);
  return p ? {...p, tasks:getTasks(u,id)} : null;
}
const myTasks = u => store.data.tasks.filter(t=>t.assigneeId===u.id);

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = d => new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const roleLabel = r => ({ADMIN:'Administrator',MANAGER:'Project Manager',AGENT:'Developer Agent'}[r]);
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.remove('hidden'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.add('hidden'),2800); }
const sleep = ms => new Promise(r=>setTimeout(r,ms));

/* ---------- Login ---------- */
$('#demo-list').innerHTML = USERS.map(u=>`<div class="demo-row" data-email="${u.email}"><span>${esc(u.name)}</span><span class="muted">${u.role}</span></div>`).join('');
$('#demo-list').addEventListener('click',e=>{
  const r=e.target.closest('.demo-row'); if(!r) return;
  $('#login-email').value=r.dataset.email; $('#login-password').value=PASSWORD;
});
$('#login-form').addEventListener('submit',e=>{
  e.preventDefault();
  const email=$('#login-email').value.trim().toLowerCase(), pw=$('#login-password').value;
  const u=USERS.find(x=>x.email===email);
  const err=$('#login-error');
  if(!u||pw!==PASSWORD){ err.textContent='Invalid email or password.'; err.classList.remove('hidden'); return; }
  err.classList.add('hidden'); store.session=u.id;
  location.hash = u.role==='AGENT' ? '#/my-tasks' : '#/projects';
  boot();
});
$('#logout-btn').addEventListener('click',()=>{ store.session=null; location.hash=''; boot(); });

/* ---------- Shell ---------- */
function boot(){
  const u = me();
  $('#login-view').classList.toggle('hidden', !!u);
  $('#app-view').classList.toggle('hidden', !u);
  if(!u) return;
  $('#user-avatar').textContent=u.name[0];
  $('#user-name').textContent=u.name;
  $('#user-role').textContent=roleLabel(u.role);
  const links = u.role==='AGENT'
    ? [['#/my-tasks','My Tasks'],['#/projects','Related Projects'],['#/team','Team Directory']]
    : [['#/projects', u.role==='ADMIN'?'All Projects':'My Projects'],...(u.role==='ADMIN'?[['#/transcript','Create from Transcript']]:[]),['#/team','Team Directory']];
  $('#nav').innerHTML = links.map(([h,l])=>`<a href="${h}">${l}</a>`).join('');
  route();
}
window.addEventListener('hashchange',route);

function route(){
  const u=me(); if(!u) return;
  const h = location.hash || (u.role==='AGENT'?'#/my-tasks':'#/projects');
  document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active', h.startsWith(a.getAttribute('href'))));
  $('#page-actions').innerHTML='';
  const [,page,arg]=h.split('/');
  if(page==='projects'&&arg) return viewProject(u,arg);
  if(page==='projects') return viewProjects(u);
  if(page==='my-tasks') return viewMyTasks(u);
  if(page==='team') return viewTeam();
  if(page==='transcript') return viewTranscript(u);
  location.hash='#/projects';
}

/* ---------- Screens ---------- */
function viewProjects(u){
  const list=getProjects(u);
  $('#page-title').textContent = u.role==='ADMIN'?'All Projects':u.role==='MANAGER'?'My Projects':'Related Projects';
  if(u.role==='ADMIN') $('#page-actions').innerHTML='<a class="btn primary" href="#/transcript" style="text-decoration:none">+ Create from Transcript</a>';
  let html='';
  if(u.role==='ADMIN'){
    const {projects,tasks}=store.data;
    html+=`<div class="stats">
      <div class="card stat"><div class="muted small">Projects</div><div class="num">${projects.length}</div></div>
      <div class="card stat"><div class="muted small">Tasks</div><div class="num">${tasks.length}</div></div>
      <div class="card stat"><div class="muted small">Managers</div><div class="num">${USERS.filter(x=>x.role==='MANAGER').length}</div></div>
      <div class="card stat"><div class="muted small">Developers</div><div class="num">${USERS.filter(x=>x.role==='AGENT').length}</div></div></div>`;
  }
  if(!list.length){
    html+=`<div class="card empty"><h3>No projects yet</h3><p>${u.role==='ADMIN'?'Paste a meeting transcript to create projects and tasks automatically.':'Nothing is assigned to you yet.'}</p>${u.role==='ADMIN'?'<a class="btn primary" href="#/transcript" style="text-decoration:none">Create from Transcript</a>':''}</div>`;
  } else {
    html+='<div class="grid">'+list.map(p=>{
      const tasks=getTasks(u,p.id), hrs=tasks.reduce((s,t)=>s+t.estimatedHours,0);
      return `<div class="card project-card" onclick="location.hash='#/projects/${p.id}'">
        <span class="badge">${esc(p.clientName)}</span>
        <h3 style="margin-top:10px">${esc(p.name)}</h3>
        <div class="meta">
          <div><span>Manager</span><span class="strong">${esc(userById(p.managerId)?.name)}</span></div>
          <div><span>Deadline</span><span class="strong">${fmtDate(p.deadline)}</span></div>
          <div><span>${u.role==='AGENT'?'My tasks':'Tasks'}</span><span class="strong">${tasks.length}</span></div>
          <div><span>${u.role==='AGENT'?'My hours':'Est. hours'}</span><span class="strong">${hrs}h</span></div>
        </div></div>`;}).join('')+'</div>';
  }
  $('#content').innerHTML=html;
}

function taskTable(tasks,{showProject=false,showAssignee=true}={}){
  if(!tasks.length) return '<div class="empty">No tasks to show.</div>';
  const pn = id => store.data.projects.find(p=>p.id===id)?.name;
  return `<div class="table-wrap"><table><thead><tr><th>Task</th>${showProject?'<th>Project</th>':''}${showAssignee?'<th>Assigned agent</th>':''}<th>Deadline</th><th>Est. hours</th></tr></thead><tbody>`+
  tasks.map(t=>`<tr><td><div class="strong">${esc(t.title)}</div><div class="desc">${esc(t.description)}</div></td>
    ${showProject?`<td><a class="back" style="margin:0" href="#/projects/${t.projectId}">${esc(pn(t.projectId))}</a></td>`:''}
    ${showAssignee?`<td>${esc(userById(t.assigneeId)?.name)}</td>`:''}
    <td>${fmtDate(t.deadline)}</td><td><span class="badge amber">${t.estimatedHours}h</span></td></tr>`).join('')+'</tbody></table></div>';
}

function viewProject(u,id){
  const p=getProjectById(u,id);
  if(!p){
    $('#page-title').textContent='Access denied';
    $('#content').innerHTML='<div class="card empty"><h3>🚫 403 – Not allowed</h3><p>This project does not exist or is outside your permitted projects.</p><a class="btn" href="#/projects" style="text-decoration:none">Back to projects</a></div>';
    return;
  }
  $('#page-title').textContent=p.name;
  const hrs=p.tasks.reduce((s,t)=>s+t.estimatedHours,0);
  $('#content').innerHTML=`<a class="back" href="#/projects">← Back to projects</a>
  <div class="card" style="margin-bottom:18px">
    <div class="meta" style="flex-direction:row;flex-wrap:wrap;gap:34px;margin-top:0">
      <div style="flex-direction:column"><span class="small">Client</span><span class="strong">${esc(p.clientName)}</span></div>
      <div style="flex-direction:column"><span class="small">Manager</span><span class="strong">${esc(userById(p.managerId)?.name)}</span></div>
      <div style="flex-direction:column"><span class="small">Deadline</span><span class="strong">${fmtDate(p.deadline)}</span></div>
      <div style="flex-direction:column"><span class="small">${u.role==='AGENT'?'My tasks':'Tasks'}</span><span class="strong">${p.tasks.length} (${hrs}h)</span></div>
    </div>
    <p class="muted" style="margin:0">${esc(p.description)}</p>
    ${u.role==='AGENT'?'<div class="alert info">You only see tasks assigned to you in this project.</div>':''}
  </div>
  <div class="card"><h3 style="margin-top:0">Tasks</h3>${taskTable(p.tasks,{showAssignee:u.role!=='AGENT'})}</div>`;
}

function viewMyTasks(u){
  $('#page-title').textContent='My Tasks';
  const t=myTasks(u);
  $('#content').innerHTML=`<div class="stats"><div class="card stat"><div class="muted small">Assigned tasks</div><div class="num">${t.length}</div></div>
    <div class="card stat"><div class="muted small">Total est. hours</div><div class="num">${t.reduce((s,x)=>s+x.estimatedHours,0)}h</div></div></div>
    <div class="card">${t.length?taskTable(t,{showProject:true,showAssignee:false}):'<div class="empty">No tasks assigned to you yet.</div>'}</div>`;
}

function viewTeam(){
  $('#page-title').textContent='Team Directory';
  $('#content').innerHTML=`<div class="alert info">Read-only directory. Users are seeded by a setup script.</div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Ref</th><th>Name</th><th>Role</th><th>Specialization</th><th>Skills</th></tr></thead><tbody>`+
  USERS.map(u=>`<tr><td>${u.id}</td><td class="strong">${esc(u.name)}</td><td><span class="badge ${u.role==='AGENT'?'green':''}">${roleLabel(u.role)}</span></td><td>${esc(u.spec)}</td><td class="muted">${u.skills.map(esc).join(', ')}</td></tr>`).join('')+
  '</tbody></table></div></div>';
}

function viewTranscript(u){
  if(u.role!=='ADMIN'){
    $('#page-title').textContent='Access denied';
    $('#content').innerHTML='<div class="card empty"><h3>🚫 Admin only</h3><p>Only the administrator can create projects from a transcript.</p></div>'; return;
  }
  $('#page-title').textContent='Create from Transcript';
  $('#content').innerHTML=`<div class="two-col">
    <div class="card">
      <label>Meeting description / transcript
        <textarea class="transcript" id="transcript" placeholder="Paste the meeting transcript here…"></textarea>
      </label>
      <div class="check-row"><input type="checkbox" id="force-error"><label for="force-error" style="margin:0;font-weight:500">Simulate unresolved data (demo error state)</label></div>
      <div class="btn-row">
        <button class="btn primary" id="create-btn">Create from Transcript</button>
        <button class="btn" id="sample-btn" type="button">Load sample</button>
        <button class="btn ghost" id="clear-btn" type="button">Clear data</button>
      </div>
      <div id="result"></div>
    </div>
    <div class="card"><h3 style="margin-top:0">Processing</h3>
      <ul class="steps" id="steps">
        <li data-s="0">○ Validate transcript</li><li data-s="1">○ Send to AI with team directory</li>
        <li data-s="2">○ Validate projects &amp; tasks</li><li data-s="3">○ Save all records together</li></ul>
      <p class="muted small">Passwords are never sent to the AI. Nothing is saved unless the whole draft is valid.</p>
      <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
      <h4 style="margin:0 0 8px">Directory sent to AI</h4>
      <div class="small muted">${USERS.filter(x=>x.role!=='ADMIN').map(x=>`${x.id} – ${esc(x.name)}`).join('<br>')}</div>
    </div></div>`;

  $('#sample-btn').onclick=()=>{ $('#transcript').value=SAMPLE_TRANSCRIPT; };
  $('#clear-btn').onclick=()=>{ store.data={projects:[],tasks:[]}; $('#result').innerHTML='<div class="alert info">All saved projects and tasks cleared.</div>'; };
  $('#create-btn').onclick=runCreate;
}

async function runCreate(){
  const btn=$('#create-btn'), res=$('#result'), text=$('#transcript').value.trim();
  const setStep=n=>document.querySelectorAll('#steps li').forEach(li=>{
    const i=+li.dataset.s, t=li.textContent.slice(2);
    li.className=i<n?'done':i===n?'active':''; li.textContent=(i<n?'✓ ':i===n?'● ':'○ ')+t;
  });
  res.innerHTML='';
  if(!text){ res.innerHTML='<div class="alert error">Transcript is empty. Please paste the meeting transcript first.</div>'; return; }
  btn.disabled=true; btn.innerHTML='<span class="spinner"></span>Processing…';
  setStep(0); await sleep(500); setStep(1); await sleep(1400); setStep(2); await sleep(700);

  if($('#force-error').checked){
    setStep(-1); btn.disabled=false; btn.textContent='Create from Transcript';
    res.innerHTML=`<div class="alert error"><strong>Could not save – nothing was created.</strong> Please correct these fields and try again:
      <ul><li>QuickServe Mobile App → task “Mobile integration and testing”: assignee could not be resolved</li>
      <li>HelpDeskPro AI Assistant → deadline missing</li></ul></div>`;
    return;
  }
  setStep(3); await sleep(600); setStep(4);

  // all-or-nothing save
  const projects=[], tasks=[];
  MOCK_AI_RESULT.projects.forEach(p=>{
    const pid=genId('prj');
    projects.push({id:pid,name:p.name,clientName:p.clientName,description:p.description,managerId:p.managerId,deadline:p.deadline});
    p.tasks.forEach(t=>tasks.push({id:genId('tsk'),projectId:pid,...t}));
  });
  store.data={projects,tasks};
  btn.disabled=false; btn.textContent='Create from Transcript';
  res.innerHTML=`<div class="alert success"><strong>Success!</strong> Created ${projects.length} projects and ${tasks.length} tasks.</div>
    <div class="grid" style="margin-top:12px">${projects.map(p=>`<div class="card project-card" onclick="location.hash='#/projects/${p.id}'"><h4 style="margin:0">${esc(p.name)}</h4><div class="muted small">${tasks.filter(t=>t.projectId===p.id).length} tasks · Manager ${esc(userById(p.managerId).name)}</div></div>`).join('')}</div>
    <div class="btn-row"><a class="btn primary" href="#/projects" style="text-decoration:none">View all projects</a></div>`;
  toast('Projects and tasks created');
}

/* ---------- Start ---------- */
boot();
