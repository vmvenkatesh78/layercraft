/**
 * useAnchor Hook
 * 
 * A React hook for positioning floating elements relative to anchor elements.
 * Handles positioning, triggers (click/hover), and outside click detection.
 */

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { getPositionWithFlip, clampToViewport, getViewport, getPosition } from '../core';
import type { Placement } from '../core';

export interface UseAnchorOptions {
    placement?: Placement; // Where to place the floating element
    offset?: number; // Gap between anchor and floating element in pixels
    trigger?: 'click' | 'hover'; //  How to trigger the floating element
    closeOnOutsideClick?: boolean; //  Close when clicking outside
    hoverDelay?: number; // Delay before closing on hover (ms) - allows user to reach floating element
    autoFlip?: boolean; // Enable auto-flip when out of bounds (default: true)
}

export interface UseAnchorReturn {
    refCallbacks: { // Refs to attach to anchor and floating elements
        anchor: (node: HTMLElement | null) => void;
        floating: (node: HTMLElement | null) => void
    };
    floatingStyles: React.CSSProperties; // Styles to apply to floating element
    isOpen: boolean; // Whether floating element is visible
    setIsOpen: (open: boolean) => void; // Manually control visibility
    actualPlacement: Placement; // The actual placement used (may differ from requested if flipped)
    isReady: boolean; // Whether position has been calculated and element is ready to display
}

/** 
 * Hook for positioning floating elements relative to anchor elements.
 * 
 * @param options - Configuration options
 * @returns Refs, styles, and state for managing the floating element
 */
export function useAnchor(options: UseAnchorOptions = {}): UseAnchorReturn {
    const {
        placement = 'bottom',
        offset = 8,
        trigger = 'click',
        closeOnOutsideClick = true,
        hoverDelay = 100,
        autoFlip = true,
    } = options;

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [actualPlacement, setActualPlacement] = useState<Placement>(placement);
    const [isReady, setIsReady] = useState(false);

    // Store elements in refs
    const anchorRef = useRef<HTMLElement | null>(null);
    const floatingRef = useRef<HTMLElement | null>(null);

    // Callback refs
    const setAnchorRef = useCallback((node: HTMLElement | null) => {
        anchorRef.current = node;
    }, []);

    const setFloatingRef = useCallback((node: HTMLElement | null) => {
        floatingRef.current = node;
    }, []);
    
    // Memoized position update function
    const updatePosition = useCallback(() => {
        if (!anchorRef.current || !floatingRef.current) return;

        const anchorRect = anchorRef.current.getBoundingClientRect();
        const floatingRect = floatingRef.current.getBoundingClientRect();

        const viewport = getViewport();

        const rawPosition = autoFlip
            ? getPositionWithFlip(anchorRect, floatingRect, { placement, offset }, viewport)
            : getPosition(anchorRect, floatingRect, { placement, offset });

        setActualPlacement(rawPosition.placement);

        const clampedPosition = clampToViewport(
            rawPosition.top,
            rawPosition.left,
            floatingRect.width,
            floatingRect.height,
            viewport
        );

        setPosition(clampedPosition);
        setIsReady(true);
    }, [placement, offset, autoFlip]);


    // Reset ready when closed
    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsReady(false);
        }
    }, [isOpen]);

    // Initial position calculation (sync, before paint)
    useLayoutEffect(() => {
        if (!isOpen) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updatePosition();
    }, [isOpen, updatePosition]);

    // ResizeObserver for floating element size changes
    useEffect(() => {
        if (!isOpen || !floatingRef.current) return;

        let frameId: number | null = null;

        const resizeObserver = new ResizeObserver(() => {
            // Debounce with RAF to avoid multiple rapid updates
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updatePosition);
        });

        resizeObserver.observe(floatingRef.current);

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };
    }, [isOpen, updatePosition]);

    // Scroll and resize listeners
    useEffect(() => {
        if (!isOpen) return;

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    // Click trigger logic
    useEffect(() => {
        if (trigger !== 'click' || !anchorRef.current) return;

        const anchor = anchorRef.current;

        const handleClick = () => {
            setIsOpen((prev) => !prev);
        };

        anchor.addEventListener('click', handleClick);

        return () => {
            anchor.removeEventListener('click', handleClick);
        };
    }, [trigger]);

    // Hover trigger logic
    useEffect(() => {
        if (trigger !== 'hover' || !anchorRef.current) return;

        const anchor = anchorRef.current;
        const floating = floatingRef.current;

        let closeTimeout: number | null = null;

        const clearCloseTimeout = () => {
            if (closeTimeout) {
                clearTimeout(closeTimeout);
                closeTimeout = null;
            }
        };

        const handleMouseEnter = () => {
            clearCloseTimeout();
            setIsOpen(true);
        };

        const handleMouseLeave = () => {
            closeTimeout = window.setTimeout(() => {
                setIsOpen(false);
            }, hoverDelay);
        };

        anchor.addEventListener('mouseenter', handleMouseEnter);
        anchor.addEventListener('mouseleave', handleMouseLeave);

        if (floating) {
            floating.addEventListener('mouseenter', handleMouseEnter);
            floating.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            clearCloseTimeout();
            anchor.removeEventListener('mouseenter', handleMouseEnter);
            anchor.removeEventListener('mouseleave', handleMouseLeave);

            if (floating) {
                floating.removeEventListener('mouseenter', handleMouseEnter);
                floating.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [trigger, hoverDelay, isOpen]);

    // Outside click detection
    useEffect(() => {
        if (trigger !== 'click' || !closeOnOutsideClick || !isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;

            const isOutsideAnchor = anchorRef.current && !anchorRef.current.contains(target);
            const isOutsideFloating = floatingRef.current && !floatingRef.current.contains(target);

            if (isOutsideAnchor && isOutsideFloating) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [trigger, closeOnOutsideClick, isOpen]);

    // Return value
    return {
        refCallbacks: {
            anchor: setAnchorRef,
            floating: setFloatingRef,
        },
        floatingStyles: {
            position: 'fixed',
            top: position.top,
            left: position.left,
            visibility: isReady ? 'visible' : 'hidden',  // Hide until ready
        },
        isOpen,
        setIsOpen,
        actualPlacement,
        isReady,
    };
}