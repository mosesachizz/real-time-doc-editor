# Real-Time Collaborative Document Editor

A full-stack, real-time collaborative document editor similar to Google Docs. Multiple users can edit the same document simultaneously with operational transformation for conflict resolution.

## Problem Statement

Traditional document editing is single-user focused. When multiple people need to collaborate on a document, they face challenges with version control, conflicting changes, and lack of real-time interaction.

## Solution

This application provides a real-time collaborative editing experience where:
- Multiple users can edit the same document simultaneously
- Changes are synchronized in real-time using WebSockets
- Operational Transformation algorithm resolves edit conflicts
- Users can see who else is currently editing the document

## Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Quill.js rich text editor, Socket.IO client |
| **Backend** | Node.js, Express, Socket.IO, MongoDB with Mongoose |
| **Real-time Communication** | WebSockets via Socket.IO |
| **Operational Transformation** | Custom OT implementation for conflict resolution |
| **Deployment** | Docker, Docker Compose, Nginx |

## Architecture Decisions

1. **Operational Transformation over CRDTs**: Chosen for its maturity and proven scalability in applications like Google Docs.
2. **Socket.IO for Real-time Communication**: Provides built-in features like rooms, automatic reconnection, and fallback mechanisms.
3. **React with Hooks**: Modern React patterns for state management and side effects.
4. **Containerization with Docker**: Ensures consistent environments across development and production.
5. **MongoDB for Document Storage**: Flexible schema well-suited for document content storage.

## Key Features

### Operational Transformation Algorithm

The core of the real-time collaboration is the OT algorithm that transforms concurrent operations:

```javascript
function transform(opA, opB) {
  let opBPrime = [];
  let indexA = 0, indexB = 0;

  while (indexA < opA.length && indexB < opB.length) {
    const actionA = opA[indexA];
    const actionB = opB[indexB];

    if (isRetain(actionA)) {
      if (isInsert(actionB)) {
        opBPrime.push(actionB);
        indexB++;
      } else if (isDelete(actionB)) {
        opBPrime.push(actionB);
        indexB++;
      } else {
        indexA++;
        indexB++;
        opBPrime.push({ retain: actionA.retain });
      }
    } else if (isInsert(actionA)) {
      if (isInsert(actionB)) {
        opBPrime.push({ retain: actionA.insert.length });
        opBPrime.push(actionB);
        indexB++;
      } else {
        indexA++;
      }
    } else if (isDelete(actionA)) {
      indexA++;
    }
  }

  while (indexB < opB.length) {
    opBPrime.push(opB[indexB++]);
  }

  return opBPrime;
}
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose  
- Node.js 16+ (for local development without Docker)

### Running with Docker (Recommended)

1. **Clone the repository**:  
   ```bash
   git clone https://github.com/mosesachizz/real-time-doc-editor.git
   cd real-time-doc-editor
   ```

2. **Copy the environment example file**:  
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration if needed.

4. **Start the application with Docker Compose**:  
   ```bash
   docker-compose up -d
   ```

5. **Access the application**:  
   - Frontend: http://localhost:3000  
   - Backend API: http://localhost:3001  

### Running without Docker

1. Start MongoDB locally or use a cloud instance.

2. **Set up the backend**:  
   ```bash
   cd server
   npm install
   MONGODB_URI=mongodb://localhost:27017/collab-editor npm start
   ```

3. **Set up the frontend (in a new terminal)**:  
   ```bash
   cd client
   npm install
   REACT_APP_SERVER_URL=http://localhost:3001 npm start
   ```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Testing Collaboration

1. Open the application in multiple browser windows or tabs  
2. Create a new document or select an existing one  
3. Start typing in different windows to see real-time collaboration  
4. Observe the user list to see who else is editing the document  

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
