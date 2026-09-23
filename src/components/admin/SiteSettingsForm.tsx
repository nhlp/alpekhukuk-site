"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";

import { updateSiteSettingsAction, type SettingsFormState } from "@/actions/settings";
import { FormRow, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { SiteSettings } from "@/generated/prisma/client";

const initialState: SettingsFormState = {};

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <FormRow
        label="Ana Sayfa Alt Başlığı"
        htmlFor="heroSubtitle"
        error={state.errors?.heroSubtitle}
        hint="Ana sayfadaki büyük başlık artık sabit tasarımlıdır; bu metin başlığın altında görünür."
      >
        <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={settings.heroSubtitle} />
      </FormRow>
      <FormRow
        label="Hakkımızda Metni (opsiyonel)"
        htmlFor="aboutText"
        error={state.errors?.aboutText}
        hint="Boş bırakılırsa varsayılan tanıtım metni gösterilir."
      >
        <Textarea id="aboutText" name="aboutText" defaultValue={settings.aboutText} className="min-h-32" />
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Telefon" htmlFor="phone" error={state.errors?.phone}>
          <Input id="phone" name="phone" defaultValue={settings.phone} required />
        </FormRow>
        <FormRow label="E-posta" htmlFor="email" error={state.errors?.email}>
          <Input id="email" name="email" type="email" defaultValue={settings.email} required />
        </FormRow>
      </div>

      <FormRow label="Adres" htmlFor="address" error={state.errors?.address}>
        <Textarea id="address" name="address" defaultValue={settings.address} required />
      </FormRow>

      <FormRow label="Çalışma Saatleri" htmlFor="workingHours" error={state.errors?.workingHours}>
        <Input id="workingHours" name="workingHours" defaultValue={settings.workingHours} required />
      </FormRow>

      <FormRow
        label="Google Haritalar Gömme Bağlantısı (opsiyonel)"
        htmlFor="mapEmbedUrl"
        error={state.errors?.mapEmbedUrl}
        hint="Google Maps &gt; Paylaş &gt; Harita Katıştır adımından alınan src bağlantısını yapıştırın."
      >
        <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={settings.mapEmbedUrl ?? ""} />
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow
          label="Instagram (opsiyonel)"
          htmlFor="instagramUrl"
          error={state.errors?.instagramUrl}
        >
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
        </FormRow>
        <FormRow label="LinkedIn (opsiyonel)" htmlFor="linkedinUrl" error={state.errors?.linkedinUrl}>
          <Input id="linkedinUrl" name="linkedinUrl" defaultValue={settings.linkedinUrl ?? ""} />
        </FormRow>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Ayarları Kaydet
        </Button>
        {state.success && (
          <span className="flex items-center gap-1.5 text-sm text-green-700">
            <Check className="h-4 w-4" />
            Kaydedildi
          </span>
        )}
      </div>
    </form>
  );
}
