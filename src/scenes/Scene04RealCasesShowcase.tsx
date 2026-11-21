import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  CameraRig,
  EditorialPill,
  FloatingCaption,
  PaperCanvas,
  SemanticSigil,
} from '../components/ConsoleChrome';
import {
  COLORS,
  FONTS,
  easeInOutCubic,
  easeInOutQuart,
  easeOutCubic,
  lerp,
  progressBetween,
} from '../theme';
import { useT } from '../locale';

export const Scene04RealCasesShowcase: React.FC = () => {
  const t = useT();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ==================== TIMELINE (540 frames = 18s) ====================
  // Part A (0 - 255): Tokio #1657 — Borderless wide canvas with smooth horizontal camera dolly!
  //   0-125: Focus Left on Local Queue + Overflow + Batch Work-Stealing
  //   125-245: Camera glides right onto Worker Lifecycle State Machine
  const tokioIn = easeOutCubic(progressBetween(frame, 0, 26));
  const tokioStealT = ((frame - 16) % 62) / 62;
  const tokioPanT = easeInOutQuart(progressBetween(frame, 118, 178));
  const lifecycleHop = (Math.max(0, frame - 125) / 30) % 4;

  const tokioCamX = lerp(-280, 390, tokioPanT);
  const tokioCamZoom = lerp(1.16, 1.06, tokioPanT);

  // Diagonal Paper-Fold Wipe into Vue #2532 (238 - 274)
  const wipeT = easeInOutQuart(progressBetween(frame, 238, 274));

  // Part B (258 - 540): Vue #2532 — Macro Camera Dive into processExpression() -> nested prefix()!
  const vF = Math.max(0, frame - 258);
  const vueNodesIn = easeOutCubic(progressBetween(vF, 0, 30));
  const outerBadgeIn = spring({
    frame: Math.max(0, vF - 28),
    fps,
    config: { damping: 16, stiffness: 150 },
  });
  const crackOpenT = easeInOutQuart(progressBetween(vF, 68, 118));
  const ccCounter = Math.round(lerp(2, 6, easeOutCubic(progressBetween(vF, 108, 144))));
  const nestCounter = Math.round(lerp(0, 2, easeOutCubic(progressBetween(vF, 114, 148))));
  const vueCodeIn = spring({
    frame: Math.max(0, vF - 142),
    fps,
    config: { damping: 18, stiffness: 135 },
  });

  // Cinema Camera for Vue: Wide -> Macro Dive into processExpression() -> Slide Left for Code!
  const vueCamZoom =
    lerp(0.95, 1.28, crackOpenT) * lerp(1.0, 0.84, vueCodeIn);
  const vueCamX = lerp(0, 295, vueCodeIn);
  const vueCamY = lerp(0, -10, crackOpenT);

  const isVue = frame >= 256;
  const vueCaption =
    vF < 74
      ? t('真实 PR · Vue #2532：外层 processExpression() 圈复杂度 22 → 22，常规报表完全无感…', 'Vue #2532: processExpression() stays at 22. A summary would miss the change.')
      : t('镜头直接下钻嵌套函数 prefix()：圈复杂度 2 → 6、嵌套深度 0 → 2，静态度量附着节点并展开源码', 'Zoom in on prefix(): cyclomatic complexity 2 → 6, nesting depth 0 → 2. See the metrics beside the source.');

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, overflow: 'hidden' }}>
      <PaperCanvas glowA={COLORS.messagebus} glowB={COLORS.brandBlue} gridOpacity={0.55} />

      {/* ==================== PART A: TOKIO #1657 (BORDERLESS INFINITE CANVAS + DOLLY PAN) ==================== */}
      {wipeT < 0.99 && (
        <AbsoluteFill style={{ opacity: tokioIn * (1 - wipeT * 0.35) }}>
          <div style={{ position: 'absolute', top: 38, left: 56, display: 'flex', alignItems: 'center', gap: 14, zIndex: 50 }}>
            <EditorialPill label="REAL PR CASE · tokio-rs/tokio #1657" color={COLORS.messagebus} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.muted }}>
              100 FILES CHANGED · SCHEDULER REWRITE
            </span>
          </div>

          <CameraRig x={tokioCamX} zoom={tokioCamZoom}>
            {/* World Space: Architecture on Left (x: 100..1120), Lifecycle Ring on Right (x: 1220..1860) */}
            <div style={{ position: 'relative', width: 2200, height: 1080 }}>
              {/* Section Title Floating Directly on Paper */}
              <div style={{ position: 'absolute', left: 165, top: 150 }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: COLORS.messagebus, letterSpacing: '0.12em' }}>
                  01 · WORK-STEALING TOPOLOGY
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 800, color: COLORS.ink, marginTop: 4 }}>
                  {t('局部队列 · 溢出回退 · 批量窃取', 'Local Queues · Overflow · Batch Stealing')}
                </div>
              </div>

              <div style={{ position: 'absolute', left: 1265, top: 150 }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 800, color: COLORS.backend, letterSpacing: '0.12em' }}>
                  02 · WORKER LIFECYCLE
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 800, color: COLORS.ink, marginTop: 4 }}>
                  {t('搜索 · 执行 · 休眠 · 精准唤醒', 'Search · Execute · Park · Wake One')}
                </div>
              </div>

              {/* Architecture SVG Layer (Left World) */}
              <svg width="2200" height="1080" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <filter id="tokio-light-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Global Injector Queue Card */}
                <g transform="translate(465, 255)">
                  <rect width="360" height="114" rx="16" fill={COLORS.surface} stroke={COLORS.database} strokeWidth="2" />
                  <rect width="360" height="4" rx="2" fill={COLORS.database} />
                  <text x="22" y="44" fill={COLORS.ink} fontFamily={FONTS.mono} fontSize="19" fontWeight="800">
                    Global Injector Queue
                  </text>
                  <text x="22" y="76" fill={COLORS.muted} fontFamily={FONTS.sans} fontSize="14.5">
                    {t('溢出半队列承接 & 外部 spawn 入口', 'Half-queue overflow + external spawns')}
                  </text>
                </g>

                {/* Worker A */}
                <g transform="translate(165, 520)">
                  <rect width="370" height="212" rx="18" fill={COLORS.surface} stroke={COLORS.frontend} strokeWidth="2" />
                  <rect width="370" height="4" rx="2" fill={COLORS.frontend} />
                  <text x="24" y="44" fill={COLORS.frontend} fontFamily={FONTS.mono} fontSize="18" fontWeight="800">
                    Worker A · Local Queue
                  </text>
                  <text x="24" y="72" fill={COLORS.muted} fontFamily={FONTS.mono} fontSize="13">
                    Ring Buffer [256 slots · LIFO slot]
                  </text>
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const filled = idx < 7;
                    return (
                      <rect
                        key={idx}
                        x={24 + idx * 32}
                        y={98}
                        width={26}
                        height={52}
                        rx={6}
                        fill={filled ? `${COLORS.frontend}24` : COLORS.paper}
                        stroke={filled ? COLORS.frontend : COLORS.lineHi}
                        strokeWidth={1.6}
                      />
                    );
                  })}
                  <text x="24" y="184" fill={COLORS.cloud} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
                    overflow → push ½ batch to Injector
                  </text>
                </g>

                {/* Worker B */}
                <g transform="translate(740, 520)">
                  <rect width="370" height="212" rx="18" fill={COLORS.surface} stroke={COLORS.backend} strokeWidth="2" />
                  <rect width="370" height="4" rx="2" fill={COLORS.backend} />
                  <text x="24" y="44" fill={COLORS.backend} fontFamily={FONTS.mono} fontSize="18" fontWeight="800">
                    Worker B · Idle Thief
                  </text>
                  <text x="24" y="72" fill={COLORS.muted} fontFamily={FONTS.mono} fontSize="13">
                    steal_batch_and_pop()
                  </text>
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const stolen = idx < Math.floor(tokioStealT * 5) + 1;
                    return (
                      <rect
                        key={idx}
                        x={24 + idx * 32}
                        y={98}
                        width={26}
                        height={52}
                        rx={6}
                        fill={stolen ? `${COLORS.backend}24` : COLORS.paper}
                        stroke={stolen ? COLORS.backend : COLORS.lineHi}
                        strokeWidth={1.6}
                      />
                    );
                  })}
                  <text x="24" y="184" fill={COLORS.backend} fontFamily={FONTS.mono} fontSize="13" fontWeight="700">
                    steals ½ queue in single atomic CAS
                  </text>
                </g>

                {/* Overflow Arc */}
                <path
                  d="M 350 520 C 350 400, 400 325, 465 312"
                  fill="none"
                  stroke={COLORS.cloud}
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                <text x="215" y="410" fill={COLORS.cloud} fontFamily={FONTS.mono} fontSize="13.5" fontWeight="800">
                  overflow ½ batch
                </text>

                {/* Work-Stealing Curved Energy Beam */}
                <path
                  d="M 535 626 C 600 555, 675 555, 740 626"
                  fill="none"
                  stroke={COLORS.messagebus}
                  strokeWidth="4"
                />
                <rect x="572" y="534" width="132" height="28" rx="14" fill={`${COLORS.messagebus}1C`} stroke={COLORS.messagebus} />
                <text x="638" y="553" textAnchor="middle" fill={COLORS.messagebus} fontFamily={FONTS.mono} fontSize="12.5" fontWeight="800">
                  BATCH STEAL
                </text>

                {/* Steal Packets */}
                {[0, 0.16, 0.32].map((off, idx) => {
                  const u = (tokioStealT + off) % 1;
                  const bx = lerp(535, 740, u);
                  const by = 626 - Math.sin(u * Math.PI) * 52;
                  return (
                    <circle
                      key={idx}
                      cx={bx}
                      cy={by}
                      r={7.5 - idx}
                      fill="#FFFFFF"
                      stroke={COLORS.messagebus}
                      strokeWidth={3}
                      filter="url(#tokio-light-glow)"
                    />
                  );
                })}

                {/* Bridge arrow leading viewer's eye from Topology -> Lifecycle */}
                <path
                  d="M 1110 626 L 1255 626"
                  fill="none"
                  stroke={COLORS.lineHi}
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                />
              </svg>

              {/* Borderless Floating Lifecycle States (Right World) */}
              <div
                style={{
                  position: 'absolute',
                  left: 1265,
                  top: 268,
                  width: 560,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 22,
                }}
              >
                {[
                  { name: 'Searching', desc: t('持锁探测其他 Worker 队列（限流防惊群）', 'Probe peer queues under lock; limit concurrent searchers.'), color: COLORS.frontend },
                  { name: 'Executing', desc: t('找到任务 → 释放搜索名额，按需唤醒下一个', 'Found work → release the search slot and wake a peer if needed.'), color: COLORS.backend },
                  { name: 'Parked', desc: t('全队列为空 → 归还搜索位并进入低耗休眠', 'No work → release the search slot and park.'), color: COLORS.database },
                  { name: 'Unparked', desc: t('新任务到达 → 精准唤醒单个空闲 Worker', 'New work → wake a single idle worker.'), color: COLORS.cloud },
                ].map((st, idx) => {
                  const isActive = Math.floor(lifecycleHop) === idx;
                  return (
                    <div
                      key={st.name}
                      style={{
                        padding: '20px 24px',
                        borderRadius: 16,
                        backgroundColor: COLORS.surface,
                        border: `${isActive ? '2.2px' : '1.4px'} solid ${isActive ? st.color : COLORS.lineHi}`,
                        boxShadow: isActive
                          ? `0 20px 50px ${st.color}26, 0 4px 16px rgba(18,20,23,0.06)`
                          : '0 8px 24px rgba(18,20,23,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        transform: `scale(${isActive ? 1.04 : 1}) translateX(${isActive ? 10 : 0}px)`,
                      }}
                    >
                      <SemanticSigil kind="lifecycle" color={st.color} size={26} />
                      <div>
                        <div style={{ fontFamily: FONTS.mono, fontSize: 19, fontWeight: 800, color: isActive ? st.color : COLORS.ink }}>
                          {st.name}
                        </div>
                        <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: COLORS.muted, marginTop: 4 }}>
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CameraRig>

          <FloatingCaption
            kicker="TOKIO #1657"
            text={t('100 个文件的调度器大重构：镜头从批量窃取平滑摇入 Worker 生命周期，一条主线讲透', 'A 100-file scheduler rewrite, from batch work-stealing to the worker lifecycle.')}
            accent={COLORS.messagebus}
            opacity={1 - wipeT}
          />
        </AbsoluteFill>
      )}

      {/* ==================== PART B: VUE #2532 (MACRO CAMERA DIVE INTO HIDDEN COMPLEXITY!) ==================== */}
      {wipeT > 0.01 && (
        <AbsoluteFill
          style={{
            clipPath: `polygon(${lerp(122, -22, wipeT)}% 0%, 100% 0%, 100% 100%, ${lerp(100, -44, wipeT)}% 100%)`,
            backgroundColor: COLORS.paper,
            zIndex: 35,
          }}
        >
          <PaperCanvas glowA={COLORS.ember} glowB={COLORS.security} gridOpacity={0.55} />

          <div style={{ position: 'absolute', top: 38, left: 56, display: 'flex', alignItems: 'center', gap: 14, zIndex: 50 }}>
            <EditorialPill label="REAL PR CASE · vuejs/core #2532" color={COLORS.ember} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: COLORS.muted }}>
              NESTED COMPLEXITY · STATIC MEASUREMENT
            </span>
          </div>

          {/* Camera Macro-Dive World */}
          <CameraRig x={vueCamX} y={vueCamY} zoom={vueCamZoom}>
            <div style={{ position: 'relative', width: 1920, height: 1080, opacity: vueNodesIn }}>
              {/* Clean Connecting Flow Arrows */}
              <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, opacity: 1 - vueCodeIn }}>
                <path
                  d={`M 450 530 L ${lerp(660, 595, crackOpenT)} 530`}
                  fill="none"
                  stroke={COLORS.frontend}
                  strokeWidth="3.2"
                />
                <path
                  d={`M ${lerp(1260, 1325, crackOpenT)} 530 L 1470 530`}
                  fill="none"
                  stroke={COLORS.database}
                  strokeWidth="3.2"
                />
              </svg>

              {/* Left Node: Template AST */}
              <div
                style={{
                  position: 'absolute',
                  left: 160,
                  top: 465,
                  width: 290,
                  height: 130,
                  borderRadius: 16,
                  backgroundColor: COLORS.surface,
                  border: `1.5px solid ${COLORS.frontend}77`,
                  boxShadow: '0 14px 36px rgba(18,20,23,0.06)',
                  padding: '20px 22px',
                  opacity: lerp(1, 0.35, crackOpenT) * (1 - vueCodeIn),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SemanticSigil kind="frontend" color={COLORS.frontend} size={20} />
                  <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
                    Template AST
                  </span>
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.muted, marginTop: 10 }}>
                  BindingMetadata & inline template expression
                </div>
              </div>

              {/* Right Node: Codegen IR */}
              <div
                style={{
                  position: 'absolute',
                  left: 1470,
                  top: 465,
                  width: 290,
                  height: 130,
                  borderRadius: 16,
                  backgroundColor: COLORS.surface,
                  border: `1.5px solid ${COLORS.database}77`,
                  boxShadow: '0 14px 36px rgba(18,20,23,0.06)',
                  padding: '20px 22px',
                  opacity: lerp(1, 0.35, crackOpenT) * (1 - vueCodeIn),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SemanticSigil kind="database" color={COLORS.database} size={20} />
                  <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 800, color: COLORS.ink }}>
                    Codegen IR
                  </span>
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.muted, marginTop: 10 }}>
                  {t('编译期绑定元数据 → 运行期访问代码', 'Compile-time bindings → runtime access code')}
                </div>
              </div>

              {/* CENTER HERO NODE: processExpression() CRACKS OPEN TO REVEAL NESTED prefix()! */}
              <div
                style={{
                  position: 'absolute',
                  left: lerp(660, 595, crackOpenT),
                  top: lerp(415, 255, crackOpenT),
                  width: lerp(600, 730, crackOpenT),
                  height: lerp(230, 540, crackOpenT),
                  borderRadius: 24,
                  backgroundColor: COLORS.surface,
                  border: `2.2px solid ${crackOpenT > 0.3 ? COLORS.ember : COLORS.backend}`,
                  boxShadow:
                    crackOpenT > 0.2
                      ? `0 32px 90px rgba(226, 80, 14, 0.18), 0 8px 28px rgba(18,20,23,0.08)`
                      : '0 22px 60px rgba(18,20,23,0.09)',
                  padding: '28px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 12.5, fontWeight: 700, color: COLORS.muted, letterSpacing: '0.1em' }}>
                      OUTER FUNCTION · transformExpression.ts
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 800, color: COLORS.ink, marginTop: 4 }}>
                      processExpression()
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '10px 20px',
                      borderRadius: 14,
                      backgroundColor: COLORS.paper,
                      border: `1.5px solid ${COLORS.lineHi}`,
                      textAlign: 'right',
                      transform: `scale(${outerBadgeIn})`,
                      opacity: outerBadgeIn,
                    }}
                  >
                    <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.muted }}>
                      OUTER CC
                    </div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 800, color: COLORS.ink }}>
                      22 → 22
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: FONTS.sans, fontSize: 16.5, color: COLORS.muted, marginTop: 10 }}>
                  {t('外层圈复杂度看似纹丝不动，常规汇总报表直接放行 ——', 'The outer complexity stays flat. A summary misses the change.')}
                </div>

                {/* CRACKED-OPEN NESTED FUNCTION: prefix() */}
                {crackOpenT > 0.05 && (
                  <div
                    style={{
                      marginTop: 26,
                      flex: 1,
                      borderRadius: 18,
                      backgroundColor: 'rgba(225, 29, 72, 0.055)',
                      border: `2px solid ${COLORS.security}`,
                      padding: '24px 26px',
                      opacity: crackOpenT,
                      transform: `translateY(${(1 - crackOpenT) * 32}px) scale(${lerp(0.92, 1, crackOpenT)})`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <EditorialPill label="NESTED FUNCTION SPIKE" color={COLORS.security} />
                        <div style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 800, color: COLORS.ink, marginTop: 12 }}>
                          ↳ prefix(raw: string)
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 14 }}>
                        <div
                          style={{
                            padding: '12px 20px',
                            borderRadius: 14,
                            backgroundColor: COLORS.surface,
                            border: `2px solid ${COLORS.security}`,
                            textAlign: 'center',
                            boxShadow: `0 12px 30px ${COLORS.security}22`,
                          }}
                        >
                          <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: COLORS.security }}>
                            COMPLEXITY
                          </div>
                          <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: COLORS.security }}>
                            2 → {ccCounter}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: '12px 20px',
                            borderRadius: 14,
                            backgroundColor: COLORS.surface,
                            border: `2px solid ${COLORS.ember}`,
                            textAlign: 'center',
                            boxShadow: `0 12px 30px ${COLORS.ember}1E`,
                          }}
                        >
                          <div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 800, color: COLORS.ember }}>
                            NESTING
                          </div>
                          <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: COLORS.ember }}>
                            0 → {nestCounter}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
                        <span>STATIC AST SNAPSHOT · ATTACHED TO NODE</span>
                        <span style={{ color: COLORS.security, fontWeight: 800 }}>+200% BRANCHING</span>
                      </div>
                      <div style={{ height: 12, borderRadius: 999, backgroundColor: COLORS.sunken, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${lerp(24, 88, easeOutCubic(progressBetween(vF, 108, 150)))}%`,
                            borderRadius: 999,
                            background: `linear-gradient(90deg, ${COLORS.emberLight}, ${COLORS.ember}, ${COLORS.security})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CameraRig>

          {/* Dark-Ink Pinned Vue Source Card — Vertically Centered on Optical Axis (y=508, EXACT vuejs/core @ 2a4fc32d!) */}
          {vueCodeIn > 0.01 && (
            <div
              style={{
                position: 'absolute',
                right: 52,
                top: 508,
                width: 660,
                borderRadius: 20,
                backgroundColor: '#0C111D',
                border: `1px solid rgba(251, 113, 133, 0.5)`,
                boxShadow: '0 32px 84px rgba(18, 20, 23, 0.28)',
                transform: `translateY(-50%) translateX(${(1 - vueCodeIn) * 720}px)`,
                opacity: vueCodeIn,
                overflow: 'hidden',
                zIndex: 55,
              }}
            >
              <div
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid rgba(148,163,184,0.16)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: FONTS.mono, fontSize: 13.5, fontWeight: 700, color: '#F8FAFC' }}>
                  transformExpression.ts : L101–L114
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: COLORS.neonRose,
                    padding: '3px 10px',
                    borderRadius: 999,
                    backgroundColor: 'rgba(251, 113, 133, 0.16)',
                  }}
                >
                  PINNED @ 2a4fc32d
                </span>
              </div>
              <div style={{ padding: '18px 20px', fontFamily: FONTS.mono, fontSize: 13.2, lineHeight: 1.72 }}>
                {[
                  { n: 101, code: 'const { inline, bindingMetadata } = context', hl: false },
                  { n: 102, code: 'const prefix = (raw: string) => {', hl: false },
                  { n: 103, code: '  const type = hasOwn(bindingMetadata, raw) && bindingMetadata[raw]', hl: true, c: COLORS.neonAmber },
                  { n: 104, code: '  if (inline) {', hl: true, c: COLORS.neonRose },
                  { n: 105, code: '    // setup inline mode', hl: false },
                  { n: 106, code: "    if (type === 'setup') {", hl: true, c: COLORS.neonRose },
                  { n: 107, code: '      return `${context.helperString(UNREF)}(${raw})`', hl: true, c: COLORS.neonRose },
                  { n: 108, code: "    } else if (type === 'component-import') {", hl: true, c: COLORS.neonRose },
                  { n: 109, code: '      return raw', hl: true, c: COLORS.neonAmber },
                  { n: 110, code: '    }', hl: false },
                  { n: 111, code: '  }', hl: false },
                  { n: 112, code: '  // fallback to normal', hl: false },
                  { n: 113, code: '  return `${type ? `$${type}` : `_ctx`}.${raw}`', hl: false },
                  { n: 114, code: '}', hl: false },
                ].map((line) => (
                  <div
                    key={line.n}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '1.5px 8px',
                      borderRadius: 5,
                      backgroundColor: line.hl ? `${line.c}20` : 'transparent',
                      borderLeft: line.hl ? `3px solid ${line.c}` : '3px solid transparent',
                    }}
                  >
                    <span style={{ color: '#475569', width: 28, textAlign: 'right', flexShrink: 0 }}>{line.n}</span>
                    <span style={{ color: line.hl ? '#FFFFFF' : '#94A3B8', whiteSpace: 'pre-wrap' }}>{line.code}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid rgba(148,163,184,0.16)',
                  backgroundColor: 'rgba(251, 113, 133, 0.1)',
                  fontFamily: FONTS.sans,
                  fontSize: 14,
                  color: '#FFE4E6',
                }}
              >
                {t('不替你武断定罪，但 3 秒把审阅者带到最该看的代码行。', 'Find the lines worth reviewing in three seconds. You make the call.')}
              </div>
            </div>
          )}

          <FloatingCaption kicker="VUE #2532" text={vueCaption} accent={COLORS.ember} />
        </AbsoluteFill>
      )}

      {/* Sleek Optical Edge Highlight along Tokio -> Vue Diagonal Wipe */}
      {wipeT > 0.01 && wipeT < 0.99 && (
        <div
          style={{
            position: 'absolute',
            top: -80,
            bottom: -80,
            left: `${lerp(111, -33, wipeT)}%`,
            width: 90,
            background: `linear-gradient(90deg, transparent, ${COLORS.ember}22 65%, ${COLORS.ember}77 96%, #FFFFFF 100%)`,
            transform: 'rotate(11.5deg)',
            pointerEvents: 'none',
            zIndex: 42,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
