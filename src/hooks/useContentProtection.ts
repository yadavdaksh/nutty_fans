'use client';

import { useEffect } from 'react';

export const useContentProtection = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Drag & Drop (for images)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 3. Disable Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uses Meta (Command), Windows/Linux use Ctrl
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Block: Save (Cmd+S), Print (Cmd+P), Copy (Cmd+C) - strict mode
      if (isCmdOrCtrl && ['s', 'p', 'c', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Block: Screenshot shortcuts (Mac: Cmd+Shift+3/4/5, Windows: PrtSc is harder to block via JS but we try)
      if (isCmdOrCtrl && isShift && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
      }
      
      // Block PrintScreen key (standard on Windows/Linux)
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        
        // Temporarily hide body content? (Optional strict measure)
         const body = document.querySelector('body');
         if (body) {
           body.style.visibility = 'hidden';
           setTimeout(() => {
             body.style.visibility = 'visible';
           }, 1000);
           alert("Screenshots are disabled on this platform.");
         }
        e.preventDefault();
      }
    };

    // 4. Disable Text Selection (except on inputs)
    // Handled via CSS usually, but JS backup:
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in inputs and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [enabled]);
};
