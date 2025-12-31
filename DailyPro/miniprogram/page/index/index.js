// page/index/index.js
const util = require('../../util/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    helloPic: 'sun',
    checkItems: [], // 存放打卡数据,
    inputMode: 'voice', // 'voice' 或 'text'
    isRecording: false,
    showModal:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let today = util.getTodayDateString();
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
      sayhello,today,
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
    // 每次回到首页都刷新数据
    this.refreshCheckList();
  },
  refreshCheckList() {
    const list = app.globalData.todayCheckList || [];
    this.setData({ checkItems: list });
  },

  // 首页快速打卡切换逻辑
  async onToggleStatus(e) {
    let that = this;
    const flagId = e.currentTarget.dataset.id;
    const { checkItems } = this.data;
    const index = checkItems.findIndex(item => item.flagId === flagId);
    
    if (index === -1) return;

    // 1. UI 乐观更新
    const targetItem = checkItems[index];
    const newStatus = !targetItem.isOpen;
    const updateKey = `checkItems[${index}].isOpen`;
    this.setData({ [updateKey]: newStatus });
    
    // 2. 震动反馈
    wx.vibrateShort({ type: 'light' });

    // 3. 同步到云端 (逻辑同 category.js)
    try {
      const db = wx.cloud.database();
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      
      const res = await db.collection('dayFlags').where({ date: todayStr }).get();
      if (res.data.length > 0) {
        const docId = res.data[0]._id;
        const updatedList = [...this.data.checkItems];
        
        await db.collection('dayFlags').doc(docId).update({
          data: { checkList: updatedList }
        });
        
        // 同步全局，确保分类页数据一致
        app.globalData.todayCheckList = updatedList;
      }
    } catch (err) {
      console.error("更新失败", err);
      that.refreshCheckList(); // 失败则回滚
    }
  },
  toggleInputMode() {
    this.setData({
      inputMode: this.data.inputMode === 'voice' ? 'text' : 'voice'
    });
    wx.vibrateShort({ type: 'light' });
  },

  startRecording() {
    this.setData({ isRecording: true });
    wx.vibrateShort({ type: 'medium' });
  },

  stopRecording() {
    this.setData({ isRecording: false });
  },

  // 显示弹窗
  onAddTimeline() {
    this.setData({ showModal: true });
  },
  
  // 隐藏弹窗
  hideModal() {
    this.setData({ showModal: false });
  },
  
  // 阻止冒泡
  stopBubble() {
    return;
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