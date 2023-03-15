import { ChatGPTAPIBrowser } from 'chatgpt'
import * as dotenv from 'dotenv'
import express from 'express'
dotenv.config()

const api = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL,
  password: process.env.OPENAI_PASSWORD,
  isProAccount: process.env.OPENAI_PRO,
})

await api.initSession()

const app = express()
app.use(express.json())

let savedIds = {}

app.get('/api/reset', (req, res) => {
  savedIds = {}
  console.log('\n=== CHAT RESET ===')
  res.json({ status: 'ok' })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message, channel, model } = req.body
    console.log(`\n[${channel}] [${model}] Q: ${message}`)

    const opts = {}
    if (model !== undefined) opts.model = model
    if (channel !== undefined && savedIds[channel] !== undefined) {
      opts.conversationId = savedIds[channel][0]
      opts.parentMessageId = savedIds[channel][1]
    }

    const data = await api.sendMessage(message, opts)
    console.log(`\n[${channel}] [${model}] A: ${data.response}`)
    savedIds[channel] = [data.conversationId, data.messageId]

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error sending message')
  }
})

app.listen(process.env.PORT, process.env.HOST, () =>
  console.log('Server listening on port 3000')
)
