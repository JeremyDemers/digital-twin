'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { architectureDiagram } from './architecture-diagram';

interface ArchitectureViewerProps {
  onClose: () => void;
}

export default function ArchitectureViewer({ onClose }: ArchitectureViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const diagramId = useId().replaceAll(':', '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    let active = true;

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        const isLight = document.documentElement.dataset.theme === 'light';

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isLight ? 'neutral' : 'dark',
          flowchart: {
            htmlLabels: true,
            useMaxWidth: false,
          },
        });

        const result = await mermaid.render(`architecture-${diagramId}`, architectureDiagram);
        if (active) setSvg(result.svg);
      } catch (renderError) {
        console.error('Unable to render architecture diagram:', renderError);
        if (active) setError('The architecture diagram could not be rendered. Please try again.');
      }
    };

    void renderDiagram();

    return () => {
      active = false;
    };
  }, [diagramId]);

  const closeDialog = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      className="architecture-dialog"
      aria-labelledby="architecture-title"
      aria-describedby="architecture-description"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <div className="architecture-panel">
        <header className="architecture-header">
          <div>
            <p className="architecture-kicker">System map</p>
            <h2 id="architecture-title">How this digital twin works</h2>
            <p id="architecture-description">
              The AWS services that deliver the site, answer questions, and retain conversation
              context.
            </p>
          </div>
          <button
            type="button"
            className="architecture-close"
            onClick={closeDialog}
            aria-label="Close architecture diagram"
            title="Close architecture diagram"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="architecture-canvas" aria-busy={!svg && !error}>
          {!svg && !error && (
            <div className="architecture-status" role="status">
              <span className="architecture-loader" aria-hidden="true" />
              Rendering architecture…
            </div>
          )}
          {error && (
            <p className="architecture-error" role="alert">
              {error}
            </p>
          )}
          {svg && (
            <div
              className="architecture-svg"
              aria-label="AWS deployment architecture diagram"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>

        <p className="architecture-hint">Scroll horizontally to explore the full system.</p>
      </div>
    </dialog>
  );
}
