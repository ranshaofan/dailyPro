// import CustomPage from './base/CustomPage'
import { dateFormat, initCalendar, loginIn, refreshEventsAndSlots, getSlotsData, getEventsData } from '../../util/util'

const app = getApp();
const db = wx.cloud.database();//获取数据库引用
Page({
  onShareAppMessage() {
    return {
      title: '时间录入',
      path: 'page/task/task'
    }
  },
  data: {
    Type_Pic: { "娱乐": "phoneG", "工作": "phoneG" },//type和图片对应的数据表
    ifTime: 0,
    ifEvent: 1,
    calendar: [],
    typeInfo: [],
    evaluation: [],
    valueEventIndex: 0,
    typeEventIndex: 0,
    currentDate: '2024-5-20',
    sdate: dateFormat('yyyy-MM-dd', new Date()),
    edate: dateFormat('yyyy-MM-dd', new Date()),
    cLChosen: "",
    events: [{ eventtime: '2024-5-20', name: '喝咖啡', type: '饮食', notes: '不应该', evaluation: '普通', inittime: '', userid: '', index: 1, conLeft: 0 }],
    // events:[{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:1,cost:200,conLeft:0},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:2,cost:200,conLeft:0},{type:"娱乐",con:"Today",pic:"../common/img/phoneG.png",index:3,cost:20,conLeft:0}],
    today: dateFormat('yyyy-MM-dd', new Date()),
    timePicker: null,
    dlgStTime: "08:00",
    dlgEtTime: "08:00",
    addTimeDlgShow: 0,
    addEventDlgShow: 0,
    startX: 0,//滑动时的起始坐标
    typeArr: ["娱乐", "工作", "学习", "饮食"],
    jugeArr: ["优秀", "普通", "差劲"],
    contents: [],
    inputValue: "",
    inputCon: "",
    inputName: "",
    inputNum: "",
    userInfo: { balanceAmount: 3000, limitAmount: 1000 },
    curEvent: { name: '', type: '', notes: '', juge: '' },

    slots: [],
    typeIndex: 0,
    typeNames: ["1", "2"],
    loading:1,
  },
  changePageTask() {
    var that = this;
    this.setData({
      ifTime: 1,
      ifEvent: 0
    });
  },
  changePageCost() {
    var that = this;
    this.setData({
      ifTime: 0,
      ifEvent: 1
    });
  },
  onTimeStartChange(e) {
    this.setData({
      dlgStTime: e.detail.value
    })
  },
  onTimeEndChange(e) {
    this.setData({
      dlgEtTime: e.detail.value
    })
  },
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
  onEventValueChange(e) {
    this.setData({
      valueEventIndex: e.detail.value
    })
  },
  onTypeEventChange(e) {
    this.setData({
      typeEventIndex: e.detail.value
    })
  },
  onLoad() {
    var cs = initCalendar();
    this.setData({
      calendar: cs.calendar,
      loading:1,
      cLChosen: cs.cLChosen,
      events: app.globalData.events,
      evaluation: app.globalData.evaluation,
      typeInfo: app.globalData.typeInfo
    })
    if (app.globalData.userInfo && app.globalData.userInfo.avatarUrl) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
  onShow() {
    // refreshEventsAndSlots();
    const typeNames = app.globalData.typeInfo.map(item => item.typeName);
    typeNames.unshift("全部");
    this.setData({
      events: app.globalData.events,
      slots: app.globalData.slots,
      typeInfo: app.globalData.typeInfo,
      evaluation: app.globalData.evaluation,
      typeNames
    });
    this.findAlls();
  },
  findAlls() {
    this.setData({
      loading:1
    });
    var that = this;
    var typeName = this.data.typeNames[that.data.typeIndex];//类别
    var keywords = this.data.inputName;//关键词
    var sdate = this.data.sdate;//开始日期
    var edate = this.data.edate;//结束日期
    if (this.data.ifTime) {//查询slots时间
      getSlotsData(app.globalData.userInfo._openid).then(data => {
        //获取到当前user_id的data以后进行过滤
        var slotsData = data.filter(item => {
          var Ttime = new Date(item.datetime).getTime();
          var st = new Date(sdate).getTime();
          var et = new Date(edate).getTime();
          var timeIf = (Ttime >= st && Ttime <= et);
          return timeIf && (typeName == "全部" || typeName == item.type) && (!keywords || item.con.indexOf(keywords) > -1);
        });
        refreshEventsAndSlots({events:that.data.events,slots:slotsData});
        that.setData({
          slots: slotsData,
          loading:0
        });
      }).catch(err => {
        console.error('刷新数据失败:', err);
      });
    } else {
      //查询events事件
      getEventsData(app.globalData.userInfo._openid).then(data => {
        //获取到当前user_id的data以后进行过滤
        var eventsData = data.filter(item => {
          var Ttime = new Date(item.eventtime).getTime();
          var st = new Date(sdate).getTime();
          var et = new Date(edate).getTime();
          var timeIf = (Ttime >= st && Ttime <= et);
          return timeIf && (typeName == "全部" || typeName == item.type) && (!keywords || item.notes.indexOf(keywords) > -1 || item.name.indexOf(keywords) > -1);
        });
        eventsData.sort((a, b) => {
          const timeA = new Date(a.datetime).getTime();
          const timeB = new Date(b.datetime).getTime();
          return timeA - timeB;
        });
        refreshEventsAndSlots({events:eventsData,slots:that.data.slots});
        that.setData({
          events: eventsData,
          loading:0
        });
      }).catch(err => {
        console.error('刷新数据失败:', err);
      });
    }
  },
  correctTime(time) {
    let [hours, minutes] = time.split(':').map(Number);
    while (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  },
  //addDlg弹框的input事件
  onInput(event) {
    var type = event.currentTarget.dataset.type;
    if (type == "costNum") {
      this.data.inputNum = event.detail.value;
    } else if (type == "eventCon") {
      this.data.inputCon = event.detail.value;
    } else if (type == "eventName") {
      this.data.inputName = event.detail.value;
    } else if (type == "keywords") {
      this.data.inputName = event.detail.value;
    } else {
      this.data.inputValue = event.detail.value;
    }
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
    var type = e.currentTarget.dataset.type;
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
      var list = type=="events"?that.data.events:that.data.slots;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      if(type=="events"){
        this.setData({
          events: list
        });
      }else{
        this.setData({
          slots: list
        });
      }
    }
  },
  conTouchE: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
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
      var list = type=="events"?that.data.events:that.data.slots;
      //将拼接好的样式设置到当前item中
      list[index].conLeft = left;
      // //更新列表的状态
      if(type=="events"){
        this.setData({
          events: list
        });
      }else{
        this.setData({
          slots: list
        });
      }
    }
  },
  costDelete(e) {//删除按钮
    var that = this;
    var type = e.currentTarget.dataset.type;
    var index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除该项吗？',
      success(res) {
        if (res.confirm) {
          if(type=="events"){
            var delArr = that.data.events.splice(index, 1);
            that.setData({
              events: that.data.events
            });
            db.collection('events').where({
              _id: delArr[0]._id
            }).remove({
              success: function (res) {
                //删除app.globaldata中的数据
                app.globalData.events = app.globalData.events.filter(event => event._id !== delArr[0]._id);
              }
            });
          }else{
            var delArr = that.data.slots.splice(index, 1);
            that.setData({
              slots: that.data.slots
            });
            db.collection('slots').where({
              _id: delArr[0]._id
            }).remove({
              success: function (res) {
                //删除app.globaldata中的数据
                app.globalData.slots = app.globalData.slots.filter(event => event._id !== delArr[0]._id);
              }
            });
          }
        } else if (res.cancel) {
          // wx.showToast({
          //   title: '已取消删除',
          //   icon: 'none'
          // });
        }
      }
    });
  },
  //悬浮addDLg确定按钮的click
  addDlgBtn(event) {
    var that = this;
    var type = event.currentTarget.dataset.type;
    if (type == "task") {
      var st = this.data.dlgStTime;
      var et = this.data.dlgEtTime;
      var type = this.data.typeArr[this.data.typeIndex];
      var con = this.data.inputValue;
      var cons = this.data.tasks;
      this.data.tasks.push({ st, et, type, con, id: cons.length, conLeft: 0, i: cons.length % 3 });
      app.globalData.todayTasks = cons;
      this.setData({
        addTimeDlgShow: 0,
        tasks: cons
      });
    } else {//event
      var type = this.data.typeArr[this.data.typeIndex];
      var notes = this.data.inputCon;
      var name = this.data.inputName;
      var evaluation = this.data.jugeArr[this.data.jugeIndex];
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
          user_id: app.globalData.userInfo._id,
          eventtime: eventtime
        },
        success: res => {
          var events = db.collection('events');
          events.get().then(res => {
            if (res.data) {
              app.globalData.events = res.data;
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
  showAddTimeDlg() {
    this.setData({
      addTimeDlgShow: 1,
      addEventDlgShow: 0
    });
  },
  showAddEventDlg() {
    if (JSON.stringify(app.globalData.userInfo) == "{}") {
      loginIn();
    } else {
      this.setData({
        addTimeDlgShow: 0,
        addEventDlgShow: 1
      });
    }
  },
  closeAddDlg(event) {
    this.setData({
      addTimeDlgShow: 0,
      addEventDlgShow: 0
    });
  },
  handleLongPress(event) {
    //长按某一个task 在对应位置出现删除标签
    const { pageX, pageY } = event.touches[0];
    this.setData({
      isLongPress: true,
      scale: 1.1,
      pageX,
      pageY,
      key: event.currentTarget.dataset.index
    });

    wx.vibrateShort(); // 触发震动效果
  },
  clickTask: function (event) {
    this.setData({
      isLongPress: false,
      scale: 1,
      key: event.currentTarget.dataset.index
    });
  },
  taskDelete: function () {
    console.log(this.data.key);
    this.data.tasks.splice(this.data.key, 1)
    this.setData({
      tasks: this.data.tasks,
      isLongPress: false,
      scale: 1
    });
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

  // handleTouchMove(event) {
  //   if (!this.data.isLongPress) {
  //     return;
  //   }

  //   const { pageX, pageY } = event.touches[0];
  //   const translateX = pageX - this.data.startX;
  //   const translateY = pageY - this.data.startY;

  //   this.setData({
  //     translateX,
  //     translateY
  //   });
  // },

  // handleTouchEnd() {
  //   if (!this.data.isLongPress) {
  //     return;
  //   }
  //   this.setData({
  //     isLongPress: false,
  //     scale:1
  //   });
  // }
})
