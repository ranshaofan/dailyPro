// page/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    helloPic: 'sun'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const currentHour = new Date().getHours();
    let sayhello;
    let helloPic = "";
    if (currentHour < 12) {
      sayhello = "早上好呀~";
      helloPic = "sun";
    } else if (currentHour < 19) {
      sayhello = "下午好呀~";
      helloPic = "afternoon";
    } else {
      sayhello = "晚上好呀~";
      helloPic = "moon";
    }
    this.setData({
      sayhello,
      helloPic
      // currentDate: dateFormat('MM月dd日', new Date())
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})