const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const Document = require('./models/Document');
const { processOperation } = require('./lib/ot');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collab-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  let currentDocumentId = null;
  let user = { id: socket.id, name: `User-${socket.id.substr(0, 5)}` };

  socket.on('join-document', async (documentId) => {
    try {
      // Leave previous document room
      if (currentDocumentId) {
        socket.leave(currentDocumentId);
      }
      
      // Join new document room
      currentDocumentId = documentId;
      socket.join(documentId);
      
      // Add user to document's user list
      const document = await Document.findById(documentId);
      if (document) {
        const userExists = document.users.some(u => u.id === user.id);
        if (!userExists) {
          document.users.push(user);
          await document.save();
        }
        
        // Send current document content to the user
        socket.emit('document-content', document.content);
        
        // Send updated user list to all clients in the room
        io.to(documentId).emit('document-users', document.users);
      }
      
      // Notify others that a user joined
      socket.to(documentId).emit('user-joined', user);
    } catch (error) {
      console.error('Error joining document:', error);
      socket.emit('error', 'Failed to join document');
    }
  });

  socket.on('operation', async (data) => {
    try {
      const { documentId, operations, source } = data;
      
      if (source === 'client' && documentId) {
        const document = await Document.findById(documentId);
        if (document) {
          // Process the operation using Operational Transformation
          const transformedOperations = processOperation(
            document.content.ops,
            operations,
            document.revision
          );
          
          // Update document content and revision
          document.content.ops = transformedOperations;
          document.revision += 1;
          document.updatedAt = new Date();
          await document.save();
          
          // Broadcast the transformed operation to all other clients
          socket.to(documentId).emit('operation', {
            operations: transformedOperations,
            revision: document.revision,
            source: 'server'
          });
        }
      }
    } catch (error) {
      console.error('Error processing operation:', error);
      socket.emit('error', 'Failed to process operation');
    }
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    if (currentDocumentId) {
      try {
        const document = await Document.findById(currentDocumentId);
        if (document) {
          // Remove user from document's user list
          document.users = document.users.filter(u => u.id !== socket.id);
          await document.save();
          
          // Notify others that user left
          socket.to(currentDocumentId).emit('user-left', socket.id);
          
          // Send updated user list
          io.to(currentDocumentId).emit('document-users', document.users);
        }
      } catch (error) {
        console.error('Error handling user disconnect:', error);
      }
    }
  });
});

// REST API Routes
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find().sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const { title } = req.body;
    const document = new Document({
      title: title || 'Untitled Document',
      content: { ops: [] },
      users: []
    });
    
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { title, updatedAt: new Date() },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});