import { useState, useEffect, useCallback } from 'react';
import { getDocument } from '../lib/api';

export const useDocument = (documentId, socket) => {
  const [content, setContent] = useState('');
  const [operations, setOperations] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!documentId) {
      setContent('');
      setOperations([]);
      setLoaded(true);
      return;
    }

    const loadDocument = async () => {
      try {
        setLoaded(false);
        const doc = await getDocument(documentId);
        setContent(doc.content);
        setOperations(doc.content.ops || []);
        setRevision(doc.revision || 0);
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadDocument();
  }, [documentId]);

  useEffect(() => {
    if (!socket) return;

    const handleOperation = (data) => {
      if (data.source === 'server') {
        setOperations(data.operations);
        setRevision(data.revision);
      }
    };

    const handleDocumentContent = (content) => {
      setContent(content);
      setOperations(content.ops || []);
    };

    socket.on('operation', handleOperation);
    socket.on('document-content', handleDocumentContent);

    return () => {
      socket.off('operation', handleOperation);
      socket.off('document-content', handleDocumentContent);
    };
  }, [socket]);

  return { content, setContent, operations, loaded, revision };
};