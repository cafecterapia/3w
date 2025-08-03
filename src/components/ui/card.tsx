import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = [
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    paddingClasses[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  const classes = ['pb-4 border-b border-gray-200', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  const classes = ['text-lg font-semibold text-gray-900', className]
    .filter(Boolean)
    .join(' ');

  return <h3 className={classes}>{children}</h3>;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  const classes = ['py-4', className].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  const classes = ['pt-4 border-t border-gray-200', className]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
