type GalleryCollectionField = {
  name: string;
  type?: string;
};

type GalleryCoverFieldResource = {
  getAppends?: () => string[];
  addAppends?: (append: string) => void;
  refresh?: () => Promise<void>;
};

type SyncGalleryCoverFieldResourceOptions = {
  coverField?: string;
  collectionFields?: GalleryCollectionField[];
  resource?: GalleryCoverFieldResource;
};

/**
 * 解析字段映射中的 ctx.collection 路径，得到真实字段名。
 * @param field 字段映射配置中的原始值。
 */
const parseFieldPath = (field: string): string => {
  if (!field) return '';
  const match = field.match(/\{\{\s*ctx\.collection\.([^\s.}]+)/);
  if (match && match[1]) return match[1];
  return field;
};

/**
 * 当 Cover field 映射到新的关联字段时，同步资源 appends 并立即刷新数据。
 * @param options 包含封面字段映射、集合字段定义和当前资源实例的配置对象。
 */
export async function syncGalleryCoverFieldResource(options: SyncGalleryCoverFieldResourceOptions) {
  const { coverField, collectionFields = [], resource } = options;

  if (!coverField || !resource?.addAppends || !resource?.refresh) {
    return;
  }

  const fieldName = parseFieldPath(coverField);
  if (!fieldName) {
    return;
  }

  const matchedField = collectionFields.find((field) => field.name === fieldName);
  if (!matchedField?.type?.includes('belongs')) {
    return;
  }

  const currentAppends = resource.getAppends?.() || [];
  if (currentAppends.includes(fieldName)) {
    return;
  }

  resource.addAppends(fieldName);
  await resource.refresh();
}
