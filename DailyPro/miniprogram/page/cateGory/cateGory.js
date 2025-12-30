// page/cateGory/cateGory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: true,
    categoryName: '阅读',
    selectedIcon: 'icon-domain', // 对应你之前的 SVG 类名
    selectedColor: '#E2F0CB',
    icons: [
      { name: '阅读', class: 'icon-book' },
      { name: '健身', class: 'icon-run' }
      // ... 补全之前整理的那些图标类名
    ],
    colors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F1F5F9']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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
  selectIcon(e) {
    this.setData({ selectedIcon: e.currentTarget.dataset.icon });
  },
  
  selectColor(e) {
    this.setData({ selectedColor: e.currentTarget.dataset.color });
  },
  
  onCancel() {
    this.setData({ show: false });
  }

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