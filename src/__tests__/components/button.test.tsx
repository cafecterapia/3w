// src/__tests__/components/button.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { Button } from '../../components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="outline">Outline Button</Button>);

    const button = screen.getByRole('button', { name: /outline button/i });
    expect(button).toHaveClass('border-gray-300');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button', { name: /disabled button/i });
    expect(button).toBeDisabled();
  });
});
