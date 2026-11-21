# Archify Release Promotional Film (Remotion)

用纯代码（React + SVG + 3D 透视投影 + 程序化音频合成 + Remotion）制作的 **Archify 发版宣传片**，聚焦本次发版的两大核心能力：**确定性代码分析（Code Analysis）** 与 **动态演示引擎（Story Choreography）**。

- **分辨率 / 帧率**：`1920 × 1080` · `30 fps` · `2985 帧 (~99.5 秒)`
- **视觉语言**：对齐 `archify.si` 官方亮色建筑纸设计系统（`#F5F6F3` 暖纸底、64px 制图网格、`#E2500E` 焰橙、`#0856F5` 钴蓝、`#1DBBB7` 青绿），并在全仓星盘与 3D 粒子树专场切入高对比科幻暗色舞台。
- **零外部视频/音频素材依赖**：离线内置字体（`JetBrains Mono` / `Space Grotesk` / `Inter`），全套立体声 BGM 与 10 类动效音效由 [`scripts/generate-audio.mjs`](scripts/generate-audio.mjs) 确定性合成。

## 六幕结构

| 合成 ID | 主题 | 核心画面与动效 |
| --- | --- | --- |
| `ArchifyReleasePromo` | **完整主片（99.5s）** | 全六幕无缝串联 + 立体声 BGM 与逐帧卡点音效 |
| `01-CognitiveDebt` | **AI 时代与绿色 CI 幻觉** | Archify 品牌定场 → 时代背景 → Prompt 与 `CI 全绿` 假象 → 揭开测试防不住的架构漂移与认知负担 → 32 节点磁吸成环进入星盘 |
| `02-CodeAnalysisAtlas` | **代码分析三视图** | ① **2D 全仓星盘 Atlas**（18 层余辉雷达扫光 + 六大语言环绕点亮 + 扇区聚焦推镜 + 循环依赖彗星 + PR 差异模式）→ ② **Atlas 3D 粒子树**（2D 底座倾倒消融、480+ 粒子螺旋拔地升维、3D 环绕公转）→ ③ **原版架构图无侵入叠加改造（`--ir`）**（柔光光学帷幕逐节点点亮红/琥珀/绿诊断光晕 + 揪出未声明漂移） |
| `03-StoryChoreography` | **动态演示引擎（Pulse Billing #5）** | 原生 10 种图结构亮相 → 贴线语义流动画 → 架构图同源节点物理滑移变身时序图 → Git 固定提交源码卡片 → 一镜切入 ERD 迁移 |
| `04-RealCases-Tokio-Vue` | **真实开源 PR 双连击** | **Tokio #1657** 批量窃取到 Worker 生命周期横摇运镜 → 斜切光带转场 → **Vue #2532** 微距推镜裂开 `processExpression() 22→22` 揪出嵌套 `prefix() 2→6` |
| `05-WorkflowAndDeliverables` | **全形态交付 × AI 修复闭环** | 双主题动态 SVG 光带斜切扫过（暗/浅实时对照）→ 镜头跟随 4 步工程闭环（Atlas 诊断 → Copy Task for AI → Coding Agent 修复 → Re-analyze 验绿） |
| `06-MetaOutro` | **自举收尾与品牌定格** | `Typed JSON IR → Deterministic Gate → Story Choreography → SVG / Stage / MP4` 拉远收束 → 官方亮色 Archify Lockup 扫光定格 |

## 快速开始

```bash
npm install

# 启动本地 Remotion Studio 实时预览（首次会自动合成 public/audio/*.wav）
npm run studio

# 单独重新合成全部 BGM 与音效
npm run audio

# TypeScript 类型检查
npm run typecheck

# 导出 1080p MP4 成片（输出至 out/archify-release-promo.mp4）
npm run build
```

## 关联仓库

- Archify 主仓库：https://github.com/tt-a1i/archify
- PR 动态讲解案例仓库：https://github.com/tt-a1i/pr-lens-demo
