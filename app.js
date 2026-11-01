const $ = s => document.querySelector(s);

const MODELS = [
  {id:'any', name:'Any / Generic'},
  {id:'chatgpt', name:'ChatGPT', href:'https://chatgpt.com/?q='},
  {id:'claude', name:'Claude', href:'https://claude.ai/new?q='},
  {id:'gemini', name:'Gemini'},
  {id:'grok', name:'Grok', href:'https://grok.com/?q='},
  {id:'perplexity', name:'Perplexity', href:'https://www.perplexity.ai/search?q='},
  {id:'copilot', name:'Copilot'},
  {id:'meta', name:'Meta AI'},
  {id:'deepseek', name:'DeepSeek'},
];
const OPEN_URL_LIMIT = 8000;

const USE = {
  research: {label:'🔎 Live research', src:m => m==='grok'?'both':'web', win:'the last 7 days', fmt:'bullets',
    task:i => `Research the latest on: ${i}.`,
    body:() => [`Cover the developments that matter most (launches, pricing changes, funding, regulation, notable incidents) and rank them by importance.`,
                `For each, add one sentence on why it matters.`,
                `Flag anything older than the time window that has resurfaced, marked "older".`,
                `Finish with 3 questions or open issues worth watching next.`]},
  social: {label:m => m==='grok'?'💬 X / social listening':'💬 Social listening', src:m => m==='grok'?'x':'web', win:'the last 14 days', fmt:'bullets', facts:true,
    task:(i,m) => m==='grok' ? `Find out what people on X are saying about: ${i}.` : `Find out what people are publicly saying about: ${i}.`,
    body:m => m==='grok'
      ? [`Group what you find into 3–5 themes.`,
         `For each theme give a one-line summary, a rough sense of how common it is, and 1–2 representative posts quoted with date and link.`,
         `Note the overall sentiment (positive / mixed / negative) and any notable accounts driving the conversation.`,
         `End with the 3 concerns or opportunities most worth acting on.`]
      : [`Group what you find into 3–5 themes.`,
         `For each theme give a one-line summary, a rough sense of how common it is, and 1–2 representative comments or articles with date and link.`,
         `Note the overall sentiment (positive / mixed / negative) and any notable voices driving the conversation.`,
         `End with the 3 concerns or opportunities most worth acting on.`]},
  competitor: {label:'⚔️ Competitor scan', src:m => m==='grok'?'both':'web', win:'the last 90 days', fmt:'table',
    task:i => `Compare the following competitors/options: ${i}.`,
    body:m => [m==='grok'
        ? `For each, find current pricing, recent launches, positioning, strengths, and recurring complaints from users (X and review sites).`
        : `For each, find current pricing, recent launches, positioning, strengths, and recurring complaints from users (review sites, forums, and recent coverage).`,
      `Then give a two-sentence recommendation and the main trade-off.`,
      `If pricing or features can't be verified, say so rather than guessing.`]},
  prep: {label:'🤝 Meeting prep', src:m => m==='grok'?'both':'web', win:'the last 6 months', fmt:'memo',
    task:i => `Prepare me for: ${i}.`,
    body:() => [`Search for recent news, leadership changes, product launches, hiring trends, and public customer complaints.`,
                `Structure it as: Snapshot, Recent news (dated), Likely priorities, Risks or sensitivities, and 5 smart questions to ask.`,
                `If you can't verify something, say so instead of guessing.`]},
  post: {label:'✍️ Write a post', src:() => 'none', win:'none', fmt:'auto', tone:'direct',
    task:(i,m) => m==='grok' ? `Write a post for X based on this: ${i}.` : `Write a social post based on this: ${i}.`,
    body:m => m==='grok'
      ? [`Open with a strong hook in the first line — no clichés like "Let's dive in".`,
         `If it needs more than 280 characters, make it a numbered thread of 4–7 posts, each able to stand alone.`,
         `Use plain language, at most one emoji per post and no hashtags unless they add real reach.`,
         `Give 2 alternative hooks at the end.`]
      : [`Open with a strong hook in the first line — no clichés like "Let's dive in".`,
         `Write a short post. If the idea needs more room, make it a numbered thread of 4–7 parts, each able to stand alone.`,
         `Use plain language, at most one emoji, and no hashtags unless they add real reach.`,
         `Give 2 alternative hooks at the end.`]},
  analyze: {label:'📄 Analyze a file', src:() => 'none', win:'none', fmt:'memo',
    task:i => `I'm attaching a file. Analyze it with this goal: ${i}.`,
    body:() => [`Pull out the key findings, numbers, and decisions, quoting the source section for each.`,
                `List anything that looks inconsistent, missing, or risky.`,
                `Finish with recommended next steps.`]},
  decide: {label:'🧭 Decide / plan', src:() => 'web', win:'none', fmt:'steps', reason:true,
    task:i => `Help me think through this decision: ${i}.`,
    body:() => [`Lay out the realistic options, including "do nothing".`,
                `For each, list pros, cons, rough cost/effort, and the biggest risk.`,
                `State your assumptions explicitly before recommending.`,
                `Put a clear recommendation and the first 3 concrete actions at the end.`]},
  general: {label:'✨ Anything else', src:() => 'auto', win:'none', fmt:'auto',
    task:i => `${i.charAt(0).toUpperCase()+i.slice(1)}${/[.?!]$/.test(i)?'':'.'}`,
    body:() => [`Be specific and practical; skip generic filler.`, `If something is ambiguous, state the assumption you made.`]},
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
const SOURCE_LABELS = {
  auto:'Auto',
  web:'The web',
  x:'Posts on X',
  both:'Web + X',
  none:'No search (use what I give you)',
};

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

let model = 'any';
let useCase = 'research';
let baIndex = 0;
const state = {format:'auto', tone:'auto'};

function modelById(id){ return MODELS.find(m => m.id===id) || MODELS[0]; }
function labelOf(u, m){ return typeof u.label==='function' ? u.label(m) : u.label; }
function normalizeSrc(m, src){
  if (m!=='grok' && (src==='x' || src==='both')) return 'web';
  return src;
}
function srcOf(u, m){
  const raw = typeof u.src==='function' ? u.src(m) : u.src;
  return normalizeSrc(m, raw);
}
function taskOf(u, idea, m){ return u.task.length>1 ? u.task(idea, m) : u.task(idea); }
function bodyOf(u, m){ return u.body.length ? u.body(m) : u.body(); }

function searchLine(m, src, win, cite){
  if (!src || src==='none' || src==='auto') return '';
  const when = win && win!=='none';
  const citeSentence = cite ? ' Cite every claim with a source link and its date.' : '';
  if (m==='grok'){
    const base = {web:'Search the web', x:'Search posts on X', both:'Search the web and X'}[src];
    if (!base) return '';
    return base + (when ? ` for information from ${win}` : '') + '.' + citeSentence;
  }
  if (m==='perplexity'){
    let s = `Search the web${when ? ` for sources from ${win}` : ''}. Lead with the answer, then the evidence.`;
    s += cite ? ' Cite each claim with the source title, a link, and the date.' : ' Name the sources you relied on.';
    s += ' If sources disagree, say so instead of smoothing it over.';
    return s;
  }
  if (m==='chatgpt'){
    let s = `If browsing is available, search the web${when ? ` for information from ${win}` : ''}. If it is not, say what you could not verify. Do not invent sources.`;
    if (cite) s += ' Cite every claim with a source link and its date.';
    return s;
  }
  if (m==='claude'){
    let s = `If you have a search tool, search the web${when ? ` for information from ${win}` : ''}. If you cannot search, mark claims you could not verify.`;
    if (cite) s += ' Cite every claim with a source link and its date.';
    return s;
  }
  if (m==='gemini'){
    let s = `Use Google Search if it is available${when ? `, and prefer sources from ${win}` : ''}. Do not invent citations.`;
    if (cite) s += ' Cite each claim with a link and the publication date.';
    return s;
  }
  if (m==='copilot'){
    let s = `Use web search${when ? ` for information from ${win}` : ''}. Do not invent sources.`;
    if (cite) s += ' Cite every claim with a source link and its date.';
    return s;
  }
  if (m==='meta'){
    let s = `Look up current public information on the web when you can${when ? `, covering ${win}` : ''}. Separate what you found from what you are inferring.`;
    if (cite) s += ' Include a link and a date for each claim you can source.';
    return s;
  }
  if (m==='deepseek'){
    let s = `If web search is available, use it${when ? ` for information from ${win}` : ''}. Do not invent sources. If you cannot search, label time-sensitive claims as unverified.`;
    if (cite) s += ' Cite every claim with a source link and its date.';
    return s;
  }
  return `Search the web${when ? ` for information from ${win}` : ''}.` + citeSentence;
}

function modelNotes(m){
  if (m==='gemini') return ['Be concrete and scannable. Prefer short headings over long prose unless the format says otherwise.'];
  if (m==='perplexity') return ['Do not pad the answer. If the sources do not cover something, say it is not in the sources.'];
  if (m==='copilot') return ['Write so the result can be used at work without a rewrite.'];
  if (m==='meta') return ['Stay specific. Skip generic encouragement and filler.'];
  if (m==='deepseek') return ['Think the problem through, then deliver the final answer in the format requested. Keep the reasoning and the finished answer distinct.'];
  return [];
}

function rulesFor(o, U, src, uc, m){
  const fmt = o.format==='auto' ? U.fmt : o.format;
  const tone = o.tone==='auto' ? (U.tone||'auto') : o.tone;
  const rules = [];
  if (o.len!=='auto' && LEN[o.len]) rules.push(LEN[o.len]);
  if ((o.facts || U.facts) && src!=='none' && src!=='auto' && uc!=='post') rules.push('Keep verified facts clearly separate from opinions, rumours, and speculation.');
  if (o.reason || U.reason) rules.push('Reason step by step, state your assumptions, and put the final recommendation at the end.');
  if (o.noedge) rules.push('Avoid jokes, sarcasm, and edgy commentary — this may be shared professionally.');
  modelNotes(m).forEach(n => rules.push(n));
  return {fmt, tone, rules};
}

function tag(name, body){ return `<${name}>\n${body}\n</${name}>`; }

function build(idea, uc, o){
  const m = o.model || 'any';
  const U = USE[uc];
  idea = idea.trim().replace(/\s+/g,' ');
  const win = o.win==='auto' ? U.win : o.win;
  const src = normalizeSrc(m, o.src==='auto' ? srcOf(U, m) : o.src);
  const {fmt, tone, rules} = rulesFor(o, U, src, uc, m);
  const steps = bodyOf(U, m).map((b,i)=>`${i+1}. ${b}`).join('\n');
  let search = searchLine(m, src, win, o.cite);
  if (!search && uc==='analyze') search = 'Base your answer only on the attached file; don\'t search unless asked.';

  if (m==='claude'){
    const blocks = [tag('task', taskOf(U, idea, m))];
    if (o.ctx) blocks.push(tag('context', `Context about me: ${o.ctx.trim().replace(/\.?$/,'.')}`));
    if (o.aud) blocks.push(tag('audience', `The audience for this is ${o.aud.trim().replace(/\.$/,'')}. Pitch the depth and wording for them.`));
    if (search) blocks.push(tag('search', search));
    blocks.push(tag('instructions', steps));
    if (fmt!=='auto' && FORMAT[fmt]) blocks.push(tag('format', FORMAT[fmt]));
    if (TONE[tone]) blocks.push(tag('tone', TONE[tone]));
    if (rules.length) blocks.push(tag('constraints', rules.map(r=>`- ${r}`).join('\n')));
    return blocks.join('\n\n');
  }

  const L = [];
  if (m==='chatgpt') L.push('You are a careful assistant. Follow the instructions exactly and do not add filler.','');
  L.push(taskOf(U, idea, m));
  if (o.ctx) L.push(`Context about me: ${o.ctx.trim().replace(/\.?$/,'.')}`);
  if (o.aud) L.push(`The audience for this is ${o.aud.trim().replace(/\.$/,'')}, so pitch the depth and wording for them.`);
  if (search){ L.push(''); L.push(search); }
  L.push(''); L.push('Return:');
  L.push(steps);
  const tail = [];
  if (fmt!=='auto' && FORMAT[fmt]) tail.push(FORMAT[fmt]);
  if (TONE[tone]) tail.push(TONE[tone]);
  tail.push(...rules);
  if (tail.length){ L.push(''); tail.forEach(r=>L.push(r)); }
  return L.join('\n');
}

function opts(){
  return {format:state.format, tone:state.tone, win:$('#window').value, src:$('#sources').value, len:$('#length').value,
    aud:$('#audience').value, ctx:$('#context').value, cite:$('#cite').checked, facts:$('#facts').checked,
    reason:$('#reason').checked, noedge:$('#noedge').checked, model};
}

function openPlan(prompt){
  const M = modelById(model);
  if (!M.href) return {mode:'copy', name:M.name};
  const url = M.href + encodeURIComponent(prompt);
  if (url.length > OPEN_URL_LIMIT) return {mode:'copy', name:M.name, tooLong:true};
  return {mode:'open', name:M.name, url};
}

function showToast(text){
  const toast = $('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>toast.classList.remove('show'), 1600);
}

async function copyText(text){
  try { await navigator.clipboard.writeText(text); }
  catch { $('#result').select(); document.execCommand('copy'); }
}

if (typeof document !== 'undefined') init();

function init(){
  const modelChips = $('#models');
  MODELS.forEach(M=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip'+(M.id===model?' on':'');
    b.textContent = M.name;
    b.dataset.k = M.id;
    b.onclick = ()=>setModel(M.id);
    modelChips.appendChild(b);
  });

  const chips = $('#usecases');
  Object.entries(USE).forEach(([k,u])=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip'+(k===useCase?' on':'');
    b.textContent = labelOf(u, model);
    b.dataset.k = k;
    b.onclick = ()=>{
      useCase = k;
      chips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on', c===b));
      if (!$('#out').classList.contains('hidden') && $('#idea').value.trim()) generate();
    };
    chips.appendChild(b);
  });

  document.querySelectorAll('.seg').forEach(seg=>seg.addEventListener('click', e=>{
    const b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(x=>x.classList.toggle('on', x===b));
    state[seg.dataset.name] = b.dataset.v;
  }));
  document.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{
    const [k,t] = EXAMPLES[+b.dataset.ex];
    chips.querySelector(`[data-k="${k}"]`).click();
    $('#idea').value = t;
    generate();
  });

  $('#go').onclick = generate;
  $('#idea').addEventListener('keydown', e=>{ if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) generate(); });
  $('#copy').onclick = async ()=>{
    await copyText($('#result').value);
    showToast('Copied to clipboard');
  };
  $('#open').onclick = async ()=>{
    const prompt = $('#result').value;
    const plan = openPlan(prompt);
    if (plan.mode==='open'){
      window.open(plan.url, '_blank', 'noopener,noreferrer');
      return;
    }
    await copyText(prompt);
    showToast(plan.tooLong
      ? `Copied — too long to prefill. Paste it into ${plan.name}.`
      : (model==='any' ? 'Copied — paste it into whichever AI you use' : `Copied — paste it into ${plan.name}`));
  };

  const tabs = $('#batabs');
  BA.forEach(([name], i)=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip'+(i===0?' on':'');
    b.textContent = name;
    b.onclick = ()=>{
      baIndex = i;
      tabs.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on', c===b));
      renderBA();
    };
    tabs.appendChild(b);
  });

  syncSources();
  syncEdge();
  renderBA();
}

function setModel(id){
  if (model===id) return;
  model = id;
  $('#models').querySelectorAll('.chip').forEach(c=>c.classList.toggle('on', c.dataset.k===id));
  $('#usecases').querySelectorAll('.chip').forEach(c=>{ c.textContent = labelOf(USE[c.dataset.k], model); });
  syncSources();
  syncEdge();
  renderBA();
  if (!$('#out').classList.contains('hidden') && $('#idea').value.trim()) generate();
}

function syncSources(){
  const sel = $('#sources');
  const prev = sel.value;
  const order = model==='grok' ? ['auto','web','x','both','none'] : ['auto','web','none'];
  sel.replaceChildren();
  order.forEach(v=>{
    const o = document.createElement('option');
    o.value = v;
    o.textContent = SOURCE_LABELS[v];
    sel.appendChild(o);
  });
  sel.value = order.includes(prev) ? prev : ((prev==='x' || prev==='both') ? 'web' : 'auto');
}

function syncEdge(){
  $('#noedge-lbl').textContent = model==='grok' ? 'Tone down the edgy voice' : 'Skip jokes and sarcasm';
}

function renderBA(){
  const defaults = {format:'auto', tone:'auto', win:'auto', src:'auto', len:'auto', aud:'', ctx:'', cite:true, facts:true, reason:false, noedge:false, model};
  const [, before, uc, extra] = BA[baIndex];
  $('#before').textContent = before;
  $('#after').textContent = build(before, uc, {...defaults, ...extra, model});
}

function applyOpen(prompt){
  const plan = openPlan(prompt);
  const btn = $('#open');
  const M = modelById(model);
  if (plan.mode==='open') btn.textContent = `Open in ${plan.name} ↗`;
  else if (model==='any') btn.textContent = 'Copy to paste';
  else btn.textContent = `Copy for ${plan.name}`;
  $('#outtitle').textContent = model==='any' ? 'Your prompt' : `Your ${M.name} prompt`;
  const hint = $('#outhint');
  if (plan.mode==='open') hint.textContent = `Edit freely, then open it in ${plan.name} or use Copy.`;
  else if (plan.tooLong) hint.textContent = `This prompt is too long to prefill in ${plan.name}. Copy it and paste it there.`;
  else if (model==='any') hint.textContent = 'Edit freely, then paste it into whichever AI you use. This choice has no prefill link.';
  else hint.textContent = `Edit freely, then paste it into ${plan.name}. There is no prefill link for this model.`;
}

function generate(){
  const idea = $('#idea').value;
  if (!idea.trim()){
    $('#idea').focus();
    $('#idea').style.borderColor = 'var(--bad)';
    setTimeout(()=>$('#idea').style.borderColor='', 1200);
    return;
  }
  const p = build(idea, useCase, opts());
  $('#result').value = p;
  $('#out').classList.remove('hidden');
  $('#stats').textContent = `${p.split(/\s+/).length} words`;
  applyOpen(p);
  $('#out').scrollIntoView({behavior:'smooth', block:'nearest'});
}
