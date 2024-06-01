const app = getApp();
const db = wx.cloud.database(); // 获取数据库引用

Page({
  data: {
    icons: [],
    inputValue:"",
    selectedIcon: "../common/icon/a-addmusic.png"
  },

  onLoad: function () {
      this.setData({
        icons:app.globalData.iconNames
      });
  },
  iconClick: function(event) {
    const iconPath = event.currentTarget.dataset.icon;
    this.setData({
      selectedIcon: `../common/icon/${iconPath}`
    });
  },
  onInput(event) {
      this.setData({
        inputValue: event.detail.value
      });
  },
  saveType:function(){
    var pic = this.data.selectedIcon;
    var typeName = this.data.inputValue;
    if(!typeName){return;}
    db.collection('typeInfo').add({
      data: {
        pic,
        typeName,
        isTrue:"1",
        user_id: app.globalData.userInfo._openid
      },
      success: res => {
        var typeInfo = db.collection('typeInfo');
        slots.where({
          user_id:app.globalData.userInfo._openid
        }).get().then(res => {
          if (res.data) {
            app.globalData.typeInfo = res.data;
            
          }
        }).catch(err => {
          console.error('查询失败:', err);
        });
      }
    })
  },
  onUnload:function(){
    // var pic = this.data.selectedIcon;
    // var typeName = this.data.inputValue;
    // if(!typeName){return;}
    // db.collection('typeInfo').add({
    //   data: {
    //     pic,
    //     typeName,
    //     isTrue:"1",
    //     user_id: app.globalData.userInfo._openid
    //   },
    //   success: res => {
    //     var typeInfo = db.collection('typeInfo');
    //     slots.where({
    //       user_id:app.globalData.userInfo._openid
    //     }).get().then(res => {
    //       if (res.data) {
    //         app.globalData.typeInfo = res.data;
            
    //       }
    //     }).catch(err => {
    //       console.error('查询失败:', err);
    //     });
    //   }
    // })
  }
});
