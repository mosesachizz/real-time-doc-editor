const express = require('express');
const Document = require('../models/Document');

const router = express.Router();

// Get all documents
router.get('/', async (req, res, next) => {
  try {
    const documents = await Document.find().sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

// Get single document
router.get('/:id', async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Create new document
router.post('/', async (req, res, next) => {
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
    next(error);
  }
});

// Update document
router.put('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { title, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:id', async (req, res, next) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;