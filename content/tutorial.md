---
title: 教程报名 / Tutorial Registration
weight: 23
url: /tutorial/
---

<div id="tutorial-content">
<div class="form-container" style="max-width:560px">
<div class="card">
<div class="card-content">
<form onsubmit="handleTutorialChoice(event)">

<div class="reg-fee-notice" id="tutorial-current">
    <i class="material-icons">school</i>
    <span>当前状态 / Current Status：<strong>正在加载 / Loading...</strong></span>
</div>

<div class="input-field">
    <label><i class="material-icons">school</i> 是否参加教程 / Tutorial Attendance *</label>
    <select id="attend_tutorial" name="attend_tutorial" required>
        <option value="" disabled selected>请选择 / Please select</option>
        <option value="true">参加 / Attend</option>
        <option value="false">不参加 / Not Attend</option>
    </select>
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">save</i>保存 / Save
    </button>
</div>

</form>
</div>
</div>
</div>
</div>
