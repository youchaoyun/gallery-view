import { describe, expect, it } from 'vitest';
import {
  resolveCoverFlowLayout,
  resolveGalleryPlaceholderTextVisibility,
  resolveVerticalLayout,
} from '../galleryCompactLayout';

describe('galleryCompactLayout', () => {
  it('uses compact coverflow settings in a 300px block', () => {
    expect(
      resolveCoverFlowLayout({
        containerHeight: 300,
        containerWidth: 600,
        displayCount: 4,
        cardGap: 16,
        isMobile: false,
      }),
    ).toEqual({
      slidesPerView: 1.4,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: false,
      infoScrollable: false,
    });
  });

  it('keeps coverflow compact while the height is still near the threshold', () => {
    expect(
      resolveCoverFlowLayout({
        containerHeight: 330,
        containerWidth: 600,
        displayCount: 4,
        cardGap: 16,
        isMobile: false,
        previousCompact: true,
      }),
    ).toEqual({
      slidesPerView: 1.4,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: true,
      infoScrollable: false,
    });
  });

  it('switches coverflow back only when the height is clearly larger', () => {
    expect(
      resolveCoverFlowLayout({
        containerHeight: 360,
        containerWidth: 600,
        displayCount: 4,
        cardGap: 16,
        isMobile: false,
        previousCompact: true,
      }),
    ).toEqual({
      slidesPerView: 4,
      cardGap: 16,
      compact: false,
      showDescription: true,
      showPlaceholderText: true,
      infoScrollable: false,
    });
  });

  it('reduces vertical slides in a 300px block', () => {
    expect(resolveVerticalLayout({ containerHeight: 300, containerWidth: 600, displayCount: 4, cardGap: 16 })).toEqual({
      slidesPerView: 2,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: false,
    });
  });

  it('keeps vertical layout compact while the height hovers around the threshold', () => {
    expect(
      resolveVerticalLayout({
        containerHeight: 440,
        containerWidth: 600,
        displayCount: 4,
        cardGap: 16,
        previousCompact: true,
      }),
    ).toEqual({
      slidesPerView: 3,
      cardGap: 12,
      compact: true,
      showDescription: false,
      showPlaceholderText: true,
    });
  });

  it('switches back to the spacious vertical layout after the height is clearly large enough', () => {
    expect(
      resolveVerticalLayout({
        containerHeight: 460,
        containerWidth: 600,
        displayCount: 4,
        cardGap: 16,
        previousCompact: true,
      }),
    ).toEqual({
      slidesPerView: 4,
      cardGap: 16,
      compact: false,
      showDescription: true,
      showPlaceholderText: true,
    });
  });

  it('keeps placeholder text when width and height are sufficient', () => {
    expect(resolveGalleryPlaceholderTextVisibility({ containerWidth: 520, containerHeight: 420 })).toBe(true);
  });

  it('hides placeholder text when width is too small', () => {
    expect(resolveGalleryPlaceholderTextVisibility({ containerWidth: 280, containerHeight: 420 })).toBe(false);
  });
});
