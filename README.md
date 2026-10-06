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

## 🎮 操作说明

- **按住屏幕 / 鼠标左键**：小人下蹲蓄力，蓄力时间越长跳跃距离越远，伴随升调提示音与震动。
- **松开屏幕 / 鼠标**：小人腾空而起，翻滚跃向下一个跳板。
- **正中靶心**：获得双倍及连续翻倍加分（+2, +4, +6...）并触发音效与光环。
- **掉落跳板**：游戏结束，点击“再玩一局”即可立即重新开始。

---

## 📄 开源许可

本项目基于 [MIT License](LICENSE) 开源。
