import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {Input, ScreenContainer, StyledText} from '../../../components/atoms';
import {CartHeaderButton, ScreenHeader} from '../../../components/molecules';
import {
  BagIcon,
  CartIcon,
  ChevronRightIcon,
  TagIcon,
  UploadIcon,
} from '../../../components/svgs';
import {makeMeRequest} from '../../../api/auth';
import {makeGetHostProductRequest} from '../../../api/common';
import {COLORS, NAVIGATION, SCREEN} from '../../../constants';
import {setUserData} from '../../../redux/auth/auth.reducer';
import {addCartItem, MIN_CART_QUANTITY} from '../../../redux/cart/cart.reducer';
import {formatCurrency} from '../../../utils/invoice';
import {getHomestayLogoUrl} from '../../../utils/logo';
import {mapHostProductDetail} from '../../../utils/shop';
import styles, {LOGO_HANDLE_MARGIN} from './styles';

const GALLERY_WIDTH = SCREEN.WIDTH - 32;
const GALLERY_HEIGHT = 280;
const FIELD_BORDER = COLORS.BORDER;
const FIELD_FOCUS = COLORS.LOGIN_PRIMARY;

const EMPTY_DETAIL = {
  product: null,
  variants: [],
  selectedIndex: 0,
};

const digitsOnly = value => String(value || '').replace(/\D/g, '');

const getContainFrame = (imageWidth, imageHeight) => {
  if (!imageWidth || !imageHeight) {
    return {
      offsetX: 0,
      offsetY: 0,
      width: GALLERY_WIDTH,
      height: GALLERY_HEIGHT,
    };
  }

  const scale = Math.min(
    GALLERY_WIDTH / imageWidth,
    GALLERY_HEIGHT / imageHeight,
  );
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    offsetX: (GALLERY_WIDTH - width) / 2,
    offsetY: (GALLERY_HEIGHT - height) / 2,
    width,
    height,
  };
};

const frameFromPlacement = (placement, fit) => {
  const bounds = fit || getContainFrame();
  const width = bounds.width * (placement?.width || 0.34);
  const height = bounds.height * (placement?.height || 0.16);

  return {
    x: bounds.offsetX + bounds.width * (placement?.x || 0.33),
    y: bounds.offsetY + bounds.height * (placement?.y || 0.46),
    width,
    height,
    rotation: placement?.rotation || 0,
  };
};

const MIN_LOGO_WIDTH = 48;
const MIN_LOGO_HEIGHT = 28;
const RESIZE_HANDLES = [
  {key: 'nw', x: -1, y: -1, styleKey: 'handleNw'},
  {key: 'n', x: 0, y: -1, styleKey: 'handleN'},
  {key: 'ne', x: 1, y: -1, styleKey: 'handleNe'},
  {key: 'e', x: 1, y: 0, styleKey: 'handleE'},
  {key: 'se', x: 1, y: 1, styleKey: 'handleSe'},
  {key: 's', x: 0, y: 1, styleKey: 'handleS'},
  {key: 'sw', x: -1, y: 1, styleKey: 'handleSw'},
  {key: 'w', x: -1, y: 0, styleKey: 'handleW'},
];

const clampDimension = (value, min, max) => {
  'worklet';

  return Math.min(max, Math.max(min, value));
};

const applyResize = (start, handle, translationX, translationY) => {
  'worklet';

  const rotationRad = (start.rotation * Math.PI) / 180;
  const cos = Math.cos(rotationRad);
  const sin = Math.sin(rotationRad);
  const localDx = translationX * cos + translationY * sin;
  const localDy = -translationX * sin + translationY * cos;
  const width = handle.x
    ? clampDimension(
        start.width + localDx * handle.x,
        MIN_LOGO_WIDTH,
        GALLERY_WIDTH,
      )
    : start.width;
  const height = handle.y
    ? clampDimension(
        start.height + localDy * handle.y,
        MIN_LOGO_HEIGHT,
        GALLERY_HEIGHT,
      )
    : start.height;
  const centerX = start.x + start.width / 2;
  const centerY = start.y + start.height / 2;
  const anchorX = -handle.x * (start.width / 2);
  const anchorY = -handle.y * (start.height / 2);
  const anchorScreenX = centerX + anchorX * cos - anchorY * sin;
  const anchorScreenY = centerY + anchorX * sin + anchorY * cos;
  const nextAnchorX = -handle.x * (width / 2);
  const nextAnchorY = -handle.y * (height / 2);

  return {
    width,
    height,
    x: anchorScreenX - (nextAnchorX * cos - nextAnchorY * sin) - width / 2,
    y: anchorScreenY - (nextAnchorX * sin + nextAnchorY * cos) - height / 2,
  };
};

const shortestAngleDelta = (nextAngle, previousAngle) => {
  'worklet';

  let delta = nextAngle - previousAngle;

  if (delta > Math.PI) {
    delta -= Math.PI * 2;
  } else if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }

  return delta;
};

const BrandLogoMark = ({
  placement,
  imageFit,
  uri,
  logoVersion,
  selected,
  onSelect,
  onImageError,
  scrollNative,
}) => {
  const initialFrame = frameFromPlacement(placement, imageFit);
  const logoX = useSharedValue(initialFrame.x);
  const logoY = useSharedValue(initialFrame.y);
  const logoWidth = useSharedValue(initialFrame.width);
  const logoHeight = useSharedValue(initialFrame.height);
  const logoRotation = useSharedValue(initialFrame.rotation);
  const startX = useSharedValue(initialFrame.x);
  const startY = useSharedValue(initialFrame.y);
  const startWidth = useSharedValue(initialFrame.width);
  const startHeight = useSharedValue(initialFrame.height);
  const startRotation = useSharedValue(initialFrame.rotation);
  const rotateCenterX = useSharedValue(0);
  const rotateCenterY = useSharedValue(0);
  const rotateStartAngle = useSharedValue(0);
  const logoBoxRef = useAnimatedRef();
  const movedRef = useRef(false);

  useEffect(() => {
    if (movedRef.current) {
      return;
    }

    const frame = frameFromPlacement(placement, imageFit);

    logoX.value = frame.x;
    logoY.value = frame.y;
    logoWidth.value = frame.width;
    logoHeight.value = frame.height;
    logoRotation.value = frame.rotation;
  }, [
    imageFit,
    logoHeight,
    logoRotation,
    logoWidth,
    logoX,
    logoY,
    placement,
  ]);

  const markActive = useCallback(() => {
    movedRef.current = true;
    onSelect(placement.id);
  }, [onSelect, placement.id]);

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .averageTouches(true)
        .blocksExternalGesture(scrollNative)
        .onBegin(() => {
          'worklet';

          startX.value = logoX.value;
          startY.value = logoY.value;
          runOnJS(markActive)();
        })
        .onUpdate(event => {
          'worklet';

          logoX.value = startX.value + event.translationX;
          logoY.value = startY.value + event.translationY;
        }),
    [logoX, logoY, markActive, scrollNative, startX, startY],
  );

  const resizeGestures = useMemo(() => {
    return RESIZE_HANDLES.reduce((gestures, handle) => {
      gestures[handle.key] = Gesture.Pan()
        .minDistance(0)
        .averageTouches(true)
        .blocksExternalGesture(scrollNative)
        .onBegin(() => {
          'worklet';

          startX.value = logoX.value;
          startY.value = logoY.value;
          startWidth.value = logoWidth.value;
          startHeight.value = logoHeight.value;
          startRotation.value = logoRotation.value;
          runOnJS(markActive)();
        })
        .onUpdate(event => {
          'worklet';

          const next = applyResize(
            {
              x: startX.value,
              y: startY.value,
              width: startWidth.value,
              height: startHeight.value,
              rotation: startRotation.value,
            },
            handle,
            event.translationX,
            event.translationY,
          );

          logoX.value = next.x;
          logoY.value = next.y;
          logoWidth.value = next.width;
          logoHeight.value = next.height;
        });

      return gestures;
    }, {});
  }, [
    logoHeight,
    logoRotation,
    logoWidth,
    logoX,
    logoY,
    markActive,
    scrollNative,
    startHeight,
    startRotation,
    startWidth,
    startX,
    startY,
  ]);

  const rotateGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .averageTouches(true)
        .shouldCancelWhenOutside(false)
        .blocksExternalGesture(scrollNative)
        .onBegin(event => {
          'worklet';

          const layout = measure(logoBoxRef);

          if (layout) {
            rotateCenterX.value = layout.pageX + layout.width / 2;
            rotateCenterY.value = layout.pageY + layout.height / 2;
          }

          rotateStartAngle.value = Math.atan2(
            event.absoluteY - rotateCenterY.value,
            event.absoluteX - rotateCenterX.value,
          );
          runOnJS(markActive)();
        })
        .onUpdate(event => {
          'worklet';

          const angle = Math.atan2(
            event.absoluteY - rotateCenterY.value,
            event.absoluteX - rotateCenterX.value,
          );
          const delta = shortestAngleDelta(angle, rotateStartAngle.value);

          rotateStartAngle.value = angle;
          logoRotation.value += (delta * 180) / Math.PI;
        }),
    [
      logoBoxRef,
      logoRotation,
      markActive,
      rotateCenterX,
      rotateCenterY,
      rotateStartAngle,
      scrollNative,
    ],
  );

  const logoBoxStyle = useAnimatedStyle(() => ({
    left: logoX.value - LOGO_HANDLE_MARGIN,
    top: logoY.value - LOGO_HANDLE_MARGIN,
    width: logoWidth.value + LOGO_HANDLE_MARGIN * 2,
    height: logoHeight.value + LOGO_HANDLE_MARGIN * 2,
    transform: [{rotate: `${logoRotation.value}deg`}],
  }));

  return (
    <Animated.View
      ref={logoBoxRef}
      collapsable={false}
      pointerEvents="box-none"
      style={[
        styles.logoBox,
        logoBoxStyle,
        {elevation: selected ? 12 : 6, zIndex: selected ? 20 : 4 + placement.zIndex},
      ]}>
      <GestureDetector gesture={dragGesture}>
        <Animated.View collapsable={false} style={styles.logoDragArea}>
          <Image
            key={`${uri}-${logoVersion}`}
            pointerEvents="none"
            source={{uri, cache: 'reload'}}
            resizeMode="contain"
            style={styles.logoImage}
            onError={onImageError}
          />
        </Animated.View>
      </GestureDetector>
      <View
        pointerEvents={selected ? 'box-none' : 'none'}
        style={[styles.logoChrome, !selected && styles.logoChromeHidden]}>
        <View pointerEvents="none" style={styles.logoBorder} />
        <View pointerEvents="none" style={styles.rotateStem} />
        <GestureDetector gesture={rotateGesture}>
          <View style={[styles.resizeTouch, styles.rotateTouch]}>
            <View style={styles.resizeHandle} />
          </View>
        </GestureDetector>
        {RESIZE_HANDLES.map(handle => (
          <GestureDetector key={handle.key} gesture={resizeGestures[handle.key]}>
            <View style={[styles.resizeTouch, styles[handle.styleKey]]}>
              <View style={styles.resizeHandle} />
            </View>
          </GestureDetector>
        ))}
      </View>
    </Animated.View>
  );
};

const ShopProductDetailScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const homestayLogoUrl = getHomestayLogoUrl(user);
  const route = useRoute();
  const productId = route.params?.productId || route.params?.product?.id;

  const [detailResponse, setDetailResponse] = useState(EMPTY_DETAIL);
  const [imageIndex, setImageIndex] = useState(0);
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(String(MIN_CART_QUANTITY));
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const userRef = useRef(user);
  userRef.current = user;
  const [selectedLogoId, setSelectedLogoId] = useState(null);
  const [uploadedLogo, setUploadedLogo] = useState(null);
  const [hidePreviewLogo, setHidePreviewLogo] = useState(false);
  const [productImageSize, setProductImageSize] = useState({
    width: 0,
    height: 0,
  });

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setIsLoading(false);
      setIsError(true);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      const response = await makeGetHostProductRequest(productId);
      const mapped = mapHostProductDetail(response);

      if (!mapped?.product) {
        setIsError(true);
        setDetailResponse(EMPTY_DETAIL);
        return;
      }

      setDetailResponse(mapped);
      setVariantIndex(mapped.selectedIndex);
      setImageIndex(0);
    } catch {
      setIsError(true);
      setDetailResponse(EMPTY_DETAIL);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const detail = useMemo(() => {
    const selected =
      detailResponse.variants[variantIndex] || detailResponse.product;

    return selected;
  }, [detailResponse, variantIndex]);

  const imageCount = Math.max(detail?.images?.length || 0, 1);
  const activeImage = detail?.images?.[imageIndex] || null;
  const activeImageUrl = activeImage?.url || '';
  const logoPlacements = activeImage?.logoPlacements || [];
  const hasLogoPlacements = logoPlacements.length > 0;
  const previewLogoUrl = uploadedLogo?.previewUrl || '';
  const savedLogoUrl =
    uploadedLogo?.remoteUrl ||
    (typeof user?.homestayLogo === 'string' && user.homestayLogo.trim()) ||
    homestayLogoUrl;
  const imageFit = useMemo(
    () => getContainFrame(productImageSize.width, productImageSize.height),
    [productImageSize.height, productImageSize.width],
  );

  const scrollNative = useMemo(() => Gesture.Native(), []);

  const logoVersion = uploadedLogo?.updatedAt || 0;
  const remoteLogoUri =
    savedLogoUrl && logoVersion && /^https?:\/\//i.test(savedLogoUrl)
      ? `${savedLogoUrl}${savedLogoUrl.includes('?') ? '&' : '?'}v=${logoVersion}`
      : savedLogoUrl;
  const homestayLogoUri =
    (!hidePreviewLogo && previewLogoUrl) || remoteLogoUri;

  useEffect(() => {
    setHidePreviewLogo(false);
  }, [previewLogoUrl, uploadedLogo?.updatedAt]);
  const showDiscount =
    !!detail &&
    (Number(detail.discountPercent) > 0 ||
      (detail.originalPrice > detail.price && detail.originalPrice > 0));
  const discountLabel = t('SHOP.DISCOUNT_OFF', {
    percent:
      Number(detail?.discountPercent) ||
      (detail?.originalPrice
        ? Math.round(
            ((detail.originalPrice - detail.price) / detail.originalPrice) * 100,
          )
        : 0),
  });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePreviousImage = useCallback(() => {
    setSelectedLogoId(null);
    setImageIndex(current => Math.max(0, current - 1));
  }, []);

  const handleNextImage = useCallback(() => {
    setSelectedLogoId(null);
    setImageIndex(current => Math.min(imageCount - 1, current + 1));
  }, [imageCount]);

  const handleSelectImage = useCallback(index => {
    setSelectedLogoId(null);
    setImageIndex(index);
  }, []);

  const handleSelectVariant = useCallback(index => {
    setSelectedLogoId(null);
    setVariantIndex(index);
    setImageIndex(0);
  }, []);

  useEffect(() => {
    if (!activeImageUrl) {
      setProductImageSize({width: 0, height: 0});
      return undefined;
    }

    setProductImageSize({width: 0, height: 0});

    let isCurrent = true;

    Image.getSize(
      activeImageUrl,
      (width, height) => {
        if (isCurrent && width && height) {
          setProductImageSize({width, height});
        }
      },
      () => {},
    );

    return () => {
      isCurrent = false;
    };
  }, [activeImageUrl]);

  useFocusEffect(
    useCallback(() => {
      const currentUser = userRef.current;

      if (!currentUser?.accessToken) {
        return undefined;
      }

      let isCurrent = true;

      makeMeRequest()
        .then(response => {
          if (!isCurrent) {
            return;
          }

          const nextLogo =
            getHomestayLogoUrl(response) ||
            getHomestayLogoUrl(response?.data) ||
            getHomestayLogoUrl(currentUser);

          dispatch(
            setUserData({
              ...currentUser,
              ...response,
              homestayLogo: nextLogo || currentUser?.homestayLogo || '',
              accessToken: currentUser.accessToken,
              refreshToken: currentUser.refreshToken,
            }),
          );
        })
        .catch(() => {});

      return () => {
        isCurrent = false;
      };
    }, [dispatch]),
  );

  const quantityValue = Number(quantity) || 0;
  const isQuantityValid = quantityValue >= MIN_CART_QUANTITY;

  const handleQuantityChange = useCallback(value => {
    setQuantity(digitsOnly(value));
  }, []);

  const handleLogoUpdated = useCallback(logo => {
    setUploadedLogo({
      remoteUrl: logo?.remoteUrl || '',
      previewUrl: logo?.previewUrl || '',
      updatedAt: Date.now(),
    });
  }, []);

  const handleUploadLogo = useCallback(() => {
    setSelectedLogoId(null);
    navigation.navigate(NAVIGATION.COMMON.CREATE_LOGO_SCREEN, {
      onLogoUpdated: handleLogoUpdated,
    });
  }, [handleLogoUpdated, navigation]);

  const handleProductImageLoad = useCallback(event => {
    const width = event?.nativeEvent?.source?.width || 0;
    const height = event?.nativeEvent?.source?.height || 0;

    if (!width || !height) {
      return;
    }

    setProductImageSize({width, height});
  }, []);

  const handleSelectLogo = useCallback(logoId => {
    setSelectedLogoId(logoId);
  }, []);

  const handleDeselectLogo = useCallback(() => {
    setSelectedLogoId(null);
  }, []);

  const handleLogoImageError = useCallback(() => {
    setHidePreviewLogo(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!detail?.id || !isQuantityValid) {
      return;
    }

    dispatch(
      addCartItem({
        id: detail.id,
        title: detail.title,
        price: detail.price,
        originalPrice: detail.originalPrice,
        imageUrl: detail.images?.[0]?.url || '',
        quantity: quantityValue,
      }),
    );
  }, [detail, dispatch, isQuantityValid, quantityValue]);

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <ScreenHeader
        title={detail?.title || t('SHOP.DETAIL_TITLE')}
        backAccessibilityLabel={t('SHOP.BACK')}
        onBack={handleBack}
        rightComponent={<CartHeaderButton />}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={COLORS.LOGIN_PRIMARY} size="large" />
        </View>
      ) : isError || !detail ? (
        <View style={styles.loader}>
          <StyledText color={COLORS.TEXT_SECONDARY} size={14}>
            {t('SHOP.LOAD_ERROR')}
          </StyledText>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={fetchProduct}
            style={styles.retryButton}>
            <StyledText color={COLORS.LOGIN_PRIMARY} variant="semiBold" size={14}>
              {t('SHOP.RETRY')}
            </StyledText>
          </TouchableOpacity>
        </View>
      ) : (
      <GestureDetector gesture={scrollNative}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        scrollEnabled={!selectedLogoId}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.galleryCard]}>
          <View
            style={[
              styles.galleryFrame,
              {width: GALLERY_WIDTH, height: GALLERY_HEIGHT},
            ]}>
            {activeImageUrl ? (
              <Image
                pointerEvents="none"
                source={{uri: activeImageUrl}}
                style={styles.galleryImage}
                resizeMode="contain"
                onLoad={handleProductImageLoad}
              />
            ) : (
              <View style={styles.galleryPlaceholder}>
                <StyledText color={COLORS.TEXT_MUTED} size={12}>
                  {t('SHOP.PRODUCT_PHOTO')}
                </StyledText>
              </View>
            )}
            {selectedLogoId ? (
              <Pressable
                style={styles.logoDismiss}
                onPress={handleDeselectLogo}
              />
            ) : null}
            {homestayLogoUri
              ? logoPlacements.map(placement => (
                  <BrandLogoMark
                    key={`${imageIndex}-${placement.id}`}
                    placement={placement}
                    imageFit={imageFit}
                    uri={homestayLogoUri}
                    logoVersion={logoVersion}
                    selected={selectedLogoId === placement.id}
                    onSelect={handleSelectLogo}
                    onImageError={handleLogoImageError}
                    scrollNative={scrollNative}
                  />
                ))
              : null}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('SHOP.PREVIOUS_IMAGE')}
              disabled={imageIndex === 0}
              onPress={handlePreviousImage}
              style={[
                styles.arrowButton,
                styles.arrowLeft,
                imageIndex === 0 && styles.arrowDisabled,
              ]}>
              <View style={styles.arrowIconFlipped}>
                <ChevronRightIcon color={COLORS.TEXT} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('SHOP.NEXT_IMAGE')}
              disabled={imageIndex >= imageCount - 1}
              onPress={handleNextImage}
              style={[
                styles.arrowButton,
                styles.arrowRight,
                imageIndex >= imageCount - 1 && styles.arrowDisabled,
              ]}>
              <ChevronRightIcon color={COLORS.TEXT} />
            </TouchableOpacity>
            <View style={styles.imageCount}>
              <StyledText color={COLORS.WHITE} size={12} variant="semiBold">
                {t('SHOP.IMAGE_COUNT', {
                  current: Math.min(imageIndex + 1, imageCount),
                  total: imageCount,
                })}
              </StyledText>
            </View>
          </View>

          <View style={styles.thumbRow}>
            {(detail.images.length ? detail.images : []).map((image, index) => (
              <TouchableOpacity
                key={`${image.url || 'photo'}-${index}`}
                accessibilityRole="button"
                onPress={() => handleSelectImage(index)}
                style={[
                  styles.thumb,
                  index === imageIndex && styles.thumbSelected,
                ]}>
                {image.url ? (
                  <Image source={{uri: image.url}} style={styles.thumbImage} />
                ) : (
                  <View style={styles.galleryPlaceholder} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          {!!detail.category && (
            <View style={styles.categoryTag}>
              <StyledText size={12} color={COLORS.TEXT}>
                {detail.category}
              </StyledText>
            </View>
          )}

          <StyledText variant="bold" size={22} containerStyle={styles.title}>
            {detail.title}
          </StyledText>

          <View style={styles.priceRow}>
            <StyledText color={COLORS.LOGIN_PRIMARY} variant="bold" size={20}>
              {formatCurrency(detail.price)}
            </StyledText>
            {detail.exclGst ? (
              <StyledText color={COLORS.TEXT_MUTED} size={12}>
                {t('SHOP.EXCL_GST')}
              </StyledText>
            ) : null}
            {detail.originalPrice > detail.price ? (
              <StyledText
                color={COLORS.TEXT_MUTED}
                size={16}
                textStyle={styles.originalPrice}>
                {formatCurrency(detail.originalPrice)}
              </StyledText>
            ) : null}
            {showDiscount ? (
              <View style={styles.discountBadge}>
                <TagIcon color={COLORS.WHITE} size={12} />
                <StyledText color={COLORS.WHITE} size={12} variant="bold">
                  {discountLabel}
                </StyledText>
              </View>
            ) : null}
          </View>

          {detailResponse.variants.length > 0 ? (
            <>
              <View style={styles.divider} />
              <StyledText
                variant="semiBold"
                size={14}
                containerStyle={styles.sectionLabel}>
                {t('SHOP.VARIANTS')}
              </StyledText>
              <View style={styles.variantRow}>
                {detailResponse.variants.map((variant, index) => {
                  const selected = index === variantIndex;

                  return (
                    <TouchableOpacity
                      key={variant.id || `${variant.label}-${index}`}
                      accessibilityRole="button"
                      onPress={() => handleSelectVariant(index)}
                      style={[
                        styles.variantChip,
                        selected && styles.variantChipSelected,
                      ]}>
                      <StyledText
                        color={selected ? COLORS.WHITE : COLORS.LOGIN_PRIMARY}
                        variant="semiBold"
                        size={14}>
                        {variant.label}
                      </StyledText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          {hasLogoPlacements ? (
            <>
              <View style={styles.divider} />

              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.9}
                onPress={handleUploadLogo}
                style={styles.uploadButton}>
                <UploadIcon color={COLORS.WHITE} size={16} />
                <StyledText color={COLORS.WHITE} variant="semiBold" size={15}>
                  {t('SHOP.UPLOAD_LOGO')}
                </StyledText>
              </TouchableOpacity>
              <Text style={styles.note}>
                <Text style={styles.noteStrong}>{t('SHOP.LOGO_NOTE_LEAD')} </Text>
                {t('SHOP.LOGO_NOTE_BEFORE_DRAG')}
                <Text style={styles.noteStrong}>{t('SHOP.LOGO_NOTE_DRAG')}</Text>
                {t('SHOP.LOGO_NOTE_BEFORE_RESIZE')}
                <Text style={styles.noteStrong}>{t('SHOP.LOGO_NOTE_RESIZE')}</Text>
                {t('SHOP.LOGO_NOTE_BEFORE_ROTATE')}
                <Text style={styles.noteStrong}>{t('SHOP.LOGO_NOTE_ROTATE')}</Text>
                {t('SHOP.LOGO_NOTE_END')}
              </Text>
            </>
          ) : null}

          {!!detail.summary && (
            <>
              <View style={styles.divider} />
              <StyledText
                color={COLORS.TEXT_SECONDARY}
                size={14}
                textStyle={styles.summary}>
                {detail.summary}
              </StyledText>
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.quantityRow}>
            <View style={styles.quantityMeta}>
              <BagIcon color={COLORS.TEXT_SECONDARY} size={18} />
              <StyledText color={COLORS.TEXT_SECONDARY} size={14}>
                {t('SHOP.QUANTITY')}
              </StyledText>
            </View>
            <Input
              value={quantity}
              keyboardType="number-pad"
              onChangeText={handleQuantityChange}
              error={isQuantityValid ? undefined : 'SHOP.MIN_QUANTITY'}
              containerStyles={styles.quantityInput}
              inputStyle={styles.quantityField}
              borderColor={FIELD_BORDER}
              focusedBorderColor={FIELD_FOCUS}
            />
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.9}
            disabled={!isQuantityValid}
            onPress={handleAddToCart}
            style={[styles.addButton, !isQuantityValid && styles.addButtonDisabled]}>
            <CartIcon
              color={isQuantityValid ? COLORS.WHITE : COLORS.GREYSCALE_500}
              size={18}
            />
            <StyledText
              color={isQuantityValid ? COLORS.WHITE : COLORS.GREYSCALE_500}
              variant="semiBold"
              size={15}>
              {t('SHOP.ADD_TO_CART')}
            </StyledText>
          </TouchableOpacity>
        </View>

        {!!detail.description && (
          <View style={styles.card}>
            <StyledText
              variant="bold"
              size={16}
              containerStyle={styles.descriptionHeading}>
              {t('SHOP.DESCRIPTION')}
            </StyledText>
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              size={14}
              textStyle={styles.descriptionBody}>
              {detail.description}
            </StyledText>
          </View>
        )}
      </ScrollView>
      </GestureDetector>
      )}
    </ScreenContainer>
  );
};

export default ShopProductDetailScreen;
