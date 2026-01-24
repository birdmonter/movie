(function() {
    if (window._sniffActive) return;
    window._sniffActive = true;

    var foundUrls = new Set(),
        terminalFont = "'Courier New',monospace",
        greenGlow = "#00ff41",
        greenDark = "#003b00",
        resetCSS = 'all:initial;font-family:' + terminalFont + ';box-sizing:border-box;',
        bgOpacity = 'rgba(0,0,0,0.7)',
        adRemoverInterval = null;

    // --- ส่วนที่ 1: การจัดการ Styles ---
    var style = document.createElement('style');
    style.textContent = '#hsc::-webkit-scrollbar{width:6px;}#hsc::-webkit-scrollbar-thumb{background:' + greenGlow + ';border-radius:10px;} .c-btn:active,.o-btn:active{transform:scale(0.95);} @media(max-width:768px){#h-panel{width:100% !important;left:0 !important;bottom:0 !important;top:auto !important;height:65% !important;border-radius:20px 20px 0 0 !important;border-left:none !important;border-right:none !important;}}';
    document.head.appendChild(style);

    // --- ส่วนที่ 2: สร้าง Icon และ Panel ---
    var icon = document.createElement('div');
    icon.id = 'hacker-icon';
    icon.innerHTML = '⚡';
    icon.style.cssText = resetCSS + 'position:fixed;bottom:20px;right:20px;width:60px;height:60px;background:#000;color:' + greenGlow + ';border:2px solid ' + greenGlow + ';border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;z-index:2147483647;box-shadow:0 0 20px ' + greenDark + ';cursor:move;touch-action:none;user-select:none;';
    document.body.appendChild(icon);

    var panel = document.createElement('div');
    panel.id = 'h-panel';
    panel.style.cssText = resetCSS + 'position:fixed;top:50px;right:50px;width:400px;height:550px;background:' + bgOpacity + ';color:' + greenGlow + ';z-index:2147483646;display:none;flex-direction:column;border:2px solid ' + greenGlow + ';border-radius:12px;box-shadow:0 0 30px rgba(0,0,0,0.5);backdrop-filter:blur(10px);overflow:hidden;';

    var toolbar = document.createElement('div');
    toolbar.style.cssText = resetCSS + 'background:' + greenDark + ';padding:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ' + greenGlow + ';cursor:move;user-select:none;';
    toolbar.innerHTML = '<div style="display:flex;flex-direction:column;"><span style="font-weight:bold;color:#fff;font-size:14px;text-shadow:0 0 5px ' + greenGlow + ';">ROOT@TERMINAL</span><span style="font-size:8px;color:' + greenGlow + ';opacity:0.7;">MODE: COMPLETE | STATUS: ACTIVE</span></div>';

    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:5px;';

    function createBtn(txt, fn, pri) {
        var b = document.createElement('button');
        b.innerText = txt;
        b.style.cssText = resetCSS + 'background:' + (pri ? greenGlow : 'rgba(0,0,0,0.5)') + ';color:' + (pri ? '#000' : greenGlow) + ';border:1px solid ' + greenGlow + ';padding:6px 10px;cursor:pointer;font-size:10px;font-weight:bold;border-radius:4px;';
        b.onclick = fn;
        return b;
    }

    var content = document.createElement('div');
    content.id = 'hsc';
    content.style.cssText = resetCSS + 'flex:1;overflow-y:auto;padding:12px;display:block;width:100%;';
    panel.appendChild(toolbar);
    panel.appendChild(content);
    document.body.appendChild(panel);

    // --- ส่วนที่ 3: ระบบ Bypass Ads (ฟังก์ชันใหม่) ---
    function toggleAdsBypass() {
        if (adRemoverInterval) {
            clearInterval(adRemoverInterval);
            adRemoverInterval = null;
            alert("BYPASS ADS: OFF");
        } else {
            alert("BYPASS ADS: ON");
            adRemoverInterval = setInterval(function() {
                var v = document.querySelector('video');
                if (v) {
                    var skipBtn = document.querySelectorAll('[class*="skip"], [id*="skip"], .ytp-ad-skip-button, .atp-ad-skip-button');
                    skipBtn.forEach(b => b.click());
                    if (!v.paused && v.duration < 300) v.currentTime = v.duration;
                }
            }, 500);
        }
    }

    // --- ส่วนที่ 4: Core Logic (ดึงมาจากโค้ดเดิมของคุณทั้งหมด) ---
    function logUrl(url, type, isSpecial = false) {
        if (!url || url.startsWith('blob:')) return;
        let fUrl = url.replace(/\\u002f/g, '/').replace(/\\/g, '');
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
        card.style.cssText = resetCSS + 'margin-bottom:12px;padding:12px;background:rgba(0,59,0,0.15);border:1px solid ' + greenDark + ';width:100%;display:block;border-left:3px solid ' + greenGlow + ';border-radius:4px;';
        card.innerHTML = '<div style="font-size:9px;color:' + greenGlow + ';opacity:0.6;margin-bottom:4px;">> ACCESS_' + type + '</div><div style="font-size:11px;word-break:break-all;margin-bottom:10px;color:#fff;border-left:2px solid ' + greenGlow + ';padding-left:8px;">' + fUrl + '</div><div style="display:flex;gap:8px;"><button class="c-btn" style="' + resetCSS + 'background:rgba(0,0,0,0.5);color:' + greenGlow + ';border:1px solid ' + greenGlow + ';padding:6px;flex:1;cursor:pointer;font-size:10px;border-radius:4px;">COPY</button><button class="o-btn" style="' + resetCSS + 'background:' + greenGlow + ';color:#000;padding:6px;flex:1;cursor:pointer;font-size:10px;border-radius:4px;font-weight:bold;">OPEN</button></div>';
        
        card.querySelector('.c-btn').onclick = () => {
            navigator.clipboard.writeText(fUrl);
            card.querySelector('.c-btn').innerText = 'DONE';
            setTimeout(() => card.querySelector('.c-btn').innerText = 'COPY', 1000);
        };
        card.querySelector('.o-btn').onclick = () => window.open(fUrl, '_blank');
        content.insertBefore(card, content.firstChild);
    }

    function scanVid() {
        document.querySelectorAll('video,source,iframe').forEach(el => {
            let s = el.src || el.getAttribute('src');
            if (s && s.startsWith('http')) logUrl(s, el.tagName);
        });
        document.querySelectorAll('script').forEach(sc => {
            const m3 = sc.textContent.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/);
            if (m3) logUrl(m3[1].replace(/\\/g, ''), 'TIKTOK_M3U8');
            const rm = sc.textContent.match(/"roomId":"(\d{5,})"/);
            if (rm) logUrl(rm[1], 'TIKTOK_ROOM');
            const p = sc.textContent.match(/"hls_pull_url":"(.*?)"/);
            if (p) logUrl(p[1], 'TIKTOK_PULL');
        });
    }

    function imgScan() {
        var imgs = Array.from(document.getElementsByTagName('img')).map(i => i.src).filter(s => s && s.startsWith('http'));
        if (!imgs.length) return;
        var w = window.open('', '_blank');
        w.document.write('<body style="background:#000;color:' + greenGlow + ';font-family:' + terminalFont + ';padding:20px;"><h3>IMAGES: ' + imgs.length + '</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">' + imgs.map(s => '<div style="border:1px solid ' + greenDark + ';padding:5px;"><img src="' + s + '" style="width:100%;height:100px;object-fit:cover;"><a href="' + s + '" download style="color:' + greenGlow + ';display:block;text-align:center;font-size:10px;margin-top:5px;text-decoration:none;">[SAVE]</a></div>').join('') + '</div></body>');
    }

    function togglePanel() {
        var s = panel.style.display === 'none';
        panel.style.display = s ? 'flex' : 'none';
        icon.style.opacity = s ? '0.3' : '1';
        if (s) scanVid();
    }

    // --- ส่วนที่ 5: การลาก (Drag) ---
    function dragSetup(el, ha) {
        var x = 0, y = 0, x1 = 0, y1 = 0, stX, stY, active = false;
        ha.onmousedown = dStart; ha.ontouchstart = dStart;
        function dStart(e) {
            active = true;
            let t = e.type === "touchstart" ? e.touches[0] : e;
            stX = t.clientX; stY = t.clientY; x1 = t.clientX; y1 = t.clientY;
            document.onmousemove = dMove; document.ontouchmove = dMove;
            document.onmouseup = dEnd; document.ontouchend = dEnd;
        }
        function dMove(e) {
            if (!active) return;
            let t = e.type === "touchmove" ? e.touches[0] : e;
            x = x1 - t.clientX; y = y1 - t.clientY; x1 = t.clientX; y1 = t.clientY;
            el.style.top = (el.offsetTop - y) + "px"; el.style.left = (el.offsetLeft - x) + "px";
            el.style.bottom = 'auto'; el.style.right = 'auto';
        }
        function dEnd(e) {
            active = false; document.onmousemove = null; document.ontouchmove = null;
            let t = e.type === "touchend" ? e.changedTouches[0] : e;
            if (Math.hypot(t.clientX - stX, t.clientY - stY) < 5 && el === icon) togglePanel();
        }
    }

    // --- ส่วนที่ 6: ดักจับ Network ---
    var oXOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(m, u) {
        if (typeof u === 'string' && (u.includes('.m3u8') || u.includes('.mp4') || u.includes('stream1689'))) logUrl(u, 'XHR');
        return oXOpen.apply(this, arguments);
    };

    var oXSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(b) {
        try {
            let j = JSON.parse(b);
            if (j?.data?.[0]?.str_stream_url) logUrl(j.data[0].str_stream_url, 'QCLOUD', true);
        } catch (e) {}
        return oXSend.apply(this, arguments);
    };

    var oFetch = window.fetch;
    window.fetch = function() {
        return oFetch.apply(this, arguments).then(r => {
            if (r.url.match(/\.m3u8|\.mp4/)) logUrl(r.url, 'FETCH');
            return r;
        });
    };

    // --- ปุ่มต่างๆ (ครบทุกปุ่มตามไฟล์เดิม) ---
    controls.appendChild(createBtn('ADS', toggleAdsBypass)); // ปุ่มใหม่
    controls.appendChild(createBtn('VID', scanVid));
    controls.appendChild(createBtn('IMG', imgScan));
    controls.appendChild(createBtn('CLR', () => { foundUrls.clear(); content.innerHTML = ''; }));
    controls.appendChild(createBtn('EXIT', togglePanel, true));
    
    toolbar.appendChild(controls);
    dragSetup(panel, toolbar);
    dragSetup(icon, icon);
})();
 
