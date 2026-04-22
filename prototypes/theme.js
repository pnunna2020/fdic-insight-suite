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
      desc:  'Warm amber / sepia — sits between dark and light',
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
    sky: {
      label: 'Sky Blue',
      desc:  'Bright medium blue — sunny, cheerful, professional',
      vars: {
        '--bg-0':'#e8f4fd','--bg-1':'#ffffff','--bg-2':'#cce5f6',
        '--surface':'rgba(240,248,255,.90)','--surface-2':'rgba(204,229,246,.88)','--surface-3':'rgba(232,244,253,.97)',
        '--border':'rgba(168,212,240,.55)','--border-strong':'rgba(33,150,243,.30)',
        '--text':'#1a3654','--text-dim':'#5a7d9a','--muted':'#8a9db8',
        '--accent':'#2196f3','--accent-2':'#0d47a1','--gold':'#f9a825',
        '--teal':'#0097a7','--emerald':'#2e7d32','--amber':'#f57f17',
        '--coral':'#ef5350','--crimson':'#c62828',
      }
    },
    sage: {
      label: 'Sage Garden',
      desc:  'Soft sage green — calm, natural, easy on the eyes',
      vars: {
        '--bg-0':'#eef3ec','--bg-1':'#fafcf9','--bg-2':'#dce5d8',
        '--surface':'rgba(245,248,243,.90)','--surface-2':'rgba(220,229,216,.88)','--surface-3':'rgba(238,243,236,.97)',
        '--border':'rgba(196,212,188,.60)','--border-strong':'rgba(74,124,89,.32)',
        '--text':'#2c3e28','--text-dim':'#5f7a58','--muted':'#8fa885',
        '--accent':'#4a7c59','--accent-2':'#6a994e','--gold':'#ca8a04',
        '--teal':'#0d9488','--emerald':'#16a34a','--amber':'#ca8a04',
        '--coral':'#dc2626','--crimson':'#b91c1c',
      }
    },
    blush: {
      label: 'Blush',
      desc:  'Soft warm rose — elegant, modern, distinctive',
      vars: {
        '--bg-0':'#fdf2f4','--bg-1':'#ffffff','--bg-2':'#f5dce0',
        '--surface':'rgba(254,247,248,.90)','--surface-2':'rgba(245,220,224,.88)','--surface-3':'rgba(253,242,244,.97)',
        '--border':'rgba(232,196,204,.55)','--border-strong':'rgba(199,91,122,.32)',
        '--text':'#3d2028','--text-dim':'#8a6570','--muted':'#b89aa3',
        '--accent':'#c75b7a','--accent-2':'#9c27b0','--gold':'#e97316',
        '--teal':'#0891b2','--emerald':'#059669','--amber':'#d97706',
        '--coral':'#ef4444','--crimson':'#dc2626',
      }
    },
    light: {
      label: 'Clean White',
      desc:  'Pure white — light grey cards, navy text, blue accents',
      vars: {
        '--bg-0':'#ffffff','--bg-1':'#f8f9fa','--bg-2':'#e9ecef',
        '--surface':'rgba(255,255,255,.90)','--surface-2':'rgba(248,249,250,.95)','--surface-3':'rgba(233,236,239,.98)',
        '--border':'rgba(33,37,41,.12)','--border-strong':'rgba(13,110,253,.30)',
        '--text':'#212529','--text-dim':'#495057','--muted':'#6c757d',
        '--accent':'#0d6efd','--accent-2':'#6610f2','--gold':'#ffc107',
        '--teal':'#0dcaf0','--emerald':'#198754','--amber':'#ffc107',
        '--coral':'#fd7e14','--crimson':'#dc3545',
      }
    },
    lavender: {
      label: 'Soft Lavender',
      desc:  'Light purple background, white cards, violet accents',
      vars: {
        '--bg-0':'#f8f7fc','--bg-1':'#ffffff','--bg-2':'#ede8f5',
        '--surface':'rgba(255,255,255,.92)','--surface-2':'rgba(237,232,245,.88)','--surface-3':'rgba(248,247,252,.97)',
        '--border':'rgba(45,35,66,.12)','--border-strong':'rgba(124,58,237,.30)',
        '--text':'#2d2342','--text-dim':'#5a4e7c','--muted':'#8b85a0',
        '--accent':'#7c3aed','--accent-2':'#db2777','--gold':'#d97706',
        '--teal':'#0891b2','--emerald':'#059669','--amber':'#d97706',
        '--coral':'#ea580c','--crimson':'#dc2626',
      }
    },
    mint: {
      label: 'Mint Fresh',
      desc:  'Light mint background, white cards, teal accents',
      vars: {
        '--bg-0':'#f0faf5','--bg-1':'#ffffff','--bg-2':'#d4edda',
        '--surface':'rgba(255,255,255,.92)','--surface-2':'rgba(212,237,218,.88)','--surface-3':'rgba(240,250,245,.97)',
        '--border':'rgba(26,60,42,.12)','--border-strong':'rgba(13,148,136,.30)',
        '--text':'#1a3c2a','--text-dim':'#2d6a4f','--muted':'#6b8f7f',
        '--accent':'#0d9488','--accent-2':'#0284c7','--gold':'#ca8a04',
        '--teal':'#0d9488','--emerald':'#16a34a','--amber':'#ca8a04',
        '--coral':'#ea580c','--crimson':'#dc2626',
      }
    },
    sand: {
      label: 'Warm Sand',
      desc:  'Warm beige background, white cards, amber accents',
      vars: {
        '--bg-0':'#faf8f5','--bg-1':'#ffffff','--bg-2':'#f0ebe3',
        '--surface':'rgba(255,255,255,.92)','--surface-2':'rgba(240,235,227,.88)','--surface-3':'rgba(250,248,245,.97)',
        '--border':'rgba(61,48,41,.12)','--border-strong':'rgba(180,83,9,.30)',
        '--text':'#3d3029','--text-dim':'#6b5344','--muted':'#8b7e6e',
        '--accent':'#b45309','--accent-2':'#9f1239','--gold':'#b45309',
        '--teal':'#0891b2','--emerald':'#15803d','--amber':'#d97706',
        '--coral':'#dc2626','--crimson':'#be123c',
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
