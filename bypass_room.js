(function () {
  if (window.__HLSNIFFER__) return;
  window.__HLSNIFFER__ = true;

  /* ===== CONFIG ===== */
  const state = {
    found: new Set(),
    adInterval: null
  };

  const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  const GREEN = "#00ff41";
  const Z1 = 2147483647;
  const Z2 = 2147483646;

  /* ===== STYLE ===== */
  const style = document.createElement("style");
  style.textContent = `
    #hsc::-webkit-scrollbar{width:4px}
    #hsc::-webkit-scrollbar-thumb{background:#444;border-radius:10px}
    .h-card{margin-bottom:8px;padding:10px;background:#1e1e1e;border:1px solid #333;border-radius:6px;animation:fadeIn .2s}
    .h-btn{transition:.2s;cursor:pointer;user-select:none}
    .h-btn:active{transform:scale(.95);opacity:.7}
    @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1}}
  `;
  document.head.appendChild(style);

  /* ===== ICON ===== */
  const icon = document.createElement("div");
  icon.innerHTML = "⚡";
  icon.style.cssText = `
    all:initial;font-family:${FONT};
    position:fixed;bottom:80px;right:20px;
    width:55px;height:55px;
    background:#222;color:${GREEN};
    border:2px solid ${GREEN};
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:24px;z-index:${Z1};
    box-shadow:0 4px 15px rgba(0,0,0,.5);
    cursor:move;touch-action:none;
  `;
  document.body.appendChild(icon);

  /* ===== PANEL ===== */
  const panel = document.createElement("div");
  panel.style.cssText = `
    all:initial;font-family:${FONT};
    position:fixed;bottom:0;left:0;
    width:100%;height:60%;
    background:#0a0a0a;color:#eee;
    z-index:${Z2};
    display:none;flex-direction:column;
    border-top:1px solid #333;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display:flex;background:#1a1a1a;
    border-bottom:1px solid #333;
    overflow-x:auto;flex-shrink:0
  `;

  const content = document.createElement("div");
  content.id = "hsc";
  content.style.cssText = "flex:1;overflow-y:auto;padding:15px;box-sizing:border-box";

  /* ===== HELPERS ===== */
  function createTab(name, fn, color = "#ccc") {
    const t = document.createElement("div");
    t.innerText = name;
    t.style.cssText = `
      padding:14px 18px;font-size:12px;
      font-weight:bold;cursor:pointer;
      color:${color};border-right:1px solid #333;
      white-space:nowrap
    `;
    t.className = "h-btn";
    t.onclick = e => { e.stopPropagation(); fn(); };
    return t;
  }

  function toast(msg) {
    const d = document.createElement("div");
    d.textContent = msg;
    d.style.cssText = `
      position:fixed;bottom:140px;right:20px;
      background:#111;color:${GREEN};
      padding:8px 12px;border-radius:6px;
      font-size:12px;z-index:${Z1};
      border:1px solid ${GREEN};
    `;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1200);
  }

  /* ===== CORE ===== */
  function normalizeUrl(url) {
    let f = url.replace(/\\u002f/g, "/").replace(/\\/g, "");
    if (f.includes("hls.mlive")) f = f.replace("hls.mlive", "hdlf.mlive");
    if (f.includes("player.stream1689.com/p2p/")) {
      f = "https://master.streamhls.com/hls/" +
        f.split("/p2p/")[1].split("?")[0] +
        "/master.m3u8";
    }
    return f;
  }

  function logUrl(url, type = "AUTO", force = false) {
    if (!url || url.startsWith("blob:")) return;

    let finalUrl = force
      ? url.replace("webrtc://", "https://").split("?")[0] + ".m3u8"
      : normalizeUrl(url);

    if (state.found.has(finalUrl)) return;
    state.found.add(finalUrl);

    const card = document.createElement("div");
    card.className = "h-card";
    card.innerHTML = `
      <div style="font-size:10px;color:${GREEN};margin-bottom:5px">[${type}]</div>
      <div style="font-size:12px;word-break:break-all;margin-bottom:8px">${finalUrl}</div>
      <div style="display:flex;gap:10px">
        <button class="h-btn" style="all:initial;font-family:inherit;background:#333;color:#eee;padding:8px;flex:1;border-radius:4px;font-size:11px">COPY</button>
        <button class="h-btn" style="all:initial;font-family:inherit;background:${GREEN};color:#000;padding:8px;flex:1;border-radius:4px;font-size:11px;font-weight:bold">OPEN</button>
      </div>
    `;

    const [copyBtn, openBtn] = card.querySelectorAll("button");
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(finalUrl);
      toast("คัดลอกแล้ว");
    };
    openBtn.onclick = () => window.open(finalUrl, "_blank");

    content.prepend(card);
  }

  function scanVid() {
    document.querySelectorAll("video,source,iframe").forEach(e => {
      const s = e.src || e.getAttribute("src");
      if (s && s.startsWith("http")) logUrl(s, e.tagName);
    });

    document.querySelectorAll("script").forEach(sc => {
      const m = sc.textContent.match(/(https?:\\?\/\\?\/[^"'\\ ]+\.m3u8[^"'\\ ]*)/);
      if (m) logUrl(m[1], "JS_M3U8");

      const p = sc.textContent.match(/"hls_pull_url"\s*:\s*"(.*?)"/);
      if (p) logUrl(p[1], "TIKTOK_LIVE");
    });
  }

  function toggleAds() {
    if (state.adInterval) {
      clearInterval(state.adInterval);
      state.adInterval = null;
      toast("ปิด Bypass Ads");
      return;
    }

    state.adInterval = setInterval(() => {
      const v = document.querySelector("video");
      if (!v || isNaN(v.duration)) return;
      document.querySelectorAll('[class*="skip"],.ytp-ad-skip-button')
        .forEach(b => b.click());
      if (v.duration < 300) v.currentTime = v.duration;
    }, 500);

    toast("เปิด Bypass Ads");
  }

  function togglePanel() {
    const show = panel.style.display === "none";
    panel.style.display = show ? "flex" : "none";
    icon.style.opacity = show ? "0.4" : "1";
    if (show) scanVid();
  }

  /* ===== NETWORK HOOK ===== */
  const XHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    if (typeof u === "string" && /\.(m3u8|mp4)/.test(u)) {
      logUrl(u, "XHR");
    }
    return XHROpen.apply(this, arguments);
  };

  const XHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (b) {
    try {
      if (typeof b === "string" && b.trim().startsWith("{")) {
        const j = JSON.parse(b);
        if (j?.data?.[0]?.str_stream_url) {
          logUrl(j.data[0].str_stream_url, "QCLOUD", true);
        }
      }
    } catch {}
    return XHRSend.apply(this, arguments);
  };

  window.fetch = (f => function () {
    return f.apply(this, arguments).then(r => {
      if (r.url && /\.(m3u8|mp4)/.test(r.url)) {
        logUrl(r.url, "FETCH");
      }
      return r;
    });
  })(window.fetch);

  /* ===== IMAGE TAB ===== */
  function openImages() {
    const imgs = [...document.images]
      .map(i => i.src)
      .filter(s => s.startsWith("http"));

    const w = window.open("", "_blank");
    w.document.write(`
      <body style="background:#000;color:${GREEN};font-family:sans-serif;padding:20px">
        <h2>IMAGES (${imgs.length})</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
          ${imgs.map(s => `
            <div style="border:1px solid #333;padding:5px">
              <img src="${s}" style="width:100%;height:100px;object-fit:cover">
              <a href="${s}" download style="color:#fff;font-size:12px;display:block;text-align:center">Save</a>
            </div>
          `).join("")}
        </div>
      </body>
    `);
  }

  /* ===== UI ===== */
  header.append(
    createTab("VIDEO", scanVid),
    createTab("ADS", toggleAds, GREEN),
    createTab("IMG", openImages),
    createTab("CLEAR", () => { state.found.clear(); content.innerHTML = ""; }),
    createTab("CLOSE", togglePanel, "#ff4444")
  );

  panel.append(header, content);
  document.body.appendChild(panel);

  /* ===== DRAG ===== */
  (function makeDraggable(el) {
    let sx, sy, moved = false, start;
    function down(e) {
      moved = false; start = Date.now();
      const t = e.touches ? e.touches[0] : e;
      sx = t.clientX - el.offsetLeft;
      sy = t.clientY - el.offsetTop;
      window.addEventListener(e.touches ? "touchmove" : "mousemove", move, { passive: false });
      window.addEventListener(e.touches ? "touchend" : "mouseup", up);
    }
    function move(e) {
      const t = e.touches ? e.touches[0] : e;
      const x = t.clientX - sx;
      const y = t.clientY - sy;
      if (Math.abs(x - el.offsetLeft) > 5 || Math.abs(y - el.offsetTop) > 5) {
        moved = true;
        el.style.left = x + "px";
        el.style.top = y + "px";
        el.style.bottom = "auto";
        el.style.right = "auto";
      }
      if (moved && e.cancelable) e.preventDefault();
    }
    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
      if (!moved && Date.now() - start < 300) togglePanel();
    }
    el.addEventListener("mousedown", down);
    el.addEventListener("touchstart", down, { passive: false });
  })(icon);

})();
 
