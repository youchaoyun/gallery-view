type ResolveCoverFlowLayoutOptions = {
  containerHeight?: number;
  containerWidth?: number;
  displayCount?: number;
  cardGap?: number;
  isMobile?: boolean;
  previousCompact?: boolean;
};

type ResolveVerticalLayoutOptions = {
  containerHeight?: number;
  containerWidth?: number;
  displayCount?: number;
  cardGap?: number;
  previousCompact?: boolean;
};

type ResolveGalleryPlaceholderTextVisibilityOptions = {
  containerWidth?: number;
  containerHeight?: number;
};

/**
 * 根据当前容器尺寸，判断占位图是否保留“暂无图片”文案。
 * @param options 当前容器宽高。
 */
export function resolveGalleryPlaceholderTextVisibility(options: ResolveGalleryPlaceholderTextVisibilityOptions) {
  const { containerWidth = 0, containerHeight = 0 } = options;

  if ((containerWidth > 0 && containerWidth <= 320) || (containerHeight > 0 && containerHeight <= 300)) {
    return false;
  }

  return true;
}

/**
 * 根据当前容器高度，计算封面流模式下更合适的展示参数。
 * @param options 当前容器高度、基础显示数量、间距和移动端状态。
 */
export function resolveCoverFlowLayout(options: ResolveCoverFlowLayoutOptions) {
  const {
    containerHeight = 0,
    containerWidth = 0,
    displayCount = 4,
    cardGap = 16,
    isMobile = false,
    previousCompact = false,
  } = options;

  if (containerHeight > 0 && containerHeight <= 300) {
    return {
      slidesPerView: 1.4,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
      infoScrollable: containerHeight <= 220 || (containerWidth > 0 && containerWidth <= 360),
    };
  }

  if (previousCompact && containerHeight > 0 && containerHeight <= 340) {
    return {
      slidesPerView: 1.4,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
      infoScrollable: containerHeight <= 220 || (containerWidth > 0 && containerWidth <= 360),
    };
  }

  return {
    slidesPerView: isMobile ? 1.5 : displayCount,
    cardGap: isMobile ? 8 : cardGap,
    compact: false,
    showDescription: true,
    showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
    infoScrollable: false,
  };
}

/**
 * 根据当前高度和上一次是否处于紧凑模式，稳定判断垂直画廊是否进入紧凑布局。
 * @param containerHeight 当前测得的容器高度。
 * @param previousCompact 上一次计算得到的紧凑状态。
 */
function resolveVerticalCompactMode(containerHeight: number, previousCompact: boolean) {
  if (containerHeight > 0 && containerHeight <= 300) {
    return true;
  }

  if (previousCompact) {
    return containerHeight > 0 && containerHeight <= 448;
  }

  return containerHeight > 0 && containerHeight <= 420;
}

/**
 * 根据当前容器高度，计算垂直模式下更合适的展示参数。
 * @param options 当前容器高度、基础显示数量、间距和上一次紧凑状态。
 */
export function resolveVerticalLayout(options: ResolveVerticalLayoutOptions) {
  const { containerHeight = 0, containerWidth = 0, displayCount = 4, cardGap = 16, previousCompact = false } = options;

  if (containerHeight > 0 && containerHeight <= 300) {
    return {
      slidesPerView: 2,
      cardGap: 8,
      compact: true,
      showDescription: false,
      showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
    };
  }

  if (resolveVerticalCompactMode(containerHeight, previousCompact)) {
    return {
      slidesPerView: Math.min(displayCount, 3),
      cardGap: 12,
      compact: true,
      showDescription: false,
      showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
    };
  }

  return {
    slidesPerView: displayCount,
    cardGap,
    compact: false,
    showDescription: true,
    showPlaceholderText: resolveGalleryPlaceholderTextVisibility({ containerWidth, containerHeight }),
  };
}
