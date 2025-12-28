import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode; //  Content to render inside the portal
  container?: HTMLElement | null; // Target container element - defaults to document.body
}

/**
 * Portal Component
 * 
 * Renders children to a DOM node outside the parent hierarchy.
 * Useful for tooltips, modals, and dropdowns to avoid z-index and overflow issues.
 * 
 * @param props - Portal props
 * @param props.children - Content to render
 * @param props.container - Target container (defaults to document.body)
 * @returns React portal or null if not mounted
 */
export function Portal({ children, container }: Readonly<PortalProps>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or before mount
  if (!mounted) {
    return null;
  }

   // SSR safety check
  if (typeof document === 'undefined') {
    return null;
  }

  const targetContainer = container ?? document.body;

  return createPortal(children, targetContainer);
}