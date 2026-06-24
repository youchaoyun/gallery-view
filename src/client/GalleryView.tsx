import React, { useEffect, useMemo } from 'react';
import { observer } from '@nocobase/flow-engine';
import { Card, Empty } from 'antd';
import { GalleryViewModel } from './models/GalleryViewModel';
import { EffectCoverFlowGallery } from './EffectCoverFlowGallery';
import { ThumbsGallery } from './ThumbsGallery';
import { VerticalCarouselGallery } from './VerticalCarouselGallery';
import { syncGalleryCoverFieldResource } from './galleryCoverFieldResource';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

const parseFieldPath = (field: string): string => {
  if (!field) return '';
  const match = field.match(/\{\{\s*ctx\.collection\.([^\s.}]+)/);
  if (match && match[1]) return match[1];
  return field;
};

const getNestedValue = (obj: any, path: string) => {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

export const GalleryView = observer(({ model }: { model: GalleryViewModel }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = model?.resource?.getData?.() || [];
  const collectionFields = model?.context?.collection?.options?.fields;

  const { coverField, titleField, descriptionField } = model?.stepParams?.GallerySettings?.fieldMapping || {};

  const { layoutMode, cardGap, displayCount, imageFit, carouselInterval } =
    model?.stepParams?.GallerySettings?.appearance || {};

  const parsedCoverField = parseFieldPath(coverField);
  const parsedTitleField = parseFieldPath(titleField);
  const parsedDescriptionField = parseFieldPath(descriptionField);

  useEffect(() => {
    void syncGalleryCoverFieldResource({
      coverField,
      collectionFields: collectionFields || [],
      resource: model?.resource,
    });
  }, [collectionFields, coverField, model]);

  const images = useMemo(() => {
    return data.map((record: any) => {
      const title = parsedTitleField ? getNestedValue(record, parsedTitleField) : record?.title;
      const description = parsedDescriptionField ? getNestedValue(record, parsedDescriptionField) : record?.description;

      const coverValue = parsedCoverField ? getNestedValue(record, parsedCoverField) : record?.cover;

      let url = '';
      if (Array.isArray(coverValue)) {
        url = coverValue?.[0]?.url || '';
      } else if (coverValue && typeof coverValue === 'object') {
        url = coverValue?.url || '';
      } else if (typeof coverValue === 'string') {
        url = coverValue;
      }

      return {
        id: record.id,
        title: title || '暂无标题',
        description: description || '暂无简介',
        url,
      };
    });
  }, [data, parsedCoverField, parsedTitleField, parsedDescriptionField]);

  if (!images.length) {
    return <Empty description="暂无数据" />;
  }

  switch (layoutMode) {
    case 'effectCoverFlow':
      return (
        <EffectCoverFlowGallery
          images={images}
          cardGap={cardGap}
          displayCount={displayCount}
          imageFit={imageFit}
          carouselInterval={carouselInterval}
          model={model}
        />
      );

    case 'vertical':
      return (
        <VerticalCarouselGallery
          images={images}
          cardGap={cardGap}
          displayCount={displayCount}
          imageFit={imageFit}
          carouselInterval={carouselInterval}
          model={model}
        />
      );

    case 'Thumbs':
    default:
      return (
        <ThumbsGallery
          images={images}
          cardGap={cardGap}
          displayCount={displayCount}
          imageFit={imageFit}
          carouselInterval={carouselInterval}
          model={model}
        />
      );
  }
});
