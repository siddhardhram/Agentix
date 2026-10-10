import React, { useState, useEffect } from 'react';
import { Bot, Activity, Cpu, Database, AlertTriangle, Play, Square, RefreshCw, Terminal, Code2, ShieldCheck, Microscope } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useToast } from '../../components/ui/toast';

const mockAgents = [
  { id: 'agt-1a', name: 'Triage Agent', type: 'triage', status: 'active', uptime: '14d 2h', load: 45, current_task: 'Categorizing TCK-9912', icon: Microscope, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'agt-2b', name: 'Investigator Alpha', type: 'investigation', status: 'active', uptime: '14d 1h', load: 78, current_task: 'Analyzing logs for TCK-8821', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'agt-2c', name: 'Investigator Beta', type: 'investigation', status: 'idle', uptime: '14d 1h', load: 0, current_task: 'Waiting for tasks', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'agt-3a', name: 'CodeFix Primary', type: 'generation', status: 'active', uptime: '14d 2h', load: 92, current_task: 'Generating patch for auth module', icon: Code2, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
  { id: 'agt-4a', name: 'Verifier One', type: 'verification', status: 'error', uptime: '2d 4h', load: 12, current_task: 'Container crash during pytest', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'agt-5a', name: 'Security Scanner', type: 'security', status: 'active', uptime: '14d 2h', load: 33, current_task: 'Scanning PR #402', icon: ShieldCheck, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

export default function AdminAgents() {
  const { addToast } = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAction = (agentId, action) => {
    addToast({ title: `Action '${action}' sent to agent ${agentId}`, type: 'success' });
    if (action === 'restart') {
      setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'restarting', load: 0, current_task: 'Initializing...' } : a));
      setTimeout(() => {
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: 'idle', current_task: 'Waiting for tasks' } : a));
      }, 3000);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</Badge>;
      case 'idle': return <Badge variant="outline" className="bg-slate-800 text-slate-400 border-slate-700">Idle</Badge>;
      case 'error': return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30">Error</Badge>;
      case 'restarting': return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse">Restarting</Badge>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot size={24} className="text-cyan-400" />
            Agent Fleet Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor and manage the autonomous AI sub-agents in the orchestration pipeline.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-lg">
            <Activity size={14} className="text-emerald-400" /> System Healthy
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/[0.08] rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium mb-1">Total Agents</div>
          <div className="text-2xl font-bold text-slate-100">12</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.08] rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium mb-1">Active Now</div>
          <div className="text-2xl font-bold text-emerald-400">8</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.08] rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium mb-1">Compute Load</div>
          <div className="text-2xl font-bold text-amber-400">64%</div>
        </div>
        <div className="bg-slate-900/40 border border-white/[0.08] rounded-xl p-4">
          <div className="text-slate-400 text-xs font-medium mb-1">Token Usage (24h)</div>
          <div className="text-2xl font-bold text-indigo-400">1.2M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-slate-900/40 border border-white/[0.05] animate-pulse" />
          ))
        ) : (
          agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className="flex flex-col gap-3 p-4 rounded-xl border border-white/[0.07] bg-slate-900/50 hover:bg-slate-800/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.bg} ${agent.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{agent.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{agent.id}</p>
                    </div>
                  </div>
                  {getStatusBadge(agent.status)}
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Task</span>
                    <span className="text-slate-200 truncate max-w-[150px]">{agent.current_task}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-slate-200">{agent.uptime}</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Compute Load</span>
                      <span className={agent.load > 80 ? 'text-rose-400' : 'text-emerald-400'}>{agent.load}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${agent.load > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${agent.load}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleAction(agent.id, 'restart')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
                  >
                    <RefreshCw size={12} /> Restart
                  </button>
                  <button
                    onClick={() => handleAction(agent.id, agent.status === 'idle' ? 'start' : 'stop')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
                  >
                    {agent.status === 'idle' ? <Play size={12} className="text-emerald-400" /> : <Square size={12} className="text-rose-400" />}
                    {agent.status === 'idle' ? 'Start' : 'Stop'}
                  </button>
                  <button
                    onClick={() => handleAction(agent.id, 'logs')}
                    className="flex-none p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                    title="View Logs"
                  >
                    <Terminal size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
