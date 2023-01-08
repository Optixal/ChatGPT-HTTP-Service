import { ChatGPTAPIBrowser } from 'chatgpt'
import * as dotenv from 'dotenv'
import express from 'express'
dotenv.config()

const api = new ChatGPTAPIBrowser({
  email: process.env.OPENAI_EMAIL,
  password: process.env.OPENAI_PASSWORD,
})
await api.initSession()

const app = express()
app.use(express.json())

let data

app.get('/api/reinit', async (req, res) => {
  try {
    await api.initSession()
    console.log('\n=== CHAT REINIT ===')
    console.log('Continuing conversation...')
    res.json({ status: 'ok' })
  } catch (err) {
    console.error(err)
    res.status(500).send('Error reinitializing')
  }
})

app.get('/api/reset', (req, res) => {
  data = undefined
  console.log('\n=== CHAT RESET ===')
  res.json({ status: 'ok' })
})

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body
    console.log('\nQ: ' + message)

    data = await api.sendMessage(
      message,
      data
        ? {
            conversationId: data.conversationId,
            parentMessageId: data.messageId,
          }
        : {}
    )
    console.log('\nA: ' + data.response)

    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).send('Error sending message')
  }
})

app.listen(process.env.PORT, process.env.HOST, () =>
  console.log('Server listening on port 3000')
)
