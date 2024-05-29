const cloud = require('wx-server-sdk');

cloud.init();

exports.main = async (event, context) => {
  try {
    const { data } = await cloud.getFileList({
      dir: 'cloud://record-database-4gmgag5a6d5ccfe0.7265-record-database-4gmgag5a6d5ccfe0-1302276498/icon/'
    });
    const fileList = data.fileList.map(file => file.fileID);

    const result = await cloud.getTempFileURL({
      fileList: fileList
    });
    return {
      fileList: result.fileList
    };
  } catch (err) {
    return err;
  }
};
