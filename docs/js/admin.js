/**
 * MLSTAT 2026 管理后台 / Admin Panel
 */

// 当前激活的 tab
let currentTab = 'payments';

// 分页状态
let pagination = {
    payments: { page: 1, perPage: 20 },
    posters: { page: 1, perPage: 20 },
    registrations: { page: 1, perPage: 20 },
    users: { page: 1, perPage: 20 },
    logs: { page: 1, perPage: 50 }
};

// 数据缓存（避免重复请求）
let dataCache = {};

// 海报数据缓存（避免序列化到 HTML）
let posterCache = {};

// 缴费管理 - 子标签状态
let paymentSubTab = 'pending'; // pending=待确认, confirmed=已确认

// API 基础地址
function getApiBase() {
    return 'https://api.mlstat.top';
}

function getAdminTutorialChoiceText(value) {
    if (value === true) return '参加';
    if (value === false) return '不参加';
    return '未选择';
}

// 初始化管理后台
function initAdminPage() {
    dataCache = {};
    posterCache = {};
    loadAdminDashboard();
}

// 权限检查
function checkAdminAuth() {
    const user = api.getUser();
    if (!api.isLoggedIn() || !user?.is_admin) {
        showMessage('无权限访问\nAccess denied', 'error');
        setTimeout(() => goto(''), 1500);
        return false;
    }
    return true;
}

// 加载统计数据
async function loadAdminDashboard() {
    if (!checkAdminAuth()) return;

    try {
        const stats = await api.adminGetStatistics();
        renderAdminDashboard(stats);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

function renderAdminDashboard(stats) {
    const el = document.getElementById('admin-content');
    el.innerHTML = `
        <div class="admin-container">
            <div class="admin-header">
                <i class="material-icons">admin_panel_settings</i>
                <h2>管理后台 / Admin Panel</h2>
            </div>

            <div class="admin-stats-grid">
                <div class="admin-stat-card stat-users">
                    <i class="material-icons stat-icon">people</i>
                    <div class="stat-value">${stats.users.total}</div>
                    <div class="stat-label">注册用户 / Users</div>
                </div>
                <div class="admin-stat-card stat-registrations">
                    <i class="material-icons stat-icon">event_available</i>
                    <div class="stat-value">${stats.registrations.total}</div>
                    <div class="stat-label">会议注册 / Registrations</div>
                </div>
                <div class="admin-stat-card stat-pending-payments">
                    <i class="material-icons stat-icon">pending_actions</i>
                    <div class="stat-value">${stats.payments.pending}</div>
                    <div class="stat-label">待确认缴费 / Pending</div>
                </div>
                <div class="admin-stat-card stat-pending-posters">
                    <i class="material-icons stat-icon">rate_review</i>
                    <div class="stat-value">${stats.posters.pending}</div>
                    <div class="stat-label">待审核海报 / Posters</div>
                </div>
            </div>

            <div class="admin-summary-card">
                <div class="summary-icon">
                    <i class="material-icons">payments</i>
                </div>
                <div class="summary-content">
                    <div class="summary-label">已确认缴费收入 / Confirmed Revenue</div>
                    <div class="summary-value">¥${stats.payments.total_amount.toLocaleString()}</div>
                    <div class="summary-detail">共 ${stats.payments.confirmed} 人已完成缴费 / ${stats.payments.confirmed} people confirmed</div>
                </div>
            </div>

            <div class="admin-main-card">
                <div class="admin-tab-nav">
                    <button class="${currentTab === 'payments' ? 'active' : ''}" onclick="switchTab('payments')">
                        <i class="material-icons">payment</i> 缴费审核
                    </button>
                    <button class="${currentTab === 'posters' ? 'active' : ''}" onclick="switchTab('posters')">
                        <i class="material-icons">image</i> 海报审核
                    </button>
                    <button class="${currentTab === 'registrations' ? 'active' : ''}" onclick="switchTab('registrations')">
                        <i class="material-icons">how_to_reg</i> 注册列表
                    </button>
                    <button class="${currentTab === 'users' ? 'active' : ''}" onclick="switchTab('users')">
                        <i class="material-icons">group</i> 用户列表
                    </button>
                    <button class="${currentTab === 'logs' ? 'active' : ''}" onclick="switchTab('logs')">
                        <i class="material-icons">history</i> 操作日志
                    </button>
                </div>
                <div class="admin-tab-content">
                    <div id="tab-payments" class="custom-tab-content ${currentTab === 'payments' ? 'active' : ''}">
                        <div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>
                    </div>
                    <div id="tab-posters" class="custom-tab-content ${currentTab === 'posters' ? 'active' : ''}">
                        <div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>
                    </div>
                    <div id="tab-registrations" class="custom-tab-content ${currentTab === 'registrations' ? 'active' : ''}">
                        <div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>
                    </div>
                    <div id="tab-users" class="custom-tab-content ${currentTab === 'users' ? 'active' : ''}">
                        <div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>
                    </div>
                    <div id="tab-logs" class="custom-tab-content ${currentTab === 'logs' ? 'active' : ''}">
                        <div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 加载当前 tab 内容
    switchTab(currentTab);
}

function switchTab(tab, forceReload = false) {
    currentTab = tab;
    // 更新 tab 样式
    document.querySelectorAll('.admin-tab-nav button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(getTabName(tab))) btn.classList.add('active');
    });
    // 更新内容显示
    document.querySelectorAll('.custom-tab-content').forEach(el => el.classList.remove('active'));
    const tabEl = document.getElementById('tab-' + tab);
    tabEl.classList.add('active');

    // 如果有缓存且不强制刷新，跳过请求
    const cacheKey = tab === 'payments' ? `payments_${paymentSubTab}_${pagination.payments.page}` : `${tab}_${pagination[tab].page}`;
    if (!forceReload && dataCache[cacheKey]) {
        return;
    }

    // 立即显示 loading 状态
    tabEl.innerHTML = '<div class="admin-empty"><i class="material-icons">hourglass_empty</i><p>加载中...<br><small>Loading...</small></p></div>';

    // 加载数据
    if (tab === 'payments') loadPendingPayments();
    else if (tab === 'posters') loadPendingPosters();
    else if (tab === 'registrations') loadRegistrations();
    else if (tab === 'users') loadUsers();
    else if (tab === 'logs') loadAdminLogs();
}

function getTabName(tab) {
    const names = { payments: '缴费', posters: '海报', registrations: '注册', users: '用户', logs: '日志' };
    return names[tab] || '';
}

// ==================== 缴费管理 ====================

async function loadPendingPayments() {
    const el = document.getElementById('tab-payments');
    const { page, perPage } = pagination.payments;
    const status = paymentSubTab === 'pending' ? 'submitted' : 'confirmed';
    const cacheKey = `payments_${paymentSubTab}_${page}`;

    try {
        const { registrations, total } = await api.adminGetRegistrations({ page, per_page: perPage, payment_status: status });
        dataCache[cacheKey] = true;
        const totalPages = Math.ceil(total / perPage);

        el.innerHTML = `
            <div class="admin-sub-tabs">
                <button class="${paymentSubTab === 'pending' ? 'active' : ''}" onclick="switchPaymentSubTab('pending')">待确认</button>
                <button class="${paymentSubTab === 'confirmed' ? 'active' : ''}" onclick="switchPaymentSubTab('confirmed')">已确认（待开票）</button>
            </div>
            ${paymentSubTab === 'pending' ? `
                <div class="admin-toolbar">
                    <div class="admin-count">共 ${total} 人待确认缴费</div>
                </div>
                ${registrations.length ? `
                <table class="admin-table">
                    <thead><tr><th>姓名</th><th>单位</th><th>身份</th><th>手机</th><th>教程报名</th><th>金额</th><th>操作</th></tr></thead>
                    <tbody>
                    ${registrations.map(r => {
                        const identityMap = { student: '学生', teacher: '教师', researcher: '研究人员', other: '其他' };
                        const isStudent = r.user.identity_type === 'student';
                        return `<tr>
                        <td><strong>${escapeHtml(r.user.name)}</strong></td>
                        <td>${escapeHtml(r.user.affiliation)}</td>
                        <td>${identityMap[r.user.identity_type] || '-'}${isStudent && r.has_student_id ? ' <a href="javascript:viewStudentId(' + r.id + ')" title="查看学生证"><i class="material-icons" style="font-size:16px;vertical-align:middle;color:#1976d2">badge</i></a>' : ''}</td>
                        <td>${escapeHtml(r.user.phone || '-')}</td>
                        <td>${getAdminTutorialChoiceText(r.attend_tutorial)}</td>
                        <td><strong style="color:#e53935">¥${r.payment_amount}</strong></td>
                        <td class="admin-actions">
                            <button class="admin-btn admin-btn-success" onclick="confirmPayment(${r.id})"><i class="material-icons">check</i> 确认</button>
                        </td>
                    </tr>`;
                    }).join('')}
                    </tbody>
                </table>
                ${totalPages > 1 ? renderPagination('payments', page, totalPages) : ''}
                ` : '<div class="admin-empty"><i class="material-icons">check_circle</i><p>暂无待确认的缴费</p></div>'}
            ` : `
                <div class="admin-toolbar">
                    <div class="admin-toolbar-left">
                        <div class="admin-count">共 ${total} 人已确认缴费</div>
                    </div>
                    <div class="admin-toolbar-right">
                        <button class="admin-btn" onclick="exportInvoiceInfo()"><i class="material-icons">receipt_long</i> 导出开票信息</button>
                    </div>
                </div>
                ${registrations.length ? `
                <table class="admin-table">
                    <thead><tr><th>姓名</th><th>单位</th><th>身份</th><th>手机</th><th>教程报名</th><th>金额</th><th>文档状态</th><th>操作</th></tr></thead>
                    <tbody>
                    ${registrations.map(r => {
                        const identityMap = { student: '学生', teacher: '教师', researcher: '研究人员', other: '其他' };
                        const isStudent = r.user.identity_type === 'student';
                        return `<tr>
                        <td><strong>${escapeHtml(r.user.name)}</strong></td>
                        <td>${escapeHtml(r.user.affiliation)}</td>
                        <td>${identityMap[r.user.identity_type] || '-'}${isStudent && r.has_student_id ? ' <a href="javascript:viewStudentId(' + r.id + ')" title="查看学生证"><i class="material-icons" style="font-size:16px;vertical-align:middle;color:#1976d2">badge</i></a>' : ''}</td>
                        <td>${escapeHtml(r.user.phone || '-')}</td>
                        <td>${getAdminTutorialChoiceText(r.attend_tutorial)}</td>
                        <td><strong>¥${r.payment_amount}</strong></td>
                        <td>
                            <span style="color:${r.has_invoice ? '#2e7d32' : '#888'}">${r.has_invoice ? '✓' : '○'} 发票</span><br>
                            <span style="color:${r.has_invitation ? '#2e7d32' : '#888'}">${r.has_invitation ? '✓' : '○'} 邀请函</span>
                        </td>
                        <td class="admin-actions">
                            <button class="admin-btn" onclick="showUploadModal(${r.id}, '${escapeHtml(r.user.name).replace(/'/g, "\\'")}')"><i class="material-icons">upload_file</i> 上传</button>
                        </td>
                    </tr>`;
                    }).join('')}
                    </tbody>
                </table>
                ${totalPages > 1 ? renderPagination('payments', page, totalPages) : ''}
                ` : '<div class="admin-empty"><i class="material-icons">inbox</i><p>暂无已确认的缴费</p></div>'}
            `}
        `;
    } catch (err) {
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

function switchPaymentSubTab(tab) {
    paymentSubTab = tab;
    pagination.payments.page = 1;
    switchTab('payments', true);
}

// 导出开票信息
async function exportInvoiceInfo() {
    try {
        const response = await fetch(
            getApiBase() + '/admin/registrations/export-invoice',
            { headers: { 'Authorization': `Bearer ${api.token}` } }
        );
        if (!response.ok) throw new Error('导出失败');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `开票信息_${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// 分页渲染
function renderPagination(tab, current, total) {
    let pages = '';
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    if (current > 1) {
        pages += `<button onclick="gotoPage('${tab}', ${current - 1})">‹</button>`;
    }
    for (let i = start; i <= end; i++) {
        pages += `<button class="${i === current ? 'active' : ''}" onclick="gotoPage('${tab}', ${i})">${i}</button>`;
    }
    if (current < total) {
        pages += `<button onclick="gotoPage('${tab}', ${current + 1})">›</button>`;
    }
    return `<div class="admin-pagination">${pages}</div>`;
}

function gotoPage(tab, page) {
    pagination[tab].page = page;
    switchTab(tab, true);
}

async function confirmPayment(regId) {
    if (!confirm('确认该用户已完成缴费？\nConfirm this payment?')) return;
    try {
        await api.adminConfirmPayment(regId);
        showMessage('缴费确认成功\nPayment confirmed', 'success');
        dataCache = {}; // 操作后清除所有缓存
        loadPendingPayments();
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 文档上传弹窗 ====================

function showUploadModal(regId, userName) {
    // 移除已存在的弹窗
    const existingModal = document.getElementById('admin-upload-modal');
    if (existingModal) existingModal.remove();

    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'admin-upload-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:8px;padding:24px;max-width:420px;width:90%;box-shadow:0 10px 40px rgba(0,0,0,0.2);">
            <h3 style="margin:0 0 16px;font-size:18px;">上传文档 / Upload Documents</h3>
            <p style="color:#666;margin-bottom:16px;">为 <strong>${escapeHtml(userName)}</strong> 上传文档</p>

            <div style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;">电子发票 / Invoice</label>
                <input type="file" id="modal-invoice" accept=".pdf,.png,.jpg,.jpeg" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
            </div>

            <div style="margin-bottom:16px;">
                <label style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;">邀请函 / Invitation Letter</label>
                <input type="file" id="modal-invitation" accept=".pdf,.png,.jpg,.jpeg" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
            </div>

            <div style="margin-bottom:20px;">
                <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#666;cursor:pointer;">
                    <input type="checkbox" id="modal-send-email" checked style="width:18px;height:18px;">
                    上传后发送邮件通知（附件形式）
                </label>
            </div>

            <div style="display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #eee;padding-top:16px;">
                <button onclick="closeUploadModal()" style="padding:10px 20px;background:#757575;color:#fff;border:none;border-radius:6px;cursor:pointer;">取消</button>
                <button onclick="submitUpload(${regId})" style="padding:10px 20px;background:#3f51b5;color:#fff;border:none;border-radius:6px;cursor:pointer;">上传</button>
            </div>
        </div>
    `;

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeUploadModal();
    });

    document.body.appendChild(modal);
}

function closeUploadModal() {
    const modal = document.getElementById('admin-upload-modal');
    if (modal) modal.remove();
}

async function submitUpload(regId) {
    const invoiceFile = document.getElementById('modal-invoice').files[0];
    const invitationFile = document.getElementById('modal-invitation').files[0];
    const sendEmail = document.getElementById('modal-send-email').checked;

    if (!invoiceFile && !invitationFile) {
        showMessage('请至少选择一个文件\nPlease select at least one file', 'warning');
        return;
    }

    try {
        let uploadCount = 0;

        // 上传发票
        if (invoiceFile) {
            const formData = new FormData();
            formData.append('registration_id', regId);
            formData.append('doc_type', 'invoice');
            formData.append('file', invoiceFile);
            await api.adminUploadDocument(formData);
            uploadCount++;
        }

        // 上传邀请函
        if (invitationFile) {
            const formData = new FormData();
            formData.append('registration_id', regId);
            formData.append('doc_type', 'invitation');
            formData.append('file', invitationFile);
            await api.adminUploadDocument(formData);
            uploadCount++;
        }

        // 发送邮件
        if (sendEmail) {
            try {
                const result = await api.request(`/admin/documents/send/${regId}`, { method: 'POST' });
                showMessage(`上传成功，邮件已发送\n${result.message}`, 'success');
            } catch (e) {
                showMessage(`上传成功，但邮件发送失败: ${e.message}`, 'warning');
            }
        } else {
            showMessage(`上传成功 (${uploadCount} 个文件)`, 'success');
        }

        closeUploadModal();
        dataCache = {}; // 操作后清除所有缓存
        loadPendingPayments(); // 刷新列表
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 海报审核 ====================

async function loadPendingPosters() {
    const el = document.getElementById('tab-posters');
    const { page, perPage } = pagination.posters;
    const cacheKey = `posters_${page}`;

    try {
        const { posters, total } = await api.adminGetPosters({ page, per_page: perPage });
        dataCache[cacheKey] = true;
        const totalPages = Math.ceil(total / perPage);
        const statusMap = { submitted: '待审核', accepted: '已通过', rejected: '已拒绝', revision_required: '需修改' };

        // 缓存海报数据，避免序列化到 HTML 属性
        posters.forEach(p => { posterCache[p.id] = p; });

        el.innerHTML = `
            <div class="admin-toolbar">
                <div class="admin-count">共 ${total} 条记录</div>
            </div>
            ${posters.length ? `
            <table class="admin-table">
                <thead><tr><th>海报标题</th><th>作者</th><th>提交者</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                ${posters.map(p => `<tr>
                    <td><strong>${escapeHtml(p.title)}</strong></td>
                    <td>${escapeHtml(p.authors)}</td>
                    <td>${escapeHtml(p.user.name)}</td>
                    <td><span class="dash-status dash-status-${p.status}">${statusMap[p.status] || '-'}</span></td>
                    <td class="admin-actions">
                        <button class="admin-btn" onclick="showReviewModal(posterCache[${p.id}])"><i class="material-icons">rate_review</i> ${p.status === 'submitted' ? '审核' : '查看'}</button>
                    </td>
                </tr>`).join('')}
                </tbody>
            </table>
            ${totalPages > 1 ? renderPagination('posters', page, totalPages) : ''}
            ` : '<div class="admin-empty"><i class="material-icons">inbox</i><p>暂无记录</p></div>'}
        `;
    } catch (err) {
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

// ==================== 海报审核弹窗 ====================

async function showReviewModal(poster) {
    // 移除已存在的弹窗
    const existingModal = document.getElementById('admin-review-modal');
    if (existingModal) existingModal.remove();

    // 获取海报详情（包含历史记录）
    let history = [];
    try {
        const response = await api.getPoster(poster.id);
        if (response.poster && response.poster.history) {
            history = response.poster.history;
        }
    } catch (e) {
        console.warn('获取历史记录失败', e);
    }

    const user = poster.user;
    const identityMap = { student: '学生', teacher: '教师', researcher: '研究人员', other: '其他' };
    const statusMap = { submitted: '待审核', accepted: '已通过', rejected: '已拒绝', revision_required: '需修改' };
    const isReviewed = poster.status !== 'submitted';

    // 创建弹窗
    const modal = document.createElement('div');
    modal.id = 'admin-review-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;overflow-y:auto;padding:20px;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:8px;padding:24px;max-width:560px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,0.2);margin:auto;">
            <h3 style="margin:0 0 16px;font-size:18px;">${isReviewed ? '查看海报' : '审核海报'}</h3>

            <div style="background:#e3f2fd;padding:12px;border-radius:6px;margin-bottom:12px;">
                <div style="font-weight:600;color:#1565c0;margin-bottom:8px;">海报信息</div>
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                    <tr><td style="padding:4px 8px 4px 0;color:#1565c0;width:80px;vertical-align:top;">标题</td><td style="padding:4px 0;"><strong>${escapeHtml(poster.title)}</strong></td></tr>
                    <tr><td style="padding:4px 8px 4px 0;color:#1565c0;vertical-align:top;">作者</td><td style="padding:4px 0;">${escapeHtml(poster.authors)}</td></tr>
                    ${poster.corresponding_author ? `<tr><td style="padding:4px 8px 4px 0;color:#1565c0;vertical-align:top;">通讯作者</td><td style="padding:4px 0;">${escapeHtml(poster.corresponding_author)}</td></tr>` : ''}
                    ${poster.keywords ? `<tr><td style="padding:4px 8px 4px 0;color:#1565c0;vertical-align:top;">关键词</td><td style="padding:4px 0;">${escapeHtml(poster.keywords)}</td></tr>` : ''}
                    <tr><td style="padding:4px 8px 4px 0;color:#1565c0;vertical-align:top;">提交时间</td><td style="padding:4px 0;">${poster.created_at ? new Date(poster.created_at).toLocaleString('zh-CN') : '-'}</td></tr>
                </table>
                ${poster.abstract ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(21,101,192,0.2);"><div style="color:#1565c0;font-size:13px;margin-bottom:4px;">摘要</div><div style="font-size:13px;line-height:1.5;color:#333;max-height:120px;overflow-y:auto;">${escapeHtml(poster.abstract)}</div></div>` : ''}
            </div>

            <div style="background:#f5f5f5;padding:12px;border-radius:6px;margin-bottom:16px;">
                <div style="font-weight:600;color:#333;margin-bottom:8px;">提交者信息</div>
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                    <tr><td style="padding:4px 8px 4px 0;color:#666;width:70px;">姓名</td><td style="padding:4px 0;"><strong>${escapeHtml(user.name)}</strong></td></tr>
                    <tr><td style="padding:4px 8px 4px 0;color:#666;">单位</td><td style="padding:4px 0;">${escapeHtml(user.affiliation || '-')}</td></tr>
                    <tr><td style="padding:4px 8px 4px 0;color:#666;">身份</td><td style="padding:4px 0;">${identityMap[user.identity_type] || '-'}</td></tr>
                    <tr><td style="padding:4px 8px 4px 0;color:#666;">邮箱</td><td style="padding:4px 0;">${escapeHtml(user.email)}</td></tr>
                    <tr><td style="padding:4px 8px 4px 0;color:#666;">电话</td><td style="padding:4px 0;">${escapeHtml(user.phone || '-')}</td></tr>
                </table>
            </div>

            <div style="margin-bottom:16px;">
                <button onclick="downloadAdminPoster(${poster.id})" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:12px;background:#3f51b5;color:#fff;border-radius:6px;text-decoration:none;width:100%;border:none;cursor:pointer;font-size:14px;">
                    <i class="material-icons">visibility</i> 查看海报文件
                </button>
            </div>

            ${history.length > 0 ? `
            <div style="background:#fafafa;padding:12px;border-radius:6px;margin-bottom:16px;max-height:200px;overflow-y:auto;">
                <div style="font-weight:600;color:#333;margin-bottom:10px;">历史记录</div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${history.map(h => {
                        if (h.type === 'review') {
                            const sMap = { 'accepted': '通过', 'rejected': '拒绝', 'revision_required': '需修改' };
                            return `<div style="padding:8px;background:#fff8e1;border-radius:4px;border-left:3px solid #ff9800;">
                                <div style="font-size:12px;color:#666;margin-bottom:4px;">${new Date(h.created_at).toLocaleString('zh-CN')} · 审核：<strong>${sMap[h.status] || h.status}</strong></div>
                                ${h.comment ? `<div style="font-size:13px;color:#333;">${escapeHtml(h.comment)}</div>` : ''}
                            </div>`;
                        } else if (h.type === 'update') {
                            const changesText = h.changes && h.changes.length > 0 ? h.changes.join('、') : '内容';
                            const idx = history.indexOf(h);
                            let detailLink = '';
                            if (h.detailed_changes && h.detailed_changes.length > 0) {
                                window._posterDetailedChanges = window._posterDetailedChanges || {};
                                window._posterDetailedChanges[idx] = h.detailed_changes;
                                detailLink = ` <a href="javascript:showDetailedChanges(${idx}, true)" style="color:#1976d2;font-size:11px;">查看详情</a>`;
                            }
                            return `<div style="padding:8px;background:#e3f2fd;border-radius:4px;border-left:3px solid #1976d2;">
                                <div style="font-size:12px;color:#666;">${new Date(h.created_at).toLocaleString('zh-CN')} · 用户修改：${escapeHtml(changesText)}${detailLink}</div>
                            </div>`;
                        } else if (h.type === 'submit') {
                            return `<div style="padding:8px;background:#e8f5e9;border-radius:4px;border-left:3px solid #4caf50;">
                                <div style="font-size:12px;color:#666;">${new Date(h.created_at).toLocaleString('zh-CN')} · 提交海报</div>
                            </div>`;
                        }
                        return '';
                    }).join('')}
                </div>
            </div>
            ` : ''}

            ${isReviewed ? `
                <div style="background:${poster.status === 'accepted' ? '#e8f5e9' : poster.status === 'rejected' ? '#ffebee' : '#fff3e0'};padding:12px;border-radius:6px;margin-bottom:16px;">
                    <div style="font-weight:600;margin-bottom:8px;">审核结果：<span class="dash-status dash-status-${poster.status}">${statusMap[poster.status]}</span></div>
                    ${poster.review_comment ? `<div style="font-size:14px;color:#666;margin-bottom:6px;">审核意见：${escapeHtml(poster.review_comment)}</div>` : ''}
                    <div style="font-size:12px;color:#999;">
                        ${poster.reviewer_name ? `审核人：${escapeHtml(poster.reviewer_name)}` : ''}
                        ${poster.reviewed_at ? ` | 时间：${new Date(poster.reviewed_at).toLocaleString('zh-CN')}` : ''}
                    </div>
                </div>
                <div style="display:flex;justify-content:flex-end;border-top:1px solid #eee;padding-top:16px;">
                    <button onclick="closeReviewModal()" style="padding:10px 20px;background:#757575;color:#fff;border:none;border-radius:6px;cursor:pointer;">关闭</button>
                </div>
            ` : `
                <div style="margin-bottom:16px;">
                    <label style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;">审核结果 / Result</label>
                    <select id="modal-review-status" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;">
                        <option value="accepted">✓ 通过 / Accept</option>
                        <option value="revision_required">⟳ 需修改 / Revision Required</option>
                        <option value="rejected">✗ 拒绝 / Reject</option>
                    </select>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;margin-bottom:6px;font-size:14px;font-weight:500;">审核意见（会发送给作者）/ Comments</label>
                    <textarea id="modal-review-comment" rows="4" placeholder="请填写审核意见..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
                </div>
                <div style="display:flex;gap:12px;justify-content:flex-end;border-top:1px solid #eee;padding-top:16px;">
                    <button onclick="closeReviewModal()" style="padding:10px 20px;background:#757575;color:#fff;border:none;border-radius:6px;cursor:pointer;">取消</button>
                    <button onclick="submitReview(${poster.id})" style="padding:10px 20px;background:#3f51b5;color:#fff;border:none;border-radius:6px;cursor:pointer;">提交审核</button>
                </div>
            `}
        </div>
    `;

    // 点击背景关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeReviewModal();
    });

    document.body.appendChild(modal);
}

function closeReviewModal() {
    const modal = document.getElementById('admin-review-modal');
    if (modal) modal.remove();
}

async function submitReview(posterId) {
    const status = document.getElementById('modal-review-status').value;
    const comment = document.getElementById('modal-review-comment').value;

    try {
        await api.adminReviewPoster(posterId, status, comment);
        showMessage('审核完成\nReview submitted', 'success');
        closeReviewModal();
        dataCache = {}; // 操作后清除所有缓存
        loadPendingPosters();
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 注册列表 ====================

async function loadRegistrations() {
    const el = document.getElementById('tab-registrations');
    const { page, perPage } = pagination.registrations;
    const cacheKey = `registrations_${page}`;

    try {
        const { registrations, total } = await api.adminGetRegistrations({ page, per_page: perPage });
        dataCache[cacheKey] = true;
        const totalPages = Math.ceil(total / perPage);
        const statusMap = { pending: '待缴费', submitted: '待确认', confirmed: '已确认' };

        el.innerHTML = `
            <div class="admin-toolbar">
                <div class="admin-toolbar-left">
                    <div class="admin-count">共 ${total} 条</div>
                </div>
                <div class="admin-toolbar-right">
                    <button class="admin-btn admin-btn-text" onclick="exportRegistrations()"><i class="material-icons">download</i> 导出</button>
                </div>
            </div>
            ${registrations.length ? `
            <table class="admin-table">
                <thead><tr><th>姓名</th><th>单位</th><th>手机</th><th>邮箱</th><th>教程报名</th><th>金额</th><th>状态</th><th>注册时间</th></tr></thead>
                <tbody>
                ${registrations.map(r => `<tr>
                    <td><strong>${escapeHtml(r.user.name)}</strong></td>
                    <td>${escapeHtml(r.user.affiliation)}</td>
                    <td>${escapeHtml(r.user.phone || '-')}</td>
                    <td><small>${escapeHtml(r.user.email)}</small></td>
                    <td>${getAdminTutorialChoiceText(r.attend_tutorial)}</td>
                    <td>¥${r.payment_amount}</td>
                    <td><span class="dash-status dash-status-${r.payment_status}">${statusMap[r.payment_status] || '-'}</span></td>
                    <td style="font-size:13px;color:#666;">${r.created_at ? new Date(r.created_at).toLocaleDateString('zh-CN') : '-'}</td>
                </tr>`).join('')}
                </tbody>
            </table>
            ${totalPages > 1 ? renderPagination('registrations', page, totalPages) : ''}
            ` : '<div class="admin-empty"><i class="material-icons">inbox</i><p>暂无记录</p></div>'}
        `;
    } catch (err) {
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

// 导出注册数据
async function exportRegistrations() {
    try {
        const response = await fetch(
            getApiBase() + '/admin/registrations/export',
            { headers: { 'Authorization': `Bearer ${api.token}` } }
        );
        if (!response.ok) throw new Error('导出失败 / Export failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations_${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 用户列表 ====================

async function loadUsers() {
    const el = document.getElementById('tab-users');
    const { page, perPage } = pagination.users;
    const cacheKey = `users_${page}`;

    try {
        const { users, total } = await api.adminGetUsers({ page, per_page: perPage, include_admins: true });
        dataCache[cacheKey] = true;
        const totalPages = Math.ceil(total / perPage);
        const currentUser = api.getUser();
        const identityMap = { student: '学生', teacher: '教师', researcher: '研究人员', other: '其他' };

        el.innerHTML = `
            <div class="admin-toolbar">
                <div class="admin-count">共 ${total} 位用户</div>
            </div>
            ${users.length ? `
            <table class="admin-table">
                <thead><tr><th>姓名</th><th>邮箱</th><th>单位</th><th>身份</th><th>操作</th></tr></thead>
                <tbody>
                ${users.map(u => `<tr>
                    <td><strong>${escapeHtml(u.name)}</strong>${u.is_admin ? ' <span class="admin-badge admin-badge-admin">管理员</span>' : ''}</td>
                    <td><small>${escapeHtml(u.email)}</small></td>
                    <td>${escapeHtml(u.affiliation)}</td>
                    <td>${identityMap[u.identity_type] || '-'}</td>
                    <td>${u.id === currentUser?.id ? '<span class="grey-text">本人</span>' :
                        (u.is_admin ?
                            `<button class="admin-btn admin-btn-danger admin-btn-text" onclick="toggleAdmin(${u.id}, false)">取消管理员</button>` :
                            `<button class="admin-btn admin-btn-secondary admin-btn-text" onclick="toggleAdmin(${u.id}, true)">设为管理员</button>`)
                    }</td>
                </tr>`).join('')}
                </tbody>
            </table>
            ${totalPages > 1 ? renderPagination('users', page, totalPages) : ''}
            ` : '<div class="admin-empty"><i class="material-icons">inbox</i><p>暂无用户</p></div>'}
        `;
    } catch (err) {
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

async function toggleAdmin(userId, isAdmin) {
    const action = isAdmin ? '设为管理员 / Set as admin' : '取消管理员权限 / Remove admin';
    if (!confirm(`确定要${action}吗？\nConfirm ${action}?`)) return;
    try {
        await api.adminSetUserAdmin(userId, isAdmin);
        showMessage(isAdmin ? '已设为管理员\nAdmin granted' : '已取消管理员权限\nAdmin removed', 'success');
        dataCache = {};
        loadUsers();
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 操作日志 ====================

let logsFilter = { type: 'all' };  // all/admin/user

async function loadAdminLogs() {
    const el = document.getElementById('tab-logs');
    const { page, perPage } = pagination.logs;
    const cacheKey = `logs_${logsFilter.type}_${page}`;

    try {
        const { logs, total } = await api.adminGetLogs({ page, per_page: perPage, type: logsFilter.type });
        dataCache[cacheKey] = true;
        const totalPages = Math.ceil(total / perPage);

        // 操作类型映射
        const actionMap = {
            // 管理员操作
            'confirm_payment': '确认缴费',
            'review_poster': '审核海报',
            'upload_document': '上传文档',
            'set_admin': '设置管理员',
            // 用户操作
            'register': '用户注册',
            'login': '用户登录',
            'conf_register': '会议注册',
            'update_tutorial_choice': '教程报名',
            'submit_payment': '提交缴费',
            'submit_poster': '提交海报',
            'update_poster': '更新海报',
            'delete_poster': '删除海报'
        };

        // 预处理日志详情（避免在模板中做 JSON.parse）
        // 注意：details 会直接插入 innerHTML（因为包含 <a> 标签），所以用户数据必须 escapeHtml
        const statusMapReview = { 'accepted': '通过', 'rejected': '拒绝', 'revision_required': '需修改' };
        window._detailedChanges = {};
        const processedLogs = logs.map(log => {
            let details = '';
            try {
                const d = JSON.parse(log.details || '{}');
                if (log.action === 'confirm_payment') {
                    details = `${escapeHtml(d.user_name || '')} ¥${d.amount || ''}`;
                } else if (log.action === 'review_poster') {
                    const titleText = d.poster_title ? escapeHtml(d.poster_title.slice(0, 15)) + '...' : '';
                    details = `${titleText} → ${statusMapReview[d.new_status] || escapeHtml(d.new_status) || '-'}`;
                } else if (log.action === 'upload_document') {
                    details = `${escapeHtml(d.user_name || '')}: ${escapeHtml(d.file_name || '')}`;
                } else if (log.action === 'set_admin') {
                    details = `${escapeHtml(d.user_name || '')} → ${d.is_admin ? '管理员' : '普通用户'}`;
                } else if (log.action === 'register') {
                    details = escapeHtml(d.email || '');
                } else if (log.action === 'conf_register') {
                    details = `${d.participation_type === 'poster' ? '海报展示' : '仅参会'} ¥${d.amount || ''}`;
                } else if (log.action === 'update_tutorial_choice') {
                    details = `${getAdminTutorialChoiceText(d.old_value)} → ${getAdminTutorialChoiceText(d.new_value)}`;
                } else if (log.action === 'submit_payment') {
                    details = `¥${d.amount || ''}`;
                } else if (log.action === 'submit_poster' || log.action === 'delete_poster') {
                    details = d.title ? escapeHtml(d.title.length > 20 ? d.title.slice(0, 20) + '...' : d.title) : '';
                } else if (log.action === 'update_poster') {
                    const title = d.title ? escapeHtml(d.title.length > 15 ? d.title.slice(0, 15) + '...' : d.title) : '';
                    const changes = d.changes && d.changes.length > 0 ? escapeHtml(d.changes.join('、')) : '';
                    details = `${title} [${changes || '无变更'}]`;
                    if (d.detailed_changes && d.detailed_changes.length > 0) {
                        window._detailedChanges[log.id] = d.detailed_changes;
                        details += ` <a href="javascript:showDetailedChanges(${log.id})" style="color:#1565c0;font-size:11px">查看</a>`;
                    }
                }
            } catch (e) { details = escapeHtml(log.details || ''); }
            return { ...log, _details: details };
        });

        el.innerHTML = `
            <div class="admin-toolbar">
                <div class="admin-filters">
                    <select onchange="filterLogs(this.value)" style="padding:6px 12px;border-radius:4px;border:1px solid #ddd;">
                        <option value="all" ${logsFilter.type === 'all' ? 'selected' : ''}>全部日志</option>
                        <option value="admin" ${logsFilter.type === 'admin' ? 'selected' : ''}>管理员操作</option>
                        <option value="user" ${logsFilter.type === 'user' ? 'selected' : ''}>用户操作</option>
                    </select>
                </div>
                <div class="admin-count">共 ${total} 条日志</div>
            </div>
            ${processedLogs.length ? `
            <table class="admin-table">
                <thead><tr><th>时间</th><th>操作人</th><th>类型</th><th>操作</th><th>详情</th><th>IP</th></tr></thead>
                <tbody>
                ${processedLogs.map(log => {
                    const typeLabel = log.is_admin_action ? '<span style="color:#1565c0;font-weight:500">管理员</span>' : '<span style="color:#666">用户</span>';
                    return `<tr>
                        <td style="white-space:nowrap;font-size:13px">${new Date(log.created_at).toLocaleString('zh-CN')}</td>
                        <td>${escapeHtml(log.user_name || '-')}</td>
                        <td>${typeLabel}</td>
                        <td>${actionMap[log.action] || log.action}</td>
                        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${log._details}</td>
                        <td style="font-size:12px;color:#888">${escapeHtml(log.ip_address || '-')}</td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
            ${totalPages > 1 ? renderPagination('logs', page, totalPages) : ''}
            ` : '<div class="admin-empty"><i class="material-icons">history</i><p>暂无操作日志</p></div>'}
        `;
    } catch (err) {
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

function filterLogs(type) {
    logsFilter.type = type;
    pagination.logs.page = 1;
    switchTab('logs', true);
}

// 显示详细变更
function showDetailedChanges(id, fromPosterModal = false) {
    try {
        const changes = fromPosterModal
            ? (window._posterDetailedChanges && window._posterDetailedChanges[id])
            : (window._detailedChanges && window._detailedChanges[id]);
        if (!changes || changes.length === 0) {
            showMessage('无变更详情', 'info');
            return;
        }
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:500px">
                <div class="modal-header">
                    <h3>修改详情 / Change Details</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detailed-changes-list">
                        ${changes.map(c => `
                            <div class="detailed-change-item">
                                <div class="change-field">${escapeHtml(c.field)}</div>
                                <div class="change-values">
                                    <div class="change-old"><span>原值：</span>${escapeHtml(c.old) || '<em>空</em>'}</div>
                                    <div class="change-arrow">→</div>
                                    <div class="change-new"><span>新值：</span>${escapeHtml(c.new) || '<em>空</em>'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    } catch (e) {
        showMessage('无法解析变更详情', 'error');
    }
}

// 管理员下载海报
function downloadAdminPoster(posterId) {
    const url = api.getPosterDownloadUrl(posterId);
    window.open(url, '_blank');
}

// 查看学生证
function viewStudentId(regId) {
    const url = `${getApiBase()}/admin/registrations/${regId}/student-id?token=${api.token}`;
    window.open(url, '_blank');
}
