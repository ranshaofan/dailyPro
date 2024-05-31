import { dateFormat, initCalendar, refreshEventsAndSlots, formatValueTime, getSlotsData, getEventsData } from '../../util/util'
const app = getApp();
const db = wx.cloud.database();//获取数据库引用
Page({
  data: {
    calendar: [],
    // slots: [{ type: "娱乐", con: "Today", pics: ["../common/img/phone.png", "../common/img/puke.png", "../common/img/phoneG.png"], index: 1 }, { type: "娱乐", con: "Today", pics: [], index: 2 }, { type: "娱乐", con: "Today", pics: [], index: 3 }],
    events: [{ eventtime: '2024-5-20', name: '喝咖啡', type: '饮食', notes: '不应该', evaluation: '普通', inittime: '', userid: '', index: 1, conLeft: 0 }],
    cLChosen: "",
    nickName: "",
    sayhello: "",
    helloPic: 'sun',
    evaluation: [],
    typeInfo: [],
    startX: 0,
    currentDate: '2024-5-20',
    sdate: '2024-5-20',
    edate: '2024-5-20',
    addTimeDlgShow: 0,
    addEventDlgShow: 0,
    typeIndex: 0,
    jugeIndex: 0,
    typeNames: [],
    // jugeArr: ["优秀", "普通", "差劲"],
    contents: [],
    inputValue: "",
    inputCon: "",
    inputName: "",
    inputNum: "",
    //时间
    slots: [],
    // slots: [{ type: "Work", con: "that's all bullshit", st: "11:00", et: "12:00",datetime:'2024-5-20' }, { type: "Work", con: "that's all bullshit", st: "11:00", et: "12:00",datetime:'2024-5-20' },{ type: "Work", con: "that's all bullshit", st: "11:00", et: "12:00",datetime:'2024-5-20' }],
    dlgStTime: "08:00",
    dlgEtTime: "08:00",
    isToday: 1,
    loading:1,
  },
  onLoad() {
    var cs = initCalendar();
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
      calendar: cs.calendar,
      cLChosen: cs.cLChosen,
      sayhello,
      helloPic,
      isToday: 1,
      currentDate: dateFormat('yyyy-MM-dd', new Date())
    });

  },
  onShow() {
    const that = this;
    if (JSON.stringify(app.globalData.userInfo) != "{}") {
      //先获取数据
      refreshEventsAndSlots();
      const typeNames = app.globalData.typeInfo.map(item => item.typeName);
      this.setData({
        events: app.globalData.events,
        slots: app.globalData.slots,
        typeInfo: app.globalData.typeInfo,
        evaluation: app.globalData.evaluation,
        typeNames,
        loading:0
      })
      if (JSON.stringify(app.globalData.userInfo) != "{}" && app.globalData.userInfo.nickName) {
        this.setData({
          nickName: app.globalData.userInfo.nickName
        });
      }
    } else {
      app.dataReadyCallback = function () {
        refreshEventsAndSlots();
        const typeNames = app.globalData.typeInfo.map(item => item.typeName);
        that.setData({
          events: app.globalData.events,
          slots: app.globalData.slots,
          typeInfo: app.globalData.typeInfo,
          evaluation: app.globalData.evaluation,
          typeNames,
          loading:0
        });
        if (JSON.stringify(app.globalData.userInfo) != "{}") {
          that.setData({
            nickName: app.globalData.userInfo.nickName
          });
        }
      }
    }
  },
  addDlgBtn(event) {
    var that = this;
    var type = event.currentTarget.dataset.type;
    if (type == "slots") {//时间
      var st = this.data.dlgStTime;
      var et = this.data.dlgEtTime;
      var type = this.data.typeNames[this.data.typeIndex];
      var con = this.data.inputValue;
      var datetime = this.data.currentDate;
      if (Number(et.split(":")[0]) < Number(st.split(":")[0])) {
        wx.showToast({ title: '结束时间不应小于开始时间', icon: 'none' });
        return;
      }
      //向数据库中添加数据
      db.collection('slots').add({
        data: {
          type: type,
          con: con,
          stime: st,
          etime: et,
          user_id: app.globalData.userInfo._openid,
          datetime: dateFormat('yyyy-MM-dd', new Date(datetime))
        },
        success: res => {
          var slots = db.collection('slots');
          slots.where({
            datetime: that.data.currentDate,
            user_id: app.globalData.userInfo._openid
          }).get().then(res => {
            if (res.data) {
              app.globalData.slots = res.data;
              refreshEventsAndSlots();
              that.setData({
                slots: res.data,
                addTimeDlgShow: 0
              });
            }
          }).catch(err => {
            console.error('查询失败:', err);
            that.setData({
              addTimeDlgShow: 0
            });
          });
        }
      })
      // this.setData({
      //   addTimeDlgShow: 0,
      //   slots: cons
      // });
    } else {//event
      var type = this.data.typeNames[this.data.typeIndex];
      var notes = this.data.inputCon;
      var name = this.data.inputName;
      var evaluation = this.data.evaluation[this.data.jugeIndex];
      var eventtime = this.data.currentDate;
      // this.data.events.push({ type, cost,pic,con, id: list.length,conLeft:0,i:list.length%3 });
      // app.globalData.todayCost = list;
      // this.setData({
      //   addEventDlgShow: 0,
      //   events: list
      // });
      // console.log(list);

      //向数据库中添加数据
      db.collection('events').add({
        data: {
          type: type,
          notes: notes,
          name: name,
          evaluation: evaluation,
          user_id: app.globalData.userInfo._openid,
          eventtime: dateFormat('yyyy-MM-dd', new Date(eventtime))
        },
        success: res => {
          var events = db.collection('events');
          events.where({
            eventtime: that.data.currentDate,
            user_id: app.globalData.userInfo._openid
          }).get().then(res => {
            if (res.data) {
              app.globalData.events = res.data;
              refreshEventsAndSlots();
              that.setData({
                events: res.data,
                addEventDlgShow: 0
              });
            }
          }).catch(err => {
            console.error('查询失败:', err);
            that.setData({
              addEventDlgShow: 0
            });
          });
        }
      })
    }
  },
  closeAddDlg(event) {
    this.setData({
      addTimeDlgShow: 0,
      addEventDlgShow: 0
    });
  },
  //addDlg弹框的input事件
  onInput(event) {
    var type = event.currentTarget.dataset.type;
    if (type == "slotCon") {
      this.data.inputValue = event.detail.value;
    } else if (type == "eventCon") {
      this.data.inputCon = event.detail.value;
    } else if (type == "eventName") {
      this.data.inputName = event.detail.value;
    } else {
      this.data.inputValue = event.detail.value;
    }
  },
  //时间弹框事件
  onTimeStartBlur: function (e) {
    var val = e.detail.value;
    var formattedVal = formatValueTime(val);
    if (formattedVal == "error") {
      wx.showToast({ title: '无效时间', icon: 'none' });
      this.setData({ dlgStTime: '06:00' }); // 设置为默认值
    } else {
      this.setData({ dlgStTime: formattedVal });
    }
  },

  onTimeEndBlur: function (e) {
    var val = e.detail.value;
    var formattedVal = formatValueTime(val);
    if (formattedVal == "error") {
      wx.showToast({ title: '无效时间', icon: 'none' });
      this.setData({ dlgEtTime: '23:59' }); // 设置为默认值
    } else {
      this.setData({ dlgEtTime: formattedVal });
    }
  },
  // onTimeStartChange(e) {
  //   this.setData({
  //     dlgStTime: e.detail.value
  //   })
  // },
  // onTimeEndChange(e) {
  //   this.setData({
  //     dlgEtTime: e.detail.value
  //   })
  // },
  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  onJugeChange(e) {
    this.setData({
      jugeIndex: e.detail.value
    })
  },
  canlenChosen: function (event) {
    this.setData({
      loading:1
    });
    var that = this;
    var index = event.currentTarget.dataset.index;
    var day = event.currentTarget.dataset.day;
    var isToday = dateFormat('yyyy-MM-dd', new Date()) == dateFormat('yyyy-MM-dd', new Date(day)) ? 1 : 0;
    let calendar = this.data.calendar.map(item => {
      item.classChosen = item.index === index ? 'chosen' : '';
      return item;
    });
    //查询events
    db.collection('events').where({
      eventtime: day,
      user_id: app.globalData.userInfo._openid
    }).get().then(res => {
      if (res.data) {
        app.globalData.events = res.data;
        refreshEventsAndSlots();
        that.setData({
          events: res.data,
          loading:0
        });
      }
    }).catch(err => {
      console.error('查询失败:', err);
    });
    //查询slots
    db.collection('slots').where({
      datetime: day,
      user_id: app.globalData.userInfo._openid
    }).get().then(res => {
      if (res.data) {
        app.globalData.slots = res.data;
        refreshEventsAndSlots();
        that.setData({
          slots: res.data,
          loading:0
        });
      }
    }).catch(err => {
      console.error('查询失败:', err);
    });
    // 更新数据到前端
    that.setData({
      calendar: calendar,
      currentDate: day,
      isToday,
      cLChosen: 'cL' + index,
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
      var list = that.data.events;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.events = list;
      this.setData({
        events: list
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
      var list = that.data.events;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      app.globalData.events = list;
      this.setData({
        events: list
      });
    }
  },
  costDelete(e) {//删除按钮
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该项吗？',
      success(res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          var delArr = that.data.events.splice(index, 1);
          app.globalData.events = that.data.events;
          that.setData({
            events: that.data.events
          });
          db.collection('events').where({
            _id: delArr[0]._id
          }).remove({
            success: function (res) {
            }
          });
        } else if (res.cancel) {
          // wx.showToast({
          //   title: '已取消删除',
          //   icon: 'none'
          // });
        }
      }
    });
  },
  delSlot: function (e) {
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该项吗？',
      success(res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          var delArr = that.data.slots.splice(index, 1);
          app.globalData.slots = that.data.slots;
          that.setData({
            slots: that.data.slots
          });
          db.collection('slots').where({
            _id: delArr[0]._id
          }).remove({
            success: function (res) {
            }
          });
        } else if (res.cancel) {
          
        }
      }
    });
  },
  //时间
  showAddTimeDlg() {
    if (JSON.stringify(app.globalData.userInfo) == "{}") {
      loginIn();
      this.setData({
        nickName: app.globalData.userInfo.nickName
      });
    } else {
      this.setData({
        addTimeDlgShow: 1,
        addEventDlgShow: 0,
        nickName: app.globalData.userInfo.nickName
      });
    }
  },
  showAddEventDlg() {
    if (JSON.stringify(app.globalData.userInfo) == "{}") {
      loginIn();
      this.setData({
        nickName: app.globalData.userInfo.nickName
      });
    } else {
      this.setData({
        addTimeDlgShow: 0,
        addEventDlgShow: 1,
        nickName: app.globalData.userInfo.nickName
      });
    }
  },
  onDateChange: function (e) {
    this.setData({
      currentDate: e.detail.value
    });
  },
  onSDateChange: function (e) {
    this.setData({
      sdate: e.detail.value
    });
  },
  onEDateChange: function (e) {
    this.setData({
      edate: e.detail.value
    });
  }
})