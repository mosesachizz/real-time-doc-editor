import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSocket } from './hooks/useSocket';
import { useDocument } from './hooks/useDocument';
import DocumentList from './components/DocumentList';
import UserList from './components/UserList';
import './App.css';

function App() {
  const [documentId, setDocumentId] = useState(null);
  const [title, setTitle] = useState('Untitled Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const { socket, connected, users } = useSocket(documentId);
  const { content, setContent, operations, loaded } = useDocument(documentId, socket);

  const handleTextChange = useCallback((content, delta, source, editor) => {
    if (source === 'user' && socket) {
      const ops = editor.getContents().ops;
      socket.emit('operation', {
        documentId,
        operations: ops,
        source: 'client'
      });
    }
  }, [socket, documentId]);

  const handleCreateNew = () => {
    setDocumentId(null);
    setTitle('Untitled Document');
    setContent('');
  };

  const handleSelectDocument = (doc) => {
    setDocumentId(doc.id);
    setTitle(doc.title);
  };

  if (!connected) {
    return <div className="loading">Connecting to server...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="document-info">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              autoFocus
            />
          ) : (
            <h1 onClick={() => setIsEditingTitle(true)}>{title}</h1>
          )}
          <button onClick={handleCreateNew}>New Document</button>
        </div>
        <UserList users={users} />
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <DocumentList 
            onSelectDocument={handleSelectDocument}
            currentDocumentId={documentId}
          />
        </aside>

        <main className="editor-container">
          {loaded ? (
            <ReactQuill
              value={content}
              onChange={handleTextChange}
              modules={modules}
              formats={formats}
              theme="snow"
            />
          ) : (
            <div className="loading">Loading document...</div>
          )}
        </main>
      </div>
    </div>
  );
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'list', 'bullet', 'indent',
  'align',
  'blockquote', 'code-block',
  'link', 'image', 'video'
];

export default App;