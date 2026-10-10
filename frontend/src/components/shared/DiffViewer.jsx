import React, { useState } from 'react';
import { FileCode2, Copy, Check, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function DiffViewer({
  diff = {},
  allowActions = false,
  onApprove,
  onReject
}) {
  const [copied, setCopied] = useState(false);

  const file = diff.file || 'demo_repos/sample_calc/calc.py';
  const summary = diff.summary || '+3 lines / -1 line';
  const verifiedAgainst = diff.verifiedAgainst || 'test_calc.py (Pytest: 5/5 assertions passed)';
  const lines = diff.lines || [
    { type: 'header', content: `--- a/${file}` },
    { type: 'header', content: `+++ b/${file}` },
    { type: 'context', oldNum: 12, newNum: 12, content: ' def divide(a, b):' },
    { type: 'context', oldNum: 13, newNum: 13, content: '     """Divide a by b with safe zero handling."""' },
    { type: 'del', oldNum: 14, newNum: '', content: '-    return a / b' },
    { type: 'add', oldNum: '', newNum: 14, content: '+    if b == 0:' },
    { type: 'add', oldNum: '', newNum: 15, content: '+        raise ZeroDivisionError("Cannot divide by zero")' },
    { type: 'add', oldNum: '', newNum: 16, content: '+    return a / b' },
  ];

  const handleCopy = () => {
    const raw = lines.map((l) => l.content).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="diff-viewer-wrapper">
      <div className="diff-header-bar">
        <div className="diff-header-meta">
          <FileCode2 size={16} className="text-cyan" />
          <span className="diff-file-path">{file}</span>
          <span className="diff-summary-badge">{summary}</span>
        </div>

        <div className="diff-header-actions">
          {verifiedAgainst && (
            <div className="diff-verified-tag">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>{verifiedAgainst}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Patch'}</span>
          </Button>
        </div>
      </div>

      <div className="diff-table-container">
        <table className="diff-table">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={`diff-row diff-${line.type}`}>
                <td className="diff-num old-num">{line.oldNum || ''}</td>
                <td className="diff-num new-num">{line.newNum || ''}</td>
                <td className="diff-content">
                  <code>{line.content}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {allowActions && (
        <div className="diff-action-footer">
          <div className="diff-footer-info">
            <span>Verify changes carefully before merging into working tree.</span>
          </div>
          <div className="diff-footer-buttons">
            <Button variant="destructive" size="sm" onClick={onReject}>
              Reject Patch
            </Button>
            <Button variant="success" size="sm" onClick={onApprove}>
              Approve & Merge Fix
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CodeViewer({ code = '', language = 'python', filename = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-viewer-wrapper">
      {filename && (
        <div className="code-viewer-header">
          <span className="code-filename">{filename}</span>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      )}
      <pre className="code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
