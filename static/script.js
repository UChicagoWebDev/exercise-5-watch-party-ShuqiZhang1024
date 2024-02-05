/* For profile.html */
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('updateUsername').addEventListener('click', function() {
      const newName = document.getElementById('username').value;
      fetch('/api/user/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': WATCH_PARTY_API_KEY,
        },
        body: JSON.stringify({ name: newName })
      })
      .then(response => response.json())
      .then(data => {
        if(data.message) {
          alert("Username updated successfully!");
        } else {
          alert("Failed to update username: " + data.error);
        }
      })
      .catch(error => console.error('Error:', error));
    });
  
    document.getElementById('updatePassword').addEventListener('click', function() {
      const newPassword = document.getElementById('password').value;
      fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': WATCH_PARTY_API_KEY,
        },
        body: JSON.stringify({ password: newPassword })
      })
      .then(response => response.json())
      .then(data => {
        if(data.message) {
          alert("Password updated successfully!");
        } else {
          alert("Failed to update password: " + data.error);
        }
      })
      .catch(error => console.error('Error:', error));
    });
});

/* For room.html */
document.addEventListener('DOMContentLoaded', function() {
  clearSampleMessages(); // 清除样本消息
  setupRoomNameEditingListeners(); // 设置编辑和保存房间名称的事件监听器
  setupMessagePostingListener(); // 设置新消息提交的事件监听器
  startMessagePolling(); // 开始自动轮询新消息
});

function clearSampleMessages() {
  const messagesContainer = document.querySelector('.messages');
  messagesContainer.innerHTML = ''; // 清空样本消息
}

function setupRoomNameEditingListeners() {
  const editLink = document.getElementById('editLink');
  const saveLink = document.getElementById('saveLink');
  const roomNameDisplay = document.querySelector('.roomData .display');
  const roomNameEdit = document.querySelector('.roomData .edit');
  const roomNameInput = roomNameEdit.querySelector('input');

  editLink.addEventListener('click', function(event) {
      event.preventDefault();
      roomNameDisplay.classList.add('hide');
      roomNameEdit.classList.remove('hide');
      roomNameInput.focus();
  });

  saveLink.addEventListener('click', function(event) {
      event.preventDefault();
      const newName = roomNameInput.value.trim();
      if (!newName) {
          alert('Room name cannot be empty!');
          return;
      }

      fetch(`/api/rooms/${WATCH_PARTY_ROOM_ID}/name`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-API-Key': WATCH_PARTY_API_KEY,
          },
          body: JSON.stringify({ name: newName }),
      })
      .then(response => {
          if (response.ok) {
              return response.json();
          }
          throw new Error('Network response was not ok.');
      })
      .then(data => {
          alert('Room name updated successfully!');
          document.querySelector('.roomData .display .roomName').textContent = newName;
          roomNameEdit.classList.add('hide');
          roomNameDisplay.classList.remove('hide');
      })
      .catch(error => console.error('Error:', error));
  });
}

function setupMessagePostingListener() {
  document.getElementById('comment_form').addEventListener('submit', function(event) {
      event.preventDefault();
      const commentText = document.getElementById('comment_text').value.trim();
      if (!commentText) {
          alert('Please enter a message.');
          return;
      }

      fetch(`/api/rooms/${WATCH_PARTY_ROOM_ID}/messages`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-API-Key': WATCH_PARTY_API_KEY,
          },
          body: JSON.stringify({ body: commentText })
      })
      .then(response => response.json())
      .then(data => {
          alert('Message posted successfully!');
          document.getElementById('comment_text').value = ''; // 清空文本域
          fetchMessages(); // 重新获取并显示所有消息
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Failed to post message.');
      });
  });
}

function fetchMessages() {
  fetch(`/api/rooms/${WATCH_PARTY_ROOM_ID}/messages`, {
      headers: {
          'X-API-Key': WATCH_PARTY_API_KEY
      }
  })
  .then(response => response.json())
  .then(messages => {
      const messagesContainer = document.querySelector('.messages');
      messagesContainer.innerHTML = '';
      messages.forEach(message => {
        const messageElement = document.createElement('message');
        const authorElement = document.createElement('author');
        const contentElement = document.createElement('content');
        authorElement.textContent = message.user_name;
        contentElement.textContent = message.body;
        messageElement.appendChild(authorElement);
        messageElement.appendChild(contentElement);
        messagesContainer.appendChild(messageElement);
      });
  })
  .catch(error => console.error('Error:', error));
}

function startMessagePolling() {
  fetchMessages();
  setInterval(fetchMessages, 100);
}
