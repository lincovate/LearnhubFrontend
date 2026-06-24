import React, { useState, useEffect } from 'react';
import { chatApi } from '../../api/chatApi';
import toast from 'react-hot-toast';
import './ContactsModal.css';

const ContactsModal = ({ onClose, onStartChat }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await chatApi.getContacts();
        setContacts(res.data);
      } catch (err) {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filtered = contacts.filter(c =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="contactsmodal-overlay" onClick={onClose}>
      <div className="contactsmodal-container" onClick={(e) => e.stopPropagation()}>
        <div className="contactsmodal-header">
          <h3>New Chat</h3>
          <button className="contactsmodal-close-btn" onClick={onClose}>✕</button>
        </div>
        <input
          type="text"
          placeholder="Search contacts..."
          className="contactsmodal-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="contactsmodal-list">
          {loading ? (
            <div className="contactsmodal-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="contactsmodal-empty">No contacts available</div>
          ) : (
            filtered.map(contact => (
              <div
                key={contact.id}
                className="contactsmodal-item"
                onClick={() => onStartChat(contact.id)}
              >
                <div className="contactsmodal-avatar">👤</div>
                <div className="contactsmodal-info">
                  <div className="contactsmodal-name">{contact.full_name || contact.username}</div>
                  <div className="contactsmodal-role">{contact.role}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsModal;