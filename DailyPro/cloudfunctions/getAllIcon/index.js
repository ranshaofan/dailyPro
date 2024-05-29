// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { filePath } = event
  try {
    console.log("hahaha");

    const result = await cloud.getTempFileURL({
      fileList: [{
        fileID: filePath,
      }]
    })

    const fileList = result.fileList[0].tempFileURL

    const fileNames = []

    const response = await cloud.downloadFile({
      fileID: fileList
    })
    console.log("hahaha");
    if (response.statusCode === 200) {
      const data = response.fileContent.toString()
      const lines = data.split('\n')

      for (const line of lines) {
        const match = line.match(/(\S+\.png)/)
        if (match) {
          fileNames.push(match[1])
        }
      }
    }

    return {
      success: true,
      data: fileNames,
    }
  } catch (err) {
    console.log(err)
    return {
      success: false,
      errorMessage: err.message,
    }
  }
}
