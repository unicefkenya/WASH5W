const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')

const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

const port = process.env.PORT || 3000
const hostname = '0.0.0.0'
const backlog = 511


server.listen(port, hostname, backlog, () => {
    console.log(`JSON Server is running on port ${port}`)
})
