const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(bodyParser.json());

// Read contacts from JSON file
const readContacts = () => {
    try {
      const rawData = fs.readFileSync('./server/data/contacts.json');
      return JSON.parse(rawData);
    } catch (error) {
      // Handle the case when the file is empty or cannot be read
      return [];
    }
  };

// API endpoints
app.get('/api/contacts', (req, res) => {
  try {
    const contacts = readContacts();
    res.json(contacts);
  } catch (error) {
    console.error('Error reading contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/contacts/:id', (req, res) => {
  try {
    const contacts = readContacts();
    const contact = contacts.find(c => c.id === req.params.id);
    if (!contact) {
      res.status(404).json({ message: 'Contact not found' });
    } else {
      res.json(contact);
    }
  } catch (error) {
    console.error('Error fetching contact by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const contacts = readContacts();
    const newContact = req.body;
    newContact.id = (contacts.length + 1).toString();
    contacts.push(newContact);
    fs.writeFileSync('./server/data/contacts.json', JSON.stringify(contacts, null, 2));
    res.json(newContact);
  } catch (error) {
    console.error('Error adding a new contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Implement PUT and DELETE endpoints similarly
app.put('/api/contacts/:id', (req, res) => {
    try {
      const contacts = readContacts();
      const contactId = req.params.id;
      const updatedContact = req.body;
  
      // Find the index of the contact to be updated in the contacts array
      const contactIndex = contacts.findIndex((contact) => contact.id === contactId);
  
      if (contactIndex === -1) {
        // Contact not found
        res.status(404).json({ message: 'Contact not found' });
      } else {
        // Update the contact and save it back to the JSON file
        contacts[contactIndex] = { ...contacts[contactIndex], ...updatedContact };
        fs.writeFileSync('./server/data/contacts.json', JSON.stringify(contacts, null, 2));
        res.json(contacts[contactIndex]);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  app.delete('/api/contacts/:id', (req, res) => {
    try {
      const contacts = readContacts();
      const contactId = req.params.id;
  
      // Log the received contactId for debugging purposes
      console.log('Received contact ID:', contactId);
  
      // Filter out the contact to be deleted
      const updatedContacts = contacts.filter((contact) => contact.id !== contactId);
  
      // Log the updatedContacts array for debugging purposes
      console.log('Updated contacts:', updatedContacts);
  
      if (contacts.length === updatedContacts.length) {
        // Contact not found
        res.status(404).json({ message: 'Contact not found' });
      } else {
        // Save the updated list back to the JSON file
        fs.writeFileSync('./server/data/contacts.json', JSON.stringify(updatedContacts, null, 2));
        res.json({ message: 'Contact deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
