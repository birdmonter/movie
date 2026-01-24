(function() {
    if (window._sniffActive) return;
    window._sniffActive = true;

    var foundUrls = new Set(),
        terminalFont = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
        greenGlow = "#00ff41",
        adRemoverInterval = null;

    // --- 1. STYLES (ผสมผสานความสวยงามและ Scannability) ---
    var style = document.createElement('style');
    style.textContent = `
        #hsc::-webkit-scrollbar{width:4px}
        #hsc::-webkit-scrollbar-thumb{background:#444;border-radius:10px}
        .h-card{margin-bottom:8px;padding:12px;background:#1a1a1a;border-left:3px solid ${greenGlow};border-radius:4px;animation:fadeIn .2s}
        .h-btn{transition:.2s;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:center}
        .h-btn:active{transform:scale(.95);opacity:.7}
        @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
    `;
    document.head.appendChild(style);

    // --- 2. ICON (⚡) ---
    var icon = document.createElement('div');
    icon.id = 'hacker-icon';
    icon.innerHTML = '⚡';
    icon.style.cssText = `all:initial;font-family:${terminalFont};position:fixed;bottom:80px;right:20px;width:55px;height:55px;background:#000;color:${greenGlow};border:2px solid ${greenGlow};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;z-index:2147483647;box-shadow:0 0 15px rgba(0,255,65,0.3);cursor:move;touch-action:none;`;
    document.body.appendChild(icon);

    // --- 3. PANEL & TABS ---
    var panel = document.createElement('div');
    panel.style.cssText = `all:initial;font-family:${terminalFont};position:fixed;bottom:0;left:0;width:100%;height:60%;background:#0a0a0a;color:#eee;z-index:2147483646;display:none;flex-direction:column;border-top:1px solid #333;box-shadow:0 -5px 25px rgba(0,0,0,0.8);`;

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;background:#111;border-bottom:1px solid #333;overflow-x:auto;flex-shrink:0';

    function createTab(name, fn, color) {
        var t = document.createElement('div');
        t.innerText = name;
        t.style.cssText = `padding:15px 20px;font-size:12px;font-weight:bold;color:${color||'#ccc'};border-right:1px solid #222;white-space:nowrap;`;
        t.className = 'h-btn';
        t.onclick = (e) => { e.stopPropagation(); fn(); };
        return t;
    }

    var content = document.getElementById('hsc') || document.createElement('div');
    content.id = 'hsc';
    content.style.cssText = 'flex:1;overflow-y:auto;padding:15px;box-sizing:border-box;display:block;width:100%;';

    // --- 4. CORE FUNCTIONS (รักษา Logic จาก code39.txt ทั้งหมด) ---
    function logUrl(url, type, isSpecial = false) {
        if (!url || url.startsWith('blob:')) return;
        let fUrl = url.replace(/\\u002f/g, '/').replace(/\\/g, '');
        
        [span_1](start_span)// MLIVE & Stream1689 Logic[span_1](end_span)
        if (fUrl.includes('hls.mlive.in.th')) fUrl = fUrl.replace('hls.mlive.in.th', 'hdlf.mlive.in.th');
        if (fUrl.includes('player.stream1689.com/p2p/')) {
            let id = fUrl.split('/p2p/')[1].split('?')[0];
            fUrl = 'https://master.streamhls.com/hls/' + id + '/master.m3u8';
            type = 'CONVERT_S1689';
        }
        if (isSpecial) fUrl = url.replace('webrtc://', 'https://').split('?')[0] + '.m3u8' + (url.split('?')[1] ? '?' + url.split('?')[1] : '');
        
        if (foundUrls.has(fUrl)) return;
        foundUrls.add(fUrl);

        var card = document.createElement('div');
        card.className = 'h-card';
        card.innerHTML = `
            <div style="font-size:10px;color:${greenGlow};opacity:0.7;margin-bottom:4px;">> ACCESS_${type}</div>
            <div style="font-size:12px;word-break:break-all;margin-bottom:10px;color:#fff;">${fUrl}</div>
            <div style="display:flex;gap:8px;">
                <button class="h-btn" style="all:initial;background:#333;color:#eee;padding:8px;flex:1;border-radius:4px;font-size:11px;text-align:center;">COPY</button>
                <button class="h-btn" style="all:initial;background:${greenGlow};color:#000;padding:8px;flex:1;border-radius:4px;font-size:11px;font-weight:bold;text-align:center;">OPEN</button>
            </div>
        `;
        card.querySelectorAll('button')[0].onclick = () => {
            navigator.clipboard.writeText(fUrl);
            alert('คัดลอกแล้ว!');
        };
        card.querySelectorAll('button')[1].onclick = () => window.open(fUrl, '_blank');
        content.prepend(card);
    }

    function scanVid() {
        // วิดีโอทั่วไป
        document.querySelectorAll('video,source,iframe').forEach(el => {
            let s = el.src || el.getAttribute('src');
            if (s && s.startsWith('http')) logUrl(s, el.tagName);
        });
        [span_2](start_span)// TikTok & Scripts[span_2](end_span)
        document.querySelectorAll('script').forEach(sc => {
            const m3 = sc.textContent.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/);
            if (m3) logUrl(m3[1].replace(/\\/g, ''), 'TIKTOK_M3U8');
            const rm = sc.textContent.match(/"roomId":"(\d{5,})"/);
            if (rm) logUrl(rm[1], 'TIKTOK_ROOM');
            const p = sc.textContent.match(/"hls_pull_url":"(.*?)"/);
            if (p) logUrl(p[1], 'TIKTOK_PULL');
        });
    }

    function toggleAds() {
        if (adRemoverInterval) {
            clearInterval(adRemoverInterval);
            adRemoverInterval = null;
            alert('ปิดระบบ Bypass Ads');
        } else {
            adRemoverInterval = setInterval(() => {
                var v = document.querySelector('video');
                if (v) {
                    [span_3](start_span)// กดปุ่มข้าม[span_3](end_span)
                    document.querySelectorAll('[class*="skip"], [id*="skip"], .ytp-ad-skip-button, .atp-ad-skip-button').forEach(b => b.click());
                    // เร่งโฆษณาที่สั้นกว่า 5 นาที
                    if (!v.paused && v.duration < 300) v.currentTime = v.duration;
                }
            }, 500);
            alert('เปิดระบบ Bypass Ads (Auto Skip)');
        }
    }

    function imgScan() {
        var imgs = [...document.images].map(i => i.src).filter(s => s && s.startsWith('http'));
        if (!imgs.length) return;
        var w = window.open('', '_blank');
        w.document.write(`<body style="background:#000;color:${greenGlow};font-family:sans-serif;padding:20px;"><h3>IMAGES (${imgs.length})</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">${imgs.map(s => `<div style="border:1px solid #333;padding:5px;"><img src="${s}" style="width:100%;height:100px;object-fit:cover;"><a href="${s}" download style="color:${greenGlow};display:block;text-align:center;font-size:10px;margin-top:5px;text-decoration:none;">[SAVE]</a></div>`).join('')}</div></body>`);
    }

    function togglePanel() {
        var show = panel.style.display === 'none';
        panel.style.display = show ? 'flex' : 'none';
        icon.style.opacity = show ? '0.4' : '1';
        if (show) scanVid();
    }

    // --- 5. DRAG & NETWORK (รักษาฟังก์ชันดั้งเดิม) ---
    function makeDraggable(el) {
        let sx, sy, moved = false, start;
        function down(e) {
            moved = false; start = Date.now();
            let t = e.touches ? e.touches[0] : e;
            sx = t.clientX - el.offsetLeft; sy = t.clientY - el.offsetTop;
            window.addEventListener(e.touches ? 'touchmove' : 'mousemove', move, {passive: false});
            window.addEventListener(e.touches ? 'touchend' : 'mouseup', up);
        }
        function move(e) {
            let t = e.touches ? e.touches[0] : e;
            let x = t.clientX - sx, y = t.clientY - sy;
            if (Math.abs(x - el.offsetLeft) > 5 || Math.abs(y - el.offsetTop) > 5) {
                moved = true;
                el.style.left = x + 'px'; el.style.top = y + 'px';
                el.style.bottom = el.style.right = 'auto';
            }
            if (moved && e.cancelable) e.preventDefault();
        }
        function up() {
            window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move);
            window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up);
            if (!moved && (Date.now() - start < 300)) togglePanel();
            else if (moved) {
                let mid = innerWidth / 2;
                el.style.transition = 'left .3s';
                el.style.left = (parseInt(el.style.left) < mid) ? '10px' : (innerWidth - 65) + 'px';
                setTimeout(() => el.style.transition = '', 300);
            }
        }
        el.addEventListener('mousedown', down);
        el.addEventListener('touchstart', down, {passive: false});
    }

    [span_4](start_span)// Network Interceptors (code39.txt)[span_4](end_span)
    var oX = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(m, u) {
        if (typeof u === 'string' && (u.includes('.m3u8') || u.includes('.mp4') || u.includes('stream1689'))) logUrl(u, 'XHR');
        return oX.apply(this, arguments);
    };

    var oS = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(b) {
        try {
            let j = JSON.parse(b);
            if (j?.data?.[0]?.str_stream_url) logUrl(j.data[0].str_stream_url, 'QCLOUD', true);
        } catch (e) {}
        return oS.apply(this, arguments);
    };

    window.fetch = (f => function() {
        return f.apply(this, arguments).then(r => {
            if (r.url.match(/\.m3u8|\.mp4/)) logUrl(r.url, 'FETCH');
            return r;
        });
    })(window.fetch);

    // --- 6. ASSEMBLE UI ---
    header.appendChild(createTab('VIDEO', scanVid));
    header.appendChild(createTab('ADS', toggleAds, greenGlow));
    header.appendChild(createTab('IMG', imgScan));
    header.appendChild(createTab('CLEAR', () => { foundUrls.clear(); content.innerHTML = ''; }));
    header.appendChild(createTab('CLOSE', togglePanel, '#ff4444'));

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);
    makeDraggable(icon);

})();
 
