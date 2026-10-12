const cfg = window.WORLDSCAPE_CONFIG || {};
const header = document.querySelector('.site-header');
const menu = document.querySelector('.menu-btn');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', scrollY > 24));
menu?.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => header?.classList.remove('open')));
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

document.querySelectorAll('[data-email]').forEach(a => {
  a.textContent = cfg.email || 'info.worldscapetours@gmail.com';
  a.href = `mailto:${cfg.email || 'info.worldscapetours@gmail.com'}`;
});
const nums = cfg.whatsappNumbers || ['94752658888','94702042695'];
function waUrl(index, message){
  const n = (nums[index] || nums[0] || '').replace(/\D/g,'');
  return `https://wa.me/${n}?text=${encodeURIComponent(message || cfg.defaultWhatsappMessage || 'Hi Worldscape Tours!')}`;
}
document.querySelectorAll('[data-wa]').forEach(a => {
  const idx = Math.max(0, Number(a.dataset.wa || 1) - 1);
  a.href = waUrl(idx);
});

const waToggle = document.querySelector('#waToggle');
const waPopover = document.querySelector('#waPopover');
waToggle?.addEventListener('click', () => waPopover?.classList.toggle('show'));
document.addEventListener('click', e => {
  if (waPopover && waToggle && !waPopover.contains(e.target) && e.target !== waToggle) waPopover.classList.remove('show');
});

const obs = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), {threshold:.12}) : null;
document.querySelectorAll('.reveal').forEach(el => obs ? obs.observe(el) : el.classList.add('visible'));

function thankYouUrl(){
  try { return new URL('thanks.html', window.location.href).href; } catch { return 'thanks.html'; }
}
const contactNext = document.querySelector('#contactNext');
if(contactNext) contactNext.value = thankYouUrl();
const plannerNext = document.querySelector('#plannerNext');
if(plannerNext) plannerNext.value = thankYouUrl();

// Prefill package from query string.
const packageField = document.querySelector('#packageField');
if(packageField){
  const pkg = new URLSearchParams(location.search).get('package');
  if(pkg) packageField.value = `${pkg} package`;
}

const planner = document.querySelector('#plannerForm');
if(planner){
  let step = 1;
  const panels = [...planner.querySelectorAll('.step-panel')];
  const bar = planner.querySelector('.progress span');
  function show(n){
    step = Math.max(1, Math.min(5, n));
    panels.forEach(p => p.classList.toggle('active', Number(p.dataset.step) === step));
    if(bar) bar.style.width = `${step * 20}%`;
    planner.scrollIntoView({behavior:'smooth', block:'center'});
  }
  planner.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => show(step + 1)));
  planner.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', () => show(step - 1)));

  const generate = document.querySelector('#generateRoute');
  generate?.addEventListener('click', () => {
    const f = new FormData(planner);
    const styles = f.getAll('Interests');
    const pace = f.get('Pace') || 'Balanced';
    const duration = f.get('Duration') || '8–10 days';
    let route = 'Colombo → Sigiriya → Kandy → Tea Country → Ella → South Coast';
    if(styles.includes('Wildlife')) route = 'Colombo → Sigiriya → Kandy → Ella → Yala → South Coast';
    else if(styles.includes('Beaches')) route = 'Colombo → Kandy → Tea Country → Ella → Galle → Mirissa';
    else if(styles.includes('Culture')) route = 'Colombo → Sigiriya → Dambulla → Kandy → Tea Country → Galle';
    const summary = `${duration} · ${pace} pace · ${styles.join(', ') || 'Mixed interests'}`;
    document.querySelector('#previewSummary').textContent = summary;
    document.querySelector('#previewRoute').textContent = route;
    document.querySelector('#routeHidden').value = route;
    const msg = [
      `Hi ${cfg.brandName || 'Worldscape Tours'}! I'd like a personalised Sri Lanka trip.`,
      `Name: ${f.get('Name') || ''}`,
      `Email: ${f.get('Email') || ''}`,
      `WhatsApp: ${f.get('WhatsApp') || ''}`,
      `Travellers: ${f.get('Travellers') || ''}`,
      `Interests: ${styles.join(', ') || 'Open to recommendations'}`,
      `Duration: ${duration}`,
      `Pace: ${pace}`,
      `Budget: ${f.get('Budget') || ''}`,
      `Travel month: ${f.get('Travel month') || 'Flexible'}`,
      `Notes: ${f.get('Notes') || 'None'}`,
      `Suggested route: ${route}`
    ].join('\n');
    document.querySelector('#plannerWa1').href = waUrl(0, msg);
    document.querySelector('#plannerWa2').href = waUrl(1, msg);
    show(5);
  });
}

// Floating social media links and language selector.
(function addWorldscapeUtilityRail(){
  if (document.querySelector('.social-rail')) return;

  const rail = document.createElement('div');
  rail.className = 'social-rail';
  rail.setAttribute('aria-label','Worldscape social media');
  rail.innerHTML = `
    <a class="social-facebook" href="https://www.facebook.com/profile.php?id=61585798544449" target="_blank" rel="noopener" aria-label="Facebook"><span class="social-icon">f</span></a>
    <a class="social-instagram" href="https://www.instagram.com/worldscape.tours/" target="_blank" rel="noopener" aria-label="Instagram"><span class="social-icon">◎</span></a>`;
  document.body.appendChild(rail);

  const lang = document.createElement('div');
  lang.className = 'language-float';
  lang.innerHTML = `<label for="worldscapeLanguage">Language</label><select id="worldscapeLanguage" aria-label="Translate website">
    <option value="en">English</option>
    <option value="de">Deutsch</option>
    <option value="fr">Français</option>
    <option value="es">Español</option>
    <option value="it">Italiano</option>
    <option value="ru">Русский</option>
    <option value="ar">العربية</option>
    <option value="zh-CN">中文</option>
    <option value="hi">हिन्दी</option>
    <option value="nl">Nederlands</option>
  </select>`;
  document.body.appendChild(lang);

  const select = lang.querySelector('#worldscapeLanguage');
  select.addEventListener('change', () => {
    const code = select.value;
    if(code === 'en') return;
    if(location.protocol === 'http:' || location.protocol === 'https:'){
      const cleanUrl = location.href;
      location.href = `https://translate.google.com/translate?sl=en&tl=${encodeURIComponent(code)}&u=${encodeURIComponent(cleanUrl)}`;
    } else {
      alert('Translation works after the website is hosted online.');
      select.value = 'en';
    }
  });
})();
