"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { Loader2, Plus, KeyRound, UserX, UserCheck } from "lucide-react";

import {
  createUserAction,
  toggleUserActiveAction,
  resetUserPasswordAction,
  type UserFormState,
} from "@/actions/users";
import { FormRow, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { User } from "@/generated/prisma/client";

const initialState: UserFormState = {};

function UserRow({ user, isSelf }: { user: User; isSelf: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream px-4 py-3">
      <div>
        <p className="text-sm font-medium text-navy">
          {user.title} {user.name}
          {!user.active && (
            <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              Pasif
            </span>
          )}
        </p>
        <p className="text-xs text-foreground/50">
          {user.email} · {user.role === "ADMIN" ? "Yönetici" : "Avukat"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-navy hover:bg-white"
          onClick={() => {
            const password = window.prompt(`${user.name} için yeni şifre girin (en az 8 karakter):`);
            if (password) {
              startTransition(() => resetUserPasswordAction(user.id, password));
            }
          }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Şifre Sıfırla
        </button>
        {!isSelf && (
          <button
            type="button"
            disabled={isPending}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-white",
              user.active ? "border-red-200 text-red-600" : "border-green-200 text-green-700",
            )}
            onClick={() => startTransition(() => toggleUserActiveAction(user.id, !user.active))}
          >
            {user.active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
            {user.active ? "Pasifleştir" : "Aktifleştir"}
          </button>
        )}
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-navy/40" />}
      </div>
    </div>
  );
}

export function UsersManager({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [showCreate, setShowCreate] = useState(false);
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserRow key={user.id} user={user} isSelf={user.id === currentUserId} />
      ))}

      {showCreate ? (
        <div className="rounded-xl border border-dashed border-navy/30 bg-white p-4">
          <form action={formAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="Ad Soyad" htmlFor="new-name" error={state.errors?.name}>
                <Input id="new-name" name="name" required />
              </FormRow>
              <FormRow label="Unvan" htmlFor="new-title" error={state.errors?.title}>
                <Input id="new-title" name="title" defaultValue="Av." required />
              </FormRow>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormRow label="E-posta" htmlFor="new-email" error={state.errors?.email}>
                <Input id="new-email" name="email" type="email" required />
              </FormRow>
              <FormRow label="Geçici Şifre" htmlFor="new-password" error={state.errors?.password}>
                <Input id="new-password" name="password" type="text" minLength={8} required />
              </FormRow>
            </div>
            <FormRow label="Rol" htmlFor="new-role">
              <Select id="new-role" name="role" defaultValue="LAWYER">
                <option value="LAWYER">Avukat</option>
                <option value="ADMIN">Yönetici</option>
              </Select>
            </FormRow>
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={pending}>
                {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Hesap Oluştur
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
                Vazgeç
              </Button>
              {state.submitError && <span className="text-xs text-red-600">{state.submitError}</span>}
            </div>
          </form>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" />
          Yeni Ekip Üyesi Ekle
        </Button>
      )}
    </div>
  );
}
