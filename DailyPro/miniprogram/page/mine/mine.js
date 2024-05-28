const app = getApp();
const db = wx.cloud.database(); // 获取数据库引用

Page({
  data: {
    userInfo: { avatarUrl: "./resources/img/login.png", nickName: "未登录" },
    inputAmount: '', // 用于存储输入的月余额
    dlgObj: { txt: "请设置月余额：", inputtxt: "请输入月余额" },
    avatarUrl: './resources/img/login.png'
  },
  
  onLoad() {
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  onShow() {
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  onChooseAvatar(e) {
    var avatarUrl = e.detail.avatarUrl ;
    console.log(avatarUrl);
    this.data.userInfo.avatarUrl = avatarUrl;
    this.setData({
      avatarUrl,
      userInfo:this.data.userInfo
    })
    this.updateUserInfo({ avatarUrl: avatarUrl });
  },

  nicknameBlur(event) {
    const newNickname = event.detail.value;
    this.updateUserInfo({ nickName: newNickname });
  },

  updateUserInfo(dataToUpdate) {
    const userInfo = this.data.userInfo;
    const openid = app.globalData.openid; // 获取当前用户的 openid
    db.collection('userInfo').where({
      _openid: openid
    }).get({
      success: res => {
        const userRecord = res.data[0];
        if (!userRecord) {
          // 如果userInfo中没有记录，则创建一条
          db.collection('userInfo').add({
            data: {
              ...userInfo,
              ...dataToUpdate
            },
            success: res => {
              // 更新成功后更新页面数据
              this.setData({
                userInfo: { ...userInfo, ...dataToUpdate }
              });
            },
            fail: console.error
          });
        } else {
          // 如果有记录，则更新对应字段
          db.collection('userInfo').doc(userRecord._id).update({
            data: dataToUpdate,
            success: res => {
              // 更新成功后更新页面数据
              this.setData({
                userInfo: { ...userInfo, ...dataToUpdate }
              });
            },
            fail: console.error
          });
        }
      },
      fail: console.error
    });
  }
});
