import { ChatGPTAPI } from 'chatgpt'
import * as dotenv from 'dotenv'
import express from 'express'
dotenv.config()

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
    const { message, channel } = req.body
    console.log(`\n[${channel}] Q: ${message}`)

    const data = await api.sendMessage(
      message,
      savedIds[channel] !== undefined
        ? {
            conversationId: savedIds[channel][0],
            parentMessageId: savedIds[channel][1],
          }
        : {}
    )
    console.log(`\n[${channel}] A: ${data.response}`)
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
