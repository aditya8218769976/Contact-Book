import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [sortOption, setSortOption] = useState('name'); // Default sorting option is 'name'

  const fetchContacts = useCallback(() => {
    axios
      .get('http://localhost:8080/api/contacts')
      .then((response) => setContacts(response.data))
      .catch((error) => setError('Error fetching contacts: ' + error.message));
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    searchContacts(value);
  };

  const searchContacts = (term) => {
    if (term.trim() === '') {
      fetchContacts();
    } else {
      const filteredContacts = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(term.toLowerCase())
      );
      setContacts(filteredContacts);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewContact({ ...newContact, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post('http://localhost:8080/api/contacts', newContact)
      .then((response) => {
        setContacts([...contacts, response.data]);
        setNewContact({ name: '', email: '', phone: '' });
        setShowAddContact(false); // Hide the Add Contact form after submission
      })
      .catch((error) => setError('Error adding a new contact: ' + error.message));
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
  };

  const handleUpdate = (event, updatedContact) => {
    event.preventDefault();
    axios
      .put(`http://localhost:8080/api/contacts/${updatedContact.id}`, updatedContact)
      .then((response) => {
        const updatedContacts = contacts.map((contact) =>
          contact.id === response.data.id ? response.data : contact
        );
        setContacts(updatedContacts);
        setSelectedContact(null);
      })
      .catch((error) => setError('Error updating contact: ' + error.message));
  };

  const handleDelete = (contactId) => {
    axios
      .delete(`http://localhost:8080/api/contacts/${contactId}`)
      .then(() => {
        const updatedContacts = contacts.filter((contact) => contact.id !== contactId);
        setContacts(updatedContacts);
      })
      .catch((error) => setError('Error deleting contact: ' + error.message));
  };

  const handleSortChange = (event) => {
    const selectedOption = event.target.value;

    // Sort the contacts based on the selected sorting option
    const sortedContacts = [...contacts].sort((a, b) => {
      if (selectedOption === 'name') {
        return a.name.localeCompare(b.name);
      } else if (selectedOption === 'email') {
        return a.email.localeCompare(b.email);
      } else if (selectedOption === 'phone') {
        return a.phone.localeCompare(b.phone);
      }
      return 0;
    });

    setSortOption(selectedOption);
    setContacts(sortedContacts);
  };

  return (
    <div>
      <div className="flex">
        <div>
          <div className='custom-nav-css'>
            <h2>Contact List</h2>
            {error && <div className="error">{error}</div>}
            <div className="search-add-container">
              <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={handleSearchInputChange}
              />
              <button onClick={() => setShowAddContact(!showAddContact)}>
                {showAddContact ? 'Cancel' : 'Add Contact'}
              </button>
            </div>
            <div className="sort-container">
              <label>Sort by:</label>
              <select value={sortOption} onChange={handleSortChange}>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>
          {showAddContact && (
            <div className='addContact-custom-css'>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newContact.email}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={handleInputChange}
                />
                <button type="submit">Add Contact</button>
              </form>
            </div>
          )}
        </div>
        <div className='table-custom-css'>
          <table className="table-fixed">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{selectedContact && selectedContact.id === contact.id ? (
                    <input
                      type="text"
                      name="name"
                      value={selectedContact.name}
                      onChange={(event) => {
                        const updatedContact = { ...selectedContact };
                        updatedContact.name = event.target.value;
                        setSelectedContact(updatedContact);
                      }}
                    />
                  ) : (
                    contact.name
                  )}</td>
                  <td>{selectedContact && selectedContact.id === contact.id ? (
                    <input
                      type="email"
                      name="email"
                      value={selectedContact.email}
                      onChange={(event) => {
                        const updatedContact = { ...selectedContact };
                        updatedContact.email = event.target.value;
                        setSelectedContact(updatedContact);
                      }}
                    />
                  ) : (
                    contact.email
                  )}</td>
                  <td>{selectedContact && selectedContact.id === contact.id ? (
                    <input
                      type="text"
                      name="phone"
                      value={selectedContact.phone}
                      onChange={(event) => {
                        const updatedContact = { ...selectedContact };
                        updatedContact.phone = event.target.value;
                        setSelectedContact(updatedContact);
                      }}
                    />
                  ) : (
                    contact.phone
                  )}</td>
                  <td>
                    {selectedContact && selectedContact.id === contact.id ? (
                      <>
                        <button onClick={(event) => handleUpdate(event, selectedContact)}>Save</button>
                        <button onClick={() => setSelectedContact(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(contact)}>Edit</button>
                        <button onClick={() => handleDelete(contact.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
