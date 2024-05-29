const app = getApp();
const db = wx.cloud.database(); // 获取数据库引用

Page({
  data: {
    typeInfo: [
    ],
    startX: 0
  },

  onLoad() {
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo,
        typeInfo: app.globalData.typeInfo
      });
    }
  },

  onShow() {
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo,
        typeInfo: app.globalData.typeInfo
      });
    }
  },
  navigateBack() {
    wx.navigateBack({
      delta: 1  // 返回上一页
    });
  },
  toggleCheck(event) {
    var index = event.currentTarget.dataset.index;
    var typeInfo = this.data.typeInfo;
    typeInfo[index].isTrue = typeInfo[index].isTrue ? 0 : 1;
    this.updateTypeInfo({isTrue:typeInfo[index].isTrue},typeInfo[index]._id);
    this.setData({
      typeInfo
    });
  },
  onUnload() {
  },
  onblur(event){
    var index = event.currentTarget.dataset.index;
    var typeInfo = this.data.typeInfo;
    this.updateTypeInfo({typeName:event.detail.value},typeInfo[index]._id);
  },
  updateTypeInfo(dataToUpdate, id) {
    const index = this.data.typeInfo.findIndex(item => item._id === id);
    const typeInfo = this.data.typeInfo;
  
    db.collection('typeInfo').doc(id).update({
      data: dataToUpdate,
      success: res => {
        // 更新成功后更新页面数据
        typeInfo[index] = { ...typeInfo[index], ...dataToUpdate };
        this.setData({
          typeInfo: typeInfo
        });
      },
      fail: console.error
    });
  },
  //手指刚放到屏幕触发
  conTouchS: function (e) {
    //判断是否只有一个触摸点
    if (e.touches.length == 1) {
      this.setData({
        //记录触摸起始位置的X坐标
        startX: e.touches[0].clientX
      });
    }
  },
  //触摸时触发，手指在屏幕上每移动一次，触发一次
  conTouchM: function (e) {
    var that = this;
    if (e.touches.length == 1) {
      //记录触摸点位置的X坐标
      var moveX = e.touches[0].clientX;
      //计算手指起始点的X坐标与当前触摸点的X坐标的差值
      var disX = that.data.startX - moveX;
      //delBtnWidth 为右侧按钮区域的宽度
      var delBtnWidth = 58;
      var left = 0;
      if (disX == 0 || disX < 0) {//如果移动距离小于等于0，文本层位置不变
        left = 0;
      } else if (disX > 0) {//移动距离大于0，文本层left值等于手指移动距离
        left = disX * (-1);
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          left = delBtnWidth * (-1);
        }
      }
      //获取手指触摸的是哪一个item
      var index = e.currentTarget.dataset.index;
      var list = that.data.typeInfo;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.typeInfo = list;
      this.setData({
        typeInfo: list
      });
    }
  },
  conTouchE: function (e) {
    var that = this
    if (e.changedTouches.length == 1) {
      //手指移动结束后触摸点位置的X坐标
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = that.data.startX - endX;
      var delBtnWidth = 58;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth / 2 ? delBtnWidth * (-1) : 0;
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = that.data.typeInfo;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.typeInfo = list;
      this.setData({
        typeInfo: list
      });
    }
  },
  costDelete(e) {//删除按钮
    var index = e.currentTarget.dataset.index;
    var delArr = this.data.typeInfo.splice(index, 1);
    app.globalData.typeInfo = this.data.typeInfo;
    this.setData({
      typeInfo: this.data.typeInfo
    });
    db.collection('typeInfo').where({
      _id: delArr[0]._id
    }).remove({
      success: function (res) {
      }
    });
  },
});
