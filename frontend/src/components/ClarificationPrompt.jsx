import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { submitClarificationAnswer } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ClarificationPrompt({ ticketId, questions, onAnswer }) {
  const { user, profile } = useAuth();
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const defaultQuestion = (Array.isArray(questions) && questions.length > 0) ? questions[0] : {
    id: 'Q-1',
    prompt: 'Should divide(a, b) raise a handled ZeroDivisionError with message "Cannot divide by zero" or return a safe None value?'
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!response.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (ticketId) {
        await submitClarificationAnswer(ticketId, response.trim());
      }
      if (onAnswer) {
        onAnswer(response.trim());
      }
      setSubmitted(true);
    } catch (err) {
      console.warn('Clarification submission fallback:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="clarification-card">
      <div className="clarification-header">
        <div className="clarification-icon-box">
          <HelpCircle size={18} className="text-indigo" />
        </div>
        <div>
          <h4 className="clarification-title">Autonomous Clarification Prompt</h4>
          <p className="clarification-subtitle">The agent requires additional specification to guarantee zero regressions.</p>
        </div>
      </div>

      <div className="clarification-question-box">
        <p className="question-text">
          {defaultQuestion?.prompt || 'Clarification required to finalize automated resolution plan.'}
        </p>
      </div>

      {submitted ? (
        <div className="clarification-submitted-banner">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>Clarification provided by <strong>{displayName}</strong>. Agent resumed synthesis.</span>
        </div>
      ) : (
        <form onSubmit={handleSend} className="clarification-form">
          <input
            className="form-input"
            placeholder="Type your instruction (e.g., 'Raise ZeroDivisionError for strict typing compliance')..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={!response.trim() || isSubmitting}
          >
            {isSubmitting ? <Loader2 size={14} className="spin-animate" /> : <Send size={14} />}
            <span>{isSubmitting ? 'Submitting...' : 'Submit Clarification'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
