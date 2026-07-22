"use client";

import { useState } from "react";
import { Download, UploadCloud } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ContentContainer } from "@/components/dashboard/content-container";
import { Button } from "@/components/ui/button";
import { UploadCsvDialog } from "@/components/dashboard/send-email/upload-csv-dialog";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function SendEmailPage() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <ContentContainer>
      <PageHeader
        title="Send Email"
        subtitle="Email sending functionality will be available soon."
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={`${BACKEND_URL}/api/csv/sample`} download />}
            >
              <Download className="size-4" />
              Download Sample CSV
            </Button>
            <Button onClick={() => setUploadOpen(true)}>
              <UploadCloud className="size-4" />
              Upload CSV
            </Button>
          </>
        }
      />

      <UploadCsvDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </ContentContainer>
  );
}
