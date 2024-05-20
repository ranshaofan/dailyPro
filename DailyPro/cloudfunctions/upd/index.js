const cloud = require('wx-server-sdk');
cloud.init({
  env: "record-database-4gmgag5a6d5ccfe0",
  traceUser:true
});
const db = cloud.database();

exports.main = async (event, context) => {
  const { tableName, id, name, value } = event;
  const collection = db.collection(tableName);

  // 查询具有特定 id 的记录
  const queryResult = await collection.where({
    _id: id
  }).get();

  // if (queryResult.data.length > 0) {
    // 如果记录已存在，更新字段
    const existingRecord = queryResult.data[0];
    const updateResult = await collection.doc(existingRecord._id).update({
      data: {
        [name]: value
      }
    });
    return updateResult;
  // } else {
    // 如果记录不存在，插入新记录
    // const data = { _id: id };
    // data[name] = value;
    // const insertResult = await collection.add({ data });
    // return insertResult;
  // }
};
