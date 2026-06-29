require('dotenv').config()
const express = require('express')
const cors = require('cors')
const projectsRouter = require('./routes/projects')
const importRouter = require('./routes/import')
const roiRouter = require('./routes/roi')

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/projects', projectsRouter)
app.use('/import', importRouter)
app.use('/roi', roiRouter)

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Node API running on :${PORT}`))
