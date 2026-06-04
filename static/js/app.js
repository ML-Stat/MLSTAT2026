/**
 * MLSTAT 2026 会议注册系统
 * Conference Registration System
 */

// ==================== 常量 / Constants ====================
const STATUS = {
    payment: {
        pending: '待缴费 / Pending',
        submitted: '审核中 / Under Review',
        confirmed: '已确认 / Confirmed'
    },
    poster: {
        submitted: '审核中 / Under Review',
        accepted: '已录用 / Accepted',
        revision_required: '需修改 / Revision Required',
        rejected: '未录用 / Rejected'
    },
    participation: {
        oral: '口头报告 / Oral',
        poster: '海报展示 / Poster',
        attend_only: '仅参会 / Attendance Only'
    },
    identity: {
        student: '学生 / Student',
        teacher: '教师 / Faculty',
        researcher: '研究人员 / Researcher',
        other: '其他 / Other'
    },
    document: {
        invoice: '电子发票 / Invoice',
        invitation: '邀请函 / Invitation'
    },
    tutorial: {
        yes: '参加 / Attend',
        no: '不参加 / Not Attend',
        unset: '未选择 / Not Selected'
    }
};

// ==================== 工具函数 / Utilities ====================
function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function getBasePath() {
    return window.HUGO_CONFIG?.basePath || '/';
}

function goto(path) {
    window.location.href = getBasePath() + path;
}

function showMessage(msg, type = 'info') {
    if (msg === 'SESSION_EXPIRED') return;
    const prefix = { success: '✓ ', error: '✗ ', warning: '⚠ ', info: 'ℹ ' };
    alert((prefix[type] || '') + msg);
}

function requireAuth(redirectTo = 'login/') {
    if (!api.isLoggedIn()) {
        goto(redirectTo);
        return false;
    }
    return true;
}

function getTutorialChoiceText(value) {
    if (value === true) return STATUS.tutorial.yes;
    if (value === false) return STATUS.tutorial.no;
    return STATUS.tutorial.unset;
}

// ==================== 导航栏 / Navigation ====================
function updateNavAuth() {
    // 只在注册系统相关页面显示顶部导航
    const path = window.location.pathname;
    const showAuthNavPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify', '/registration', '/tutorial', '/dashboard', '/payment', '/poster', '/documents', '/admin'];
    const shouldShow = showAuthNavPages.some(p => path.includes(p));
    if (!shouldShow) {
        return;
    }

    let el = document.getElementById('auth-nav');

    // 如果页面没有 auth-nav 元素，自动创建并插入到文章标题后
    if (!el) {
        const article = document.querySelector('article.article');
        const h1 = article?.querySelector('h1');
        if (article && h1) {
            el = document.createElement('div');
            el.id = 'auth-nav';
            el.className = 'custom-auth-nav';
            h1.insertAdjacentElement('afterend', el);
        } else {
            return;
        }
    }

    const base = getBasePath();
    const user = api.getUser();

    if (api.isLoggedIn() && user) {
        el.innerHTML = `
            <span>${escapeHtml(user.name)}</span> /
            <a href="${base}dashboard/">个人中心 / Dashboard</a>
            ${user.is_admin ? ` / <a href="${base}admin/">管理后台 / Admin</a>` : ''} /
            <a href="javascript:handleLogout()">退出 / Logout</a>
        `;
    } else {
        el.innerHTML = `
            <a href="${base}login/">登录 / Login</a> /
            <a href="${base}register/">注册 / Register</a>
        `;
    }
}

function handleLogout() {
    api.logout();
    showMessage('已退出登录\nLogged out successfully', 'success');
    setTimeout(() => goto(''), 1000);
}

// ==================== 注册/登录 / Auth ====================
async function handleRegister(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    if (data.password !== data.confirm_password) {
        return showMessage('两次输入的密码不一致\nPasswords do not match', 'error');
    }
    if (data.password.length < 8) {
        return showMessage('密码至少需要8位\nPassword must be at least 8 characters', 'error');
    }

    try {
        await api.register(data);
        showMessage('注册成功！请查收验证邮件后登录\nRegistration successful! Please check your email to verify.', 'success');
        setTimeout(() => goto('login/'), 2000);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get('email');

    try {
        await api.login(email, form.get('password'));
        showMessage('登录成功\nLogin successful', 'success');
        setTimeout(() => goto('dashboard/'), 1000);
    } catch (err) {
        if (err.message.includes('验证邮箱')) {
            showMessage('请先验证邮箱\nPlease verify your email first', 'error');
        } else {
            showMessage(err.message, 'error');
        }
    }
}

async function resendVerification(email) {
    try {
        await api.resendVerification(email);
        showMessage('验证邮件已发送\nVerification email sent', 'success');
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = e.target.querySelector('[name="email"]').value;
    try {
        await api.forgotPassword(email);
        showMessage('重置链接已发送到邮箱\nReset link has been sent to your email', 'success');
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        return showMessage('重置链接无效\nInvalid reset link', 'error');
    }

    const password = e.target.querySelector('[name="password"]').value;
    const confirm = e.target.querySelector('[name="confirm_password"]').value;

    if (password !== confirm) {
        return showMessage('两次输入的密码不一致\nPasswords do not match', 'error');
    }
    if (password.length < 8) {
        return showMessage('密码至少需要8位\nPassword must be at least 8 characters', 'error');
    }

    try {
        await api.resetPassword(token, password);
        showMessage('密码重置成功\nPassword reset successful', 'success');
        setTimeout(() => goto('login/'), 2000);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 会议注册 / Conference Registration ====================
async function handleConferenceRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    // 检查学生是否上传了学生证
    const user = api.getUser();
    if (user && user.identity_type === 'student') {
        const studentIdFile = formData.get('student_id');
        if (!studentIdFile || !studentIdFile.size) {
            return showMessage('请上传学生证照片\nPlease upload student ID photo', 'error');
        }
    }

    try {
        await api.createRegistration(formData);
        showMessage('注册成功，请前往缴费\nRegistration successful, please proceed to payment', 'success');
        setTimeout(() => goto('payment/'), 1500);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

function initRegistrationPage() {
    const user = api.getUser();
    const studentIdSection = document.getElementById('student-id-section');
    if (studentIdSection && user && user.identity_type === 'student') {
        studentIdSection.style.display = 'block';
    }
}

async function loadConferenceInfo() {
    const el = document.getElementById('conference-info');
    if (!el) return;

    try {
        const info = await api.getConferenceInfo();
        el.innerHTML = `
            <div class="conf-info-box">
                <div class="conf-info-title">${escapeHtml(info.name)}</div>
                <div class="conf-info-row"><i class="material-icons">event</i><span>时间 / Date</span><span>${escapeHtml(info.date)}</span></div>
                <div class="conf-info-row"><i class="material-icons">place</i><span>地点 / Venue</span><span>${escapeHtml(info.location)}</span></div>
                <div class="conf-info-row"><i class="material-icons">payment</i><span>费用 / Fee</span><span>普通 ¥${info.fee_regular} / 学生 ¥${info.fee_student}</span></div>
            </div>
        `;
    } catch (err) {
        el.innerHTML = '';
    }
}

async function checkRegistrationStatus() {
    try {
        const { registration } = await api.getRegistration();
        if (registration) {
            showMessage('您已完成会议注册\nYou have already registered', 'info');
            setTimeout(() => goto('dashboard/'), 1500);
            return true;
        }
    } catch (err) {
        // 未注册，可以继续
    }
    return false;
}

// ==================== 教程报名 / Tutorial Registration ====================
async function loadTutorialPage() {
    if (!requireAuth()) return;

    const el = document.getElementById('tutorial-content');
    if (!el) return;

    try {
        const { attend_tutorial } = await api.getTutorialChoice();
        renderTutorialForm(attend_tutorial);
    } catch (err) {
        if (err.message === '请先完成会议注册') {
            el.innerHTML = `
                <div class="payment-box">
                    <div class="payment-status-msg payment-status-pending">
                        <i class="material-icons">event_busy</i>
                        <div>请先完成会议注册<br><small>Please complete conference registration first</small></div>
                    </div>
                    <p style="text-align:center;margin-top:24px">
                        <a href="${getBasePath()}registration/" class="custom-btn">前往注册 / Register Now</a>
                    </p>
                </div>
            `;
            return;
        }
        el.innerHTML = `<div class="admin-empty"><i class="material-icons">error</i><p style="color:#c62828">${escapeHtml(err.message)}</p></div>`;
    }
}

function renderTutorialForm(attendTutorial) {
    const el = document.getElementById('tutorial-content');
    if (!el) return;

    const current = document.getElementById('tutorial-current');
    if (current) {
        current.innerHTML = `
            <i class="material-icons">school</i>
            <span>当前状态 / Current Status：<strong>${getTutorialChoiceText(attendTutorial)}</strong></span>
        `;
    }

    const select = document.getElementById('attend_tutorial');
    if (select) {
        select.value = attendTutorial === true ? 'true' : attendTutorial === false ? 'false' : '';
    }
}

async function handleTutorialChoice(e) {
    e.preventDefault();
    const value = new FormData(e.target).get('attend_tutorial');

    if (value !== 'true' && value !== 'false') {
        return showMessage('请选择是否参加教程\nPlease select whether to attend the tutorial', 'error');
    }

    try {
        const result = await api.updateTutorialChoice(value === 'true');
        showMessage('教程报名信息已保存\nTutorial registration saved', 'success');
        renderTutorialForm(result.attend_tutorial);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 海报提交 / Poster Submission ====================
function loadPosterPage() {
    if (!requireAuth()) return;

    const el = document.getElementById('poster-content');
    if (!el) return;

    renderPosterPage();
}

function renderPosterPage() {
    const el = document.getElementById('poster-content');

    // 只显示提交表单
    el.innerHTML = `
    <div class="custom-card" style="max-width:600px;margin:0 auto">
        <form onsubmit="handlePosterSubmit(event)" enctype="multipart/form-data">
            <div class="custom-form-group">
                <label for="title">海报标题 / Title <span class="required">*</span></label>
                <input type="text" id="title" name="title" required>
            </div>

            <div class="custom-form-group">
                <label for="authors">作者 / Authors <span class="required">*</span></label>
                <input type="text" id="authors" name="authors" required>
                <span class="helper-text">多位作者请用逗号分隔 / Separate multiple authors with commas</span>
            </div>

            <div class="custom-form-group">
                <label for="corresponding_author">通讯作者 / Corresponding Author</label>
                <input type="text" id="corresponding_author" name="corresponding_author">
            </div>

            <div class="custom-form-group">
                <label for="abstract">摘要 / Abstract</label>
                <textarea id="abstract" name="abstract" rows="4"></textarea>
                <span class="helper-text">500字以内 / Up to 500 words</span>
            </div>

            <div class="custom-form-group">
                <label for="keywords">关键词 / Keywords</label>
                <input type="text" id="keywords" name="keywords">
                <span class="helper-text">3-5个关键词，逗号分隔 / 3-5 keywords, separated by commas</span>
            </div>

            <div class="custom-form-group">
                <label for="file">海报文件 / Poster File <span class="required">*</span></label>
                <input type="file" id="file" name="file" accept=".pdf,.png,.jpg,.jpeg" required>
                <span class="helper-text">支持 PDF, PNG, JPG（最大 20MB）/ PDF, PNG, JPG (max 20MB)</span>
            </div>

            <div style="text-align:center;margin-top:1.5rem">
                <button type="submit" class="custom-btn custom-btn-large">
                    <i class="material-icons">send</i>
                    提交海报 / Submit Poster
                </button>
            </div>
        </form>
    </div>`;
}

// 查看海报详情
async function viewPosterDetail(posterId) {
    try {
        const { poster } = await api.getPoster(posterId);

        const statusClass = poster.status === 'accepted' ? 'success' :
                           poster.status === 'rejected' ? 'error' :
                           poster.status === 'revision_required' ? 'warning' : 'info';

        // 构建审核历史HTML（用户只看审核意见）
        let historyHtml = '';
        const reviews = poster.history ? poster.history.filter(h => h.type === 'review') : [];
        if (reviews.length > 0) {
            const statusMap = {
                'accepted': '录用 / Accepted',
                'rejected': '未录用 / Rejected',
                'revision_required': '待修改 / Revision Required'
            };
            historyHtml = `
                <div class="detail-group">
                    <label>审核记录 / Review History</label>
                    <div class="review-history-list">
                        ${reviews.map((h, i) => `
                            <div class="review-history-item ${i === 0 ? 'latest' : ''}">
                                <div class="review-history-header">
                                    <span class="review-history-status">${statusMap[h.status] || h.status}</span>
                                    <span class="review-history-meta">${new Date(h.created_at).toLocaleString('zh-CN')}</span>
                                </div>
                                ${h.comment ? `<div class="review-history-comment">${escapeHtml(h.comment)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px">
                <div class="modal-header">
                    <h3>海报详情 / Poster Details</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-group">
                        <label>标题 / Title</label>
                        <p>${escapeHtml(poster.title)}</p>
                    </div>
                    <div class="detail-group">
                        <label>作者 / Authors</label>
                        <p>${escapeHtml(poster.authors)}</p>
                    </div>
                    ${poster.corresponding_author ? `
                    <div class="detail-group">
                        <label>通讯作者 / Corresponding Author</label>
                        <p>${escapeHtml(poster.corresponding_author)}</p>
                    </div>` : ''}
                    ${poster.abstract ? `
                    <div class="detail-group">
                        <label>摘要 / Abstract</label>
                        <p style="white-space:pre-wrap">${escapeHtml(poster.abstract)}</p>
                    </div>` : ''}
                    ${poster.keywords ? `
                    <div class="detail-group">
                        <label>关键词 / Keywords</label>
                        <p>${escapeHtml(poster.keywords)}</p>
                    </div>` : ''}
                    <div class="detail-group">
                        <label>状态 / Status</label>
                        <p><span class="custom-status custom-status-${statusClass}">${STATUS.poster[poster.status]}</span></p>
                    </div>
                    ${historyHtml ? historyHtml : `
                    <div class="detail-group">
                        <label>审核意见 / Review Comment</label>
                        <p ${poster.review_comment ? 'class="review-comment-box"' : ''}>${poster.review_comment ? escapeHtml(poster.review_comment) : '无 / None'}</p>
                    </div>
                    `}
                    <div class="detail-group">
                        <label>文件 / File</label>
                        <p><button onclick="downloadPosterFile(${poster.id})" class="custom-btn custom-btn-small"><i class="material-icons">download</i> ${escapeHtml(poster.file_name)}</button></p>
                    </div>
                    ${(poster.status === 'submitted' || poster.status === 'revision_required') ? `
                    <div class="detail-actions">
                        <button class="custom-btn" onclick="this.closest('.modal-overlay').remove(); editPoster(${poster.id})">
                            <i class="material-icons">edit</i> 编辑 / Edit
                        </button>
                        <button class="custom-btn custom-btn-secondary" onclick="this.closest('.modal-overlay').remove(); deletePoster(${poster.id})">
                            <i class="material-icons">delete</i> 删除 / Delete
                        </button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// 编辑海报
async function editPoster(posterId) {
    try {
        const { poster } = await api.getPoster(posterId);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:600px">
                <div class="modal-header">
                    <h3>编辑海报 / Edit Poster</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form onsubmit="handlePosterUpdate(event, ${posterId})" enctype="multipart/form-data">
                        <div class="custom-form-group">
                            <label>标题 / Title <span class="required">*</span></label>
                            <input type="text" name="title" value="${escapeHtml(poster.title)}" required>
                        </div>
                        <div class="custom-form-group">
                            <label>作者 / Authors <span class="required">*</span></label>
                            <input type="text" name="authors" value="${escapeHtml(poster.authors)}" required>
                        </div>
                        <div class="custom-form-group">
                            <label>通讯作者 / Corresponding Author</label>
                            <input type="text" name="corresponding_author" value="${escapeHtml(poster.corresponding_author || '')}">
                        </div>
                        <div class="custom-form-group">
                            <label>摘要 / Abstract</label>
                            <textarea name="abstract" rows="4">${escapeHtml(poster.abstract || '')}</textarea>
                        </div>
                        <div class="custom-form-group">
                            <label>关键词 / Keywords</label>
                            <input type="text" name="keywords" value="${escapeHtml(poster.keywords || '')}">
                        </div>
                        <div class="custom-form-group">
                            <label>更换文件 / Replace File (可选)</label>
                            <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg">
                            <span class="helper-text">当前文件: ${escapeHtml(poster.file_name)}</span>
                        </div>
                        <div style="text-align:center;margin-top:1.5rem">
                            <button type="submit" class="custom-btn">保存 / Save</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// 更新海报
async function handlePosterUpdate(e, posterId) {
    e.preventDefault();
    try {
        await api.updatePoster(posterId, new FormData(e.target));
        showMessage('更新成功 / Updated successfully', 'success');
        document.querySelector('.modal-overlay')?.remove();
        // 刷新 dashboard 页面
        if (window.location.pathname.includes('/dashboard')) {
            loadDashboard();
        }
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// 删除海报
async function deletePoster(posterId) {
    if (!confirm('确定要删除这个海报吗？此操作不可撤销。\nAre you sure you want to delete this poster? This cannot be undone.')) {
        return;
    }
    try {
        await api.deletePoster(posterId);
        showMessage('删除成功 / Deleted successfully', 'success');
        // 刷新 dashboard 页面
        if (window.location.pathname.includes('/dashboard')) {
            loadDashboard();
        }
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

async function handlePosterSubmit(e) {
    e.preventDefault();

    const fileInput = e.target.querySelector('input[type="file"]');
    if (!fileInput.files.length) {
        return showMessage('请选择海报文件\nPlease select a poster file', 'error');
    }

    try {
        await api.createPoster(new FormData(e.target));
        showMessage('海报提交成功\nPoster submitted successfully', 'success');
        setTimeout(() => goto('dashboard/'), 1500);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 缴费 / Payment ====================
async function loadPaymentPage() {
    if (!requireAuth()) return;

    const el = document.getElementById('payment-content');
    if (!el) return;

    try {
        const { registration } = await api.getRegistration();
        renderPaymentInfo(registration);
    } catch (err) {
        el.innerHTML = `
            <div class="custom-message-box custom-warning">
                <i class="material-icons">info</i>
                <div>请先完成会议注册<br><small>Please complete conference registration first</small></div>
            </div>
            <p style="margin-top:1rem">
                <a href="${getBasePath()}registration/" class="custom-btn">前往注册 / Register Now</a>
            </p>
        `;
    }
}

function renderPaymentInfo(reg) {
    const el = document.getElementById('payment-content');
    if (!el) return;
    const base = getBasePath();
    const user = api.getUser();
    const isStudent = user && user.identity_type === 'student';
    const qrCode = isStudent ? 'payment_code_student.png' : 'payment_code.png';
    const feeType = isStudent ? '学生 / Student' : '普通 / Regular';

    if (reg.payment_status === 'pending') {
        el.innerHTML = `
            <div class="payment-box">
                <div class="payment-amount">
                    <div class="payment-label">应缴金额 / Amount Due (${feeType})</div>
                    <div class="payment-price">¥${reg.payment_amount}</div>
                </div>
                <div class="payment-qr">
                    <img src="${base}images/${qrCode}" alt="Payment QR Code">
                    <div class="payment-tip">微信扫码支付<br><small>Scan with WeChat</small></div>
                </div>
                <div class="payment-note">
                    <i class="material-icons">info</i>
                    <span>支付时请备注：<strong>手机+电子邮箱+发票抬头</strong><br><small>Note: Phone + Email + Invoice Title</small></span>
                </div>
                <button onclick="submitPayment()" class="custom-btn" style="width:100%">
                    <i class="material-icons">check</i> 我已完成支付 / I Have Paid
                </button>
                <p style="text-align:center;margin-top:16px">
                    <a href="${base}dashboard/" style="color:#666">← 返回个人中心 / Back to Dashboard</a>
                </p>
            </div>
        `;
    } else if (reg.payment_status === 'submitted') {
        el.innerHTML = `
            <div class="payment-box">
                <div class="payment-status-msg payment-status-pending">
                    <i class="material-icons">schedule</i>
                    <div>
                        <strong>缴费信息已提交，等待确认中</strong><br>
                        <small>Payment submitted, awaiting admin confirmation</small>
                    </div>
                </div>
                <div class="payment-amount">
                    <div class="payment-label">应缴金额 / Amount Due (${feeType})</div>
                    <div class="payment-price">¥${reg.payment_amount}</div>
                </div>
                <div class="payment-qr">
                    <img src="${base}images/${qrCode}" alt="Payment QR Code">
                    <div class="payment-tip">如未支付，请扫码支付<br><small>If not paid, please scan to pay</small></div>
                </div>
                <div class="payment-note">
                    <i class="material-icons">info</i>
                    <span>支付时请备注：<strong>手机+电子邮箱+发票抬头</strong><br><small>Note: Phone + Email + Invoice Title</small></span>
                </div>
                <p style="text-align:center;margin-top:16px">
                    <a href="${base}dashboard/" style="color:#666">← 返回个人中心 / Back to Dashboard</a>
                </p>
            </div>
        `;
    } else if (reg.payment_status === 'confirmed') {
        el.innerHTML = `
            <div class="payment-box">
                <div class="payment-status-msg payment-status-success">
                    <i class="material-icons">check_circle</i>
                    <div>
                        <strong>缴费已确认</strong><br>
                        <small>Payment confirmed successfully</small>
                    </div>
                </div>
                <div class="payment-info-row"><span>已缴金额</span><span>¥${reg.payment_amount}</span></div>
                <a href="${base}documents/" class="custom-btn" style="width:100%;margin-top:16px">
                    <i class="material-icons">download</i> 下载资料 / Download Documents
                </a>
                <p style="text-align:center;margin-top:16px">
                    <a href="${base}dashboard/" style="color:#666">← 返回个人中心 / Back to Dashboard</a>
                </p>
            </div>
        `;
    }
}

async function submitPayment() {
    try {
        await api.submitPayment();
        showMessage('缴费信息已提交，请等待管理员确认\nPayment submitted, awaiting admin confirmation', 'success');
        setTimeout(() => goto('dashboard/'), 1500);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 文档下载 / Documents ====================
async function loadDocumentsPage() {
    if (!requireAuth()) return;

    const el = document.getElementById('documents-content');
    if (!el) return;

    try {
        const { documents } = await api.getDocuments();

        if (!documents?.length) {
            el.innerHTML = '<p class="grey-text">暂无可下载资料<br><small>No documents available</small></p>';
            return;
        }

        // 文档类型配置
        const docConfig = {
            'invoice': { icon: 'receipt_long', name: '发票 / Invoice', desc: '电子发票文件 / Electronic Invoice', iconClass: 'invoice' },
            'invitation': { icon: 'mail', name: '邀请函 / Invitation Letter', desc: '正式邀请函 / Official Invitation', iconClass: 'invitation' }
        };

        el.innerHTML = `<div class="custom-doc-list">${documents.map(d => {
            const config = docConfig[d.doc_type] || { icon: 'description', name: d.doc_type, desc: '文档', iconClass: 'other' };
            return `
                <div class="custom-doc-card">
                    <div class="custom-doc-icon ${config.iconClass}">
                        <i class="material-icons">${config.icon}</i>
                    </div>
                    <h4>${config.name}</h4>
                    <p>${config.desc}</p>
                    <button onclick="downloadDocument(${d.id})" class="custom-doc-download-btn">
                        <i class="material-icons">download</i>
                        下载 / Download
                    </button>
                </div>
            `;
        }).join('')}</div>`;
    } catch (err) {
        if (err.message.includes('缴费')) {
            el.innerHTML = `
                <div class="custom-message-box custom-warning">
                    <i class="material-icons">info</i>
                    <div>请先完成缴费确认<br><small>Please complete payment first</small></div>
                </div>
                <p><a href="${getBasePath()}payment/" class="custom-btn">查看缴费状态 / Check Payment</a></p>
            `;
        } else {
            showMessage(err.message, 'error');
        }
    }
}

// ==================== 个人中心 / Dashboard ====================
async function loadDashboard() {
    if (!requireAuth()) return;

    const el = document.getElementById('dashboard-content');
    if (!el) return;

    try {
        const data = await api.getDashboard();
        renderDashboard(data);
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

function renderDashboard(data) {
    const el = document.getElementById('dashboard-content');
    if (!el) return;

    const { user, registration: reg, posters = [] } = data;
    const base = getBasePath();
    const isStudent = user.identity_type === 'student';

    // 学生证显示逻辑
    let studentIdHtml = '';
    if (isStudent && reg) {
        const canEdit = reg.payment_status !== 'confirmed';
        if (reg.has_student_id) {
            studentIdHtml = `
                <div class="dash-info">
                    <span>学生证 / Student ID</span>
                    <span>
                        <a href="javascript:viewStudentId()" style="color:#1976d2"><i class="material-icons" style="font-size:16px;vertical-align:middle">visibility</i> ${escapeHtml(reg.student_id_name)}</a>
                        ${canEdit ? `<a href="javascript:showUpdateStudentIdModal()" style="color:#666;margin-left:8px"><i class="material-icons" style="font-size:16px;vertical-align:middle">edit</i></a>` : ''}
                    </span>
                </div>`;
        } else {
            studentIdHtml = `
                <div class="dash-info">
                    <span>学生证 / Student ID</span>
                    <span style="color:#f57c00">
                        <i class="material-icons" style="font-size:16px;vertical-align:middle">warning</i> 未上传
                        ${canEdit ? `<a href="javascript:showUpdateStudentIdModal()" style="color:#1976d2;margin-left:8px">上传 / Upload</a>` : ''}
                    </span>
                </div>`;
        }
    }

    el.innerHTML = `
<div class="dash-row">
    <div class="dash-section">
        <div class="dash-title"><i class="material-icons">person</i> 个人信息 / Profile</div>
        <div class="dash-info"><span>姓名 / Name</span><span>${escapeHtml(user.name)}</span></div>
        <div class="dash-info"><span>邮箱 / Email</span><span>${escapeHtml(user.email)}</span></div>
        <div class="dash-info"><span>手机 / Phone</span><span>${escapeHtml(user.phone)}</span></div>
        <div class="dash-info"><span>单位 / Affiliation</span><span>${escapeHtml(user.affiliation)}</span></div>
        ${user.department ? `<div class="dash-info"><span>院系 / Department</span><span>${escapeHtml(user.department)}</span></div>` : ''}
        <div class="dash-info"><span>身份 / Identity</span><span>${STATUS.identity[user.identity_type] || escapeHtml(user.identity_type)}</span></div>
        ${user.title ? `<div class="dash-info"><span>职称 / Title</span><span>${escapeHtml(user.title)}</span></div>` : ''}
    </div>
    <div class="dash-section">
        <div class="dash-title"><i class="material-icons">event</i> 会议注册 / Registration</div>
        ${reg ? `
            <div class="dash-info"><span>参会类型 / Type</span><span>${STATUS.participation[reg.participation_type]}</span></div>
            <div class="dash-info"><span>教程报名</span><span>${getTutorialChoiceText(reg.attend_tutorial)}</span></div>
            <div class="dash-info"><span>注册费用 / Fee</span><span>¥${reg.payment_amount}</span></div>
            <div class="dash-info"><span>缴费状态 / Status</span><span class="dash-status dash-status-${reg.payment_status}">${STATUS.payment[reg.payment_status]}</span></div>
            ${studentIdHtml}
            <a href="${base}tutorial/" class="dash-link">教程报名 / Tutorial Registration →</a>
            ${reg.payment_status === 'pending' ? `<a href="${base}payment/" class="dash-link">前往缴费 / Pay Now →</a>` : ''}
            ${reg.payment_status === 'submitted' ? `<a href="${base}payment/" class="dash-link">查看缴费状态 / Payment Status →</a>` : ''}
            ${reg.payment_status === 'confirmed' ? `<a href="${base}documents/" class="dash-link">下载资料 / Documents →</a>` : ''}
        ` : `
            <div class="dash-empty">您尚未注册会议<br><small>You have not registered yet</small></div>
            <a href="${base}registration/" class="dash-link">立即注册 / Register Now →</a>
        `}
    </div>
</div>
<div class="dash-section">
    <div class="dash-title"><i class="material-icons">image</i> 海报投稿 / Poster Submissions <a href="${base}poster/" class="dash-link-small">提交海报 / Submit →</a></div>
    ${posters.length ? posters.map(p => `
        <div class="dash-poster-item">
            <div class="dash-poster-info">
                <span class="dash-poster-title">${escapeHtml(p.title)}</span>
                <span class="dash-status dash-status-${p.status}">${STATUS.poster[p.status]}</span>
            </div>
            <button class="dash-view-btn" onclick="viewPosterDetail(${p.id})">
                <i class="material-icons">visibility</i> 详情
            </button>
        </div>
    `).join('') : '<div class="dash-empty">暂无海报投稿<br><small>No poster submissions yet</small></div>'}
</div>
    `;
}

// ==================== 邮箱验证 / Email Verification ====================
async function loadVerifyPage() {
    const el = document.getElementById('verify-content');
    if (!el) return;

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        el.innerHTML = '<p style="color:red">✗ 验证链接无效<br><small>Invalid verification link</small></p>';
        return;
    }

    try {
        await api.verifyEmail(token);
        el.innerHTML = `
            <p style="color:green">✓ 邮箱验证成功<br><small>Email verified successfully</small></p>
            <p><a href="${getBasePath()}login/">前往登录 / Go to Login →</a></p>
        `;
    } catch (err) {
        el.innerHTML = `<p style="color:red">✗ ${escapeHtml(err.message)}</p>`;
    }
}

function checkResetToken() {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        const el = document.getElementById('reset-content');
        if (el) {
            el.innerHTML = `
                <div class="custom-message-box custom-error">
                    <i class="material-icons">error</i>
                    <div>重置链接无效<br><small>Invalid reset link</small></div>
                </div>
                <p><a href="${getBasePath()}forgot-password/" class="custom-btn custom-btn-secondary">重新申请 / Request Again</a></p>
            `;
        }
    }
}


// ==================== 下载 / Download ====================

function downloadDocument(docId) {
    const url = api.getDocumentDownloadUrl(docId);
    window.open(url, '_blank');
}

function downloadPosterFile(posterId) {
    const url = api.getPosterDownloadUrl(posterId);
    window.open(url, '_blank');
}

// ==================== 学生证 / Student ID ====================

function viewStudentId() {
    const url = api.getStudentIdDownloadUrl();
    window.open(url, '_blank');
}

function showUpdateStudentIdModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:450px">
            <div class="modal-header">
                <h3>上传学生证 / Upload Student ID</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form onsubmit="handleUpdateStudentId(event)">
                    <div class="custom-form-group">
                        <label>学生证照片 / Student ID Photo <span class="required">*</span></label>
                        <input type="file" name="student_id" accept=".jpg,.jpeg,.png,.pdf" required>
                        <span class="helper-text">支持 JPG、PNG、PDF 格式 / JPG, PNG, PDF supported</span>
                    </div>
                    <div style="text-align:center;margin-top:1.5rem">
                        <button type="submit" class="custom-btn">
                            <i class="material-icons">upload</i> 上传 / Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

async function handleUpdateStudentId(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        await api.updateStudentId(formData);
        showMessage('学生证上传成功\nStudent ID uploaded successfully', 'success');
        document.querySelector('.modal-overlay')?.remove();
        loadDashboard(); // 刷新页面
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

// ==================== 页面初始化 / Initialization ====================
document.addEventListener('DOMContentLoaded', async function() {
    updateNavAuth();

    const path = window.location.pathname;

    // 已登录用户访问登录/注册页面，跳转到个人中心
    if ((path.includes('/login') || path.includes('/register')) && api.isLoggedIn()) {
        goto('dashboard/');
        return;
    }

    // 页面初始化
    if (path.includes('/dashboard')) {
        loadDashboard();
    } else if (path.includes('/registration')) {
        if (!requireAuth()) return;
        initRegistrationPage();
        await checkRegistrationStatus();
    } else if (path.includes('/tutorial')) {
        loadTutorialPage();
    } else if (path.includes('/poster') && !path.includes('/admin')) {
        loadPosterPage();
    } else if (path.includes('/payment')) {
        loadPaymentPage();
    } else if (path.includes('/documents')) {
        loadDocumentsPage();
    } else if (path.includes('/verify')) {
        loadVerifyPage();
    } else if (path.includes('/reset-password')) {
        checkResetToken();
    } else if (path.includes('/admin')) {
        if (!api.isLoggedIn() || !api.getUser()?.is_admin) {
            showMessage('需要管理员权限\nAdmin access required', 'error');
            setTimeout(() => goto(''), 1500);
            return;
        }
        if (typeof initAdminPage === 'function') initAdminPage();
    }
});
