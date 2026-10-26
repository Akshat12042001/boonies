import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Modal, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../../components/atoms';
import {ChevronRightIcon, CloseIcon} from '../../../components/svgs';
import {COLORS} from '../../../constants';
import styles, {GALLERY_PAGE_WIDTH} from './styles';

const viewabilityConfig = {itemVisiblePercentThreshold: 60};

const PhotoGalleryModal = ({isVisible = false, images = [], onClose}) => {
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef(null);
  const thumbRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setActiveIndex(0);
    requestAnimationFrame(() => {
      pagerRef.current?.scrollToOffset({offset: 0, animated: false});
    });
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || images.length === 0) {
      return;
    }

    thumbRef.current?.scrollToIndex({
      index: activeIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [activeIndex, images.length, isVisible]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    const nextIndex = viewableItems[0]?.index;
    if (typeof nextIndex === 'number') {
      setActiveIndex(nextIndex);
    }
  }).current;

  const handleScrollFail = useCallback(info => {
    requestAnimationFrame(() => {
      pagerRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    });
  }, []);

  const handleThumbFail = useCallback(info => {
    requestAnimationFrame(() => {
      thumbRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
        viewPosition: 0.5,
      });
    });
  }, []);

  const goTo = useCallback(
    nextIndex => {
      if (nextIndex < 0 || nextIndex >= images.length) {
        return;
      }

      pagerRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setActiveIndex(nextIndex);
    },
    [images.length],
  );

  const handlePrevious = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const handleNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const handleStageLayout = useCallback(event => {
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setStageHeight(current => (current === nextHeight ? current : nextHeight));
  }, []);

  const renderPage = useCallback(
    ({item, index}) => (
      <View style={[styles.galleryPage, {height: stageHeight}]}>
        <View style={styles.galleryFrame}>
          <Image source={{uri: item}} style={styles.galleryImage} resizeMode="cover" />
          <View style={styles.galleryCount}>
            <StyledText size={12} color={COLORS.WHITE} variant="medium">
              {t('DEALS.GALLERY_COUNT', {
                current: index + 1,
                total: images.length,
              })}
            </StyledText>
          </View>
        </View>
      </View>
    ),
    [images.length, stageHeight, t],
  );

  const renderThumb = useCallback(
    ({item, index}) => {
      const handlePress = () => goTo(index);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={[styles.thumb, index === activeIndex && styles.thumbSelected]}>
          <Image source={{uri: item}} style={styles.thumbImage} resizeMode="cover" />
        </TouchableOpacity>
      );
    },
    [activeIndex, goTo],
  );

  const keyExtractor = useCallback((item, index) => `${item}-${index}`, []);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: GALLERY_PAGE_WIDTH,
      offset: GALLERY_PAGE_WIDTH * index,
      index,
    }),
    [],
  );

  const atStart = activeIndex <= 0;
  const atEnd = activeIndex >= images.length - 1;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={[styles.galleryBody, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        <View style={styles.galleryHeader}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t('DEALS.GALLERY_CLOSE')}
            onPress={onClose}
            style={styles.closeButton}>
            <CloseIcon color={COLORS.WHITE} size={16} />
          </TouchableOpacity>
        </View>

        <View style={styles.galleryStage} onLayout={handleStageLayout}>
          <FlatList
            ref={pagerRef}
            data={images}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={renderPage}
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={handleScrollFail}
            style={{height: stageHeight}}
          />

          {images.length > 1 ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('DEALS.GALLERY_PREVIOUS')}
                disabled={atStart}
                onPress={handlePrevious}
                style={[
                  styles.galleryArrow,
                  styles.galleryArrowLeft,
                  atStart && styles.galleryArrowDisabled,
                ]}>
                <View style={styles.galleryArrowFlip}>
                  <ChevronRightIcon color={COLORS.WHITE} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('DEALS.GALLERY_NEXT')}
                disabled={atEnd}
                onPress={handleNext}
                style={[
                  styles.galleryArrow,
                  styles.galleryArrowRight,
                  atEnd && styles.galleryArrowDisabled,
                ]}>
                <ChevronRightIcon color={COLORS.WHITE} />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        <FlatList
          ref={thumbRef}
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderThumb}
          style={styles.thumbs}
          contentContainerStyle={styles.thumbsContent}
          onScrollToIndexFailed={handleThumbFail}
        />
      </View>
    </Modal>
  );
};

export default memo(PhotoGalleryModal);
