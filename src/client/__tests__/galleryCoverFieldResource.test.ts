import { describe, expect, it, vi } from 'vitest';
import { syncGalleryCoverFieldResource } from '../galleryCoverFieldResource';

describe('syncGalleryCoverFieldResource', () => {
  it('refreshes resource when cover field maps to a new association append', async () => {
    const addAppends = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);

    await syncGalleryCoverFieldResource({
      coverField: '{{ ctx.collection.cover }}',
      collectionFields: [{ name: 'cover', type: 'belongsTo' }],
      resource: {
        getAppends: () => [],
        addAppends,
        refresh,
      },
    });

    expect(addAppends).toHaveBeenCalledWith('cover');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('does not refresh when cover field append already exists', async () => {
    const addAppends = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);

    await syncGalleryCoverFieldResource({
      coverField: '{{ ctx.collection.cover }}',
      collectionFields: [{ name: 'cover', type: 'belongsTo' }],
      resource: {
        getAppends: () => ['cover'],
        addAppends,
        refresh,
      },
    });

    expect(addAppends).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
