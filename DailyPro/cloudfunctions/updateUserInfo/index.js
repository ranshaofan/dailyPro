// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const { avatarUrl, nickName } = event

  try {
    // 先查找用户是否已经存在
    const userRecord = await db.collection('userInfo').where({
      _openid: wxContext.OPENID
    }).get()

    if (userRecord.data && userRecord.data.length > 0) {
      // 用户记录存在，更新记录
      const userId = userRecord.data[0]._id
      await db.collection('userInfo').doc(userId).update({
        data: {
          avatarUrl: avatarUrl,
          nickName: nickName
        }
      })
    } else {
      // 用户记录不存在，添加新记录
      const addResult = await db.collection('userInfo').add({
        data: {
          avatarUrl: avatarUrl,
          nickName: nickName,
          _openid: wxContext.OPENID
        }
      })
      return {
        success: true,
        _id: addResult._id
      }
    }

    return {
      success: true
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}
