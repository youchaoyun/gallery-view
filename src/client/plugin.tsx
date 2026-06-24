import { Plugin } from '@nocobase/client';
import models from './models';
import { registerGalleryCoverFieldInterfaces } from './coverFieldInterfaces';

export class PluginGalleryViewClient extends Plugin {
  /**
   * 追加注册画廊封面字段接口。
   * @param interfaceNames 需要注册到画廊视图的字段接口名称列表。
   */
  registerGalleryCoverFieldInterfaces(interfaceNames: string[] = []) {
    registerGalleryCoverFieldInterfaces(interfaceNames);
  }

  async load() {
    this.flowEngine.registerModels(models);
  }
}

export default PluginGalleryViewClient;
