const app = getApp();

function getTodayDateString() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth 返回 0-11，需要加 1
  const day = now.getDate();

  return `${month}月${day}日`;
}
module.exports = {
  getTodayDateString
}
