import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { LoginForm } from '@/components/login-form';
import { SignupForm } from '@/components/signup-form';
import {
  Cpu,
  Bot,
  ShieldCheck,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  Activity,
  Code2,
  X,
  Layers,
  ChevronRight,
  Terminal,
  Database,
  Workflow,
  Lock,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileCheck2,
  History,
  Fingerprint,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/magicui/particles';
import { BorderBeam } from '@/components/magicui/border-beam';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { OrbitingCircles } from '@/components/magicui/orbiting-circles';
import { BlurFade } from '@/components/magicui/blur-fade';

export default function LandingPage() {
  const { user, userRole, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Modal states: null | 'login' | 'signup'
  const [authModal, setAuthModal] = useState(null);

  const handleDashboardRedirect = () => {
    const role = userRole || 'user';
    navigate(`/${role}/dashboard`);
  };

  // Auto-close modal and redirect if user becomes authenticated
  React.useEffect(() => {
    if (user && authModal) {
      setAuthModal(null);
      handleDashboardRedirect();
    }
  }, [user, authModal, userRole, navigate]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans transition-colors">
      {/* ── Interactive Particle Background ──────────────────────────────── */}
      <Particles
        className="absolute inset-0"
        quantity={40}
        ease={80}
        color={theme === 'dark' ? '#818cf8' : '#4f46e5'}
        refresh
      />

      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] h-[400px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
      </div>

      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Cpu size={22} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[var(--text-main)]">Agentix</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                v2.0 Classical
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-muted)]">
            <a
              href="#features"
              onClick={(e) => scrollToSection(e, 'features')}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Features
            </a>
            <a
              href="#orchestration"
              onClick={(e) => scrollToSection(e, 'orchestration')}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Orchestration
            </a>
            <a
              href="#security"
              onClick={(e) => scrollToSection(e, 'security')}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Governance
            </a>
            <a
              href="#audit"
              onClick={(e) => scrollToSection(e, 'audit')}
              className="hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Audit Trail
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={16} className="text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-20 rounded-md bg-[var(--bg-secondary)] animate-pulse" />
                <div className="h-9 w-24 rounded-md bg-[var(--bg-secondary)] animate-pulse" />
              </div>
            ) : user ? (
              <Button onClick={handleDashboardRedirect} className="gap-2">
                Open Dashboard <ArrowRight size={16} />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setAuthModal('login')}
                  className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  Sign in
                </Button>
                <ShimmerButton
                  onClick={() => setAuthModal('signup')}
                  shimmerColor={theme === 'dark' ? '#818cf8' : '#6366f1'}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Get Started
                </ShimmerButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28 text-center">
        <BlurFade delay={0.1}>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md mb-8">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>Autonomous AI Platform &amp; Engineering Intelligence</span>
          </div>
        </BlurFade>

        <BlurFade delay={0.2}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Self-healing codebases orchestrated by{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Autonomous AI Agents
            </span>
          </h1>
        </BlurFade>

        <BlurFade delay={0.3}>
          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Agentix connects developers, admins, and autonomous diagnostic agents to inspect codebases, debug issues, generate verified pull requests, and audit system health in real time.
          </p>
        </BlurFade>

        <BlurFade delay={0.4}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {isLoading ? (
              <div className="flex gap-4">
                <div className="h-12 w-40 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
                <div className="h-12 w-32 rounded-lg bg-[var(--bg-secondary)] animate-pulse" />
              </div>
            ) : user ? (
              <ShimmerButton
                onClick={handleDashboardRedirect}
                className="gap-2 px-8 h-12 text-sm font-semibold"
              >
                Enter Application <ArrowRight size={18} />
              </ShimmerButton>
            ) : (
              <>
                <ShimmerButton
                  onClick={() => setAuthModal('signup')}
                  className="gap-2 px-8 h-12 text-sm font-semibold"
                >
                  Create Account <ChevronRight size={18} />
                </ShimmerButton>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setAuthModal('login')}
                  className="h-12 px-7 text-sm font-medium border-slate-700 bg-slate-900/60 hover:bg-slate-800"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </BlurFade>

        {/* ── Live Telemetry Showcase Card with BorderBeam ────────────────── */}
        <BlurFade delay={0.5}>
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5 text-left overflow-hidden">
            <BorderBeam size={250} duration={12} delay={9} colorFrom="#6366f1" colorTo="#06b6d4" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-xs text-slate-400">agentix-runtime // live-cluster-v2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-400 font-mono font-medium">CLUSTER ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Code2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">1. Issue Ingestion</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Ticket #104: Auth State Memory Leak</h4>
                <p className="mt-1 text-xs text-slate-400">Telemetry logs analyzed in 12ms. Context mapped to 4 source modules.</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">High Severity</span>
                  <span className="text-[10px] text-slate-500 font-mono">React 18 / Supabase</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 relative overflow-hidden">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Bot size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">2. Agent Orchestration</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Agent Alpha: Fix Synthesis</h4>
                <p className="mt-1 text-xs text-slate-400">Deterministic patch produced with unit test pass rate: 100%.</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded">Sandbox Verified</span>
                  <span className="text-[10px] text-emerald-400 font-mono">0 regressions</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <GitPullRequest size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">3. Automated PR &amp; Audit</span>
                </div>
                <h4 className="text-sm font-semibold text-slate-200">PR #892 Merged &amp; Sealed</h4>
                <p className="mt-1 text-xs text-slate-400">Cryptographically recorded in immutable audit log with full diff history.</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Audit Logged</span>
                  <span className="text-[10px] text-slate-500 font-mono">Admin Verified</span>
                </div>
              </div>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* ── SECTION 1: FEATURES (#features) ──────────────────────────────── */}
      <section id="features" className="relative z-10 border-t border-white/5 bg-slate-950/90 py-24 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Core Product Capabilities</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Enterprise Autonomous Reliability
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Explore four foundational pillars that make Agentix safe, deterministic, and self-healing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature Card 1 */}
            <div className="relative group rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Automated Ticket Classification &amp; Triage</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ingests raw bug reports and user tickets via natural language. Uses Jaccard similarity to cluster duplicates, categorizes requests into code vs. operational tracks, and computes deterministic P0–P3 severity ratings.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-indigo-300">
                <span className="bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40">Jaccard Matcher</span>
                <span className="bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40">Priority Scoring</span>
                <span className="bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/40">Duplicate Deduplication</span>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="relative group rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Risk-Gated Auto-Remediation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Enforces strict policy boundaries before applying patches. LOW risk tasks auto-execute instantly; MEDIUM risk changes require one-click human developer approval; HIGH risk mutations escalate to senior clearance.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-amber-300">
                <span className="bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">3-Tier Risk Engine</span>
                <span className="bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">Human Approval Queue</span>
                <span className="bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">Zero Blind Auto-Merges</span>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="relative group rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AST Code-Fix &amp; Sandbox Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                RepoAgent parses codebases into abstract syntax trees (AST), pinpointing symbol dependencies and synthesizing unified git diffs. VerifierAgent runs isolated pytest subprocesses to guarantee zero regression before merge.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-cyan-300">
                <span className="bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">AST Symbol Indexer</span>
                <span className="bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">Subprocess Sandbox</span>
                <span className="bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">Unified Diff Engine</span>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="relative group rounded-2xl border border-white/10 bg-slate-900/60 p-8 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 backdrop-blur-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <History size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Cryptographic Audit Trail &amp; Compliance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Maintains an immutable ledger of every agent action, LLM reasoning step, human approval, and authentication session. Guarantees 100% transparent auditability for compliance, security reviews, and SOC2 requirements.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-emerald-300">
                <span className="bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">Append-Only Audit Log</span>
                <span className="bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">Session Tracking</span>
                <span className="bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">Actor Metadata</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ORCHESTRATION (#orchestration) ────────────────────── */}
      <section id="orchestration" className="relative z-10 border-t border-white/5 bg-slate-950/80 py-24 scroll-mt-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Agent Flow Architecture</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              End-to-End Orchestration Pipeline
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              How Agentix guides incoming tickets through deterministic multi-agent state machine transitions.
            </p>
          </div>

          {/* Horizontal Step Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
            {/* Step 1: Classify */}
            <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">1</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Stage 1</span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Search size={14} className="text-indigo-400" /> Classify
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  TriageAgent parses ticket text, checks duplicate clusters, and assigns severity + execution track.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-indigo-400">
                Agent: TriageAgent
              </div>
            </div>

            {/* Step 2: Investigate */}
            <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">2</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Stage 2</span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Code2 size={14} className="text-cyan-400" /> Investigate
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  RepoAgent traverses AST symbols, reads logs, and isolates root-cause files with semantic context.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-cyan-400">
                Agent: Repo &amp; AST Indexer
              </div>
            </div>

            {/* Step 3: Risk Gate */}
            <div className="relative rounded-xl border border-amber-500/30 bg-amber-950/20 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold border border-amber-500/30">3</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">Policy Gate</span>
                </div>
                <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" /> Risk Gate
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  RiskEngine evaluates blast radius: LOW auto-executes; MEDIUM pauses for developer review.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-500/20 text-[10px] font-mono text-amber-400">
                Guard: RiskEngine
              </div>
            </div>

            {/* Step 4: Act */}
            <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-mono text-xs font-bold border border-purple-500/30">4</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Stage 3</span>
                </div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Bot size={14} className="text-purple-400" /> Act
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  CoderAgent produces deterministic unified diff patches or operational remediation scripts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-purple-400">
                Agent: CoderAgent
              </div>
            </div>

            {/* Step 5: Verify */}
            <div className="relative rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">5</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Final Stage</span>
                </div>
                <h4 className="text-sm font-bold text-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Verify
                </h4>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  VerifierAgent runs pytest in sandbox, validates 0 regressions, and records immutable audit log.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                Agent: Sandbox &amp; Verifier
              </div>
            </div>
          </div>

          {/* Orbiting Multi-Model Visualization */}
          <div className="relative flex h-[380px] w-full max-w-3xl mx-auto items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <BorderBeam size={200} duration={16} delay={4} colorFrom="#a855f7" colorTo="#6366f1" />

            {/* Central Node */}
            <div className="z-10 flex flex-col items-center justify-center gap-1 rounded-2xl border border-indigo-500/40 bg-indigo-950/80 px-5 py-4 shadow-2xl backdrop-blur-xl">
              <Cpu size={30} className="text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-slate-100">AGENTIX ORCHESTRATOR</span>
              <span className="text-[10px] text-indigo-300 font-mono">State Graph &amp; Telemetry Engine</span>
            </div>

            {/* Inner Orbit */}
            <OrbitingCircles radius={95} duration={20} iconSize={36}>
              <Bot size={18} className="text-indigo-400" />
            </OrbitingCircles>
            <OrbitingCircles radius={95} duration={20} delay={10} iconSize={36}>
              <Code2 size={18} className="text-cyan-400" />
            </OrbitingCircles>

            {/* Outer Orbit */}
            <OrbitingCircles radius={160} duration={30} reverse iconSize={40}>
              <Database size={20} className="text-emerald-400" />
            </OrbitingCircles>
            <OrbitingCircles radius={160} duration={30} delay={10} reverse iconSize={40}>
              <GitPullRequest size={20} className="text-purple-400" />
            </OrbitingCircles>
            <OrbitingCircles radius={160} duration={30} delay={20} reverse iconSize={40}>
              <ShieldCheck size={20} className="text-amber-400" />
            </OrbitingCircles>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: GOVERNANCE & SECURITY (#security) ─────────────────── */}
      <section id="security" className="relative z-10 border-t border-white/5 bg-slate-950/90 py-24 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Safety &amp; Authorization</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              3-Tier Risk Engine &amp; Row-Level Security
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Autonomous AI without runaway actions. Every capability is governed by deterministic policies and Supabase RLS.
            </p>
          </div>

          {/* 3-Tier Risk Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* LOW RISK */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle size={14} /> LOW RISK
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300/80">Auto-Remediated</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Automated Execution</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Zero-latency automated execution for safe diagnostic actions, read-only SQL queries, system log analysis, and documentation fixes.
                </p>
              </div>
              <div className="border-t border-emerald-500/20 pt-3 text-[11px] font-mono text-slate-400">
                <div className="text-emerald-400 font-semibold mb-1">Permitted Actions:</div>
                • Log parsing &amp; regex triage<br />
                • Read-only SQL schema queries<br />
                • In-memory AST symbol mapping
              </div>
            </div>

            {/* MEDIUM RISK */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle size={14} /> MEDIUM RISK
                  </span>
                  <span className="text-[11px] font-mono text-amber-300/80">Developer Gated</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Human-in-the-Loop Approval</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Source code edits and environment configuration updates require one-click human verification in the Developer Approval Queue.
                </p>
              </div>
              <div className="border-t border-amber-500/20 pt-3 text-[11px] font-mono text-slate-400">
                <div className="text-amber-400 font-semibold mb-1">Permitted Actions:</div>
                • Python / JavaScript code patches<br />
                • Test suite generation &amp; execution<br />
                • Non-destructive service reloads
              </div>
            </div>

            {/* HIGH RISK */}
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    <AlertOctagon size={14} /> HIGH RISK
                  </span>
                  <span className="text-[11px] font-mono text-rose-300/80">Escalation Only</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Strict Admin Escalation</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Destructive operations, schema drops, secret mutations, and production deploys are blocked from auto-merge and require Admin authorization.
                </p>
              </div>
              <div className="border-t border-rose-500/20 pt-3 text-[11px] font-mono text-slate-400">
                <div className="text-rose-400 font-semibold mb-1">Permitted Actions:</div>
                • Database schema migrations<br />
                • Secret &amp; API key changes<br />
                • Infrastructure teardowns
              </div>
            </div>
          </div>

          {/* RLS Row-Level Security Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Lock size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">PostgreSQL Row-Level Security (RLS) Isolation</h4>
                  <p className="text-xs text-slate-400">Native database-level tenant and role segregation</p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                RLS POLICIES ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">User Role Scope</div>
                <p className="text-slate-400 text-[11px]">Can only view and raise tickets where <code className="text-indigo-300">raised_by = auth.uid()</code>. Zero access to code sandboxes.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Developer Role Scope</div>
                <p className="text-slate-400 text-[11px]">Can review issues, approve/reject generated diffs, and inspect sandbox logs. Cannot alter user permissions.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                <div className="font-bold text-slate-200 mb-1">Admin Role Scope</div>
                <p className="text-slate-400 text-[11px]">Full access to platform audit logs, user role assignments, system config, and high-risk clearance overrides.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: AUDIT TRAIL (#audit) ──────────────────────────────── */}
      <section id="audit" className="relative z-10 border-t border-white/5 bg-slate-950/80 py-24 scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Compliance &amp; Traceability</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Immutable Audit Ledger &amp; Login History
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Every action taken by users, developers, and autonomous agents is timestamped and cryptographically logged.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Description & Guarantees */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3 text-emerald-400">
                  <Activity size={20} />
                  <h3 className="text-base font-bold text-white">Append-Only Audit Log</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Whenever an agent generates a diff, a developer approves a patch, or a ticket changes status, a non-updatable entry is appended to the <code className="text-emerald-300 font-mono">audit_log</code> table with actor ID, ticket ID, and delta payload.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3 text-indigo-400">
                  <Fingerprint size={20} />
                  <h3 className="text-base font-bold text-white">Session &amp; Login History</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every authenticated session is logged to <code className="text-indigo-300 font-mono">login_history</code> with IP address, client user-agent string, authentication timestamp, and role clearance at login.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-3 text-purple-400">
                  <ShieldCheck size={20} />
                  <h3 className="text-base font-bold text-white">Enterprise Regulatory Readiness</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Built to satisfy strict SOC2, HIPAA, and internal security compliance standards with complete provenance from issue intake to merge.
                </p>
              </div>
            </div>

            {/* Right Column: Live Audit Ledger Preview Card */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live Audit Log Stream</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Table: audit_log</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Event 1 */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">PATCH_APPROVED</span>
                      <span className="text-slate-200 font-semibold">Ticket #104</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Actor: dev_8829 // Action: Merged diff patch to main</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">2 mins ago</span>
                </div>

                {/* Event 2 */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">SANDBOX_VERIFIED</span>
                      <span className="text-slate-200 font-semibold">Ticket #104</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Actor: VerifierAgent // Pytest passed: 12/12 (100%)</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">4 mins ago</span>
                </div>

                {/* Event 3 */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">RISK_EVALUATED</span>
                      <span className="text-slate-200 font-semibold">Ticket #104</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Actor: RiskEngine // Blast radius: MEDIUM (Approval Required)</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">6 mins ago</span>
                </div>

                {/* Event 4 */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">TICKET_CREATED</span>
                      <span className="text-slate-200 font-semibold">Ticket #104</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Actor: user_1092 // Description: Memory leak in auth state</p>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">8 mins ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-10 text-center text-xs text-slate-500 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-indigo-400" />
            <span className="font-semibold text-slate-400">Agentix</span>
            <span>— Autonomous AI Engineering Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-slate-400 transition-colors">Features</a>
            <a href="#orchestration" onClick={(e) => scrollToSection(e, 'orchestration')} className="hover:text-slate-400 transition-colors">Orchestration</a>
            <a href="#security" onClick={(e) => scrollToSection(e, 'security')} className="hover:text-slate-400 transition-colors">Governance</a>
            <a href="#audit" onClick={(e) => scrollToSection(e, 'audit')} className="hover:text-slate-400 transition-colors">Audit Trail</a>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Agentix Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* ── Auth Popup Modal (Populated with Shadcn LoginForm & SignupForm) ─ */}
      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md">
            {/* Close Button */}
            <button
              onClick={() => setAuthModal(null)}
              className="absolute -top-3 -right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white border border-slate-700 shadow-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>

            {authModal === 'login' ? (
              <LoginForm
                onSuccess={() => {
                  setAuthModal(null);
                  handleDashboardRedirect();
                }}
                onSwitchToSignup={() => setAuthModal('signup')}
              />
            ) : (
              <SignupForm
                onSuccess={() => {
                  setAuthModal(null);
                  handleDashboardRedirect();
                }}
                onSwitchToLogin={() => setAuthModal('login')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
