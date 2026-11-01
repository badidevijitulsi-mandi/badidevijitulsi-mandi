const configured = !!(window.supabase && window.SUPABASE_URL && !window.SUPABASE_URL.includes('PASTE_') && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes('PASTE_'));
const db = configured ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
if ($('year')) $('year').textContent = new Date().getFullYear();
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function rows(table, order='sort_order') { if(!db) return []; let q=db.from(table).select('*'); if(order) q=q.order(order,{ascending:true}); const {data,error}=await q; if(error){console.warn(error.message);return []} return data||[]; }
async function content(key) { if(!db) return null; const {data,error}=await db.from('site_content').select('content_value').eq('content_key',key).maybeSingle(); if(error) console.warn(error.message); return data?.content_value||null; }
function showSocial(s) {
  if(!s) return;
  const items=[['instagram','◎','इंस्टाग्राम','रील्स और तस्वीरें','instagram'],['facebook','f','फेसबुक','फोटो और अपडेट','facebook'],['youtube','▶','यूट्यूब','पूजा कार्यक्रम के वीडियो','youtube'],['whatsapp','◉','व्हाट्सऐप','सूचनाएँ और संपर्क','whatsapp']];
  s.instagram='https://www.instagram.com/badidevijetulsimandi?vrfl=OTl4M2tldmJoaGN5';
  s.facebook='https://www.facebook.com/share/1Hw2iwxWK5/';
  const configuredItems=items.filter(x=>['instagram','facebook'].includes(x[0]));
  if(!configuredItems.length) return;
  $('socialGrid').innerHTML=configuredItems.map(x=>`<a class="social ${x[4]}" href="${esc(s[x[0]])}" target="_blank" rel="noopener"><span class="social-symbol">${x[1]}</span><span><strong>${x[2]}</strong><small>${x[3]}</small></span></a>`).join('');
}
function ensureImageViewer() {
  if ($('imageViewer')) return;
  const style=document.createElement('style');
  style.textContent=`.gallery-photo{display:block;width:100%;height:220px;object-fit:cover;border-radius:10px;cursor:pointer}.image-viewer{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;padding:20px}.image-viewer.open{display:flex}.image-viewer img{max-width:95vw;max-height:88vh;object-fit:contain;border-radius:6px}.image-viewer button{position:absolute;top:14px;right:16px;border:0;border-radius:50%;width:42px;height:42px;font-size:28px;background:#fff;color:#222;cursor:pointer}.image-viewer-caption{position:absolute;bottom:12px;left:12px;right:12px;color:#fff;text-align:center;font-size:15px}`;
  document.head.appendChild(style);
  const viewer=document.createElement('div');
  viewer.id='imageViewer';viewer.className='image-viewer';viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');viewer.setAttribute('aria-label','बड़ी तस्वीर');
  viewer.innerHTML='<button type="button" aria-label="बंद करें">×</button><img alt=""><div class="image-viewer-caption"></div>';
  document.body.appendChild(viewer);
  const close=()=>{viewer.classList.remove('open');viewer.querySelector('img').src='';};
  viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.tagName==='BUTTON')close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
}
function openImageViewer(src, title) {
  ensureImageViewer();
  const viewer=$('imageViewer');
  viewer.querySelector('img').src=src;
  viewer.querySelector('img').alt=title||'तस्वीर';
  viewer.querySelector('.image-viewer-caption').textContent=title||'';
  viewer.classList.add('open');
}
function renderGallery(items) {
  const cards=$('galleryCards');
  if(!cards) return;
  const photos=items.filter(x=>x.media_type!=='video');
  const years=[...new Set(['2025',...photos.map(x=>String(x.year_label||'2025'))])].sort((a,b)=>Number(b)-Number(a));
  const selected=cards.dataset.year||'2025';
  const yearItems=photos.filter(x=>String(x.year_label||'2025')===selected);
  const categories=[['all','सभी तस्वीरें'],['माँ दुर्गा दर्शन','माँ के दर्शन'],['ग्रुप फोटो','ग्रुप फोटो'],['विसर्जन','विसर्जन']];
  const available=new Set(yearItems.map(x=>String(x.category||'माँ दुर्गा दर्शन').trim()));
  const shownCategories=categories.filter(([key])=>key==='all'||available.has(key));
  const selectedCategory=cards.dataset.category||'all';
  const visible=selectedCategory==='all'?yearItems:yearItems.filter(x=>String(x.category||'माँ दुर्गा दर्शन').trim()===selectedCategory);
  cards.innerHTML=`<div class="gallery-year-filter" style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${years.map(y=>`<button type="button" class="button ${y===selected?'button-gold':'button-outline'}" data-gallery-year="${esc(y)}">${esc(y)}</button>`).join('')}</div><div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px">${shownCategories.map(([key,label])=>`<button type="button" class="button ${key===selectedCategory?'button-gold':'button-outline'}" data-gallery-category="${esc(key)}">${esc(label)}</button>`).join('')}</div>`+visible.map(x=>`<article class="media-card"><img class="gallery-photo" loading="lazy" src="${esc(x.media_url)}" alt="${esc(x.title)}" data-view-image="${esc(x.media_url)}" data-view-title="${esc(x.title)}"><div class="media-body"><h3>${esc(x.title)}</h3><p>${esc(x.description||'')} · ${esc(x.year_label||'2025')}</p></div></article>`).join('') || `<p style="grid-column:1/-1;color:#806b5b">इस श्रेणी में अभी तस्वीरें नहीं हैं। प्रशासन पैनल से तस्वीरें जोड़ें और श्रेणी चुनें।</p>`;
  cards.querySelectorAll('[data-gallery-year]').forEach(btn=>btn.addEventListener('click',()=>{cards.dataset.year=btn.dataset.galleryYear;cards.dataset.category='all';renderGallery(items)}));
  cards.querySelectorAll('[data-gallery-category]').forEach(btn=>btn.addEventListener('click',()=>{cards.dataset.category=btn.dataset.galleryCategory;renderGallery(items)}));
  cards.querySelectorAll('[data-view-image]').forEach(img=>img.addEventListener('click',()=>openImageViewer(img.dataset.viewImage,img.dataset.viewTitle)));
}
function renderVideos(items) {
  const cards=$('videoCards');
  if(!cards) return;
  const years=[...new Set(['2025',...items.map(x=>String(x.year_label||'2025'))])].sort((a,b)=>Number(b)-Number(a));
  const selected=cards.dataset.year||'2025';
  cards.innerHTML=`<div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${years.map(y=>`<button type="button" class="button ${y===selected?'button-gold':'button-outline'}" data-video-year="${esc(y)}">${esc(y)}</button>`).join('')}</div>`+items.filter(x=>String(x.year_label||'2025')===selected).map(x=>`<article class="media-card"><video controls preload="metadata" playsinline src="${esc(x.video_url)}"></video><div class="media-body"><h3>${esc(x.title)}</h3><p>${esc(x.description||'')} · ${esc(x.year_label||'2025')}</p></div></article>`).join('');
  cards.querySelectorAll('[data-video-year]').forEach(btn=>btn.addEventListener('click',()=>{cards.dataset.year=btn.dataset.videoYear;renderVideos(items)}));
}
function renderAnnouncements(items) {
  if(!items.length) return;
  $('announcementsSection').hidden=false;
  $('announcementList').innerHTML=items.map(x=>`<article class="announcement notice-flash"><strong>📢 ${esc(x.title)}</strong><p>${esc(x.body)}</p><small>${x.created_at?new Date(x.created_at).toLocaleDateString('hi-IN'):''}</small></article>`).join('');
  $('announcementList').querySelectorAll('.notice-flash').forEach(card=>{window.setTimeout(()=>card.classList.remove('notice-flash'),3000);});
}
function renderEvents(items) {
  const fallback=[
    {event_date:'11.10.2026',title:'कलश स्थापना',event_time:'प्रथम दिवस पूजन',description:'',sort_order:1},
    {event_date:'17.10.2026',title:'सप्तमी पूजा',event_time:'पट उद्घाटन',description:'',sort_order:2},
    {event_date:'18.10.2026',title:'अष्टमी पूजा',event_time:'महाअष्टमी व्रत',description:'',sort_order:3},
    {event_date:'19.10.2026',title:'महानवमी पूजा',event_time:'हवन एवं विशेष पूजा',description:'',sort_order:4},
    {event_date:'21.10.2026',title:'विजयादशमी',event_time:'भव्य शोभा यात्रा',description:'आज़ाद बैंड के साथ',sort_order:5},
    {event_date:'प्रतिदिन',title:'दैनिक आरती',event_time:'संध्या 7:00 बजे',description:'',sort_order:6},
    {event_date:'प्रतिदिन',title:'महाप्रसाद वितरण',event_time:'आरती के बाद',description:'',sort_order:7}
  ];
  const data=items.length?items:fallback;
  $('eventList').innerHTML=data.map(x=>`<div class="event-row"><span class="event-date">${esc(x.event_date||'तिथि')}</span><span><strong>${esc(x.title)}</strong><small>${esc(x.event_time||'')} ${esc(x.description||'')}</small></span></div>`).join('');
}
function renderCommittee(items) {
  if(!items.length) return;
  $('committeeList').innerHTML=items.map(x=>`<div class="committee-row"><strong>${esc(x.role||'समिति सदस्य')}: ${esc(x.name)}</strong><span>${x.phone?`संपर्क: ${esc(x.phone)}`:''} ${esc(x.bio||'')}</span></div>`).join('');
}
document.querySelectorAll('a[href="#gallery"]').forEach(link=>link.addEventListener('click',()=>{const section=$('gallery');if(section)section.hidden=false;}));
function applySiteTheme(theme){
const presets={maroon:{background:'#fff8e7',yellowStrong:'#ffe7b8',card:'#fffdf7',primary:'#a51620',deep:'#7c1018',light:'#c62828',accent:'#f4c45e',accentDeep:'#d99b2b',text:'#3b2921',muted:'#806b5b',line:'#f0d9ad'},saffron:{background:'#fff7df',yellowStrong:'#ffebbd',card:'#fffdf5',primary:'#c65b16',deep:'#87380e',light:'#e17a25',accent:'#f2bd48',accentDeep:'#ce8d25',text:'#3f2d20',muted:'#806b55',line:'#eed8aa'},royal:{background:'#f2f6fc',yellowStrong:'#dce8f7',card:'#ffffff',primary:'#244f86',deep:'#142e55',light:'#3974b7',accent:'#c5d5eb',accentDeep:'#8faed4',text:'#1e2b3d',muted:'#63758b',line:'#d4dfed'},emerald:{background:'#f3f7ed',yellowStrong:'#e0ebd5',card:'#fbfff8',primary:'#176044',deep:'#0e3f2d',light:'#27805b',accent:'#d9b64c',accentDeep:'#b58e2c',text:'#26372d',muted:'#687b6d',line:'#d5e2d0'},rose:{background:'#fff4f2',yellowStrong:'#f8dfdf',card:'#fffdfc',primary:'#9f4055',deep:'#6f263b',light:'#bd6377',accent:'#d9a06f',accentDeep:'#b77a51',text:'#402b30',muted:'#80676c',line:'#efd5d6'}};
let p;if(typeof theme==='object'&&theme.colors){const c=theme.colors;p={background:c.background,yellowStrong:c.background,card:c.card,primary:c.primary,deep:c.deep,light:c.primary,accent:c.accent,accentDeep:c.accent,text:c.text,muted:c.text,line:c.accent}}else p=presets[theme]||presets.maroon;
const r=document.documentElement;r.style.setProperty('--yellow',p.background);r.style.setProperty('--yellow-strong',p.yellowStrong);r.style.setProperty('--card',p.card);r.style.setProperty('--maroon',p.primary);r.style.setProperty('--maroon-deep',p.deep);r.style.setProperty('--maroon-light',p.light);r.style.setProperty('--gold',p.accent);r.style.setProperty('--gold-deep',p.accentDeep);r.style.setProperty('--ink',p.text);r.style.setProperty('--muted',p.muted);r.style.setProperty('--line',p.line);
const old=document.getElementById('siteThemeOverrides');if(old)old.remove();const style=document.createElement('style');style.id='siteThemeOverrides';style.textContent='.site-header{background:var(--maroon)}.hero{background-color:var(--maroon-deep)}.shortcut-wrap{background:var(--yellow)}.shortcut{background:var(--card);border-color:var(--line)}.shortcut strong,.section-heading h2,.info-card h2,.contact-card h2,.media-body h3,.announcement strong{color:var(--maroon)}.announcement{background:var(--card);border-color:var(--line);border-left-color:var(--gold-deep)}.media-card,.contact-card,.info-card{background:var(--card);border-color:var(--line)}.button-gold{background:var(--gold);border-color:var(--gold)}.button-outline{border-color:var(--gold);color:var(--maroon)}.text-link{color:var(--maroon);border-color:var(--line)}.site-footer{background:var(--maroon-deep)}';document.head.appendChild(style);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',p.deep);
}

async function init() {
  const form=$('contactForm');
  if(form) form.addEventListener('submit',e=>{e.preventDefault();$('formStatus').textContent=db?'संदेश भेजने की सुविधा सेटअप की जाँच के बाद सक्रिय की जाएगी।':'यह फ़ॉर्म संदेश भेजने के लिए अभी सक्रिय नहीं है। Supabase सेटअप के बाद इसे जोड़ा जाएगा।';});
  if(!db) return;
  const [hero,history,loc,social,contact,gallery,videos,events,committee,announcements,theme]=await Promise.all([content('hero'),content('history'),content('location'),content('social'),content('contact'),rows('gallery'),rows('creator_videos'),rows('events'),rows('committee_members'),rows('announcements','created_at'),content('theme')]);
  if(theme?.theme_id)applySiteTheme(theme.custom_theme||theme.theme_id);
  if(hero){if(hero.position){const q=hero.position;const heading=$('heroTitle')?.closest('.hero-heading');const copy=$('heroTag')?.closest('.hero-inner');if(heading){const x=Math.max(-70,Math.min(70,Number(q.headingX)||0));heading.style.setProperty('--hero-heading-x',x+'px');heading.style.setProperty('--hero-heading-y',(Number(q.headingY)||0)+'px');heading.style.maxWidth='calc(100% - '+Math.max(0,x)+'px)';}if(copy){const x=Math.max(-70,Math.min(70,Number(q.copyX)||0));copy.style.setProperty('--hero-copy-x',x+'px');copy.style.setProperty('--hero-copy-y',(Number(q.copyY)||0)+'px');copy.style.maxWidth='calc(100% - '+Math.max(0,x)+'px)';} }if(hero.title){$('heroTitle').textContent=hero.title;$('brandTitle').textContent=hero.title;}if(hero.subtitle){$('heroSub').textContent=hero.subtitle;$('brandSub').textContent=hero.subtitle+' · पटना';}if(hero.tagline)$('heroTag').textContent=hero.tagline;if(hero.description)$('heroDesc').textContent=hero.description;const ts=hero.text_style||{};const heroTag=$('heroTag'),heroDesc=$('heroDesc'),heroButtons=document.querySelectorAll('.hero-actions .button');if(heroTag)heroTag.style.setProperty('font-size',Math.max(9,Math.min(22,Number(ts.tagline_size)||12))+'px','important');if(heroDesc)heroDesc.style.setProperty('font-size',Math.max(8,Math.min(20,Number(ts.description_size)||14))+'px','important');heroButtons.forEach(b=>{b.style.setProperty('font-size',Math.max(1,Math.min(1000,Number(ts.button_size)||12))+'px','important');b.style.setProperty('padding','6px 11px','important');b.style.setProperty('min-height','0','important');b.style.setProperty('line-height','1.2','important');b.style.setProperty('gap','5px','important');b.style.setProperty('border-radius','24px','important')});if(hero.background_url){const photo=$('heroPhoto');if(photo){photo.innerHTML=`<img src="${esc(hero.background_url)}" alt="श्री श्री बड़ी देवी जी माँ दुर्गा के दर्शन">`;const pi=photo.querySelector("img");const adj=hero.image_adjustment||{};pi.style.objectFit="contain";pi.style.objectPosition="center";pi.style.transform="translate("+((Number(adj.x??50)-50)*0.5)+"%,"+((Number(adj.y??50)-50)*0.5)+"%) scale("+(Math.max(50,Math.min(250,Number(adj.zoom)||100))/100)+") rotate("+Math.max(-180,Math.min(180,Number(adj.rotation)||0))+"deg)";photo.hidden=false;}}}
if(history){$('historyBody').textContent=history.body||$('historyBody').textContent;const h=$('historyGallery');if(h)h.innerHTML='';}
  if(loc){if(loc.address)$('address').textContent=loc.address;if(loc.map_url)$('mapLink').href=loc.map_url;}
  if(contact){const bits=[contact.phone?'फ़ोन: '+contact.phone:'',contact.email?'ईमेल: '+contact.email:''].filter(Boolean);if(bits.length)$('contact').querySelector('.muted-text').textContent=bits.join(' · ')+'।';}
  showSocial(social);renderGallery(gallery);renderVideos(videos);renderEvents(events);renderCommittee(committee);renderAnnouncements(announcements.filter(x=>x.active));
}
init();
