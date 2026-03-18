import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Zap, ShieldCheck, Radio, Database, Activity } from 'lucide-react';

/* ─── Palette ───────────────────────────────────────────────── */
const C = {
    page: '#0D0F14',
    panel: '#141720',
    card: '#1A1E2B',
    elevated: '#1F2436',
    sidebar: '#1C1F26',
    accent: '#00D4D4',
    accentHover: '#00BABA',
    accentSubtle: 'rgba(0,212,212,0.10)',
    accentGlow: 'rgba(0,212,212,0.15)',
    textPrimary: '#E8ECF5',
    textSecondary: '#8B92A8',
    textMuted: '#4A5168',
    borderDefault: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.04)',
    statusOk: '#22C55E',
};

/* ─── Geodesic grid overlay ─────────────────────────────────── */
const geodesicStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(${C.textPrimary} 1px, transparent 1px), linear-gradient(90deg, ${C.textPrimary} 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    opacity: 0.025,
};

/* ─── Pulse ring (css keyframes injected inline) ─────────────── */
const pulseKeyframes = `
  @keyframes lp-pulse {
    0%   { transform: scale(1);   opacity: 0.4; }
    100% { transform: scale(1.9); opacity: 0;   }
  }
  @keyframes lp-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

/* ─── Constellation SVG ──────────────────────────────────────── */
function ConstellationSVG({ active, total }: { active: number; total: number }) {
    // Fixed layout so SSR / first render is deterministic
    const nodes = [
        { cx: 18, cy: 14, a: true },
        { cx: 42, cy: 38, a: true },
        { cx: 70, cy: 12, a: false },
        { cx: 90, cy: 45, a: true },
        { cx: 60, cy: 60, a: false },
        { cx: 30, cy: 65, a: true },
        { cx: 110, cy: 20, a: true },
        { cx: 115, cy: 55, a: false },
        { cx: 80, cy: 72, a: true },
        { cx: 50, cy: 78, a: false },
        { cx: 10, cy: 45, a: false },
        { cx: 130, cy: 35, a: true },
        { cx: 100, cy: 75, a: false },
        { cx: 22, cy: 82, a: true },
    ];
    const edges = [[0, 1], [1, 5], [1, 3], [3, 6], [6, 11], [0, 2], [3, 8]];
    return (
        <svg width="145" height="90" viewBox="0 0 145 90" fill="none" aria-hidden="true">
            {edges.map(([a, b], i) => (
                <line
                    key={i}
                    x1={nodes[a].cx} y1={nodes[a].cy}
                    x2={nodes[b].cx} y2={nodes[b].cy}
                    stroke={C.accent} strokeWidth="0.8" opacity="0.18"
                />
            ))}
            {nodes.map((n, i) => (
                <circle
                    key={i}
                    cx={n.cx} cy={n.cy}
                    r={n.a ? 3 : 2}
                    fill={n.a ? C.accent : C.textMuted}
                    opacity={n.a ? 0.9 : 0.35}
                />
            ))}
            <text x="132" y="10" fill={C.accent} fontSize="7" fontFamily="IBM Plex Mono, monospace" textAnchor="end">
                {active}/{total}
            </text>
        </svg>
    );
}

/* ─── Signal waveform ────────────────────────────────────────── */
function SignalWave() {
    // Gaussian-shaped bars
    const bars = Array.from({ length: 28 }, (_, i) => {
        const t = (i - 13.5) / 7;
        const h = Math.round(Math.max(2, 22 * Math.exp(-(t * t))));
        const opacity = 0.2 + (i / 28) * 0.8;
        return { h, opacity };
    });
    return (
        <svg width="100%" height="36" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="18" x2="100%" y2="18" stroke={C.borderDefault} strokeWidth="1" />
            {bars.map((b, i) => (
                <rect
                    key={i}
                    x={`${(i / 28) * 100}%`}
                    y={18 - b.h}
                    width="2.5"
                    height={b.h * 2}
                    fill={C.accent}
                    opacity={i === 27 ? 1 : b.opacity * 0.7}
                    rx="1"
                />
            ))}
        </svg>
    );
}

/* ─── Radar crosshair visual ────────────────────────────────── */
function RadarCrosshair() {
    return (
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            {/* Concentric circles */}
            {[40, 70, 100].map((r, i) => (
                <circle key={i} cx="100" cy="100" r={r} stroke={C.accent} strokeWidth="1" opacity={0.08 + i * 0.04} />
            ))}
            {/* Cross hairs */}
            <line x1="0" y1="100" x2="200" y2="100" stroke={C.accent} strokeWidth="1" opacity="0.12" />
            <line x1="100" y1="0" x2="100" y2="200" stroke={C.accent} strokeWidth="1" opacity="0.12" />
            {/* Sweep line */}
            <line x1="100" y1="100" x2="170" y2="30" stroke={C.accent} strokeWidth="1.5" opacity="0.5" />
            {/* Active dot + pulse */}
            <circle cx="148" cy="68" r="5" fill={C.accent} opacity="0.9" />
            <circle cx="148" cy="68" r="12" stroke={C.accent} strokeWidth="1" opacity="0.3" />
            {/* Other signals */}
            <circle cx="60" cy="130" r="3" fill={C.textMuted} opacity="0.4" />
            <circle cx="120" cy="155" r="3" fill={C.accent} opacity="0.6" />
            <circle cx="55" cy="60" r="2" fill={C.textMuted} opacity="0.3" />
            <circle cx="170" cy="120" r="3" fill={C.accent} opacity="0.5" />
        </svg>
    );
}

/* ─── TAG card mock ─────────────────────────────────────────── */
function TagCardMock({ name, lat, lon, active }: { name: string; id?: string; lat: string; lon: string; active: boolean }) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-[8px] border"
            style={{ backgroundColor: C.card, borderColor: C.borderSubtle }}
        >
            {/* Pulse indicator */}
            <div className="relative flex-shrink-0" style={{ width: 16, height: 16 }}>
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ width: 8, height: 8, top: 4, left: 4, backgroundColor: active ? C.accent : C.textMuted, opacity: active ? 0.9 : 0.35 }}
                />
                {active && (
                    <div
                        className="absolute rounded-full border"
                        style={{
                            width: 16, height: 16, top: 0, left: 0,
                            borderColor: C.accent,
                            animation: 'lp-pulse 1.8s ease-out infinite',
                            opacity: 0.4,
                        }}
                    />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium font-sans truncate" style={{ color: C.textPrimary }}>{name}</p>
                <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>{lat} · {lon}</p>
            </div>
            <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                    backgroundColor: active ? C.accentSubtle : 'transparent',
                    color: active ? C.accent : C.textMuted,
                    border: `1px solid ${active ? 'rgba(0,212,212,0.2)' : C.borderSubtle}`,
                }}
            >
                {active ? 'ATIVO' : 'INATIVO'}
            </span>
        </div>
    );
}

/* ─── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div
            className="p-6 rounded-[8px] border transition-colors group"
            style={{ backgroundColor: C.card, borderColor: C.borderDefault }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,212,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.borderDefault)}
        >
            <div
                className="w-10 h-10 rounded-[6px] flex items-center justify-center mb-5"
                style={{ backgroundColor: C.accentSubtle }}
            >
                {icon}
            </div>
            <h3 className="text-[15px] font-semibold font-sans mb-2" style={{ color: C.textPrimary }}>{title}</h3>
            <p className="text-[13px] font-sans leading-relaxed" style={{ color: C.textSecondary }}>{description}</p>
        </div>
    );
}

/* ─── Stat item ─────────────────────────────────────────────── */
function StatItem({ number, label }: { number: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl font-bold font-mono mb-1" style={{ color: C.accent }}>{number}</div>
            <div className="text-[11px] font-sans uppercase tracking-[0.12em]" style={{ color: C.textMuted }}>{label}</div>
        </div>
    );
}

/* ─── Plan card ─────────────────────────────────────────────── */
function PlanCard({ name, price, features, featured, onSelect }: {
    name: string; price: string; features: string[]; featured?: boolean; onSelect: () => void;
}) {
    return (
        <div
            className="p-6 rounded-[8px] border flex flex-col"
            style={{
                backgroundColor: featured ? C.elevated : C.card,
                borderColor: featured ? 'rgba(0,212,212,0.35)' : C.borderDefault,
                position: 'relative',
                marginTop: featured ? 0 : 16,
            }}
        >
            {featured && (
                <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold font-mono px-3 py-1 rounded-full"
                    style={{ backgroundColor: C.accent, color: C.page, letterSpacing: '0.1em' }}
                >
                    POPULAR
                </span>
            )}
            <p className="text-[11px] font-bold font-sans uppercase tracking-[0.15em] mb-2" style={{ color: C.textMuted }}>{name}</p>
            <div className="mb-5">
                <span className="text-3xl font-bold font-mono" style={{ color: C.textPrimary }}>{price}</span>
                {price !== 'Consulta' && <span className="text-[12px] font-sans ml-1" style={{ color: C.textMuted }}>/mês</span>}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[12px] font-sans" style={{ color: C.textSecondary }}>
                        <span style={{ color: C.accent, fontSize: 10 }}>◆</span> {f}
                    </li>
                ))}
            </ul>
            <button
                onClick={onSelect}
                className="w-full py-2.5 rounded-[6px] text-[13px] font-semibold font-sans transition-colors"
                style={featured
                    ? { backgroundColor: C.accent, color: C.page }
                    : { backgroundColor: 'transparent', border: `1px solid ${C.borderDefault}`, color: C.textSecondary }
                }
                onMouseEnter={e => {
                    if (featured) (e.currentTarget.style.backgroundColor = C.accentHover);
                    else { e.currentTarget.style.borderColor = 'rgba(0,212,212,0.3)'; e.currentTarget.style.color = C.textPrimary; }
                }}
                onMouseLeave={e => {
                    if (featured) (e.currentTarget.style.backgroundColor = C.accent);
                    else { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }
                }}
            >
                {featured ? 'Assinar Agora' : price === 'Consulta' ? 'Falar com Vendas' : 'Começar Grátis'}
            </button>
        </div>
    );
}

/* ─── Main component ────────────────────────────────────────── */
export function Landing() {
    const navigate = useNavigate();
    const toLogin = () => navigate('/login');

    const tags = [
        { name: 'Caminhão Scania R450', id: 'TAG-001', lat: '-23.5505', lon: '-46.6333', active: true },
        { name: 'Van Mercedes Sprinter', id: 'TAG-002', lat: '-23.5489', lon: '-46.6388', active: true },
        { name: 'Moto Honda CG 160', id: 'TAG-003', lat: '-23.5601', lon: '-46.6100', active: false },
        { name: 'Utilitário Fiat Strada', id: 'TAG-004', lat: '-23.5710', lon: '-46.6455', active: true },
    ];

    return (
        <>
            {/* Inject pulse keyframes */}
            <style>{pulseKeyframes}</style>

            <div
                className="min-h-screen overflow-x-hidden"
                style={{ backgroundColor: C.page, color: C.textPrimary, fontFamily: "'DM Sans', sans-serif" }}
            >
                {/* Fixed geodesic background */}
                <div className="fixed inset-0 pointer-events-none" style={geodesicStyle} aria-hidden="true" />

                {/* ── Navbar ─────────────────────────────────────────── */}
                <nav
                    className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center border-b backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(13,15,20,0.85)', borderColor: C.borderSubtle }}
                >
                    <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                {/* Pulse dot blink */}
                                <div
                                    className="w-2 h-2 rounded-full absolute -top-0.5 -right-0.5 z-10"
                                    style={{ backgroundColor: C.accent, animation: 'lp-blink 2s ease-in-out infinite' }}
                                />
                                <div
                                    className="w-8 h-8 rounded-[6px] flex items-center justify-center"
                                    style={{ backgroundColor: C.accentSubtle, border: `1px solid rgba(0,212,212,0.2)` }}
                                >
                                    <Radio size={16} strokeWidth={1.5} style={{ color: C.accent }} />
                                </div>
                            </div>
                            <span className="text-[15px] font-bold font-sans tracking-tight" style={{ color: C.textPrimary }}>
                                Tag <span style={{ color: C.accent }}>Manager</span>
                            </span>
                        </div>

                        {/* Nav links */}
                        <div className="hidden md:flex items-center gap-8">
                            {[['#features', 'Funcionalidades'], ['#performance', 'Performance'], ['#plans', 'Planos']].map(([href, label]) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="text-[13px] font-sans transition-colors"
                                    style={{ color: C.textSecondary }}
                                    onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                                    onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}
                                >
                                    {label}
                                </a>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toLogin}
                                className="text-[13px] font-sans transition-colors"
                                style={{ color: C.textSecondary }}
                                onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                                onMouseLeave={e => (e.currentTarget.style.color = C.textSecondary)}
                            >
                                Entrar
                            </button>
                            <button
                                onClick={toLogin}
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-[6px] text-[13px] font-semibold font-sans transition-colors"
                                style={{ backgroundColor: C.accent, color: C.page }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.accentHover)}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.accent)}
                            >
                                Acessar Sistema
                                <ArrowRight size={13} strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* ── Hero ────────────────────────────────────────────── */}
                <section className="pt-36 pb-24 px-6 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: copy */}
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Status badge */}
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.12em] mb-8 border"
                                style={{ backgroundColor: C.accentSubtle, borderColor: 'rgba(0,212,212,0.2)', color: C.accent }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: C.accent, animation: 'lp-blink 1.8s ease-in-out infinite' }}
                                />
                                Sistema em operação · v2.0
                            </div>

                            <h1
                                className="text-5xl lg:text-6xl font-bold font-sans leading-[1.08] tracking-tight mb-6"
                                style={{ color: C.textPrimary }}
                            >
                                O centro nervoso
                                <br />
                                da sua{' '}
                                <span style={{ color: C.accent }}>frota</span>.
                            </h1>

                            <p className="text-[15px] font-sans leading-relaxed mb-8 max-w-lg" style={{ color: C.textSecondary }}>
                                Cada TAG é um sinal vivo. Integração BRGPS + Traccar em tempo real, histórico de transmissões e controle total da frota — em uma plataforma técnica e precisa.
                            </p>

                            {/* Coords strip */}
                            <div
                                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[6px] border mb-8 font-mono text-[11px]"
                                style={{ backgroundColor: C.elevated, borderColor: C.borderDefault, color: C.textMuted }}
                            >
                                <span style={{ color: C.accent }}>◉</span>
                                <span>LAT -23.5505</span>
                                <span style={{ color: C.borderDefault }}>|</span>
                                <span>LON -46.6333</span>
                                <span style={{ color: C.borderDefault }}>|</span>
                                <span style={{ color: C.statusOk }}>SIGNAL OK</span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={toLogin}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] text-[14px] font-semibold font-sans transition-colors"
                                    style={{ backgroundColor: C.accent, color: C.page }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.accentHover)}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.accent)}
                                >
                                    Acessar Sistema
                                    <ArrowRight size={15} strokeWidth={2} />
                                </button>
                                <button
                                    onClick={toLogin}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[6px] text-[14px] font-semibold font-sans transition-colors border"
                                    style={{ backgroundColor: 'transparent', borderColor: C.borderDefault, color: C.textSecondary }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,212,0.3)'; e.currentTarget.style.color = C.textPrimary; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDefault; e.currentTarget.style.color = C.textSecondary; }}
                                >
                                    Criar Conta
                                </button>
                            </div>
                        </div>

                        {/* Right: TAG list panel mock */}
                        <div
                            className="rounded-[8px] border overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700 delay-200"
                            style={{ backgroundColor: C.panel, borderColor: C.borderDefault }}
                        >
                            {/* Panel header */}
                            <div
                                className="px-5 py-4 border-b flex items-center justify-between"
                                style={{ borderColor: C.borderSubtle, backgroundColor: C.elevated }}
                            >
                                <div className="flex items-center gap-2">
                                    <Radio size={14} strokeWidth={1.5} style={{ color: C.accent }} />
                                    <span className="text-[12px] font-mono font-bold" style={{ color: C.textPrimary }}>TAG MONITOR</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono" style={{ color: C.textMuted }}>4 ativos · sync 30s</span>
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: C.accent, animation: 'lp-blink 1.8s ease-in-out infinite' }}
                                    />
                                </div>
                            </div>

                            {/* Waveform */}
                            <div className="px-5 py-3 border-b" style={{ borderColor: C.borderSubtle }}>
                                <p className="text-[9px] font-mono uppercase tracking-[0.12em] mb-1.5" style={{ color: C.textMuted }}>Último Sinal Recebido</p>
                                <SignalWave />
                                <div className="flex justify-between mt-1">
                                    <span className="text-[9px] font-mono" style={{ color: C.textMuted }}>TAG-001</span>
                                    <span className="text-[9px] font-mono" style={{ color: C.textMuted }}>22:45:31</span>
                                </div>
                            </div>

                            {/* TAG cards */}
                            <div className="p-4 space-y-2">
                                {tags.map(t => (
                                    <TagCardMock key={t.id} {...t} />
                                ))}
                            </div>

                            {/* Constellation footer */}
                            <div
                                className="px-5 py-4 border-t flex items-center justify-between"
                                style={{ borderColor: C.borderSubtle, backgroundColor: C.elevated }}
                            >
                                <div>
                                    <p className="text-[9px] font-mono uppercase tracking-[0.12em] mb-0.5" style={{ color: C.textMuted }}>Visão da Frota</p>
                                    <p className="text-[11px] font-mono" style={{ color: C.accent }}>3/4 transmitindo</p>
                                </div>
                                <ConstellationSVG active={3} total={4} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Stats bar ───────────────────────────────────────── */}
                <div
                    className="border-y"
                    style={{ backgroundColor: C.panel, borderColor: C.borderSubtle }}
                >
                    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatItem number="99.9%" label="Uptime Garantido" />
                        <StatItem number="< 50ms" label="Latência de API" />
                        <StatItem number="50k+" label="Posições/Dia" />
                        <StatItem number="24/7" label="Monitoramento" />
                    </div>
                </div>

                {/* ── Features ────────────────────────────────────────── */}
                <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="mb-14">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] mb-3" style={{ color: C.accent }}>
                            FUNCIONALIDADES
                        </p>
                        <h2 className="text-3xl font-bold font-sans" style={{ color: C.textPrimary }}>
                            Feito para quem opera frota de verdade.
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard
                            icon={<Globe size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Integração Universal"
                            description="Conecte dispositivos BRGPS e Traccar simultaneamente. Uma única interface para todos os seus rastreadores."
                        />
                        <FeatureCard
                            icon={<Zap size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Sincronização em Tempo Real"
                            description="Posições atualizadas em até 30 segundos. Latência de rede monitorada e ajustada automaticamente pelo sistema."
                        />
                        <FeatureCard
                            icon={<Activity size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Histórico de Transmissões"
                            description="Trilha completa de cada sinal enviado: timestamp, coordenadas e status. Consulte qualquer ponto da rota."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Segurança de Dados"
                            description="Autenticação com JWT, senhas com bcrypt, tokens por sessão. Sua frota e seus dados sob controle."
                        />
                        <FeatureCard
                            icon={<Database size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Banco de Dados Dedicado"
                            description="PostgreSQL com Prisma ORM. Schema versionado, migrações seguras e performance garantida em escala."
                        />
                        <FeatureCard
                            icon={<Radio size={18} strokeWidth={1.5} style={{ color: C.accent }} />}
                            title="Monitoramento de Status"
                            description="Detecção automática de TAGs silenciosas. Alertas de perda de sinal antes que o operador perceba."
                        />
                    </div>
                </section>

                {/* ── Radar section ────────────────────────────────────── */}
                <section id="performance" className="py-24 border-y" style={{ backgroundColor: C.panel, borderColor: C.borderSubtle }}>
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Radar visual */}
                            <div className="flex items-center justify-center">
                                <div
                                    className="relative rounded-full p-4"
                                    style={{ backgroundColor: C.elevated, border: `1px solid ${C.borderDefault}` }}
                                >
                                    <RadarCrosshair />
                                    <div
                                        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-mono border"
                                        style={{ backgroundColor: C.accentSubtle, borderColor: 'rgba(0,212,212,0.2)', color: C.accent }}
                                    >
                                        SCAN ATIVO
                                    </div>
                                </div>
                            </div>

                            {/* Copy */}
                            <div>
                                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] mb-3" style={{ color: C.accent }}>
                                    ARQUITETURA
                                </p>
                                <h2 className="text-3xl font-bold font-sans mb-6" style={{ color: C.textPrimary }}>
                                    Cada TAG é um sinal.
                                    <br />
                                    A interface escuta.
                                </h2>
                                <p className="text-[14px] font-sans leading-relaxed mb-8" style={{ color: C.textSecondary }}>
                                    O Tag Manager não exibe dados em tabelas estáticas. Ele lê o pulso da frota: cada dispositivo transmite sua posição, o sistema processa em tempo real e entrega a visualização do estado atual — como um radar que nunca para de girar.
                                </p>

                                {/* Timeline-style list */}
                                <div className="relative pl-5 space-y-6 border-l" style={{ borderColor: C.borderSubtle }}>
                                    {[
                                        { label: 'Dispositivo BRGPS emite posição GPS', detail: 'Protocolo proprietário BRGPS v3' },
                                        { label: 'API busca e normaliza os dados', detail: 'NestJS · sincronização configurável 30–3600s' },
                                        { label: 'Banco armazena e indexa a transmissão', detail: 'PostgreSQL + Prisma · índices em timestamp + tagId' },
                                        { label: 'Interface reflete o estado em tempo real', detail: 'React + Zustand · atualização sem reload' },
                                    ].map((item, i) => (
                                        <div key={i} className="relative">
                                            <div
                                                className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border-2 top-1"
                                                style={{
                                                    backgroundColor: i === 0 ? C.accent : C.page,
                                                    borderColor: i === 0 ? C.accent : C.borderDefault,
                                                }}
                                            />
                                            <p className="text-[13px] font-semibold font-sans" style={{ color: C.textPrimary }}>{item.label}</p>
                                            <p className="text-[11px] font-mono mt-0.5" style={{ color: C.textMuted }}>{item.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Pricing ─────────────────────────────────────────── */}
                <section id="plans" className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.15em] mb-3" style={{ color: C.accent }}>
                            PLANOS
                        </p>
                        <h2 className="text-3xl font-bold font-sans" style={{ color: C.textPrimary }}>Escale com a sua frota.</h2>
                        <p className="text-[14px] font-sans mt-3" style={{ color: C.textSecondary }}>Sem contrato. Cancele quando quiser.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
                        <PlanCard
                            name="Básico"
                            price="R$ 29"
                            features={['Até 2 rastreadores', 'Histórico de 7 dias', 'Sync a cada 60s']}
                            onSelect={toLogin}
                        />
                        <PlanCard
                            name="Profissional"
                            price="R$ 59"
                            features={['Até 10 rastreadores', 'Histórico de 30 dias', 'Sync a cada 30s', 'Relatórios avançados']}
                            featured
                            onSelect={toLogin}
                        />
                        <PlanCard
                            name="Enterprise"
                            price="Consulta"
                            features={['Rastreadores ilimitados', 'Histórico de 90 dias', 'API dedicada', 'SLA garantido']}
                            onSelect={toLogin}
                        />
                    </div>
                </section>

                {/* ── Footer ──────────────────────────────────────────── */}
                <footer className="border-t" style={{ backgroundColor: C.panel, borderColor: C.borderSubtle }}>
                    <div className="max-w-7xl mx-auto px-6 py-14">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                            <div className="col-span-2">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div
                                        className="w-7 h-7 rounded-[6px] flex items-center justify-center"
                                        style={{ backgroundColor: C.accentSubtle, border: `1px solid rgba(0,212,212,0.2)` }}
                                    >
                                        <Radio size={14} strokeWidth={1.5} style={{ color: C.accent }} />
                                    </div>
                                    <span className="text-[14px] font-bold font-sans" style={{ color: C.textPrimary }}>
                                        Tag <span style={{ color: C.accent }}>Manager</span>
                                    </span>
                                </div>
                                <p className="text-[12px] font-sans leading-relaxed max-w-xs" style={{ color: C.textMuted }}>
                                    Plataforma de rastreamento inteligente para frotas. Integração BRGPS + Traccar. Construído para operação real.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold font-sans uppercase tracking-[0.12em] mb-4" style={{ color: C.textSecondary }}>Produto</h4>
                                <ul className="space-y-2.5">
                                    {['Funcionalidades', 'Integrações', 'Preços', 'Atualizações'].map(item => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                className="text-[12px] font-sans transition-colors"
                                                style={{ color: C.textMuted }}
                                                onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                                                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold font-sans uppercase tracking-[0.12em] mb-4" style={{ color: C.textSecondary }}>Legal</h4>
                                <ul className="space-y-2.5">
                                    {['Privacidade', 'Termos de Uso', 'Contato'].map(item => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                className="text-[12px] font-sans transition-colors"
                                                style={{ color: C.textMuted }}
                                                onMouseEnter={e => (e.currentTarget.style.color = C.textPrimary)}
                                                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: C.borderSubtle }}>
                            <p className="text-[11px] font-mono" style={{ color: C.textMuted }}>
                                © {new Date().getFullYear()} Tag Manager · Todos os direitos reservados.
                            </p>
                            <p className="text-[10px] font-mono" style={{ color: C.textMuted }}>
                                BUILD <span style={{ color: C.accent }}>2.0.0</span> · BRGPS + TRACCAR
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
