// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 获取数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { dataToUpdate, id } = event

  try {
    const res = await db.collection('typeInfo').doc(id).update({
      data: dataToUpdate
    })
    console.log('更新数据成功:', res)
    return res
  } catch (err) {
    console.error('更新数据失败:', err)
    return err
  }
}
