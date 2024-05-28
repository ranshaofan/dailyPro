const app = getApp();
const db = wx.cloud.database(); // 获取数据库引用

Page({
  data: {
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
  navigateBack() {
    wx.navigateBack({
      delta: 1  // 返回上一页
    });
  }
  
});
