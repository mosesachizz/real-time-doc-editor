import React from 'react';
import './UserList.css';

function UserList({ users }) {
  return (
    <div className="user-list">
      <h4>Active Users</h4>
      <div className="users">
        {users.map(user => (
          <div key={user.id} className="user-item">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-name">{user.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserList;