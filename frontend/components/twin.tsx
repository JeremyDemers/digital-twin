'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Moon, Network, Send, Sparkles, Sun, User } from 'lucide-react';
import ArchitectureViewer from './architecture-viewer';

const MarkdownMessage = dynamic(() => import('./markdown-message'), {
  loading: () => <p className="markdown-loading">Formatting response…</p>,
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const suggestedPrompts = [
  'What kind of AI work have you done?',
  'Which projects best show your strengths?',
  'How would you describe your working style?',
];

export default function Twin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showArchitecture, setShowArchitecture] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const architectureButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
      setTheme(currentTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    messagesEndRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  const closeArchitecture = () => {
    setShowArchitecture(false);
    window.requestAnimationFrame(() => architectureButtonRef.current?.focus());
  };

  const preloadArchitecture = () => {
    void import('mermaid').catch(() => undefined);
  };

  const sendMessage = async (prompt?: string) => {
    const content = (prompt ?? input).trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);
    void import('./markdown-message');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            session_id: sessionId || undefined,
          }),
        },
      );

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      if (!sessionId) {
        setSessionId(data.session_id);
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'The digital twin is unavailable right now. Please try sending your message again.',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <section className="chat-card" aria-label="Digital twin conversation">
      <div className="chat-tools">
        <button
          ref={architectureButtonRef}
          type="button"
          className="architecture-trigger"
          onClick={() => setShowArchitecture(true)}
          onMouseEnter={preloadArchitecture}
          onFocus={preloadArchitecture}
          aria-haspopup="dialog"
          aria-expanded={showArchitecture}
        >
          <Network aria-hidden="true" />
          <span>Architecture</span>
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </button>
      </div>

      {showArchitecture && <ArchitectureViewer onClose={closeArchitecture} />}

      <div
        className="message-list"
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isLoading}
      >
        {messages.length === 0 && (
          <div className="intro">
            <div className="intro-avatar">
              <Image
                src="/profile_round_sm.png"
                alt="Jeremy Demers"
                width={600}
                height={600}
                priority
              />
              <span className="avatar-spark" aria-hidden="true">
                <Sparkles />
              </span>
            </div>
            <p className="intro-kicker">A conversation with context</p>
            <h2>
              I&apos;m Jeremy&apos;s digital twin.
              <em> Ask me about the work.</em>
            </h2>
            <p className="intro-copy">
              I know Jeremy&apos;s background, projects, approach to AI, and working style. Pick a
              starting point or ask your own question.
            </p>
            <div className="suggestions" aria-label="Suggested questions">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="suggestion-chip"
                  onClick={() => void sendMessage(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <article
            key={message.id}
            className={`message-row message-row-${message.role}${message.isError ? ' is-error' : ''}`}
          >
            <div className={`message-avatar message-avatar-${message.role}`} aria-hidden="true">
              {message.role === 'assistant' ? <Sparkles /> : <User />}
            </div>
            <div className="message-content">
              <div className="message-meta">
                <strong>{message.role === 'assistant' ? "Jeremy's twin" : 'You'}</strong>
                <time dateTime={message.timestamp.toISOString()}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <div className="message-bubble">
                {message.role === 'assistant' ? (
                  <MarkdownMessage content={message.content} />
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
            </div>
          </article>
        ))}

        {isLoading && (
          <div className="message-row message-row-assistant typing-row">
            <div className="message-avatar message-avatar-assistant" aria-hidden="true">
              <Sparkles />
            </div>
            <div className="typing-status">
              <span className="typing-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span>Thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="composer-dock">
        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message">
            Message Jeremy&apos;s digital twin
          </label>
          <textarea
            id="message"
            name="message"
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Jeremy’s experience, projects, or approach…"
            autoComplete="off"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
            aria-label={isLoading ? 'Waiting for response' : 'Send message'}
            title="Send message"
          >
            {isLoading ? (
              <LoaderCircle className="loading-icon" aria-hidden="true" />
            ) : (
              <Send aria-hidden="true" />
            )}
          </button>
        </form>
        <div className="composer-hint" aria-hidden="true">
          <span>
            <kbd>Enter</kbd> to send
          </span>
          <span>
            <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
          </span>
        </div>
      </div>
    </section>
  );
}
