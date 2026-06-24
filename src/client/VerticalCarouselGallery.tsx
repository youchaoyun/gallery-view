import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Mousewheel } from 'swiper/modules';
import { Typography, Card } from 'antd';
import { ImagePlaceholder } from './ImagePlaceholder';
import { resolveVerticalLayout } from './galleryCompactLayout';
import './styles/VerticalCarouselGallery.less';

const { Title, Paragraph } = Typography;

interface ImageData {
  id: string | number;
  title: string;
  description: string;
  url: string;
}

interface VerticalCarouselGalleryProps {
  images: ImageData[];
  cardGap?: number;
  displayCount?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  carouselInterval?: number;
  model: any;
}

export const VerticalCarouselGallery: React.FC<VerticalCarouselGalleryProps> = ({
  images,
  cardGap = 16,
  displayCount = 4,
  imageFit = 'cover',
  carouselInterval = 3000,
  model,
}) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [previousCompact, setPreviousCompact] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const verticalLayout = resolveVerticalLayout({
    containerHeight,
    containerWidth,
    displayCount,
    cardGap,
    previousCompact,
  });

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

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPreviousCompact((previous) => (previous === verticalLayout.compact ? previous : verticalLayout.compact));
  }, [verticalLayout.compact]);

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
      <div
        ref={containerRef}
        className={`vertical-carousel-container${
          verticalLayout.compact ? ' vertical-carousel-container--compact' : ''
        }`}
      >
        <Swiper
          direction="vertical"
          pagination={{
            clickable: true,
          }}
          mousewheel={true}
          key={`swiper-${carouselInterval}`}
          autoplay={carouselInterval > 0 ? { delay: carouselInterval, disableOnInteraction: false } : false}
          modules={[Pagination, Autoplay, Mousewheel]}
          className="vertical-swiper"
          spaceBetween={verticalLayout.cardGap}
          slidesPerView={verticalLayout.slidesPerView}
        >
          {images.map((image) => (
            <SwiperSlide key={image.id}>
              <Card
                hoverable
                className="vertical-gallery-card"
                onClick={() => handleImageClick(image)}
                cover={
                  <div className="image-wrapper">
                    {image.url ? (
                      <img
                        src={image.url}
                        alt={image.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: imageFit,
                          display: 'block',
                        }}
                      />
                    ) : (
                      <ImagePlaceholder text={verticalLayout.showPlaceholderText ? '暂无图片' : ''}></ImagePlaceholder>
                    )}
                    <div className="image-overlay">
                      <Title level={3} style={{ color: '#fff', margin: 0 }}>
                        {image?.title}
                      </Title>
                      {verticalLayout.showDescription ? (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ color: '#fff', marginTop: '8px', marginBottom: 0, textIndent: '1em' }}
                        >
                          {image?.description}
                        </Paragraph>
                      ) : null}
                    </div>
                  </div>
                }
              ></Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};
