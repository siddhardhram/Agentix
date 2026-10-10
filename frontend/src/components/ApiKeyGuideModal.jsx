import React, { useState } from 'react';
import { Key, Sparkles, Terminal, Copy, Check, ExternalLink, X, ShieldAlert, Cpu } from 'lucide-react';

export default function ApiKeyGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('gemini');
  const [copiedText, setCopiedText] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container api-guide-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon-badge">
              <Key size={20} className="text-cyan" />
            </div>
            <div>
              <h2 className="modal-title">API Keys & LLM Setup Guide</h2>
              <p className="modal-subtitle">Configure real AI models or run with zero-config built-in simulation</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="provider-tabs">
          <button 
            className={`provider-tab ${activeTab === 'gemini' ? 'active' : ''}`}
            onClick={() => setActiveTab('gemini')}
          >
            <Sparkles size={16} />
            <span>Google Gemini (Recommended)</span>
            <span className="pill-badge pill-free">Free Tier</span>
          </button>
          <button 
            className={`provider-tab ${activeTab === 'openai' ? 'active' : ''}`}
            onClick={() => setActiveTab('openai')}
          >
            <Cpu size={16} />
            <span>OpenAI (GPT-4o)</span>
          </button>
          <button 
            className={`provider-tab ${activeTab === 'ollama' ? 'active' : ''}`}
            onClick={() => setActiveTab('ollama')}
          >
            <Terminal size={16} />
            <span>Local Ollama (Offline)</span>
          </button>
          <button 
            className={`provider-tab ${activeTab === 'mock' ? 'active' : ''}`}
            onClick={() => setActiveTab('mock')}
          >
            <ShieldAlert size={16} />
            <span>Mock Simulator</span>
            <span className="pill-badge pill-ready">Zero Key</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body api-guide-body">
          {activeTab === 'gemini' && (
            <div className="guide-content">
              <div className="guide-intro">
                <strong>Google Gemini 1.5 Pro / Flash</strong> provides rapid inference and a generous free tier for developer debugging.
              </div>

              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <p>Go to Google AI Studio at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="external-link">aistudio.google.com <ExternalLink size={12} /></a> and sign in with your Google account.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <p>Click the blue <strong>"Get API key"</strong> button in the left sidebar, then click <strong>"Create API key"</strong>.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">3</span>
                  <div className="step-content">
                    <p>Copy your API key and paste it into your root <code>.env</code> file:</p>
                    <div className="code-snippet-box">
                      <code>
                        LLM_PROVIDER=gemini<br/>
                        GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
                      </code>
                      <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopy("LLM_PROVIDER=gemini\nGEMINI_API_KEY=your_key_here", "gemini_env")}
                      >
                        {copiedText === "gemini_env" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedText === "gemini_env" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">4</span>
                  <div className="step-content">
                    <p>Restart the FastAPI backend in terminal: <code>python main.py</code></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'openai' && (
            <div className="guide-content">
              <div className="guide-intro">
                <strong>OpenAI GPT-4o / GPT-4 Turbo</strong> offers high-accuracy code synthesis and structured AST understanding.
              </div>

              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <p>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="external-link">platform.openai.com/api-keys <ExternalLink size={12} /></a> and log in.</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <p>Click <strong>"Create new secret key"</strong>, name it <code>agentix-dev</code>, and copy the key (starts with <code>sk-</code>).</p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">3</span>
                  <div className="step-content">
                    <p>Add the following into your <code>.env</code> file:</p>
                    <div className="code-snippet-box">
                      <code>
                        LLM_PROVIDER=openai<br/>
                        OPENAI_API_KEY=sk-proj-YourOpenAiKeyHere
                      </code>
                      <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopy("LLM_PROVIDER=openai\nOPENAI_API_KEY=your_key_here", "openai_env")}
                      >
                        {copiedText === "openai_env" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedText === "openai_env" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ollama' && (
            <div className="guide-content">
              <div className="guide-intro">
                <strong>Local Ollama (Offline Mode)</strong> runs open-source models completely locally on your machine with 0 API costs.
              </div>

              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <p>Install Ollama from <a href="https://ollama.ai" target="_blank" rel="noreferrer" className="external-link">ollama.ai <ExternalLink size={12} /></a></p>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <p>Run your preferred model in terminal:</p>
                    <div className="code-snippet-box">
                      <code>ollama run llama3</code>
                      <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopy("ollama run llama3", "ollama_cmd")}
                      >
                        {copiedText === "ollama_cmd" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedText === "ollama_cmd" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="guide-step">
                  <span className="step-num">3</span>
                  <div className="step-content">
                    <p>In your <code>.env</code> set <code>LLM_PROVIDER=ollama</code> and <code>OLLAMA_MODEL=llama3</code>.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mock' && (
            <div className="guide-content">
              <div className="guide-intro">
                <strong>Built-in Mock Simulator</strong> provides instant, deterministic responses for all 5 stages without requiring any external internet connection or API keys.
              </div>

              <div className="guide-steps">
                <div className="guide-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <p>In your <code>.env</code> file, simply set:</p>
                    <div className="code-snippet-box">
                      <code>LLM_PROVIDER=mock</code>
                      <button 
                        className="copy-snippet-btn"
                        onClick={() => handleCopy("LLM_PROVIDER=mock", "mock_env")}
                      >
                        {copiedText === "mock_env" ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                        <span>{copiedText === "mock_env" ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <p>Agentix will automatically simulate realistic AST indexing, risk scoring, patch creation, and sandboxed test execution!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
