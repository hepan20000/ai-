/* ==========================================================================
   AI主动健康管理一体化平台 - 机构大屏核心控制与模拟引擎 (app.js)
   ========================================================================== */

// --- 1. 全局持久化数据初始化 (LocalStorage 模拟数据库) ---
let doctors = [];
let patients = [];
let recipesArchive = [];
let alertIncidents = [];

function initLocalStorageData() {
    // 1.1 初始化入驻医生数据
    const localDocs = localStorage.getItem('doctors');
    const generateDoctors = () => {
        const surnames = ["李", "张", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗", "梁", "宋", "郑", "谢", "韩", "唐", "冯", "于", "董", "萧"];
        const names = ["建国", "国强", "明强", "德华", "志远", "学民", "世杰", "景贤", "思源", "少华", "天明", "正平", "玉兰", "秀英", "桂英", "美华", "丽华", "雪梅", "晓华", "瑞芳", "清源", "景岳", "士雄", "守真", "天益", "重景", "廷贤", "凤梧", "怀德", "济民"];
        const depts = ["中医内科", "针灸科", "脾胃调理专科", "全科健康管理", "康复医学科", "中医心血管科", "中医呼吸科"];
        
        const list = [
            { id: 101, name: "李建国", dept: "中医内科", title: "主任医师", saturation: "85/100", active: true },
            { id: 102, name: "张景贤", dept: "脾胃调理专科", title: "副主任医师", saturation: "40/80", active: true },
            { id: 103, name: "王守真", dept: "针灸科", title: "主治医师", saturation: "55/60", active: true },
            { id: 104, name: "华济民", dept: "全科健康管理", title: "主治医师", saturation: "12/50", active: true }
        ];
        
        for (let i = 5; i <= 100; i++) {
            const surname = surnames[i % surnames.length];
            const name = names[(i * 7) % names.length];
            const dept = depts[i % depts.length];
            let title = "住院医师";
            const rand = i % 10;
            if (rand === 0) title = "主任医师";
            else if (rand <= 2) title = "副主任医师";
            else if (rand <= 6) title = "主治医师";
            
            list.push({
                id: 100 + i,
                name: surname + name,
                dept: dept,
                title: title,
                saturation: `${Math.floor(Math.random() * 40 + 10)}/${Math.floor(Math.random() * 50 + 50)}`,
                active: Math.random() > 0.05
            });
        }
        return list;
    };

    if (!localDocs) {
        doctors = generateDoctors();
        localStorage.setItem('doctors', JSON.stringify(doctors));
    } else {
        try {
            doctors = JSON.parse(localDocs);
            if (doctors.length < 100) {
                doctors = generateDoctors();
                localStorage.setItem('doctors', JSON.stringify(doctors));
            }
        } catch (e) {
            doctors = generateDoctors();
            localStorage.setItem('doctors', JSON.stringify(doctors));
        }
    }

    // 1.2 初始化在管居民数据 (严格匹配三级状态: 健康/正常、亚健康、风险)
    const localPats = localStorage.getItem('patients');
    const generatePatients = () => {
        const list = [
            {
                id: 1,
                name: "王小明",
                phone: "135****4321",
                age: 42,
                gender: "男",
                height: 172,
                weight: 78,
                status: "亚健康", // 正常、亚健康、风险
                tcmType: "脾虚湿盛质",
                metrics: { hr: 74, spo2: 97, bp: "128/82", sleep: 6.2, steps: 4230 },
                deviceImei: "IMEI86432101",
                battery: 85,
                doctor: "李建国",
                lastSync: "刚刚",
                risks: { stroke: "12.5%", heartfail: "4.8%", chd: "5.2%", af: "1.2%", cardioRiskLevel: "低", emotionRiskLevel: "中", sleepRiskLevel: "中" }
            },
            {
                id: 2,
                name: "周*伟",
                phone: "139****9056",
                age: 56,
                gender: "男",
                height: 170,
                weight: 69,
                status: "风险", // 脑血管红色警报触发
                tcmType: "阴阳两虚、血瘀质",
                metrics: { hr: 135, spo2: 91, bp: "162/112", sleep: 5.5, steps: 8620 },
                deviceImei: "IMEI86905602",
                battery: 15, // 低电量警告
                doctor: "李建国",
                lastSync: "2分钟前",
                risks: { stroke: "89.2%", heartfail: "74.5%", chd: "68.8%", af: "42.0%", cardioRiskLevel: "高", emotionRiskLevel: "高", sleepRiskLevel: "高" }
            },
            {
                id: 3,
                name: "李*兰",
                phone: "188****7788",
                age: 65,
                gender: "女",
                height: 158,
                weight: 52,
                status: "健康/正常",
                tcmType: "平和质",
                metrics: { hr: 68, spo2: 99, bp: "115/75", sleep: 8.0, steps: 9840 },
                deviceImei: "IMEI86778803",
                battery: 98,
                doctor: "张景贤",
                lastSync: "刚刚",
                risks: { stroke: "1.5%", heartfail: "0.8%", chd: "1.2%", af: "0.2%", cardioRiskLevel: "低", emotionRiskLevel: "低", sleepRiskLevel: "低" }
            },
            {
                id: 4,
                name: "赵*顺",
                phone: "136****5566",
                age: 38,
                gender: "男",
                height: 178,
                weight: 85,
                status: "亚健康",
                tcmType: "湿热内蕴质",
                metrics: { hr: 88, spo2: 96, bp: "138/88", sleep: 5.8, steps: 3500 },
                deviceImei: "IMEI86556604",
                battery: 62,
                doctor: "王守真",
                lastSync: "5分钟前",
                risks: { stroke: "8.5%", heartfail: "3.2%", chd: "4.5%", af: "1.8%", cardioRiskLevel: "低", emotionRiskLevel: "中", sleepRiskLevel: "中" }
            }
        ];

        const patSurnames = ["张", "王", "李", "赵", "陈", "刘", "杨", "黄", "吴", "周", "徐", "孙", "马", "朱", "胡", "郭", "何", "高", "林", "罗"];
        const patNames = ["伟", "芳", "娜", "敏", "静", "丽", "强", "磊", "洋", "艳", "勇", "军", "杰", "娟", "涛", "超", "明", "霞", "秀英", "桂英", "秀兰", "刚", "平", "辉", "浩", "博", "欣", "雅", "莹"];
        const statuses = ["健康/正常", "亚健康", "风险"];
        const tcmTypes = ["气虚", "阳虚", "阴虚", "痰湿", "湿热", "血瘀", "气郁", "特禀", "平和"];
        
        while (list.length < 1000) {
            const id = list.length + 1;
            const surname = patSurnames[id % patSurnames.length];
            const name = patNames[(id * 7) % patNames.length];
            const age = Math.floor(Math.random() * 45 + 30); // 30-75岁
            const gender = Math.random() > 0.5 ? "男" : "女";
            const height = gender === "男" ? Math.floor(Math.random() * 20 + 165) : Math.floor(Math.random() * 15 + 152);
            const weight = gender === "男" ? Math.floor(Math.random() * 30 + 65) : Math.floor(Math.random() * 25 + 48);
            
            // 1. 先随机决定 3 种风险级别 (脑血管风险、情绪压力风险、睡眠风险)
            let cardioRiskLevel = "低";
            const rCardio = Math.random() * 100;
            if (rCardio < 5) cardioRiskLevel = "高";
            else if (rCardio < 25) cardioRiskLevel = "中";

            let emotionRiskLevel = "低";
            const rEmotion = Math.random() * 100;
            if (rEmotion < 5) emotionRiskLevel = "高";
            else if (rEmotion < 25) emotionRiskLevel = "中";

            let sleepRiskLevel = "低";
            const rSleep = Math.random() * 100;
            if (rSleep < 5) sleepRiskLevel = "高";
            else if (rSleep < 25) sleepRiskLevel = "中";

            // 2. 根据 3 种风险等级自动判定健康状态 (生理指标与此状态没有直接关系)
            let status = "健康/正常";
            if (cardioRiskLevel === "高" || emotionRiskLevel === "高" || sleepRiskLevel === "高") {
                status = "风险";
            } else if (cardioRiskLevel === "中" || emotionRiskLevel === "中" || sleepRiskLevel === "中") {
                status = "亚健康";
            }

            // 3. 常态生成生理体征，不再受 status 强制硬编码绑定
            let hr = Math.floor(Math.random() * 25 + 65); // 65-90 bpm
            let spo2 = Math.floor(Math.random() * 4 + 96); // 96-99%
            let bpSystolic = Math.floor(Math.random() * 25 + 110); // 110-135 mmHg
            let bpDiplic = Math.floor(Math.random() * 15 + 72); // 72-87 mmHg
            let sleepTime = (Math.random() * 3 + 6.2).toFixed(1); // 6.2-9.2h
            
            const doctorObj = doctors[id % doctors.length];
            const doctorName = doctorObj ? doctorObj.name : "李建国";
            
            // 4. 百分比分值跟随对应的报告风险等级范围分布
            const strokePct = cardioRiskLevel === "高" ? (Math.random() * 25 + 70) : (cardioRiskLevel === "中" ? (Math.random() * 35 + 35) : (Math.random() * 34 + 1));
            const heartfailPct = cardioRiskLevel === "高" ? (Math.random() * 25 + 60) : (cardioRiskLevel === "中" ? (Math.random() * 30 + 30) : (Math.random() * 28 + 2));
            const chdPct = cardioRiskLevel === "高" ? (Math.random() * 20 + 65) : (cardioRiskLevel === "中" ? (Math.random() * 30 + 30) : (Math.random() * 27 + 3));
            const afPct = cardioRiskLevel === "高" ? (Math.random() * 30 + 40) : (cardioRiskLevel === "中" ? (Math.random() * 25 + 20) : (Math.random() * 19 + 1));

            const strokeVal = strokePct.toFixed(1) + "%";
            const heartfailVal = heartfailPct.toFixed(1) + "%";
            const chdVal = chdPct.toFixed(1) + "%";
            const afVal = afPct.toFixed(1) + "%";

            list.push({
                id: id,
                name: surname + name,
                phone: `13${Math.floor(Math.random()*9+1)}****${Math.floor(Math.random()*9000+1000)}`,
                age: age,
                gender: gender,
                height: height,
                weight: weight,
                status: status,
                tcmType: tcmTypes[id % tcmTypes.length] + "质",
                metrics: { hr: hr, spo2: spo2, bp: `${bpSystolic}/${bpDiplic}`, sleep: sleepTime, steps: Math.floor(Math.random()*8000+1000) },
                deviceImei: `IMEI86${Math.floor(Math.random()*900000+100000)}`,
                battery: Math.floor(Math.random()*60+40),
                doctor: doctorName,
                lastSync: `${Math.floor(Math.random()*10+1)}分钟前`,
                risks: { 
                    stroke: strokeVal, 
                    heartfail: heartfailVal, 
                    chd: chdVal, 
                    af: afVal,
                    cardioRiskLevel: cardioRiskLevel,
                    emotionRiskLevel: emotionRiskLevel,
                    sleepRiskLevel: sleepRiskLevel
                }
            });
        }
        return list;
    };

    if (!localPats) {
        patients = generatePatients();
        localStorage.setItem('patients', JSON.stringify(patients));
    } else {
        try {
            patients = JSON.parse(localPats);
            if (patients.length < 1000) {
                patients = generatePatients();
                localStorage.setItem('patients', JSON.stringify(patients));
            }
        } catch (e) {
            patients = generatePatients();
            localStorage.setItem('patients', JSON.stringify(patients));
        }
    }

    // 1.3 初始化预警督办日志
    const generateAlertIncidents = (patientsList, doctorsList) => {
        const list = [];
        const riskTypes = [
            { type: "脑血管风险", vitals: "血氧: 91%, 心率: 128bpm, 血压: 158/98", riskVal: "【脑血管】急性脑血流受阻高危 (82.4%)" },
            { type: "脑血管风险", vitals: "心率: 135bpm, 血压: 165/105, 呼吸: 22次/分", riskVal: "【脑血管】脑卒中前期体征预警 (89.5%)" },
            { type: "情绪压力风险", vitals: "心率: 102bpm, 皮肤电传导: 12μS, 情绪压力极高", riskVal: "【情绪压力】重度焦虑应激状态 (78.1%)" },
            { type: "情绪压力风险", vitals: "心率: 98bpm, 睡眠HRV: 18ms, 情绪紧绷", riskVal: "【情绪压力】持续紧张型压力超载 (65.2%)" },
            { type: "睡眠风险", vitals: "总睡眠: 4.1h, 深睡: 0.5h, 夜间醒来: 5次", riskVal: "【睡眠风险】重度睡眠剥夺高危 (81.0%)" },
            { type: "睡眠风险", vitals: "总睡眠: 4.5h, 呼吸暂停: 12次, 血氧低至88%", riskVal: "【睡眠风险】重度阻塞性呼吸暂停高危 (75.3%)" }
        ];
        
        const dates = ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22"];
        let idCounter = 2001;
        
        dates.forEach((d) => {
            const count = 30 + (idCounter % 15);
            for (let i = 0; i < count; i++) {
                const pat = patientsList[(idCounter * 7) % patientsList.length];
                const doc = doctorsList[idCounter % doctorsList.length];
                const rType = riskTypes[idCounter % riskTypes.length];
                
                let status = "已解除";
                let comment = "医生已介入诊断并开具调理方案。";
                
                if (d === "2026-06-22") {
                    const r = idCounter % 3;
                    if (r === 0) {
                        status = "待处理";
                        comment = "";
                    } else if (r === 1) {
                        status = "跟进中";
                        comment = "";
                    } else {
                        status = "已解除";
                        comment = "已开具调理方案，今日随访中。";
                    }
                }
                
                const hour = String(10 + (idCounter % 12)).padStart(2, '0');
                const min = String((idCounter * 13) % 60).padStart(2, '0');
                
                list.push({
                    id: idCounter++,
                    time: `${d} ${hour}:${min}`,
                    patId: pat.id,
                    name: pat.name,
                    gender: pat.gender || (pat.id % 2 === 0 ? "男" : "女"),
                    age: pat.age || 45,
                    status: pat.status || "风险",
                    type: rType.type,
                    vitals: rType.vitals,
                    riskVal: rType.riskVal,
                    doctor: doc.name,
                    alertStatus: status,
                    resolveComment: comment
                });
            }
        });
        return list;
    };

    const localAlerts = localStorage.getItem('alertIncidents');
    let needsGen = false;
    if (!localAlerts) {
        needsGen = true;
    } else {
        try {
            const parsed = JSON.parse(localAlerts);
            // 如果缓存数据没有 type 字段（旧数据结构），强制重新生成
            if (parsed.length < 50 || !parsed[0].type) needsGen = true;
        } catch(e) { needsGen = true; }
    }

    if (needsGen) {
        alertIncidents = generateAlertIncidents(patients, doctors);
        localStorage.setItem('alertIncidents', JSON.stringify(alertIncidents));
    } else {
        alertIncidents = JSON.parse(localAlerts);
        alertIncidents.forEach(a => {
            if (a.doctor === "李主任") a.doctor = "李建国";
        });
        localStorage.setItem('alertIncidents', JSON.stringify(alertIncidents));
    }

    // 1.4 初始化商品与套餐
    const localSales = localStorage.getItem('marketProductsSales');
    const defaultSales = [
        { name: "中医体质调理包", type: "服务包", price: 299, sales: 120, stock: 999 },
        { name: "高血压专享管理服务", type: "服务包", price: 599, sales: 85, stock: 999 },
        { name: "睡眠健康理疗监测套餐", type: "服务包", price: 399, sales: 48, stock: 0 }, // 售罄超卖控制
        { name: "肝脏功能AI风险评估套餐", type: "服务包", price: 199, sales: 98, stock: 999 },
        { name: "肾脏健康AI风险评估套餐", type: "服务包", price: 199, sales: 88, stock: 999 },
        { name: "脑血管健康AI专项评估套餐", type: "服务包", price: 299, sales: 145, stock: 999 },
        { name: "主动健康智能手表 Active Watch 2", type: "智能硬件设备", price: 1299, sales: 64, stock: 15 },
        { name: "智能健康手表 Ultra", type: "智能硬件设备", price: 2199, sales: 42, stock: 20 },
        { name: "便携式智能充电底座", type: "硬件周边配件", price: 99, sales: 36, stock: 50 },
        { name: "酸枣仁茯苓静心膏", type: "药食同源食疗", price: 128, sales: 115, stock: 150 },
        { name: "人参黄精八宝茶", type: "药食同源食疗", price: 89, sales: 168, stock: 300 },
        { name: "山药茯苓莲子粉", type: "药食同源食疗", price: 78, sales: 95, stock: 200 },
        { name: "百合莲子安神羹", type: "药食同源食疗", price: 58, sales: 142, stock: 250 },
        { name: "黄精枸杞原浆", type: "药食同源食疗", price: 168, sales: 86, stock: 120 }
    ];

    if (!localSales) {
        recipesArchive = defaultSales;
        localStorage.setItem('marketProductsSales', JSON.stringify(recipesArchive));
    } else {
        try {
            recipesArchive = JSON.parse(localSales);
            // 校验每个商品对象是否包含有效名称和销量，如果不完整或数量不匹配，强制重置
            const isValid = Array.isArray(recipesArchive) && 
                            recipesArchive.length >= 14 && 
                            recipesArchive.every(item => item && (item.name || item.packageName) && typeof item.sales === 'number');
            
            if (!isValid) {
                recipesArchive = defaultSales;
                localStorage.setItem('marketProductsSales', JSON.stringify(recipesArchive));
            } else {
                // 兼容性字段修复，确保 name 属性存在
                recipesArchive.forEach(item => {
                    if (!item.name && item.packageName) {
                        item.name = item.packageName;
                    }
                });
            }
        } catch (e) {
            recipesArchive = defaultSales;
            localStorage.setItem('marketProductsSales', JSON.stringify(recipesArchive));
        }
    }
}

// --- 2. 状态变量 ---
let currentDrilldown = null;
let activePatientForDetail = null;
let activePatientTrendData = {};
let detailPerturbationInterval = null;
let activeAlertStatusTab = "待处理";
let activeAlertCategoryTab = "全部";
let activeSalesTab = "pack";
let resolveTargetAlertId = null;

// --- 3. 初始化入口 ---
document.addEventListener('DOMContentLoaded', () => {
    // 如果旧缓存的 alertIncidents 没有 type 字段，提前清除，强制重新生成
    try {
        const _cached = localStorage.getItem('alertIncidents');
        if (_cached) {
            const _parsed = JSON.parse(_cached);
            if (_parsed.length > 0 && !_parsed[0].type) {
                localStorage.removeItem('alertIncidents');
            }
        }
    } catch(e) { localStorage.removeItem('alertIncidents'); }

    initLocalStorageData();
    updateScreenData();
    initCharts();
    renderSalesRankList(); // 初始化销售排名前5

    // 定时大屏主页宏观数据 5s 轮询/扰动，体现大屏“呼吸感”
    setInterval(() => {
        // 动态微调部分数值，模拟常态回传
        if (Math.random() > 0.6) {
            perturbMainScreenMetrics();
        }
    }, 5000);
});

// --- 4. 模拟大屏指标动态微调 ---
function perturbMainScreenMetrics() {
    // 随机增加部分在售销量
    if (Math.random() > 0.8) {
        recipesArchive.forEach(item => {
            if (item.stock > 0 && Math.random() > 0.7) {
                item.sales += Math.round(Math.random() * 2);
                if (item.type !== "服务包") item.stock = Math.max(0, item.stock - 1);
            }
        });
        localStorage.setItem('marketProductsSales', JSON.stringify(recipesArchive));
    }

    // 随机微调在管用户的实时体征
    patients.forEach(pat => {
        if (Math.random() > 0.5) {
            pat.metrics.hr = Math.round(pat.metrics.hr + (Math.random() * 4 - 2));
            pat.metrics.hr = Math.max(50, Math.min(140, pat.metrics.hr));
            
            pat.metrics.steps += Math.round(Math.random() * 5);
            pat.lastSync = "刚刚";
        }
    });
    localStorage.setItem('patients', JSON.stringify(patients));
    
    // 刷新大屏
    updateScreenData();
    drawHealthStatusDonut();
    renderSalesRankList();
}

// --- 5. 刷新大屏数据和统计 ---
function updateScreenData() {
    initLocalStorageData(); // 实时拉取最新数据
    
    // 5.1 医生数与在管总人数
    const activeDocs = doctors.filter(d => d.active).length;
    const patCount = patients.length;
    
    const docNumEl = document.getElementById('activeDoctorsCount');
    const userNumEl = document.getElementById('activeUsersCount');
    if (docNumEl) docNumEl.innerText = activeDocs;
    if (userNumEl) userNumEl.innerText = patCount;

    // --- 新增：统计医生职称分布 ---
    const seniorDocs = doctors.filter(d => d.title.includes("主任") || d.title.includes("副主任")).length;
    const juniorDocs = doctors.length - seniorDocs;
    const seniorPct = doctors.length > 0 ? Math.round((seniorDocs / doctors.length) * 100) : 50;
    const juniorPct = 100 - seniorPct;
    
    const distSeniorCountEl = document.getElementById('distSeniorCount');
    const distSeniorBarEl = document.getElementById('distSeniorBar');
    const distJuniorCountEl = document.getElementById('distJuniorCount');
    const distJuniorBarEl = document.getElementById('distJuniorBar');
    
    if (distSeniorCountEl) distSeniorCountEl.innerText = `${seniorDocs}人 (${seniorPct}%)`;
    if (distSeniorBarEl) distSeniorBarEl.style.width = `${seniorPct}%`;
    if (distJuniorCountEl) distJuniorCountEl.innerText = `${juniorDocs}人 (${juniorPct}%)`;
    if (distJuniorBarEl) distJuniorBarEl.style.width = `${juniorPct}%`;

    // --- 新增：统计在管居民性别和年龄分布 ---
    const maleCount = patients.filter(p => p.gender === "男").length;
    const femaleCount = patients.length - maleCount;
    const malePct = patients.length > 0 ? Math.round((maleCount / patients.length) * 100) : 50;
    const femalePct = 100 - malePct;
    
    const distGenderRatioEl = document.getElementById('distGenderRatio');
    const distMaleBarEl = document.getElementById('distMaleBar');
    const distFemaleBarEl = document.getElementById('distFemaleBar');
    
    if (distGenderRatioEl) distGenderRatioEl.innerText = `${malePct}% / ${femalePct}%`;
    if (distMaleBarEl) distMaleBarEl.style.width = `${malePct}%`;
    if (distFemaleBarEl) distFemaleBarEl.style.width = `${femalePct}%`;
    
    let totalAge = 0, countAge = 0;
    patients.forEach(p => {
        if (p.age) {
            totalAge += p.age;
            countAge++;
        }
    });
    const avgAge = countAge > 0 ? Math.round(totalAge / countAge) : 50;
    const distAvgAgeEl = document.getElementById('distAvgAge');
    if (distAvgAgeEl) distAvgAgeEl.innerText = `${avgAge} 岁`;

    // --- 新增：统计全网生理体征均值 ---
    let totalHr = 0, countHr = 0;
    let totalSteps = 0, countSteps = 0;
    patients.forEach(p => {
        if (p.metrics && p.metrics.hr) {
            totalHr += p.metrics.hr;
            countHr++;
        }
        if (p.metrics && p.metrics.steps) {
            totalSteps += p.metrics.steps;
            countSteps++;
        }
    });
    const avgHr = countHr > 0 ? Math.round(totalHr / countHr) : 72;
    const avgSteps = countSteps > 0 ? Math.round(totalSteps / countSteps) : 6230;
    
    const netAvgHrEl = document.getElementById('netAvgHeartRate');
    const netAvgStepsEl = document.getElementById('netAvgSteps');
    if (netAvgHrEl) netAvgHrEl.innerText = `${avgHr} bpm`;
    if (netAvgStepsEl) netAvgStepsEl.innerText = `${avgSteps.toLocaleString()} 步`;

    // 5.2 设备连接率统计
    // 设定“在线”手表为电量 > 0 且最后同步时间在 10 分钟以内的用户设备
    const totalDevices = patients.filter(p => p.deviceImei).length;
    const onlineDevices = patients.filter(p => p.deviceImei && p.metrics.hr > 0 && p.battery > 0).length;
    const lowBattery = patients.filter(p => p.deviceImei && p.battery < 20).length;

    const devRatioEl = document.getElementById('deviceOnlineRatio');
    const onlineDevEl = document.getElementById('onlineDevicesCount');
    const totalDevEl = document.getElementById('totalDevicesCount');
    const lowBattEl = document.getElementById('lowBatteryCount');

    if (devRatioEl) devRatioEl.innerText = `${onlineDevices} / ${totalDevices}`;
    if (onlineDevEl) onlineDevEl.innerText = `${onlineDevices} 台`;
    if (totalDevEl) totalDevEl.innerText = `${totalDevices} 台`;
    if (lowBattEl) lowBattEl.innerText = `${lowBattery} 台`;

    // 5.3 每日健康风险人数统计 (从alertIncidents统计今日去重预警人数)
    const TODAY = "2026-06-22";
    const todayAlerts = Array.isArray(alertIncidents) ? alertIncidents.filter(a => a.time && a.time.startsWith(TODAY)) : [];

    // 脑血管预警：今日去重居民数
    const cardioTodaySet = new Set(todayAlerts.filter(a => a.type && a.type.includes("脑血管")).map(a => a.patId));
    const emotionTodaySet = new Set(todayAlerts.filter(a => a.type && a.type.includes("情绪压力")).map(a => a.patId));
    const sleepTodaySet = new Set(todayAlerts.filter(a => a.type && a.type.includes("睡眠")).map(a => a.patId));
    // 三类合并去重总人数
    const totalAlertedSet = new Set([...cardioTodaySet, ...emotionTodaySet, ...sleepTodaySet]);

    const activeAlerts = cardioTodaySet.size;
    const emotionAlerts = emotionTodaySet.size;
    const sleepAlerts = sleepTodaySet.size;
    const totalAlertedCount = totalAlertedSet.size;

    const cardioCountEl = document.getElementById('cardioAlertCount');
    const emotionCountEl = document.getElementById('emotionAlertCount');
    const sleepCountEl = document.getElementById('sleepAlertCount');
    
    const alertsTodayEl = document.getElementById('alertsTodayNum');
    const breathLight = document.getElementById('redBreathLight');

    // 每日预警明细小标签
    const subCardioEl = document.getElementById('subAlertCardio');
    const subEmotionEl = document.getElementById('subAlertEmotion');
    const subSleepEl = document.getElementById('subAlertSleep');

    if (cardioCountEl) cardioCountEl.innerText = `${activeAlerts} 人`;
    if (emotionCountEl) emotionCountEl.innerText = `${emotionAlerts} 人`;
    if (sleepCountEl) sleepCountEl.innerText = `${sleepAlerts} 人`;
    
    if (alertsTodayEl) alertsTodayEl.innerText = totalAlertedCount;

    if (subCardioEl) subCardioEl.innerText = activeAlerts;
    if (subEmotionEl) subEmotionEl.innerText = emotionAlerts;
    if (subSleepEl) subSleepEl.innerText = sleepAlerts;

    if (breathLight) {
        if (totalAlertedCount > 0) {
            breathLight.style.display = "block";
        } else {
            breathLight.style.display = "none";
        }
    }
}

// --- 6. 原生 Canvas 图表绘制 ---

function initCharts() {
    drawHealthStatusDonut();
    drawAlertsTrendChart();
    drawDeviceConnectionGauge();
}

// 6.1 每日健康状态 Donut 图 (高级手绘 Canvas 弧形带呼吸阴影与圆角)
function drawHealthStatusDonut() {
    const canvas = document.getElementById('healthStatusCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 统计健康三级分布
    let normal = patients.filter(p => p.status === "健康/正常").length;
    let sub = patients.filter(p => p.status === "亚健康").length;
    let risk = patients.filter(p => p.status === "风险").length;
    let total = normal + sub + risk;

    if (total === 0) total = 1;

    const normalPct = normal / total;
    const subPct = sub / total;
    const riskPct = risk / total;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 48;
    const strokeWidth = 12;

    // 绘制垫底灰色磨砂轨道
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    let startAngle = -Math.PI / 2;

    // 1. 风险 (红色)
    if (riskPct > 0) {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = strokeWidth;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + (riskPct * 2 * Math.PI));
        ctx.stroke();
        ctx.restore();
        startAngle += riskPct * 2 * Math.PI;
    }

    // 2. 亚健康 (黄色)
    if (subPct > 0) {
        ctx.save();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = strokeWidth;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#eab308';
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + (subPct * 2 * Math.PI));
        ctx.stroke();
        ctx.restore();
        startAngle += subPct * 2 * Math.PI;
    }

    // 3. 健康/正常 (绿色)
    if (normalPct > 0) {
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = strokeWidth;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + (normalPct * 2 * Math.PI));
        ctx.stroke();
        ctx.restore();
        startAngle += normalPct * 2 * Math.PI;
    }

    // 渲染大屏旁边的图例色块文字
    const legendBox = document.getElementById('statusLegendsBox');
    if (legendBox) {
        legendBox.innerHTML = `
            <div class="legend-item">
                <span class="legend-color-dot" style="background:#10b981; box-shadow: 0 0 6px #10b981;"></span>
                <span style="font-weight: 500;">正常健康: ${normal}人 (${Math.round(normalPct*100)}%)</span>
            </div>
            <div class="legend-item" style="margin-top: 4px;">
                <span class="legend-color-dot" style="background:#eab308; box-shadow: 0 0 6px #eab308;"></span>
                <span style="font-weight: 500;">分类亚健: ${sub}人 (${Math.round(subPct*100)}%)</span>
            </div>
            <div class="legend-item" style="margin-top: 4px;">
                <span class="legend-color-dot" style="background:#ef4444; box-shadow: 0 0 6px #ef4444;"></span>
                <span style="font-weight: 500;">风险预警: ${risk}人 (${Math.round(riskPct*100)}%)</span>
            </div>
        `;
    }
}

// 6.2 近7日三类预警风险趋势多折线图 (脑血管/情绪压力/睡眠 三色折线 + 图例 + 鼠标滑动指示线与 Tooltip)
function drawAlertsTrendChart(mouseX = -1, mouseY = -1) {
    const canvas = document.getElementById('alertsTrendCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 只绑定一次事件
    if (!canvas.getAttribute('data-event-bound')) {
        canvas.setAttribute('data-event-bound', 'true');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            drawAlertsTrendChart(mx, my);
        });
        canvas.addEventListener('mouseleave', () => {
            drawAlertsTrendChart(-1, -1);
        });
    }

    // Retina 高分屏清晰绘制
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // 强制锁定逻辑，读取真实 client 宽高度而不写入 style.width
    const w = canvas.clientWidth || rect.width || 190;
    const h = canvas.clientHeight || rect.height || 100;
    
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (!Array.isArray(alertIncidents) || alertIncidents.length === 0) return;

    // 近7天日期
    const dates = ["2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22"];
    const dateLabels = ["06/16", "06/17", "06/18", "06/19", "06/20", "06/21", "06/22"];

    // 统计三类风险 7 日每日发生次数
    const seriesCardio  = dates.map(d => alertIncidents.filter(a => a.time && a.time.startsWith(d) && a.type && a.type.includes("脑血管")).length);
    const seriesEmotion = dates.map(d => alertIncidents.filter(a => a.time && a.time.startsWith(d) && a.type && a.type.includes("情绪压力")).length);
    const seriesSleep   = dates.map(d => alertIncidents.filter(a => a.time && a.time.startsWith(d) && a.type && a.type.includes("睡眠")).length);

    // 图例区高度与边距
    const legendH = 14;
    const padLeft = 24;
    const padRight = 32; // 给横轴单位留出位置
    const padTop = legendH + 8;
    const padBottom = 16;

    const graphW = w - padLeft - padRight;
    const graphH = h - padTop - padBottom;

    const allVals = [...seriesCardio, ...seriesEmotion, ...seriesSleep];
    const maxVal = Math.max(...allVals, 5);

    const xStep = graphW / (dates.length - 1);

    const getX = (i) => padLeft + i * xStep;
    const getY = (val) => padTop + graphH - (val / maxVal) * graphH;

    // 绘制网格
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 0.8;
    const gridLines = 4;
    for (let g = 0; g <= gridLines; g++) {
        const yg = padTop + (g / gridLines) * graphH;
        ctx.beginPath();
        ctx.moveTo(padLeft, yg);
        ctx.lineTo(padLeft + graphW, yg);
        ctx.stroke();
        // Y轴数值标注
        const yVal = Math.round(maxVal * (1 - g / gridLines));
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = `7px Outfit`;
        ctx.textAlign = 'right';
        ctx.fillText(yVal, padLeft - 4, yg + 2.5);
    }

    // 绘制 Y轴 单位 (人)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = `6px Inter`;
    ctx.textAlign = 'right';
    ctx.fillText('(人)', padLeft - 4, padTop - 5);

    // 三条折线配色
    const series = [
        { data: seriesCardio,  color: '#ef4444', label: '脑血管' },
        { data: seriesEmotion, color: '#f59e0b', label: '情绪压力' },
        { data: seriesSleep,   color: '#06b6d4', label: '睡眠' },
    ];

    // 计算离鼠标 X 坐标最近的日期点索引
    let activeIdx = -1;
    if (mouseX >= padLeft && mouseX <= padLeft + graphW) {
        activeIdx = Math.round((mouseX - padLeft) / xStep);
        activeIdx = Math.max(0, Math.min(dates.length - 1, activeIdx));
    }

    series.forEach(({ data, color }) => {
        if (data.every(v => v === 0)) return;

        // 绘制阴影填充区域
        ctx.save();
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(getX(data.length - 1), padTop + graphH);
        ctx.lineTo(getX(0), padTop + graphH);
        ctx.closePath();
        
        const hexToRgba = (hex, a) => {
            const r = parseInt(hex.slice(1,3),16), g2 = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
            return `rgba(${r},${g2},${b},${a})`;
        };
        const fillGrad = ctx.createLinearGradient(0, padTop, 0, padTop + graphH);
        fillGrad.addColorStop(0, hexToRgba(color, 0.15));
        fillGrad.addColorStop(1, hexToRgba(color, 0.01));
        ctx.fillStyle = fillGrad;
        ctx.fill();
        ctx.restore();

        // 绘制折线本体（带发光）
        ctx.save();
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.restore();

        // 绘制顶点圆
        data.forEach((val, i) => {
            const x = getX(i);
            const y = getY(val);
            ctx.save();
            ctx.beginPath();
            // 如果是激活的点，绘制大一点
            const isAc = (i === activeIdx);
            ctx.arc(x, y, isAc ? 4.5 : 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = color;
            ctx.lineWidth = isAc ? 2 : 1.2;
            ctx.shadowBlur = isAc ? 8 : 2;
            ctx.shadowColor = color;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
    });

    // 绘制垂直滑动辅助指示线
    if (activeIdx !== -1) {
        const x = getX(activeIdx);
        ctx.save();
        ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, padTop);
        ctx.lineTo(x, padTop + graphH);
        ctx.stroke();
        ctx.restore();
    }

    // 绘制X轴标签
    ctx.textAlign = 'center';
    dateLabels.forEach((lbl, i) => {
        const isAc = (i === activeIdx);
        ctx.fillStyle = isAc ? '#0f172a' : 'rgba(100,116,139,0.7)';
        ctx.font = isAc ? `bold 7px Outfit` : `6.5px Inter`;
        ctx.fillText(lbl, getX(i), h - 3);
    });

    // 绘制 X轴 单位 (日期)
    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    ctx.font = `6px Inter`;
    ctx.textAlign = 'left';
    ctx.fillText('(日期)', padLeft + graphW + 4, h - 3);

    // 绘制顶部图例 Legend
    const legendItems = [
        { label: '脑血管', color: '#ef4444' },
        { label: '情绪压力', color: '#f59e0b' },
        { label: '睡眠', color: '#06b6d4' },
    ];
    let legendX = padLeft;
    legendItems.forEach(({ label, color }) => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.shadowBlur = 3;
        ctx.shadowColor = color;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(legendX, 3, 10, 4, 1.5);
        } else {
            ctx.rect(legendX, 3, 10, 4);
        }
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#475569';
        ctx.font = `7px Outfit`;
        ctx.textAlign = 'left';
        ctx.fillText(label, legendX + 13, 8);
        legendX += ctx.measureText(label).width + 20;
    });

    // 绘制交互 Tooltip 气泡
    if (activeIdx !== -1) {
        ctx.save();
        const ttW = 74;
        const ttH = 46;
        const x = getX(activeIdx);
        // 智能根据左右位置反向渲染，防止超出 Canvas 边界
        let ttX = x + 8;
        if (ttX + ttW > w) {
            ttX = x - 8 - ttW;
        }
        let ttY = padTop + 5;

        // 绘制磨砂玻璃质感的深色 Tooltip 气泡
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(ttX, ttY, ttW, ttH, 6);
        } else {
            ctx.rect(ttX, ttY, ttW, ttH);
        }
        ctx.fill();
        ctx.stroke();

        // 写入警情明细
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(dates[activeIdx], ttX + 6, ttY + 10);

        ctx.font = '6.5px Inter';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`脑血管: ${seriesCardio[activeIdx]}人`, ttX + 6, ttY + 20);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`情绪压力: ${seriesEmotion[activeIdx]}人`, ttX + 6, ttY + 29);

        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`睡眠风险: ${seriesSleep[activeIdx]}人`, ttX + 6, ttY + 38);

        ctx.restore();
    }
}

// 6.3 智能手表在线率环形图 (双环多层微发光带头部能量指示粒子)
function drawDeviceConnectionGauge() {
    const canvas = document.getElementById('deviceConnectionCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = patients.filter(p => p.deviceImei).length;
    const online = patients.filter(p => p.deviceImei && p.metrics.hr > 0 && p.battery > 0).length;

    let ratio = online / (total || 1);
    ratio = Math.max(0, Math.min(1, ratio));

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 40;
    const strokeWidth = 8;
    
    // 1. 绘制外层细轨装饰线
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // 2. 绘制中层粗底轨背景
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.stroke();

    // 3. 进度圈带有双色发光渐变
    ctx.save();
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(1, '#0284c7');
    
    ctx.strokeStyle = grad;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (ratio * 2 * Math.PI));
    ctx.stroke();
    ctx.restore();

    // 4. 绘制终点处的能量指示粒子
    const endAngle = -Math.PI / 2 + (ratio * 2 * Math.PI);
    const px = cx + Math.cos(endAngle) * r;
    const py = cy + Math.sin(endAngle) * r;

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // 指示粒子背景外发光晕
    ctx.save();
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();

    // 5. 绘制中央百分比大字
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 13px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(ratio * 100)}%`, cx, cy);

    // 同步刷新连接率弹窗左侧大字连接率
    const devOnlinePct = document.getElementById('deviceOnlinePercent');
    if (devOnlinePct) devOnlinePct.innerText = `${Math.round(ratio * 100)}%`;
}



// 6.4 商品套餐销量前 5 排行榜主页渲染
function renderSalesRankList() {
    const rankList = document.getElementById('salesRankList');
    if (!rankList) return;

    // 依销量降序排列
    const sortedSales = [...recipesArchive].sort((a, b) => b.sales - a.sales).slice(0, 5);
    const maxSales = Math.max(1, sortedSales[0].sales);

    rankList.innerHTML = sortedSales.map((item, idx) => {
        const barPct = (item.sales / maxSales) * 100;
        let badgeClass = `top-${idx + 1}`;
        return `
            <div class="sales-rank-item">
                <div class="sales-name-box">
                    <span class="rank-badge ${badgeClass}">${idx + 1}</span>
                    <span>${item.name}</span>
                </div>
                <div class="sales-progress-container">
                    <div class="sales-bar-outer">
                        <div class="sales-bar-inner" style="width: ${barPct}%; background:${idx < 3 ? '#0284c7' : 'rgba(255,255,255,0.2)'}"></div>
                    </div>
                    <span class="sales-qty">${item.sales}件</span>
                </div>
            </div>
        `;
    }).join('');
}

// --- 7. 下钻弹窗 (Drilldown Modal) 控制逻辑 ---

function openDrilldown(type) {
    closeDrilldown(); // 避免重叠
    
    currentDrilldown = type;
    const modal = document.getElementById(`drilldown-${type}-modal`);
    if (modal) {
        modal.classList.add('active');
    }

    // 激活渲染
    if (type === 'doctors') {
        renderDoctorDrilldownList();
    } else if (type === 'users') {
        // 重置用户筛选为 默认“全部”或者“正常”
        renderUserDrilldownList();
    } else if (type === 'alerts') {
        renderAlertDrilldownList();
    } else if (type === 'sales') {
        renderSalesDrilldownList();
    } else if (type === 'devices') {
        renderDeviceDrilldownList();
    }
}

function closeDrilldown() {
    if (currentDrilldown) {
        const modal = document.getElementById(`drilldown-${currentDrilldown}-modal`);
        if (modal) {
            modal.classList.remove('active');
        }
        currentDrilldown = null;
    }
}

// 7.1 医生下钻渲染
function renderDoctorDrilldownList() {
    initLocalStorageData();
    const searchVal = (document.getElementById('searchDoctorInput')?.value || "").trim().toLowerCase();
    const filterDept = document.getElementById('filterDoctorDept')?.value || "";

    const tableBody = document.getElementById('drilldownDoctorTableBody');
    if (!tableBody) return;

    // 过滤
    let filtered = doctors.filter(doc => {
        const matchName = doc.name.toLowerCase().includes(searchVal);
        const matchDept = filterDept === "" || doc.dept === filterDept;
        return matchName && matchDept;
    });

    tableBody.innerHTML = filtered.map(doc => {
        // 统计该医生的今日报警（预警）和方案数
        const docAlertsCount = alertIncidents.filter(a => a.doctor === doc.name && a.alertStatus === "已解除").length;
        const docPats = patients.filter(p => p.doctor === doc.name).length;

        return `
            <tr>
                <td style="font-weight:600; color:#fff;">👨‍⚕️ ${doc.name}</td>
                <td>${doc.dept}</td>
                <td>${doc.title}</td>
                <td>${docAlertsCount} 次</td>
                <td>${docPats} 份</td>
            </tr>
        `;
    }).join('');

    // 统计左栏指标 (加防御性空值检查)
    const processedSum = alertIncidents.filter(a => a.alertStatus === "已解除").length;
    const avgSatVal = Math.round((doctors.filter(d=>d.active).length / doctors.length) * 100);

    const satEl = document.getElementById('avgDoctorSaturation');
    const procEl = document.getElementById('processedAlertsCount');
    if (satEl) satEl.innerText = `${avgSatVal}%`;
    if (procEl) procEl.innerText = `${processedSum} 次`;
}

// 7.2 居民监控下钻与状态三态联动
let selectedUserStatusFilter = ""; // "": 全部, "正常", "亚健康", "风险"

function selectStatusFilter(status) {
    selectedUserStatusFilter = status;
    
    // 排他高亮 card 样式
    const cards = ["Normal", "Sub", "Risk"];
    cards.forEach(c => {
        document.getElementById(`filterCard${c}`)?.classList.remove('active');
    });

    if (status === "正常") document.getElementById('filterCardNormal')?.classList.add('active');
    if (status === "亚健康") document.getElementById('filterCardSub')?.classList.add('active');
    if (status === "风险") document.getElementById('filterCardRisk')?.classList.add('active');

    renderUserDrilldownList();
}

function renderUserDrilldownList() {
    initLocalStorageData();
    const searchVal = (document.getElementById('searchUserInput')?.value || "").trim().toLowerCase();
    const searchDoc = (document.getElementById('searchUserDocInput')?.value || "").trim().toLowerCase();

    const tableBody = document.getElementById('drilldownUserTableBody');
    if (!tableBody) return;

    // 过滤
    let filtered = patients.filter(pat => {
        const matchName = pat.name.toLowerCase().includes(searchVal) || pat.phone.includes(searchVal);
        const matchDoc = searchDoc === "" || pat.doctor.toLowerCase().includes(searchDoc);
        const matchStatus = selectedUserStatusFilter === "" || pat.status === selectedUserStatusFilter || (selectedUserStatusFilter === "正常" && pat.status === "健康/正常");
        return matchName && matchDoc && matchStatus;
    });

    tableBody.innerHTML = filtered.map(pat => {
        let statusColor = "var(--text-primary)";
        let statusBadge = "normal-dot";
        if (pat.status === "风险") { statusColor = "var(--lvl-5)"; statusBadge = "risk-dot"; }
        else if (pat.status === "亚健康") { statusColor = "#eab308"; statusBadge = "sub-dot"; }
        else { statusColor = "#10b981"; statusBadge = "normal-dot"; }

        return `
            <tr>
                <td style="font-weight:600; color:#fff;">👤 ${pat.name}</td>
                <td>
                    <span style="display:flex; align-items:center; gap:6px; color:${statusColor}; font-weight:600;">
                        <span class="card-circle ${statusBadge}"></span>
                        ${pat.status}
                    </span>
                </td>
                <td style="font-family:'Outfit';">${pat.metrics.hr} bpm</td>
                <td style="font-family:'Outfit';">${pat.metrics.bp}</td>
                <td style="font-family:'Outfit';">${pat.metrics.spo2}%</td>
                <td style="font-family:'Outfit';">${pat.metrics.steps} 步</td>
                <td>${pat.metrics.sleep} 小时</td>
                <td>👨‍⚕️ ${pat.doctor}</td>
                <td style="font-size:10px; color:var(--text-muted);">${pat.lastSync}</td>
                <td>
                    <button class="btn btn-primary" style="padding:4px 8px; font-size:10px; border-radius:4px; box-shadow:none; cursor:pointer;" onclick="openRecordDetailModal(${pat.id})">
                        数字人详情
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // 刷新三色卡数字
    const normalCount = patients.filter(p => p.status === "健康/正常").length;
    const subCount = patients.filter(p => p.status === "亚健康").length;
    const riskCount = patients.filter(p => p.status === "风险").length;

    const normalEl = document.getElementById('filterNormalNum');
    const subEl = document.getElementById('filterSubNum');
    const riskEl = document.getElementById('filterRiskNum');

    if (normalEl) normalEl.innerText = normalCount;
    if (subEl) subEl.innerText = subCount;
    if (riskEl) riskEl.innerText = riskCount;
}

// 7.3 每日预警明细下钻工作台
function switchAlertTableFilter(status) {
    activeAlertStatusTab = status;

    const tabs = ["Pending", "Processing", "Resolved"];
    tabs.forEach(t => document.getElementById(`alertTab${t}`)?.classList.remove('active'));

    if (status === "待处理") document.getElementById('alertTabPending')?.classList.add('active');
    if (status === "跟进中") document.getElementById('alertTabProcessing')?.classList.add('active');
    if (status === "已解除") document.getElementById('alertTabResolved')?.classList.add('active');

    renderAlertDrilldownList();
}

// 新增：分类筛选切换
function switchAlertCategoryFilter(category) {
    activeAlertCategoryTab = category;

    const catBtnMap = {
        '全部': 'catTabAll',
        '脑血管': 'catTabCardio',
        '情绪压力': 'catTabEmotion',
        '睡眠': 'catTabSleep',
    };
    Object.values(catBtnMap).forEach(id => document.getElementById(id)?.classList.remove('active'));
    const activeId = catBtnMap[category];
    if (activeId) document.getElementById(activeId)?.classList.add('active');

    renderAlertDrilldownList();
}

function renderAlertDrilldownList() {
    initLocalStorageData();
    const tableBody = document.getElementById('drilldownAlertTableBody');
    if (!tableBody) return;

    // 双重交叉过滤：状态 + 分类
    let filtered = alertIncidents.filter(a => {
        const matchStatus = a.alertStatus === activeAlertStatusTab;
        const matchCategory = activeAlertCategoryTab === '全部' || (a.type && a.type.includes(activeAlertCategoryTab));
        return matchStatus && matchCategory;
    });

    tableBody.innerHTML = filtered.map(alert => {
        // 状态显示：已解除 → 已处理
        const statusDisplay = alert.alertStatus === "已解除" ? "已处理" : alert.alertStatus;
        let badgeStyle = "color:#ef4444;";
        if (alert.alertStatus === "跟进中") badgeStyle = "color:#eab308;";
        if (alert.alertStatus === "已解除") badgeStyle = "color:#10b981; font-weight:700;";

        // 居民信息：优先从alert对象取性别和年龄（新格式），否则查patients
        let residentInfo = `👤 ${alert.name}`;
        if (alert.gender && alert.age) {
            residentInfo = `👤 ${alert.name} <span style="color:#94a3b8; font-size:10px;">(${alert.gender} / ${alert.age}岁)</span>`;
        } else {
            const pat = patients.find(p => p.id === alert.patId);
            if (pat) {
                const gender = pat.gender || (pat.id % 2 === 0 ? "男" : "女");
                const age = pat.age || "—";
                residentInfo = `👤 ${alert.name} <span style="color:#94a3b8; font-size:10px;">(${gender} / ${age}岁)</span>`;
            }
        }

        return `
            <tr>
                <td style="font-family:'Outfit';">${alert.time}</td>
                <td style="font-weight:600; color:#fff;">${residentInfo}</td>
                <td style="color:#f43f5e; font-size:11px;">${alert.vitals}</td>
                <td><span style="font-weight:600; color:var(--text-primary); font-size:11px;">${alert.riskVal}</span></td>
                <td>👨‍⚕️ ${alert.doctor}</td>
                <td><span style="${badgeStyle}">${statusDisplay}</span></td>
            </tr>
        `;
    }).join('');

    if (!filtered.length) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:20px;">暂无符合条件的预警记录</td></tr>`;
    }

    // 统计左栏：今日预警总数 (2026-06-22) 及待处理预警数
    const todayTotalSum = alertIncidents.filter(a => a.time && a.time.startsWith("2026-06-22")).length;
    const pendingSum = alertIncidents.filter(a => a.alertStatus === "待处理").length;
    
    const totEl = document.getElementById('alertTotalSum');
    const pendEl = document.getElementById('alertPendingSum');

    if (totEl) totEl.innerText = `${todayTotalSum} 次`;
    if (pendEl) pendEl.innerText = `${pendingSum} 个`;
}

// 7.3.1 一键督办动作 (工作流)
function escalateAlertIncident(alertId) {
    const alert = alertIncidents.find(a => a.id === alertId);
    if (!alert) return;

    alert.alertStatus = "跟进中";
    
    // 同步到出险居民的本地状态
    const pat = patients.find(p => p.id === alert.patId);
    if (pat) {
        pat.status = "风险"; // 风险状态
    }

    localStorage.setItem('alertIncidents', JSON.stringify(alertIncidents));
    localStorage.setItem('patients', JSON.stringify(patients));

    // 模拟向医生聊天框和工单队列发督办消息
    const doctorChatKey = `quick_messages_${alert.doctor}`;
    const mockMsg = {
        sender: "SYSTEM",
        text: `【红色预警督办通知】您的在管居民 [${alert.name}] 发生脑血管红色预警，体征异常为 [${alert.vitals}]，请立即核查患者详情并下发个性化理疗方案。`,
        time: new Date().toLocaleTimeString()
    };
    const chatHistory = JSON.parse(localStorage.getItem(doctorChatKey) || "[]");
    chatHistory.push(mockMsg);
    localStorage.setItem(doctorChatKey, JSON.stringify(chatHistory));

    // 局部刷新大屏
    updateScreenData();
    renderAlertDrilldownList();
}

// 7.3.2 解除预警登记模态框
function openResolveAlertModal(alertId) {
    resolveTargetAlertId = alertId;
    const modal = document.getElementById('alert-resolve-confirm');
    const textarea = document.getElementById('alertResolveComment');
    if (textarea) textarea.value = "";
    if (modal) {
        modal.classList.add('active');
    }
}

function closeResolveAlertModal() {
    const modal = document.getElementById('alert-resolve-confirm');
    if (modal) {
        modal.classList.remove('active');
    }
    resolveTargetAlertId = null;
}

// 确认解除警情动作
function confirmResolveAlertAction() {
    const comment = (document.getElementById('alertResolveComment')?.value || "").trim();
    if (!comment) {
        alert("请输入警报解除原因！");
        return;
    }

    const alertItem = alertIncidents.find(a => a.id === resolveTargetAlertId);
    if (alertItem) {
        alertItem.alertStatus = "已解除";
        alertItem.resolveComment = comment;

        // 对应病人的 3 种风险报告评级回退为“低”，健康评级回退为“健康/正常”
        const pat = patients.find(p => p.id === alertItem.patId);
        if (pat) {
            if (pat.risks) {
                pat.risks.cardioRiskLevel = "低";
                pat.risks.emotionRiskLevel = "低";
                pat.risks.sleepRiskLevel = "低";
                pat.risks.stroke = "5.0%";
            }
            pat.status = "健康/正常";
            // 降压降心率到正常模拟
            pat.metrics.hr = 76;
            pat.metrics.spo2 = 98;
            pat.metrics.bp = "120/80";
        }
    }

    localStorage.setItem('alertIncidents', JSON.stringify(alertIncidents));
    localStorage.setItem('patients', JSON.stringify(patients));

    closeResolveAlertModal();
    updateScreenData();
    drawHealthStatusDonut();
    renderAlertDrilldownList();
}

// 7.4 商品与服务包销售及防超卖库存控制下钻
function switchSalesTab(tab) {
    activeSalesTab = tab;
    
    const btns = ["Pack", "Item"];
    btns.forEach(b => document.getElementById(`salesTab${b}`)?.classList.remove('active'));

    if (tab === "pack") document.getElementById('salesTabPack')?.classList.add('active');
    if (tab === "item") document.getElementById('salesTabItem')?.classList.add('active');

    renderSalesTabContent();
}

function renderSalesDrilldownList() {
    switchSalesTab("pack"); // 默认展示套餐包
}

function renderSalesTabContent() {
    initLocalStorageData();
    const tableHead = document.getElementById('salesTableHead');
    const tableBody = document.getElementById('drilldownSalesTableBody');
    if (!tableHead || !tableBody) return;

    let filtered = [];
    if (activeSalesTab === "pack") {
        // 服务套餐
        tableHead.innerHTML = `
            <tr>
                <th>套餐服务名称</th>
                <th>服务单价</th>
                <th>累计下发/销售</th>
                <th>销售状态</th>
            </tr>
        `;
        filtered = recipesArchive.filter(r => r.type === "服务包");

        tableBody.innerHTML = filtered.map(pack => {
            // 判断是否超卖 (库存控制)
            let statusText = `<span style="color:#10b981; font-weight:700;">在售中</span>`;
            if (pack.stock <= 0) {
                statusText = `<span style="color:#ef4444; font-weight:700;">关联售罄暂不可售</span>`;
            }

            return `
                <tr>
                    <td style="font-weight:600; color:#fff;">🎁 ${pack.name || pack.packageName || ''}</td>
                    <td style="font-family:'Outfit'; color:#eab308; font-weight:600;">¥ ${pack.price}</td>
                    <td style="font-family:'Outfit';">${pack.sales} 份</td>
                    <td>${statusText}</td>
                </tr>
            `;
        }).join('');

    } else {
        // 调理商品及硬件
        tableHead.innerHTML = `
            <tr>
                <th>调理商品名称</th>
                <th>品类</th>
                <th>售价</th>
                <th>累计售出</th>
                <th>剩余物理库存</th>
                <th>销售状态</th>
            </tr>
        `;
        filtered = recipesArchive.filter(r => r.type !== "服务包");

        tableBody.innerHTML = filtered.map(item => {
            let stockStyle = "";
            let statusText = `<span style="color:#10b981; font-weight:700;">销售中</span>`;
            
            if (item.stock === 0) {
                stockStyle = "color:#ef4444; font-weight:700;";
                statusText = `<span style="color:#ef4444; font-weight:700;">已售罄</span>`;
            } else if (item.stock < 20) {
                stockStyle = "color:#eab308; font-weight:700;";
                statusText = `<span style="color:#eab308; font-weight:700;">库存紧张</span>`;
            }

            return `
                <tr>
                    <td style="font-weight:600; color:#fff;">🛍️ ${item.name || item.productName || ''}</td>
                    <td>${item.type}</td>
                    <td style="font-family:'Outfit'; color:#eab308; font-weight:600;">¥ ${item.price}</td>
                    <td style="font-family:'Outfit';">${item.sales} 件</td>
                    <td style="font-family:'Outfit'; ${stockStyle}">${item.stock} 件</td>
                    <td>${statusText}</td>
                </tr>
            `;
        }).join('');
    }

    // 统计左栏指标
    let totalSalesVal = 0;
    recipesArchive.forEach(i => totalSalesVal += i.sales * i.price);
    const lowStockCount = recipesArchive.filter(r => r.type !== "服务包" && r.stock < 20).length;

    const revText = document.getElementById('totalRevenueText');
    const lowStockEl = document.getElementById('lowStockWarningCount');

    if (revText) revText.innerText = `¥ ${totalSalesVal.toLocaleString()}`;
    if (lowStockEl) lowStockEl.innerText = `${lowStockCount} 件`;
}

// 7.5 多模态手表连接与心跳同步下钻
function renderDeviceDrilldownList() {
    initLocalStorageData();
    const tableBody = document.getElementById('drilldownDeviceTableBody');
    const filterStatus = document.getElementById('filterDeviceStatus')?.value || "";
    if (!tableBody) return;

    // 手表设备都在居民对象身上
    let filtered = patients.filter(p => p.deviceImei);

    if (filterStatus === "在线") {
        filtered = filtered.filter(p => p.metrics.hr > 0 && p.battery > 0);
    } else if (filterStatus === "离线") {
        filtered = filtered.filter(p => !(p.metrics.hr > 0 && p.battery > 0));
    } else if (filterStatus === "低电量") {
        filtered = filtered.filter(p => p.battery < 20);
    }

    tableBody.innerHTML = filtered.map(p => {
        let isOnline = p.metrics.hr > 0 && p.battery > 0;
        let battStyle = "color:var(--text-primary);";
        if (p.battery < 20) battStyle = "color:#ef4444; font-weight:700; animation: shake 0.5s infinite;";

        return `
            <tr>
                <td style="font-family:'Outfit'; font-weight:600; color:#fff;">⌚ ${p.deviceImei}</td>
                <td>${p.name}</td>
                <td>
                    <span class="badge ${isOnline ? 'badge-online' : 'badge-offline'}">
                        ${isOnline ? '🟢 在线正常' : '🔴 离线断连'}
                    </span>
                </td>
                <td>
                    <span style="color:${p.battery > 40 ? '#10b981' : '#eab308'}">
                        ${isOnline ? '-65 dBm (优秀)' : '断开'}
                    </span>
                </td>
                <td style="font-family:'Outfit'; ${battStyle}">🔋 ${p.battery}%</td>
                <td style="font-size:10px; color:var(--text-muted);">${p.lastSync}</td>
            </tr>
        `;
    }).join('');

    // 统计左栏
    const totalCount = patients.filter(p => p.deviceImei).length;
    const onlineCount = patients.filter(p => p.deviceImei && p.metrics.hr > 0 && p.battery > 0).length;
    const offlineCount = totalCount - onlineCount;
    const lowBattCount = patients.filter(p => p.deviceImei && p.battery < 20).length;

    const devOnlinePctEl = document.getElementById('deviceOnlinePercent');
    const offEl = document.getElementById('offlineDeviceSum');
    const lowBEl = document.getElementById('lowBatteryDeviceSum');
    
    if (devOnlinePctEl) {
        devOnlinePctEl.innerText = `${totalCount > 0 ? Math.round((onlineCount / totalCount) * 100) : 0}%`;
    }
    if (offEl) offEl.innerText = `${offlineCount} 台`;
    if (lowBEl) lowBEl.innerText = `${lowBattCount} 台`;
}


// ==================== 8. 居民健康画像数字人详情 Modal 逻辑 (浅色版二级下钻) ====================

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
        heart: Array.from({length: dataLen}, (_, i) => Math.round(pat.metrics.hr - 5 + Math.sin(i + seed) * 8 + Math.random() * 4)),
        o2: Array.from({length: dataLen}, (_, i) => Math.round(pat.metrics.spo2 - 1 + Math.sin(i*0.5 + seed) * 1 + Math.random() * 0.5)),
        bp: Array.from({length: dataLen}, (_, i) => {
            try {
                let sys = parseInt(pat.metrics.bp.split('/')[0]);
                return Math.round(sys - 6 + Math.sin(i*0.8 + seed) * 10 + Math.random() * 5);
            } catch(e) { return 120; }
        }),
        step: Array.from({length: dataLen}, (_, i) => Math.round(pat.metrics.steps * 0.7 + i * 150 + Math.sin(i + seed) * 300)),
        sleep: Array.from({length: dataLen}, (_, i) => parseFloat((pat.metrics.sleep - 1 + Math.sin(i*0.3 + seed) * 1.5 + Math.random() * 0.6).toFixed(1)))
    };
    
    // 限制合理范围
    activePatientTrendData.o2 = activePatientTrendData.o2.map(v => Math.max(90, Math.min(100, v)));
    activePatientTrendData.heart = activePatientTrendData.heart.map(v => Math.max(50, Math.min(150, v)));
}

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
        // 固定大屏幕高保真引线连接
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
    if (pat.status === "亚健康") {
        scores = [85, 78, 82, 80, 84, 76, 80, 50]; // 小肠偏虚，脾胃偏弱
    } else if (pat.status === "风险") {
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
    radarPoly.setAttribute("fill", pat.status === "风险" ? "rgba(239, 68, 68, 0.25)" : "rgba(2, 132, 199, 0.25)");
    radarPoly.setAttribute("stroke", pat.status === "风险" ? "#ef4444" : "#0284c7");
    radarPoly.setAttribute("stroke-width", "1.5");
    svg.appendChild(radarPoly);

    // 4. 右侧辨证诊断说明文字更新
    const diagTitle = document.getElementById('detTcmDiagTitle');
    const diagPulse = document.getElementById('detTcmDiagPulse');
    const diagSymptoms = document.getElementById('detTcmDiagSymptoms');

    if (diagTitle) {
        if (pat.status === "风险") {
            diagTitle.innerText = pat.tcmType;
            diagTitle.style.color = "var(--lvl-5)";
            if (diagPulse) diagPulse.innerText = "心肾不交，血行瘀滞。心脉突发不稳，脑部气血不畅。";
            if (diagSymptoms) diagSymptoms.innerText = "今日伴随：心悸、突发胸闷、口干面红、舌红有瘀点。";
        } else if (pat.status === "亚健康") {
            diagTitle.innerText = `${pat.tcmType} (小肠虚热) 🟡`;
            diagTitle.style.color = "#eab308";
            if (diagPulse) diagPulse.innerText = "脉象虚滑，脾运失健，心火移热于小肠。";
            if (diagSymptoms) diagSymptoms.innerText = "日常伴随：食欲不振、腹胀便秘、面色萎黄、倦怠无力。";
        } else {
            diagTitle.innerText = "气血和平，脏腑调和 🟢";
            diagTitle.style.color = "#10b981";
            if (diagPulse) diagPulse.innerText = "脉象和缓，气血充盈，小肠化物正常，气机运行周流。";
            if (diagSymptoms) diagSymptoms.innerText = "日常状态：胃纳良好，大便通顺，精神饱满，睡眠香甜。";
        }
    }
}
