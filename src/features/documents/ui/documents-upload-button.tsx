'use client';

import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { useUploadDocumentMutation } from '@/entities/document';
import { getApiErrorMessage } from '@/shared/api';
import { ApiRequestError } from '@/shared/api/errors/api-request-error';
import { DOCUMENT_MAX_BYTES } from '@/shared/storage/storage.constants';
import { Button } from '@/shared/ui/button';

export function DocumentsUploadButton() {
  const t = useTranslations('documents');
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocumentMutation();
  const [isReading, setIsReading] = useState(false);

  const busy = uploadMutation.isPending || isReading;

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    if (
      file.type !== 'application/pdf' &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      toast.error(t('upload.invalidType'));

      return;
    }

    if (file.size > DOCUMENT_MAX_BYTES) {
      toast.error(t('upload.tooLarge'));

      return;
    }

    setIsReading(true);

    try {
      await uploadMutation.mutateAsync(file);
      toast.success(t('upload.success'));
    } catch (error: unknown) {
      const message =
        error instanceof ApiRequestError
          ? getApiErrorMessage(error.status, { error: error.message })
          : t('upload.failed');
      toast.error(message);
    } finally {
      setIsReading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          void handleFileChange(event.target.files);
        }}
      />
      <Button
        type="button"
        disabled={busy}
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        <Upload className="size-4" aria-hidden="true" />
        {busy ? t('upload.uploading') : t('upload.button')}
      </Button>
    </>
  );
}
