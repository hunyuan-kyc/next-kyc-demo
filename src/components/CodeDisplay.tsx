'use client'

import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import Clipboard from 'clipboard';

interface CodeDisplayProps {
  code: string;
  language: string;
}

export const CodeDisplay = ({ code, language }: CodeDisplayProps) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initialize highlight.js
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }

    // Initialize clipboard.js
    if (buttonRef.current) {
      const clipboard = new Clipboard(buttonRef.current);
      
      clipboard.on('success', () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });

      return () => {
        clipboard.destroy();
      };
    }
  }, [code]);

  return (
    <div style={{ position: 'relative', marginBottom: '20px' }}>
      <div style={{ 
        position: 'relative', 
        border: '1px solid #333', 
        borderRadius: '6px',
        overflow: 'hidden',
        maxHeight: '500px',
        overflowY: 'auto',
        backgroundColor: '#1e1e1e'
      }}>
        <pre style={{ 
          margin: 0, 
          padding: '15px', 
          fontSize: '14px', 
          lineHeight: '1.5', 
          textAlign: 'left',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4'
        }}>
          <code 
            ref={codeRef} 
            className={`language-${language}`} 
            style={{ 
              textAlign: 'left', 
              whiteSpace: 'pre',
              backgroundColor: '#1e1e1e',
              color: 'inherit' 
            }}
          >
            {code.trim()}
          </code>
        </pre>
      </div>
      <button
        ref={buttonRef}
        data-clipboard-text={code}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          backgroundColor: copied ? '#4CAF50' : '#333',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'background-color 0.3s'
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}; 