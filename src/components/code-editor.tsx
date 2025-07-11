
"use client";

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  highlightTerm?: string;
}

const CodeEditor = React.forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({ value, highlightTerm, className, ...props }, ref) => {
    const backdropRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
      if (backdropRef.current) {
        backdropRef.current.scrollTop = event.currentTarget.scrollTop;
        backdropRef.current.scrollLeft = event.currentTarget.scrollLeft;
      }
    };

    const getHighlightedText = () => {
      if (!highlightTerm || !value) {
        return value;
      }
      const regex = new RegExp(`(${highlightTerm})`, 'gi');
      return (value as string).replace(regex, '<mark>$1</mark>');
    };
    
    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    return (
      <div className="relative w-full h-full">
        <div
          ref={backdropRef}
          className={cn(
            "absolute inset-0 overflow-auto whitespace-pre-wrap break-words p-2",
            "font-code text-sm text-transparent",
            "select-none pointer-events-none"
          )}
        >
          <div dangerouslySetInnerHTML={{ __html: getHighlightedText() + '\n' }} />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onScroll={handleScroll}
          className={cn(
            "relative w-full h-full p-2 block",
            "font-code text-sm text-foreground",
            "bg-transparent resize-none focus:outline-none",
            "border-0 ring-0 focus:ring-0",
            "caret-foreground",
            className
          )}
          {...props}
        />
        <style jsx global>{`
          mark {
            background-color: hsl(var(--accent));
            color: transparent;
            border-radius: 2px;
          }
        `}</style>
      </div>
    );
  }
);
CodeEditor.displayName = 'CodeEditor';

export { CodeEditor };
