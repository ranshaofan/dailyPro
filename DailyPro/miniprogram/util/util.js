const app = getApp();

function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  const hour = parseInt(time / 3600, 10)
  time %= 3600
  const minute = parseInt(time / 60, 10)
  time = parseInt(time % 60, 10)
  const second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

function fib(n) {
  if (n < 1) return 0
  if (n <= 2) return 1
  return fib(n - 1) + fib(n - 2)
}

function formatLeadingZeroNumber(n, digitNum = 2) {
  n = n.toString()
  const needNum = Math.max(digitNum - n.length, 0)
  return new Array(needNum).fill(0).join('') + n
}

function formatDateTime(date, withMs = false) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  const ms = date.getMilliseconds()

  let ret = [year, month, day].map(value => formatLeadingZeroNumber(value, 2)).join('-') +
    ' ' + [hour, minute, second].map(value => formatLeadingZeroNumber(value, 2)).join(':')
  if (withMs) {
    ret += '.' + formatLeadingZeroNumber(ms, 3)
  }
  return ret
}

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}
function drawLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.setStrokeStyle(color);
  ctx.setLineWidth(width);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.closePath();
  ctx.draw(true);
}

function drawTimeline(canvasContext, res, events) {
  const width = res.width;
  const height = res.height;
  const margin = 30;
  const tickWidth = 5;
  const tickSpacing = 50;
  const textPadding = 10;
  const timelineStart = margin + textPadding;
  const timelineEnd = width - margin;
  const timelineLength = timelineEnd - timelineStart;
  const eventSpacing = timelineLength / (events.length - 1);

  canvasContext.strokeStyle = "#333";
  canvasContext.lineWidth = 2;

  // Draw the timeline
  canvasContext.beginPath();
  canvasContext.moveTo(timelineStart, height / 2);
  canvasContext.lineTo(timelineEnd, height / 2);
  canvasContext.stroke();

  // Draw the ticks and labels
  canvasContext.font = "12px sans-serif";
  canvasContext.textAlign = "center";
  canvasContext.fillStyle = "#333";

  for (let i = 0; i < events.length; i++) {
    const eventX = timelineStart + eventSpacing * i;
    const event = events[i];

    // Draw the tick
    canvasContext.beginPath();
    canvasContext.moveTo(eventX, height / 2 - tickWidth / 2);
    canvasContext.lineTo(eventX, height / 2 + tickWidth / 2);
    canvasContext.stroke();

    // Draw the label
    canvasContext.fillText(event.label, eventX, height / 2 + tickSpacing);
  }
}
// js时间格式化
function dateFormat(fmt, date) {
  var o = {
    "M+": date.getMonth() + 1,     // 月份
    "d+": date.getDate(),     // 日
    "h+": date.getHours(),     // 小时
    "m+": date.getMinutes(),     // 分
    "s+": date.getSeconds(),     // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds()    // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
function initCalendar() {
  var zwdays = ['日', '一', '二', '三', '四', '五', '六'];
  var cs = [];
  var endDay = new Date();
  var beginDay = new Date();
  beginDay.setDate(beginDay.getDate() - 9); // 将日期设置为当前日期减去 6 天
  var i = 0;
  var todayIndex = 0;
  var isToday = 0;
  var today = dateFormat('yyyy-MM-dd', new Date()); // 格式化当前日期
  for (var day = new Date(beginDay); day.getTime() <= endDay.getTime(); day.setDate(day.getDate() + 1)) {
    var curX = zwdays[day.getDay()]; // 当前星期
    var curD = day.getDate();
    var cc = "";
    // 如果是今天就设置选中的Class
    var formattedDay = dateFormat('yyyy-MM-dd', day);
    if (formattedDay === today) {
      isToday = 1;
      todayIndex = i;
      cc = "chosen";
    } else {
      isToday = 0;
    }
    cs.push({ date: formattedDay, xq: curX, day: curD, X: (curX.substr(0, 1) == 'T' || curX.substr(0, 1) == 'S') ? curX.substr(0, 2) : curX.substr(0, 1), classChosen: cc, index: i, isToday });
    i++;
  }
  return { "calendar": cs, "cLChosen": "cL" + (todayIndex - 3) };
}

function loginIn() {
  wx.getUserProfile({
    desc: '获取用户信息',
    success: res => {
      var user = res.userInfo;
      //设置全局用户信息
      app.globalData.userInfo = res.userInfo
      //检查之前是否已经授权登录
      db.collection('userInfo').where({
        _id: app.globalData.userInfo._id
      }).get({
        success: res => {
          //原先没有添加，这里添加
          if (!res.data[0]) {
            //将数据添加到数据库
            var info = db.collection('userInfo').add({
              data: {
                avatarUrl: user.avatarUrl,
                nickName: user.nickName
              },
              success: res => {
                app.globalData.user_id = res._id;
              }
            })

          } else {
            //已经添加过了
            app.globalData.userInfo = res.data[0];
          }
        }
      })
    }
  })
}

//给两个数据加pic
function refreshEventsAndSlots(alls) {
  const app = getApp();
  var events,slots;
  var typeInfo = app.globalData.typeInfo;
  var userid = app.globalData.userInfo._openid;
  if(alls){
    events = alls.events;
    slots = alls.slots;
  }else{
    events = app.globalData.events;
    slots = app.globalData.slots;
  }
  //根据typeInfo中的数据 给events和slots写入pic
  events.forEach(e => {
    var ts = typeInfo.filter(t => { return t.user_id == userid && t.typeName == e.type; });
    if (ts.length > 0) e["pic"] = ts[0].pic;
    else e["pic"] = "../common/icon/fastfood.png";//默认 
  });
  slots.forEach(e => {
    var ts = typeInfo.filter(t => { return t.user_id == userid && t.typeName == e.type; });
    if (ts.length > 0) e["pic"] = ts[0].pic;
    else e["pic"] = "../common/icon/fastfood.png";//默认 
  });
}

//获取当前userid下所有数据
async function getEventsData(userid) {
  var db = wx.cloud.database();
  const events = db.collection('events');
  const MAX_LIMIT = 20; // 每次查询最多获取的数据条数
  const MAX_CONCURRENT = 5; // 每批次最多并发请求数量
  let allData = []; // 用于存放所有查询到的数据

  try {
    // 先查询一下总记录数
    const countResult = await events.where({ user_id: userid }).count();
    const total = countResult.total; // 总记录数
    const batchTimes = Math.ceil(total / MAX_LIMIT); // 计算需要分几次取

    for (let i = 0; i < batchTimes; i += MAX_CONCURRENT) {
      // 构建当前批次的查询请求
      const tasks = [];
      for (let j = 0; j < MAX_CONCURRENT && (i + j) < batchTimes; j++) {
        const promise = events.where({ user_id: userid })
          .skip((i + j) * MAX_LIMIT)
          .limit(MAX_LIMIT)
          .get();
        tasks.push(promise);
      }

      // 执行当前批次的查询请求
      const results = await Promise.all(tasks);
      results.forEach(result => {
        allData = allData.concat(result.data);
      });
    }

    return allData;
  } catch (err) {
    console.error('查询失败:', err);
    throw err;
  }
}

// function getEventsData(userid){
//   var db = wx.cloud.database();
//   return new Promise((resolve, reject) => {
//     const events = db.collection('events');
//     events.where({
//       user_id: userid
//     }).get().then(res => {
//       if (res.data) {
//         resolve(res.data);
//       }
//     }).catch(err => {
//       console.error('查询失败:', err);
//       reject(err);
//     });
//   });
// }

//获取当前userid下所有数据
// function getSlotsData(userid){
//   var db = wx.cloud.database();
//   return new Promise((resolve, reject) => {
//     const slots = db.collection('slots');
//     slots.where({
//       user_id: userid
//     }).get().then(res => {
//       if (res.data) {
//         resolve(res.data);
//       }
//     }).catch(err => {
//       console.error('查询失败:', err);
//       reject(err);
//     });
//   });
// }

async function getSlotsData(userid) {
  var db = wx.cloud.database();
  const slots = db.collection('slots');
  const MAX_LIMIT = 20; // 每次查询最多获取的数据条数
  const MAX_CONCURRENT = 5; // 每批次最多并发请求数量
  let allData = []; // 用于存放所有查询到的数据

  try {
    // 先查询一下总记录数
    const countResult = await slots.where({ user_id: userid }).count();
    const total = countResult.total; // 总记录数
    const batchTimes = Math.ceil(total / MAX_LIMIT); // 计算需要分几次取

    for (let i = 0; i < batchTimes; i += MAX_CONCURRENT) {
      // 构建当前批次的查询请求
      const tasks = [];
      for (let j = 0; j < MAX_CONCURRENT && (i + j) < batchTimes; j++) {
        const promise = slots.where({ user_id: userid })
          .skip((i + j) * MAX_LIMIT)
          .limit(MAX_LIMIT)
          .get();
        tasks.push(promise);
      }

      // 执行当前批次的查询请求
      const results = await Promise.all(tasks);
      results.forEach(result => {
        allData = allData.concat(result.data);
      });
    }

    return allData;
  } catch (err) {
    console.error('查询失败:', err);
    throw err;
  }
}


function refreshTypeInfo(userid) {
  var db = wx.cloud.database();
  return new Promise((resolve, reject) => {
    const typeInfo = db.collection('typeInfo');
    typeInfo.where({
      user_id: userid
    }).get().then(res => {
      if (res.data) {
        resolve(res.data);
      }
    }).catch(err => {
      console.error('查询失败:', err);
      reject(err);
    });
  });
}

function upd(table,id,updcon){
  var db = wx.cloud.database();
  return new Promise((resolve, reject) => {
    db.collection(table).doc(id).update({
      data: updcon,
      success: res => {
        // 更新成功后更新页面数据
        resolve(res);
      },
      fail:e=> {
        console.error('更新失败:', err);
        reject(err);
      }
    });
  });
}

function formatValueTime(val) {
  if (!val) return;
  var h = "", s = "";
  if (val.indexOf(":") > 0) {
    h = val.split(":")[0];
    s = val.split(":")[1];
  } else if (val.indexOf("：") > 0) {
    h = val.split("：")[0];
    s = val.split("：")[1];
  } else if (val.indexOf(".") > 0) {
    h = val.split(".")[0];
    s = val.split(".")[1];
  } else if (val.indexOf(" ") > 0) {
    h = val.split(" ")[0];
    s = val.split(" ")[1];
  } else if (val.length <= 2) {
    h = val;
    s = "00";
  } else if (val.length > 2) {
    h = val.substring(0, val.length - 2);
    s = val.substring(val.length - 2);
  }
  if ((!Number(h) && Number(h)!=0) || (!Number(s) && Number(s)!=0) || Number(h) < 0 || Number(h) > 23 || Number(s) < 0 || Number(s) > 59) {
    return "error";
  }
  h = h.length < 2 ? ('0' + h) : h;
  s = s.length < 2 ? ('0' + s) : s;
  return h + ":" + s;
}
module.exports = {
  formatTime,
  formatLocation,
  fib,
  formatDateTime,
  compareVersion,
  drawLine,
  drawTimeline,
  dateFormat,
  initCalendar,
  loginIn,
  refreshTypeInfo,
  refreshEventsAndSlots,
  formatValueTime,
  getSlotsData,
  getEventsData,
  upd
}
