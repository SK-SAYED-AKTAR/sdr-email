"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InlineSavedField } from "@/components/inline-saved-field";
import type { SellerKnowledgeProfile } from "@/lib/seller-knowledge";

type Field = "company_name" | "company_website" | "product_website" | "additional_notes";

function fieldValues(profile: SellerKnowledgeProfile) {
  return {
    company_name: profile.company_name ?? "",
    company_website: profile.company_website ?? "",
    product_website: profile.product_website ?? "",
    additional_notes: profile.additional_notes ?? "",
  };
}

export function CompanyInfoCard({
  profile,
  disabled,
  onSaved,
}: {
  profile: SellerKnowledgeProfile;
  disabled?: boolean;
  onSaved: () => void;
}) {
  const [values, setValues] = useState(fieldValues(profile));
  const [savedField, setSavedField] = useState<Field | null>(null);

  useEffect(() => {
    setValues(fieldValues(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.id]);

  async function handleBlur(field: Field, originalValue: string | null) {
    const value = values[field];
    if (value === (originalValue ?? "")) return;

    await apiFetch("/api/seller-knowledge", { method: "PATCH", body: JSON.stringify({ [field]: value }) });
    setSavedField(field);
    onSaved();
    setTimeout(() => setSavedField((f) => (f === field ? null : f)), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>The basics the AI uses to understand who you are.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <InlineSavedField label="Company Name" saved={savedField === "company_name"}>
            <Input
              value={values.company_name}
              disabled={disabled}
              onChange={(e) => setValues((v) => ({ ...v, company_name: e.target.value }))}
              onBlur={() => handleBlur("company_name", profile.company_name)}
              placeholder="Acme Inc."
            />
          </InlineSavedField>
          <InlineSavedField label="Company Website" saved={savedField === "company_website"}>
            <Input
              type="url"
              value={values.company_website}
              disabled={disabled}
              onChange={(e) => setValues((v) => ({ ...v, company_website: e.target.value }))}
              onBlur={() => handleBlur("company_website", profile.company_website)}
              placeholder="https://acme.com"
            />
          </InlineSavedField>
        </div>
        <InlineSavedField label="Product Website" hint="Optional" saved={savedField === "product_website"}>
          <Input
            type="url"
            value={values.product_website}
            disabled={disabled}
            onChange={(e) => setValues((v) => ({ ...v, product_website: e.target.value }))}
            onBlur={() => handleBlur("product_website", profile.product_website)}
            placeholder="https://acme.com/product"
          />
        </InlineSavedField>
        <InlineSavedField label="Additional Notes" saved={savedField === "additional_notes"}>
          <Textarea
            rows={5}
            value={values.additional_notes}
            disabled={disabled}
            onChange={(e) => setValues((v) => ({ ...v, additional_notes: e.target.value }))}
            onBlur={() => handleBlur("additional_notes", profile.additional_notes)}
            placeholder="Tell the AI anything that isn't available on your website. Describe your ideal customers, positioning, pricing, competitors, or important selling points."
          />
        </InlineSavedField>
      </CardContent>
    </Card>
  );
}
