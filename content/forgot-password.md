---
title: 忘记密码 / Forgot Password
weight: 99
url: /forgot-password/
---

<div class="form-container">
<div class="card">
<div class="card-content">
<form onsubmit="handleForgotPassword(event)">

<div class="input-field">
    <label for="email"><i class="material-icons">email</i> 邮箱 / Email</label>
    <input type="email" id="email" name="email" required>
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">send</i>发送重置邮件 / Send Reset Link
    </button>
</div>

<div class="divider" style="margin:2rem 0"></div>
<p class="center-align">
    <a href="javascript:goto('login/')" class="grey-text">← 返回登录 / Back to Sign In</a>
</p>

</form>
</div>
</div>
</div>
