const express = require('express')
const app = express()
app.use(express.json())

let persons = [
    { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

// get request: persons array is send as a JSON-string
// Express automatically sets the Content-Type header
// with the appropriate value of application/json
app.get( '/api/persons', (request, response) => {
    response.json(persons)
})

const numberOfEntries = persons.length;
const currentDate = new Date();

// get request: /api/info displays number of entries/persons and date of the request
app.get( '/api/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${numberOfEntries} people<br/><br/>${currentDate}</p>`
    )
})

// get request: get data of specific person by id
app.get('/api/persons/:id', (request, response) => {
    // Using Number() isn't necessary but it's more efficient and it may lead to errors otherwise
    const id = Number(request.params.id)
    // find the person by id
    const person = persons.find(person => person.id === id)
    if(person) {
        response.json(person)
    }
    else {
        response.status(404).end() // the requested data was not found
    }
})

// delete request: delete a specific person from persons by id if it exists
app.delete('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    // find the person by id
    const person = persons.find(person => person.id === id)
    persons = persons.filter(person => person.id !== id)
    // in both cases - if person is found or not - we use the same status code    
    response.status(204).end()
})

// this function generate a random id with a big multiplier
// so the chance of getting double ids is low - but still possible
const generateId = max => Math.floor(Math.random() * max)

// post request: posts a new person entry with name and number data
// as well as a random id.
app.post('/api/persons', (request, response) => {
  const body = request.body
  // make sure that a person can't be added if body content is empty
  if(!body.name || !body.number) {
    response.status(400).json({
      error: 'content missing'
    })
  }

  const person = {
    id: generateId(1000000),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
