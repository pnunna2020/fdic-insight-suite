/* FDIC Insight Suite — shared theme selector
   Injects a floating theme button and applies CSS custom-property overrides
   to :root. Selection is persisted in localStorage key "fdic_theme".       */
(function(){
  const THEMES = {
    default: {
      label: 'Midnight Blue',
      desc:  'Default — deep navy with cyan / violet accents',
      vars: {
        '--bg-0':'#05070f','--bg-1':'#0a0e1f','--bg-2':'#0f152b',
        '--surface':'rgba(20,28,52,.55)','--surface-2':'rgba(28,38,68,.65)','--surface-3':'rgba(11,16,34,.85)',
        '--border':'rgba(120,148,210,.16)','--border-strong':'rgba(140,170,230,.32)',
        '--text':'#e8edf7','--text-dim':'#a4b0cf','--muted':'#6f7d9e',
        '--accent':'#5cc8ff','--accent-2':'#9d7cff','--gold':'#f0c674',
        '--teal':'#22d3ee','--emerald':'#34d399','--amber':'#fbbf24',
        '--coral':'#fb7185','--crimson':'#ef4444',
      }
    },
    dark: {
      label: 'Graphite',
      desc:  'Near-black with neutral greys and cool accent',
      vars: {
        '--bg-0':'#0b0b0d','--bg-1':'#121215','--bg-2':'#17171b',
        '--surface':'rgba(32,32,40,.62)','--surface-2':'rgba(40,40,50,.72)','--surface-3':'rgba(18,18,22,.92)',
        '--border':'rgba(180,180,200,.12)','--border-strong':'rgba(200,200,220,.28)',
        '--text':'#ececf3','--text-dim':'#b8b8c4','--muted':'#80808f',
        '--accent':'#7dd3fc','--accent-2':'#c4b5fd','--gold':'#fcd34d',
        '--teal':'#22d3ee','--emerald':'#34d399','--amber':'#fbbf24',
        '--coral':'#fb7185','--crimson':'#ef4444',
      }
    },
    contrast: {
      label: 'High Contrast',
      desc:  'Accessibility — black/white/yellow, max legibility',
      vars: {
        '--bg-0':'#000000','--bg-1':'#0a0a0a','--bg-2':'#141414',
        '--surface':'rgba(24,24,24,.92)','--surface-2':'rgba(32,32,32,.92)','--surface-3':'rgba(8,8,8,.98)',
        '--border':'rgba(255,255,255,.25)','--border-strong':'rgba(255,255,0,.55)',
        '--text':'#ffffff','--text-dim':'#e5e5e5','--muted':'#a0a0a0',
        '--accent':'#ffd600','--accent-2':'#00ffff','--gold':'#ffd600',
        '--teal':'#00ffff','--emerald':'#00ff80','--amber':'#ffd600',
        '--coral':'#ff6b6b','--crimson':'#ff1744',
      }
    },
    ocean: {
      label: 'Ocean',
      desc:  'Deep teal / navy with cyan highlights',
      vars: {
        '--bg-0':'#04151f','--bg-1':'#062434','--bg-2':'#0a3449',
        '--surface':'rgba(10,52,73,.55)','--surface-2':'rgba(14,68,94,.65)','--surface-3':'rgba(6,36,52,.85)',
        '--border':'rgba(94,180,210,.18)','--border-strong':'rgba(120,210,240,.35)',
        '--text':'#e6f4fa','--text-dim':'#a6cee0','--muted':'#6d93a6',
        '--accent':'#22d3ee','--accent-2':'#5eead4','--gold':'#fde68a',
        '--teal':'#2dd4bf','--emerald':'#34d399','--amber':'#fbbf24',
        '--coral':'#fb7185','--crimson':'#ef4444',
      }
    },
    warm: {
      label: 'Parchment',
      desc:  'Warm amber / sepia for long reading sessions',
      vars: {
        '--bg-0':'#1a130a','--bg-1':'#241a0f','--bg-2':'#2e2313',
        '--surface':'rgba(62,44,22,.55)','--surface-2':'rgba(80,58,30,.65)','--surface-3':'rgba(38,26,14,.88)',
        '--border':'rgba(210,170,110,.18)','--border-strong':'rgba(230,190,130,.36)',
        '--text':'#f5ead4','--text-dim':'#d6c49d','--muted':'#a68b62',
        '--accent':'#f0c674','--accent-2':'#e8a164','--gold':'#f9d77a',
        '--teal':'#b9d37b','--emerald':'#90c57c','--amber':'#f4b860',
        '--coral':'#e8845d','--crimson':'#d64a3b',
      }
    },
    gov: {
      label: 'Federal',
      desc:  'Navy / white / red — US government palette',
      vars: {
        '--bg-0':'#0a1628','--bg-1':'#112238','--bg-2':'#172e48',
        '--surface':'rgba(23,46,72,.58)','--surface-2':'rgba(32,58,88,.68)','--surface-3':'rgba(12,24,40,.88)',
        '--border':'rgba(180,200,230,.18)','--border-strong':'rgba(220,60,80,.42)',
        '--text':'#f0f4fa','--text-dim':'#b6c7de','--muted':'#7a8ca6',
        '--accent':'#c8102e','--accent-2':'#0a3161','--gold':'#ffd966',
        '--teal':'#5e9acf','--emerald':'#4a9d5a','--amber':'#ffd966',
        '--coral':'#e36b78','--crimson':'#c8102e',
      }
    },
  };

  const KEY = 'fdic_theme';
  function getSaved(){ try{ return localStorage.getItem(KEY) || 'default'; }catch(e){ return 'default'; } }
  function setSaved(id){ try{ localStorage.setItem(KEY, id); }catch(e){} }

  function applyTheme(id){
    const t = THEMES[id] || THEMES.default;
    let s = document.getElementById('fdic-theme-override');
    if(!s){ s = document.createElement('style'); s.id='fdic-theme-override'; document.head.appendChild(s); }
    const cssVars = Object.entries(t.vars).map(([k,v])=>`${k}:${v};`).join('');
    s.textContent = `:root{${cssVars}}`;
    setSaved(id);
    document.querySelectorAll('[data-fdic-theme-option]').forEach(el=>{
      el.classList.toggle('active', el.dataset.fdicThemeOption===id);
    });
  }

  function injectUI(){
    if(document.getElementById('fdic-theme-btn')) return;
    const style = document.createElement('style');
    style.textContent = `
      #fdic-theme-btn{position:fixed;right:18px;bottom:18px;z-index:9999;width:42px;height:42px;border-radius:50%;
        background:var(--surface-3,rgba(11,16,34,.9));border:1px solid var(--border-strong,rgba(140,170,230,.32));
        color:var(--text-dim,#a4b0cf);cursor:pointer;display:flex;align-items:center;justify-content:center;
        box-shadow:0 6px 22px rgba(0,0,0,.45);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
        transition:transform .2s,border-color .2s,color .2s}
      #fdic-theme-btn:hover{transform:translateY(-2px);border-color:var(--accent,#5cc8ff);color:var(--accent,#5cc8ff)}
      #fdic-theme-btn svg{width:19px;height:19px}
      #fdic-theme-panel{position:fixed;right:18px;bottom:72px;z-index:9999;width:290px;
        background:var(--surface-3,rgba(11,16,34,.95));border:1px solid var(--border-strong,rgba(140,170,230,.32));
        border-radius:14px;padding:14px;display:none;box-shadow:0 18px 50px rgba(0,0,0,.55);
        backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
        font-family:'Inter',-apple-system,sans-serif}
      #fdic-theme-panel.open{display:block}
      #fdic-theme-panel h4{margin:0 0 10px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;
        color:var(--muted,#6f7d9e);font-weight:600}
      .fdic-theme-opt{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;
        border:1px solid transparent;transition:background .15s,border-color .15s;margin-bottom:4px}
      .fdic-theme-opt:hover{background:rgba(255,255,255,.04);border-color:var(--border,rgba(120,148,210,.16))}
      .fdic-theme-opt.active{border-color:var(--accent,#5cc8ff);background:rgba(92,200,255,.08)}
      .fdic-theme-swatch{width:34px;height:34px;border-radius:7px;flex-shrink:0;border:1px solid rgba(255,255,255,.1);
        display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;overflow:hidden}
      .fdic-theme-swatch span{display:block}
      .fdic-theme-meta{flex:1;min-width:0}
      .fdic-theme-meta .nm{font-size:12.5px;font-weight:600;color:var(--text,#e8edf7)}
      .fdic-theme-meta .ds{font-size:10.5px;color:var(--muted,#6f7d9e);margin-top:1px;line-height:1.35}
    `;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.id = 'fdic-theme-btn';
    btn.title = 'Theme';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12c0 3.3 2.7 6 6 6h1.8c1.1 0 2 .9 2 2 0 1.1.9 2 2 2z"/></svg>';

    const panel = document.createElement('div');
    panel.id = 'fdic-theme-panel';
    panel.innerHTML = '<h4>Select theme</h4>' + Object.entries(THEMES).map(([id,t])=>{
      const v = t.vars;
      return `<div class="fdic-theme-opt" data-fdic-theme-option="${id}">
        <div class="fdic-theme-swatch">
          <span style="background:${v['--bg-0']}"></span>
          <span style="background:${v['--accent']}"></span>
          <span style="background:${v['--accent-2']}"></span>
          <span style="background:${v['--gold']}"></span>
        </div>
        <div class="fdic-theme-meta"><div class="nm">${t.label}</div><div class="ds">${t.desc}</div></div>
      </div>`;
    }).join('');

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    btn.addEventListener('click', e=>{
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', e=>{
      if(!panel.contains(e.target) && e.target!==btn) panel.classList.remove('open');
    });
    panel.querySelectorAll('[data-fdic-theme-option]').forEach(el=>{
      el.addEventListener('click', ()=>{ applyTheme(el.dataset.fdicThemeOption); });
    });
  }

  // Apply saved theme as early as possible (before first paint where possible).
  applyTheme(getSaved());

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectUI);
  } else {
    injectUI();
  }

  // Expose for debugging.
  window.FDICTheme = { apply: applyTheme, list: Object.keys(THEMES) };
})();
