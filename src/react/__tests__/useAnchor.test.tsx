import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnchor } from '../useAnchor';

// Mock getBoundingClientRect for consistent positioning
beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    x: 100,
    y: 100,
    width: 100,
    height: 40,
    top: 100,
    left: 100,
    right: 200,
    bottom: 140,
    toJSON: () => {},
  }));
});

// Test component for click trigger
function ClickPopover({
  closeOnEscape = true,
  closeOnOutsideClick = true,
}) {
  const { isOpen, floatingStyles, refCallbacks, isReady } = useAnchor({
    trigger: 'click',
    placement: 'bottom',
    closeOnEscape,
    closeOnOutsideClick,
  });

  return (
    <div data-testid="container">
      <button ref={refCallbacks.anchor} data-testid="anchor">
        Toggle
      </button>
      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          data-testid="floating"
          style={floatingStyles}
          data-ready={isReady}
        >
          Popover Content
        </div>
      )}
    </div>
  );
}

// Test component for hover trigger
function HoverPopover() {
  const { isOpen, floatingStyles, refCallbacks } = useAnchor({
    trigger: 'hover',
    placement: 'top',
  });

  return (
    <div>
      <button ref={refCallbacks.anchor} data-testid="anchor">
        Hover me
      </button>
      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          data-testid="floating"
          style={floatingStyles}
        >
          Tooltip
        </div>
      )}
    </div>
  );
}

// Test component for isReady behavior
function ReadyStatePopover() {
  const { isOpen, floatingStyles, refCallbacks, isReady } = useAnchor({
    trigger: 'click',
    placement: 'bottom',
  });

  return (
    <div>
      <button ref={refCallbacks.anchor} data-testid="anchor">
        Toggle
      </button>
      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          data-testid="floating"
          style={{
            ...floatingStyles,
            visibility: isReady ? 'visible' : 'hidden',
          }}
          data-ready={String(isReady)}
        >
          Content
        </div>
      )}
    </div>
  );
}

describe('useAnchor - Behavior Tests', () => {
  describe('click trigger', () => {
    it('opens popover when anchor is clicked', async () => {
      const user = userEvent.setup();
      render(<ClickPopover />);

      expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

      await user.click(screen.getByTestId('anchor'));

      expect(screen.getByTestId('floating')).toBeInTheDocument();
    });

    it('closes popover when anchor is clicked again', async () => {
      const user = userEvent.setup();
      render(<ClickPopover />);

      const anchor = screen.getByTestId('anchor');

      await user.click(anchor);
      expect(screen.getByTestId('floating')).toBeInTheDocument();

      await user.click(anchor);
      expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
    });
  });

  describe('hover trigger', () => {
    it('opens popover on mouse enter', async () => {
      const user = userEvent.setup();
      render(<HoverPopover />);

      expect(screen.queryByTestId('floating')).not.toBeInTheDocument();

      await user.hover(screen.getByTestId('anchor'));

      await waitFor(() => {
        expect(screen.getByTestId('floating')).toBeInTheDocument();
      });
    });

    it('closes popover on mouse leave', async () => {
      const user = userEvent.setup();
      render(<HoverPopover />);

      const anchor = screen.getByTestId('anchor');

      await user.hover(anchor);
      await waitFor(() => {
        expect(screen.getByTestId('floating')).toBeInTheDocument();
      });

      await user.unhover(anchor);
      await waitFor(() => {
        expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
      });
    });
  });

  describe('escape key closes popover', () => {
    it('closes popover when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<ClickPopover closeOnEscape={true} />);

      await user.click(screen.getByTestId('anchor'));
      expect(screen.getByTestId('floating')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
    });

    it('does not close when closeOnEscape is false', async () => {
      const user = userEvent.setup();
      render(<ClickPopover closeOnEscape={false} />);

      await user.click(screen.getByTestId('anchor'));
      expect(screen.getByTestId('floating')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.getByTestId('floating')).toBeInTheDocument();
    });
  });

  describe('outside click closes popover', () => {
    it('closes popover when clicking outside', async () => {
      const user = userEvent.setup();
      render(<ClickPopover closeOnOutsideClick={true} />);

      await user.click(screen.getByTestId('anchor'));
      expect(screen.getByTestId('floating')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.queryByTestId('floating')).not.toBeInTheDocument();
    });

    it('does not close when closeOnOutsideClick is false', async () => {
      const user = userEvent.setup();
      render(<ClickPopover closeOnOutsideClick={false} />);

      await user.click(screen.getByTestId('anchor'));
      expect(screen.getByTestId('floating')).toBeInTheDocument();

      await user.click(document.body);

      expect(screen.getByTestId('floating')).toBeInTheDocument();
    });
  });

  describe('isReady prevents flicker', () => {
    it('isReady becomes true after position is calculated', async () => {
      const user = userEvent.setup();
      render(<ReadyStatePopover />);

      await user.click(screen.getByTestId('anchor'));

      await waitFor(() => {
        const floating = screen.getByTestId('floating');
        expect(floating.dataset.ready).toBe('true');
      });
    });
  });

  describe('positioning styles', () => {
    it('applies position fixed to floating element', async () => {
      const user = userEvent.setup();
      render(<ClickPopover />);

      await user.click(screen.getByTestId('anchor'));

      const floating = screen.getByTestId('floating');
      expect(floating.style.position).toBe('fixed');
    });

    it('applies top and left styles', async () => {
      const user = userEvent.setup();
      render(<ClickPopover />);

      await user.click(screen.getByTestId('anchor'));

      const floating = screen.getByTestId('floating');
      expect(floating.style.top).toBeDefined();
      expect(floating.style.left).toBeDefined();
    });
  });
});