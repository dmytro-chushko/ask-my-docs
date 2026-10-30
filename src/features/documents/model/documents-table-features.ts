import { tableFeatures } from '@tanstack/react-table';

/** Client-only list — no server pagination/sorting features required yet. */
export const documentsTableFeatures = tableFeatures({});

export type DocumentsTableFeatures = typeof documentsTableFeatures;
