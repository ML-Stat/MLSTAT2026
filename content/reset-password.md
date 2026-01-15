---
title: 重置密码 / Reset Password
weight: 99
url: /reset-password/
---

<div id="reset-content">
<div class="form-container">
<div class="card">
<div class="card-content">
<form onsubmit="handleResetPassword(event)">

<div class="input-field">
    <label for="password"><i class="material-icons">lock</i> 新密码 / New Password</label>
    <input type="password" id="password" name="password" required minlength="8">
    <span class="helper-text">至少8位 / At least 8 characters</span>
</div>

<div class="input-field">
    <label for="confirm_password"><i class="material-icons">lock_outline</i> 确认密码 / Confirm Password</label>
    <input type="password" id="confirm_password" name="confirm_password" required minlength="8">
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">vpn_key</i>重置密码 / Reset Password
    </button>
</div>

</form>
</div>
</div>
</div>
</div>
