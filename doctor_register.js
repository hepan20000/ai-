/* ==========================================================================
   医生端在线资质入驻提报 - 逻辑控制 (doctor_register.js)
   ========================================================================== */

let doctorsApproval = [];
let uploadedFiles = {}; // 存储已上传文件

document.addEventListener('DOMContentLoaded', () => {
    // 加载 localStorage 现有数据
    if (localStorage.getItem('doctorsApproval')) {
        doctorsApproval = JSON.parse(localStorage.getItem('doctorsApproval'));
    }
});

function updateCharCount() {
    const text = document.getElementById('reg-desc').value;
    document.getElementById('char-count-lbl').innerText = `${text.length} / 500`;
}

// 步骤切换路由
function goToStep(step) {
    // 第一步表单校验
    if (step === 2) {
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        
        if (!name || !phone) {
            alert('请填写您的基本联系信息！');
            return;
        }

        const hosp = document.getElementById('reg-hospital').value.trim();
        const dept = document.getElementById('reg-dept').value.trim();
        const lic = document.getElementById('reg-license').value.trim();
        const desc = document.getElementById('reg-desc').value.trim();
        const checks = document.querySelectorAll('.reg-tags:checked');
        
        if (!hosp || !dept || !lic || !desc) {
            alert('请完整填写执业医院、科室、证书编号及特色介绍！');
            return;
        }
        if (checks.length === 0) {
            alert('请至少勾选一个擅长调理标签！');
            return;
        }
    }

    // 切换面板激活状态
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${step}`).classList.add('active');
    
    // 切换步骤条状态
    const step1 = document.getElementById('step-1-indicator');
    const step2 = document.getElementById('step-2-indicator');
    const step3 = document.getElementById('step-3-indicator');
    
    if (step === 1) {
        step1.className = 'step-item active';
        step2.className = 'step-item';
        step3.className = 'step-item';
    } else if (step === 2) {
        step1.className = 'step-item completed';
        step2.className = 'step-item active';
        step3.className = 'step-item';
    } else if (step === 3) {
        step1.className = 'step-item completed';
        step2.className = 'step-item completed';
        step3.className = 'step-item active';
    }
}

// 模拟文件上传
function simulateUpload(docType) {
    const name = document.getElementById('reg-name').value.trim() || '新入驻医生';
    const randomSize = (Math.random() * 2 + 0.5).toFixed(1);
    const fileSuffix = Math.random() > 0.5 ? 'png' : 'pdf';
    const fileName = `${name}_${docType}.${fileSuffix}`;
    
    uploadedFiles[docType] = fileName;
    
    // 渲染上传文件名
    renderUploadedFiles();
}

function renderUploadedFiles() {
    const container = document.getElementById('uploaded-files-container');
    container.innerHTML = '';
    
    Object.keys(uploadedFiles).forEach(key => {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <div>
                <span style="color:var(--text-secondary); font-weight:600; margin-right:8px;">[资质证照]</span>
                <span class="file-name">${uploadedFiles[key]}</span>
            </div>
            <span class="file-status">✓ 模拟上传成功</span>
        `;
        container.appendChild(item);
    });
}

// 确认提交入驻
function submitRegistration() {
    // 校验文件上传
    if (!uploadedFiles['执业资格证'] || !uploadedFiles['职称资格证']) {
        alert('请模拟上传医师执业证和职称资格证！');
        return;
    }
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    
    let newDoc = {
        id: Date.now(),
        name: name,
        phone: phone, // 联系电话
        status: 'pending', // 待审核
        rejectReason: '',
        timestamp: Date.now()
    };

    const hosp = document.getElementById('reg-hospital').value.trim();
    const dept = document.getElementById('reg-dept').value.trim();
    const title = document.getElementById('reg-title').value;
    const lic = document.getElementById('reg-license').value.trim();
    const checks = document.querySelectorAll('.reg-tags:checked');
    let tags = [];
    checks.forEach(c => tags.push(c.value));
    const desc = document.getElementById('reg-desc').value.trim();

    newDoc.roleType = 'doctor';
    newDoc.hospital = hosp;
    newDoc.dept = dept;
    newDoc.title = title;
    newDoc.license = lic;
    newDoc.tags = tags.join('; ');
    newDoc.desc = desc;
    
    // 如果没有 localStorage 数据，初始化加载原 Mock 默认数组
    if (doctorsApproval.length === 0) {
        doctorsApproval = [
            {
                id: 101,
                name: '张景岳',
                hospital: '本院治未病中心',
                dept: '中医心血管科',
                title: '主任医师',
                license: 'TCM10984920492',
                tags: '失眠多梦; 脾胃调理',
                desc: '擅长结合智能手表连续生理数据开展心脑血管疾病前置筛查，及中西医结合动态干预。',
                status: 'approved',
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
            }
        ];
    }
    
    doctorsApproval.push(newDoc);
    
    // 保存至 localStorage，实现跨系统页面数据传输联动
    localStorage.setItem('doctorsApproval', JSON.stringify(doctorsApproval));
    
    // 渲染成功状态
    document.getElementById('success-doc-name').innerText = `${name} (${newDoc.title})`;
    
    goToStep(3);
}
