
import {} from './db.js'

export default async function apiServer (fastify, opts) {
    fastify.get('/', async (request, reply) => {
      return { root: true }
    })
  
    fastify.get('/hello', async (request, reply) => {
      return { hello: 'world' }
    })
  
}