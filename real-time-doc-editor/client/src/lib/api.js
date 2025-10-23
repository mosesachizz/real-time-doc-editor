const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getDocuments = async () => {
  const response = await fetch(`${API_BASE}/api/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

export const getDocument = async (id) => {
  const response = await fetch(`${API_BASE}/api/documents/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch document');
  }
  return response.json();
};

export const createDocument = async (document) => {
  const response = await fetch(`${API_BASE}/api/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(document),
  });
  if (!response.ok) {
    throw new Error('Failed to create document');
  }
  return response.json();
};

export const updateDocument = async (id, updates) => {
  const response = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update document');
  }
  return response.json();
};