import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, Autoplay } from 'swiper/modules';
import { ImagePlaceholder } from './ImagePlaceholder';
import { resolveGalleryPlaceholderTextVisibility } from './galleryCompactLayout';

import './styles/ThumbsGallery.less';

interface ImageData {
  id?: string | number;
  title: string;
  description: string;
  url: string;
}

interface ThumbsGalleryProps {
  images?: ImageData[];
  cardGap?: number;
  displayCount?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  carouselInterval?: number;
  model: any;
}

export const ThumbsGallery: React.FC<ThumbsGalleryProps> = ({
  images = [],
  cardGap = 12,
  displayCount = 5,
  imageFit = 'cover',
  carouselInterval = 3000,
  model,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const showPlaceholderText = resolveGalleryPlaceholderTextVisibility({
    containerWidth,
    containerHeight,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observerTarget = element.parentElement ?? element;
    let frameId = 0;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const nextHeight = Math.round(rect.height);
      const nextWidth = Math.round(rect.width);

      setContainerHeight((previous) => (previous === nextHeight ? previous : nextHeight));
      setContainerWidth((previous) => (previous === nextWidth ? previous : nextWidth));
    };

    const scheduleUpdateSize = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateSize);
    };

    const observer = new ResizeObserver(() => {
      scheduleUpdateSize();
    });
    observer.observe(observerTarget);
    scheduleUpdateSize();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const handleImageClick = (image: ImageData) => {
    const collection = model.collection;
    if (!collection) return;

    const filterByTk = collection.getFilterByTK(image);
    model.dispatchEvent('itemClick', {
      event,
      filterByTk,
    });
  };

  return (
    <>
      <div ref={containerRef} className="ThumbsGallery">
        <Swiper
          className="ThumbsGallery__main"
          loop={true}
          spaceBetween={cardGap}
          navigation={true}
          thumbs={{ swiper: thumbsSwiper }}
          key={`swiper-${carouselInterval}`}
          autoplay={carouselInterval > 0 ? { delay: carouselInterval, disableOnInteraction: false } : false}
          modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        >
          {images.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="ThumbsGallery__card" onClick={() => handleImageClick(item)} style={{ cursor: 'pointer' }}>
                {item?.url ? (
                  <img
                    src={item?.url}
                    alt={item?.title}
                    className="ThumbsGallery__image"
                    style={{ objectFit: imageFit } as React.CSSProperties}
                  />
                ) : (
                  <ImagePlaceholder text={showPlaceholderText ? '暂无图片' : ''}></ImagePlaceholder>
                )}

                <div className="ThumbsGallery__overlay">
                  <h3 className="ThumbsGallery__title">{item?.title}</h3>
                  <p className="ThumbsGallery__desc" style={{ textIndent: '1em' }}>
                    {item?.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <Swiper
          className="ThumbsGallery__thumbs"
          onSwiper={setThumbsSwiper}
          loop={true}
          spaceBetween={cardGap}
          slidesPerView={displayCount}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
        >
          {images.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="ThumbsGallery__thumbItem">
                {item?.url ? (
                  <>
                    <img
                      src={item?.url}
                      alt={item?.title}
                      className="ThumbsGallery__thumbImg"
                      style={{ objectFit: imageFit } as React.CSSProperties}
                    />
                    <div className="ThumbsGallery__thumbMask" />
                  </>
                ) : (
                  <ImagePlaceholder text={showPlaceholderText ? '暂无图片' : ''}></ImagePlaceholder>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};
