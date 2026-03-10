import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

// Mock ResizeObserver for jsdom
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App [LLD-12]', () => {
  it('renders the app layout with toolbar and canvas', () => {
    render(<App />)
    expect(screen.getByTestId('toolbar')).toBeTruthy()
    expect(screen.getByTestId('canvas-container')).toBeTruthy()
  })
})
