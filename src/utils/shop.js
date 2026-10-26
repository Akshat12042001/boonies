export const SHOP_PAGE_LIMIT = 12;

export const productCategories = [
  {
    value: 'conditioner',
    label: 'Conditioner',
  },
  {
    value: 'moisturizer',
    label: 'Moisturizer (Lotion)',
  },
  {
    value: 'shampoo',
    label: 'Shampoo',
  },
  {
    value: 'shower_gel',
    label: 'Shower Gel',
  },
  {
    value: 'soap',
    label: 'Soap',
  },
  {
    value: 'dental_kit',
    label: 'Dental Kit',
  },
  {
    value: 'Moisturizer',
    label: 'Moisturizer',
  },
];

export const getProductCategoryLabel = category => {
  const value = String(category || '').trim();
  if (!value) {
    return '';
  }

  const match = productCategories.find(
    item =>
      item.value.toLowerCase() === value.toLowerCase() ||
      item.label.toLowerCase() === value.toLowerCase(),
  );

  return match?.label || value;
};

export const getShopCatalogProducts = response => {
  if (Array.isArray(response)) {
    return response;
  }
  if (Array.isArray(response?.data)) {
    return response.data;
  }
  return [];
};

export const getShopCatalogMeta = response => ({
  page: Number(response?.page) || 1,
  limit: Number(response?.limit) || SHOP_PAGE_LIMIT,
  totalPages: Number(response?.totalPages) || 1,
  count: Number(response?.count) || 0,
});

const LOGO_PLACEMENT_CANVAS = 498;

const readLogoLogs = image => {
  const sources = [image?.logs, image?.logoAreas];

  for (const source of sources) {
    if (Array.isArray(source) && source.length) {
      return source;
    }

    if (source && typeof source === 'object' && !Array.isArray(source)) {
      return [source];
    }
  }

  return [];
};

const toNormalizedPlacement = (x, y, width, height, rotation) => {
  const pixelSize = width > 1 || height > 1;
  const canvas = pixelSize ? LOGO_PLACEMENT_CANVAS : 1;

  return {
    x: (Number(x) || 0) / canvas,
    y: (Number(y) || 0) / canvas,
    width: (Number(width) || 0) / canvas,
    height: (Number(height) || 0) / canvas,
    rotation: Number(rotation) || 0,
  };
};

const placementFromLog = (log, index) => {
  const normalized = log?.normalized;
  const normWidth = Number(normalized?.width) || 0;
  const normHeight = Number(normalized?.height) || 0;
  const width = Number(log?.width) || 0;
  const height = Number(log?.height) || 0;
  const placement =
    normWidth > 0 && normWidth <= 1 && normHeight > 0 && normHeight <= 1
      ? {
          x: Number(normalized.x) || 0,
          y: Number(normalized.y) || 0,
          width: normWidth,
          height: normHeight,
          rotation: Number(log.rotation) || 0,
        }
      : width > 0 && height > 0
        ? toNormalizedPlacement(log.x, log.y, width, height, log.rotation)
        : null;

  if (!placement || placement.width <= 0 || placement.height <= 0) {
    return null;
  }

  return {
    ...placement,
    id: log?.id || `logo-${index}`,
    zIndex: Number(log?.zIndex) || index + 1,
  };
};

const getLogoPlacements = image =>
  readLogoLogs(image)
    .map(placementFromLog)
    .filter(Boolean)
    .sort((left, right) => left.zIndex - right.zIndex);

export const getProductEditorImages = product => {
  const images = Array.isArray(product?.images) ? [...product.images] : [];

  return images
    .sort(
      (left, right) =>
        (Number(left?.displayOrder) || 0) - (Number(right?.displayOrder) || 0),
    )
    .map(image => ({
      url: image?.varient || image?.imageUrl || image?.thumbnailUrl || '',
      logoPlacements: getLogoPlacements(image),
    }))
    .filter(image => image.url);
};

export const getProductGallery = product => {
  const images = Array.isArray(product?.images) ? [...product.images] : [];

  return images
    .sort(
      (left, right) =>
        (Number(left?.displayOrder) || 0) - (Number(right?.displayOrder) || 0),
    )
    .map(image => image?.imageUrl || image?.thumbnailUrl || '')
    .filter(Boolean);
};

export const getProductImageUrl = product => {
  const images = Array.isArray(product?.images) ? product.images : [];
  const featured =
    images.find(image => image?.isFeatured) || images[0] || null;

  // Prefer the base product image. `varient` is a branded overlay asset and can
  // show a blank logo placeholder on the bottle.
  return featured?.imageUrl || featured?.thumbnailUrl || getProductGallery(product)[0] || '';
};

export const getProductVariants = product => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  return variants.filter(
    variant => variant && (variant.id || variant.label || variant.name),
  );
};

const unwrapProduct = response => {
  const payload = response?.data ?? response;

  if (payload?.id || payload?.name) {
    return payload;
  }

  return response || null;
};

export const mapProductSelection = product => {
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.compareAtPrice) || 0;

  return {
    id: product?.id || '',
    title: product?.name || '',
    category: getProductCategoryLabel(product?.category),
    price,
    originalPrice,
    discountPercent: getProductDiscountPercent(price, originalPrice),
    exclGst: product?.IncludeGST !== true,
    images: getProductEditorImages(product),
    summary: product?.shortDescription || '',
    description: product?.description || '',
    label: product?.label || product?.name || '',
  };
};

export const mapHostProductDetail = response => {
  const product = unwrapProduct(response);

  if (!product) {
    return null;
  }

  const variants = getProductVariants(product);
  const selectedIndex = Math.max(
    variants.findIndex(variant => variant.id === product.id),
    0,
  );

  return {
    product: mapProductSelection(product),
    variants: variants.map(mapProductSelection),
    selectedIndex: variants.length ? selectedIndex : 0,
  };
};

export const getProductDiscountPercent = (price, compareAtPrice) => {
  const current = Number(price) || 0;
  const original = Number(compareAtPrice) || 0;

  if (!original || original <= current) {
    return 0;
  }

  return Math.round(((original - current) / original) * 100);
};

export const mapShopProduct = product => {
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.compareAtPrice) || 0;

  return {
    id: product?.id,
    title: product?.name || '',
    description: product?.shortDescription || product?.description || '',
    category: getProductCategoryLabel(product?.category),
    imageUrl: getProductImageUrl(product),
    price,
    originalPrice,
    discountPercent: getProductDiscountPercent(price, originalPrice),
    exclGst: product?.IncludeGST !== true,
  };
};

export const buildShopCatalogParams = ({
  page = 1,
  limit = SHOP_PAGE_LIMIT,
  minPrice = 0,
  maxPrice = 10000,
  categories = [],
  sortBy = 'createdAt',
  sortOrder = 'DESC',
} = {}) => {
  const categoryList = Array.isArray(categories)
    ? categories.filter(Boolean)
    : [];

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 0,
    categories: categoryList.join(','),
  };
};
