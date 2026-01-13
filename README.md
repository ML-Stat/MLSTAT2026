# MLSTAT2026

[MLSTAT2026 website](https://ml-stat.github.io/MLSTAT2026/)


## 安装hugo

1. 下载正确版本`https://github.com/gohugoio/hugo/releases/tag/v0.121.2`

2. 提取exe文件，添加到全局环境变量Path中。

3. 运行
```
hugo version

>>> hugo v0.121.2-6d5b44305eaa9d0a157946492a6f319da38de154 windows/amd64 BuildDate=2024-01-05T12:21:15Z VendorInfo=gohugoio
```




## 克隆仓库

```bash 
git clone https://github.com/ML-Stat/MLSTAT2026.git
git checkout dev

```

## 修改

在`dev`分支修改内容。

在content里面修改具体的会议内容，在static/images/文件夹下存放图片

## 生成网页

在MLSTAT2026文件夹下执行

```bash 

hugo --cleanDestinationDir
hugo server -D

```


浏览器访问`http://localhost:1313/MLSTAT2026/`

代码push到远程dev分支
```
bash commit.sh (本次commit message)
```

