import { useAnchor } from '../react';
import type { Placement } from '../core';
import { useState } from 'react';

const PLACEMENTS: Placement[] = [
  'top', 'top-start', 'top-end',
  'bottom', 'bottom-start', 'bottom-end',
  'left', 'left-start', 'left-end',
  'right', 'right-start', 'right-end',
];

export function Demo() {
  const [placement, setPlacement] = useState<Placement>('bottom');
  const [trigger, setTrigger] = useState<'click' | 'hover'>('click');

  const { refCallbacks, floatingStyles, isOpen, actualPlacement } = useAnchor({
    placement,
    trigger,
    closeOnOutsideClick: true,
    hoverDelay: 150,
});

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Layercraft Demo</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <label>
          Placement:{' '}
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as Placement)}
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label>
          Trigger:{' '}
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as 'click' | 'hover')}
          >
            <option value="click">Click</option>
            <option value="hover">Hover</option>
          </select>
        </label>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        border: '1px dashed #ccc',
      }}>
        <button
          ref={refCallbacks.anchor}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          {trigger === 'click' ? 'Click' : 'Hover'} Me
        </button>
      </div>

      {isOpen && (
        <div
          // eslint-disable-next-line react-hooks/refs
          ref={refCallbacks.floating}
          style={{
            ...floatingStyles,
            backgroundColor: '#333',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
          }}
        >
        <p>Floating content ({actualPlacement})</p>
          <button onClick={() => alert('Clicked inside!')}>
            Action Button
          </button>
        </div>
      )}
    </div>
  );
}