const express = require('express')
const next = require('next')
const path = require('path')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // Serve static files.
  server.use(express.static(path.join(__dirname, './public')))

  server.use('/_next', express.static(path.join(__dirname, './.next')))

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
