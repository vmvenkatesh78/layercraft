import type { Meta, StoryObj } from '@storybook/react';
import { useAnchor } from '../react';
import type { Placement } from '../core';

// Wrapper component for stories
interface AnchorDemoProps {
  placement?: Placement;
  trigger?: 'click' | 'hover';
  offset?: number;
  autoFlip?: boolean;
}

function AnchorDemo({ 
  placement = 'bottom',
  trigger = 'click',
  offset = 8,
  autoFlip = true,
}: Readonly<AnchorDemoProps>) {
  const { refCallbacks, floatingStyles, isOpen, actualPlacement } = useAnchor({
    placement,
    trigger,
    offset,
    autoFlip,
    closeOnOutsideClick: true,
    hoverDelay: 150,
  });

  return (
    <div style={{ padding: '100px', display: 'flex', justifyContent: 'center' }}>
      <button
        ref={refCallbacks.anchor}
        style={{
          padding: '12px 24px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        {trigger === 'click' ? 'Click' : 'Hover'} Me
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
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div>Placement: {actualPlacement}</div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof AnchorDemo> = {
  title: 'Layercraft/useAnchor',
  component: AnchorDemo,
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
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    offset: {
      control: { type: 'range', min: 0, max: 32, step: 4 },
    },
    autoFlip: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnchorDemo>;

// Default story
export const Default: Story = {
  args: {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    autoFlip: true,
  },
};

// Click trigger
export const ClickTrigger: Story = {
  args: {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    autoFlip: true,
  },
};

// Hover trigger
export const HoverTrigger: Story = {
  args: {
    placement: 'bottom',
    trigger: 'hover',
    offset: 8,
    autoFlip: true,
  },
};

// All placements demo
export const TopPlacement: Story = {
  args: {
    placement: 'top',
    trigger: 'click',
    offset: 8,
  },
};

export const LeftPlacement: Story = {
  args: {
    placement: 'left',
    trigger: 'click',
    offset: 8,
  },
};

export const RightPlacement: Story = {
  args: {
    placement: 'right',
    trigger: 'click',
    offset: 8,
  },
};

// Auto-flip disabled
export const NoAutoFlip: Story = {
  args: {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    autoFlip: false,
  },
};