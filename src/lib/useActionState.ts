'use client';

import { useState, useTransition } from 'react';

export function useActionState<ActionState>(
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>,
  initialState: ActionState
): [ActionState, (formData: FormData) => Promise<void>, boolean] {
  const [state, setState] = useState<ActionState>(initialState);
  const [isPending, startTransition] = useTransition();

  async function formAction(formData: FormData) {
    startTransition(async () => {
      const newState = await action(state, formData);
      setState(newState);
    });
  }

  return [state, formAction, isPending];
}
