const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Initialize database
const db = new sqlite3.Database('users.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE,
        name TEXT,
        email TEXT,
        password TEXT,
        profile_photo TEXT DEFAULT 'default-profile.png'
    )`);
});

// Function to update user profile photo
const updateUserPhoto = (userId, photoPath, callback) => {
    db.run(
        `UPDATE users SET profile_photo = ? WHERE id = ?`,
        [photoPath, userId],
        callback
    );
};


// Function to find user by Google ID
const findUserByGoogleId = (googleId, callback) => {
    db.get(`SELECT * FROM users WHERE google_id = ?`, [googleId], (err, row) => {
        callback(err, row);
    });
};

// Function to save new user with role
const saveUser = (googleId, name, email, role = 'user', callback) => {
    db.run(
        `INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)`,
        [googleId, name, email],
        function (err) {
            if (err) return callback(err);

            const userId = this.lastID;
            const userFolderPath = path.join(__dirname, 'user_data', `user_${userId}`);
            if (!fs.existsSync(userFolderPath)) {
                fs.mkdirSync(userFolderPath, { recursive: true });
                console.log(`Folder created for user: ${userFolderPath}`);
            }

            // Create a unique profile page for the user
            const userProfilePath = path.join(__dirname, 'public', `user_${userId}.html`);
            if (!fs.existsSync(userProfilePath)) {
                fs.writeFileSync(userProfilePath, `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${name}'s Page</title>
                        <link rel="stylesheet" href="profile.css">
                    </head>
                    <body>
                        <h1>Welcome, ${name}!</h1>
                        <p>Email: ${email}</p>
                        <p>This is your personal space.</p>
                        <button onclick="customizePage()">Customize</button>
                        <form id="uploadForm" enctype="multipart/form-data">
                            <input type="file" name="photo" id="photoInput" accept="image/*">
                            <button type="submit">Upload</button>
                        </form>
                        <img id="profilePhoto" src="default-profile.png" alt="Profile Photo">
                        <script>
                            document.getElementById('uploadForm').addEventListener('submit', async function (event) {
                                event.preventDefault();
                                const formData = new FormData();
                                formData.append('photo', document.getElementById('photoInput').files[0]);

                                const response = await fetch('/upload-photo', {
                                    method: 'POST',
                                    body: formData,
                                    credentials: 'include'
                                });

                                const data = await response.json();
                                if (data.success) {
                                    document.getElementById('profilePhoto').src = data.photoPath;
                                } else {
                                    alert('Upload failed');
                                }
                            });
                            fetch('/user-data', { credentials: 'include' })
                                .then(response => response.json())
                                .then(user => {
                                    if (user.profile_photo) {
                                        document.getElementById('profilePhoto').src = user.profile_photo;
                                    }
                                });
                        </script>
                    </body>
                    </html>
                `);
                console.log(`Profile page created: ${userProfilePath}`);
            }

            callback(null, { id: userId, googleId, name, email });
        }
    );
};


// Function to create user directory
const createUserFolder = (userId) => {
    const userFolderPath = path.join(__dirname, 'user_data', `user_${userId}`);
    if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath, { recursive: true });
        console.log(`Folder created: ${userFolderPath}`);
    }
};

module.exports = { db, findUserByGoogleId, saveUser, createUserFolder, updateUserPhoto };