// important: envs need to be available globally before
// the code from other modules is imported.
require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

// use static to make Express show static content, the
// page index.html and the JavaScript, etc. which it fetches
app.use(express.static('dist'))

// use cors to allow for requests from all origins
app.use(cors())

// use the middleware 'json-parser' from the express package
app.use(express.json())

// using the middleware 'morgan'...

// define custom token to log the request body for POST requests
morgan.token('body', (req) => JSON.stringify(req.body))

// define custom format for POST requests
const postFormat = ':method :url :status :res[content-length] - :response-time ms :body'

// use custom format for POST requests and 'tiny' for all other requests
app.use((req, res, next) => {
  const format = (req.method === 'POST' ? postFormat : 'tiny')
  morgan(format)(req, res, next)
})

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
// we can now use Person.find to fetch a specific person from MongoDB
// no other changes needed here
app.get( '/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

// this doesn't work anymore because we use MongoDB
const numberOfEntries = persons.length;
const currentDate = new Date();

// get request: /api/info displays number of entries/persons and date of the request
app.get( '/api/info', (request, response) => {
    response.send(
        `<p>Phonebook has info for ${numberOfEntries} people<br/><br/>${currentDate}</p>`
    )
})

// get request: get data of specific person by id
// I already made some changes here but wrong ids lead to app crash
// error handling is needed and will be added later
app.get('/api/persons/:id', (request, response) => {
    // finding the person via findById makes the code simpler
    Person.findById(request.params.id).then(person => {
      if(person) {
        response.json(person)
      }
      else {
          response.status(404).end() // the requested data was not found
      }
    })
})

// delete request: delete a specific person from persons by id if it exists
app.delete('/api/persons/:id', (request, response, next) =>{

  Person.findByIdAndDelete(request.params.id)
  .then(result => {
    // in both cases (id exists or not) we respond with the same code
    response.status(204).end() // 204 means "no content"
  })
  .catch(error => next(error)) // next passes exceptions to the error handler
})

// post request: posts a new person entry with name, number data and a random id
app.post('/api/persons', (request, response) => {
  const body = request.body

  // a person can't be added if name and number data content is empty
  // '!body.name' and 'body.name === undefined' do the same thing 
  if(!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  // this doesn't work anymore because we use MongoDB
  // check if name already exists
  if(persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = new Person({
    //id: generateId(1000000),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    // because we use .save method we don't need .concat anymore
    response.json(savedPerson)
  })
  
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if(error.name === 'CastError') {
    return response.status(400).send({error:'malformatted id'})
  }
  return(error)
}

// this has to be the last loaded middleware,
// also all the routes should be registered before this!

// handler of requests that result in errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  }
)
