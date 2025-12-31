// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const today = event.todayStr; // 由前端传如 "2023-10-27" 格式

  try {
    // 1. 检查今日是否已初始化
    const checkRes = await db.collection('dayflags')
      .where({ _openid: OPENID, day: today }).get()

    if (checkRes.data.length > 0) {
      return { success: true, msg: '今日已初始化' }
    }

    // 2. 获取该用户 flags 集合中所有启用的打卡项
    const flagsRes = await db.collection('flags')
      .where({ _openid: OPENID, status: true }).get()

    if (flagsRes.data.length === 0) {
      return { success: true, msg: '没有需要初始化的打卡项' }
    }

    // 3. 批量写入 dayflags
    const tasks = flagsRes.data.map(item => {
      return db.collection('dayflags').add({
        data: {
          _openid: OPENID,
          flagId: item._id,     // 关联 ID
          name: item.name,       // 冗余名称方便显示
          iconName: item.iconName, // 冗余图标方便显示
          day: today,
          ifCheck: false,
          checkTime: null
        }
      })
    })

    await Promise.all(tasks)
    return { success: true, msg: '初始化完成' }
  } catch (e) {
    return { success: false, err: e }
  }
}