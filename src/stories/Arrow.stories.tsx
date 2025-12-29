import type { Meta, StoryObj } from '@storybook/react';
import { useAnchor } from '../react/useAnchor';
import type { Placement } from '../core';

interface ArrowDemoProps {
  placement?: Placement;
  arrowSize?: number;
  trigger?: 'click' | 'hover';
}

function ArrowDemo({ 
  placement = 'top',
  arrowSize = 8,
  trigger = 'click',
}: Readonly<ArrowDemoProps>) {
  const { refCallbacks, floatingStyles, arrowStyles, isOpen, actualPlacement, isReady } = useAnchor({
    placement,
    arrow: { size: arrowSize },
    trigger,
  });

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <button
        ref={refCallbacks.anchor}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        {trigger === 'click' ? 'Click me' : 'Hover me'}
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
          <div>Placement: {actualPlacement}</div>
          <div>Arrow size: {arrowSize}px</div>
          
          {/* Arrow element */}
          <div
            // eslint-disable-next-line react-hooks/refs
            ref={refCallbacks.arrow}
            style={{
              ...arrowStyles,
              width: 0,
              height: 0,
              borderLeft: `${arrowSize}px solid transparent`,
              borderRight: `${arrowSize}px solid transparent`,
              borderTop: `${arrowSize}px solid #333`,
            }}
          />
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof ArrowDemo> = {
  title: 'Features/Arrow',
  component: ArrowDemo,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
      ],
    },
    arrowSize: {
      control: { type: 'range', min: 4, max: 16, step: 2 },
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ArrowDemo>;

// Default arrow
export const Default: Story = {
  args: {
    placement: 'top',
    arrowSize: 8,
    trigger: 'click',
  },
};

// All placements
export const Bottom: Story = {
  args: {
    placement: 'bottom',
    arrowSize: 8,
  },
};

export const Left: Story = {
  args: {
    placement: 'left',
    arrowSize: 8,
  },
};

export const Right: Story = {
  args: {
    placement: 'right',
    arrowSize: 8,
  },
};

// With alignment
export const TopStart: Story = {
  args: {
    placement: 'top-start',
    arrowSize: 8,
  },
};

export const BottomEnd: Story = {
  args: {
    placement: 'bottom-end',
    arrowSize: 8,
  },
};

// Hover trigger
export const HoverTrigger: Story = {
  args: {
    placement: 'top',
    arrowSize: 8,
    trigger: 'hover',
  },
};

// Large arrow
export const LargeArrow: Story = {
  args: {
    placement: 'bottom',
    arrowSize: 14,
  },
};