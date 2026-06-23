/* ==========================================================================
   机构端运营后台 - 逻辑控制系统 (institution.js)
   ========================================================================== */

// ==========================================================================
// 1. 初始化 Mock 核心数据库 (采用内存与 localStorage 联动实现跨页面一致性)
// ==========================================================================

let doctorsApproval = [
    {
        id: 101,
        name: '张景岳',
        hospital: '本院治未病中心',
        dept: '中医心血管科',
        title: '主任医师',
        license: 'TCM10984920492',
        tags: '失眠多梦; 脾胃调理',
        desc: '擅长结合智能手表连续生理数据开展心脑血管疾病前置筛查，及中西医结合动态干预。',
        status: 'approved', // 'pending', 'approved', 'rejected', 'disabled'
        rejectReason: '',
        timestamp: 1781600000000,
        roleType: 'doctor'
    },
    {
        id: 102,
        name: '李时珍',
        hospital: '岐黄中医药研究院',
        dept: '本草调养科',
        title: '副主任医师',
        license: 'TCM10849204918',
        tags: '经方调理; 体质调理; 亚健康调理',
        desc: '精通九种体质分型识别，擅长个性化药膳代用茶调制、节气调养与生活方式指导。',
        status: 'approved',
        rejectReason: '',
        timestamp: 1781610000000,
        roleType: 'doctor'
    },
    {
        id: 103,
        name: '扁鹊',
        hospital: '神医国医馆',
        dept: '气血调理科',
        title: '主治医师',
        license: 'TCM10395829104',
        tags: '慢病管理; 体质调理',
        desc: '擅长脉诊与经络望诊，开展体质调理。',
        status: 'pending',
        rejectReason: '',
        timestamp: 1781660000000,
        roleType: 'doctor'
    },
    {
        id: 201,
        name: '陈客服',
        phone: '13911112222',
        hospital: '-',
        dept: '-',
        title: '健康客服',
        license: '客服免执业编号',
        tags: '服务引导',
        desc: '初始系统客服',
        status: 'approved',
        rejectReason: '',
        timestamp: 1781600000000,
        roleType: 'staff'
    }
];

const SVG_ICONS = {
    tea: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f0fdf4'/><path d='M30 40 h35 v25 a15 15 0 0 1 -15 15 h-5 a15 15 0 0 1 -15 -15 z' fill='none' stroke='%2316a34a' stroke-width='4'/><path d='M65 45 h8 a6 6 0 0 1 6 6 v4 a6 6 0 0 1 -6 6 h-8' fill='none' stroke='%2316a34a' stroke-width='4'/><path d='M38 25 q3 -5 0 -10 M48 25 q3 -5 0 -10 M58 25 q3 -5 0 -10' fill='none' stroke='%2316a34a' stroke-width='3' stroke-linecap='round'/></svg>",
    meal: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23fff7ed'/><path d='M20 50 a30 30 0 0 0 60 0 z' fill='none' stroke='%23ea580c' stroke-width='4'/><line x1='15' y1='50' x2='85' y2='50' stroke='%23ea580c' stroke-width='4' stroke-linecap='round'/><path d='M35 35 q5 -10 10 -5 t10 -5 t10 -5' fill='none' stroke='%23ea580c' stroke-width='3' stroke-linecap='round'/></svg>",
    gel: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23faf5ff'/><rect x='30' y='30' width='40' height='45' rx='6' fill='none' stroke='%239333ea' stroke-width='4'/><rect x='25' y='22' width='50' height='8' rx='2' fill='%239333ea'/><circle cx='50' cy='52' r='8' fill='none' stroke='%239333ea' stroke-width='3'/></svg>",
    foot: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23eff6ff'/><path d='M25 30 h50 v40 a10 10 0 0 1 -10 10 h-30 a10 10 0 0 1 -10 -10 z' fill='none' stroke='%232563eb' stroke-width='4'/><path d='M35 45 h30 M35 55 h30 M35 65 h30' fill='none' stroke='%232563eb' stroke-width='3' stroke-linecap='round'/></svg>",
    watch: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f0f9ff'/><rect x='30' y='30' width='40' height='40' rx='10' fill='none' stroke='%230284c7' stroke-width='4'/><path d='M40 30 v-15 h20 v15 M40 70 v15 h20 v-15' fill='none' stroke='%230284c7' stroke-width='4' stroke-linecap='round'/><circle cx='50' cy='50' r='10' fill='none' stroke='%230284c7' stroke-width='3'/></svg>",
    charger: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f8fafc'/><circle cx='50' cy='50' r='25' fill='none' stroke='%23475569' stroke-width='4'/><path d='M40 50 h20 M50 40 v20' fill='none' stroke='%23475569' stroke-width='4' stroke-linecap='round'/></svg>",
    package_1: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23fee2e2'/><path d='M12 35 a15 15 0 0 1 30 0 c0 15 -25 35 -30 40 c-5 -5 -30 -25 -30 -40 a15 15 0 0 1 30 0 z' transform='translate(10,5)' fill='none' stroke='%23dc2626' stroke-width='4' stroke-linejoin='round'/><path d='M40 55 l8 8 l16 -16' fill='none' stroke='%23dc2626' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>",
    package_2: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23e0f2fe'/><path d='M30 30 q20 -10 30 10 t-10 30 t-30 -10 z' fill='none' stroke='%230284c7' stroke-width='4'/><path d='M65 40 a15 15 0 1 1 -20 20 a22 22 0 0 0 20 -20 z' fill='%230284c7'/></svg>",
    package_default: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f1f5f9'/><rect x='25' y='25' width='50' height='50' rx='8' fill='none' stroke='%2364748b' stroke-width='4'/><path d='M35 40 h30 M35 50 h30 M35 60 h20' fill='none' stroke='%2364748b' stroke-width='3' stroke-linecap='round'/></svg>",
    product_default: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' rx='12' fill='%23f1f5f9'/><path d='M30 30 h40 v40 h-40 z' fill='none' stroke='%2364748b' stroke-width='4'/><path d='M25 30 l25 -15 l25 15' fill='none' stroke='%2364748b' stroke-width='4' stroke-linejoin='round'/></svg>"
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

let packages = [
    {
        id: 11,
        name: '心血管气脉多维主动健康调理包',
        price: 999.00,
        period: 90,
        chatLimit: 99,
        alertLimit: 10,
        quota: 30,
        associatedGoods: [1, 3, 5],
        status: 'published',
        image: SVG_ICONS.package_1
    },
    {
        id: 12,
        name: '脾胃虚弱湿热消减节气轻调理包',
        price: 399.00,
        period: 30,
        chatLimit: 20,
        alertLimit: 3,
        quota: 50,
        associatedGoods: [2, 4],
        status: 'published',
        image: SVG_ICONS.package_2
    }
];

let banners = [
    { id: 301, title: '仲夏清脾祛湿专题指南', linkType: 'external', linkVal: 'https://activehealth.org/summer', order: 1, status: 'ON' },
    { id: 302, title: '国医名师张景岳心血管调理预约', linkType: 'doctor', linkVal: '101', order: 2, status: 'ON' }
];

let recommends = [
    { doctorId: 101, name: '张景岳', intro: '心血管气脉调理带头人', weight: 95 },
    { doctorId: 102, name: '李时珍', intro: '本草纲目本草调养权威专家', weight: 90 },
    { doctorId: 103, name: '叶天士', intro: '温病学派创始人，擅治疑难杂症', weight: 85 },
    { doctorId: 104, name: '张仲景', intro: '伤寒杂病经方调理大师', weight: 88 }
];

let patients = [
    {
        id: 501,
        name: '王小明',
        phone: '138****8888',
        gender: '男',
        age: '32岁',
        height: 175,
        weight: 74,
        bmi: 24.16,
        healthState: 'warning', // 'normal', 'warning', 'risk'
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
        gender: '男',
        age: '45岁',
        height: 170,
        weight: 65,
        bmi: 22.49,
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
        gender: '男',
        age: '58岁',
        height: 168,
        weight: 82,
        bmi: 29.05,
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
        gender: '男',
        age: '62岁',
        height: 172,
        weight: 78,
        bmi: 26.36,
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
        gender: '女',
        age: '50岁',
        height: 160,
        weight: 58,
        bmi: 22.66,
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
        gender: '男',
        age: '28岁',
        height: 180,
        weight: 72,
        bmi: 22.22,
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
];

let radarAlarms = [
    { id: 401, level: 'danger', time: '刚刚', name: '赵*四', type: '脑血管风险高危', value: '脑血管风险系数 82%', doctor: '张景岳', state: 'pending' },
    { id: 402, level: 'danger', time: '5分钟前', name: '王小明', type: '情绪压力风险高危', value: '压力负荷偏高 75%', doctor: '张景岳', state: 'pending' },
    { id: 403, level: 'danger', time: '12分钟前', name: '李*华', type: '睡眠风险高危', value: '严重睡眠剥夺 5.2h', doctor: '李时珍', state: 'pending' }
];

let doctorsOnDuty = [
    { id: 101, name: '张景岳', dept: '中医心血管科', status: '忙碌', alarmCount: 1, limit: '28 / 30' },
    { id: 102, name: '李时珍', dept: '本草调养科', status: '在线', alarmCount: 0, limit: '15 / 50' }
];

let performance = [
    { name: '张景岳', count: 48, recipeCount: 38, avgResponse: 3.5, score: 4.8 },
    { name: '李时珍', count: 32, recipeCount: 29, avgResponse: 5.2, score: 4.9 },
    { name: '叶天士', count: 55, recipeCount: 45, avgResponse: 2.8, score: 4.9 },
    { name: '扁鹊', count: 62, recipeCount: 50, avgResponse: 1.5, score: 5.0 },
    { name: '华佗', count: 40, recipeCount: 35, avgResponse: 4.2, score: 4.7 },
    { name: '孙思邈', count: 50, recipeCount: 48, avgResponse: 3.1, score: 4.9 },
    { name: '葛洪', count: 28, recipeCount: 20, avgResponse: 6.0, score: 4.6 },
    { name: '朱丹溪', count: 35, recipeCount: 30, avgResponse: 4.5, score: 4.7 },
    { name: '刘完素', count: 30, recipeCount: 25, avgResponse: 5.0, score: 4.8 },
    { name: '张仲景', count: 58, recipeCount: 52, avgResponse: 2.1, score: 5.0 }
];

let chatAudit = [
    { time: '10:15', info: '张景岳 ➔ 王小明 (预警随访)', count: 24, delay: '1.2 分钟' },
    { time: '09:42', info: '李时珍 ➔ 李国强 (睡眠调养指导)', count: 18, delay: '3.5 分钟' },
    { time: '09:10', info: '叶天士 ➔ 张美玲 (脑血管风险防范)', count: 32, delay: '2.1 分钟' },
    { time: '08:55', info: '扁鹊 ➔ 赵铁柱 (高血压用药复核)', count: 15, delay: '0.8 分钟' },
    { time: '08:30', info: '孙思邈 ➔ 钱大叔 (节气饮食建议)', count: 20, delay: '1.5 分钟' },
    { time: '昨日 17:20', info: '华佗 ➔ 孙阿姨 (术后康复打卡)', count: 28, delay: '4.0 分钟' },
    { time: '昨日 16:05', info: '朱丹溪 ➔ 周丽华 (滋阴降火方案反馈)', count: 12, delay: '2.5 分钟' },
    { time: '昨日 14:40', info: '刘完素 ➔ 吴少平 (情绪压力疏导)', count: 22, delay: '3.0 分钟' },
    { time: '昨日 11:15', info: '张仲景 ➔ 郑大爷 (伤寒调护复诊)', count: 40, delay: '1.8 分钟' },
    { time: '昨日 09:30', info: '葛洪 ➔ 冯大哥 (辟谷食疗咨询)', count: 8, delay: '5.2 分钟' }
];

// ==========================================================================
// 2. 界面初始化与路由事件切换
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 从 localStorage 加载潜在的状态同步
    loadFromLocalStorage();
    
    // 初始化主面板路由事件
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

    // 默认执行第一个面板的渲染
    switchPanel('approval-audit');
});

// 面板切换路由器
function switchPanel(panelId) {
    // 隐藏所有面板
    const panels = document.querySelectorAll('.view-panel');
    panels.forEach(p => p.classList.remove('active'));
    
    // 展示目标面板
    const target = document.getElementById(`panel-${panelId}`);
    if (target) target.classList.add('active');
    
    // 修改头部标题
    const titleMap = {
        'approval-audit': '入驻资质审批',
        'patient-records': '在管用户档案',
        'package-config': '收费服务包配置',
        'goods-management': '调理商品管理',
        'cms-banner': '首屏广告投放 (CMS)',
        'cms-doctor': '推荐专家设置 (CMS)',
        'report-radar': '风险预警雷达',
        'report-audit': '医患沟通审计',
        'report-performance': '医生绩效报表'
    };
    document.getElementById('current-panel-title').innerText = titleMap[panelId] || '管理后台';
    
    // 执行面板对应的专用数据渲染
    if (panelId === 'approval-audit') renderApprovalList();
    if (panelId === 'patient-records') renderRecordsPanel();
    if (panelId === 'package-config' || panelId === 'goods-management') renderProductAndPackages();
    if (panelId === 'cms-banner' || panelId === 'cms-doctor') renderCMSPanel();
    if (panelId === 'report-radar' || panelId === 'report-audit' || panelId === 'report-performance') renderReportsPanel();
}

// 保存/加载持久化状态，以备跨页面演练使用
function saveToLocalStorage() {
    localStorage.setItem('doctorsApproval', JSON.stringify(doctorsApproval));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('packages', JSON.stringify(packages));
    localStorage.setItem('banners', JSON.stringify(banners));
    localStorage.setItem('recommends', JSON.stringify(recommends));
    localStorage.setItem('radarAlarms', JSON.stringify(radarAlarms));
    localStorage.setItem('patients', JSON.stringify(patients));
}

function loadFromLocalStorage() {
    if (localStorage.getItem('doctorsApproval')) doctorsApproval = JSON.parse(localStorage.getItem('doctorsApproval'));
    
    if (localStorage.getItem('products')) {
        let localProducts = JSON.parse(localStorage.getItem('products'));
        if (localProducts.length < 10 || !localProducts[0].hasOwnProperty('image')) {
            localStorage.setItem('products', JSON.stringify(products));
        } else {
            products = localProducts;
        }
    } else {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    if (localStorage.getItem('packages')) {
        let localPackages = JSON.parse(localStorage.getItem('packages'));
        if (localPackages.length === 0 || !localPackages[0].hasOwnProperty('image')) {
            localStorage.setItem('packages', JSON.stringify(packages));
        } else {
            packages = localPackages;
        }
    } else {
        localStorage.setItem('packages', JSON.stringify(packages));
    }
    
    if (localStorage.getItem('banners')) banners = JSON.parse(localStorage.getItem('banners'));
    if (localStorage.getItem('recommends')) recommends = JSON.parse(localStorage.getItem('recommends'));
    if (localStorage.getItem('radarAlarms')) radarAlarms = JSON.parse(localStorage.getItem('radarAlarms'));
    if (localStorage.getItem('patients')) patients = JSON.parse(localStorage.getItem('patients'));
}

// ==========================================================================
// 3. 医生入驻审批逻辑
// ==========================================================================

let currentApprovalTab = 'doctor';

function switchApprovalTab(type) {
    currentApprovalTab = type;
    
    const docBtn = document.getElementById('btn-tab-approval-doc');
    const staffBtn = document.getElementById('btn-tab-approval-staff');
    const docBox = document.getElementById('doctor-approval-table-box');
    const staffBox = document.getElementById('staff-approval-table-box');
    const deptFilter = document.getElementById('filter-dept-group');
    const statusFilter = document.getElementById('filter-status-group');
    
    if (type === 'doctor') {
        if (docBtn) docBtn.className = 'tab-btn active';
        if (staffBtn) staffBtn.className = 'tab-btn';
        if (docBox) docBox.style.display = 'block';
        if (staffBox) staffBox.style.display = 'none';
        if (deptFilter) deptFilter.style.display = 'flex';
        if (statusFilter) statusFilter.style.display = 'flex';
        document.getElementById('approval-table-title').innerText = '待审批名医及专家资质提报表';
    } else {
        if (docBtn) docBtn.className = 'tab-btn';
        if (staffBtn) staffBtn.className = 'tab-btn active';
        if (docBox) docBox.style.display = 'none';
        if (staffBox) staffBox.style.display = 'block';
        if (deptFilter) deptFilter.style.display = 'none';
        if (statusFilter) statusFilter.style.display = 'none';
        document.getElementById('approval-table-title').innerText = '健康客服账号管理表';
    }
    
    renderApprovalList();
}

function renderApprovalList() {
    const searchName = document.getElementById('searchApprovalName')?.value.trim().toLowerCase() || '';
    const statusFilter = document.getElementById('filterApprovalStatus')?.value || 'all';
    
    if (currentApprovalTab === 'doctor') {
        const tbody = document.getElementById('approval-list-doc');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const deptFilterVal = document.getElementById('filterApprovalDept')?.value || 'all';
        
        const filteredDocs = doctorsApproval.filter(doc => {
            const isDoc = doc.roleType !== 'staff';
            const matchesName = doc.name.toLowerCase().includes(searchName);
            const matchesDept = deptFilterVal === 'all' || doc.dept === deptFilterVal;
            const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
            return isDoc && matchesName && matchesDept && matchesStatus;
        });
        
        filteredDocs.forEach(doc => {
            let statusBadge = '';
            if (doc.status === 'pending') statusBadge = '<span class="badge badge-warning">待审核</span>';
            else if (doc.status === 'approved') statusBadge = '<span class="badge badge-success">已激活</span>';
            else if (doc.status === 'rejected') statusBadge = `<span class="badge badge-danger" title="驳回原因：${doc.rejectReason}">已驳回</span>`;
            else if (doc.status === 'disabled') statusBadge = '<span class="badge badge-muted">已禁用</span>';
            
            let switchHtml = '-';
            let actionHtml = '';
            
            if (doc.status === 'pending') {
                actionHtml = `
                    <button class="btn-mini-success" onclick="approveDoctor(${doc.id})">通过</button>
                    <button class="btn-mini-danger" onclick="openRejectModal(${doc.id})">驳回</button>
                `;
            } else {
                const isChecked = doc.status === 'approved' ? 'checked' : '';
                switchHtml = `
                    <div class="switch-container" onclick="toggleDoctorActive(${doc.id}, event)">
                        <input type="checkbox" class="switch-input" ${isChecked}>
                        <label class="switch-label"></label>
                        <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${doc.status === 'approved' ? '已启用' : '已禁用'}</span>
                    </div>
                `;
                actionHtml = `<button class="btn-mini-danger" onclick="deleteApproval(${doc.id})">删除</button>`;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="pat-avatar-circle" style="width:28px; height:28px; font-size:11px; border-color:var(--border-color);">${doc.name.charAt(0)}</div>
                        <strong>${doc.name}</strong>
                    </div>
                </td>
                <td>${doc.hospital}<br><span style="font-size:10px; color:var(--text-secondary);">${doc.dept}</span></td>
                <td>${doc.title}</td>
                <td><code style="color:var(--accent);">${doc.license}</code></td>
                <td>
                    <span class="badge badge-muted">${doc.tags.split(';').join('</span> <span class="badge badge-muted">')}</span>
                </td>
                <td>${statusBadge}</td>
                <td>${switchHtml}</td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        const tbody = document.getElementById('approval-list-staff');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const filteredStaff = doctorsApproval.filter(doc => {
            const isStaff = doc.roleType === 'staff';
            const matchesName = doc.name.toLowerCase().includes(searchName);
            return isStaff && matchesName;
        });
        
        filteredStaff.forEach(staff => {
            const isChecked = staff.status === 'approved' ? 'checked' : '';
            const switchHtml = `
                <div class="switch-container" onclick="toggleDoctorActive(${staff.id}, event)">
                    <input type="checkbox" class="switch-input" ${isChecked}>
                    <label class="switch-label"></label>
                    <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${staff.status === 'approved' ? '已启用' : '已禁用'}</span>
                </div>
            `;
            const actionHtml = `<button class="btn-mini-danger" onclick="deleteApproval(${staff.id})">删除</button>`;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <div class="pat-avatar-circle" style="width:28px; height:28px; font-size:11px; border-color:var(--border-color); background:rgba(0,240,255,0.05); color:var(--accent);">${staff.name.charAt(0)}</div>
                        <strong>${staff.name}</strong>
                    </div>
                </td>
                <td><code>${staff.phone || '-'}</code></td>
                <td><span class="badge badge-success">${staff.title}</span></td>
                <td>${switchHtml}</td>
                <td>${actionHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function filterApprovalList() {
    renderApprovalList();
}

function deleteApproval(id) {
    if (confirm('确定要删除此资质提报记录/账号吗？')) {
        doctorsApproval = doctorsApproval.filter(doc => doc.id !== id);
        saveToLocalStorage();
        renderApprovalList();
        showGlobalNotification('记录已被成功删除。');
    }
}

function approveDoctor(id) {
    const doc = doctorsApproval.find(d => d.id === id);
    if (doc) {
        doc.status = 'approved';
        doc.timestamp = Date.now();
        saveToLocalStorage();
        renderApprovalList();
        showGlobalNotification(`提报 ${doc.name} 的申请已审批通过，已成功激活！`);
    }
}

let currentRejectingDocId = null;
function openRejectModal(id) {
    currentRejectingDocId = id;
    document.getElementById('reject-modal').classList.add('active');
    document.getElementById('reject-reason-input').value = '';
}

function closeRejectModal() {
    document.getElementById('reject-modal').classList.remove('active');
}

function submitRejectApproval() {
    const reason = document.getElementById('reject-reason-input').value.trim();
    if (!reason) {
        alert('请输入具体的驳回原因！');
        return;
    }
    const doc = doctorsApproval.find(d => d.id === currentRejectingDocId);
    if (doc) {
        doc.status = 'rejected';
        doc.rejectReason = reason;
        saveToLocalStorage();
        closeRejectModal();
        renderApprovalList();
        showGlobalNotification(`已驳回 ${doc.name} 的资质提报。`);
    }
}

function toggleDoctorActive(id, event) {
    event.preventDefault();
    const doc = doctorsApproval.find(d => d.id === id);
    if (doc) {
        doc.status = doc.status === 'approved' ? 'disabled' : 'approved';
        saveToLocalStorage();
        renderApprovalList();
        showGlobalNotification(`已成功切换 ${doc.name} 的在岗状态为: ${doc.status === 'approved' ? '启用' : '禁用'}`);
    }
}

function openAddStaffModal() {
    document.getElementById('staff-modal').classList.add('active');
    document.getElementById('staff-name').value = '';
    document.getElementById('staff-phone').value = '';
}

function closeAddStaffModal() {
    document.getElementById('staff-modal').classList.remove('active');
}

function closeAddPackageModal() {
    document.getElementById('package-modal').classList.remove('active');
}

function closeAddProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

function submitAddStaff() {
    const name = document.getElementById('staff-name').value.trim();
    const phone = document.getElementById('staff-phone').value.trim();
    
    if (!name || !phone) {
        alert('客服姓名及联系方式不能为空！');
        return;
    }
    
    const newStaff = {
        id: Date.now(),
        name: name,
        phone: phone,
        roleType: 'staff',
        hospital: '-',
        dept: '-',
        title: '健康客服',
        license: '客服免执业编号',
        tags: '服务引导',
        desc: '运营后台手动录入创建的客服人员。',
        status: 'approved',
        rejectReason: '',
        timestamp: Date.now()
    };
    
    doctorsApproval.push(newStaff);
    saveToLocalStorage();
    closeAddStaffModal();
    renderApprovalList();
    showGlobalNotification(`客服 ${name} 的账号已成功创建并分配角色！`);
}

// ==========================================================================
// 4. 服务商品化配置与库存售罄联动 (PRD 2.2)
// ==========================================================================

let currentEditingProductId = null;
let currentEditingPackageId = null;

function renderProductAndPackages() {
    // 1. 渲染商品配置表
    const prodTbody = document.getElementById('product-list-tbody');
    if (prodTbody) {
        prodTbody.innerHTML = '';
        
        const searchName = document.getElementById('searchProductInput')?.value.trim().toLowerCase() || '';
        const catFilter = document.getElementById('filterProductCat')?.value || 'all';
        const stockFilter = document.getElementById('filterProductStock')?.value || 'all';
        
        const filteredProds = products.filter(p => {
            const matchesName = p.name.toLowerCase().includes(searchName);
            const matchesCat = catFilter === 'all' || p.category === catFilter;
            
            let matchesStock = true;
            if (stockFilter === 'sufficient') {
                matchesStock = p.stock > p.threshold;
            } else if (stockFilter === 'warning') {
                matchesStock = p.stock > 0 && p.stock <= p.threshold;
            } else if (stockFilter === 'empty') {
                matchesStock = p.stock === 0;
            }
            return matchesName && matchesCat && matchesStock;
        });
        
        filteredProds.forEach(p => {
            const isOutOfStock = p.stock === 0;
            const isWarning = p.stock > 0 && p.stock <= p.threshold;
            
            let stockBadge = '<span class="badge badge-success">充足</span>';
            if (isOutOfStock) {
                stockBadge = '<span class="badge badge-danger">已售罄</span>';
            } else if (isWarning) {
                stockBadge = '<span class="badge badge-warning">库存紧张</span>';
            }
            
            if (!p.status) p.status = 'published';
            const statusBadge = p.status === 'published' ? '<span class="badge badge-success">销售中</span>' : '<span class="badge badge-muted">停售中</span>';
            const isChecked = p.status === 'published' ? 'checked' : '';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${p.image || SVG_ICONS.product_default}" style="width:32px; height:32px; border-radius:4px; object-fit:cover; margin-right:8px; vertical-align:middle;">
                    <strong>${p.name}</strong>
                </td>
                <td><span class="badge badge-muted">${p.category}</span></td>
                <td><strong class="prod-price">¥${p.price.toFixed(2)}</strong></td>
                <td>
                    <input type="number" class="form-input" style="width:70px; padding:4px 8px;" value="${p.stock}" onchange="updateProductStock(${p.id}, this.value)">
                </td>
                <td>${p.threshold}</td>
                <td>${stockBadge}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="switch-container" onclick="toggleProductStatus(${p.id}, event)">
                        <input type="checkbox" class="switch-input" ${isChecked}>
                        <label class="switch-label"></label>
                        <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${p.status === 'published' ? '启用' : '禁用'}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" onclick="openEditProductModal(${p.id})">编辑</button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deleteProduct(${p.id})">删除</button>
                </td>
            `;
            prodTbody.appendChild(tr);
        });
    }
    
    // 2. 渲染服务包配置表
    const pkgTbody = document.getElementById('package-list-tbody');
    if (pkgTbody) {
        pkgTbody.innerHTML = '';
        
        const searchName = document.getElementById('searchPackageInput')?.value.trim().toLowerCase() || '';
        const statusFilter = document.getElementById('filterPackageStatus')?.value || 'all';
        
        const filteredPkgs = packages.filter(pkg => {
            const matchesName = pkg.name.toLowerCase().includes(searchName);
            
            let matchesStatus = true;
            if (statusFilter !== 'all') {
                let isSelledOut = false;
                pkg.associatedGoods.forEach(prodId => {
                    const prod = products.find(p => p.id === prodId);
                    if (prod && prod.stock === 0) {
                        isSelledOut = true;
                    }
                });
                
                if (statusFilter === 'published') {
                    matchesStatus = pkg.status === 'published' && !isSelledOut;
                } else if (statusFilter === 'unpublished') {
                    matchesStatus = pkg.status === 'unpublished';
                } else if (statusFilter === 'outofstock') {
                    matchesStatus = isSelledOut;
                }
            }
            return matchesName && matchesStatus;
        });
        
        filteredPkgs.forEach(pkg => {
            let isSelledOut = false;
            let soldOutItemsNames = [];
            pkg.associatedGoods.forEach(prodId => {
                const prod = products.find(p => p.id === prodId);
                if (prod && prod.stock === 0) {
                    isSelledOut = true;
                    soldOutItemsNames.push(prod.alias || prod.name.substring(0,4));
                }
            });
            
            let statusBadge = '';
            if (isSelledOut) {
                statusBadge = `<span class="badge badge-danger" title="由于关联的商品 [${soldOutItemsNames.join(',')}] 已售罄，服务包联动置为不可售。">暂不可售</span>`;
            } else {
                statusBadge = pkg.status === 'published' ? '<span class="badge badge-success">销售中</span>' : '<span class="badge badge-muted">已下架</span>';
            }
            
            const isChecked = pkg.status === 'published' ? 'checked' : '';
            
            const associatedGoodsNames = pkg.associatedGoods.map(prodId => {
                const prod = products.find(p => p.id === prodId);
                return prod ? prod.name : '';
            }).filter(n => n !== '').join(', ');
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${pkg.image || SVG_ICONS.package_default}" style="width:32px; height:32px; border-radius:4px; object-fit:cover; margin-right:8px; vertical-align:middle;">
                    <strong>${pkg.name}</strong>
                </td>
                <td><strong class="prod-price">¥${pkg.price.toFixed(2)}</strong></td>
                <td>${pkg.period} 天</td>
                <td>${pkg.chatLimit} 次</td>
                <td>${pkg.alertLimit} 次</td>
                <td>${pkg.quota} 人</td>
                <td><span style="font-size:10px; color:var(--text-secondary);" title="${associatedGoodsNames}">${associatedGoodsNames || '-'}</span></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="switch-container" onclick="togglePackageStatus(${pkg.id}, event)">
                        <input type="checkbox" class="switch-input" ${isChecked}>
                        <label class="switch-label"></label>
                        <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${pkg.status === 'published' ? '上架' : '下架'}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" onclick="openEditPackageModal(${pkg.id})">编辑</button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deletePackage(${pkg.id})">删除</button>
                </td>
            `;
            pkgTbody.appendChild(tr);
        });
    }
}

function updateProductStock(id, newStockVal) {
    const stockInt = parseInt(newStockVal);
    if (isNaN(stockInt) || stockInt < 0) {
        alert('请输入合法的库存数字！');
        return;
    }
    
    const prod = products.find(p => p.id === id);
    if (prod) {
        prod.stock = stockInt;
        saveToLocalStorage();
        renderProductAndPackages();
        
        if (stockInt === 0) {
            showGlobalNotification(`商品 [${prod.name}] 已设为售罄，所有关联此商品的服务包已自动置为 [暂不可售]！`);
        } else {
            showGlobalNotification(`商品 [${prod.name}] 库存已更新为 ${stockInt}。`);
        }
    }
}

function filterProductsList() {
    renderProductAndPackages();
}

function filterPackagesList() {
    renderProductAndPackages();
}

function toggleProductStatus(id, event) {
    event.preventDefault();
    const prod = products.find(p => p.id === id);
    if (prod) {
        prod.status = prod.status === 'published' ? 'unpublished' : 'published';
        saveToLocalStorage();
        renderProductAndPackages();
        showGlobalNotification(`已成功切换商品 [${prod.name}] 的销售状态为: ${prod.status === 'published' ? '启用' : '停售'}`);
    }
}

function togglePackageStatus(id, event) {
    event.preventDefault();
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
        pkg.status = pkg.status === 'published' ? 'unpublished' : 'published';
        saveToLocalStorage();
        renderProductAndPackages();
        showGlobalNotification(`已成功切换服务包的销售状态为: ${pkg.status === 'published' ? '上架' : '下架'}`);
    }
}

function deleteProduct(id) {
    if (confirm('确定要删除该商品吗？这可能会导致关联的服务包状态异常！')) {
        products = products.filter(p => p.id !== id);
        saveToLocalStorage();
        renderProductAndPackages();
        showGlobalNotification(`商品已成功删除！`);
    }
}

function deletePackage(id) {
    if (confirm('确定要删除该服务包吗？')) {
        packages = packages.filter(p => p.id !== id);
        saveToLocalStorage();
        renderProductAndPackages();
        showGlobalNotification(`服务包已成功删除！`);
    }
}

function openAddPackageModal() {
    currentEditingPackageId = null;
    document.getElementById('package-modal').classList.add('active');
    document.querySelector('#package-modal h3').innerText = '新增服务配置';
    document.getElementById('pkg-name').value = '';
    document.getElementById('pkg-price').value = '';
    document.getElementById('pkg-period').value = '30';
    document.getElementById('pkg-chat-limit').value = '20';
    document.getElementById('pkg-alert-limit').value = '5';
    document.getElementById('pkg-quota').value = '50';
    document.getElementById('pkg-image').value = '';
    
    const container = document.getElementById('pkg-associated-goods');
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <label class="checkbox-label">
                <input type="checkbox" value="${p.id}" class="pkg-assoc-check">
                <span>[${p.category}] ${p.name} (单价: ¥${p.price})</span>
            </label>
        `;
    });
}

function openEditPackageModal(id) {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;
    
    currentEditingPackageId = id;
    document.getElementById('package-modal').classList.add('active');
    document.querySelector('#package-modal h3').innerText = '编辑服务配置';
    document.getElementById('pkg-name').value = pkg.name;
    document.getElementById('pkg-price').value = pkg.price;
    document.getElementById('pkg-period').value = pkg.period;
    document.getElementById('pkg-chat-limit').value = pkg.chatLimit;
    document.getElementById('pkg-alert-limit').value = pkg.alertLimit;
    document.getElementById('pkg-quota').value = pkg.quota;
    document.getElementById('pkg-image').value = pkg.image || '';
    
    const container = document.getElementById('pkg-associated-goods');
    container.innerHTML = '';
    products.forEach(p => {
        const isChecked = pkg.associatedGoods.includes(p.id) ? 'checked' : '';
        container.innerHTML += `
            <label class="checkbox-label">
                <input type="checkbox" value="${p.id}" class="pkg-assoc-check" ${isChecked}>
                <span>[${p.category}] ${p.name} (单价: ¥${p.price})</span>
            </label>
        `;
    });
}

function submitAddPackage() {
    const name = document.getElementById('pkg-name').value.trim();
    const price = parseFloat(document.getElementById('pkg-price').value);
    const period = parseInt(document.getElementById('pkg-period').value);
    const chatLimit = parseInt(document.getElementById('pkg-chat-limit').value);
    const alertLimit = parseInt(document.getElementById('pkg-alert-limit').value);
    const quota = parseInt(document.getElementById('pkg-quota').value);
    const image = document.getElementById('pkg-image').value.trim();
    
    if (!name || isNaN(price) || isNaN(period)) {
        alert('请完整填写服务包的核心字段！');
        return;
    }
    
    const checks = document.querySelectorAll('.pkg-assoc-check:checked');
    let assocIds = [];
    checks.forEach(c => assocIds.push(parseInt(c.value)));
    
    if (currentEditingPackageId !== null) {
        const pkg = packages.find(p => p.id === currentEditingPackageId);
        if (pkg) {
            pkg.name = name;
            pkg.price = price;
            pkg.period = period;
            pkg.chatLimit = isNaN(chatLimit) ? 99 : chatLimit;
            pkg.alertLimit = isNaN(alertLimit) ? 5 : alertLimit;
            pkg.quota = isNaN(quota) ? 50 : quota;
            pkg.associatedGoods = assocIds;
            pkg.image = image || SVG_ICONS.package_default;
        }
        showGlobalNotification(`服务包 [${name}] 已成功修改！`);
    } else {
        const newPkg = {
            id: Date.now(),
            name: name,
            price: price,
            period: period,
            chatLimit: isNaN(chatLimit) ? 99 : chatLimit,
            alertLimit: isNaN(alertLimit) ? 5 : alertLimit,
            quota: isNaN(quota) ? 50 : quota,
            associatedGoods: assocIds,
            status: 'published',
            image: image || SVG_ICONS.package_default
        };
        packages.push(newPkg);
        showGlobalNotification(`收费服务包 [${name}] 已配置发布成功并关联商品！`);
    }
    
    saveToLocalStorage();
    closeAddPackageModal();
    renderProductAndPackages();
}

function openAddProductModal() {
    currentEditingProductId = null;
    document.getElementById('product-modal').classList.add('active');
    document.querySelector('#product-modal h3').innerText = '录入商品信息';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-category').value = '膳';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-stock').value = '100';
    document.getElementById('prod-threshold').value = '10';
    document.getElementById('prod-image').value = '';
}

function openEditProductModal(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    
    currentEditingProductId = id;
    document.getElementById('product-modal').classList.add('active');
    document.querySelector('#product-modal h3').innerText = '编辑商品信息';
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-stock').value = prod.stock;
    document.getElementById('prod-threshold').value = prod.threshold;
    document.getElementById('prod-image').value = prod.image || '';
}

function submitAddProduct() {
    const name = document.getElementById('prod-name').value.trim();
    const cat = document.getElementById('prod-category').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const thres = parseInt(document.getElementById('prod-threshold').value);
    const image = document.getElementById('prod-image').value.trim();
    
    if (!name || isNaN(price) || isNaN(stock)) {
        alert('请填写完整的商品参数！');
        return;
    }
    
    if (currentEditingProductId !== null) {
        const prod = products.find(p => p.id === currentEditingProductId);
        if (prod) {
            prod.name = name;
            prod.category = cat;
            prod.price = price;
            prod.stock = stock;
            prod.threshold = isNaN(thres) ? 10 : thres;
            prod.alias = name.substring(0, 4);
            prod.image = image || SVG_ICONS.product_default;
        }
        showGlobalNotification(`商品 [${name}] 已成功修改！`);
    } else {
        const newProd = {
            id: Date.now(),
            name: name,
            category: cat,
            price: price,
            stock: stock,
            threshold: isNaN(thres) ? 10 : thres,
            alias: name.substring(0, 4),
            status: 'published',
            image: image || SVG_ICONS.product_default
        };
        products.push(newProd);
        showGlobalNotification(`商品 [${name}] 已成功录入！`);
    }
    
    saveToLocalStorage();
    closeAddProductModal();
    renderProductAndPackages();
}

// ==========================================================================
// 5. CMS 运营配置与专家排序权重 (PRD 2.3)
// ==========================================================================

let currentEditingBannerId = null;
let currentEditingRecommendName = null;

function renderCMSPanel() {
    // 1. 渲染 Banner 广告表
    const bannerTbody = document.getElementById('banner-list');
    if (bannerTbody) {
        bannerTbody.innerHTML = '';
        
        const searchVal = document.getElementById('searchBannerInput')?.value.trim().toLowerCase() || '';
        const statusFilter = document.getElementById('filterBannerStatus')?.value || 'all';
        
        const filteredBanners = banners.filter(b => {
            const matchesName = b.title.toLowerCase().includes(searchVal);
            const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
            return matchesName && matchesStatus;
        });
        
        filteredBanners.forEach(b => {
            let typeText = '';
            if (b.linkType === 'external') typeText = '外部链接';
            else if (b.linkType === 'doctor') typeText = `医生主页: ${b.linkVal}`;
            else if (b.linkType === 'package') typeText = `服务包ID: ${b.linkVal}`;
            
            const isChecked = b.status === 'ON' ? 'checked' : '';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${b.title}</strong></td>
                <td><span style="font-size:10px; color:var(--accent);">${typeText}</span></td>
                <td>永久生效</td>
                <td><span class="badge badge-muted">${b.order} 级</span></td>
                <td><span class="badge ${b.status === 'ON' ? 'badge-success' : 'badge-danger'}">${b.status === 'ON' ? '投递中' : '已暂停'}</span></td>
                <td>
                    <div class="switch-container" onclick="toggleBannerStatus(${b.id}, event)">
                        <input type="checkbox" class="switch-input" ${isChecked}>
                        <label class="switch-label"></label>
                        <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${b.status === 'ON' ? '开启' : '关闭'}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" onclick="openEditBannerModal(${b.id})">编辑</button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deleteBanner(${b.id})">删除</button>
                </td>
            `;
            bannerTbody.appendChild(tr);
        });
    }
    // 2. 渲染推荐专家列表 (权重排序降序重排核心业务)
    const recommendTbody = document.getElementById('recommend-list');
    if (recommendTbody) {
        recommendTbody.innerHTML = '';
        
        const searchVal = document.getElementById('searchRecommendInput')?.value.trim().toLowerCase() || '';
        
        const filteredRecommends = recommends.filter(r => r.name.toLowerCase().includes(searchVal));
        
        // 按照“排序权重降序，审批通过时间戳正序”进行双重重排
        let sortedRecommends = [...filteredRecommends].sort((a, b) => {
            if (b.weight !== a.weight) {
                return b.weight - a.weight; // 权重高排前面
            } else {
                const docA = doctorsApproval.find(d => d.name === a.name) || { timestamp: 0 };
                const docB = doctorsApproval.find(d => d.name === b.name) || { timestamp: 0 };
                return docA.timestamp - docB.timestamp; // 审核早排前面
            }
        });

        sortedRecommends.forEach((rec, idx) => {
            if (!rec.status) rec.status = 'ON';
            const isChecked = rec.status === 'ON' ? 'checked' : '';
            const statusBadge = rec.status === 'ON' ? '<span class="badge badge-success">推荐中</span>' : '<span class="badge badge-muted">已暂停</span>';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-size:9px; color:var(--text-muted); font-weight:700;">#${idx+1}</span>
                        <strong>${rec.name}</strong>
                    </div>
                </td>
                <td><span style="font-size:10px; color:var(--text-secondary);">${rec.intro}</span></td>
                <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <strong style="color:var(--accent); font-size:13px;">${rec.weight} 分</strong>
                        <input type="number" class="form-input" style="width:58px; padding:4px 8px;" value="${rec.weight}" onchange="updateRecommendWeight('${rec.name}', this.value)">
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>
                    <div class="switch-container" onclick="toggleRecommendStatus('${rec.name}', event)">
                        <input type="checkbox" class="switch-input" ${isChecked}>
                        <label class="switch-label"></label>
                        <span style="font-size:10px; margin-left:6px; color:var(--text-secondary);">${rec.status === 'ON' ? '启用' : '禁用'}</span>
                    </div>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:10px;" onclick="openEditRecommendModal('${rec.name}')">编辑</button>
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deleteRecommend('${rec.name}')">取消推荐</button>
                </td>
            `;
            recommendTbody.appendChild(tr);
        });
    }
}

function filterBannersList() {
    renderCMSPanel();
}

function filterRecommendsList() {
    renderCMSPanel();
}

// 快速修改推荐权重分并自动降序重排
function updateRecommendWeight(name, newVal) {
    const valInt = parseInt(newVal);
    if (isNaN(valInt) || valInt < 1 || valInt > 100) {
        alert('权重分值必须为 1 - 100 之间的整数！');
        return;
    }
    const rec = recommends.find(r => r.name === name);
    if (rec) {
        rec.weight = valInt;
        saveToLocalStorage();
        renderCMSPanel();
        showGlobalNotification(`已成功修改专家 ${name} 的推荐权重分，列表已按降序实时重排！`);
    }
}

function toggleBannerStatus(id, event) {
    event.preventDefault();
    const ban = banners.find(b => b.id === id);
    if (ban) {
        ban.status = ban.status === 'ON' ? 'OFF' : 'ON';
        saveToLocalStorage();
        renderCMSPanel();
        showGlobalNotification(`已成功切换广告投放状态为: ${ban.status === 'ON' ? '开启' : '关闭'}`);
    }
}

function toggleRecommendStatus(name, event) {
    event.preventDefault();
    const rec = recommends.find(r => r.name === name);
    if (rec) {
        rec.status = rec.status === 'ON' ? 'OFF' : 'ON';
        saveToLocalStorage();
        renderCMSPanel();
        showGlobalNotification(`已成功切换专家 ${name} 的推荐状态为: ${rec.status === 'ON' ? '启用' : '禁用'}`);
    }
}

function deleteBanner(id) {
    if (confirm('确定要删除该广告条投放吗？')) {
        banners = banners.filter(b => b.id !== id);
        saveToLocalStorage();
        renderCMSPanel();
        showGlobalNotification(`已删除该广告条投放！`);
    }
}

function deleteRecommend(name) {
    if (confirm('确定要取消该专家的推荐吗？')) {
        recommends = recommends.filter(r => r.name !== name);
        saveToLocalStorage();
        renderCMSPanel();
        showGlobalNotification(`专家 ${name} 已退出推荐队列！`);
    }
}

// Banner Modal
function openAddBannerModal() {
    currentEditingBannerId = null;
    document.getElementById('banner-modal').classList.add('active');
    document.querySelector('#banner-modal h3').innerText = '新增首屏 Banner 广告投放';
    document.getElementById('ban-title').value = '';
    document.getElementById('ban-link-type').value = 'external';
    document.getElementById('ban-link-val').value = '';
    document.getElementById('ban-order').value = '1';
    document.getElementById('ban-status').value = 'ON';
}

function openEditBannerModal(id) {
    const ban = banners.find(b => b.id === id);
    if (!ban) return;
    
    currentEditingBannerId = id;
    document.getElementById('banner-modal').classList.add('active');
    document.querySelector('#banner-modal h3').innerText = '编辑首屏 Banner 广告投放';
    document.getElementById('ban-title').value = ban.title;
    document.getElementById('ban-link-type').value = ban.linkType;
    document.getElementById('ban-link-val').value = ban.linkVal;
    document.getElementById('ban-order').value = ban.order;
    document.getElementById('ban-status').value = ban.status;
}

function closeAddBannerModal() {
    document.getElementById('banner-modal').classList.remove('active');
}

function toggleBannerLinkInput(type) {
    const input = document.getElementById('ban-link-val');
    if (type === 'external') {
        input.placeholder = 'https://...';
    } else if (type === 'doctor') {
        input.placeholder = '输入对应激活的医生 ID';
    } else {
        input.placeholder = '输入对应收费调理包 ID';
    }
}

function submitAddBanner() {
    const title = document.getElementById('ban-title').value.trim();
    const type = document.getElementById('ban-link-type').value;
    const val = document.getElementById('ban-link-val').value.trim();
    const order = parseInt(document.getElementById('ban-order').value);
    const status = document.getElementById('ban-status').value;
    
    if (!title || !val) {
        alert('请配置完整的 Banner 参数！');
        return;
    }
    
    if (currentEditingBannerId !== null) {
        const ban = banners.find(b => b.id === currentEditingBannerId);
        if (ban) {
            ban.title = title;
            ban.linkType = type;
            ban.linkVal = val;
            ban.order = isNaN(order) ? 1 : order;
            ban.status = status;
        }
        showGlobalNotification(`广告 Banner [${title}] 已成功修改！`);
    } else {
        const newBan = {
            id: Date.now(),
            title: title,
            linkType: type,
            linkVal: val,
            order: isNaN(order) ? 1 : order,
            status: status
        };
        banners.push(newBan);
        showGlobalNotification(`广告 Banner [${title}] 已成功上架！`);
    }
    
    saveToLocalStorage();
    closeAddBannerModal();
    renderCMSPanel();
}

// Recommend Expert Modal
function openAddRecommendModal() {
    currentEditingRecommendName = null;
    document.getElementById('recommend-modal').classList.add('active');
    document.querySelector('#recommend-modal h3').innerText = '入选推荐名医专家';
    document.getElementById('rec-intro').value = '';
    document.getElementById('rec-weight').value = '90';
    
    const select = document.getElementById('rec-doctor-select');
    select.innerHTML = '';
    select.disabled = false;
    
    const approvedDocs = doctorsApproval.filter(d => d.status === 'approved' && d.roleType !== 'staff');
    const filteredDocs = approvedDocs.filter(d => !recommends.some(r => r.name === d.name));
    
    if (filteredDocs.length === 0) {
        select.innerHTML = `<option value="">暂无符合条件的已激活医生</option>`;
    } else {
        filteredDocs.forEach(d => {
            select.innerHTML += `<option value="${d.id}">${d.name} (${d.dept})</option>`;
        });
    }
}

function openEditRecommendModal(name) {
    const rec = recommends.find(r => r.name === name);
    if (!rec) return;
    
    currentEditingRecommendName = name;
    document.getElementById('recommend-modal').classList.add('active');
    document.querySelector('#recommend-modal h3').innerText = '编辑推荐专家设置';
    document.getElementById('rec-intro').value = rec.intro;
    document.getElementById('rec-weight').value = rec.weight;
    
    const select = document.getElementById('rec-doctor-select');
    select.innerHTML = `<option value="${rec.doctorId || 101}" selected>${rec.name}</option>`;
    select.disabled = true; // Cannot modify doctor selection in edit mode
}

function closeAddRecommendModal() {
    document.getElementById('recommend-modal').classList.remove('active');
}

function submitAddRecommend() {
    const docId = parseInt(document.getElementById('rec-doctor-select').value);
    const intro = document.getElementById('rec-intro').value.trim();
    const weight = parseInt(document.getElementById('rec-weight').value);
    
    if (isNaN(docId) || !intro || isNaN(weight)) {
        alert('请填写完整的专家推荐设置参数！');
        return;
    }
    
    if (currentEditingRecommendName !== null) {
        const rec = recommends.find(r => r.name === currentEditingRecommendName);
        if (rec) {
            rec.intro = intro;
            rec.weight = weight;
        }
        showGlobalNotification(`推荐专家设置已成功修改！`);
    } else {
        const doc = doctorsApproval.find(d => d.id === docId);
        if (doc) {
            const newRec = {
                doctorId: doc.id,
                name: doc.name,
                intro: intro,
                weight: weight,
                status: 'ON'
            };
            recommends.push(newRec);
            showGlobalNotification(`已成功将医生 ${doc.name} 置入推荐专榜！`);
        }
    }
    
    saveToLocalStorage();
    closeAddRecommendModal();
    renderCMSPanel();
}

// ==========================================================================
// 6. 全局健康档案库与生理数字人画像 (PRD 2.4)
// ==========================================================================

let currentEditingPatientId = null;

function renderRecordsPanel() {
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
        if (pat.healthState === 'normal') stateBadge = '<span class="badge badge-success">正常 (绿)</span>';
        else if (pat.healthState === 'warning') stateBadge = '<span class="badge badge-warning">亚健康 (黄)</span>';
        else if (pat.healthState === 'risk') stateBadge = '<span class="badge badge-danger blink">高危风险 (红)</span>';

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
                <button class="btn btn-danger" style="padding:4px 8px; font-size:10px; margin-left:4px;" onclick="deletePatientRecord(${pat.id})">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterPatientsList() {
    renderRecordsPanel();
}

function autoCalcHealthState() {
    const cardio = document.getElementById('pat-form-cardio-risk')?.value || '低';
    const emotion = document.getElementById('pat-form-emotion-risk')?.value || '低';
    const sleep = document.getElementById('pat-form-sleep-risk')?.value || '低';

    const stateInput = document.getElementById('pat-form-state');
    const stateDisplay = document.getElementById('pat-form-state-display');

    if (cardio === '高' || emotion === '高' || sleep === '高') {
        if (stateInput) stateInput.value = 'risk';
        if (stateDisplay) stateDisplay.value = '高危风险 (红)';
    } else if (cardio === '中' || emotion === '中' || sleep === '中') {
        if (stateInput) stateInput.value = 'warning';
        if (stateDisplay) stateDisplay.value = '亚健康 (黄)';
    } else {
        if (stateInput) stateInput.value = 'normal';
        if (stateDisplay) stateDisplay.value = '正常 (绿)';
    }
}

function openAddPatientModal() {
    currentEditingPatientId = null;
    document.getElementById('patient-modal').classList.add('active');
    document.getElementById('patient-modal-title').innerText = '新增居民健康档案';
    
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
    document.getElementById('pat-form-explanation').value = '气血阴阳平衡，脏腑功能良好，经络运行顺畅';

    if (document.getElementById('pat-form-cardio-risk')) document.getElementById('pat-form-cardio-risk').value = '低';
    if (document.getElementById('pat-form-emotion-risk')) document.getElementById('pat-form-emotion-risk').value = '低';
    if (document.getElementById('pat-form-sleep-risk')) document.getElementById('pat-form-sleep-risk').value = '低';
    autoCalcHealthState();
}

function openEditPatientModal(id) {
    const pat = patients.find(p => p.id === id);
    if (!pat) return;
    
    currentEditingPatientId = id;
    document.getElementById('patient-modal').classList.add('active');
    document.getElementById('patient-modal-title').innerText = '编辑居民健康档案';
    
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
    document.getElementById('patient-modal').classList.remove('active');
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
    
    let starRating = '正常状态 ⭐️⭐️⭐️⭐️⭐️';
    if (healthState === 'warning') starRating = '亚健康 ⭐️⭐️⭐️⭐️☆';
    else if (healthState === 'risk') starRating = '高危状态 ⭐️⭐️☆☆☆';
    
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
    renderRecordsPanel();
}

function deletePatientRecord(id) {
    if (confirm('确定要删除该居民的健康档案吗？此操作不可逆！')) {
        patients = patients.filter(p => p.id !== id);
        saveToLocalStorage();
        renderRecordsPanel();
        showGlobalNotification('居民健康档案已成功删除！');
    }
}

// 打开高保真生理数字人侧面 Modal 画像看板
// ==================== 生理数字人画像看板 (浅色高雅医学风) JS 控制逻辑 ====================
let activePatientForDetail = null;
let detailPerturbationInterval = null;
let activePatientTrendData = {
    heart: [],
    o2: [],
    sleep: [],
    bp: [],
    step: []
};

// 模拟生成 30 点的历史波动数据
function generatePatientTrendData(pat) {
    activePatientTrendData = {
        heart: [],
        o2: [],
        sleep: [],
        bp: [],
        step: []
    };
    
    const baseHr = pat.metrics.hr || 75;
    const baseSpo2 = pat.metrics.spo2 || 98;
    const baseSleep = pat.metrics.sleep || 7.0;
    const baseSteps = pat.metrics.steps || 6000;
    
    let bpSystolic = 120;
    try {
        bpSystolic = parseInt(pat.metrics.bp.split('/')[0]) || 120;
    } catch(e) {}

    for (let i = 0; i < 30; i++) {
        // 心率：基准小幅波动
        let hrNoise = Math.sin(i * 0.4) * 4 + (Math.random() * 4 - 2);
        activePatientTrendData.heart.push(Math.round(baseHr + hrNoise));
        
        // 血氧：95-100之间
        let spo2Noise = (Math.random() * 2 - 1) * 0.5;
        let sVal = Math.round(baseSpo2 + spo2Noise);
        if (sVal > 100) sVal = 100;
        if (sVal < 94) sVal = 94;
        activePatientTrendData.o2.push(sVal);
        
        // 睡眠：基准波动
        let sleepNoise = Math.sin(i * 0.8) * 0.5 + (Math.random() * 0.8 - 0.4);
        let slVal = Math.max(4.0, Math.min(10.0, parseFloat((baseSleep + sleepNoise).toFixed(1))));
        activePatientTrendData.sleep.push(slVal);
        
        // 血压：收缩压波动
        let bpNoise = Math.sin(i * 0.3) * 6 + (Math.random() * 6 - 3);
        activePatientTrendData.bp.push(Math.round(bpSystolic + bpNoise));
        
        // 步数：波动
        let stepNoise = Math.sin(i * 0.5) * 800 + (Math.random() * 800 - 400);
        activePatientTrendData.step.push(Math.round(Math.max(1000, baseSteps + stepNoise)));
    }
}

// 打开高保真生理数字人侧面 Modal 画像看板
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

// 监听页面缩放以重绘 SVG
window.addEventListener('resize', drawHistoryChart);

// ==========================================================================
// 7. 运营数据一览与绩效明细报表 (PRD 2.5)
// ==========================================================================

function renderReportsPanel() {
    // 1. 渲染实时警报雷达列表
    const alarmContainer = document.getElementById('radar-list');
    if (alarmContainer) {
        alarmContainer.innerHTML = '';
        if (radarAlarms.length === 0) {
            alarmContainer.innerHTML = `<div style="text-align:center; font-size:10px; color:var(--text-muted); padding:30px 0;">当前全网无未响应警报，安全。</div>`;
        } else {
            radarAlarms.forEach(alarm => {
                const isHandled = alarm.state === 'handled';
                const card = document.createElement('div');
                card.className = `alarm-card ${isHandled ? 'handled' : ''}`;
                
                let actionBtn = '';
                if (!isHandled) {
                    actionBtn = `<button class="btn btn-accent" style="padding:4px 10px; font-size:9px;" onclick="sendAdminSupervision(${alarm.id})">一键督办</button>`;
                } else {
                    actionBtn = `<span style="font-size:10px; color:var(--text-muted);">跟进处理中...</span>`;
                }
                
                card.innerHTML = `
                    <div class="alarm-left">
                        <div class="alarm-title-row">
                            <span class="alarm-title">${alarm.name} • <strong class="alarm-val">${alarm.value}</strong></span>
                            <span class="badge ${isHandled ? 'badge-muted' : 'badge-danger blink'}">${isHandled ? '跟进中' : '未响应'}</span>
                        </div>
                        <span class="alarm-meta">触发时段: ${alarm.time} | 关联医生: <strong>${alarm.doctor}</strong></span>
                    </div>
                    <div>${actionBtn}</div>
                `;
                alarmContainer.appendChild(card);
            });
        }
    }

    // 2. 渲染在岗医生图谱
    const docStatusTbody = document.getElementById('doctor-status-list');
    if (docStatusTbody) {
        docStatusTbody.innerHTML = '';
        doctorsOnDuty.forEach(doc => {
            let stateBadge = '';
            if (doc.status === '在线') stateBadge = '<span class="badge badge-success">在线</span>';
            else if (doc.status === '忙碌') stateBadge = '<span class="badge badge-warning">忙碌</span>';
            else stateBadge = '<span class="badge badge-muted">离线</span>';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${doc.name}</strong><br><span style="font-size:9px; color:var(--text-muted);">${doc.dept}</span></td>
                <td>${stateBadge}</td>
                <td><strong style="color:${doc.alarmCount > 0 ? 'var(--danger)' : 'var(--text-primary)'}">${doc.alarmCount} 人</strong></td>
                <td><code>${doc.limit}</code></td>
            `;
            docStatusTbody.appendChild(tr);
        });
    }

    // 3. 渲染绩效考核表 (支持排序，PRD 2.5)
    renderPerformanceList();

    // 4. 渲染医患沟通审计表
    filterAuditList();
}

// 绩效统计排序渲染 (PRD 2.5.2)
let currentPerfSortType = 'time'; // 'time' 响应时间升序, 'rate' 评分降序

function sortPerformance(type) {
    currentPerfSortType = type;
    const btns = document.querySelectorAll('.btn-group button');
    if (type === 'time') {
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
    renderPerformanceList();
}

function renderPerformanceList() {
    const tbody = document.getElementById('performance-list');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const searchVal = document.getElementById('searchPerfInput')?.value.trim().toLowerCase() || '';
    
    // 拷贝并重排
    let sortedPerf = [...performance];
    if (currentPerfSortType === 'time') {
        sortedPerf.sort((a, b) => a.avgResponse - b.avgResponse); // 响应时间从小到大
    } else {
        sortedPerf.sort((a, b) => b.score - a.score); // 随随访评价从大到小
    }
    
    const filtered = sortedPerf.filter(perf => perf.name.toLowerCase().includes(searchVal));
    
    filtered.forEach(perf => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${perf.name}</strong></td>
            <td>${perf.count} 人</td>
            <td>${perf.recipeCount} 份</td>
            <td><strong style="color:var(--accent);">${perf.avgResponse} 分钟</strong></td>
            <td><strong style="color:#f59e0b;">${perf.score.toFixed(1)} 分</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAuditList() {
    const searchVal = document.getElementById('searchAuditInput')?.value.trim().toLowerCase() || '';
    const auditTbody = document.getElementById('chat-audit-list');
    if (!auditTbody) return;
    auditTbody.innerHTML = '';
    
    const filtered = chatAudit.filter(audit => {
        return audit.info.toLowerCase().includes(searchVal) || audit.time.toLowerCase().includes(searchVal);
    });
    
    filtered.forEach(audit => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${audit.time}</td>
            <td><strong>${audit.info}</strong></td>
            <td>${audit.count} 条</td>
            <td><code style="color:var(--accent);">${audit.delay}</code></td>
            <td>
                <button class="btn-mini" onclick="showGlobalNotification('【审计提示】沟通日志已生成完毕，CSV明细加密导出成功！')">导出日志</button>
            </td>
        `;
        auditTbody.appendChild(tr);
    });
}

function filterPerfList() {
    renderPerformanceList();
}

// 一键督办事件逻辑
function sendAdminSupervision(alarmId) {
    const alarm = radarAlarms.find(a => a.id === alarmId);
    if (alarm) {
        alarm.state = 'handled';
        saveToLocalStorage();
        
        // 模拟联动在线沟通量
        chatAudit.push({
            time: '刚刚',
            info: `系统督办推送 ➔ ${alarm.doctor}`,
            count: 1,
            delay: '即时响应'
        });
        
        renderReportsPanel();
        showGlobalNotification(`已成功下发 [一键督办特级指令] 到责任医生 ${alarm.doctor} 的工作台！`);
    }
}

// ==========================================================================
// 8. 全局浮动微光通知气泡
// ==========================================================================

function showGlobalNotification(text) {
    const noti = document.getElementById('admin-notification');
    if (!noti) return;
    
    noti.innerText = text;
    noti.classList.add('active');
    
    setTimeout(() => {
        noti.classList.remove('active');
    }, 3200);
}
