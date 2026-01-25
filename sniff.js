(function() {
  // ป้องกันการรันซ้ำ
  if (window._sniffActive) return;
  window._sniffActive = true;

  // ตัวแปรหลัก
  const foundUrls = new Set();
  const terminalFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const greenGlow = "#00ff41";
  let adRemoverInterval = null;

  // ===============================
  // STYLE
  // ===============================
  const style = document.createElement('style');
  style.textContent = `
    #hsc::-webkit-scrollbar { width: 4px; }
    #hsc::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
    .h-card {
      margin-bottom: 8px;
      padding: 10px;
      background: #1e1e1e;
      border: 1px solid #333;
      border-radius: 6px;
      animation: fadeIn 0.2s;
    }
    .h-btn {
      transition: all 0.2s;
      cursor: pointer;
      user-select: none;
    }
    .h-btn:hover { opacity: 0.8; }
    .h-btn:active { transform: scale(0.95); opacity: 0.7; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // ===============================
  // FLOATING ICON
  // ===============================
  const icon = document.createElement('div');
  icon.innerHTML = '⚡';
  icon.style.cssText = `
    all: initial;
    font-family: ${terminalFont};
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 55px;
    height: 55px;
    background: #222;
    color: ${greenGlow};
    border: 2px solid ${greenGlow};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    z-index: 2147483647;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
    cursor: pointer;
    touch-action: none;
  `;
  document.body.appendChild(icon);

  // ===============================
  // PANEL
  // ===============================
  const panel = document.createElement('div');
  panel.style.cssText = `
    all: initial;
    font-family: ${terminalFont};
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    background: #0a0a0a;
    color: #eee;
    z-index: 2147483646;
    display: none;
    flex-direction: column;
    border-top: 1px solid #333;
  `;

  // Header Tabs
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    background: #1a1a1a;
    border-bottom: 1px solid #333;
    overflow-x: auto;
    flex-shrink: 0;
  `;

  function createTab(name, fn, color = '#ccc') {
    const t = document.createElement('div');
    t.innerText = name;
    t.style.cssText = `
      padding: 14px 18px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      color: ${color};
      border-right: 1px solid #333;
      white-space: nowrap;
    `;
    t.className = 'h-btn';
    t.onclick = e => { e.stopPropagation(); fn(); };
    return t;
  }

  // Content Area
  const content = document.createElement('div');
  content.id = 'hsc';
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    box-sizing: border-box;
  `;

  // ===============================
  // CORE FUNCTIONS
  // ===============================
  
  // แปลง URL ให้ถูกต้อง
  function normalizeUrl(url, type, isWebRTC = false) {
    if (!url || url.startsWith('blob:')) return null;
    
    let fixed = url.replace(/\\u002f/g, '/').replace(/\\/g, '');
    
    // MLive fix
    if (fixed.includes('hls.mlive')) {
      fixed = fixed.replace('hls.mlive', 'hdlf.mlive');
    }
    
    // Stream1689 converter
    if (fixed.includes('player.stream1689.com/p2p/')) {
      const id = fixed.split('/p2p/')[1].split('?')[0];
      fixed = `https://master.streamhls.com/hls/${id}/master.m3u8`;
      type = 'S1689_CONV';
    }
    
    // WebRTC to HLS
    if (isWebRTC && url.startsWith('webrtc://')) {
      const base = url.replace('webrtc://', 'https://').split('?')[0];
      const params = url.includes('?') ? '?' + url.split('?')[1] : '';
      fixed = base + '.m3u8' + params;
    }
    
    return { url: fixed, type };
  }

  // บันทึก URL ที่พบ
  function logUrl(url, type, isWebRTC = false) {
    const normalized = normalizeUrl(url, type, isWebRTC);
    if (!normalized || foundUrls.has(normalized.url)) return;
    
    foundUrls.add(normalized.url);
    
    const card = document.createElement('div');
    card.className = 'h-card';
    
    const typeLabel = document.createElement('div');
    typeLabel.style.cssText = `font-size: 10px; color: ${greenGlow}; margin-bottom: 5px;`;
    typeLabel.textContent = `[${normalized.type}]`;
    
    const urlText = document.createElement('div');
    urlText.style.cssText = 'font-size: 12px; word-break: break-all; margin-bottom: 8px;';
    urlText.textContent = normalized.url;
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display: flex; gap: 10px;';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'h-btn';
    copyBtn.textContent = 'COPY';
    copyBtn.style.cssText = `
      all: initial;
      font-family: inherit;
      background: #333;
      color: #eee;
      padding: 8px;
      flex: 1;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      text-align: center;
    `;
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(normalized.url);
      copyBtn.textContent = '✓ COPIED';
      setTimeout(() => copyBtn.textContent = 'COPY', 1500);
    };
    
    const openBtn = document.createElement('button');
    openBtn.className = 'h-btn';
    openBtn.textContent = 'OPEN';
    openBtn.style.cssText = `
      all: initial;
      font-family: inherit;
      background: ${greenGlow};
      color: #000;
      padding: 8px;
      flex: 1;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      text-align: center;
    `;
    openBtn.onclick = () => window.open(normalized.url, '_blank');
    
    btnContainer.appendChild(copyBtn);
    btnContainer.appendChild(openBtn);
    
    card.appendChild(typeLabel);
    card.appendChild(urlText);
    card.appendChild(btnContainer);
    
    content.prepend(card);
  }

  // สแกนหา Video URLs
  function scanVideo() {
    // สแกน video/source/iframe tags
    document.querySelectorAll('video, source, iframe').forEach(el => {
      const src = el.src || el.getAttribute('src');
      if (src && src.startsWith('http')) {
        logUrl(src, el.tagName);
      }
    });
    
    // สแกน scripts สำหรับ M3U8
    document.querySelectorAll('script').forEach(script => {
      const text = script.textContent;
      
      // M3U8 URLs
      const m3u8Match = text.match(/(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
      if (m3u8Match) logUrl(m3u8Match[1], 'JS_M3U8');
      
      // TikTok Room ID
      const roomMatch = text.match(/"roomId":"(\d{5,})"/);
      if (roomMatch) logUrl(roomMatch[1], 'TIKTOK_ROOM');
      
      // TikTok Live HLS
      const hlsMatch = text.match(/"hls_pull_url":"(.*?)"/);
      if (hlsMatch) logUrl(hlsMatch[1], 'TIKTOK_LIVE');
    });
    
    if (foundUrls.size === 0) {
      content.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">ไม่พบ Video URL<br>ลองเล่นวิดีโอก่อน แล้วกด SCAN อีกครั้ง</div>';
    }
  }

  // Bypass โฆษณา
  function toggleAds() {
    if (adRemoverInterval) {
      clearInterval(adRemoverInterval);
      adRemoverInterval = null;
      alert('ปิดระบบ Bypass Ads');
    } else {
      adRemoverInterval = setInterval(() => {
        const video = document.querySelector('video');
        if (video) {
          // คลิกปุ่ม Skip
          document.querySelectorAll('[class*="skip"], .ytp-ad-skip-button').forEach(btn => btn.click());
          
          // ข้ามโฆษณาสั้น
          if (video.duration < 300) {
            video.currentTime = video.duration;
          }
        }
      }, 500);
      alert('เปิดระบบ Bypass Ads');
    }
  }

  // เปิด/ปิด Panel
  function togglePanel() {
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'flex' : 'none';
    icon.style.opacity = isHidden ? '0.4' : '1';
    if (isHidden) scanVideo();
  }

  // แสดงรูปภาพทั้งหมด
  function openImages() {
    const imgs = [...document.images]
      .map(i => i.src)
      .filter(s => s.startsWith('http'));
    
    const w = window.open('', '_blank');
    w.document.write(`
      <body style="background:#000; color:${greenGlow}; font-family:sans-serif; padding:20px;">
        <h2>IMAGES (${imgs.length})</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:10px;">
          ${imgs.map(src => `
            <div style="border:1px solid #333; padding:5px;">
              <img src="${src}" style="width:100%; height:auto; object-fit:cover;">
              <a href="${src}" download style="color:#fff; font-size:12px; display:block; text-align:center;">Save</a>
            </div>
          `).join('')}
        </div>
      </body>
    `);
  }

  // ===============================
  // NETWORK INTERCEPT (ปรับปรุง)
  // ===============================
  
  // XMLHttpRequest intercept
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && (url.includes('.m3u8') || url.includes('.mp4'))) {
      logUrl(url, 'XHR');
    }
    return originalXHROpen.apply(this, arguments);
  };

  const originalXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(body) {
    try {
      const data = JSON.parse(body);
      if (data?.data?.[0]?.str_stream_url) {
        logUrl(data.data[0].str_stream_url, 'QCLOUD', true);
      }
    } catch(e) {}
    return originalXHRSend.apply(this, arguments);
  };

  // Fetch intercept
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).then(response => {
      if (response.url && response.url.match(/\.m3u8|\.mp4/)) {
        logUrl(response.url, 'FETCH');
      }
      return response;
    });
  };

  // ===============================
  // UI ASSEMBLY
  // ===============================
  header.appendChild(createTab('🔍 SCAN', scanVideo));
  header.appendChild(createTab('🚫 ADS', toggleAds, greenGlow));
  header.appendChild(createTab('🖼️ IMG', openImages));
  header.appendChild(createTab('🗑️ CLEAR', () => {
    foundUrls.clear();
    content.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">ล้างข้อมูลแล้ว</div>';
  }));
  header.appendChild(createTab('✕ CLOSE', togglePanel, '#ff4444'));

  panel.appendChild(header);
  panel.appendChild(content);
  document.body.appendChild(panel);

  // ===============================
  // DRAGGABLE ICON
  // ===============================
  function makeDraggable(el) {
    let startX = 0, startY = 0, offsetX = 0, offsetY = 0;
    let hasMoved = false, startTime = 0;

    el.addEventListener('pointerdown', e => {
      hasMoved = false;
      startTime = Date.now();
      el.setPointerCapture(e.pointerId);
      
      const rect = el.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      offsetX = rect.left;
      offsetY = rect.top;
    });

    el.addEventListener('pointermove', e => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        hasMoved = true;
        el.style.left = (offsetX + dx) + 'px';
        el.style.top = (offsetY + dy) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
      }
    });

    el.addEventListener('pointerup', e => {
      el.releasePointerCapture(e.pointerId);
      
      // ถ้าไม่ได้ลาก และคลิกเร็ว = เปิด panel
      if (!hasMoved && Date.now() - startTime < 300) {
        togglePanel();
        return;
      }
      
      // Snap to edge
      const midpoint = window.innerWidth / 2;
      const currentX = parseInt(el.style.left) || offsetX;
      
      el.style.transition = 'left 0.25s ease-out';
      el.style.left = (currentX < midpoint) ? '10px' : (window.innerWidth - 65) + 'px';
      
      setTimeout(() => el.style.transition = '', 300);
    });
  }

  makeDraggable(icon);

  // ===============================
  // CLEANUP
  // ===============================
  window.addEventListener('beforeunload', () => {
    if (adRemoverInterval) clearInterval(adRemoverInterval);
  });

  console.log('%c⚡ Video Sniffer Active', `color: ${greenGlow}; font-size: 16px; font-weight: bold;`);
})();
