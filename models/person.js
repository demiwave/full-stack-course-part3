// db configuration are moved to its own module
const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI;

console.log('connecting to', url)

// establish the connection to the database
mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')        
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

// define the schema for a person and the matching model
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

// The public interface of the module is defined by setting
// a value to the module.exports variable
module.exports = mongoose.model('person', personSchema)
