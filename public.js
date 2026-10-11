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
  if(!s.instagram)s.instagram='https://www.instagram.com/badidevijetulsimandi/';
  const configuredItems=items.filter(x=>s[x[0]]);
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
  const years=[...new Set(['2025',...items.map(x=>String(x.year_label||'2025'))])].sort((a,b)=>Number(b)-Number(a));
  const selected=cards.dataset.year||'2025';
  cards.innerHTML=`<div class="gallery-year-filter" style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${years.map(y=>`<button type="button" class="button ${y===selected?'button-gold':'button-outline'}" data-gallery-year="${esc(y)}">${esc(y)}</button>`).join('')}</div>`+items.filter(x=>String(x.year_label||'2025')===selected && x.media_type!=='video').map(x=>`<article class="media-card"><img class="gallery-photo" loading="lazy" src="${esc(x.media_url)}" alt="${esc(x.title)}" data-view-image="${esc(x.media_url)}" data-view-title="${esc(x.title)}"><div class="media-body"><h3>${esc(x.title)}</h3><p>${esc(x.description||'')} · ${esc(x.year_label||'2025')}</p></div></article>`).join('');
  cards.querySelectorAll('[data-gallery-year]').forEach(btn=>btn.addEventListener('click',()=>{cards.dataset.year=btn.dataset.galleryYear;renderGallery(items)}));
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
  $('announcementList').innerHTML=items.map(x=>`<article class="announcement"><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p><small>${x.created_at?new Date(x.created_at).toLocaleDateString('hi-IN'):''}</small></article>`).join('');
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
async function init() {
  const form=$('contactForm');
  if(form) form.addEventListener('submit',e=>{e.preventDefault();$('formStatus').textContent=db?'संदेश भेजने की सुविधा सेटअप की जाँच के बाद सक्रिय की जाएगी।':'यह फ़ॉर्म संदेश भेजने के लिए अभी सक्रिय नहीं है। Supabase सेटअप के बाद इसे जोड़ा जाएगा।';});
  if(!db) return;
  const [hero,history,loc,social,contact,gallery,videos,events,committee,announcements]=await Promise.all([content('hero'),content('history'),content('location'),content('social'),content('contact'),rows('gallery'),rows('creator_videos'),rows('events'),rows('committee_members'),rows('announcements','created_at')]);
  if(hero){if(hero.title){$('heroTitle').textContent=hero.title;$('brandTitle').textContent=hero.title;}if(hero.subtitle){$('heroSub').textContent=hero.subtitle;$('brandSub').textContent=hero.subtitle+' · पटना';}if(hero.tagline)$('heroTag').textContent=hero.tagline;if(hero.description)$('heroDesc').textContent=hero.description;if(hero.background_url){const photo=$('heroPhoto');if(photo){photo.innerHTML=`<img src="${esc(hero.background_url)}" alt="श्री श्री बड़ी देवी जी माँ दुर्गा के दर्शन">`;photo.hidden=false;}}}
  if(history){$('historyBody').textContent=history.body||$('historyBody').textContent;const h=$('historyGallery');if(history.image_url)h.innerHTML=`<img loading="lazy" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-top:10px" src="${esc(history.image_url)}" alt="इतिहास की तस्वीर">`;}
  if(loc){if(loc.address)$('address').textContent=loc.address;if(loc.map_url)$('mapLink').href=loc.map_url;}
  if(contact){const bits=[contact.phone?'फ़ोन: '+contact.phone:'',contact.email?'ईमेल: '+contact.email:''].filter(Boolean);if(bits.length)$('contact').querySelector('.muted-text').textContent=bits.join(' · ')+'।';}
  showSocial(social);renderGallery(gallery);renderVideos(videos);renderEvents(events);renderCommittee(committee);renderAnnouncements(announcements.filter(x=>x.active));
}
init();
