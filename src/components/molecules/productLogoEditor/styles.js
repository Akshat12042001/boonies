import {StyleSheet} from 'react-native';

const HANDLE_COLOR = '#3B82F6';

export default StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  logoBox: {
    elevation: 4,
    position: 'absolute',
    zIndex: 4,
  },
  logoImage: {
    height: '100%',
    width: '100%',
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderColor: HANDLE_COLOR,
    borderWidth: 1.5,
  },
  rotateStem: {
    backgroundColor: HANDLE_COLOR,
    height: 18,
    left: '50%',
    marginLeft: -0.75,
    position: 'absolute',
    top: -18,
    width: 1.5,
  },
  rotateHandle: {
    backgroundColor: '#FFFFFF',
    borderColor: HANDLE_COLOR,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 16,
    left: '50%',
    marginLeft: -8,
    position: 'absolute',
    top: -34,
    width: 16,
  },
  handle: {
    backgroundColor: '#FFFFFF',
    borderColor: HANDLE_COLOR,
    borderWidth: 1.5,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    position: 'absolute',
    width: 10,
  },
  handleTopLeft: {
    left: 0,
    top: 0,
  },
  handleTop: {
    left: '50%',
    top: 0,
  },
  handleTopRight: {
    left: '100%',
    top: 0,
  },
  handleRight: {
    left: '100%',
    top: '50%',
  },
  handleBottomRight: {
    left: '100%',
    top: '100%',
  },
  handleBottom: {
    left: '50%',
    top: '100%',
  },
  handleBottomLeft: {
    left: 0,
    top: '100%',
  },
  handleLeft: {
    left: 0,
    top: '50%',
  },
});
