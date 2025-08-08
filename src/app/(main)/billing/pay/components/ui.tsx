'use client';

import React from 'react';

export function StepDot({
  children,
  active,
  done,
}: {
  children: React.ReactNode;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={[
          'flex h-6 w-6 items-center justify-center rounded-full border',
          active ? 'border-gray-900' : 'border-gray-300',
          done
            ? 'bg-gray-900 text-white'
            : active
              ? 'bg-white text-gray-900'
              : 'bg-white text-gray-400',
        ].join(' ')}
      >
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none">
          {done ? (
            <path
              d="M20 7L9 18l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <circle
              cx="12"
              cy="12"
              r="2"
              stroke="currentColor"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
      <span className="text-xs text-gray-700">{children}</span>
    </div>
  );
}

export function Divider() {
  return <div className="h-px flex-1 bg-gray-200" />;
}

export function StatusBar({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
      <span className="h-2 w-2 animate-pulse rounded-full bg-gray-900" />
      <span className="text-xs font-medium text-gray-900">{text}</span>
    </div>
  );
}

export function PlaceholderPanel({
  title,
  description,
  cta,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border bg-gray-50">
        {icon}
      </div>
      <h3 className="text-base font-medium">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-gray-600">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-secondary hover:opacity-90"
      >
        {cta}
      </button>
    </div>
  );
}

export function MethodButton({
  label,
  desc,
  active,
  onClick,
  icon,
}: {
  label: string;
  desc: string;
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'group flex items-center gap-3 rounded-md border p-3 text-left transition-colors',
        active
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-200 hover:border-gray-900',
      ].join(' ')}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-900">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
      <svg
        className="h-4 w-4 text-gray-900 opacity-0 transition-opacity group-hover:opacity-100"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
