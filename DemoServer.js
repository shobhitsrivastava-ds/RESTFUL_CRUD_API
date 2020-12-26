// Creating express object
const express= require("express");
// creating body parser object
const bodyParser= require("body-parser");

const app= express();
app.use(bodyParser.json());

// Home page method get method
app.get("/", (req, res)=>
{
    res.json({"Message":"Welcome to the api call"});
});

// creating mongoose object
const mongoose = require('mongoose');
// Connecting mongoose object to the MongoDB database
mongoose.connect("mongodb://localhost:27017/easy_notes", {useNewUrlParser:true}).then(()=>
{
    console.log("Successfully Connected to the database! :)");
}).catch((err)=>
{
    console.log("Could not connect :(");
});

// Defining database schema
const NoteSchema = mongoose.Schema({
    title: String,
    content: String
}, {
    timestamps: true
});

// Compiling the database model
const Note= mongoose.model('Note', NoteSchema);

// REQUESTING THE DATA FROM THE DATABASE 

app.get("/notes", (req, res)=>
{
    Note.find().then(notes=>
    {
        res.send(notes);
    }).catch(err=>
        {
            res.status(500).send({message: err.message || 'Some error occured while retrieving the data'});
        });
});

app.get("/notes/:noteId", (req, res)=>
{
    Note.findById(req.params.noteId).then(note=>
        {
            if(!note)
            {
                return(res.status(404).send({message:"Note could not be found with id "+req.params.noteId}));
            }
            res.send(note);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Note not found with id " + req.params.noteId
                });                
            }
            return res.status(500).send({
                message: "Error retrieving note with id " + req.params.noteId
            });
        });
});

// ADDING THE DATA IN THE DATABASE

app.post("/notes", (req, res)=>
{
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Create a Note
    const note = new Note({
        title: req.body.title || "Untitled Note", 
        content: req.body.content
    });

    // Save Note in the database
    note.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
});

// UPDATING THE DATA IN THE DATABASE;

app.put('/notes/:noteId', (req, res)=>
{
    if(!req.body.content)
    {
        return(res.status(400).send({
            message:"Note content can not be empty"
        }));
    }
    Note.findByIdAndUpdate(req.params.noteId,
        {
            title:req.body.title || "Untitled Note",
            content: req.body.content
        }, {new:true}).then(note=>
            {
                if(!note) {
                    return res.status(404).send({
                        message: "Note not found with id " + req.params.noteId
                    });
                }
                res.send(note);
            }).catch(err => {
                if(err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: "Note not found with id " + req.params.noteId
                    });                
                }
                return res.status(500).send({
                    message: "Error updating note with id " + req.params.noteId
                });

            });

});

// DELETING THE DOCUMENT
app.delete("./notes/:noteId", (req, res)=>
{
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
});


// running the server

app.listen(8000);






