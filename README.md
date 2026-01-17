# MLSTAT 2026

第四届机器学习与统计学国际会议 / The 4th International Conference on Machine Learning and Statistics

https://ml-stat.github.io/MLSTAT2026/

## 使用方法

```bash
# 克隆
git clone https://github.com/ML-Stat/MLSTAT2026.git
cd MLSTAT2026 && git checkout dev

# 本地预览
hugo server -D
# 访问 http://localhost:1313/MLSTAT2026/

# 构建并提交
hugo --cleanDestinationDir
git add . && git commit -m "message" && git push origin dev
```

## 常用维护

| 任务 | 文件位置 |
|------|----------|
| 修改会议信息 | `content/overview.md` |
| 修改注册表单 | `content/registration.md` |
| 修改委员会名单 | `content/committee.md` |
| 添加会议日程 | `content/schedule/sessions/` |
| 修改导航菜单 | `config.toml` → `[[menu.main]]` |
| 添加图片 | `static/images/` |
| 修改样式 | `static/css/custom.css` |
| 修改前端逻辑 | `static/js/app.js` |
| 修改后台管理 | `static/js/admin.js` |
| 修改 API 地址 | `static/js/api.js` → `API_BASE` |

## 注意事项

- 在 `dev` 分支修改，提交后自动部署
- 提交时 pre-commit hook 会自动同步 `public/` → `docs/`
- Hugo 版本要求：v0.121.2+

