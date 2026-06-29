import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Twin from '@/components/twin';

export default function Home() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to conversation
      </a>

      <header className="site-header">
        <a className="brand" href="#main-content" aria-label="Jeremy Demers digital twin home">
          <span className="brand-avatar" aria-hidden="true">
            <Image src="/profile_round_sm.png" alt="" width={96} height={96} priority />
          </span>
          <span className="brand-copy">
            <strong>Jeremy Demers</strong>
            <span>Digital twin</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="availability">
            <span aria-hidden="true" />
            Ready to chat
          </span>
          <a
            className="linkedin-link"
            href="https://www.linkedin.com/in/jeremy-demers/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect with Jeremy Demers on LinkedIn"
          >
            <span className="linkedin-mark" aria-hidden="true">
              in
            </span>
            <span className="linkedin-label">LinkedIn</span>
            <ArrowUpRight className="external-icon" aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="main-content" className="chat-main" tabIndex={-1}>
        <h1 className="sr-only">Chat with Jeremy Demers&apos; digital twin</h1>
        <Twin />
      </main>
    </div>
  );
}
