<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NT Super Notify v3</title>
    <style>
        /* --- 設定：ここでサイズや色を自由に変更 --- */
        :root {
            --main-font-size: 28px;
            --sub-font-size: 20px;
            --bg-color: #f8f9fa;
            --accent-color: #007bff;
        }

        body { font-size: var(--main-font-size); padding: 20px; font-family: 'Segoe UI', sans-serif; background: var(--bg-color); line-height: 1.4; }
        .container { max-width: 600px; margin: 0 auto; }
        
        label { display: block; margin-top: 15px; font-weight: bold; border-left: 5px solid var(--accent-color); padding-left: 10px; }
        input, textarea { width: 100%; font-size: var(--main-font-size); margin-bottom: 10px; border: 2px solid #ddd; border-radius: 8px; padding: 10px; box-sizing: border-box; }
        
        /* タブ切り替え */
        .tabs { display: flex; gap: 5px; margin-bottom: 15px; }
        .tab { flex: 1; text-align: center; padding: 10px; background: #ddd; cursor: pointer; border-radius: 8px 8px 0 0; font-size: var(--sub-font-size); }
        .tab.active { background: var(--accent-color); color: white; }
        
        .content { display: none; background: white; padding: 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .content.active { display: block; }

        button { width: 100%; padding: 15px; font-size: var(--main-font-size); border: none; border-radius: 8px; cursor: pointer; transition: 0.3s; margin-top: 10px; }
        .btn-set { background: var(--accent-color); color: white; }
        .btn-clear { background: #6c757d; color: white; margin-top: 20px; font-size: var(--sub-font-size); }
        
        #list { margin-top: 20px; }
        .item { font-size: var(--sub-font-size); padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; }
        .status-ready { color: var(--accent-color); }
        .status-done { color: #28a745; text-decoration: line-through; }
    </style>
</head>
<body>

<div class="container">
    <div class="tabs">
        <div id="t1" class="tab active" onclick="tab('normal')">通常予約</div>
        <div id="t2" class="tab" onclick="tab('burst')">連射モード</div>
    </div>

    <div id="normal" class="content active">
        <label>件名</label>
        <input type="text" id="title" placeholder="通知タイトル">
        <label>内容</label>
        <textarea id="task" rows="3" placeholder="通知本文（改行OK）"></textarea>
        <label>通知日時（秒まで指定）</label>
        <input type="datetime-local" id="alarmTime" step="1">
        <button class="btn-set" onclick="reserve()">予約を実行する</button>
    </div>

    <div id="burst" class="content">
        <label>件名</label>
        <input type="text" id="bTitle" placeholder="連射タイトル">
        <label>間隔（秒）</label>
        <input type="number" id="interval" value="3">
        <label>回数</label>
        <input type="number" id="count" value="5">
        <button class="btn-set" style="background: #dc3545;" onclick="burst()">連射スタート</button>
    </div>

    <button class="btn-clear" onclick="clearList()">履歴を全消去</button>
    <div id="list"></div>
</div>

<script>
    // --- 裏側の設定 ---
    const CLICK_URL = 'https://ntv142.github.io/POPv2/';
    const ICON = 'https://ntv142.github.io/NT-HP/favicon.ico';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js?url=' + encodeURIComponent(CLICK_URL));
    }

    function tab(name) {
        document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(name).classList.add('active');
        event.currentTarget.classList.add('active');
    }

    async function sendNotify(t, b) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(t, {
            body: b,
            icon: ICON,
            requireInteraction: true,
            data: { url: CLICK_URL }
        });
    }

    function addLog(id, msg) {
        const list = document.getElementById('list');
        const div = document.createElement('div');
        div.id = id;
        div.className = 'item status-ready';
        div.innerHTML = `<span>${msg}</span><span>待機中</span>`;
        list.prepend(div);
    }

    function updateLog(id) {
        const el = document.getElementById(id);
        if (el) {
            el.className = 'item status-done';
            el.lastChild.innerText = '完了';
        }
    }

    function reserve() {
        const t = document.getElementById('title').value || 'NT通知';
        const b = document.getElementById('task').value;
        const target = new Date(document.getElementById('alarmTime').value);
        const diff = target.getTime() - Date.now();
        const id = 'notif-' + Date.now();

        if (diff <= 0) return alert('未来の時間を指定してね');

        addLog(id, `${target.toLocaleTimeString()}：${t}`);
        setTimeout(() => {
            sendNotify(t, b);
            updateLog(id);
        }, diff);
    }

    function burst() {
        const t = document.getElementById('bTitle').value || '連射';
        const sec = document.getElementById('interval').value * 1000;
        const max = document.getElementById('count').value;

        for (let i = 1; i <= max; i++) {
            const id = 'burst-' + Date.now() + '-' + i;
            setTimeout(() => {
                addLog(id, `連射 ${i}/${max}`);
                sendNotify(`${t} ${i}/${max}`, `${i}回目の通知です`);
                setTimeout(() => updateLog(id), 500);
            }, i * sec);
        }
    }

    function clearList() {
        document.getElementById('list').innerHTML = '';
    }

    // 初期時刻セット
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('alarmTime').value = now.toISOString().slice(0, 19);
</script>
</body>
</html>
