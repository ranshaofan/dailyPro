
import { drawLine, drawTimeline, drawFan } from '../../util/util.js'
import { dateFormat, initCalendar, loginIn, refreshEventsAndSlots, getSlotsData, getEventsData } from '../../util/util'

const app = getApp()
Page({
  onShow() {
  },
  // onShareAppMessage() {
  //   // return {
  //   //   title: '分布图',
  //   //   path: 'page/home/home'
  //   // }
  // },
  // onShareTimeline() {
  //   '分布图'
  // },

  data: {
    ifTask:0,
    ifCost:1,
    array: ['选项1', '选项2', '选项3'],
    index: 0,
    title:"Task",
    sdate: dateFormat('yyyy-MM-dd', new Date()),
    edate: dateFormat('yyyy-MM-dd', new Date()),
  },

  onLoad() {
    // this.setData({
    //   theme: wx.getSystemInfoSync().theme || 'light'
    // })

    // if (wx.onThemeChange) {
    //   wx.onThemeChange(({ theme }) => {
    //     this.setData({ theme })
    //   })
    // }
    // this.listToTimeCanvas(app.globalData.todayTasks);
    // ctx.draw()

    // const ctx = wx.createCanvasContext('timeCanvas');

  },

  // kindToggle(e) {
  //   const id = e.currentTarget.id
  //   const list = this.data.list
  //   for (let i = 0, len = list.length; i < len; ++i) {
  //     if (list[i].id === id) {
  //       list[i].open = !list[i].open
  //     } else {
  //       list[i].open = false
  //     }
  //   }
  //   this.setData({
  //     list
  //   })
  //   wx.reportAnalytics('click_view_programmatically', {})
  // },
  onTimelineClick() {

  },
  //把list分类整体并且图形化
  listToTimeCanvas() {//list:[{starttime,endtime,type,con,id}]
    // list.sort(function(a,b){
    //   return new Date("2023-1-11 "+a.time) - new Date("2023-1-11 "+b.time);
    // });
    var list = app.globalData.todayTasks;
    console.log(list,"list");
    // 根据type分类统计 并且计算每一个type所用的总分钟数sumTime
    var gatherList = {};//{type:{sumTime,arr:[{},{}]},type2:{}}
    list.forEach(item => {
      if (gatherList[item.type]) {
        gatherList[item.type].arr.push(item);
        //计算当前耗时
        var min = (new Date("2023-1-11 " + item.et) - new Date("2023-1-11 " + item.st)) / 1000 / 60;
        gatherList[item.type].sumTime += min;
      } else {
        gatherList[item.type] = { sumTime: 0, arr: [] };
        gatherList[item.type].arr.push(item);
        //计算当前耗时
        var min = (new Date("2023-1-11 " + item.et) - new Date("2023-1-11 " + item.st)) / 1000 / 60;
        gatherList[item.type].sumTime += min;
      }
    });
    //根据gatherList计算每个type所占的角度
    var gCanvaslist = [];//[{type,ratio,color}]
    //首先计算全部的分钟数
    var allT = 0;
    for (var key in gatherList) {
      allT += gatherList[key].sumTime;
    }
    //计算每个type所占比例,并补充gCanvasList数组，以便后期绘图
    for (var key in gatherList) {
      var ratio = gatherList[key].sumTime / allT;
      gCanvaslist.push({ type: key, ratio, color: app.globalData.colorobj[key] });
    }
    //计算每个type的起始弧度和终止弧度 [{type,ratio,color，startAngle,endAngle}]
    for(let i=0;i<gCanvaslist.length;i++){
      let startAngle = i==0?0:gCanvaslist[i-1].endAngle;
      let endAngle = 2 * Math.PI * gCanvaslist[i].ratio + startAngle;
      gCanvaslist[i]["startAngle"] = startAngle;
      gCanvaslist[i]["endAngle"] = endAngle;
    }
    console.log(gCanvaslist,"gCanvaslist");
    //根据gatherListh绘制图形
    wx.createSelectorQuery()
      .select('#timeCanvas') // 在 WXML 中填入的 id
      .fields({ node: true, size: true })
      .exec((res) => {
        // Canvas 对象
        const canvas = res[0].node
        // 渲染上下文
        const ctx = canvas.getContext('2d');
        // Canvas 画布的实际绘制宽高
        const width = res[0].width;
        const height = res[0].height;

        // 初始化画布大小
        const dpr = wx.getWindowInfo().pixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);
        //计算圆心
        var rx = width/2;
        var ry = height/2;
        var r = Number(ry);
        for (let i = 0; i < gCanvaslist.length; i++) {
          //  let angle = 2 * Math.PI * gCanvaslist[i].ratio;
          // drawFan(ctx,rx,ry,ry-20,gCanvaslist[i].ratio,app.globalData.colorobj[gCanvaslist[i].type]);
          //画比例扇形
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          var rw = i%3==0?0:(i%3==1?-5:-10);
          ctx.arc(rx, ry, r+rw,gCanvaslist[i].startAngle,gCanvaslist[i].endAngle);
          ctx.lineTo(rx, ry);
          ctx.fillStyle = app.globalData.colorobj[gCanvaslist[i].type]?app.globalData.colorobj[gCanvaslist[i].type]:"#E77171";
          ctx.fill();
        }
        //画内部透明圆形
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.arc(rx, ry, r/2,0,180);
        ctx.lineTo(rx, ry);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.setGlobalAlpha = 0.5;
        ctx.fill();
        //画内部实体圆形
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.arc(rx, ry, r/2/4*3,0,180);
        ctx.lineTo(rx, ry);
        ctx.fillStyle = "rgba(255, 255, 255)";
        ctx.setGlobalAlpha = 1;
        ctx.fill();
        gCanvaslist.sort(function(a,b){
          return b.ratio - a.ratio
        });
        var taskResultStr = "";
        gCanvaslist.forEach(g=>{
          taskResultStr += g.type + " " + (allT*g.ratio/60).toFixed(1) + "h " 
        });
        this.setData({
          gCanvaslist,
          taskResultStr,
          totaltime:allT/60
        });
      })
  },
  listtoPolyCanvas(){
    var list = app.globalData.todayTasks;

  },
  changePageTask(){
    this.setData({
      ifTask:1,
      ifCost:0,
      title:"Task"
    });
  },
  changePageCost(){
    this.setData({
      ifTask:0,
      ifCost:1,
      title:"Cost"
    });
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    });
    // 执行其他操作，根据选择的值做出相应的处理
  }
})
