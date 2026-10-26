import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, PanResponder, Pressable, View} from 'react-native';
import styles from './styles';

const MIN_LOGO_SIZE = 20;

const getContainRect = (frameWidth, frameHeight, imageWidth, imageHeight) => {
  if (!frameWidth || !frameHeight || !imageWidth || !imageHeight) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;
  const frameAspect = frameWidth / frameHeight;

  if (imageAspect > frameAspect) {
    const width = frameWidth;
    const height = frameWidth / imageAspect;

    return {
      x: 0,
      y: (frameHeight - height) / 2,
      width,
      height,
    };
  }

  const height = frameHeight;
  const width = frameHeight * imageAspect;

  return {
    x: (frameWidth - width) / 2,
    y: 0,
    width,
    height,
  };
};

const layoutFromPlacement = (
  placement,
  frameWidth,
  frameHeight,
  imageWidth,
  imageHeight,
) => {
  const imageRect = getContainRect(
    frameWidth,
    frameHeight,
    imageWidth,
    imageHeight,
  );

  if (!imageRect || !placement) {
    return null;
  }

  const usesPixels = placement.absolute && imageWidth > 0 && imageHeight > 0;
  const scaleX = usesPixels ? imageRect.width / imageWidth : imageRect.width;
  const scaleY = usesPixels ? imageRect.height / imageHeight : imageRect.height;
  const originX = usesPixels ? placement.x : placement.x;
  const originY = usesPixels ? placement.y : placement.y;
  const width = placement.width * scaleX;
  const height = placement.height * scaleY;

  if (width < 8 || height < 8) {
    return null;
  }

  return {
    x: imageRect.x + originX * scaleX + width / 2,
    y: imageRect.y + originY * scaleY + height / 2,
    width,
    height,
    rotation: placement.rotation || 0,
  };
};
const HANDLE_KEYS = [
  'handleTopLeft',
  'handleTop',
  'handleTopRight',
  'handleRight',
  'handleBottomRight',
  'handleBottom',
  'handleBottomLeft',
  'handleLeft',
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const clampCenter = (value, size, limit) => {
  const margin = Math.min(24, size / 2);
  return clamp(value, margin, Math.max(margin, limit - margin));
};

const ProductLogoEditor = ({
  uri,
  placement,
  imageWidth,
  imageHeight,
  selected,
  onSelect,
  onDeselect,
  frameWidth,
  frameHeight,
}) => {
  const rootRef = useRef(null);
  const frameOrigin = useRef({x: 0, y: 0});
  const frameSize = useRef({width: frameWidth, height: frameHeight});
  const gestureStart = useRef(null);
  const safeImageWidth = imageWidth || frameWidth;
  const safeImageHeight = imageHeight || frameHeight;
  const baseLayout = useMemo(
    () =>
      layoutFromPlacement(
        placement,
        frameWidth,
        frameHeight,
        safeImageWidth,
        safeImageHeight,
      ),
    [
      frameHeight,
      frameWidth,
      placement,
      safeImageHeight,
      safeImageWidth,
    ],
  );
  const [layout, setLayout] = useState(baseLayout);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  frameSize.current = {width: frameWidth, height: frameHeight};

  const measureFrame = useCallback(() => {
    rootRef.current?.measureInWindow((x, y) => {
      frameOrigin.current = {x: x || 0, y: y || 0};
    });
  }, []);

  useEffect(() => {
    setLayout(baseLayout);
  }, [baseLayout]);

  useEffect(() => {
    if (selected) {
      measureFrame();
    }
  }, [measureFrame, selected]);

  const rememberGestureStart = useCallback(() => {
    gestureStart.current = layoutRef.current;
    measureFrame();
  }, [measureFrame]);

  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: rememberGestureStart,
        onPanResponderMove: (_event, gesture) => {
          const start = gestureStart.current;
          const {width: limitWidth, height: limitHeight} = frameSize.current;

          if (!start) {
            return;
          }

          setLayout(current => ({
            ...current,
            x: clampCenter(start.x + gesture.dx, current.width, limitWidth),
            y: clampCenter(start.y + gesture.dy, current.height, limitHeight),
          }));
        },
      }),
    [rememberGestureStart],
  );

  const resizeResponders = useMemo(
    () =>
      HANDLE_KEYS.map(() =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderTerminationRequest: () => false,
          onPanResponderGrant: event => {
            rememberGestureStart();
            const start = layoutRef.current;
            const touchX = event.nativeEvent.pageX - frameOrigin.current.x;
            const touchY = event.nativeEvent.pageY - frameOrigin.current.y;
            gestureStart.current = {
              ...start,
              distance: Math.hypot(touchX - start.x, touchY - start.y) || 1,
            };
          },
          onPanResponderMove: event => {
            const start = gestureStart.current;
            const {width: limitWidth, height: limitHeight} = frameSize.current;

            if (!start?.distance) {
              return;
            }

            const touchX = event.nativeEvent.pageX - frameOrigin.current.x;
            const touchY = event.nativeEvent.pageY - frameOrigin.current.y;
            const distance =
              Math.hypot(touchX - start.x, touchY - start.y) || 1;
            const maxScale = Math.min(
              limitWidth / start.width,
              limitHeight / start.height,
            );
            const minScale = Math.max(
              MIN_LOGO_SIZE / start.width,
              MIN_LOGO_SIZE / start.height,
            );
            const scale = clamp(distance / start.distance, minScale, maxScale);

            setLayout(current => ({
              ...current,
              width: start.width * scale,
              height: start.height * scale,
            }));
          },
        }),
      ),
    [rememberGestureStart],
  );

  const rotateResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: rememberGestureStart,
        onPanResponderMove: event => {
          const start = gestureStart.current;

          if (!start) {
            return;
          }

          const touchX = event.nativeEvent.pageX - frameOrigin.current.x;
          const touchY = event.nativeEvent.pageY - frameOrigin.current.y;
          const rotation =
            (Math.atan2(touchY - start.y, touchX - start.x) * 180) / Math.PI +
            90;

          setLayout(current => ({
            ...current,
            rotation,
          }));
        },
      }),
    [rememberGestureStart],
  );

  const placedWidth = frameWidth * (placement?.width || 0.34);
  const placedHeight = Math.max(frameHeight * (placement?.height || 0.16), 48);
  const placedBox = {
    x: frameWidth * (placement?.x || 0.33) + placedWidth / 2,
    y: frameHeight * (placement?.y || 0.46) + placedHeight / 2,
    width: placedWidth,
    height: placedHeight,
    rotation: placement?.rotation || 0,
  };
  const box =
    layout?.width > 8 &&
    layout?.height > 8 &&
    layout.x > 0 &&
    layout.x < frameWidth &&
    layout.y > 0 &&
    layout.y < frameHeight
      ? layout
      : placedBox;

  if (!uri) {
    return null;
  }

  return (
    <View
      ref={rootRef}
      collapsable={false}
      pointerEvents="box-none"
      style={styles.overlay}
      onLayout={measureFrame}>
      {selected ? (
        <Pressable style={styles.dismissLayer} onPress={onDeselect} />
      ) : null}
      <View
        style={[
          styles.logoBox,
          {
            left: box.x - box.width / 2,
            top: box.y - box.height / 2,
            width: box.width,
            height: box.height,
            transform: [{rotate: `${box.rotation || 0}deg`}],
          },
        ]}>
        <Pressable
          disabled={selected}
          onPress={onSelect}
          style={{width: box.width, height: box.height}}
          {...(selected ? dragResponder.panHandlers : {})}>
          <Image
            source={{uri}}
            style={{width: box.width, height: box.height}}
            resizeMode="contain"
          />
        </Pressable>
        {selected ? (
          <>
            <View pointerEvents="none" style={styles.selectionBorder} />
            <View pointerEvents="none" style={styles.rotateStem} />
            <View
              style={styles.rotateHandle}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              {...rotateResponder.panHandlers}
            />
            {HANDLE_KEYS.map((handleKey, index) => (
              <View
                key={handleKey}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                style={[styles.handle, styles[handleKey]]}
                {...resizeResponders[index].panHandlers}
              />
            ))}
          </>
        ) : null}
      </View>
    </View>
  );
};

export default ProductLogoEditor;
