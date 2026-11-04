'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useDeleteDocumentMutation } from '@/entities/document';
import { useRouter } from '@/i18n/navigation';
import { getApiErrorMessage } from '@/shared/api';
import { ApiRequestError } from '@/shared/api/errors/api-request-error';
import { useModal } from '@/shared/modal/use-modal';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';

function DocumentDeletionModalContent({
  documentId,
  title,
  redirectTo,
  onClose,
}: {
  documentId: string;
  title: string;
  redirectTo?: string;
  onClose: () => void;
}) {
  const t = useTranslations('documents');
  const router = useRouter();
  const deleteMutation = useDeleteDocumentMutation();
  const isPending = deleteMutation.isPending;

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(documentId);
      toast.success(t('deleteSuccess'));
      onClose();

      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error: unknown) {
      const message =
        error instanceof ApiRequestError
          ? getApiErrorMessage(error.status, { error: error.message })
          : t('deleteFailed');
      toast.error(message);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="text-muted-foreground space-y-4 text-sm">
            <p>{t('deleteConfirmDescription')}</p>
            <p className="text-foreground font-medium">{title}</p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPending}>
          {t('deleteCancel')}
        </AlertDialogCancel>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          aria-busy={isPending}
          onClick={() => {
            void handleConfirm();
          }}
        >
          {isPending ? t('deleteDeleting') : t('deleteConfirm')}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function DocumentDeletionModal() {
  const { isOpen, payload, close } = useModal('document-deletion');

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      {isOpen && payload ? (
        <DocumentDeletionModalContent
          documentId={payload.documentId}
          title={payload.title}
          redirectTo={payload.redirectTo}
          onClose={close}
        />
      ) : null}
    </AlertDialog>
  );
}
