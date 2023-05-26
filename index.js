const express = require('express')
const app = express()
app.use(express.json())
const { Datastore } = require('@google-cloud/datastore')

const datastore = new Datastore({})

async function findAllTasks() {
  const query = datastore.createQuery('Task')
  const [tasks] = await datastore.runQuery(query)
  return tasks
}

async function findTaskById(id) {
  const key = datastore.key(['Task', Number(id)])
  const [task] = await datastore.get(key)
  return task
}

async function createTask(title, body) {
  const key = datastore.key('Task')
  const task = {
    key: key,
    data: [
      {
        name: 'title',
        value: title,
      },
      {
        name: 'body',
        value: body,
      },
    ],
  }
  await datastore.save(task)
  return task
}

async function markTaskAsDone(id) {
  const key = datastore.key(['Task', Number(id)])
  const [task] = await datastore.get(key)
  task.done = true
  await datastore.update(task)
  return task
}

async function deleteTask(id) {
  const key = datastore.key(['Task', Number(id)])
  await datastore.delete(key)
  return key
}

// Health check
app.get('/', (_, res) => {
  res.send('ok')
})

// Get all tasks
app.get('/tasks', async (_, res) => {
  const tasks = await findAllTasks()
  for (const task of tasks) {
    task.id = task[datastore.KEY].id
  }
  res.send(tasks)
})

// Create a task
app.post('/tasks', async (req, res) => {
  const createdTask = await createTask(req.body.title, req.body.body)
  res.send(createdTask)
})

// Get a task by id
app.get('/tasks/:id', async (req, res) => {
  const foundTask = await findTaskById(req.params.id)
  res.send(foundTask)
})

// Mark a task as done by id
app.post('/tasks/:id/done', async (req, res) => {
  const doneTask = await markTaskAsDone(req.params.id)
  res.send(doneTask)
})

// Delete a task by id
app.delete('/tasks/:id', async (req, res) => {
  const deletedTask = await deleteTask(req.params.id)
  res.send(deletedTask)
})

const port = parseInt(process.env.PORT) || 8080
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`)
})
