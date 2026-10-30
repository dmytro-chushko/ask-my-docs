export const documentsQueryKey = ['documents'] as const;

export function documentQueryKey(id: string) {
  return ['documents', id] as const;
}
