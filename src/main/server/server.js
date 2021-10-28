import express from 'express'
const app = express()

app.get('/message', (req, res) => {
  res.send('这是来自node服务端的信息')
})

app.post('/message', (req, res) => {
  if (req) {
    res.send(req + '--来自node')
  }
})

export default app
