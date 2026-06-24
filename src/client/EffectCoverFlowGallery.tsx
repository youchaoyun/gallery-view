import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { Typography } from 'antd';
import { ImagePlaceholder } from './ImagePlaceholder';
import { resolveCoverFlowLayout } from './galleryCompactLayout';
import './styles/EffectCoverFlowGallery.less';

interface ImageData {
  id?: string | number;
  title: string;
  description: string;
  url: string;
}

interface EffectCoverFlowGalleryProps {
  images?: ImageData[];
  cardGap?: number;
  displayCount?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  carouselInterval?: number;
  model: any;
}

export const EffectCoverFlowGallery: React.FC<EffectCoverFlowGalleryProps> = ({
  images = [],
  cardGap = 16,
  displayCount = 4,
  imageFit = 'cover',
  carouselInterval = 3000,
  model,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [previousCompact, setPreviousCompact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检测设备类型
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observerTarget = element.parentElement ?? element;
    let frameId = 0;

    const updateHeight = () => {
      const rect = element.getBoundingClientRect();
      const nextHeight = Math.round(rect.height);
      const nextWidth = Math.round(rect.width);

      setContainerHeight((previous) => (previous === nextHeight ? previous : nextHeight));
      setContainerWidth((previous) => (previous === nextWidth ? previous : nextWidth));
    };

    const scheduleUpdateHeight = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateHeight);
    };

    const observer = new ResizeObserver(() => {
      scheduleUpdateHeight();
    });
    observer.observe(observerTarget);
    scheduleUpdateHeight();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const currentItem: any = images[activeIndex] || {};
  const coverFlowLayout = resolveCoverFlowLayout({
    containerHeight,
    containerWidth,
    displayCount,
    cardGap,
    isMobile,
    previousCompact,
  });

  useEffect(() => {
    setPreviousCompact((previous) => (previous === coverFlowLayout.compact ? previous : coverFlowLayout.compact));
  }, [coverFlowLayout.compact]);

  const handleInfoClick = (record: any) => {
    const collection = model.collection;
    if (!collection) return;

    const filterByTk = collection.getFilterByTK(record);
    model.dispatchEvent('itemClick', {
      event,
      filterByTk,
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`EffectCoverFlowGallery${coverFlowLayout.compact ? ' EffectCoverFlowGallery--compact' : ''}`}
      >
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={coverFlowLayout.slidesPerView}
          spaceBetween={coverFlowLayout.cardGap}
          coverflowEffect={{
            rotate: isMobile ? 15 : 20, // 减小旋转角度，更柔和
            stretch: 0,
            depth: isMobile ? 100 : 150, // 增加深度，让层次感更明显
            modifier: 1,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          key={`swiper-${carouselInterval}`}
          autoplay={carouselInterval > 0 ? { delay: carouselInterval, disableOnInteraction: false } : false}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="mySwiper"
          onSwiper={(swiper) => setActiveIndex(swiper.activeIndex)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {images.map((item, index) => (
            <SwiperSlide key={index} className="gallery-slide">
              <div className="slide-card">
                {item?.url ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    style={
                      {
                        width: '100%',
                        height: '100%',
                        objectFit: imageFit,
                        display: 'block',
                      } as React.CSSProperties
                    }
                  />
                ) : (
                  <ImagePlaceholder text={coverFlowLayout.showPlaceholderText ? '暂无图片' : ''}></ImagePlaceholder>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div
          key={activeIndex}
          className={`image-info animate-in${coverFlowLayout.infoScrollable ? ' image-info--scrollable' : ''}`}
          onClick={() => handleInfoClick(currentItem)}
          style={{ cursor: 'pointer' }}
        >
          <h3>{currentItem?.title}</h3>
          {coverFlowLayout.showDescription ? <p style={{ textIndent: '1em' }}>{currentItem?.description}</p> : null}
          <div className="view-detail-hint">
            点击查看详情 <span className="arrow">→</span>
          </div>
        </div>
      </div>
    </>
  );
};
