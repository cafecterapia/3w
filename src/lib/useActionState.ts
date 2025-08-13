'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

export function useActionState<ActionState>(
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>,
  initialState: ActionState
): [ActionState, (formData: FormData) => Promise<void>, boolean] {
  const [state, setState] = useState<ActionState>(initialState);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // We'll expose our own isPending boolean for reliability.
  const [isPending, setIsPending] = useState(false);
  const [, startTransition] = useTransition();

  async function formAction(formData: FormData) {
    // Track this invocation to avoid late updates racing out of order.
    const callId = Symbol('formAction');
    (formAction as any)._lastCall = callId;

    setIsPending(true);
    try {
      const newState = await action(stateRef.current, formData);
      // Only apply result if it's the latest submission
      if ((formAction as any)._lastCall === callId) {
        startTransition(() => {
          setState(newState);
        });
      }
    } finally {
      if ((formAction as any)._lastCall === callId) {
        setIsPending(false);
      }
    }
  }

  return [state, formAction, isPending];
}
