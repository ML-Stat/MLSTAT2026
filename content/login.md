---
title: 登录 / Login
weight: 20
url: /login/
---


<div class="form-container">
<div class="card">
<div class="card-content">
<form onsubmit="handleLogin(event)">

<div class="input-field">
    <label for="email"><i class="material-icons">email</i> 邮箱 / Email</label>
    <input type="email" id="email" name="email" required>
</div>

<div class="input-field">
    <label for="password"><i class="material-icons">lock</i> 密码 / Password</label>
    <input type="password" id="password" name="password" required>
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">login</i>登录 / Sign In
    </button>
</div>

<p class="center-align" style="margin-top:1.5rem">
    <a href="javascript:goto('forgot-password/')" class="grey-text" style="font-size:0.9rem">忘记密码？ / Forgot Password?</a>
</p>

<div class="divider" style="margin:2rem 0"></div>

<p class="center-align">
    <a href="javascript:goto('register/')">没有账号？立即注册<br><small>Don't have an account? Register</small></a>
</p>

</form>
</div>
</div>
</div>
