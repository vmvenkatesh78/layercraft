
import type { Meta, StoryObj } from '@storybook/react';
import { useAnchor } from '../react/useAnchor';
import type { Placement } from '../core';

interface FallbackPlacementsDemoProps {
  placement?: Placement;
  fallbackPlacements?: Placement[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}


function FallbackPlacementsDemo({ 
  placement,
  fallbackPlacements,
  position = 'top-left'
}: Readonly<FallbackPlacementsDemoProps>) {
  const { refCallbacks, floatingStyles, isOpen, actualPlacement, isReady } = useAnchor({
    placement,
    fallbackPlacements,
    trigger: 'click',
  });

  // Position the button in different corners to test fallback
  const buttonPositions: Record<string, React.CSSProperties> = {
    'top-left': { position: 'absolute', top: 10, left: 10 },
    'top-right': { position: 'absolute', top: 10, right: 10 },
    'bottom-left': { position: 'absolute', bottom: 10, left: 10 },
    'bottom-right': { position: 'absolute', bottom: 10, right: 10 },
    'center': { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  };

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <button
        ref={refCallbacks.anchor}
        style={{
          ...buttonPositions[position],
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Click me ({position})
      </button>

      {isOpen && (
        <div
        // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          style={{
            ...floatingStyles,
            background: '#333',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            opacity: isReady ? 1 : 0,
          }}
        >
          <div>Requested: {placement}</div>
          <div>Actual: {actualPlacement}</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: 4 }}>
            Fallbacks: {fallbackPlacements?.join(', ') || 'default (opposite)'}
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof FallbackPlacementsDemo> = {
  title: 'Features/Fallback Placements',
  component: FallbackPlacementsDemo,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    position: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FallbackPlacementsDemo>;

// Default flip (opposite side)
export const DefaultFlip: Story = {
  args: {
    placement: 'top',
    position: 'top-left',
  },
};

// Custom fallback order
export const CustomFallbacks: Story = {
  args: {
    placement: 'top',
    fallbackPlacements: ['right', 'bottom', 'left'],
    position: 'top-left',
  },
};

// Corner case - top right corner
export const TopRightCorner: Story = {
  args: {
    placement: 'top',
    fallbackPlacements: ['left', 'bottom', 'right'],
    position: 'top-right',
  },
};

// Bottom corner
export const BottomLeftCorner: Story = {
  args: {
    placement: 'bottom',
    fallbackPlacements: ['right', 'top', 'left'],
    position: 'bottom-left',
  },
};