# 🎮 跳一跳 (Jump Jump) - iOS 适配单机纯享版

[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Web-blue.svg)](https://github.com/vitassun/jump-jump)
[![Package](https://img.shields.io/badge/Package-JumpJump.ipa%20(525KB)-success.svg)](https://github.com/vitassun/jump-jump)
[![Offline](https://img.shields.io/badge/Network-100%25%20Offline-green.svg)](https://github.com/vitassun/jump-jump)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

1:1 还原微信小程序经典**「跳一跳」**核心玩法、手感与视效，专为 iOS 深度定制与优化的单机独立应用。

内置已编译签名就绪的 **`JumpJump.ipa`**，支持直接侧载安装，同时包含完整 Xcode 工程与 Web 离线源码。

---

## ✨ 核心特性

- **极致丝滑手感**：
  - 精确还原蓄力挤压变形（Squash & Stretch）与体积守恒物理。
  - 角色起跳空中 **360° 翻滚体态** 与优美空间抛物线轨迹。
  - 落地弹性阻尼吸收冲击，边缘未踩稳时真实的重心失衡翻滚坠落机制。
- **iOS 深度适配**：
  - 完美适配 iPhone 刘海屏、灵动岛及底部 Home Bar（全面屏 Safe-Area Inset 支持）。
  - 支持 **ProMotion 120Hz 高刷新率**，帧率平滑稳定无卡顿。
  - 原生级触感反馈：桥接 iOS `UIImpactFeedbackGenerator` 与 `UINotificationFeedbackGenerator`，蓄力、起跳、连击提供细腻真实的震动体验。
  - 彻底禁用 iOS 页面橡皮筋回弹、多指手势缩放与文字选中干扰。
- **100% 离线运行（零网络依赖）**：
  - 无需联网、无广告、无内购、无任何第三方追踪与外部 CDN 依赖。
  - 所有 3D 几何、材质贴图均为代码与矢量生成。
  - **纯程序化音频合成引擎**：基于 Web Audio API 动态合成蓄力升调嗡鸣、弹射风声、落地木质闷响、连击清脆八音盒琶音（C-D-E-G-A 音阶）与跌落滑稽音效。
- **经典丰富跳板种类**：
  - 经典灰白圆柱基座（同心圆靶心）
  - 清新马卡龙方块（薄荷绿、蜜桃粉）
  - 顺丰快递箱（封箱胶带与条形码贴纸）
  - 3D 魔方（六色方格与黑底缝隙）
  - 黑胶唱片机（唱片凹槽与金色唱片标）
  - 便利店（绿色橙色条纹遮阳棚）
  - 复古小闹钟（12 点刻度与指针表盘）
- **连击奖励机制**：
  - 踩中靶心触发扩散涟漪粒子光环，启动连击奖励（+2、+4、+6、+8…）。
  - 历史最高分本地自动保存。

---

## 📱 iOS 安装方式

项目根目录下已提供编译打包完成的 **`JumpJump.ipa`**（约 525 KB）。

你可以通过以下任意方式安装到 iPhone / iPad：

### 方式一：TrollStore（巨魔商店，推荐）
1. 下载项目根目录下的 `JumpJump.ipa` 到手机。
2. 在“文件”应用中通过 TrollStore 共享打开并点击 Install。
3. 永久免签，畅享无限制运行。

### 方式二：AltStore / Sideloadly
1. 将 iPhone 连接至电脑（Windows 或 Mac）。
2. 打开 **AltStore** 或 **Sideloadly**。
3. 拖入 `JumpJump.ipa`，输入个人 Apple ID 签名并侧载安装。
4. 在手机设置中信任证书即可畅玩。

### 方式三：Safari “添加到主屏幕”（PWA）
如果你暂时没有安装侧载工具，也可以用手机 Safari 访问本项目网页版，点击分享按钮 ➔ **“添加到主屏幕”**，同样能以全屏独立 App 形式离线秒开！

---

## 🛠️ 项目结构

```text
跳一跳/
├── JumpJump.ipa                    # 编译完成的 iOS 安装包（即装即玩）
├── package.json                    # 本地调试配置
├── README.md                       # 说明文档
├── app/                            # 纯前端核心游戏工程（100% 离线自包含）
│   ├── index.html                  # 游戏入口与 iOS Web App 元信息
│   ├── manifest.json               # PWA 清单
│   ├── css/
│   │   └── style.css               # iOS 界面样式与安全区适配
│   ├── js/
│   │   ├── three.min.js            # 离线 3D 渲染引擎
│   │   ├── audio.js                # Web Audio API 纯程序化音效与振动引擎
│   │   ├── blocks.js               # 丰富跳板几何模型与材质生成器
│   │   ├── player.js               # 小人模型、挤压拉伸、翻滚抛物线物理
│   │   └── game.js                 # 游戏主逻辑、碰撞检测、相机跟随、得分
│   └── icons/                      # 各尺寸 iOS 应用图标
├── ios/                            # iOS 原生工程
│   ├── JumpJump.xcodeproj/         # 标准 Xcode 工程配置
│   ├── JumpJump/
│   │   ├── main.m                  # 原生入口
│   │   ├── AppDelegate.m           # 窗口与生命周期管理
│   │   ├── ViewController.m        # 高性能 WKWebView 容器与原生振动反馈桥接
│   │   ├── Info.plist              # Bundle 配置与图标声明
│   │   └── www/                    # 内嵌打包的离线游戏资源
│   └── build/                      # 编译临时目录
└── scripts/
    └── build_ipa.sh                # 一键编译 Mach-O arm64 架构并打包 IPA 脚本
```

---

## 💻 本地开发与构建

### 1. 本地网页预览
```bash
# 启动本地离线静态服务器
python3 -m http.server 8080 --directory app
# 浏览器访问 http://localhost:8080 即可体验
```

### 2. 重新编译与打包 IPA
脚本支持直接在 Linux/WSL/macOS 环境下跨平台编译出苹果 Mach-O 64 位 ARM 原生执行文件并打出 IPA：
```bash
bash scripts/build_ipa.sh
```

---

## 🌐 网页版与 Cloudflare 部署教程

本项目前端代码位于 `app/` 目录下，属于**纯静态前端（Pure Static Web App）**，天生适配 Cloudflare Pages 边缘网络。

### 方法一：通过 Cloudflare Pages 控制台直接连接 GitHub（推荐，全自动免维护）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 左侧导航进入 **Workers 和 Pages (Workers & Pages)** ➔ 点击 **创建应用程序 (Create application)** ➔ 切换到 **Pages** 选项卡。
3. 选择 **连接到 Git (Connect to Git)**，授权你的 GitHub 账号并选中仓库 `vitassun/jump-jump`。
4. 填写构建配置：
   - **项目名称 (Project name)**：`jump-jump`（可自定义）
   - **生产分支 (Production branch)**：`main`
   - **框架预设 (Framework preset)**：选择 `None`
   - **构建命令 (Build command)**：留空（无需任何编译命令）
   - **构建输出目录 (Build output directory)**：填写 `app`
5. 点击 **保存并部署 (Save and Deploy)**。
6. 约 10 秒后部署完成，Cloudflare 会为你分配一个免费的全局 CDN 域名：`https://jump-jump.pages.dev`。

---

### 方法二：使用 Wrangler 命令行一键部署

在项目根目录下执行：
```bash
# 1. 登录 Cloudflare（首次运行会自动打开浏览器授权）
npx wrangler login

# 2. 直接部署 app 目录到 Cloudflare Pages
npm run deploy
# 或者运行：npx wrangler pages deploy app --project-name=jump-jump
```

---

## 🧭 如何添加 DNS 记录（绑定个人域名）

部署完成后，将游戏绑定到你的个人域名（例如 `jump.yourdomain.com` 或根域名 `yourdomain.com`）：

### 步骤 1：在 Cloudflare Pages 项目中添加自定义域
1. 打开 Cloudflare 控制台，进入你的 Pages 项目（例如 `jump-jump`）。
2. 点击顶部的 **自定义域 (Custom domains)** 选项卡。
3. 点击 **设置自定义域 (Set up a custom domain)** 按钮。
4. 输入你想使用的域名，例如 `jump.yourdomain.com`，点击 **继续 (Continue)**。

---

### 步骤 2：添加 DNS 解析记录

#### 情况 A：你的域名已经在 Cloudflare 上托管（最简单）
- Cloudflare 会自动检测到域名在你的账户内，并在页面上直接显示 **“激活域 (Activate domain)”** 按钮。
- 点击确认后，Cloudflare 会**自动**在你的 DNS 列表中生成一条 `CNAME` 记录，**无需手动填写任何参数**！
- 等待 1~2 分钟，SSL 证书自动签发完成即可访问。

#### 情况 B：你的域名在第三方平台（如腾讯云 DNSPod、阿里云万网、GoDaddy、Namecheap 等）
如果你的域名 DNS 解析不在 Cloudflare，请登录你的域名注册商/解析商后台，添加一条 `CNAME` 记录：

| 记录类型 (Type) | 主机记录 / 名称 (Name) | 记录值 / 目标 (Value/Target) | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `jump`（代表 `jump.yourdomain.com`）<br>或 `@`（代表根域名） | `jump-jump.pages.dev`<br>*(替换为你实际的 Pages 免费域名)* | 自动 (Auto) 或 600 |

> **提示**：如果使用根域名 `@`，请确保你的解析服务商支持 **CNAME Flattening (CNAME 扁平化/别名解析/URL 转发)**；若不支持，推荐使用二级子域名（如 `jump.yourdomain.com` 或 `game.yourdomain.com`）。

---

## 🎮 操作说明

- **移动端（iPhone / Android）**：按住屏幕蓄力，松开起跳。
- **电脑端（PC / Mac）**：
  - **空格键 (Space)** 或 **鼠标左键**：长按蓄力，松开起跳。
  - **R 键 / Enter 键**：游戏结束后快速重新开始。
- **正中靶心**：获得双倍及连续翻倍加分（+2, +4, +6...）并触发音效与光环。
- **掉落跳板**：游戏结束，点击“再玩一局”即可立即重新开始。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。
