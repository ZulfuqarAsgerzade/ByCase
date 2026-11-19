"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { Button, Field, Input, Notice } from "./ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Parol">
        <Input name="password" type="password" autoComplete="current-password" autoFocus required />
      </Field>
      {state?.error && <Notice kind="error">{state.error}</Notice>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Yoxlanılır…" : "Daxil ol"}
      </Button>
    </form>
  );
}
