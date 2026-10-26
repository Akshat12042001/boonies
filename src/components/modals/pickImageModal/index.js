import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {pick} from '@react-native-documents/picker';
import styles from './styles';
import { GalleryIcon, UploadIcon} from '../../svgs';
import {COLORS} from '../../../constants';

const PickImageBottomModal = ({
  title,
  isVisible,
  onSelect,
  onCloseModal,
  acceptOnlyImage = false,
  imageDetails,
}) => {
  const pickCallback = data => {
    if (!data?.didCancel && !data?.errorCode) {
      onCloseModal();

      const response = {
        name: data?.assets[0]?.fileName,
        type: data?.assets[0]?.type,
        uri: data?.assets[0]?.uri,
      };
      onSelect?.(response);
      imageDetails?.(data?.assets);
    }
  };

  const handleCamera = async () => {
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        quality: 1,
      });
      pickCallback(response);
    } catch {
      // The picker reports its own cancel and permission errors.
    }
  };

  const handleGallery = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });
      pickCallback(response);
    } catch {
      // The picker reports its own cancel and permission errors.
    }
  };

  const handleDocumentPick = async () => {
    try {
      const [document] = await pick({
        type: ['image/jpeg', 'image/png', 'image/webp'],
      });

      if (!document?.uri) {
        return;
      }

      onCloseModal();
      onSelect?.({
        type: document.type,
        name: document.name,
        uri: document.uri,
      });
      imageDetails?.([document]);
    } catch {
      // Dismissing the document picker rejects the promise.
    }
  };

  const BTN = [
    {
      title: 'Gallery',
      onPress: handleGallery,
      icon: <GalleryIcon color={COLORS.PRIMARY} />,
    },
    {
      title: 'File manager',
      onPress: handleDocumentPick,
      icon: <UploadIcon color={COLORS.PRIMARY} />,
    },
  ];

  return (
    <View>
      <Modal
        style={styles.modal}
        isVisible={isVisible}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating={true}>
        <TouchableWithoutFeedback onPress={() => onCloseModal()}>
          <View style={styles.modal} />
        </TouchableWithoutFeedback>
        <View style={styles.container}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title ? title : 'Select a file'}</Text>
          </View>
          <View style={styles.btnContainer}>
            {BTN.map((item, index) => {
              return (
                <View style={styles.center} key={`${item.title}${index}`}>
                  <TouchableOpacity onPress={item.onPress}>
                    <View style={styles.iconContainer}>{item.icon}</View>
                  </TouchableOpacity>
                  <View style={styles.textContainer}>
                    <Text style={styles.text}>{item.title}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PickImageBottomModal;