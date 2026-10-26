import {Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

const toFilePath = filePath => String(filePath || '').replace(/^file:\/\//, '');

export const getShareFileUrl = filePath =>
  String(filePath || '').startsWith('file://') ? filePath : `file://${filePath}`;

// Android's PDF library names temp files with a random number. The share
// sheet can only read the app cache, so copy the PDF there under the real name.
export const saveNamedCachePdf = async (sourcePath, fileName) => {
  if (Platform.OS !== 'android') {
    return sourcePath;
  }

  const destination = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}.pdf`;
  const source = toFilePath(sourcePath);

  if (await ReactNativeBlobUtil.fs.exists(destination)) {
    await ReactNativeBlobUtil.fs.unlink(destination);
  }

  await ReactNativeBlobUtil.fs.cp(source, destination);

  return destination;
};
