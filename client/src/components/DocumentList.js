import React, { useState, useEffect } from 'react';
import { getDocuments, createDocument } from '../lib/api';
import './DocumentList.css';

function DocumentList({ onSelectDocument, currentDocumentId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newDocumentTitle.trim()) return;

    try {
      const newDoc = await createDocument({ title: newDocumentTitle });
      setDocuments(prev => [newDoc, ...prev]);
      setNewDocumentTitle('');
      setShowCreateForm(false);
      onSelectDocument(newDoc);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  if (loading) {
    return <div className="document-list-loading">Loading documents...</div>;
  }

  return (
    <div className="document-list">
      <div className="document-list-header">
        <h3>Documents</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="new-doc-btn"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateDocument} className="create-doc-form">
          <input
            type="text"
            placeholder="Document title"
            value={newDocumentTitle}
            onChange={(e) => setNewDocumentTitle(e.target.value)}
            autoFocus
          />
          <div className="form-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="documents">
        {documents.map(doc => (
          <div
            key={doc._id}
            className={`document-item ${currentDocumentId === doc._id ? 'active' : ''}`}
            onClick={() => onSelectDocument(doc)}
          >
            <div className="document-title">{doc.title}</div>
            <div className="document-meta">
              {new Date(doc.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentList;