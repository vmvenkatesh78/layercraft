/* eslint-disable react-hooks/refs */
import type { Meta, StoryObj } from '@storybook/react';
import { useAnchor, Portal } from '../react';
import type { Placement } from '../core';

interface PortalDemoProps {
  placement?: Placement;
  usePortal?: boolean;
}

/**
 * Demonstrates Portal vs non-Portal rendering.
 * Toggle usePortal to see the difference with overflow:hidden containers.
 */
function PortalDemo({
  placement = 'bottom',
  usePortal = true,
}: Readonly<PortalDemoProps>) {
  const { refCallbacks, floatingStyles, isOpen, actualPlacement } = useAnchor({
    placement,
    trigger: 'click',
    autoFlip: true,
  });

  const floatingStyles_final = {
    ...floatingStyles,
    backgroundColor: '#333',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
  };

  return (
    <div style={{ padding: '40px' }}>
      <h3>Overflow Hidden Container</h3>
      <p style={{ marginBottom: '16px', color: '#666' }}>
        Toggle "usePortal" to see how Portal escapes the clipped container.
      </p>

      {/* Container with overflow:hidden - the common problem */}
      <div
        style={{
          border: '2px dashed #ccc',
          padding: '40px',
          overflow: 'hidden',
          position: 'relative',
          height: '150px',
        }}
      >
        <div style={{ color: '#999', marginBottom: '16px' }}>
          overflow: hidden container
        </div>

        <button
          ref={refCallbacks.anchor}
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
          }}
        >
          Click Me
        </button>

        {/* Without Portal - inside overflow container, will clip */}
        {isOpen && !usePortal && (
          <div ref={refCallbacks.floating} style={floatingStyles_final}>
            <div>Placement: {actualPlacement}</div>
            <div>Using Portal: No</div>
          </div>
        )}
      </div>

      {/* With Portal - outside overflow container, won't clip */}
      {isOpen && usePortal && (
        <Portal>
          <div ref={refCallbacks.floating} style={floatingStyles_final}>
            <div>Placement: {actualPlacement}</div>
            <div>Using Portal: Yes</div>
          </div>
        </Portal>
      )}
    </div>
  );
}

const meta: Meta<typeof PortalDemo> = {
  title: 'Layercraft/Portal',
  component: PortalDemo,
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
    usePortal: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PortalDemo>;

export const WithPortal: Story = {
  args: {
    placement: 'bottom',
    usePortal: true,
  },
};

export const WithoutPortal: Story = {
  args: {
    placement: 'bottom',
    usePortal: false,
  },
};