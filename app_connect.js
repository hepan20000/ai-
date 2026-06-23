/* ==========================================================================
   医生好友申请与联动会话原型 - 逻辑控制 (app_connect.js)
   ========================================================================== */

// --- 医生及会话初始数据 ---
let doctors = [
    { 
        id: 1, 
        name: '张景岳', 
        title: '主任医师', 
        tags: '失眠多梦 / 脾胃调理', 
        desc: '擅长结合智能手表连续生理数据开展心脑血管疾病前置筛查，及中西医结合动态干预。', 
        avatar: 'assets/doctor_avatar_1.png', 
        state: 'unadded' // 'unadded', 'pending', 'chat'
    },
    { 
        id: 2, 
        name: '李时珍', 
        title: '副主任医师', 
        tags: '治未病中心 / 药食同源', 
        desc: '精通九种体质分型识别，擅长个性化药膳代用茶调制、节气调养与生活方式指导。', 
        avatar: 'assets/doctor_avatar_2.png', 
        state: 'unadded' 
    }
];

// --- 医生个人账号与主页配置的内存数据 (当前登录：张景岳) ---
let docProfile = {
    password: 'admin',
    phone: '13888888888',
    tags: '失眠多梦 / 脾胃调理',
    desc: '擅长结合智能手表连续生理数据开展心脑血管疾病前置筛查，及中西医结合动态干预。'
};

// --- 全局连接状态 ---
let currentSelectedDocId = null;
let activeChatDocId = null;
let friendRequest = null; // 存储当前活动的好友申请

// --- 看板与报警定时器相关变量 ---
let watchSyncTimer = null;
let syncSeconds = 30;
let riskSimulationTimeout = null;
let currentHealthState = 'warning'; // 'normal', 'warning', 'risk'

// --- 初始化入口 ---
document.addEventListener('DOMContentLoaded', () => {
    // 同步配置到第一个医生的初始数据中
    doctors[0].tags = docProfile.tags;
    doctors[0].desc = docProfile.desc;
    
    // 初始化工作台的医生看板展示
    updateWorkbenchProfileDisplay();
    
    renderDoctorList();
    initInteractions();
    loadQuickReplies(); // 渲染并加载快捷话术
});

// 同步工作台配置卡片展示
function updateWorkbenchProfileDisplay() {
    const tagsEl = document.getElementById('currentDocTags');
    const nameEl = document.getElementById('currentDocName');
    if (tagsEl) tagsEl.innerText = docProfile.tags;
    if (nameEl) nameEl.innerText = doctors[0].name;
}

// ==========================================================================
// 1. 渲染居民端的医生卡片列表
// ==========================================================================
function renderDoctorList() {
    const docListContainer = document.getElementById('clientDocList');
    if (!docListContainer) return;
    
    docListContainer.innerHTML = '';
    
    doctors.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        
        let actionBtnHtml = '';
        if (doc.state === 'unadded') {
            actionBtnHtml = `<button class="connect-action-btn add-friend" onclick="openRequestDrawer(${doc.id})">+ 申请好友</button>`;
        } else if (doc.state === 'pending') {
            actionBtnHtml = `<button class="connect-action-btn pending" disabled>等待医生同意...</button>`;
        } else if (doc.state === 'chat') {
            actionBtnHtml = `<button class="connect-action-btn start-chat" onclick="openChatView(${doc.id})">开始对话</button>`;
        }
        
        card.innerHTML = `
            <div class="doctor-card-top">
                <div class="doc-avatar">
                    <img src="${doc.avatar}" alt="${doc.name}">
                </div>
                <div class="doc-info">
                    <span class="doc-name">${doc.name}</span>
                    <span class="doc-title">${doc.title}</span>
                    <span class="doc-tags">${doc.tags}</span>
                </div>
            </div>
            <p class="doctor-card-desc">${doc.desc}</p>
            <div style="margin-top: 5px;">
                ${actionBtnHtml}
            </div>
        `;
        docListContainer.appendChild(card);
    });
}

// ==========================================================================
// 2. 好友申请弹窗控制 (Drawer UI)
// ==========================================================================
function openRequestDrawer(docId) {
    currentSelectedDocId = docId;
    const overlay = document.getElementById('requestDrawerOverlay');
    const textarea = document.getElementById('requestNoteInput');
    
    // 设置默认的申请备注文本，方便用户直接体验
    textarea.value = `您好，我是王小明（脾虚湿盛体质）。我最近老是失眠，并伴有轻微胸闷，想申请添加您为调理顾问。`;
    
    overlay.classList.add('active');
}

function closeRequestDrawer() {
    document.getElementById('requestDrawerOverlay').classList.remove('active');
}

// 发送申请逻辑
function sendFriendRequest() {
    if (!currentSelectedDocId) return;
    
    const doc = doctors.find(d => d.id === currentSelectedDocId);
    const noteText = document.getElementById('requestNoteInput').value.trim();
    
    // 1. 更新医生卡片状态为“申请中”
    doc.state = 'pending';
    closeRequestDrawer();
    renderDoctorList();
    
    // 2. 构造好友申请数据包，流转至医生端
    friendRequest = {
        docId: doc.id,
        docName: doc.name,
        userName: '王小明',
        userTag: '脾虚湿盛质',
        note: noteText,
        date: '刚刚'
    };
    
    // 3. 激活中间的流动连线光效 (向右流动)
    const dot = document.getElementById('connectorDot');
    dot.className = 'connector-dot flowing-right';
    document.getElementById('connectorStatus').innerHTML = `申请已发送<br><span style="color:var(--primary);">数据流向医生端 ➔</span>`;
    
    // 4. 延迟 1 秒在医生端弹出未读通知
    setTimeout(() => {
        const notiBar = document.getElementById('docNotificationBar');
        if (notiBar) {
            notiBar.style.display = 'flex';
            notiBar.classList.add('pulse');
        }
        
        const placeholder = document.getElementById('docPlaceholderText');
        if (placeholder) placeholder.style.display = 'none';
        
        // 渲染申请详情信息
        document.getElementById('reqUserName').innerText = friendRequest.userName;
        document.getElementById('reqUserTag').innerText = friendRequest.userTag;
        document.getElementById('reqUserNote').innerText = `“ ${friendRequest.note} ”`;
        
        // 重置连线提示
        dot.className = 'connector-dot';
        document.getElementById('connectorStatus').innerHTML = `等待医生处理申请`;
    }, 1200);
}

// ==========================================================================
// 3. 医生端审批同意逻辑 (Approval & Relationship Establishment)
// ==========================================================================
function openRequestDetail() {
    // 隐藏通知条，展示消息详情面板
    const notiBar = document.getElementById('docNotificationBar');
    if (notiBar) {
        notiBar.style.display = 'none';
        notiBar.classList.remove('pulse');
    }
    
    const listPanel = document.getElementById('docRequestListPanel');
    const detailPanel = document.getElementById('docRequestDetailPanel');
    
    listPanel.classList.remove('active');
    listPanel.classList.add('slide-out-left');
    
    detailPanel.classList.add('active');
    detailPanel.classList.remove('slide-in-right');
}

function closeRequestDetail() {
    const listPanel = document.getElementById('docRequestListPanel');
    const detailPanel = document.getElementById('docRequestDetailPanel');
    
    detailPanel.classList.remove('active');
    listPanel.classList.add('active');
    listPanel.classList.remove('slide-out-left');
}

// 医生同意申请
function acceptFriendRequest() {
    if (!friendRequest) return;
    
    const doc = doctors.find(d => d.id === friendRequest.docId);
    doc.state = 'chat'; // 好友关系正式成立
    
    // 1. 触发中间的流动连线光效 (绿光回馈，双向连通)
    const dot = document.getElementById('connectorDot');
    dot.className = 'connector-dot flowing-left';
    document.getElementById('connectorStatus').innerHTML = `医生已同意申请<br><span style="color:var(--accent);">双方建立专属通信 ➔</span>`;
    
    // 2. 触发全屏关系确立的微光成功特效
    const glowOverlay = document.getElementById('glowSuccess');
    glowOverlay.classList.add('active');
    
    setTimeout(() => {
        glowOverlay.classList.remove('active');
        // 关闭连线特效
        dot.className = 'connector-dot';
        document.getElementById('connectorStatus').innerHTML = `会话通道已激活`;
    }, 1500);
    
    // 3. 双方秒级自动切入会话聊天框
    setTimeout(() => {
        // 更新居民端列表卡片
        renderDoctorList();
        
        // 自动滑入会话界面
        openChatView(doc.id);
    }, 1000);
}

// 拒绝申请
function rejectFriendRequest() {
    if (!friendRequest) return;
    
    const doc = doctors.find(d => d.id === friendRequest.docId);
    doc.state = 'unadded';
    
    alert('【系统模拟】已拒绝好友申请，状态重置。');
    
    closeRequestDetail();
    renderDoctorList();
    
    // 重置页面占位文本显示
    const placeholder = document.getElementById('docPlaceholderText');
    if (placeholder) placeholder.style.display = 'block';
    
    // 重置中间连线状态
    document.getElementById('connectorStatus').innerHTML = `等待发起通信`;
    friendRequest = null;
}

// ==========================================================================
// 4. 双端同屏会话交互控制 (Chat View Handlers)
// ==========================================================================
function openChatView(docId) {
    activeChatDocId = docId;
    const doc = doctors.find(d => d.id === docId);
    
    // --- 居民端（左屏）聊天滑入 ---
    const clientList = document.getElementById('clientDocListPanel');
    const clientChat = document.getElementById('clientChatPanel');
    
    clientList.classList.remove('active');
    clientList.classList.add('slide-out-left');
    
    clientChat.classList.add('active');
    clientChat.classList.remove('slide-in-right');
    
    // 设置聊天室标题
    document.getElementById('clientChatTitle').innerText = `${doc.name} (调理顾问)`;
    
    // --- 医生端（右屏）聊天滑入 ---
    const docDetail = document.getElementById('docRequestDetailPanel');
    const docChat = document.getElementById('docChatPanel');
    
    docDetail.classList.remove('active');
    
    docChat.classList.add('active');
    docChat.classList.remove('slide-in-right');
    
    // 智能手表看板去掉，不再拉宽手机
    // document.getElementById('doctorPhone').classList.add('expanded');
    
    // 设置医生端聊天室标题
    document.getElementById('docChatTitle').innerText = `患者: 王小明`;
    
    // 初始化系统消息与第一条备注消息
    const clientMsgBox = document.getElementById('clientChatMessages');
    const docMsgBox = document.getElementById('docChatMessages');
    
    clientMsgBox.innerHTML = `
        <div class="chat-sys-msg">您已成功添加 ${doc.name} 医生为好友，开始咨询吧</div>
        <div class="bubble other">您好，我是王小明（脾虚湿盛体质）。我最近老是失眠，并伴有轻微胸闷，想申请添加您为调理顾问。</div>
    `;
    
    docMsgBox.innerHTML = `
        <div class="chat-sys-msg">您已同意王小明的申请，会话正式开启</div>
        <div class="bubble other">您好，我是王小明（脾虚湿盛体质）。我最近老是失眠，并伴有轻微胸闷，想申请添加您为调理顾问。</div>
    `;
    
    // 动态加载自定义个性化调理方案下拉列表
    loadConfiguredRecipes();
    
    // 初始化并同步手表健康面板指标（默认加载为“亚健康”）
    updateWatchDashboardData('warning');
    
    // 开启静息 30 秒倒计时刷新
    startWatchSyncTimer();
    
    // 10秒后模拟手表监测到异常风险，触发警报
    riskSimulationTimeout = setTimeout(() => {
        triggerPatientWatchRisk();
    }, 10000);
    
    // 医生自动发一句问候
    setTimeout(() => {
        sendDirectMessage('doctor', `你好小明，我已经阅读了你的中医体质画像（脾虚湿盛，气虚质偏颇）。针对你失眠伴胸闷的情况，日常调理应该以健脾化湿、理气安神为主。你平时大便粘滞吗？`);
    }, 1500);
}

// 退出聊天返回列表
function closeChatView() {
    // 清除定时器与风险报警
    stopWatchSyncTimer();
    if (riskSimulationTimeout) {
        clearTimeout(riskSimulationTimeout);
        riskSimulationTimeout = null;
    }
    clearRiskAlert();

    // 居民端退出
    const clientList = document.getElementById('clientDocListPanel');
    const clientChat = document.getElementById('clientChatPanel');
    clientChat.classList.remove('active');
    clientList.classList.add('active');
    clientList.classList.remove('slide-out-left');
    
    // 医生端退出
    const docList = document.getElementById('docRequestListPanel');
    const docChat = document.getElementById('docChatPanel');
    docChat.classList.remove('active');
    docList.classList.add('active');
    
    // 不再收缩医生端宽度
    // document.getElementById('doctorPhone').classList.remove('expanded');
    
    // 显示工作台占位文本
    const placeholder = document.getElementById('docPlaceholderText');
    if (placeholder) placeholder.style.display = 'block';

    // 重置申请通知状态
    document.getElementById('connectorStatus').innerHTML = `等待发起通信`;
    
    // 状态重置
    const doc = doctors.find(d => d.id === activeChatDocId);
    if (doc) doc.state = 'unadded';
    renderDoctorList();
    
    activeChatDocId = null;
    friendRequest = null;
}

// 发送消息联动逻辑 (Send Message)
function sendChatMessage(sender) {
    const inputId = sender === 'client' ? 'clientMsgInput' : 'docMsgInput';
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    if (!text) return;
    
    sendDirectMessage(sender, text);
    input.value = '';
    
    // 【转诊就医引导仿真闭环拦截】
    // 如果医生发送了包含“转诊”或者“中医院”等就医引导常用语，模拟2.5秒后解除风险状态，患者自动回复确认
    if (sender === 'doctor' && (text.includes('转诊') || text.includes('中医院') || text.includes('面诊'))) {
        setTimeout(() => {
            // 解除警报，切换为亚健康状态
            clearRiskAlert();
            updateWatchDashboardData('warning');
            
            // 居民模拟自动回复
            sendDirectMessage('client', '收到，医生！我已经听您的建议，挂了明天上午中医院心血管科的专家号，待会儿我就去医院面诊。谢谢您的实时监测与督办提醒！');
        }, 2500);
    }
}

// 消息渲染和流光连线脉冲
function sendDirectMessage(sender, text) {
    const clientMsgBox = document.getElementById('clientChatMessages');
    const docMsgBox = document.getElementById('docChatMessages');
    
    const clientMsg = document.createElement('div');
    const docMsg = document.createElement('div');
    
    const isHtml = text.trim().startsWith('<') && text.trim().endsWith('>');
    
    if (sender === 'client') {
        clientMsg.className = 'bubble self';
        if (isHtml) clientMsg.innerHTML = text;
        else clientMsg.innerText = text;
        
        docMsg.className = 'bubble other';
        if (isHtml) docMsg.innerHTML = text;
        else docMsg.innerText = text;
        
        const dot = document.getElementById('connectorDot');
        if (dot) {
            dot.className = 'connector-dot flowing-right';
            setTimeout(() => { dot.className = 'connector-dot'; }, 2000);
        }
    } else {
        docMsg.className = 'bubble self';
        if (isHtml) docMsg.innerHTML = text;
        else docMsg.innerText = text;
        
        clientMsg.className = 'bubble other';
        if (isHtml) clientMsg.innerHTML = text;
        else clientMsg.innerText = text;
        
        const dot = document.getElementById('connectorDot');
        if (dot) {
            dot.className = 'connector-dot flowing-left';
            setTimeout(() => { dot.className = 'connector-dot'; }, 2000);
        }
    }
    
    if (clientMsgBox) {
        clientMsgBox.appendChild(clientMsg);
        clientMsgBox.scrollTop = clientMsgBox.scrollHeight;
    }
    if (docMsgBox) {
        docMsgBox.appendChild(docMsg);
        docMsgBox.scrollTop = docMsgBox.scrollHeight;
    }
}

// 处理回车发送
function handleChatKey(event, sender) {
    if (event.key === 'Enter') {
        sendChatMessage(sender);
    }
}

// 启动 30 秒静息刷新倒计时
function startWatchSyncTimer() {
    stopWatchSyncTimer();
    syncSeconds = 30;
    const syncStatusEl = document.getElementById('syncStatus');
    if (syncStatusEl) {
        syncStatusEl.innerText = `${syncSeconds}s 静息刷新`;
    }
    
    watchSyncTimer = setInterval(() => {
        syncSeconds--;
        if (syncSeconds <= 0) {
            syncSeconds = 30;
            randomizeWatchMetrics();
        }
        if (syncStatusEl) {
            syncStatusEl.innerText = `${syncSeconds}s 静息刷新`;
        }
    }, 1000);
}

function stopWatchSyncTimer() {
    if (watchSyncTimer) {
        clearInterval(watchSyncTimer);
        watchSyncTimer = null;
    }
}

// 模拟体征数据在刷新时的轻微上下波动
function randomizeWatchMetrics() {
    const isRisk = currentHealthState === 'risk';
    
    let hr, spo2, bp, sleep, steps;
    if (isRisk) {
        hr = Math.floor(Math.random() * 8) + 112; 
        spo2 = Math.floor(Math.random() * 3) + 86; 
        bp = `${Math.floor(Math.random()*8)+142}/${Math.floor(Math.random()*6)+92}`; 
        sleep = "5.2 小时";
        steps = "3,210 步";
    } else if (currentHealthState === 'warning') {
        hr = Math.floor(Math.random() * 6) + 78; 
        spo2 = Math.floor(Math.random() * 2) + 96; 
        bp = `${Math.floor(Math.random()*5)+120}/${Math.floor(Math.random()*4)+80}`;
        sleep = "7.2 小时";
        steps = (4500 + Math.floor(Math.random() * 40)).toLocaleString() + " 步";
    } else {
        hr = Math.floor(Math.random() * 6) + 68; 
        spo2 = Math.floor(Math.random() * 2) + 98; 
        bp = `${Math.floor(Math.random()*5)+115}/${Math.floor(Math.random()*75)}`;
        sleep = "7.5 小时";
        steps = (6200 + Math.floor(Math.random() * 50)).toLocaleString() + " 步";
    }
    
    const hrEl = document.getElementById('watchHr');
    if (hrEl) hrEl.innerText = `${hr} bpm`;
    const spo2El = document.getElementById('watchSpO2');
    if (spo2El) spo2El.innerText = `${spo2}%`;
    const bpEl = document.getElementById('watchBp');
    if (bpEl) bpEl.innerText = bp;
    const sleepEl = document.getElementById('watchSleep');
    if (sleepEl) sleepEl.innerText = sleep;
    const stepsEl = document.getElementById('watchSteps');
    if (stepsEl) stepsEl.innerText = steps;
    
    updateMetricStatusColor('watchHr', hr, 60, 99);
    updateMetricStatusColor('watchSpO2', spo2, 95, 100);
}

function updateMetricStatusColor(elementId, val, minNormal, maxNormal) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (val < minNormal || val > maxNormal) {
        el.className = "metric-value danger";
    } else if (val >= minNormal && val < 75) {
        el.className = "metric-value normal";
    } else {
        el.className = "metric-value warning";
    }
}

// 切换看板数据状态 (健康、亚健康、风险)
function updateWatchDashboardData(state) {
    currentHealthState = state;
    const bar = document.getElementById('healthStatusBar');
    const dot = document.getElementById('healthStateDot');
    const text = document.getElementById('watchHealthState');
    
    if (bar) {
        if (state === 'normal') bar.className = 'health-status-bar alert-status-success';
        else if (state === 'warning') bar.className = 'health-status-bar alert-status-warning';
        else if (state === 'risk') bar.className = 'health-status-bar alert-status-danger';
    }
    if (dot) {
        if (state === 'normal') dot.className = 'status-dot success';
        else if (state === 'warning') dot.className = 'status-dot warning';
        else if (state === 'risk') dot.className = 'status-dot danger';
    }
    if (text) {
        if (state === 'normal') text.innerText = '健康状态：健康 (绿)';
        else if (state === 'warning') text.innerText = '健康状态：亚健康 (黄)';
        else if (state === 'risk') text.innerText = '健康状态：风险状态 (红)';
    }
    
    const hrEl = document.getElementById('watchHr');
    if (hrEl) {
        hrEl.innerText = state === 'normal' ? '72 bpm' : (state === 'warning' ? '80 bpm' : '115 bpm');
        hrEl.className = 'metric-value ' + (state === 'normal' ? 'normal' : (state === 'warning' ? 'warning' : 'danger'));
    }
    
    const spo2El = document.getElementById('watchSpO2');
    if (spo2El) {
        spo2El.innerText = state === 'normal' ? '99%' : (state === 'warning' ? '97%' : '88%');
        spo2El.className = 'metric-value ' + (state === 'normal' ? 'normal' : (state === 'warning' ? 'normal' : 'danger'));
    }
    
    const bpEl = document.getElementById('watchBp');
    if (bpEl) {
        bpEl.innerText = state === 'normal' ? '118/76 mmHg' : (state === 'warning' ? '122/81 mmHg' : '145/95 mmHg');
        if (state === 'risk') bpEl.className = 'metric-value danger';
        else bpEl.className = 'metric-value';
    }
    
    const sleepEl = document.getElementById('watchSleep');
    if (sleepEl) {
        sleepEl.innerText = state === 'normal' ? '7.5 小时' : (state === 'warning' ? '7.2 小时' : '5.2 小时');
    }
    
    const stepsEl = document.getElementById('watchSteps');
    if (stepsEl) {
        stepsEl.innerText = state === 'normal' ? '6,230 步' : (state === 'warning' ? '4,521 步' : '3,210 步');
    }
    
    const reportCerebroEl = document.getElementById('reportCerebro');
    if (reportCerebroEl) {
        reportCerebroEl.innerText = state === 'risk' ? '风险' : '健康';
        reportCerebroEl.className = 'report-tag ' + (state === 'risk' ? 'danger' : 'normal');
    }
    const reportCerebroBriefEl = document.getElementById('reportCerebroBrief');
    if (reportCerebroBriefEl) {
        reportCerebroBriefEl.innerText = state === 'risk' ? '多模态脉搏波形反映心跳过速且伴局部血管顺顺性降低风险。' : '多模态脉搏波形特征分析未见明显硬化倾向。';
    }
    
    const reportSleepEl = document.getElementById('reportSleep');
    if (reportSleepEl) {
        reportSleepEl.innerText = state === 'normal' ? '健康' : (state === 'warning' ? '亚健康' : '风险');
        reportSleepEl.className = 'report-tag ' + (state === 'normal' ? 'normal' : (state === 'warning' ? 'warning' : 'danger'));
    }
    const reportSleepBriefEl = document.getElementById('reportSleepBrief');
    if (reportSleepBriefEl) {
        reportSleepBriefEl.innerText = state === 'normal' ? '昨晚睡眠呼吸暂停指数(AHI)正常，无缺氧。' : (state === 'warning' ? '昨晚睡眠存在 3 次轻微血氧饱和波动，疑有低通气。' : '昨晚血氧降至 85% 以下，睡眠呼吸暂停严重。');
    }
    
    const reportStressEl = document.getElementById('reportStress');
    if (reportStressEl) {
        reportStressEl.innerText = state === 'normal' ? '健康' : '风险';
        reportStressEl.className = 'report-tag ' + (state === 'normal' ? 'normal' : 'danger');
    }
    const reportStressBriefEl = document.getElementById('reportStressBrief');
    if (reportStressBriefEl) {
        reportStressBriefEl.innerText = state === 'normal' ? '交感与副交感神经平衡，情绪指数平稳。' : (state === 'warning' ? '心率变异性(HRV)显著降低，交感神经处于高度紧张状态。' : '心搏间期极度不均，脑神经疲劳度超载。');
    }
}

function triggerPatientWatchRisk() {
    updateWatchDashboardData('risk');
    
    // 改变聊天室状态栏
    const statusText = document.querySelector('#docChatPanel .chat-room-status');
    if (statusText) {
        statusText.innerText = '🚨 警报：体征指标异常风险！';
        statusText.style.color = '#ef4444';
        statusText.classList.add('blink');
    }
    
    // 增加警报提示信息气泡
    const docMsgBox = document.getElementById('docChatMessages');
    const alertMsg = document.createElement('div');
    alertMsg.className = 'chat-sys-msg alert';
    alertMsg.id = 'watchAlertMsgBanner';
    alertMsg.innerHTML = `⚠️ 手表警情：王小明血氧突降至 88%，心率飙升至 115bpm！请尽快点击下方“线下转诊引导”模板开展督办！`;
    docMsgBox.appendChild(alertMsg);
    docMsgBox.scrollTop = docMsgBox.scrollHeight;
    
    // 流光连线变红闪烁
    const dot = document.getElementById('connectorDot');
    if (dot) dot.className = 'connector-dot warning-flash';
    const connStatus = document.getElementById('connectorStatus');
    if (connStatus) connStatus.innerHTML = `<span style="color:#ef4444; font-weight:bold;">⚠️ 居民体征危险状态<br>触发警报红色脉冲</span>`;
}

// 解除风险报警
function clearRiskAlert() {
    const statusText = document.querySelector('#docChatPanel .chat-room-status');
    if (statusText) {
        statusText.innerText = '在线';
        statusText.style.color = 'var(--accent)';
        statusText.classList.remove('blink');
    }
    
    const banner = document.getElementById('watchAlertMsgBanner');
    if (banner) banner.remove();
    
    const dot = document.getElementById('connectorDot');
    if (dot) dot.className = 'connector-dot';
    const connStatus = document.getElementById('connectorStatus');
    if (connStatus) connStatus.innerHTML = `会话通道已激活`;
}

// ==========================================================================
// 6. 医生工作台：执业主页设置与个人账号管理
// ==========================================================================

// 执业主页设置
function openDocProfileSettings() {
    const drawer = document.getElementById('docProfileDrawer');
    if (!drawer) return;
    drawer.classList.add('active');
    
    document.getElementById('docTagsInput').value = docProfile.tags;
    document.getElementById('docDescInput').value = docProfile.desc;
    updateCharCount();
}

function closeDocProfileSettings() {
    const drawer = document.getElementById('docProfileDrawer');
    if (drawer) drawer.classList.remove('active');
}

function updateCharCount() {
    const textarea = document.getElementById('docDescInput');
    const label = document.getElementById('charCountLabel');
    if (textarea && label) {
        label.innerText = `${textarea.value.length} / 500`;
    }
}

function saveDocProfileSettings() {
    const tags = document.getElementById('docTagsInput').value.trim();
    const desc = document.getElementById('docDescInput').value.trim();
    
    if (!tags || !desc) {
        alert('标签和诊疗特色介绍不能为空！');
        return;
    }
    
    docProfile.tags = tags;
    docProfile.desc = desc;
    
    // 更新本地内存列表数据，保证前端双向数据同步
    doctors[0].tags = tags;
    doctors[0].desc = desc;
    
    updateWorkbenchProfileDisplay();
    renderDoctorList();
    closeDocProfileSettings();
    
    showGlobalNotification('执业主页配置已成功保存并同步！');
}

// 账号安全设置
let currentAccountTab = 'password';

function openDocAccountSettings() {
    const drawer = document.getElementById('docAccountDrawer');
    if (!drawer) return;
    drawer.classList.add('active');
    
    switchAccountTab('password');
    
    // 清空表单
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    document.getElementById('newPhoneInput').value = '';
    document.getElementById('smsCodeInput').value = '';
    document.getElementById('currentBindPhone').innerText = maskPhone(docProfile.phone);
}

function closeDocAccountSettings() {
    const drawer = document.getElementById('docAccountDrawer');
    if (drawer) drawer.classList.remove('active');
}

function switchAccountTab(tab) {
    currentAccountTab = tab;
    const btnPassword = document.getElementById('tabBtnPassword');
    const btnPhone = document.getElementById('tabBtnPhone');
    const contentPassword = document.getElementById('tabContentPassword');
    const contentPhone = document.getElementById('tabContentPhone');
    
    if (tab === 'password') {
        btnPassword.classList.add('active');
        btnPhone.classList.remove('active');
        contentPassword.style.display = 'block';
        contentPhone.style.display = 'none';
    } else {
        btnPassword.classList.remove('active');
        btnPhone.classList.add('active');
        contentPassword.style.display = 'none';
        contentPhone.style.display = 'block';
    }
}

function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 手机验证码模拟发送
let smsCountdown = 0;
let smsTimer = null;
function sendSmsVerification() {
    const newPhone = document.getElementById('newPhoneInput').value.trim();
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('请输入正确的11位新手机号！');
        return;
    }
    if (newPhone === docProfile.phone) {
        alert('新手机号不能与原手机号相同！');
        return;
    }
    
    // 模拟弹窗通知验证码内容
    alert(`【系统模拟】验证码已成功发送至新手机号 ${newPhone}，换绑验证码为：123456`);
    
    smsCountdown = 60;
    const btn = document.getElementById('smsSendBtn');
    btn.disabled = true;
    btn.innerText = `${smsCountdown}s`;
    
    smsTimer = setInterval(() => {
        smsCountdown--;
        if (smsCountdown <= 0) {
            clearInterval(smsTimer);
            btn.disabled = false;
            btn.innerText = '获取验证码';
        } else {
            btn.innerText = `${smsCountdown}s`;
        }
    }, 1000);
}

function submitPhoneChange() {
    const newPhone = document.getElementById('newPhoneInput').value.trim();
    const code = document.getElementById('smsCodeInput').value.trim();
    
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('请输入正确的11位新手机号！');
        return;
    }
    if (code !== '123456') {
        alert('验证码不正确！模拟验证码为: 123456');
        return;
    }
    
    docProfile.phone = newPhone;
    document.getElementById('currentBindPhone').innerText = maskPhone(newPhone);
    
    if (smsTimer) {
        clearInterval(smsTimer);
        document.getElementById('smsSendBtn').disabled = false;
        document.getElementById('smsSendBtn').innerText = '获取验证码';
    }
    
    alert('【安全提示】手机号双向安全换绑成功！');
    closeDocAccountSettings();
    showGlobalNotification('手机号换绑成功！');
}

function submitPasswordChange() {
    const oldPwd = document.getElementById('oldPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    
    if (oldPwd !== docProfile.password) {
        alert('原密码不正确！默认原登录密码为: admin');
        return;
    }
    if (newPwd.length < 6) {
        alert('新密码长度不能少于6位！');
        return;
    }
    if (newPwd !== confirmPwd) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    docProfile.password = newPwd;
    
    alert('密码修改成功！为了您的账号安全，系统模拟强制注销并退回登录初始状态。');
    closeDocAccountSettings();
    
    // 强制模拟注销：1秒后刷新页面重置所有交互状态
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// 常用话术快捷引用模板
function useTemplate(id) {
    const input = document.getElementById('docMsgInput');
    if (!input) return;
    
    if (id === 1) {
        input.value = `小明，根据你的智能手表健康指标（心率达到 115bpm，且血氧已跌落至 88%），你现在已触发风险状态。建议你立即由家属陪同前往附近的主动健康合作机构（如市中医院心内科）进行面诊，同时我已经一键导出了您近期的多模态手表指标走势以方便主治医生看诊。`;
    } else if (id === 2) {
        input.value = `小明，你的智能手表有段时间没有上传睡眠和血氧数据了，请确保手表佩戴正确且蓝牙连接正常，以便我能及时了解你的康复进展。`;
    } else if (id === 3) {
        input.value = `小明，针对你脾虚湿盛的体质，这周饮食请多以清淡健脾为主（如薏米红豆粥），避免生冷油腻，作息上尽量在晚上11点前入睡，我会持续关注你的体征变化。`;
    }
}

// ==========================================================================
// 7. 自定义微光提示通知组件
// ==========================================================================
function showGlobalNotification(text) {
    const noti = document.createElement('div');
    noti.className = 'global-float-notification';
    noti.innerText = text;
    document.body.appendChild(noti);
    
    setTimeout(() => {
        noti.classList.add('active');
    }, 100);
    
    setTimeout(() => {
        noti.classList.remove('active');
        setTimeout(() => noti.remove(), 400);
    }, 3000);
}

// ==========================================================================
// 8. 界面全局事件配置
// ==========================================================================
function initInteractions() {
    // 搜索框输入过滤
    const searchInput = document.getElementById('docSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            const cards = document.querySelectorAll('#clientDocList .doctor-card');
            cards.forEach(card => {
                const name = card.querySelector('.doc-name').innerText.toLowerCase();
                const tags = card.querySelector('.doc-tags').innerText.toLowerCase();
                if (name.includes(val) || tags.includes(val)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}


// ==========================================================================
// 9. 个性化方案与快捷回复扩展
// ==========================================================================

function loadConfiguredRecipes() {
    const select = document.getElementById('docChatRecipeSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">📋 发送个性化方案...</option>';
    
    let recipes = [];
    try {
        const localRecipes = localStorage.getItem('recipesArchive');
        if (localRecipes) {
            recipes = JSON.parse(localRecipes);
        }
    } catch (e) {
        console.error(e);
    }
    
    if (!recipes || recipes.length === 0) {
        recipes = [
            {
                title: '脾虚湿盛失眠多梦轻度干预方案',
                diet: '药膳调理：薏米红豆山药粥，于辰时（早7-9点）空腹服用。代茶饮：黄精茯苓茶，健脾化湿。',
                sport: '午后太极拳20分钟，练习时调匀呼吸，意守涌泉，舒缓紧张交感神经。',
                sleep: '严格要求晚上10:30前入睡，睡前用温水泡脚，促进气血运行。',
                advise: '若手表监测到夜间血氧低于90%，请即刻线下就诊复查。'
            },
            {
                title: '轻度高血压肝阳上亢运动理疗方案',
                diet: '中医食疗：日常饮食控盐控油，多食用芹菜、苦瓜、菊花茶以清肝泻火；晨起空腹温服决明子山楂茶。',
                sport: '理疗运动：每晚练习杨氏太极拳18式，意守涌泉，降气平肝；避免做憋气或剧烈无氧运动。',
                sleep: '作息改善：晚上11点前入睡，保证午时（11:00-13:00）静坐或小憩15-20分钟以养心神。',
                advise: '专属医嘱：若手表血压连续三天监测收缩压大于140mmHg，请即刻到线下面诊，并提供手表趋势图供主治医生看诊。'
            }
        ];
        localStorage.setItem('recipesArchive', JSON.stringify(recipes));
    }
    
    recipes.forEach((item, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = item.title;
        select.appendChild(option);
    });
}

function sendConfiguredRecipe(index) {
    if (index === "" || index === undefined || index === null) return;
    
    let recipes = [];
    try {
        const localRecipes = localStorage.getItem('recipesArchive');
        if (localRecipes) {
            recipes = JSON.parse(localRecipes);
        }
    } catch(e) {}
    
    if (!recipes || !recipes[index]) {
        return;
    }
    
    const recipe = recipes[index];
    const messageContent = `📋 【个性化调理方案：${recipe.title}】\n` +
        `🍵 膳食代茶饮：${recipe.diet || '无'}\n` +
        `🧘 运动理疗：${recipe.sport || '无'}\n` +
        `🛌 起居改善：${recipe.sleep || '无'}\n` +
        `🩺 专属医嘱：${recipe.advise || '无'}`;
        
    sendDirectMessage('doctor', messageContent);
    
    const select = document.getElementById('docChatRecipeSelect');
    if (select) select.value = "";
}

// 快捷回复数据状态机
let quickReplies = [];
const defaultQuickReplies = [
    "🏥 线下转诊督办：王小明居民，系统监测到您的手表生理指标持续异常，已超出安全范围。我已为您启动线下诊疗联动，建议您今日前往合作中医院心血管科进行面诊复查，我们将持续追踪您的数据变化。",
    "📈 提醒佩戴设备：王小明居民，您的智能健康手表已超过12小时未回传心率与血氧数据，请您核对设备电量，并在日间保持佩戴，以便我们开展实时主动监测与风险扫描。",
    "🥗 湿热体质忌口：王小明居民，根据您最新的中医画像（湿热偏盛），日常膳食中请尽量避免吃冰冷生冷饮料、油炸油腻食物，推荐用薏米红豆汤或茯苓扁豆粥调理脾胃虚弱。",
    "🌙 失眠起居建议：王小明居民，根据手表监测发现您昨晚深睡时间偏低。建议睡前一小时避免刷手机等屏幕，改用温水艾草足浴15分钟以调和脏腑气血，保证夜间10:30前准时入睡。"
];

function loadQuickReplies() {
    try {
        const local = localStorage.getItem('quickReplies');
        if (local) {
            quickReplies = JSON.parse(local);
        } else {
            quickReplies = [...defaultQuickReplies];
            localStorage.setItem('quickReplies', JSON.stringify(quickReplies));
        }
    } catch(e) {
        quickReplies = [...defaultQuickReplies];
    }
    renderQuickReplySelect();
}

function renderQuickReplySelect() {
    const select = document.getElementById('docChatQuickSelect');
    if (select) {
        select.innerHTML = '<option value="">💬 快捷回复话术...</option>';
        quickReplies.forEach((reply, idx) => {
            const textBrief = reply.length > 18 ? reply.substring(0, 18) + '...' : reply;
            select.innerHTML += `<option value="${idx}">${textBrief}</option>`;
        });
    }
}

function useQuickReply(val) {
    if (val === "" || val === undefined || val === null) return;
    const input = document.getElementById('docMsgInput');
    if (!input) return;
    
    const idx = parseInt(val);
    if (quickReplies[idx]) {
        input.value = quickReplies[idx];
        input.focus();
    }
    
    const select = document.getElementById('docChatQuickSelect');
    if (select) select.value = "";
}

function openEditQuickRepliesModal() {
    const modal = document.getElementById('quick-reply-edit-modal');
    if (modal) {
        modal.style.display = 'flex';
        renderQuickRepliesManageList();
    }
}

function closeQuickRepliesModal() {
    const modal = document.getElementById('quick-reply-edit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderQuickRepliesManageList() {
    const container = document.getElementById('quick-replies-manage-list');
    if (!container) return;
    
    container.innerHTML = '';
    if (quickReplies.length === 0) {
        container.innerHTML = `<div style="text-align:center; font-size:11px; color:var(--text-muted); padding:10px 0;">暂无配置的快捷回复话术。</div>`;
        return;
    }
    
    quickReplies.forEach((reply, idx) => {
        const item = document.createElement('div');
        item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid var(--border-color); padding:6px 10px; border-radius:6px; font-size:11px; gap:8px; margin-bottom:4px; color:var(--text-primary);";
        item.innerHTML = `
            <span style="flex:1; word-break:break-all; line-height:1.4;">${reply}</span>
            <span onclick="deleteQuickReply(${idx})" style="color:var(--danger); cursor:pointer; font-weight:bold; font-size:12px; padding:2px 6px;">✕</span>
        `;
        container.appendChild(item);
    });
}

function addQuickReply() {
    const input = document.getElementById('new-quick-reply-text');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        alert('话术内容不能为空！');
        return;
    }
    
    quickReplies.push(text);
    localStorage.setItem('quickReplies', JSON.stringify(quickReplies));
    input.value = '';
    renderQuickRepliesManageList();
    renderQuickReplySelect();
}

function deleteQuickReply(idx) {
    if (confirm('确认删除这条快捷回复吗？')) {
        quickReplies.splice(idx, 1);
        localStorage.setItem('quickReplies', JSON.stringify(quickReplies));
        renderQuickRepliesManageList();
        renderQuickReplySelect();
    }
}

// 模拟多媒体文件/图片上传
function uploadChatMedia(type) {
    const fileInput = document.getElementById(type === 'image' ? 'chat-image-input' : 'chat-file-input');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const fileName = file.name;
    
    if (type === 'image') {
        alert(`【多媒体模拟】图片 [${fileName}] 上传成功！已将其自动发送至聊天框。`);
        
        // 渲染一个高保真图片卡片
        const imgMsgContent = `<div class="chat-image-bubble" style="max-width:180px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);"><img src="健康画像参考-1.png" style="width:100%; display:block; object-fit:cover;" alt="[图片: ${fileName}]"><div style="padding:4px; font-size:9px; background:rgba(0,0,0,0.5); text-align:center;">📷 图片: ${fileName}</div></div>`;
        sendDirectMessage('doctor', imgMsgContent);
    } else {
        alert(`【多媒体模拟】文件 [${fileName}] 上传成功！已将其自动发送至聊天框。`);
        
        // 发送一个文件下载卡片
        const fileMsgContent = `<div class="chat-file-bubble" style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); border:1px solid var(--border-color); padding:8px 12px; border-radius:8px; max-width:220px;"><span style="font-size:24px;">📁</span><div style="display:flex; flex-direction:column; gap:2px; text-align:left;"><strong style="font-size:11px; word-break:break-all;">${fileName}</strong><span style="font-size:9px; color:var(--text-secondary);">${(file.size / 1024).toFixed(1)} KB</span></div></div>`;
        sendDirectMessage('doctor', fileMsgContent);
    }
    
    // 清空 input
    fileInput.value = '';
}
