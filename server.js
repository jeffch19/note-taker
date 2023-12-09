const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// HTML Routes
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});



// API Routes
app.get('/api/notes', (req, res) => {
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'db.json'), 'utf8'));
  res.json(notes);
});

app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'db.json'), 'utf8'));

  // Generate a unique id using uuid
  newNote.id = uuidv4();

  notes.push(newNote);

  fs.writeFileSync(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes));
  res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  let notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'db', 'db.json'), 'utf8'));

  // Find the index of the note with the given id
  const noteIndex = notes.findIndex((note) => note.id === noteId);

  if (noteIndex !== -1) {
    // Remove the note from the array
    notes.splice(noteIndex, 1);

    // Write the updated notes array back to db.json
    fs.writeFileSync(path.join(__dirname, 'db', 'db.json'), JSON.stringify(notes));

    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, error: 'Note not found' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
