const DEFAULT_GALLERY_COVER_FIELD_INTERFACES = ['attachment'];
const GALLERY_COVER_FIELD_INTERFACES_KEY = '__YOUCHAO_GALLERY_COVER_FIELD_INTERFACES__';

type GalleryCoverFieldInterfaceStore = {
  interfaces: Set<string>;
};

type GalleryCoverFieldGlobal = typeof globalThis & {
  [GALLERY_COVER_FIELD_INTERFACES_KEY]?: GalleryCoverFieldInterfaceStore;
};

/**
 * 获取画廊封面字段接口注册表。
 * @param initialInterfaces 首次初始化时需要写入的默认接口名称列表。
 */
function getGalleryCoverFieldInterfaceStore(
  initialInterfaces: string[] = DEFAULT_GALLERY_COVER_FIELD_INTERFACES,
): GalleryCoverFieldInterfaceStore {
  const registryTarget = globalThis as GalleryCoverFieldGlobal;

  if (!registryTarget[GALLERY_COVER_FIELD_INTERFACES_KEY]) {
    registryTarget[GALLERY_COVER_FIELD_INTERFACES_KEY] = {
      interfaces: new Set(initialInterfaces.filter(Boolean)),
    };
  }

  return registryTarget[GALLERY_COVER_FIELD_INTERFACES_KEY] as GalleryCoverFieldInterfaceStore;
}

/**
 * 注册可用于画廊 Cover field 的字段接口。
 * @param interfaceNames 需要追加注册的字段接口名称列表。
 */
export function registerGalleryCoverFieldInterfaces(interfaceNames: string[] = []) {
  const store = getGalleryCoverFieldInterfaceStore();

  interfaceNames.filter(Boolean).forEach((interfaceName) => {
    store.interfaces.add(interfaceName);
  });
}

/**
 * 获取当前已注册的画廊 Cover field 字段接口列表。
 */
export function getGalleryCoverFieldInterfaces() {
  return Array.from(getGalleryCoverFieldInterfaceStore().interfaces);
}

/**
 * 重置画廊 Cover field 字段接口注册表，仅用于测试场景。
 */
export function resetGalleryCoverFieldInterfacesForTest() {
  const registryTarget = globalThis as GalleryCoverFieldGlobal;

  registryTarget[GALLERY_COVER_FIELD_INTERFACES_KEY] = {
    interfaces: new Set(DEFAULT_GALLERY_COVER_FIELD_INTERFACES),
  };
}
