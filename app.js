// 导入 express
const express = require('express')
// 得到一个app对象, 启动服务
const app = express()
// 设置中间件,处理请求对应函数,静态托管
app.use(express.static('publish'))


app.listen(3006, () => {
    console.log('访问成功,请到  http://localhost:3006')
})

