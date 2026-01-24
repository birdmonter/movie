(function(){
  if(window.Sniffer && Sniffer.active) return;

  window.Sniffer = {
    active: true,
    found: new Set(),
    green: '#00ff41',
    font: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    adTimer: null
  };

  /* ---------- STYLE ---------- */
  const style = document.createElement('style');
  style.textContent = `
    #hsc::-webkit-scrollbar{width:4px}
    #hsc::-webkit-scrollbar-thumb{background:#444;border-radius:10px}
    .h-card{margin-bottom:8px;padding:10px;background:#1e1e1e;border:1px solid #333;border-radius:6px;animation:fadeIn .2s}
    .h-btn{cursor:pointer;user-select:none;transition:.2s}
    .h-btn:active{transform:scale(.95);opacity:.7}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1}}
  `;
  document.head.appendChild(style);

  /* ---------- ICON ---------- */
  const icon = document.createElement('div');
  icon.textContent = '⚡';
  icon.style.cssText = `
    all:initial;
    font-family:${Sniffer.font};
    position:fixed;
    bottom:80px;
    right:20px;
    width:55px;
    height:55px;
    background:#222;
    color:${Sniffer.green};
    border:2px solid ${Sniffer.green};
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:24px;
    z-index:2147483647;
    box-shadow:0 4px 15px rgba(0,0,0,.5);
    cursor:move;
    touch-action:none;
  `;
  document.body.appendChild(icon);

  /* ---------- PANEL ---------- */
  const panel = document.createElement('div');
  panel.style.cssText = `
    all:initial;
    font-family:${Sniffer.font};
    position:fixed;
    bottom:0;
    left:0;
    width:100%;
    height:60%;
    background:#0a0a0a;
    color:#eee;
    z-index:2147483646;
    display:none;
    flex-direction:column;
    border-top:1px solid #333;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;background:#1a1a1a;border-bottom:1px solid #333';

  const content = document.createElement('div');
  content.id = 'hsc';
  content.style.cssText = 'flex:1;overflow-y:auto;padding:15px';

  function tab(name, fn, color='#ccc'){
    const t = document.createElement('div');
    t.textContent = name;
    t.className = 'h-btn';
    t.style.cssText = `
      padding:14px 18px;
      font-size:12px;
      font-weight:bold;
      color:${color};
      border-right:1px solid #333;
    `;
    t.onclick = e => { e.stopPropagation(); fn(); };
    return t;
  }

  /* ---------- CORE ---------- */
  Sniffer.log = function(url,type,special){
    if(!url || url.startsWith('blob:')) return;
    let f = url.replace(/\\u002f/g,'/').replace(/\\/g,'');

    if(f.includes('hls.mlive')) f = f.replace('hls.mlive','hdlf.mlive');

    if(f.includes('player.stream1689.com/p2p/')){
      f = 'https://master.streamhls.com/hls/' +
          f.split('/p2p/')[1].split('?')[0] + '/master.m3u8';
      type = 'S1689_CONV';
    }

    if(special){
      f = url.replace('webrtc://','https://').split('?')[0] + '.m3u8';
    }

    if(Sniffer.found.has(f)) return;
    Sniffer.found.add(f);

    const c = document.createElement('div');
    c.className = 'h-card';
    c.innerHTML = `
      <div style="font-size:10px;color:${Sniffer.green}">[${type}]</div>
      <div style="font-size:12px;word-break:break-all">${f}</div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="h-btn" style="flex:1">COPY</button>
        <button class="h-btn" style="flex:1;background:${Sniffer.green};color:#000">OPEN</button>
      </div>
    `;
    c.querySelectorAll('button')[0].onclick = () => navigator.clipboard.writeText(f);
    c.querySelectorAll('button')[1].onclick = () => window.open(f,'_blank');
    content.prepend(c);
  };

  Sniffer.scan = function(){
    document.querySelectorAll('video,source,iframe').forEach(e=>{
      const s = e.src || e.getAttribute('src');
      if(s && s.startsWith('http')) Sniffer.log(s,e.tagName);
    });
  };

  Sniffer.togglePanel = function(){
    const show = panel.style.display === 'none';
    panel.style.display = show ? 'flex' : 'none';
    if(show) Sniffer.scan();
  };

  /* ---------- NETWORK HOOK ---------- */
  const xo = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(m,u){
    if(typeof u === 'string' && u.match(/\.m3u8|\.mp4/))
      Sniffer.log(u,'XHR');
    return xo.apply(this,arguments);
  };

  const fo = window.fetch;
  window.fetch = function(){
    return fo.apply(this,arguments).then(r=>{
      if(r.url.match(/\.m3u8|\.mp4/))
        Sniffer.log(r.url,'FETCH');
      return r;
    });
  };

  /* ---------- UI ---------- */
  header.append(
    tab('VIDEO',Sniffer.scan),
    tab('CLEAR',()=>{Sniffer.found.clear();content.innerHTML=''}),
    tab('CLOSE',Sniffer.togglePanel,'#ff4444')
  );

  panel.append(header,content);
  document.body.appendChild(panel);
  icon.onclick = Sniffer.togglePanel;
})();

