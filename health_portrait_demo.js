/* health_portrait_demo.js */

// ==================== 1. 数据定义与初始化 ====================
// 默认脱敏居民健康画像数据 (对接 PRD 周*伟典型指标)
const defaultPatientData = {
    name: "用****6",
    realName: "周*伟",
    phone: "139****9056",
    gender: "男",
    height: 170,
    weight: 69,
    bmi: 23.88,
    bmiStatus: "正常",
    overallAssessment: "亚健康",
    vitals: {
        heartRate: 80,
        heartRateStatus: "正常",
        spO2: 99,
        spO2Status: "正常",
        sleepHours: 5.5,
        sleepStatus: "睡眠不足",
        bpSystolic: 128,
        bpDiastolic: 53,
        bpStatus: "正常",
        steps: 6000
    },
    // 24小时各体征趋势波动历史数据
    trends: {
        heart: [78, 80, 83, 85, 92, 79, 74, 82, 80, 85],
        o2: [99, 99, 98, 99, 99, 97, 98, 99, 99, 99],
        sleep: [0, 0, 0, 1, 2, 3, 2, 3, 1, 0], // 代表清醒(0)-浅睡(1)-深睡(2-3)的状态切换
        bp: [120, 122, 128, 131, 124, 119, 122, 126, 128, 125], // 仅绘制收缩压趋势
        step: [200, 400, 1200, 1500, 2400, 3100, 4200, 4800, 5200, 6000] // 累计步数趋势
    },
    // 中医器官健康状况得分 (雷达图指标, 0.1 - 1.0)
    tcmScores: {
        heart: 0.85,    // 心
        stomach: 0.80,  // 胃
        lung: 0.90,     // 肺
        colon: 0.80,    // 大肠
        kidney: 0.88,   // 肾
        spleen: 0.85,   // 脾
        liver: 0.82,    // 肝
        intestine: 0.45 // 小肠 (亚健康)
    }
};

let currentPatient = JSON.parse(JSON.stringify(defaultPatientData));

// ==================== 2. 全局入口与生命周期 ====================
document.addEventListener("DOMContentLoaded", () => {
    // 尝试读取 localStorage 中实际在管患者数据 (保持双端数据一致)
    initPatientData();

    // 渲染各个看板模块
    renderHeaderTime();
    renderStaticProfiles();
    renderVitalCards();
    renderOverallAssessment();
    renderDiseaseRisks();
    renderSleepStackedChart();
    renderMotion24hChart();
    
    // 渲染趋势图与雷达图
    drawTrendChart("heart");
    drawTcmRadar();

    // 绑定趋势图 Tab 切换事件
    const tabButtons = document.querySelectorAll(".trend-tab");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const type = e.currentTarget.getAttribute("data-type");
            // 切换激活状态
            tabButtons.forEach(b => b.classList.remove("active"));
            e.currentTarget.classList.add("active");
            // 重新绘制趋势折线
            drawTrendChart(type);
        });
    });

    // 启动系统时间更新
    setInterval(renderHeaderTime, 1000);

    // 启动手表生理数据 5s 动态微幅扰动模拟
    startDataPerturbation();
});

// 初始化读取或合并本地患者数据
function initPatientData() {
    try {
        const patientsJson = localStorage.getItem("patients");
        if (patientsJson) {
            const patients = JSON.parse(patientsJson);
            // 寻觅名叫周伟的或者手机号为 139****9056 的人
            const match = patients.find(p => p.name.includes("伟") || p.phone.includes("139"));
            if (match) {
                // 如果存在，使用该患者的在管数据进行映射，并辅以默认的趋势数据
                currentPatient.realName = match.name;
                currentPatient.phone = match.phone;
                currentPatient.gender = match.gender || "男";
                currentPatient.height = match.height || 170;
                currentPatient.weight = match.weight || 69;
                currentPatient.bmi = match.bmi || 23.88;
                currentPatient.bmiStatus = match.bmi >= 28 ? "肥胖" : (match.bmi >= 24 ? "超重" : "正常");
                currentPatient.overallAssessment = match.grade || "亚健康";
                
                // 状态转换
                if (match.grade === "健康") {
                    currentPatient.vitals.heartRate = 74;
                    currentPatient.vitals.sleepHours = 7.5;
                    currentPatient.vitals.sleepStatus = "健康";
                } else if (match.grade === "风险") {
                    currentPatient.vitals.heartRate = 105;
                    currentPatient.vitals.sleepHours = 4.2;
                    currentPatient.vitals.sleepStatus = "严重不足";
                }
            }
        }
    } catch (e) {
        console.error("加载本地患者档案失败，将使用预设高保真Demo数据：", e);
    }
}

// 刷新顶栏时间戳
function renderHeaderTime() {
    const timeEl = document.getElementById("headerTime");
    if (timeEl) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
}

// ==================== 3. 模块 B: 用户资料渲染 ====================
function renderStaticProfiles() {
    const nameEl = document.getElementById("profile-name");
    const phoneEl = document.getElementById("profile-phone");
    const genderEl = document.getElementById("profile-gender");
    const heightEl = document.getElementById("profile-height");
    const weightEl = document.getElementById("profile-weight");
    const bmiEl = document.getElementById("profile-bmi");

    if (nameEl) nameEl.textContent = currentPatient.name;
    if (phoneEl) phoneEl.textContent = currentPatient.phone;
    if (genderEl) genderEl.textContent = currentPatient.gender;
    if (heightEl) heightEl.textContent = currentPatient.height + "cm";
    if (weightEl) weightEl.textContent = currentPatient.weight + "kg";
    if (bmiEl) {
        let textClass = "text-neon-green";
        if (currentPatient.overallAssessment === "亚健康") textClass = "text-neon-yellow";
        if (currentPatient.overallAssessment === "风险") textClass = "text-neon-red";
        
        bmiEl.innerHTML = `${currentPatient.bmi} <span class="bmi-badge">${currentPatient.bmiStatus}</span>`;
        bmiEl.className = `profile-val ${textClass}`;
    }
}

// ==================== 4. 模块 D: 实时生理体征卡片 ====================
function renderVitalCards() {
    // 渲染心率
    const hrVal = document.getElementById("vital-heart-value");
    const hrStat = document.getElementById("vital-heart-status");
    const hrTime = document.getElementById("vital-heart-time");
    if (hrVal && hrStat && hrTime) {
        hrVal.textContent = currentPatient.vitals.heartRate;
        hrStat.textContent = currentPatient.vitals.heartRateStatus;
        hrStat.className = `vital-status ${getNeonClassByStatus(currentPatient.vitals.heartRateStatus)}`;
        hrTime.textContent = `更新时间: ${getRecentTimeString()}`;
    }

    // 渲染血氧
    const o2Val = document.getElementById("vital-o2-value");
    const o2Stat = document.getElementById("vital-o2-status");
    const o2Time = document.getElementById("vital-o2-time");
    if (o2Val && o2Stat && o2Time) {
        o2Val.textContent = currentPatient.vitals.spO2;
        o2Stat.textContent = currentPatient.vitals.spO2Status;
        o2Stat.className = `vital-status ${getNeonClassByStatus(currentPatient.vitals.spO2Status)}`;
        o2Time.textContent = `更新时间: ${getRecentTimeString()}`;
    }

    // 渲染睡眠时长
    const sleepVal = document.getElementById("vital-sleep-value");
    const sleepStat = document.getElementById("vital-sleep-status");
    const sleepTime = document.getElementById("vital-sleep-time");
    if (sleepVal && sleepStat && sleepTime) {
        sleepVal.textContent = currentPatient.vitals.sleepHours.toFixed(1);
        sleepStat.textContent = currentPatient.vitals.sleepStatus;
        sleepStat.className = `vital-status ${getNeonClassByStatus(currentPatient.vitals.sleepStatus)}`;
    }

    // 渲染血压
    const bpVal = document.getElementById("vital-bp-value");
    const bpStat = document.getElementById("vital-bp-status");
    const bpTime = document.getElementById("vital-bp-time");
    if (bpVal && bpStat && bpTime) {
        bpVal.textContent = `${currentPatient.vitals.bpSystolic}/${currentPatient.vitals.bpDiastolic}`;
        bpStat.textContent = currentPatient.vitals.bpStatus;
        bpStat.className = `vital-status ${getNeonClassByStatus(currentPatient.vitals.bpStatus)}`;
        bpTime.textContent = `更新时间: ${getRecentTimeString()}`;
    }

    // 渲染今日步数
    const stepVal = document.getElementById("vital-step-value");
    if (stepVal) {
        stepVal.textContent = currentPatient.vitals.steps;
    }
}

// 辅助函数：根据状态文字获得高亮颜色类
function getNeonClassByStatus(status) {
    if (["正常", "健康", "达标"].includes(status)) return "text-neon-green";
    if (["亚健康", "睡眠不足", "临界偏高"].includes(status)) return "text-neon-yellow";
    if (["风险", "心律不齐", "严重不足", "高血压风险"].includes(status)) return "text-neon-red";
    return "text-neon-cyan";
}

// ==================== 5. 模块 C: 健康总体评估 ====================
function renderOverallAssessment() {
    const assessEl = document.getElementById("overall-assessment");
    const container = document.querySelector(".assessment-container");
    if (assessEl && container) {
        assessEl.textContent = currentPatient.overallAssessment;
        
        // 更换大评估徽章颜色
        assessEl.className = "assess-badge";
        const starsEl = container.querySelector(".assess-stars");
        let starsHtml = "";
        
        if (currentPatient.overallAssessment === "健康") {
            assessEl.classList.add("bg-neon-green");
            starsHtml = `<span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span>`;
        } else if (currentPatient.overallAssessment === "风险") {
            assessEl.classList.add("bg-neon-red");
            starsHtml = `<span class="star filled">★</span><span class="star filled">★</span><span class="star">☆</span><span class="star">☆</span><span class="star">☆</span>`;
        } else {
            // 默认亚健康
            assessEl.classList.add("bg-neon-yellow");
            starsHtml = `<span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star filled">★</span><span class="star">☆</span>`;
        }
        
        if (starsEl) starsEl.innerHTML = starsHtml;
    }
}

// ==================== 6. 模块 F: 未来一个月疾病风险概率 ====================
function renderDiseaseRisks() {
    // 房颤、心力衰竭、冠心病、心动过速、心动过缓、心梗
    const risks = {
        fib: 1.2,
        chf: 0.8,
        chd: 4.5,
        tachy: 15.2,
        brady: 2.1,
        mi: 0.6
    };
    
    // 如果患者是风险状态，提高这些概率数值
    if (currentPatient.overallAssessment === "风险") {
        risks.fib = 8.5;
        risks.chf = 5.2;
        risks.tachy = 38.6;
        risks.mi = 3.2;
    }

    Object.keys(risks).forEach(key => {
        const percentEl = document.getElementById(`risk-${key}`);
        if (percentEl) {
            percentEl.textContent = `${risks[key]}%`;
            
            // 找到相近的 progress-bar 进行宽度渲染
            const progressBg = percentEl.closest(".risk-bar-item").querySelector(".risk-progress-bar");
            if (progressBg) {
                progressBg.style.width = `${Math.min(risks[key] * 2, 100)}%`; // 乘 2 视觉上稍微明显点
                
                // 根据高低更换颜色
                progressBg.className = "risk-progress-bar";
                if (risks[key] > 10) {
                    progressBg.classList.add("bg-neon-yellow");
                    percentEl.className = "disease-percent text-neon-yellow";
                } else if (risks[key] > 20) {
                    progressBg.classList.add("bg-neon-red");
                    percentEl.className = "disease-percent text-neon-red";
                } else {
                    progressBg.classList.add("bg-neon-green");
                    percentEl.className = "disease-percent";
                }
            }
        }
    });
}

// ==================== 7. 模块 G: 睡眠分析 ====================
function renderSleepStackedChart() {
    const sleepTotalEl = document.getElementById("sleep-total");
    const sleepDeepEl = document.getElementById("sleep-deep");
    const sleepLightEl = document.getElementById("sleep-light");
    
    if (sleepTotalEl && sleepDeepEl && sleepLightEl) {
        // 心率高、风险时睡眠时长发生缩减
        if (currentPatient.overallAssessment === "风险") {
            sleepTotalEl.textContent = "4小时12分";
            sleepDeepEl.textContent = "1小时20分";
            sleepLightEl.textContent = "2小时52分";
            
            // 重算宽度
            const segAwake = document.querySelector(".seg-awake");
            const segLight = document.querySelector(".seg-light");
            const segDeep = document.querySelector(".seg-deep");
            if (segAwake && segLight && segDeep) {
                segAwake.style.width = "20%";
                segLight.style.width = "50%";
                segDeep.style.width = "30%";
            }
        } else {
            sleepTotalEl.textContent = "5小时42分";
            sleepDeepEl.textContent = "1小时40分";
            sleepLightEl.textContent = "4小时02分";
        }
    }
}

// ==================== 8. 模块 H: 运动分析 ====================
function renderMotion24hChart() {
    const container = document.getElementById("motionChartBars");
    const stepsNumEl = document.getElementById("motion-total-steps");
    
    if (stepsNumEl) {
        stepsNumEl.textContent = currentPatient.vitals.steps;
    }

    if (container) {
        container.innerHTML = "";
        
        // 24 小时虚构步数波动数据
        const hourlySteps = [
            0, 0, 0, 0, 0, 0, 50, 180, 450, 800, 320, 200, 
            600, 150, 210, 300, 750, 1200, 600, 400, 150, 80, 0, 0
        ];
        
        const maxVal = Math.max(...hourlySteps);
        
        hourlySteps.forEach((steps, hour) => {
            const bar = document.createElement("div");
            bar.className = "motion-bar";
            
            // 计算高度占比
            const pct = maxVal > 0 ? (steps / maxVal) * 100 : 0;
            bar.style.height = `${Math.max(pct, 4)}%`; // 最低高度 4% 保证有底色
            
            // 设定运动活跃卡片 (早上8点, 晚上17-18点下班活跃期)
            if (hour === 8 || hour === 17 || hour === 18) {
                bar.classList.add("active");
                bar.title = `${hour}:00 - 步数: ${steps} (强活动)`;
            } else {
                bar.title = `${hour}:00 - 步数: ${steps}`;
            }
            
            container.appendChild(bar);
        });
    }
}

// ==================== 9. 模块 E: 生理折线图绘制 ====================
function drawTrendChart(type) {
    const svg = document.getElementById("trendChart");
    if (!svg) return;
    
    // 轴线长宽定义: X: 40~380 (宽340), Y: 135~20 (高115)
    const startX = 40;
    const endX = 380;
    const startY = 135;
    const endY = 20;
    const chartHeight = startY - endY;
    const chartWidth = endX - startX;
    
    let dataset = [];
    let minVal = 0, maxVal = 100;
    let labelUnits = "";

    // 根据类型抓取数据量程与波动
    if (type === "heart") {
        dataset = currentPatient.trends.heart;
        minVal = 50; maxVal = 130;
        labelUnits = "次/分";
    } else if (type === "o2") {
        dataset = currentPatient.trends.o2;
        minVal = 94; maxVal = 100;
        labelUnits = "%";
    } else if (type === "sleep") {
        dataset = currentPatient.trends.sleep;
        minVal = 0; maxVal = 4;
        labelUnits = "脑波度";
    } else if (type === "bp") {
        dataset = currentPatient.trends.bp;
        minVal = 80; maxVal = 150;
        labelUnits = "mmHg";
    } else if (type === "step") {
        dataset = currentPatient.trends.step;
        minVal = 0; maxVal = 8000;
        labelUnits = "步";
    }

    // 更新 Y 轴的 4 档刻度值
    const delta = (maxVal - minVal) / 4;
    const lbl1 = document.querySelector(".y-label-1");
    const lbl2 = document.querySelector(".y-label-2");
    const lbl3 = document.querySelector(".y-label-3");
    const lbl4 = document.querySelector(".y-label-4");
    
    if (lbl1) lbl1.textContent = Math.round(maxVal) + labelUnits;
    if (lbl2) lbl2.textContent = Math.round(maxVal - delta) + labelUnits;
    if (lbl3) lbl3.textContent = Math.round(minVal + delta * 2) + labelUnits;
    if (lbl4) lbl4.textContent = Math.round(minVal + delta) + labelUnits;

    // 计算各节点坐标
    const pointsCount = dataset.length;
    const segmentWidth = chartWidth / (pointsCount - 1);
    
    let pointsCoordinates = [];
    for (let i = 0; i < pointsCount; i++) {
        const val = dataset[i];
        const x = startX + i * segmentWidth;
        // 映射 Y 轴坐标
        const ratio = (val - minVal) / (maxVal - minVal);
        const y = startY - ratio * chartHeight;
        pointsCoordinates.push({ x, y });
    }

    // 绘制 SVG 折线路径
    const linePath = document.getElementById("trendLinePath");
    const areaPath = document.getElementById("trendAreaPath");
    const pointsGroup = document.getElementById("trendPoints");

    if (linePath && areaPath && pointsGroup) {
        // 拼接折线 d 路径 (平滑二次贝塞尔曲线或直折线)
        let lineD = "";
        let areaD = `M ${startX} ${startY} `; // 闭合填充起点

        pointsCoordinates.forEach((pt, idx) => {
            if (idx === 0) {
                lineD += `M ${pt.x} ${pt.y} `;
            } else {
                // 折线
                lineD += `L ${pt.x} ${pt.y} `;
            }
            areaD += `L ${pt.x} ${pt.y} `;
        });

        areaD += `L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${startY} Z`; // 闭合渐变

        // 应用路径
        linePath.setAttribute("d", lineD);
        areaPath.setAttribute("d", areaD);

        // 重新设定折线渐现动画效果 (重置 stroke-dashoffset)
        linePath.style.animation = "none";
        linePath.offsetHeight; // 触发 reflow 刷新
        linePath.style.animation = "drawLine 2.5s ease-out forwards";

        // 渲染圆点节点
        pointsGroup.innerHTML = "";
        pointsCoordinates.forEach((pt, idx) => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", pt.x);
            circle.setAttribute("cy", pt.y);
            circle.setAttribute("r", "3.5");
            circle.setAttribute("fill", "#020617");
            circle.setAttribute("stroke", "#00f0ff");
            circle.setAttribute("stroke-width", "1.5");
            
            // 鼠标悬停显示数据气泡
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `数值: ${dataset[idx]} ${labelUnits}`;
            circle.appendChild(title);
            
            pointsGroup.appendChild(circle);
        });
    }
}

// ==================== 10. 模块 I: 器官分析雷达图绘制 ====================
function drawTcmRadar() {
    const polygon = document.getElementById("radarValuePolygon");
    if (!polygon) return;

    const centerX = 80;
    const centerY = 80;
    const maxRadius = 70; // 顶端雷达图半径

    // 8个方向的器官顺序及角度 (以 -90 度为首，按顺时针旋转，每次增加 45 度)
    const angles = [
        -Math.PI / 2,         // 心
        -Math.PI / 4,         // 胃
        0,                    // 肺
        Math.PI / 4,          // 大肠
        Math.PI / 2,          // 肾
        3 * Math.PI / 4,      // 脾
        Math.PI,              // 肝
        -3 * Math.PI / 4      // 小肠
    ];

    const scores = [
        currentPatient.tcmScores.heart,
        currentPatient.tcmScores.stomach,
        currentPatient.tcmScores.lung,
        currentPatient.tcmScores.colon,
        currentPatient.tcmScores.kidney,
        currentPatient.tcmScores.spleen,
        currentPatient.tcmScores.liver,
        currentPatient.tcmScores.intestine
    ];

    let pointsStr = "";
    
    angles.forEach((angle, idx) => {
        const score = scores[idx];
        const radius = score * maxRadius;
        
        // 计算雷达顶点的 X, Y
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        pointsStr += `${x.toFixed(1)},${y.toFixed(1)} `;
    });

    polygon.setAttribute("points", pointsStr.trim());
}

// ==================== 11. 手表生理指标 5s 动态微幅扰动模拟 ====================
function startDataPerturbation() {
    setInterval(() => {
        // 心率微小扰动 (在 78-83 之间浮动)
        const hrDiff = Math.random() > 0.5 ? 1 : -1;
        let newHr = currentPatient.vitals.heartRate + hrDiff;
        if (newHr < 70) newHr = 72;
        if (newHr > 110) newHr = 95;
        currentPatient.vitals.heartRate = newHr;

        // 血压微小扰动 (高压 125-131 波动)
        const bpDiff = Math.random() > 0.5 ? 1 : -1;
        let newBpSys = currentPatient.vitals.bpSystolic + bpDiff;
        if (newBpSys < 115) newBpSys = 120;
        if (newBpSys > 140) newBpSys = 135;
        currentPatient.vitals.bpSystolic = newBpSys;

        // 步数逐步微量累加 (每次加 2 - 8 步)
        const stepAdd = Math.floor(Math.random() * 7) + 2;
        currentPatient.vitals.steps += stepAdd;

        // 对历史折线图的最后一项进行动态同步更新
        currentPatient.trends.heart[currentPatient.trends.heart.length - 1] = newHr;
        currentPatient.trends.bp[currentPatient.trends.bp.length - 1] = newBpSys;
        currentPatient.trends.step[currentPatient.trends.step.length - 1] = currentPatient.vitals.steps;

        // 对两侧悬浮标签的数值也进行实时更新
        updateFloatingTags();

        // 重新刷新视图卡片
        renderVitalCards();
        renderMotion24hChart();

        // 如果当前正好选中了心率/血压/步数 Tab，静默重绘折线图以表现“实时波动”
        const activeTab = document.querySelector(".trend-tab.active");
        if (activeTab) {
            const activeType = activeTab.getAttribute("data-type");
            if (["heart", "bp", "step"].includes(activeType)) {
                drawTrendChart(activeType);
            }
        }
    }, 5000);
}

// 刷新中心两侧的悬浮标签数值
function updateFloatingTags() {
    // 睡眠标签
    const tagSleep = document.querySelector(".tag-sleep .tag-value");
    if (tagSleep) tagSleep.textContent = `${currentPatient.vitals.sleepHours.toFixed(1)} 小时`;

    // 血压标签
    const tagBp = document.querySelector(".tag-bp .tag-value");
    if (tagBp) tagBp.textContent = `${currentPatient.vitals.bpSystolic}/${currentPatient.vitals.bpDiastolic} mmHg`;

    // 心率标签
    const tagHeart = document.querySelector(".tag-heart .tag-value");
    if (tagHeart) tagHeart.textContent = `${currentPatient.vitals.heartRate} 次/分`;

    // 步数标签
    const tagStep = document.querySelector(".tag-step .tag-value");
    if (tagStep) tagStep.textContent = `${currentPatient.vitals.steps} 步`;
}

// 辅助函数：获得当下的脱敏时间戳
function getRecentTimeString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}
