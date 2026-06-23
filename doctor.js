/* ==========================================================================
   医生端工作台 - 逻辑控制系统 (doctor.js)
   ========================================================================== */

// ==========================================================================
// 1. 初始化 Mock 核心数据库 (与 localStorage 同步)
// ==========================================================================

let doctorsApproval = [];
const SVG_ICONS = {
    tea: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f0fdf4'/><path d='M30 40 h35 v25 a15 15 0 0 1 -15 15 h-5 a15 15 0 0 1 -15 -15 z' fill='none' stroke='%2316a34a' stroke-width='4'/><path d='M65 45 h8 a6 6 0 0 1 6 6 v4 a6 6 0 0 1 -6 6 h-8' fill='none' stroke='%2316a34a' stroke-width='4'/><path d='M38 25 q3 -5 0 -10 M48 25 q3 -5 0 -10 M58 25 q3 -5 0 -10' fill='none' stroke='%2316a34a' stroke-width='3' stroke-linecap='round'/></svg>",
    meal: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23fff7ed'/><path d='M20 50 a30 30 0 0 0 60 0 z' fill='none' stroke='%23ea580c' stroke-width='4'/><line x1='15' y1='50' x2='85' y2='50' stroke='%23ea580c' stroke-width='4' stroke-linecap='round'/><path d='M35 35 q5 -10 10 -5 t10 -5 t10 -5' fill='none' stroke='%23ea580c' stroke-width='3' stroke-linecap='round'/></svg>",
    gel: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23faf5ff'/><rect x='30' y='30' width='40' height='45' rx='6' fill='none' stroke='%239333ea' stroke-width='4'/><rect x='25' y='22' width='50' height='8' rx='2' fill='%239333ea'/><circle cx='50' cy='52' r='8' fill='none' stroke='%239333ea' stroke-width='3'/></svg>",
    foot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23eff6ff'/><path d='M25 30 h50 v40 a10 10 0 0 1 -10 10 h-30 a10 10 0 0 1 -10 -10 z' fill='none' stroke='%232563eb' stroke-width='4'/><path d='M35 45 h30 M35 55 h30 M35 65 h30' fill='none' stroke='%232563eb' stroke-width='3' stroke-linecap='round'/></svg>",
    watch: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f0f9ff'/><rect x='30' y='30' width='40' height='40' rx='10' fill='none' stroke='%230284c7' stroke-width='4'/><path d='M40 30 v-15 h20 v15 M40 70 v15 h20 v-15' fill='none' stroke='%230284c7' stroke-width='4' stroke-linecap='round'/><circle cx='50' cy='50' r='10' fill='none' stroke='%230284c7' stroke-width='3'/></svg>",
    charger: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f8fafc'/><circle cx='50' cy='50' r='25' fill='none' stroke='%23475569' stroke-width='4'/><path d='M40 50 h20 M50 40 v20' fill='none' stroke='%23475569' stroke-width='4' stroke-linecap='round'/></svg>"
};

let products = [
    { id: 1, name: '人参黄精生脉饮', category: '茶', price: 89.00, stock: 120, threshold: 10, alias: '生脉饮', image: SVG_ICONS.tea },
    { id: 2, name: '健脾化湿颗粒膳食包', category: '膳', price: 128.00, stock: 4, threshold: 5, alias: '健脾包', image: SVG_ICONS.meal },
    { id: 3, name: '阿胶固元滋补膏', category: '膏', price: 299.00, stock: 0, threshold: 3, alias: '固元膏', image: SVG_ICONS.gel },
    { id: 4, name: '艾草生姜足浴调理包', category: '浴', price: 45.00, stock: 350, threshold: 20, alias: '足浴包', image: SVG_ICONS.foot },
    { id: 5, name: '主动健康智能手表 Active Watch 2', category: '硬件', price: 999.00, stock: 80, threshold: 5, alias: '智能手表', image: SVG_ICONS.watch },
    { id: 6, name: '智能健康手表磁吸快速充电底座', category: '配件', price: 49.00, stock: 200, threshold: 10, alias: '手表充电座', image: SVG_ICONS.charger },
    { id: 7, name: '酸枣仁茯苓静心膏', category: '膏', price: 128.00, stock: 150, threshold: 10, alias: '静心膏', image: SVG_ICONS.gel },
    { id: 8, name: '山药茯苓莲子粉', category: '膳', price: 78.00, stock: 200, threshold: 15, alias: '莲子粉', image: SVG_ICONS.meal },
    { id: 9, name: '百合莲子安神羹', category: '膳', price: 58.00, stock: 250, threshold: 15, alias: '安神羹', image: SVG_ICONS.meal },
    { id: 10, name: '黄精枸杞原浆', category: '膳', price: 168.00, stock: 120, threshold: 10, alias: '枸杞原浆', image: SVG_ICONS.meal }
];

let patients = [
    {
        id: 501,
        name: '王小明',
        phone: '138****8888',
        gender: '男', age: '32岁',
        group: 'temp',
        healthState: 'warning',
        metrics: { hr: 80, spo2: 97, bp: '122/81', sleep: 7.2, steps: 4521 },
        starRating: '亚健康 ⭐️⭐️⭐️⭐️☆',
        risks: { cardioRiskLevel: '低', emotionRiskLevel: '中', sleepRiskLevel: '中' },
        riskScores: [
            { disease: '房颤预测', rate: 25 },
            { disease: '心力衰竭', rate: 12 },
            { disease: '冠心病', rate: 18 },
            { disease: '心动过速', rate: 45 },
            { disease: '心动过缓', rate: 5 },
            { disease: '心肌梗死', rate: 3 }
        ],
        tcm: {
            meridian: '小肠经 亚健康 (午时)',
            syndrome: '虚实错杂，脾虚湿盛为主',
            symptoms: '腹胀、大便粘滞不爽、失眠易醒、胸闷口干。',
            explanation: '脾虚则运化失司，水湿内停，聚而生湿；湿阻气机则见胸闷、腹胀；湿热内扰心神，则夜寐不安、入睡困难。'
        }
    },
    {
        id: 502,
        name: '张*三',
        phone: '135****4321',
        gender: '男', age: '45岁',
        group: 'contract',
        healthState: 'normal',
        metrics: { hr: 72, spo2: 99, bp: '118/76', sleep: 7.5, steps: 6230 },
        starRating: '健康状态 ⭐️⭐️⭐️⭐️⭐️',
        risks: { cardioRiskLevel: '低', emotionRiskLevel: '低', sleepRiskLevel: '低' },
        riskScores: [
            { disease: '房颤预测', rate: 5 },
            { disease: '心力衰竭', rate: 3 },
            { disease: '冠心病', rate: 8 },
            { disease: '心动过速', rate: 10 },
            { disease: '心动过缓', rate: 8 },
            { disease: '心肌梗死', rate: 1 }
        ],
        tcm: {
            meridian: '心经 正常 (午时)',
            syndrome: '气血平调，无明显偏颇',
            symptoms: '无明显不适。',
            explanation: '气血阴阳平衡，脏腑功能良好，经络运行顺畅。'
        }
    },
    {
        id: 503,
        name: '赵*四',
        phone: '139****5678',
        gender: '男', age: '58岁',
        group: 'contract',
        healthState: 'risk',
        metrics: { hr: 115, spo2: 88, bp: '145/95', sleep: 5.2, steps: 3210 },
        starRating: '高危状态 ⭐️⭐️☆☆☆',
        risks: { cardioRiskLevel: '高', emotionRiskLevel: '中', sleepRiskLevel: '高' },
        riskScores: [
            { disease: '房颤预测', rate: 82 },
            { disease: '心力衰竭', rate: 64 },
            { disease: '冠心病', rate: 75 },
            { disease: '心动过速', rate: 85 },
            { disease: '心动过缓', rate: 12 },
            { disease: '心肌梗死', rate: 48 }
        ],
        tcm: {
            meridian: '心包经 异常 (戌时)',
            syndrome: '痰瘀互结，气滞血瘀证',
            symptoms: '胸闷心痛、夜间尤甚、气短喘促、面色晦暗。',
            explanation: '患者体型肥胖，多湿多痰；痰阻气机，气滞则血瘀，瘀血阻滞心脉，导致胸闷心痛；心肺气虚则见气短喘促。'
        }
    },
    {
        id: 504,
        name: '李*华',
        phone: '136****2468',
        gender: '男', age: '62岁',
        group: 'contract',
        healthState: 'risk',
        metrics: { hr: 98, spo2: 91, bp: '138/90', sleep: 6.0, steps: 5120 },
        starRating: '高危状态 ⭐️⭐️⭐️☆☆',
        risks: { cardioRiskLevel: '高', emotionRiskLevel: '高', sleepRiskLevel: '低' },
        riskScores: [
            { disease: '房颤预测', rate: 68 },
            { disease: '心力衰竭', rate: 45 },
            { disease: '冠心病', rate: 58 },
            { disease: '心动过速', rate: 62 },
            { disease: '心动过缓', rate: 10 },
            { disease: '心肌梗死', rate: 35 }
        ],
        tcm: {
            meridian: '心经 异常 (午时)',
            syndrome: '心气阴两虚，痰阻心脉证',
            symptoms: '心悸怔忡、胸闷气短、活动后尤甚、自汗神疲。',
            explanation: '年高体弱，心气受损，无力推动血行，故气短心悸；气虚阴伤，津液凝滞为痰，阻滞心脉，导致胸闷。'
        }
    },
    {
        id: 505,
        name: '刘*梅',
        phone: '137****1357',
        gender: '女', age: '50岁',
        group: 'contract',
        healthState: 'warning',
        metrics: { hr: 85, spo2: 96, bp: '128/84', sleep: 5.8, steps: 4890 },
        starRating: '亚健康 ⭐️⭐️⭐️⭐️☆',
        risks: { cardioRiskLevel: '低', emotionRiskLevel: '中', sleepRiskLevel: '中' },
        riskScores: [
            { disease: '房颤预测', rate: 18 },
            { disease: '心力衰竭', rate: 15 },
            { disease: '冠心病', rate: 22 },
            { disease: '心动过速', rate: 30 },
            { disease: '心动过缓', rate: 15 },
            { disease: '心肌梗死', rate: 8 }
        ],
        tcm: {
            meridian: '肝经 亚健康 (丑时)',
            syndrome: '肝郁脾虚，气滞湿阻证',
            symptoms: '情志抑郁、胸胁胀满、失眠多梦、食少腹胀。',
            explanation: '肝失条达，气机郁滞，故见情志抑郁、胸胁胀满；木郁克土，脾失健运，则食少腹胀；气滞湿阻，心神不宁，则夜寐欠安。'
        }
    },
    {
        id: 506,
        name: '陈*国',
        phone: '139****8765',
        gender: '男', age: '28岁',
        group: 'temp',
        healthState: 'normal',
        metrics: { hr: 68, spo2: 99, bp: '115/72', sleep: 7.8, steps: 8500 },
        starRating: '健康状态 ⭐️⭐️⭐️⭐️⭐️',
        risks: { cardioRiskLevel: '低', emotionRiskLevel: '低', sleepRiskLevel: '低' },
        riskScores: [
            { disease: '房颤预测', rate: 3 },
            { disease: '心力衰竭', rate: 2 },
            { disease: '冠心病', rate: 5 },
            { disease: '心动过速', rate: 8 },
            { disease: '心动过缓', rate: 5 },
            { disease: '心肌梗死', rate: 0.5 }
        ],
        tcm: {
            meridian: '肺经 正常 (寅时)',
            syndrome: '脏腑平和，气血周流',
            symptoms: '无明显不适。',
            explanation: '营卫调和，经脉通畅，脏腑功能调顺，生命活力旺盛。'
        }
    }
];        { disease: '房颤预测', rate: 18 },
            { disease: '心力衰竭', rate: 15 },
            { disease: '冠心病', rate: 22 },
            { disease: '心动过速', rate: 30 },
            { disease: '心动过缓', rate: 15 },
            { disease: '心肌梗死', rate: 8 }
        ],
        tcm: {
            meridian: '肝经 亚健康 (丑时)',
            syndrome: '肝郁脾虚，气滞湿阻证',
            symptoms: '情志抑郁、胸胁胀满、失眠多梦、食少腹胀。',
            explanation: '肝失条达，气机郁滞，故见情志抑郁、胸胁胀满；木郁克土，脾失健运，则食少腹胀；气滞湿阻，心神不宁，则夜寐欠安。'
        }
    },
    {
        id: 506,
        name: '陈*国',
        phone: '139****8765',
        gender: '男', age: '28岁',
        group: 'temp',
        healthState: 'normal',
        metrics: { hr: 68, spo2: 99, bp: '115/72', sleep: 7.8, steps: 8500 },
        starRating: '健康状态 ⭐️⭐️⭐️⭐️⭐️',
        riskScores: [
            { disease: '房颤预测', rate: 3 },
            { disease: '心力衰竭', rate: 2 },
            { disease: '冠心病', rate: 5 },
            { disease: '心动过速', rate: 8 },
            { disease: '心动过缓', rate: 5 },
            { disease: '心肌梗死', rate: 0.5 }
        ],
        tcm: {
            meridian: '肺经 正常 (寅时)',
            syndrome: '脏腑平和，气血周流',
            symptoms: '无明显不适。',
            explanation: '营卫调和，经脉通畅，脏腑功能调顺，生命活力旺盛。'
        }
    }
];

let docProfile = {
    password: 'admin',
    phone: '13888888888',
    tags: '失眠多梦; 脾胃调理',
    desc: '擅长结合智能手表连续生理数据开展心脑血管疾病前置筛查，及中西医结合动态干预。'
};

let articles = [
    { id: 601, title: '仲夏清心健脾化湿膳食调理指南', type: '图文', size: '1,248 字', status: 'published' },
    { id: 602, title: '太极拳涌泉静息呼吸法与血压调节教学', type: '视频', size: '32.4 MB', status: 'published' },
    { id: 603, title: '九种体质快速自测及节气养生秘籍', type: '图文', size: '4,520 字', status: 'draft' }
];

let recipesArchive = [
    {
        id: 701,
        patientId: 501,
        title: '脾虚湿盛失眠多梦轻度干预方案',
        date: '2026-06-15',
        diet: '药膳调理：薏米红豆山药粥，于辰时（早7-9点）空腹服用。代茶饮：黄精茯苓茶，健脾化湿。',
        sport: '午后太极拳20分钟，练习时调匀呼吸，意守涌泉，舒缓紧张交感神经。',
        sleep: '严格要求晚上10:30前入睡，睡前用温水泡脚，促进气血运行。',
        advise: '若手表监测到夜间血氧低于90%，请即刻线下就诊复查。'
    }
];

// 方案模板配置
const recipeTemplates = {
    1: {
        title: '脾虚湿盛失眠多梦理疗方案',
        diet: '中医食疗：推荐薏米红豆山药粥，每日晨起（辰时）服用，健脾渗湿；晚间饮用茯苓莲子代用茶以安神。避免吃生冷油腻食品。',
        sport: '理疗运动：练习陈氏太极拳或八段锦，每次25分钟，重点在动作舒展和呼吸吐纳，调和气脉。',
        sleep: '作息改善：务必于夜间 22:30 之前入睡（亥时），睡前温水艾草足浴15分钟，不玩电子设备。',
        advise: '专属医嘱：如手表监测到夜间心率波动过大或血氧下降，请及时联系我，并准备线下合作中医院面诊。'
    },
    2: {
        title: '轻度高血压肝阳上亢运动理疗方案',
        diet: '中医食疗：日常饮食控盐控油，多食用芹菜、苦瓜、菊花茶以清肝泻火；晨起空腹温服决明子山楂茶。',
        sport: '理疗运动：每晚练习杨氏太极拳18式，意守涌泉，降气平肝；避免做憋气或剧烈无氧运动。',
        sleep: '作息改善：晚上11点前入睡，保证午时（11:00-13:00）静坐或小憩15-20分钟以养心神。',
        advise: '专属医嘱：若手表血压连续三天监测收缩压大于140mmHg，请即刻到线下面诊，并提供手表趋势图供主治医生看诊。'
    },
    3: {
        title: '气阴两虚气短乏力茶饮调理方案',
        diet: '中医食疗：推荐人参黄精生脉饮（人参、麦冬、五味子、黄精）代茶频服，益气养阴；膳食中可加入西洋参煲汤。',
        sport: '理疗运动：清晨进行温和慢跑或八段锦第一至四式，每次15-20分钟，以微微出汗为度，切忌大汗淋漓伤气。',
        sleep: '作息改善：规律作息，中午小憩，晚上10:30入睡，保证气血得以休养。',
        advise: '专属医嘱：手表步数每日控制在 6000 步左右，避免过度疲劳，定期监测血氧与静息心率。'
    }
};

// ==========================================================================
// 2. 初始化与主面板切换
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    // 初始化左侧导航事件
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const panelName = item.getAttribute('data-panel');
            switchPanel(panelName);
        });
    });

    // 默认展示第一个面板
    switchPanel('profile');
});

function switchPanel(panelId) {
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`panel-${panelId}`);
    if (target) target.classList.add('active');
    
    const titleMap = {
        'profile': '执业名片配置',
        'articles': '科普内容管理',
        'patients': '我的随访监控与体征对比',
        'recipes': '个性化健康干预方案定制',
        'im': 'IM 即时会话智能工作台',
        'account': '医生个人账号安全管理'
    };
    document.getElementById('current-panel-title').innerText = titleMap[panelId] || '医生工作台';
    
    if (panelId === 'profile') renderProfilePanel();
    if (panelId === 'articles') renderCmsList();
    if (panelId === 'patients') renderPatientsPanel();
    if (panelId === 'recipes') renderRecipesPanel();
    if (panelId === 'account') renderAccountPanel();
}

function saveToLocalStorage() {
    if (doctorsApproval.length > 0) {
        doctorsApproval[0].tags = docProfile.tags;
        doctorsApproval[0].desc = docProfile.desc;
        doctorsApproval[0].name = docProfile.name;
        localStorage.setItem('doctorsApproval', JSON.stringify(doctorsApproval));
    }
    localStorage.setItem('recipesArchive', JSON.stringify(recipesArchive));
    localStorage.setItem('docProfile_doc', JSON.stringify(docProfile));
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('articles', JSON.stringify(articles));
}

function loadFromLocalStorage() {
    if (localStorage.getItem('doctorsApproval')) {
        try {
            doctorsApproval = JSON.parse(localStorage.getItem('doctorsApproval'));
        } catch (e) {
            console.error("解析 doctorsApproval 失败:", e);
            doctorsApproval = [];
        }
        if (Array.isArray(doctorsApproval) && doctorsApproval.length > 0 && doctorsApproval[0]) {
            docProfile.name = doctorsApproval[0].name || docProfile.name;
            docProfile.tags = doctorsApproval[0].tags || docProfile.tags;
            docProfile.desc = doctorsApproval[0].desc || docProfile.desc;
        }
    }
    try {
        if (localStorage.getItem('recipesArchive')) recipesArchive = JSON.parse(localStorage.getItem('recipesArchive'));
    } catch (e) {}
    try {
        if (localStorage.getItem('products')) {
            let localProducts = JSON.parse(localStorage.getItem('products'));
            if (localProducts.length < 10) {
                localStorage.setItem('products', JSON.stringify(products));
            } else {
                products = localProducts;
            }
        } else {
            localStorage.setItem('products', JSON.stringify(products));
        }
    } catch (e) {}
    try {
        if (localStorage.getItem('docProfile_doc')) docProfile = JSON.parse(localStorage.getItem('docProfile_doc'));
    } catch (e) {}
    try {
        if (localStorage.getItem('patients')) patients = JSON.parse(localStorage.getItem('patients'));
    } catch (e) {}
    try {
        if (localStorage.getItem('articles')) articles = JSON.parse(localStorage.getItem('articles'));
    } catch (e) {}
    
    const sideDocName = document.getElementById('side-doc-name');
    const sideDocAvatar = document.getElementById('side-doc-avatar');
    if (sideDocName) {
        sideDocName.innerText = (docProfile && docProfile.name) ? docProfile.name : '';
    }
    if (sideDocAvatar) {
        sideDocAvatar.innerText = (docProfile && docProfile.name) ? docProfile.name.charAt(0) : '';
    }
}

// ==========================================================================
// 3. 执业主页配置与科普发布
// ==========================================================================

function renderProfilePanel() {
    const profName = document.getElementById('profile-name');
    const profDesc = document.getElementById('profile-desc');
    if (profName) profName.value = (docProfile && docProfile.name) ? docProfile.name : '';
    if (profDesc) profDesc.value = (docProfile && docProfile.desc) ? docProfile.desc : '';
    updateCharCount();
    
    // 初始化多选擅长标签
    if (docProfile && typeof docProfile.tags === 'string') {
        const tagsArr = docProfile.tags.split(';').map(t => t.trim());
        const checks = document.querySelectorAll('.profile-tag-check');
        if (checks) {
            checks.forEach(c => {
                c.checked = tagsArr.includes(c.value);
            });
        }
    }
}

function updateCharCount() {
    const descEl = document.getElementById('profile-desc');
    const lblEl = document.getElementById('char-count-lbl');
    if (descEl && lblEl) {
        const text = descEl.value || '';
        lblEl.innerText = `${text.length} / 500`;
    }
}

function saveDocProfileSettings() {
    const name = document.getElementById('profile-name').value.trim();
    const desc = document.getElementById('profile-desc').value.trim();
    const years = document.getElementById('profile-years').value;
    
    if (!name || !desc) {
        alert('名片姓名和介绍不能为空！');
        return;
    }
    
    // 获取勾选标签
    const checks = document.querySelectorAll('.profile-tag-check:checked');
    let tags = [];
    checks.forEach(c => tags.push(c.value));
    
    if (tags.length === 0) {
        alert('请至少勾选一个擅长方向标签！');
        return;
    }
    
    docProfile.name = name;
    docProfile.desc = desc;
    docProfile.tags = tags.join('; ');
    
    saveToLocalStorage();
    
    // 刷新左侧边栏名片
    document.getElementById('side-doc-name').innerText = name;
    document.getElementById('side-doc-avatar').innerText = name.charAt(0);
    
    showGlobalNotification('执业主页个人名片及擅长方向已成功更新保存！');
}

let currentEditingCmsId = null;

function renderCmsList() {
    const tbody = document.getElementById('cms-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('searchArticleTitle')?.value.trim().toLowerCase() || '';
    const typeFilter = document.getElementById('filterArticleType')?.value || 'all';
    const statusFilter = document.getElementById('filterArticleStatus')?.value || 'all';
    
    const filteredArticles = articles.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchVal);
        const matchesType = typeFilter === 'all' || art.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });
    
    filteredArticles.forEach(art => {
        let stateBadge = '';
        if (art.status === 'draft') stateBadge = '<span class="badge badge-warning">草稿</span>';
        else if (art.status === 'published') stateBadge = '<span class="badge badge-success">已发布</span>';
        else stateBadge = '<span class="badge badge-muted">已下架</span>';
        
        const isChecked = art.status === 'published' ? 'checked' : '';
        
        let editAction = '';
        if (art.type === '图文') {
            editAction = `onclick="openEditArticleModal(${art.id})"`;
        } else {
            editAction = `onclick="openEditVideoModal(${art.id})"`;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${art.title}</strong></td>
            <td><span class="badge badge-muted">${art.type}</span></td>
            <td>${art.size}</td>
            <td>${stateBadge}</td>
            <td>
                <div class="switch-container" onclick="toggleCmsStatus(${art.id}, event)">
                    <input type="checkbox" class="switch-input" ${isChecked}>
                    <label class="switch-label"></label>
                    <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${art.status === 'published' ? '已开启' : '已关闭'}</span>
                </div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" ${editAction}>编辑</button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deleteCmsItem(${art.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterArticlesList() {
    renderCmsList();
}

function toggleCmsStatus(id, event) {
    if (event) event.preventDefault();
    const art = articles.find(a => a.id === id);
    if (art) {
        art.status = art.status === 'published' ? 'unpublished' : 'published';
        saveToLocalStorage();
        renderCmsList();
        showGlobalNotification(`已成功切换科普内容销售状态！`);
    }
}

function deleteCmsItem(id) {
    if (confirm('确认删除该科普内容吗？')) {
        articles = articles.filter(a => a.id !== id);
        saveToLocalStorage();
        renderCmsList();
        showGlobalNotification(`该科普内容已从列表中删除。`);
    }
}

// 科普文章 Modal
function openAddArticleModal() {
    currentEditingCmsId = null;
    document.getElementById('article-modal').classList.add('active');
    document.getElementById('article-modal-title').innerText = '发布科普图文文章';
    document.getElementById('art-submit-btn').innerText = '确认发布科普';
    document.getElementById('art-title').value = '';
    document.getElementById('art-body').value = '';
}

function openEditArticleModal(id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;
    
    currentEditingCmsId = id;
    document.getElementById('article-modal').classList.add('active');
    document.getElementById('article-modal-title').innerText = '编辑科普图文文章';
    document.getElementById('art-submit-btn').innerText = '保存修改';
    document.getElementById('art-title').value = art.title;
    document.getElementById('art-body').value = art.body || `这是关于《${art.title}》的科普文章详细内容。中医主张辨证施治，合理作息与手表连续体征监测相配合。`;
}

function closeAddArticleModal() {
    document.getElementById('article-modal').classList.remove('active');
}

function submitAddArticle() {
    const title = document.getElementById('art-title').value.trim();
    const body = document.getElementById('art-body').value.trim();
    
    if (!title || !body) {
        alert('科普标题和文章正文不能为空！');
        return;
    }
    
    if (currentEditingCmsId !== null) {
        const art = articles.find(a => a.id === currentEditingCmsId);
        if (art) {
            art.title = title;
            art.size = `${body.length} 字`;
            art.body = body;
        }
        showGlobalNotification(`科普文章 [${title}] 已成功修改！`);
    } else {
        const newArt = {
            id: Date.now(),
            title: title,
            type: '图文',
            size: `${body.length} 字`,
            body: body,
            status: 'published'
        };
        articles.push(newArt);
        showGlobalNotification(`科普文章 [${title}] 已成功发布！`);
    }
    
    saveToLocalStorage();
    closeAddArticleModal();
    renderCmsList();
}

// 科普视频 Modal
function openAddVideoModal() {
    currentEditingCmsId = null;
    document.getElementById('video-modal').classList.add('active');
    document.getElementById('video-modal-title').innerText = '发布科普微视频';
    document.getElementById('vid-submit-btn').innerText = '提交发布并异步转码';
    document.getElementById('vid-title').value = '';
    document.getElementById('vid-size').value = '';
}

function openEditVideoModal(id) {
    const art = articles.find(a => a.id === id);
    if (!art) return;
    
    currentEditingCmsId = id;
    document.getElementById('video-modal').classList.add('active');
    document.getElementById('video-modal-title').innerText = '编辑科普微视频';
    document.getElementById('vid-submit-btn').innerText = '保存修改';
    document.getElementById('vid-title').value = art.title;
    document.getElementById('vid-size').value = parseFloat(art.size) || 20.0;
}

function closeAddVideoModal() {
    document.getElementById('video-modal').classList.remove('active');
}

function submitAddVideo() {
    const title = document.getElementById('vid-title').value.trim();
    const sizeVal = parseFloat(document.getElementById('vid-size').value);
    
    if (!title || isNaN(sizeVal)) {
        alert('请输入科普标题并填入模拟的文件大小！');
        return;
    }
    
    if (sizeVal > 100) {
        alert('【大小超限拦截】视频文件大小不能超过 100 MB！');
        return;
    }
    
    if (currentEditingCmsId !== null) {
        const art = articles.find(a => a.id === currentEditingCmsId);
        if (art) {
            art.title = title;
            art.size = `${sizeVal.toFixed(1)} MB`;
        }
        showGlobalNotification(`微视频 [${title}] 已成功修改！`);
    } else {
        const newVid = {
            id: Date.now(),
            title: title,
            type: '视频',
            size: `${sizeVal.toFixed(1)} MB`,
            status: 'published'
        };
        articles.push(newVid);
        showGlobalNotification(`短视频 [${title}] 上传成功，系统已在后台开启异步转码并投放！`);
    }
    
    saveToLocalStorage();
    closeAddVideoModal();
    renderCmsList();
}

// ==========================================================================
// ==========================================================================
// 4. 我的用户健康档案库 (数字人画像与 CRUD 物理联动)
// ==========================================================================

let currentEditingPatientId = null;
let activePatientForDetail = null;

function renderPatientsPanel() {
    const tbody = document.getElementById('records-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('searchRecordInput')?.value.trim().toLowerCase() || '';
    const stateFilterVal = document.getElementById('filterPatientState')?.value || 'all';
    
    const filteredPatients = patients.filter(pat => {
        const matchesSearch = pat.name.toLowerCase().includes(searchVal) || pat.phone.toLowerCase().includes(searchVal);
        const matchesState = stateFilterVal === 'all' || pat.healthState === stateFilterVal;
        return matchesSearch && matchesState;
    });
    
    filteredPatients.forEach(pat => {
        let stateBadge = '';
        if (pat.healthState === 'normal') stateBadge = '<span class="badge badge-success">健康 (绿)</span>';
        else if (pat.healthState === 'warning') stateBadge = '<span class="badge badge-warning">亚健康 (黄)</span>';
        else if (pat.healthState === 'risk') stateBadge = '<span class="badge badge-danger blink">风险 (红)</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${pat.name}</strong></td>
            <td><code>${pat.phone}</code></td>
            <td>${pat.gender} / ${pat.age}</td>
            <td><span class="badge ${pat.bmi > 25 ? 'badge-danger' : 'badge-success'}">${pat.bmi} (${pat.bmi > 25 ? '轻度超重' : '正常'})</span></td>
            <td>${stateBadge}</td>
            <td>
                <div style="font-size:10px; color:var(--text-secondary);">
                    ❤️${pat.metrics.hr} bpm | 🩸${pat.metrics.spo2}% | 🩺${pat.metrics.bp}
                </div>
            </td>
            <td>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" onclick="openRecordDetailModal(${pat.id})">数字人</button>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="openEditPatientModal(${pat.id})">编辑</button>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deletePatient(${pat.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterPatientsList() {
    renderPatientsPanel();
}

function autoCalcHealthState() {
    const cardio = document.getElementById('pat-form-cardio-risk')?.value || '低';
    const emotion = document.getElementById('pat-form-emotion-risk')?.value || '低';
    const sleep = document.getElementById('pat-form-sleep-risk')?.value || '低';

    const stateInput = document.getElementById('pat-form-state');
    const stateDisplay = document.getElementById('pat-form-state-display');

    if (cardio === '高' || emotion === '高' || sleep === '高') {
        if (stateInput) stateInput.value = 'risk';
        if (stateDisplay) stateDisplay.value = '风险 (红)';
    } else if (cardio === '中' || emotion === '中' || sleep === '中') {
        if (stateInput) stateInput.value = 'warning';
        if (stateDisplay) stateDisplay.value = '亚健康 (黄)';
    } else {
        if (stateInput) stateInput.value = 'normal';
        if (stateDisplay) stateDisplay.value = '健康 (绿)';
    }
}

function openAddPatientModal() {
    currentEditingPatientId = null;
    const modal = document.getElementById('patient-modal');
    if (modal) modal.classList.add('active');
    
    const title = document.getElementById('patient-modal-title');
    if (title) title.innerText = '新增居民健康档案';
    
    document.getElementById('pat-form-name').value = '';
    document.getElementById('pat-form-phone').value = '';
    document.getElementById('pat-form-gender').value = '男';
    document.getElementById('pat-form-age').value = '35岁';
    document.getElementById('pat-form-height').value = '170';
    document.getElementById('pat-form-weight').value = '65';
    document.getElementById('pat-form-hr').value = '72';
    document.getElementById('pat-form-spo2').value = '98';
    document.getElementById('pat-form-bp').value = '120/80';
    document.getElementById('pat-form-sleep').value = '7.5';
    document.getElementById('pat-form-steps').value = '6000';
    document.getElementById('pat-form-meridian').value = '心经 正常 (午时)';
    document.getElementById('pat-form-syndrome').value = '气血平调，无明显偏颇';
    document.getElementById('pat-form-symptoms').value = '无明显不适。';
    document.getElementById('pat-form-explanation').value = '气血阴阳平衡，脏腑功能良好，经络运行顺畅。';

    if (document.getElementById('pat-form-cardio-risk')) document.getElementById('pat-form-cardio-risk').value = '低';
    if (document.getElementById('pat-form-emotion-risk')) document.getElementById('pat-form-emotion-risk').value = '低';
    if (document.getElementById('pat-form-sleep-risk')) document.getElementById('pat-form-sleep-risk').value = '低';
    autoCalcHealthState();
}

function openEditPatientModal(id) {
    const pat = patients.find(p => p.id === id);
    if (!pat) return;
    
    currentEditingPatientId = id;
    const modal = document.getElementById('patient-modal');
    if (modal) modal.classList.add('active');
    
    const title = document.getElementById('patient-modal-title');
    if (title) title.innerText = '编辑居民健康档案';
    
    document.getElementById('pat-form-name').value = pat.name;
    document.getElementById('pat-form-phone').value = pat.phone;
    document.getElementById('pat-form-gender').value = pat.gender;
    document.getElementById('pat-form-age').value = pat.age;
    document.getElementById('pat-form-height').value = pat.height;
    document.getElementById('pat-form-weight').value = pat.weight;
    document.getElementById('pat-form-hr').value = pat.metrics.hr;
    document.getElementById('pat-form-spo2').value = pat.metrics.spo2;
    document.getElementById('pat-form-bp').value = pat.metrics.bp;
    document.getElementById('pat-form-sleep').value = pat.metrics.sleep;
    document.getElementById('pat-form-steps').value = pat.metrics.steps;
    document.getElementById('pat-form-meridian').value = pat.tcm.meridian;
    document.getElementById('pat-form-syndrome').value = pat.tcm.syndrome;
    document.getElementById('pat-form-symptoms').value = pat.tcm.symptoms;
    document.getElementById('pat-form-explanation').value = pat.tcm.explanation;

    const risks = pat.risks || {};
    let cardioVal = risks.cardioRiskLevel || '低';
    let emotionVal = risks.emotionRiskLevel || '低';
    let sleepVal = risks.sleepRiskLevel || '低';
    if (!pat.risks) {
        if (pat.healthState === 'risk') { cardioVal = '高'; }
        else if (pat.healthState === 'warning') { emotionVal = '中'; }
    }
    if (document.getElementById('pat-form-cardio-risk')) document.getElementById('pat-form-cardio-risk').value = cardioVal;
    if (document.getElementById('pat-form-emotion-risk')) document.getElementById('pat-form-emotion-risk').value = emotionVal;
    if (document.getElementById('pat-form-sleep-risk')) document.getElementById('pat-form-sleep-risk').value = sleepVal;
    autoCalcHealthState();
}

function closePatientModal() {
    const modal = document.getElementById('patient-modal');
    if (modal) modal.classList.remove('active');
}

function submitPatientForm() {
    const name = document.getElementById('pat-form-name').value.trim();
    const phone = document.getElementById('pat-form-phone').value.trim();
    const gender = document.getElementById('pat-form-gender').value;
    const age = document.getElementById('pat-form-age').value.trim();
    const height = parseFloat(document.getElementById('pat-form-height').value);
    const weight = parseFloat(document.getElementById('pat-form-weight').value);
    
    autoCalcHealthState(); // 保证隐藏 input 获得最新计算值
    const healthState = document.getElementById('pat-form-state').value;
    const cardioRisk = document.getElementById('pat-form-cardio-risk')?.value || '低';
    const emotionRisk = document.getElementById('pat-form-emotion-risk')?.value || '低';
    const sleepRisk = document.getElementById('pat-form-sleep-risk')?.value || '低';

    const hr = parseInt(document.getElementById('pat-form-hr').value);
    const spo2 = parseInt(document.getElementById('pat-form-spo2').value);
    const bp = document.getElementById('pat-form-bp').value.trim();
    const sleep = parseFloat(document.getElementById('pat-form-sleep').value);
    const steps = parseInt(document.getElementById('pat-form-steps').value);
    const meridian = document.getElementById('pat-form-meridian').value.trim();
    const syndrome = document.getElementById('pat-form-syndrome').value.trim();
    const symptoms = document.getElementById('pat-form-symptoms').value.trim();
    const explanation = document.getElementById('pat-form-explanation').value.trim();
    
    if (!name || !phone || isNaN(height) || isNaN(weight)) {
        alert('请填写居民档案的必要基本信息！');
        return;
    }
    
    const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(2));
    
    let starRating = '健康状态 ⭐️⭐️⭐️⭐️⭐️';
    if (healthState === 'warning') starRating = '亚健康 ⭐️⭐️⭐️⭐️☆';
    else if (healthState === 'risk') starRating = '风险状态 ⭐️⭐️☆☆☆';
    
    const riskScores = [
        { disease: '房颤预测', rate: healthState === 'risk' ? 82 : (healthState === 'warning' ? 25 : 5) },
        { disease: '心力衰竭', rate: healthState === 'risk' ? 64 : (healthState === 'warning' ? 12 : 3) },
        { disease: '冠心病', rate: healthState === 'risk' ? 75 : (healthState === 'warning' ? 18 : 8) },
        { disease: '心动过速', rate: healthState === 'risk' ? 85 : (healthState === 'warning' ? 45 : 10) },
        { disease: '心动过缓', rate: healthState === 'risk' ? 12 : (healthState === 'warning' ? 5 : 8) },
        { disease: '心肌梗死', rate: healthState === 'risk' ? 48 : (healthState === 'warning' ? 3 : 1) }
    ];

    const risks = {
        cardioRiskLevel: cardioRisk,
        emotionRiskLevel: emotionRisk,
        sleepRiskLevel: sleepRisk
    };

    if (currentEditingPatientId !== null) {
        const pat = patients.find(p => p.id === currentEditingPatientId);
        if (pat) {
            pat.name = name;
            pat.phone = phone;
            pat.gender = gender;
            pat.age = age;
            pat.height = height;
            pat.weight = weight;
            pat.bmi = bmi;
            pat.healthState = healthState;
            pat.metrics = { hr, spo2, bp, sleep, steps };
            pat.starRating = starRating;
            pat.riskScores = riskScores;
            pat.risks = risks;
            pat.tcm = { meridian, syndrome, symptoms, explanation };
            if (!pat.deviceImei) {
                pat.deviceImei = `IMEI86${Math.floor(Math.random()*900000+100000)}`;
            }
        }
        showGlobalNotification(`居民 ${name} 的健康档案已成功修改！`);
    } else {
        const newPat = {
            id: Date.now(),
            name,
            phone,
            gender,
            age,
            height,
            weight,
            bmi,
            healthState,
            metrics: { hr, spo2, bp, sleep, steps },
            starRating,
            riskScores,
            risks,
            tcm: { meridian, syndrome, symptoms, explanation },
            deviceImei: `IMEI86${Math.floor(Math.random()*900000+100000)}`
        };
        patients.push(newPat);
        showGlobalNotification(`居民 ${name} 的健康档案已成功录入！`);
    }
    
    saveToLocalStorage();
    closePatientModal();
    renderPatientsPanel();
}

function openRecordDetailModal(patientId) {
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;
    
    activePatientForDetail = pat;
    
    // 打开模态框
    const modal = document.getElementById('record-detail-modal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // 生成波动历史数据
    generatePatientTrendData(pat);
    
    // 渲染看板数据
    updateDetailModalData();
    
    // 绘制中医雷达
    drawTcmRadar(pat);
    
    // 默认趋势图 Tab 切换
    switchDetailTrend('heart');
    
    // 定时手表生理数据扰动 (5s)
    if (detailPerturbationInterval) {
        clearInterval(detailPerturbationInterval);
    }
    detailPerturbationInterval = setInterval(() => {
        if (!activePatientForDetail) return;
        
        const p = activePatientForDetail;
        
        // 心率扰动
        p.metrics.hr = Math.round(p.metrics.hr + (Math.random() * 4 - 2));
        p.metrics.hr = Math.max(50, Math.min(140, p.metrics.hr));
        
        // 血氧微抖
        if (Math.random() > 0.8) {
            p.metrics.spo2 = Math.round(p.metrics.spo2 + (Math.random() * 2 - 1));
            p.metrics.spo2 = Math.max(93, Math.min(100, p.metrics.spo2));
        }
        
        // 血压微颤
        try {
            let parts = p.metrics.bp.split('/');
            let sys = parseInt(parts[0]) + Math.round(Math.random() * 4 - 2);
            let dia = parseInt(parts[1]) + Math.round(Math.random() * 2 - 1);
            sys = Math.max(90, Math.min(160, sys));
            dia = Math.max(50, Math.min(100, dia));
            p.metrics.bp = `${sys}/${dia}`;
        } catch(e){}
        
        // 步数递增
        p.metrics.steps += Math.round(Math.random() * 3);
        
        // 写入趋势图的最后一项
        const activeTabBtn = document.querySelector('.trends-tab-group .trend-tab.active');
        const activeType = activeTabBtn ? activeTabBtn.getAttribute('data-type') : 'heart';
        
        if (activeType === 'heart') {
            activePatientTrendData.heart[activePatientTrendData.heart.length - 1] = p.metrics.hr;
        } else if (activeType === 'o2') {
            activePatientTrendData.o2[activePatientTrendData.o2.length - 1] = p.metrics.spo2;
        } else if (activeType === 'bp') {
            try { activePatientTrendData.bp[activePatientTrendData.bp.length - 1] = parseInt(p.metrics.bp.split('/')[0]); } catch(e){}
        } else if (activeType === 'step') {
            activePatientTrendData.step[activePatientTrendData.step.length - 1] = p.metrics.steps;
        }
        
        // 局部重画与数据填报
        updateDetailModalData();
        drawDetailTrendSVG(activeType);
        
    }, 5000);
}

function closeRecordDetailModal() {
    const modal = document.getElementById('record-detail-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // 销毁 5s 详情微小扰动定时器 (防内存泄漏)
    if (detailPerturbationInterval) {
        clearInterval(detailPerturbationInterval);
        detailPerturbationInterval = null;
    }
    
    activePatientForDetail = null;
}

// 模拟生成 30天 波动生理趋势数据
function generatePatientTrendData(pat) {
    const seed = pat.id;
    const dataLen = 30;
    
    activePatientTrendData = {
        heart: Array.from({length: dataLen}, (_, i) => Math.round((pat.metrics.hr || 75) - 5 + Math.sin(i + seed) * 8 + Math.random() * 4)),
        o2: Array.from({length: dataLen}, (_, i) => Math.round((pat.metrics.spo2 || 98) - 1 + Math.sin(i*0.5 + seed) * 1 + Math.random() * 0.5)),
        bp: Array.from({length: dataLen}, (_, i) => {
            try {
                let sys = parseInt((pat.metrics.bp || "120/80").split('/')[0]);
                return Math.round(sys - 6 + Math.sin(i*0.8 + seed) * 10 + Math.random() * 5);
            } catch(e) { return 120; }
        }),
        step: Array.from({length: dataLen}, (_, i) => Math.round((pat.metrics.steps || 5000) * 0.7 + i * 150 + Math.sin(i + seed) * 300)),
        sleep: Array.from({length: dataLen}, (_, i) => parseFloat(((pat.metrics.sleep || 7) - 1 + Math.sin(i*0.3 + seed) * 1.5 + Math.random() * 0.6).toFixed(1)))
    };
    
    // 限制合理范围
    activePatientTrendData.o2 = activePatientTrendData.o2.map(v => Math.max(90, Math.min(100, v)));
    activePatientTrendData.heart = activePatientTrendData.heart.map(v => Math.max(50, Math.min(150, v)));
}

// 更新详情 Modal UI 数据
function updateDetailModalData() {
    const p = activePatientForDetail;
    if (!p) return;
    
    // B-1 核心资料
    const patName = document.getElementById('pat-name');
    const patPhone = document.getElementById('pat-phone');
    const patAge = document.getElementById('pat-age');
    const patBody = document.getElementById('pat-body');
    const patBmi = document.getElementById('pat-bmi');

    if (patName) patName.innerText = p.name;
    if (patPhone) patPhone.innerText = p.phone;
    
    let ageStr = "";
    if (p.age !== undefined) {
        if (typeof p.age === 'number') {
            ageStr = `${p.gender || ""} / ${p.age}岁`;
        } else {
            let cleanAge = String(p.age).replace('岁', '');
            ageStr = `${p.gender || ""} / ${cleanAge}岁`;
        }
    }
    if (patAge) patAge.innerText = ageStr;
    if (patBody) patBody.innerText = `${p.height || 0}cm / ${p.weight || 0}kg`;
    
    // 计算 BMI
    let bmiVal = 0;
    if (p.bmi !== undefined) {
        bmiVal = p.bmi;
    } else if (p.height && p.weight) {
        const hM = p.height / 100;
        bmiVal = parseFloat((p.weight / (hM * hM)).toFixed(2));
    }
    let bmiBadge = '<span class="bmi-badge bg-green">正常</span>';
    if (bmiVal >= 28) bmiBadge = '<span class="bmi-badge bg-red" style="background:#fee2e2; color:#b91c1c;">肥胖</span>';
    else if (bmiVal >= 24) bmiBadge = '<span class="bmi-badge bg-yellow" style="background:#fef9c3; color:#854d0e;">超重</span>';
    
    if (patBmi) patBmi.innerHTML = `${bmiVal} ${bmiBadge}`;
    
    // D 实时体征
    const hrVal = document.getElementById('det-hr');
    const hrStatus = document.getElementById('det-hr-status');
    const o2Val = document.getElementById('det-spo2');
    const o2Status = document.getElementById('det-spo2-status');
    const bpVal = document.getElementById('det-bp');
    const bpStatus = document.getElementById('det-bp-status');
    const stepsVal = document.getElementById('det-step');
    const stepsStatus = document.getElementById('det-step-status');
    const sleepVal = document.getElementById('det-sleep');
    const sleepStatus = document.getElementById('det-sleep-status');

    if (p.metrics) {
        if (hrVal) hrVal.innerText = p.metrics.hr || 0;
        if (hrStatus) {
            if (p.metrics.hr > 100) { hrStatus.innerText = "过快"; hrStatus.style.color = "var(--lvl-5)"; }
            else if (p.metrics.hr < 60) { hrStatus.innerText = "过缓"; hrStatus.style.color = "#eab308"; }
            else { hrStatus.innerText = "正常"; hrStatus.style.color = "#10b981"; }
        }
        
        if (o2Val) o2Val.innerText = p.metrics.spo2 || 0;
        if (o2Status) {
            if (p.metrics.spo2 < 95) { o2Status.innerText = "偏低"; o2Status.style.color = "var(--lvl-5)"; }
            else { o2Status.innerText = "正常"; o2Status.style.color = "#10b981"; }
        }
        
        if (bpVal) bpVal.innerText = p.metrics.bp || "120/80";
        if (bpStatus) {
            try {
                let sys = parseInt((p.metrics.bp || "120/80").split('/')[0]);
                if (sys > 140) { bpStatus.innerText = "偏高"; bpStatus.style.color = "var(--lvl-5)"; }
                else if (sys < 90) { bpStatus.innerText = "偏低"; bpStatus.style.color = "#eab308"; }
                else { bpStatus.innerText = "正常"; bpStatus.style.color = "#10b981"; }
            } catch(e){}
        }
        
        if (stepsVal) stepsVal.innerText = p.metrics.steps || 0;
        if (stepsStatus) {
            if (p.metrics.steps >= 6000) { stepsStatus.innerText = "达标"; stepsStatus.style.color = "#10b981"; }
            else { stepsStatus.innerText = "未达标"; stepsStatus.style.color = "#eab308"; }
        }

        if (sleepVal) sleepVal.innerText = p.metrics.sleep || 0;
        if (sleepStatus) {
            if (p.metrics.sleep >= 7) { sleepStatus.innerText = "充足"; sleepStatus.style.color = "#10b981"; }
            else { sleepStatus.innerText = "不足"; sleepStatus.style.color = "#eab308"; }
        }
    }
    
    // C-2 浮动标签与引线
    const floatHr = document.getElementById('detTagHeart');
    const floatSleep = document.getElementById('detTagSleep');
    const floatBp = document.getElementById('detTagBp');
    const floatO2 = document.getElementById('detTagO2');
    const floatStep = document.getElementById('detTagStep');

    if (p.metrics) {
        if (floatHr) floatHr.innerHTML = `<span class="tag-status-icon">❤️</span> 心率: ${p.metrics.hr}bpm`;
        if (floatSleep) floatSleep.innerHTML = `<span class="tag-status-icon">🛌</span> 睡眠: ${p.metrics.sleep}h`;
        if (floatBp) floatBp.innerHTML = `<span class="tag-status-icon">🩺</span> 血压: ${p.metrics.bp}`;
        if (floatO2) floatO2.innerHTML = `<span class="tag-status-icon">🩸</span> 血氧: ${p.metrics.spo2}%`;
        if (floatStep) floatStep.innerHTML = `<span class="tag-status-icon">🏃</span> 步数: ${p.metrics.steps}步`;
    }

    // 绘制虚线引线 (SVG)
    const pointerLineLayer = document.getElementById('pointerLineLayer');
    if (pointerLineLayer) {
        pointerLineLayer.innerHTML = `
            <!-- 心率 ➔ 心脏 -->
            <line x1="120" y1="108" x2="195" y2="108" stroke="rgba(239, 68, 68, 0.3)" stroke-width="1" stroke-dasharray="2,2"/>
            <!-- 睡眠 ➔ 头部 -->
            <line x1="280" y1="148" x2="200" y2="70" stroke="rgba(2, 132, 199, 0.3)" stroke-width="1" stroke-dasharray="2,2"/>
            <!-- 血压 ➔ 胃部 -->
            <line x1="110" y1="188" x2="198" y2="140" stroke="rgba(234, 179, 8, 0.3)" stroke-width="1" stroke-dasharray="2,2"/>
            <!-- 血氧 ➔ 肾脏 -->
            <line x1="270" y1="228" x2="210" y2="160" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" stroke-dasharray="2,2"/>
            <!-- 步数 ➔ 腿部 -->
            <line x1="120" y1="290" x2="190" y2="230" stroke="rgba(168, 85, 247, 0.3)" stroke-width="1" stroke-dasharray="2,2"/>
        `;
    }

    // C-4 总体评估 (兼顾 status 和 healthState)
    const generalStatus = document.getElementById('det-general-status');
    const generalStars = document.getElementById('det-general-stars');

    const statusVal = p.status || p.healthState || "健康";
    if (generalStatus) {
        if (statusVal === "风险" || statusVal === "risk") {
            generalStatus.innerText = "风险";
            generalStatus.style.color = "var(--lvl-5)";
            if (generalStars) generalStars.innerText = "★★☆☆☆ 风险较重";
        } else if (statusVal === "亚健康" || statusVal === "warning") {
            generalStatus.innerText = "亚健康";
            generalStatus.style.color = "#eab308";
            if (generalStars) generalStars.innerText = "★★★★☆ 气血受阻";
        } else {
            generalStatus.innerText = "正常";
            generalStatus.style.color = "#10b981";
            if (generalStars) generalStars.innerText = "★★★★★ 脏腑调和";
        }
    }

    // F 疾病预测百分比 (兼容 risks 和 riskScores)
    const detStroke = document.getElementById('det-risk-stroke');
    const detHeartfail = document.getElementById('det-risk-heartfail');
    const detChd = document.getElementById('det-risk-chd');
    const detAf = document.getElementById('det-risk-af');

    const fillStroke = document.getElementById('det-fill-stroke');
    const fillHeartfail = document.getElementById('det-fill-heartfail');
    const fillChd = document.getElementById('det-fill-chd');
    const fillAf = document.getElementById('det-fill-af');

    let strokeVal = "5.0%", heartfailVal = "3.0%", chdVal = "2.0%", afVal = "1.0%";
    if (p.risks) {
        strokeVal = p.risks.stroke || "5.0%";
        heartfailVal = p.risks.heartfail || "3.0%";
        chdVal = p.risks.chd || "2.0%";
        afVal = p.risks.af || "1.0%";
    } else if (p.riskScores) {
        const findScore = (name) => {
            const f = p.riskScores.find(item => item.disease.includes(name));
            return f ? `${f.rate}%` : "5.0%";
        };
        strokeVal = findScore("脑血管") || findScore("房颤") || "5.0%";
        heartfailVal = findScore("心力衰竭") || "3.0%";
        chdVal = findScore("冠心病") || "2.0%";
        afVal = findScore("房颤") || "1.0%";
    }

    if (detStroke) detStroke.innerText = strokeVal;
    if (detHeartfail) detHeartfail.innerText = heartfailVal;
    if (detChd) detChd.innerText = chdVal;
    if (detAf) detAf.innerText = afVal;

    if (fillStroke) { fillStroke.style.width = strokeVal; fillRiskColor(fillStroke, parseFloat(strokeVal)); }
    if (fillHeartfail) { fillHeartfail.style.width = heartfailVal; fillRiskColor(fillHeartfail, parseFloat(heartfailVal)); }
    if (fillChd) { fillChd.style.width = chdVal; fillRiskColor(fillChd, parseFloat(chdVal)); }
    if (fillAf) { fillAf.style.width = afVal; fillRiskColor(fillAf, parseFloat(afVal)); }

    // G 睡眠分析堆叠比例与大字时值
    const deepVal = document.getElementById('det-sleep-deep-val');
    const lightVal = document.getElementById('det-sleep-light-val');
    const awakeVal = document.getElementById('det-sleep-awake-val');

    const deepPct = document.getElementById('det-sleep-deep-pct');
    const lightPct = document.getElementById('det-sleep-light-pct');
    const awakePct = document.getElementById('det-sleep-awake-pct');

    if (deepVal && lightVal && awakeVal && p.metrics) {
        const totalSleep = p.metrics.sleep || 7;
        const deepH = (totalSleep * 0.38).toFixed(1);
        const lightH = (totalSleep * 0.47).toFixed(1);
        const awakeH = (totalSleep * 0.15).toFixed(1);

        deepVal.innerText = `${deepH}h`;
        lightVal.innerText = `${lightH}h`;
        awakeVal.innerText = `${awakeH}h`;

        if (deepPct) deepPct.style.width = "38%";
        if (lightPct) lightPct.style.width = "47%";
        if (awakePct) awakePct.style.width = "15%";
    }

    // H 24h 运动直方柱
    const motionBarsRow = document.getElementById('detMotionBarsRow');
    if (motionBarsRow) {
        const seedVal = p.id;
        const motionPattern = Array.from({length: 24}, (_, idx) => {
            if (idx >= 8 && idx <= 21) {
                return Math.round(50 + Math.sin(idx*0.7 + seedVal) * 40 + Math.random() * 10);
            }
            return Math.round(Math.random() * 5);
        });

        motionBarsRow.innerHTML = motionPattern.map(val => {
            return `<div class="motion-bar-col" style="height:${val}%;"></div>`;
        }).join('');
    }
}

// 依据概率大小上风险色彩
function fillRiskColor(element, val) {
    element.classList.remove('bg-green', 'bg-yellow', 'bg-red');
    if (val >= 60) element.classList.add('bg-red');
    else if (val >= 15) element.classList.add('bg-yellow');
    else element.classList.add('bg-green');
}

// 切换趋势图 Tab
function switchDetailTrend(type) {
    const tabs = document.querySelectorAll('.trends-tab-group .trend-tab');
    tabs.forEach(t => {
        t.classList.remove('active');
        if (t.getAttribute('data-type') === type) {
            t.classList.add('active');
        }
    });

    drawDetailTrendSVG(type);
}

// 动态重绘 SVG 走势图折线与渐变
function drawDetailTrendSVG(type) {
    const svg = document.getElementById('detailTrendSVG');
    if (!svg) return;
    
    const data = activePatientTrendData[type];
    if (!data) return;

    const width = 280;
    const height = 130;
    const padding = 20;

    const maxVal = Math.max(...data) * 1.15;
    const minVal = Math.min(...data) * 0.85;
    const range = maxVal - minVal || 1;

    // 计算 SVG 顶点的 xy 坐标
    const points = data.map((val, idx) => {
        const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
        return {x, y};
    });

    const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // 渐变投影底座
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    // 绘制 X/Y 轴与网格线
    const gridLines = `
        <!-- X底座线 -->
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(15,23,42,0.06)" stroke-width="1"/>
        <!-- 虚线网格 -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="rgba(15,23,42,0.03)" stroke-width="1" stroke-dasharray="2,2"/>
        <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="rgba(15,23,42,0.03)" stroke-width="1" stroke-dasharray="2,2"/>
    `;

    // 刻度单位文字
    let unitLabel = "次/分";
    if (type === 'sleep') unitLabel = "小时";
    if (type === 'o2') unitLabel = "%";
    if (type === 'bp') unitLabel = "mmHg";
    if (type === 'step') unitLabel = "步";

    const textLabels = `
        <text x="${padding}" y="${padding - 5}" font-size="8" fill="#94a3b8">${Math.round(maxVal)} ${unitLabel}</text>
        <text x="${padding}" y="${height - padding + 12}" font-size="8" fill="#94a3b8">30天前</text>
        <text x="${width - padding - 20}" y="${height - padding + 12}" font-size="8" fill="#94a3b8">今日</text>
    `;

    svg.innerHTML = `
        <defs>
            <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0.0"/>
            </linearGradient>
        </defs>
        ${gridLines}
        <!-- 渐变阴影区 -->
        <path d="${areaD}" fill="url(#detailGrad)"/>
        <!-- 趋势折线 -->
        <path d="${pathD}" fill="none" stroke="#0284c7" stroke-width="1.8"/>
        <!-- 最新今日指示点 -->
        <circle cx="${points[points.length-1].x}" cy="${points[points.length-1].y}" r="3.5" fill="#0284c7" stroke="#ffffff" stroke-width="1.2"/>
        ${textLabels}
    `;
}

// 8.4 绘制中医八维脏腑状况雷达图
function drawTcmRadar(pat) {
    const svg = document.getElementById('tcmRadarSVG');
    if (!svg) return;

    svg.innerHTML = ""; // 重置

    // 气血八维状况 (心、胃、肺、大肠、肾、脾、肝、小肠)
    const tcmKeys = ["心", "胃", "肺", "大肠", "肾", "脾", "肝", "小肠"];
    
    // 初始化基底数据
    let scores = [95, 90, 92, 88, 94, 91, 93, 95];
    const statusVal = pat.status || pat.healthState || "健康";
    if (statusVal === "亚健康" || statusVal === "warning") {
        scores = [85, 78, 82, 80, 84, 76, 80, 50]; // 小肠偏虚，脾胃偏弱
    } else if (statusVal === "风险" || statusVal === "risk") {
        scores = [62, 70, 68, 75, 58, 65, 55, 45]; // 心、肾偏虚，脉象血瘀
    }

    const cx = 70;
    const cy = 70;
    const maxRadius = 55;

    // 1. 绘制网格圈 (3层八边形网格)
    for (let r = 1; r <= 3; r++) {
        const curRadius = (r / 3) * maxRadius;
        const gridPoints = tcmKeys.map((_, i) => {
            const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
            const x = cx + Math.cos(angle) * curRadius;
            const y = cy + Math.sin(angle) * curRadius;
            return `${x},${y}`;
        }).join(' ');

        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", gridPoints);
        poly.setAttribute("fill", "none");
        poly.setAttribute("stroke", "rgba(15,23,42,0.04)");
        poly.setAttribute("stroke-width", "1");
        svg.appendChild(poly);
    }

    // 2. 绘制 8 个顶点的网格对角引线与文字
    tcmKeys.forEach((key, i) => {
        const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        const x = cx + Math.cos(angle) * maxRadius;
        const y = cy + Math.sin(angle) * maxRadius;

        // 引线
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", cx);
        line.setAttribute("y1", cy);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "rgba(15,23,42,0.03)");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);

        // 文字标注
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const txtX = cx + Math.cos(angle) * (maxRadius + 10);
        const txtY = cy + Math.sin(angle) * (maxRadius + 10);
        
        text.setAttribute("x", txtX);
        text.setAttribute("y", txtY + 3);
        text.setAttribute("font-size", "8");
        text.setAttribute("fill", "#64748b");
        text.setAttribute("text-anchor", "middle");
        text.textContent = key;
        svg.appendChild(text);
    });

    // 3. 动态计算病人的多边形气血健康分布
    const polyPoints = scores.map((score, i) => {
        const curRadius = (score / 100) * maxRadius;
        const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
        const x = cx + Math.cos(angle) * curRadius;
        const y = cy + Math.sin(angle) * curRadius;
        return `${x},${y}`;
    }).join(' ');

    const radarPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    radarPoly.setAttribute("points", polyPoints);
    const isRisk = statusVal === "风险" || statusVal === "risk";
    radarPoly.setAttribute("fill", isRisk ? "rgba(239, 68, 68, 0.25)" : "rgba(2, 132, 199, 0.25)");
    radarPoly.setAttribute("stroke", isRisk ? "#ef4444" : "#0284c7");
    radarPoly.setAttribute("stroke-width", "1.5");
    svg.appendChild(radarPoly);

    // 4. 右侧辨证诊断说明文字更新
    const diagTitle = document.getElementById('detTcmDiagTitle');
    const diagPulse = document.getElementById('detTcmDiagPulse');
    const diagSymptoms = document.getElementById('detTcmDiagSymptoms');

    const cleanTcmType = pat.tcmType || (pat.tcm ? pat.tcm.syndrome : "气血和平质");
    const cleanSymptoms = pat.tcm ? pat.tcm.symptoms : "正常无明显症状。";
    const cleanExplanation = pat.tcm ? pat.tcm.explanation : "脏腑气血运行周流。";

    if (diagTitle) {
        if (isRisk) {
            diagTitle.innerText = cleanTcmType;
            diagTitle.style.color = "var(--lvl-5)";
            if (diagPulse) diagPulse.innerText = cleanExplanation || "心肾不交，血行瘀滞。心脉突发不稳，脑部气血不畅。";
            if (diagSymptoms) diagSymptoms.innerText = `今日伴随：${cleanSymptoms || "心悸、突发胸闷、舌红有瘀点。"}`;
        } else if (statusVal === "亚健康" || statusVal === "warning") {
            diagTitle.innerText = `${cleanTcmType} (小肠虚热) 🟡`;
            diagTitle.style.color = "#eab308";
            if (diagPulse) diagPulse.innerText = cleanExplanation || "脉象虚滑，脾运失健，心火移热于小肠。";
            if (diagSymptoms) diagSymptoms.innerText = `日常伴随：${cleanSymptoms || "食欲不振、腹胀便秘、面色萎黄、倦怠无力。"}`;
        } else {
            diagTitle.innerText = "气血和平，脏腑调和 🟢";
            diagTitle.style.color = "#10b981";
            if (diagPulse) diagPulse.innerText = "脉象和缓，气血充盈，小肠化物正常，气机运行周流。";
            if (diagSymptoms) diagSymptoms.innerText = "日常状态：胃纳良好，大便通顺，精神饱满，睡眠香甜。";
        }
    }
}

// ==========================================================================
// 5. 个性化健康干预方案AI定制 (一键模板套用与下发归档)
// ==========================================================================

let currentEditingRecipeId = null;

function renderRecipesPanel() {
    // 1. 渲染方案的表格列表到 #recipes-list-tbody
    const tbody = document.getElementById('recipes-list-tbody');
    if (tbody) {
        tbody.innerHTML = '';
        if (recipesArchive.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px 0;">暂无开具的干预方案数据。</td></tr>`;
        } else {
            recipesArchive.forEach(recipe => {
                const pat = patients.find(p => p.id === recipe.patientId);
                const patName = pat ? pat.name : `未知居民(ID:${recipe.patientId})`;
                
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${recipe.title}</strong></td>
                        <td>${patName}</td>
                        <td title="${recipe.diet}">${clipText(recipe.diet, 20)}</td>
                        <td title="${recipe.sport}">${clipText(recipe.sport, 20)}</td>
                        <td title="${recipe.sleep}">${clipText(recipe.sleep, 20)}</td>
                        <td>${recipe.date}</td>
                        <td>
                            <div class="btn-group">
                                <button class="btn-mini btn-primary" onclick="openEditRecipeModal(${recipe.id})">编辑</button>
                                <button class="btn-mini btn-danger" onclick="deleteRecipe(${recipe.id})">删除</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    }

    // 2. 渲染弹窗中的居民下拉选择
    const select = document.getElementById('recp-patient-select');
    if (select) {
        select.innerHTML = '';
        patients.forEach(pat => {
            select.innerHTML += `<option value="${pat.id}">${pat.name} (${pat.healthState === 'risk' ? '🔴风险' : pat.healthState === 'warning' ? '🟡亚健康' : '🟢健康'})</option>`;
        });
    }

    // 3. 渲染弹窗中关联调理商品勾选框
    const container = document.getElementById('recp-goods-checkboxes');
    if (container) {
        container.innerHTML = '';
        if (products.length === 0) {
            container.innerHTML = `<span style="font-size:10px; color:var(--text-muted);">暂无机构商品库数据</span>`;
        } else {
            products.forEach(p => {
                container.innerHTML += `
                    <label class="checkbox-label" style="display:inline-flex; align-items:center; margin-right:10px; margin-bottom:5px; font-size:11px; cursor:pointer;">
                        <input type="checkbox" value="${p.id}" class="recp-goods-check" style="margin-right:4px;">
                        <span>[${p.category}] ${p.name} (单价: ¥${p.price})</span>
                    </label>
                `;
            });
        }
    }
}

// 辅助函数：裁剪过长文本
function clipText(text, maxLen) {
    if (!text) return '-';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

// 打开新增弹窗
function openAddRecipeModal() {
    currentEditingRecipeId = null;
    document.getElementById('recipe-modal-title').innerText = '个性化健康干预方案定制';
    
    // 清空表单
    document.getElementById('recp-title').value = '';
    document.getElementById('recp-diet').value = '';
    document.getElementById('recp-sport').value = '';
    document.getElementById('recp-sleep').value = '';
    document.getElementById('recp-advise').value = '';
    
    const select = document.getElementById('recp-patient-select');
    if (select) select.disabled = false;
    
    const checks = document.querySelectorAll('.recp-goods-check');
    checks.forEach(c => c.checked = false);
    
    const modal = document.getElementById('recipe-edit-modal');
    if (modal) modal.style.display = 'flex';
}

// 打开编辑弹窗
function openEditRecipeModal(id) {
    currentEditingRecipeId = id;
    document.getElementById('recipe-modal-title').innerText = '编辑健康干预方案';
    
    const recipe = recipesArchive.find(r => r.id === id);
    if (!recipe) {
        alert('未找到对应的干预方案数据！');
        return;
    }
    
    document.getElementById('recp-title').value = recipe.title;
    document.getElementById('recp-diet').value = recipe.diet;
    document.getElementById('recp-sport').value = recipe.sport;
    document.getElementById('recp-sleep').value = recipe.sleep;
    document.getElementById('recp-advise').value = recipe.advise || '';
    
    const select = document.getElementById('recp-patient-select');
    if (select) {
        select.value = recipe.patientId;
        select.disabled = true; // 编辑时不允许修改在管居民
    }
    
    // 自动勾选商品
    const checks = document.querySelectorAll('.recp-goods-check');
    checks.forEach(c => {
        if (recipe.goodsIds && recipe.goodsIds.includes(parseInt(c.value))) {
            c.checked = true;
        } else {
            c.checked = false;
        }
    });
    
    const modal = document.getElementById('recipe-edit-modal');
    if (modal) modal.style.display = 'flex';
}

// 关闭弹窗
function closeRecipeModal() {
    const modal = document.getElementById('recipe-edit-modal');
    if (modal) modal.style.display = 'none';
}

// 一键套用方案模板 (PRD 3.2.2)
function applyRecipeTemplate(id) {
    const tpl = recipeTemplates[id];
    if (tpl) {
        document.getElementById('recp-title').value = tpl.title;
        document.getElementById('recp-diet').value = tpl.diet;
        document.getElementById('recp-sport').value = tpl.sport;
        document.getElementById('recp-sleep').value = tpl.sleep;
        document.getElementById('recp-advise').value = tpl.advise;
        
        // 自动多选匹配关联的商品
        const checks = document.querySelectorAll('.recp-goods-check');
        checks.forEach(c => {
            // 简单模拟匹配
            if (id === 3 && c.value === '1') c.checked = true;
            else if (id === 1 && c.value === '2') c.checked = true;
            else c.checked = false;
        });

        showGlobalNotification('方案模板核心条目及中西医医嘱已成功套用填入！');
    }
}

// 提交方案（新增或编辑）
function submitHealthRecipe() {
    const patId = parseInt(document.getElementById('recp-patient-select').value);
    const title = document.getElementById('recp-title').value.trim();
    const diet = document.getElementById('recp-diet').value.trim();
    const sport = document.getElementById('recp-sport').value.trim();
    const sleep = document.getElementById('recp-sleep').value.trim();
    const advise = document.getElementById('recp-advise').value.trim();
    
    if (isNaN(patId) || !title || !diet || !sport || !sleep) {
        alert('请填入干预方案的完整建议条目（方案名称、食疗、运动、起居睡眠为必填）！');
        return;
    }
    
    // 收集选中的商品ID
    const goodsIds = [];
    const checks = document.querySelectorAll('.recp-goods-check');
    checks.forEach(c => {
        if (c.checked) {
            goodsIds.push(parseInt(c.value));
        }
    });
    
    const today = new Date().toISOString().substring(0, 10);
    
    if (currentEditingRecipeId) {
        // 编辑状态
        const recipeIdx = recipesArchive.findIndex(r => r.id === currentEditingRecipeId);
        if (recipeIdx > -1) {
            recipesArchive[recipeIdx].title = title;
            recipesArchive[recipeIdx].diet = diet;
            recipesArchive[recipeIdx].sport = sport;
            recipesArchive[recipeIdx].sleep = sleep;
            recipesArchive[recipeIdx].advise = advise || '无特殊医嘱';
            recipesArchive[recipeIdx].goodsIds = goodsIds;
        }
        showGlobalNotification(`方案 [${title}] 修改成功！`);
    } else {
        // 新增状态
        const newRecipe = {
            id: Date.now(),
            patientId: patId,
            title: title,
            date: today,
            diet: diet,
            sport: sport,
            sleep: sleep,
            advise: advise || '无特殊医嘱',
            goodsIds: goodsIds
        };
        recipesArchive.push(newRecipe);
        showGlobalNotification(`个性化方案 [${title}] 下发成功！干预方案卡片已同步归档入患者档案历史中！`);
    }
    
    saveToLocalStorage();
    closeRecipeModal();
    renderRecipesPanel();
    renderPatientsPanel();
}

// 删除方案
function deleteRecipe(id) {
    if (confirm('确定要删除这套干预方案吗？')) {
        recipesArchive = recipesArchive.filter(r => r.id !== id);
        saveToLocalStorage();
        renderRecipesPanel();
        renderPatientsPanel();
        showGlobalNotification('干预方案已删除！');
    }
}

// ==========================================================================
// 6. 医生个人账号安全设置 (PRD 3.5)
// ==========================================================================

function renderAccountPanel() {
    // 重置旧手机安全两步验证显示
    document.getElementById('phone-step-1').style.display = 'block';
    document.getElementById('phone-step-2').style.display = 'none';
    
    document.getElementById('oldCodeInput').value = '';
    document.getElementById('newPhoneInput').value = '';
    document.getElementById('newCodeInput').value = '';
    
    document.getElementById('currentBindPhone').innerText = maskPhone(docProfile.phone);
}

function maskPhone(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// 第一步：向原手机发送验证码
let oldSmsCountdown = 0;
let oldSmsTimer = null;
function sendOldPhoneSms() {
    alert(`【安全提示】验证码已向原绑定手机 ${docProfile.phone} 发送，身份核验验证码为：654321`);
    
    oldSmsCountdown = 60;
    const btn = document.getElementById('oldSmsBtn');
    btn.disabled = true;
    btn.innerText = `${oldSmsCountdown}s`;
    
    oldSmsTimer = setInterval(() => {
        oldSmsCountdown--;
        if (oldSmsCountdown <= 0) {
            clearInterval(oldSmsTimer);
            btn.disabled = false;
            btn.innerText = '获取验证码';
        } else {
            btn.innerText = `${oldSmsCountdown}s`;
        }
    }, 1000);
}

function nextPhoneStep() {
    const code = document.getElementById('oldCodeInput').value.trim();
    if (code !== '654321') {
        alert('原手机号身份验证码不正确！模拟验证码为: 654321');
        return;
    }
    
    // 清除定时器
    if (oldSmsTimer) {
        clearInterval(oldSmsTimer);
        const btn = document.getElementById('oldSmsBtn');
        btn.disabled = false;
        btn.innerText = '获取验证码';
    }
    
    document.getElementById('phone-step-1').style.display = 'none';
    document.getElementById('phone-step-2').style.display = 'block';
    showGlobalNotification('身份验证核验通过，请输入新绑定手机号！');
}

// 第二步：向新手机发送验证码
let newSmsCountdown = 0;
let newSmsTimer = null;
function sendNewPhoneSms() {
    const newPhone = document.getElementById('newPhoneInput').value.trim();
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('请输入合法的11位新手机号！');
        return;
    }
    if (newPhone === docProfile.phone) {
        alert('新手机号不能与原手机号相同！');
        return;
    }
    
    alert(`【系统模拟】验证码已向新手机 ${newPhone} 发送，绑定验证码为：123456`);
    
    newSmsCountdown = 60;
    const btn = document.getElementById('newSmsBtn');
    btn.disabled = true;
    btn.innerText = `${newSmsCountdown}s`;
    
    newSmsTimer = setInterval(() => {
        newSmsCountdown--;
        if (newSmsCountdown <= 0) {
            clearInterval(newSmsTimer);
            btn.disabled = false;
            btn.innerText = '获取验证码';
        } else {
            btn.innerText = `${newSmsCountdown}s`;
        }
    }, 1000);
}

function submitPhoneChange() {
    const newPhone = document.getElementById('newPhoneInput').value.trim();
    const code = document.getElementById('newCodeInput').value.trim();
    
    if (!/^1[3-9]\d{9}$/.test(newPhone)) {
        alert('请输入合法的11位新手机号！');
        return;
    }
    if (code !== '123456') {
        alert('绑定验证码错误！模拟验证码为: 123456');
        return;
    }
    
    docProfile.phone = newPhone;
    saveToLocalStorage();
    renderAccountPanel();
    showGlobalNotification('手机号双向安全换绑成功！');
}

// 修改密码并强退
function submitPasswordChange() {
    const oldP = document.getElementById('oldPassword').value;
    const newP = document.getElementById('newPassword').value;
    const confirmP = document.getElementById('confirmPassword').value;
    
    if (oldP !== docProfile.password) {
        alert('原登录密码错误！默认密码为 admin');
        return;
    }
    // 复杂度要求 (PRD 3.5.2)
    const complexRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!complexRegex.test(newP)) {
        alert('新密码复杂度不足！必须至少8位，包含大写字母、小写字母、数字及特殊符号！');
        return;
    }
    if (newP !== confirmP) {
        alert('两次输入的密码不一致！');
        return;
    }
    
    docProfile.password = newP;
    saveToLocalStorage();
    
    alert('【安全策略】密码修改成功！系统立即使 Token 失效，强制退回登录页重新认证！');
    
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ==========================================================================
// 7. 浮动提示通知气泡
// ==========================================================================

function showGlobalNotification(text) {
    const noti = document.getElementById('doc-notification');
    if (!noti) return;
    
    noti.innerText = text;
    noti.classList.add('active');
    
    setTimeout(() => {
        noti.classList.remove('active');
    }, 3200);
}
