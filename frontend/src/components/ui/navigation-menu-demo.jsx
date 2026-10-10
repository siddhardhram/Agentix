import React from 'react';
import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Cpu,
  Layers,
  FileCode2,
  ShieldCheck
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './navigation-menu';

const components = [
  {
    title: 'Autonomous Triage',
    href: '#triage',
    description: 'De-duplicates, classifies, and assesses risk of incoming defect tickets.',
  },
  {
    title: 'AST Analysis',
    href: '#ast',
    description: 'Parses codebase call trees to isolate root cause functions.',
  },
  {
    title: 'Coder Agent',
    href: '#coder',
    description: 'Generates minimal unified git diffs addressing root cause bugs.',
  },
  {
    title: 'Verification Sandbox',
    href: '#verifier',
    description: 'Runs isolated unit tests, lint checks, security, and regression suites.',
  },
];

export function NavigationMenuDemo({ onNavigate }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Agent Workflows</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-80 flex flex-col gap-2">
              <li className="p-2 rounded hover:bg-slate-800 cursor-pointer">
                <div className="font-semibold text-xs text-slate-100">Self-Healing Pipeline</div>
                <div className="text-[11px] text-slate-400">Autonomous 6-stage patch resolution workflow.</div>
              </li>
              <li className="p-2 rounded hover:bg-slate-800 cursor-pointer">
                <div className="font-semibold text-xs text-slate-100">Human Governance</div>
                <div className="text-[11px] text-slate-400">Risk-gated developer reviews and approvals.</div>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className="hidden md:flex">
          <NavigationMenuTrigger>Agent Fleet</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[420px] grid-cols-2 gap-2 p-2">
              {components.map((component) => (
                <li key={component.title} className="p-2 rounded-md hover:bg-slate-800 cursor-pointer transition-colors">
                  <div className="text-xs font-semibold text-slate-200">{component.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{component.description}</div>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Agent Status</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[180px] gap-1 p-1">
              <li className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-amber-400">
                <CircleAlert size={14} />
                <span>Investigating</span>
              </li>
              <li className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-cyan-400">
                <CircleDashed size={14} />
                <span>Patching</span>
              </li>
              <li className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800 text-xs text-emerald-400">
                <CircleCheck size={14} />
                <span>Verified</span>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
