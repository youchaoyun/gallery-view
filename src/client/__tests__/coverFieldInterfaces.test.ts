import { describe, expect, it } from 'vitest';
import {
  getGalleryCoverFieldInterfaces,
  registerGalleryCoverFieldInterfaces,
  resetGalleryCoverFieldInterfacesForTest,
} from '../coverFieldInterfaces';
import { PluginGalleryViewClient } from '../plugin';

describe('coverFieldInterfaces', () => {
  it('returns attachment by default', () => {
    resetGalleryCoverFieldInterfacesForTest();

    expect(getGalleryCoverFieldInterfaces()).toEqual(['attachment']);
  });

  it('allows external plugins to register cover field interfaces', () => {
    resetGalleryCoverFieldInterfacesForTest();

    registerGalleryCoverFieldInterfaces(['multipleEntryModesAttachment']);

    expect(getGalleryCoverFieldInterfaces()).toEqual(['attachment', 'multipleEntryModesAttachment']);
  });

  it('deduplicates repeated interface registrations', () => {
    resetGalleryCoverFieldInterfacesForTest();

    registerGalleryCoverFieldInterfaces(['attachment', 'multipleEntryModesAttachment']);
    registerGalleryCoverFieldInterfaces(['multipleEntryModesAttachment']);

    expect(getGalleryCoverFieldInterfaces()).toEqual(['attachment', 'multipleEntryModesAttachment']);
  });

  it('exposes gallery interface registration on the plugin instance', () => {
    resetGalleryCoverFieldInterfacesForTest();
    const plugin = new PluginGalleryViewClient(null as any, {} as any);

    plugin.registerGalleryCoverFieldInterfaces(['multipleEntryModesAttachment']);

    expect(getGalleryCoverFieldInterfaces()).toEqual(['attachment', 'multipleEntryModesAttachment']);
  });
});
