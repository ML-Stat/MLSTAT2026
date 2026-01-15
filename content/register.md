---
title: 注册 / Register
weight: 19
url: /register/
---

<div class="form-container" style="max-width:560px">
<div class="card">
<div class="card-content">
<form onsubmit="handleRegister(event)">

<div class="input-field">
    <label for="email"><i class="material-icons">email</i> 邮箱 / Email *</label>
    <input type="email" id="email" name="email" required>
    <span class="helper-text">用于登录和接收通知 / For login and notifications</span>
</div>

<div class="row">
    <div class="input-field col s12 m6">
        <label for="password"><i class="material-icons">lock</i> 密码 / Password *</label>
        <input type="password" id="password" name="password" required minlength="8">
        <span class="helper-text">至少8位 / At least 8 characters</span>
    </div>
    <div class="input-field col s12 m6">
        <label for="confirm_password"><i class="material-icons">lock_outline</i> 确认密码 / Confirm *</label>
        <input type="password" id="confirm_password" name="confirm_password" required minlength="8">
    </div>
</div>

<div class="row">
    <div class="input-field col s12 m6">
        <label for="name"><i class="material-icons">person</i> 姓名 / Name *</label>
        <input type="text" id="name" name="name" required>
    </div>
    <div class="input-field col s12 m6">
        <label for="phone"><i class="material-icons">phone</i> 手机号码 / Phone *</label>
        <input type="tel" id="phone" name="phone" required>
    </div>
</div>

<div class="input-field">
    <label for="affiliation"><i class="material-icons">business</i> 工作单位 / Affiliation *</label>
    <input type="text" id="affiliation" name="affiliation" required>
</div>

<div class="input-field">
    <label for="department"><i class="material-icons">apartment</i> 院系/部门 / Department</label>
    <input type="text" id="department" name="department">
</div>

<div class="row">
    <div class="input-field col s12 m6">
        <label><i class="material-icons">badge</i> 身份类型 / Identity *</label>
        <select name="identity_type" required>
            <option value="" disabled selected>请选择 / Please select</option>
            <option value="student">学生 / Student</option>
            <option value="teacher">教师 / Faculty</option>
            <option value="researcher">研究人员 / Researcher</option>
            <option value="other">其他 / Other</option>
        </select>
    </div>
    <div class="input-field col s12 m6">
        <label for="title"><i class="material-icons">school</i> 职称/学位 / Title</label>
        <input type="text" id="title" name="title">
    </div>
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">person_add</i>注册 / Register
    </button>
</div>

<div class="divider" style="margin:2rem 0"></div>

<p class="center-align">
    <a href="javascript:goto('login/')">已有账号？立即登录<br><small>Already have an account? Sign In</small></a>
</p>

</form>
</div>
</div>
</div>
