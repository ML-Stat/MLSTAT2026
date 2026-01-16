---
title: 会议注册 / Registration
weight: 21
url: /registration/
---

<div class="reg-fee-notice">
    <i class="material-icons">info</i>
    <span>注册费 / Registration Fee：<strong>¥500</strong>（学生优惠 Student：<strong>¥200</strong>）</span>
</div>

<div class="form-container" style="max-width:560px">
<div class="card">
<div class="card-content">
<form onsubmit="handleConferenceRegister(event)">

<div class="input-field">
    <label><i class="material-icons">event</i> 参会类型 / Participation Type *</label>
    <select name="participation_type" required>
        <option value="" disabled selected>请选择 / Please select</option>
        <option value="poster">海报展示 / Poster Presentation</option>
        <option value="attend_only">仅参会 / Attendance Only</option>
    </select>
</div>

<div class="divider"></div>

<div class="input-field">
    <label><i class="material-icons">description</i> 发票类型 / Invoice Type</label>
    <select name="invoice_type">
        <option value="" disabled selected>请选择 / Please select</option>
        <option value="general">增值税普通发票 / VAT General Invoice</option>
        <option value="special">增值税专用发票 / VAT Special Invoice</option>
    </select>
</div>

<div class="row">
    <div class="input-field col s12 m6">
        <label for="invoice_title"><i class="material-icons">business</i> 发票抬头 / Invoice Title</label>
        <input type="text" id="invoice_title" name="invoice_title">
    </div>
    <div class="input-field col s12 m6">
        <label for="invoice_tax_id"><i class="material-icons">numbers</i> 纳税人识别号 / Tax ID</label>
        <input type="text" id="invoice_tax_id" name="invoice_tax_id">
    </div>
</div>

<div class="center-align" style="margin-top:2rem">
    <button type="submit" class="btn-large">
        <i class="material-icons left">send</i>提交注册 / Submit Registration
    </button>
</div>

</form>
</div>
</div>
</div>
