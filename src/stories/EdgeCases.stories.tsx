import type { Meta, StoryObj } from '@storybook/react';
import { useAnchor } from '../react';
import type { Placement } from '../core';

// Corner positioned demo - to test auto-flip
interface CornerDemoProps {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  placement?: Placement;
}

function CornerDemo({
  corner = 'bottom-right',
  placement = 'bottom',
}: Readonly<CornerDemoProps>) {
  const { refCallbacks, floatingStyles, isOpen, actualPlacement } = useAnchor({
    placement,
    trigger: 'click',
    autoFlip: true,
  });

  const cornerStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <button
        ref={refCallbacks.anchor}
        style={{
          position: 'absolute',
          ...cornerStyles[corner],
          padding: '12px 24px',
          cursor: 'pointer',
        }}
      >
        Click Me ({corner})
      </button>

      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          style={{
            ...floatingStyles,
            backgroundColor: '#333',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div>Requested: {placement}</div>
          <div>Actual: {actualPlacement}</div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof CornerDemo> = {
  title: 'Layercraft/Edge Cases',
  component: CornerDemo,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    corner: {
      control: 'select',
      options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    },
    placement: {
      control: 'select',
      options: [
        'top', 'top-start', 'top-end',
        'bottom', 'bottom-start', 'bottom-end',
        'left', 'left-start', 'left-end',
        'right', 'right-start', 'right-end',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CornerDemo>;

// Test flip at bottom-right corner
export const BottomRightCorner: Story = {
  args: {
    corner: 'bottom-right',
    placement: 'bottom',
  },
};

// Test flip at top-left corner
export const TopLeftCorner: Story = {
  args: {
    corner: 'top-left',
    placement: 'top',
  },
};

// Test flip at top-right corner
export const TopRightCorner: Story = {
  args: {
    corner: 'top-right',
    placement: 'right',
  },
};

// Test flip at bottom-left corner
export const BottomLeftCorner: Story = {
  args: {
    corner: 'bottom-left',
    placement: 'left',
  },
};