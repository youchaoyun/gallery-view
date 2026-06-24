import React from 'react';
import { BlockSceneEnum, CollectionBlockModel, ActionModel, ISchema, FieldModel } from '@nocobase/client';
import {
  MultiRecordResource,
  defineAction,
  observer,
  VariableInput,
  MetaTreeNode,
  createEphemeralContext,
  createCollectionContextMeta,
  useFlowSettingsContext,
} from '@nocobase/flow-engine';
import { Button, InputNumber, Popconfirm, Select } from 'antd';
import { isString } from 'lodash';
import { tExpr, useT } from '../locale';
import { useForm } from '@formily/react';
import { getGalleryCoverFieldInterfaces } from '../coverFieldInterfaces';

// 你可以按实际目录调整
import { GalleryView } from '../GalleryView';

type GalleryModelStructure = {
  subModels: {
    actions: ActionModel[];
  };
};

const DEFAULT_APPEARANCE_PARAMS = {
  layoutMode: 'effectCoverFlow',
  cardGap: 16,
  displayCount: 4,
  imageFit: 'cover',
  carouselInterval: 3000,
};

const DEFAULT_MOCK_DATA = [
  {
    id: 1,
    title: '产品展示 1',
    description: '这是一个产品简介',
    cover: '',
  },
  {
    id: 2,
    title: '产品展示 2',
    description: '这是另一个产品简介',
    cover: '',
  },
];

// 解析 ctx.collection 引用字段
const parseFieldPath = (field: string): string => {
  if (!field) return '';
  const match = field.match(/\{\{\s*ctx\.collection\.([^\s.}]+)/);
  if (match && match[1]) return match[1];
  return field;
};

// 简化的本地辅助：按需获取 ctx.collection 的字段树
async function buildCollectionLeftMetaTreeLocal(ctx: any): Promise<MetaTreeNode[]> {
  const resolve = async (sub: any): Promise<MetaTreeNode[]> => {
    if (Array.isArray(sub)) return sub as MetaTreeNode[];
    if (typeof sub === 'function') return await (sub as () => Promise<MetaTreeNode[]>)();
    return [];
  };

  if (ctx.getPropertyOptions?.('collection')?.meta) {
    const sub = ctx.getPropertyMetaTree?.('{{ ctx.collection }}');
    return await resolve(sub);
  }

  const getCollection = () => (ctx as any)?.collection ?? null;
  const scoped = await createEphemeralContext(ctx, {
    defineProperties: {
      collection: {
        get: getCollection,
        meta: createCollectionContextMeta(getCollection, 'Current collection'),
      },
    },
  });

  const subTree = scoped.getPropertyMetaTree?.('{{ ctx.collection }}');
  return await resolve(subTree);
}

type OperatorMeta = {
  value: string;
  label: string | React.ReactNode;
  noValue?: boolean;
  schema?: ISchema;
  visible?: (meta: MetaTreeNode) => boolean;
};

type FieldInterfaceDef = {
  filterable?: {
    operators?: OperatorMeta[];
    children?: Array<{ name: string; title?: string; schema?: ISchema; operators?: OperatorMeta[] }>;
  };
};

interface FilterGroupProps {
  model?: any;
  value?: any;
  onChange?: (value: any) => void;
  filter?: (field: MetaTreeNode) => boolean;
  fieldNames?: {
    label: string;
    value: string;
  };
}

type CommonFieldGroupProps = FilterGroupProps & {
  allowedInterfaces?: string[];
  useRegisteredCoverFieldInterfaces?: boolean;
};

/**
 * 解析字段选择器实际要使用的接口过滤列表。
 * @param allowedInterfaces 组件显式传入的字段接口白名单。
 * @param useRegisteredCoverFieldInterfaces 是否启用 Cover field 的动态注册接口白名单。
 */
const resolveAllowedInterfaces = (allowedInterfaces?: string[], useRegisteredCoverFieldInterfaces?: boolean) => {
  if (useRegisteredCoverFieldInterfaces) {
    return getGalleryCoverFieldInterfaces();
  }

  return allowedInterfaces;
};

export const RestoreDefaultButton: React.FC = () => {
  const form = useForm();
  const t = useT();
  const handleRestore = () => {
    form.setValues({
      layoutMode: 'effectCoverFlow',
      cardGap: 16,
      displayCount: 4,
      imageFit: 'cover',
      carouselInterval: 3000,
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <Popconfirm
        title={t('Restore appearance defaults?')}
        onConfirm={handleRestore}
        okText={t('Confirm')}
        cancelText={t('Cancel')}
      >
        <Button>{t('Restore default')}</Button>
      </Popconfirm>
    </div>
  );
};

export const CommonFieldGroup: React.FC<CommonFieldGroupProps> = observer(
  (props) => {
    const { value, onChange, allowedInterfaces, useRegisteredCoverFieldInterfaces } = props;
    const flowContext = useFlowSettingsContext<FieldModel>();
    const model = flowContext.model;
    const resolvedAllowedInterfaces = resolveAllowedInterfaces(allowedInterfaces, useRegisteredCoverFieldInterfaces);

    const enhancedMetaTree = React.useMemo(() => {
      return async () => {
        const dm = model.context.app?.dataSourceManager;
        const fiMgr = dm?.collectionFieldInterfaceManager;
        const nodes: MetaTreeNode[] = await buildCollectionLeftMetaTreeLocal(model.context);

        const shouldFilter = Array.isArray(resolvedAllowedInterfaces) && resolvedAllowedInterfaces.length > 0;
        const allowedInterfaceSet = new Set(resolvedAllowedInterfaces || []);

        const enhanceNode = async (node: MetaTreeNode): Promise<MetaTreeNode | null> => {
          if (shouldFilter && (!node.interface || !allowedInterfaceSet.has(node.interface))) {
            return null;
          }

          const fi = node.interface
            ? (fiMgr?.getFieldInterface(node.interface) as FieldInterfaceDef | undefined)
            : undefined;

          const extraChildren: MetaTreeNode[] = [];
          const filterable = fi?.filterable;
          const childrenDefs = filterable?.children as
            | Array<{ name: string; title?: string; schema?: ISchema; operators?: OperatorMeta[] }>
            | undefined;

          if (Array.isArray(childrenDefs) && childrenDefs.length) {
            for (const c of childrenDefs) {
              extraChildren.push({
                name: c.name,
                title: c.title || c.name,
                type: (c.schema?.type as string) || 'string',
                interface: c.schema?.['x-component'] === 'Select' ? 'select' : 'input',
                uiSchema: { ...(c.schema || {}), 'x-filter-operators': c.operators },
                paths: [...(node.paths || []), c.name],
                parentTitles: [...(node.parentTitles || []), node.title],
              });
            }
          }

          if (typeof node.children === 'function') {
            const original = node.children;
            return {
              ...node,
              children: async () => {
                const base = await original();
                const merged = [...(Array.isArray(base) ? base : []), ...extraChildren];
                return [...new Map(merged.map((i) => [i.name, i])).values()];
              },
            } as MetaTreeNode;
          }

          const merged = [...(Array.isArray(node.children) ? (node.children as MetaTreeNode[]) : []), ...extraChildren];
          return { ...node, children: merged.length ? merged : node.children } as MetaTreeNode;
        };

        const out: MetaTreeNode[] = [];
        for (const n of nodes) {
          const enhanced = await enhanceNode(n);
          if (enhanced) out.push(enhanced);
        }
        return out;
      };
    }, [model, resolvedAllowedInterfaces]);

    return (
      <VariableInput
        value={value}
        onChange={onChange}
        metaTree={enhancedMetaTree}
        showValueComponent={false}
        style={{ flex: '1 1 40%', minWidth: 160, maxWidth: '100%' }}
        onlyLeafSelectable={true}
      />
    );
  },
  { displayName: 'CommonFieldGroup' },
);

export const galleryLayoutMode = defineAction({
  name: 'galleryLayoutMode',
  title: tExpr('Layout'),
  uiMode: {
    type: 'select',
    key: 'layoutMode',
    props: {
      options: [
        { value: 'effectCoverFlow', label: tExpr('Effect cover flow') },
        { value: 'Thumbs', label: tExpr('Thumbs') },
        { value: 'vertical', label: tExpr('Vertical') },
      ],
    },
  },
  defaultParams: {
    layoutMode: 'effectCoverFlow',
  },
  handler(ctx, params) {
    const blockModel = ctx.blockModel as CollectionBlockModel;
    if (!blockModel) return;
    blockModel.setProps({ layoutMode: params.layoutMode });
  },
});

export class GalleryViewModel extends CollectionBlockModel<GalleryModelStructure> {
  static scene = BlockSceneEnum.many;

  _defaultCustomModelClasses = {
    CollectionActionGroupModel: 'CollectionActionGroupModel',
  };

  get resource() {
    return super.resource as MultiRecordResource;
  }

  createResource(ctx: any, params: any) {
    const resource = this.context.createResource(MultiRecordResource);

    const fieldMapping = ctx?.blockModel?.stepParams?.GallerySettings?.fieldMapping || {};
    const collection = ctx?.collection?.options?.fields || [];

    if (Object.keys(fieldMapping).length > 0) {
      for (const key in fieldMapping) {
        if (!Object.hasOwn(fieldMapping, key)) continue;

        if (fieldMapping[key] && isString(fieldMapping[key]) && fieldMapping[key].includes('ctx.collection')) {
          const element = parseFieldPath(fieldMapping[key]);
          const matched = collection.find((field: any) => field.name === element);
          if (matched && matched.type.includes('belongs')) {
            resource.addAppends(element);
          }
        }
      }
    }

    // 没有数据源时，使用默认假数据，方便配置态预览
    if (!this.props.collection) {
      resource.setData(DEFAULT_MOCK_DATA);
      resource.setMeta({ count: DEFAULT_MOCK_DATA.length });
    }

    return resource;
  }

  renderComponent() {
    return <GalleryView model={this} />;
  }
}

GalleryViewModel.registerFlow({
  key: 'GallerySettings',
  sort: 500,
  title: tExpr('Gallery settings'),
  steps: {
    fieldMapping: {
      title: tExpr('Field mapping'),
      uiSchema: {
        basicFields: {
          type: 'void',
          'x-component': 'FormLayout',
          'x-component-props': {
            layout: 'vertical',
          },
          properties: {
            fieldGroup: {
              type: 'void',
              'x-component': 'Card',
              'x-component-props': {
                title: tExpr('Basic fields'),
                size: 'small',
              },
              properties: {
                coverField: {
                  type: 'string',
                  title: tExpr('Cover field'),
                  'x-component': CommonFieldGroup,
                  'x-component-props': {
                    useRegisteredCoverFieldInterfaces: true,
                  },
                  'x-decorator': 'FormItem',
                },
                titleField: {
                  type: 'string',
                  title: tExpr('Title field'),
                  'x-component': CommonFieldGroup,
                  'x-decorator': 'FormItem',
                },
                descriptionField: {
                  type: 'string',
                  title: tExpr('Description field'),
                  'x-component': CommonFieldGroup,
                  'x-decorator': 'FormItem',
                },
              },
            },
          },
        },
      },
      defaultParams: {
        coverField: 'cover',
        titleField: 'title',
        descriptionField: 'description',
      },
    },

    appearance: {
      title: tExpr('Appearance'),
      uiSchema: {
        styleSettings: {
          type: 'void',
          'x-component': 'FormLayout',
          'x-component-props': {
            layout: 'vertical',
          },
          properties: {
            restoreDefault: {
              type: 'void',
              'x-component': RestoreDefaultButton,
            },
            layoutMode: {
              type: 'string',
              title: tExpr('Layout mode'),
              'x-component': Select,
              'x-decorator': 'FormItem',
              'x-component-props': {
                options: [
                  { value: 'effectCoverFlow', label: tExpr('Effect cover flow') },
                  { value: 'Thumbs', label: tExpr('Thumbs') },
                  { value: 'vertical', label: tExpr('Vertical') },
                ],
              },
            },
            cardGap: {
              type: 'number',
              title: tExpr('Card gap'),
              'x-component': InputNumber,
              'x-decorator': 'FormItem',
              'x-component-props': {
                min: 0,
                max: 64,
                addonAfter: 'px',
              },
              default: 16,
            },
            displayCount: {
              type: 'number',
              title: tExpr('Display count'),
              description: tExpr(
                'When the block is too narrow or too short, the gallery will prioritize image presentation and may not strictly follow this value.',
              ),
              'x-component': InputNumber,
              'x-decorator': 'FormItem',
              'x-component-props': {
                min: 1,
                max: 12,
              },
              default: 4,
            },
            imageFit: {
              type: 'string',
              title: tExpr('Image fit'),
              'x-component': Select,
              'x-decorator': 'FormItem',
              'x-component-props': {
                options: [
                  { value: 'cover', label: tExpr('cover') },
                  { value: 'contain', label: tExpr('contain') },
                  { value: 'fill', label: tExpr('fill') },
                  { value: 'none', label: tExpr('none') },
                ],
              },
            },
            carouselInterval: {
              type: 'number',
              title: tExpr('Carousel interval'),
              description: tExpr('0 means no autoplay'),
              'x-component': InputNumber,
              'x-decorator': 'FormItem',
              'x-component-props': {
                min: 0,
                addonAfter: 'ms',
              },
              default: 3000,
            },
          },
        },
      },
      defaultParams: DEFAULT_APPEARANCE_PARAMS,
    },

    dataScope: {
      use: 'dataScope',
      title: tExpr('Data scope'),
    },

    defaultSorting: {
      use: 'sortingRule',
      title: tExpr('Default sorting'),
    },
  },
});

GalleryViewModel.define({
  label: tExpr('Gallery view'),
  searchable: true,
  searchPlaceholder: tExpr('Search'),
  createModelOptions: {
    use: 'GalleryViewModel',
  },
  sort: 600,
});

// 注册画廊视图点击事件
GalleryViewModel.registerEvents({
  itemClick: {
    title: tExpr('Item click'),
    name: 'itemClick',
    async handler() {
      // 事件由 popupSettings flow 处理
    },
  },
});

// 注册点击条目时打开弹窗的流程（使用 openView action）
GalleryViewModel.registerFlow({
  key: 'popupSettings',
  title: tExpr('Popup settings'),
  on: 'itemClick',
  sort: 300,
  steps: {
    openView: {
      use: 'openView',
    },
  },
  defaultParams: (ctx) => {
    const collectionName = ctx.collection?.name;
    const dataSourceKey = ctx.collection?.dataSourceKey;
    return {
      openView: {
        collectionName,
        dataSourceKey,
        // 禁用路由导航，直接打开弹窗。
        // 因为 popupSettings flow 绑定了 on: 'itemClick' 事件，
        // 路由二次进入时无法重新触发该事件来打开弹窗。
        navigation: false,
      },
    };
  },
});
