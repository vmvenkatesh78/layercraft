/**
 * useAnchor Hook
 * 
 * A React hook for positioning floating elements relative to anchor elements.
 * Handles positioning, triggers (click/hover), and outside click detection.
 */

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { getPositionWithFlip, clampToViewport, getViewport, getPosition, getArrowPosition } from '../core';
import type { Placement, ArrowPosition } from '../core';

export interface UseAnchorOptions {
    placement?: Placement; // Where to place the floating element
    offset?: number; // Gap between anchor and floating element in pixels
    trigger?: 'click' | 'hover'; //  How to trigger the floating element
    closeOnOutsideClick?: boolean; //  Close when clicking outside
    hoverDelay?: number; // Delay before closing on hover (ms) - allows user to reach floating element
    autoFlip?: boolean; // Enable auto-flip when out of bounds (default: true)
    closeOnEscape?: boolean; // Close when pressing Escape key (default: true)
    fallbackPlacements?: Placement[]; // Additional placements to try if initial placement overflows viewport
    arrow?: { size: number } | boolean;  // Arrow configuration (true = default 8px)
    zIndex?: number; // z-index for floating element (default: 9999)
}

export interface UseAnchorReturn {
    refCallbacks: { // Refs to attach to anchor, floating and arrow elements
        anchor: (node: HTMLElement | null) => void;
        floating: (node: HTMLElement | null) => void
        arrow: (node: HTMLElement | null) => void;
    };
    arrowStyles: React.CSSProperties; // Styles to apply to arrow element
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
        closeOnEscape = true,
        fallbackPlacements = [],
        arrow = false,
        zIndex = 9999,
    } = options;

    // State
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [actualPlacement, setActualPlacement] = useState<Placement>(placement);
    const [isReady, setIsReady] = useState(false);
    const [arrowPosition, setArrowPosition] = useState<ArrowPosition | null>(null);

    // Store elements in refs
    const anchorRef = useRef<HTMLElement | null>(null);
    const floatingRef = useRef<HTMLElement | null>(null);
    const arrowRef = useRef<HTMLElement | null>(null);


    const fallbackPlacementsKey = JSON.stringify(fallbackPlacements);

    const getArrowSize = (): number => {
        if (typeof arrow === 'boolean') {
            return arrow ? 8 : 0;
        }
        return arrow?.size ?? 0;
    };

    const arrowSize = getArrowSize();

    const getArrowRotation = (placement: Placement): string => {
        const side = placement.split('-')[0];
        switch (side) {
            case 'top': return 'rotate(0deg)';
            case 'bottom': return 'rotate(180deg)';
            case 'left': return 'rotate(-90deg)';
            case 'right': return 'rotate(90deg)';
            default: return 'rotate(0deg)';
        }
    };

    // Memoized position update function
 
    const updatePosition = useCallback(() => {
        if (!anchorRef.current || !floatingRef.current) return;

        const anchorRect = anchorRef.current.getBoundingClientRect();
        const floatingRect = floatingRef.current.getBoundingClientRect();
        const viewport = getViewport();

        const rawPosition = autoFlip
            ? getPositionWithFlip(
                anchorRect,
                floatingRect,
                { placement, offset, fallbackPlacements },
                viewport
            )
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

        // Calculate arrow position if enabled
        if (arrowSize > 0) {
            const arrowPos = getArrowPosition(
                rawPosition.placement,
                anchorRect,
                floatingRef.current.getBoundingClientRect(),
                arrowSize
            );
            setArrowPosition(arrowPos);
        }

        setIsReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placement, offset, autoFlip, fallbackPlacementsKey, arrowSize]);

    // Callback refs
    const setAnchorRef = useCallback((node: HTMLElement | null) => {
        anchorRef.current = node;
    }, []);

    const setFloatingRef = useCallback((node: HTMLElement | null) => {
        floatingRef.current = node;
        // When floating element mounts (including via Portal), recalculate position
        if (node && isOpen) {
            requestAnimationFrame(updatePosition);
        }
    }, [isOpen, updatePosition]);

    const setArrowRef = useCallback((node: HTMLElement | null) => {
        arrowRef.current = node;
    }, []);

    // Handle Escape key to close
    useEffect(() => {
        if (!closeOnEscape || !isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setIsOpen(false);
            }
        };

        // Use capture phase to catch event early
        window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [closeOnEscape, isOpen]);


    // Reset ready when closed
    useEffect(() => {
        if (!isOpen) { 
            setIsReady(false);
        }
    }, [isOpen]);

    // Initial position calculation (sync, before paint)
    useLayoutEffect(() => {
        if (!isOpen) return; 
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
            arrow: setArrowRef,
        },
        floatingStyles: {
            position: 'fixed',
            top: position.top,
            left: position.left,
            visibility: isReady ? 'visible' : 'hidden',
            zIndex,
        },
        arrowStyles: arrowPosition ? {
            position: 'absolute' as const,
            left: arrowPosition.left,
            top: arrowPosition.top,
            [arrowPosition.staticSide]: -arrowSize,
            transform: getArrowRotation(actualPlacement),
        } : {
            visibility: 'hidden' as const,
        },
        isOpen,
        setIsOpen,
        actualPlacement,
        isReady,
    };
}