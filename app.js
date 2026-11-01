const $ = s => document.querySelector(s);
const USE = {
  research: {label:'🔎 Live research', src:'both', win:'the last 7 days', fmt:'bullets',
    task: i => `Research the latest on: ${i}.`,
    body: () => [`Cover the developments that matter most (launches, pricing changes, funding, regulation, notable incidents) and rank them by importance.`,
                 `For each, add one sentence on why it matters.`,
                 `Flag anything older than the time window that has resurfaced, marked "older".`,
                 `Finish with 3 questions or open issues worth watching next.`]},
  social: {label:'💬 X / social listening', src:'x', win:'the last 14 days', fmt:'bullets', facts:true,
    task: i => `Find out what people on X are saying about: ${i}.`,
    body: () => [`Group what you find into 3–5 themes.`,
                 `For each theme give a one-line summary, a rough sense of how common it is, and 1–2 representative posts quoted with date and link.`,
                 `Note the overall sentiment (positive / mixed / negative) and any notable accounts driving the conversation.`,
                 `End with the 3 concerns or opportunities most worth acting on.`]},
  competitor: {label:'⚔️ Competitor scan', src:'both', win:'the last 90 days', fmt:'table',
    task: i => `Compare the following competitors/options: ${i}.`,
    body: () => [`For each, find current pricing, recent launches, positioning, strengths, and recurring complaints from users (X and review sites).`,
                 `Then give a two-sentence recommendation and the main trade-off.`,
                 `If pricing or features can't be verified, say so rather than guessing.`]},
  prep: {label:'🤝 Meeting prep', src:'both', win:'the last 6 months', fmt:'memo',
    task: i => `Prepare me for: ${i}.`,
    body: () => [`Search for recent news, leadership changes, product launches, hiring trends, and public customer complaints.`,
                 `Structure it as: Snapshot, Recent news (dated), Likely priorities, Risks or sensitivities, and 5 smart questions to ask.`,
                 `If you can't verify something, say so instead of guessing.`]},
  post: {label:'✍️ Write a post / thread', src:'none', win:'none', fmt:'auto', tone:'direct',
    task: i => `Write a post for X based on this: ${i}.`,
    body: () => [`Open with a strong hook in the first line — no clichés like "Let's dive in".`,
                 `If it needs more than 280 characters, make it a numbered thread of 4–7 posts, each able to stand alone.`,
                 `Use plain language, at most one emoji per post and no hashtags unless they add real reach.`,
                 `Give 2 alternative hooks at the end.`]},
  analyze: {label:'📄 Analyze a file', src:'none', win:'none', fmt:'memo',
    task: i => `I'm attaching a file. Analyze it with this goal: ${i}.`,
    body: () => [`Pull out the key findings, numbers, and decisions, quoting the source section for each.`,
                 `List anything that looks inconsistent, missing, or risky.`,
                 `Finish with recommended next steps.`]},
  decide: {label:'🧭 Decide / plan', src:'web', win:'none', fmt:'steps', reason:true,
    task: i => `Help me think through this decision: ${i}.`,
    body: () => [`Lay out the realistic options, including "do nothing".`,
                 `For each, list pros, cons, rough cost/effort, and the biggest risk.`,
                 `State your assumptions explicitly before recommending.`,
                 `Put a clear recommendation and the first 3 concrete actions at the end.`]},
  general: {label:'✨ Anything else', src:'auto', win:'none', fmt:'auto',
    task: i => `${i.charAt(0).toUpperCase()+i.slice(1)}${/[.?!]$/.test(i)?'':'.'}`,
    body: () => [`Be specific and practical; skip generic filler.`, `If something is ambiguous, state the assumption you made.`]},
};
const FORMAT = {
  bullets:'Format: concise bullet points, grouped under short bold headings.',
  table:'Format: a comparison table (one row per item, clear column headers, including a "Sources" column), followed by a short summary.',
  email:'Format: a ready-to-send email with a subject line, a short greeting, the body in short paragraphs, and a clear call to action.',
  memo:'Format: a one-page brief with clear section headings and a 3-line executive summary at the top.',
  steps:'Format: numbered steps, each starting with an action verb.',
};
const TONE = {
  direct:'Tone: plain and direct — no hype, no filler.',
  warm:'Tone: warm and friendly, but still concise.',
  formal:'Tone: professional and formal, suitable for executives or clients.',
  persuasive:'Tone: persuasive and confident, building toward a clear call to action.',
};
const LEN = {short:'Keep it short — under 150 words if possible.', medium:'Aim for a medium length — roughly 300–500 words.', deep:'Go in-depth — be thorough and don\'t skip important detail.'};
const SRC = {web:'Search the web', x:'Search posts on X', both:'Search the web and X'};

const EXAMPLES = [
  ['research','what happened with AI coding tools this week'],
  ['social','how people feel about the new iPhone price'],
  ['competitor','Notion vs Coda vs ClickUp for a 15-person agency'],
  ['post','notes: shipped v2 of our app, 3x faster, new dark mode, free for students, took 4 months'],
];
const BA = [
  ['Market research','what happened in EV charging this week', 'research', {win:'the last 7 days', ctx:'I run a small consultancy advising property developers.', tone:'direct'}],
  ['Social listening','what do people think of our new logo', 'social', {ctx:'Our company is "Brightwave Coffee".', tone:'direct'}],
  ['Competitor scan','Canva vs Figma vs Adobe Express', 'competitor', {ctx:'We are a 10-person marketing team choosing one design tool.', aud:'our head of marketing'}],
  ['Meeting prep','call tomorrow with a regional hospital group', 'prep', {ctx:'I sell scheduling software to healthcare providers.'}],
];

let useCase = 'research';
const state = {format:'auto', tone:'auto'};

function build(idea, uc, o){
  const U = USE[uc];
  idea = idea.trim().replace(/\s+/g,' ');
  const win = o.win==='auto' ? U.win : o.win;
  const src = o.src==='auto' ? U.src : o.src;
  const fmt = o.format==='auto' ? U.fmt : o.format;
  const tone = o.tone==='auto' ? (U.tone||'auto') : o.tone;
  const L = [];
  L.push(U.task(idea));
  if (o.ctx) L.push(`Context about me: ${o.ctx.trim().replace(/\.?$/,'.')}`);
  if (o.aud) L.push(`The audience for this is ${o.aud.trim().replace(/\.$/,'')}, so pitch the depth and wording for them.`);
  if (src && src!=='none' && SRC[src]) {
    let s = SRC[src] + (win && win!=='none' ? ` for information from ${win}` : '') + '.';
    if (o.cite) s += ' Cite every claim with a source link and its date.';
    L.push(''); L.push(s);
  } else if (uc==='analyze') { L.push(''); L.push('Base your answer only on the attached file; don\'t search unless I ask.'); }
  L.push(''); L.push('Return:');
  U.body().forEach((b,i)=>L.push(`${i+1}. ${b}`));
  const rules = [];
  if (fmt!=='auto' && FORMAT[fmt]) rules.push(FORMAT[fmt]);
  if (TONE[tone]) rules.push(TONE[tone]);
  if (o.len!=='auto') rules.push(LEN[o.len]);
  if ((o.facts || U.facts) && src!=='none' && uc!=='post') rules.push('Keep verified facts clearly separate from opinions, rumours, and speculation.');
  if (o.reason || U.reason) rules.push('Reason step by step, state your assumptions, and put the final recommendation at the end.');
  if (o.noedge) rules.push('Avoid jokes, sarcasm, and edgy commentary — this may be shared professionally.');
  if (rules.length){ L.push(''); rules.forEach(r=>L.push(r)); }
  return L.join('\n');
}

function opts(){
  return {format:state.format, tone:state.tone, win:$('#window').value, src:$('#sources').value, len:$('#length').value,
    aud:$('#audience').value, ctx:$('#context').value, cite:$('#cite').checked, facts:$('#facts').checked,
    reason:$('#reason').checked, noedge:$('#noedge').checked};
}

// UI
const chips = $('#usecases');
Object.entries(USE).forEach(([k,u])=>{
  const b=document.createElement('button'); b.className='chip'+(k===useCase?' on':''); b.textContent=u.label; b.dataset.k=k;
  b.onclick=()=>{useCase=k; chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b)); if(!$('#out').classList.contains('hidden')&&$('#idea').value.trim()) generate();};
  chips.appendChild(b);
});
document.querySelectorAll('.seg').forEach(seg=>seg.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); state[seg.dataset.name]=b.dataset.v;
}));
document.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{
  const [k,t]=EXAMPLES[+b.dataset.ex]; chips.querySelector(`[data-k="${k}"]`).click(); $('#idea').value=t; generate();
});

function generate(){
  const idea=$('#idea').value;
  if(!idea.trim()){ $('#idea').focus(); $('#idea').style.borderColor='var(--bad)'; setTimeout(()=>$('#idea').style.borderColor='',1200); return; }
  const p=build(idea,useCase,opts());
  $('#result').value=p; $('#out').classList.remove('hidden');
  $('#stats').textContent=`${p.split(/\s+/).length} words`;
  $('#open').href='https://grok.com/?q='+encodeURIComponent(p);
  $('#out').scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('#go').onclick=generate;
$('#idea').addEventListener('keydown',e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)) generate(); });
$('#copy').onclick=async()=>{
  const t=$('#result').value;
  try{ await navigator.clipboard.writeText(t);}catch{ $('#result').select(); document.execCommand('copy'); }
  const toast=$('#toast'); toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1400);
};

// Before/after
const tabs=$('#batabs');
const defaults={format:'auto',tone:'auto',win:'auto',src:'auto',len:'auto',aud:'',ctx:'',cite:true,facts:true,reason:false,noedge:false};
BA.forEach(([name,before,uc,extra],i)=>{
  const b=document.createElement('button'); b.className='chip'+(i===0?' on':''); b.textContent=name;
  b.onclick=()=>{ tabs.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on',c===b));
    $('#before').textContent=before;
    $('#after').textContent=build(before,uc,{...defaults,...extra});
  };
  tabs.appendChild(b); if(i===0) b.click();
});
