# Windows 安装 n8n 指南

## 方案 A：Docker Desktop（推荐）

### 第 1 步：安装 Docker Desktop

1. 下载 Docker Desktop：https://www.docker.com/products/docker-desktop/
2. 安装时勾选 "Use WSL 2 instead of Hyper-V"
3. 安装完成后重启电脑
4. 打开 Docker Desktop，等它启动完成（右下角鲸鱼图标变绿）

### 第 2 步：启动 n8n

打开终端（PowerShell 或 Git Bash），运行：

```bash
docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

等看到类似 `Editor is now accessible via: http://localhost:5678` 就成功了。

### 第 3 步：打开 n8n

浏览器访问：http://localhost:5678

首次打开会让你注册账号（本地账号，不需要邮箱验证）。

### 停止和重启

- **停止**：终端按 `Ctrl+C`
- **重启**：再运行上面的 docker run 命令（数据还在，因为用了 -v n8n_data）
- **数据位置**：Docker Desktop → Volumes → n8n_data

---

## 方案 B：不用 Docker，直接用 npm

如果你已经装了 Node.js（18 或 20 版本）：

```bash
npm install n8n -g
n8n start
```

同样访问 http://localhost:5678

---

## 方案 C：n8n Cloud（零安装）

如果 Docker 下载太慢或者装不上：

1. 打开 https://app.n8n.cloud/
2. 注册账号（有免费额度）
3. 直接在浏览器里用，不需要装任何东西

缺点：免费版有执行次数限制，长期用建议自托管。

---

## 导入模板

n8n 启动后：

1. 点右上角 **...** 菜单
2. 选 **Import from File**
3. 选 `templates/free/` 里的任意 `.json` 文件
4. 模板出现在画布上
5. 点击各节点配置你的 API Key 和 Gmail 账号

---

## 常见问题

| 问题 | 解决 |
|------|------|
| Docker 下载慢 | 用镜像：设置里换 Docker Hub 镜像源，或者直接用方案 C |
| WSL 没装 | PowerShell 运行 `wsl --install`，重启电脑 |
| 端口 5678 被占 | 换个端口：`docker run -p 5679:5678 ...`，然后访问 localhost:5679 |
| n8n 打不开 | 检查 Docker Desktop 是否在运行（右下角鲸鱼图标）|