const express = require('express');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { db, findUserByGoogleId, saveUser, createUserFolder } = require('./database');
const { exec, spawn } = require('child_process');
const app = express();
const multer = require('multer');

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user_data', express.static(path.join(__dirname, 'user_data')));
app.use(express.json());

const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(32).toString('hex'); 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userFolderPath = path.join(__dirname, 'user_data', `user_${req.user.id}`);
        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
        }
        cb(null, userFolderPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'profile_photo' + path.extname(file.originalname)); // Always overwrite the photo
    }
});
const upload = multer({ storage });

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    findUserByGoogleId(profile.id, (err, user) => {
        if (err) return done(err);

        if (!user) {
            const role = req.session.role || 'user'; // Default role if not provided
            saveUser(profile.id, profile.displayName, profile.emails[0].value, role, (err, newUser) => {
                if (err) return done(err);
                createUserFolder(newUser.id);
                return done(null, newUser);
            });
        } else {
            createUserFolder(user.id);
            return done(null, user);
        }
    });
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        done(err, user);
    });
});

app.get('/user-data', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.json({ error: "User not authenticated" });
    }
    res.json({
        name: req.user.name,
        email: req.user.email,
        profile_photo: req.user.profile_photo || 'default-profile.png'
    });
});

// Route to serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});


app.get('/auth/google', (req, res, next) => {
    req.session.role = req.query.role;
    console.log("Role stored in session:", req.session.role);
    next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));


// Handle the callback after successful authentication
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Get the role stored in the session
        const role = req.session.role; 
        if (role === 'homeowner') {
            // Redirect to the designer portal
            res.redirect('/homeownerprofile.html');
        } else {
            // Redirect to the homeowner portal
            res.redirect('/designer.html');
        }
    }
);

app.post('/generate-image', (req, res) => {
    let prompt = req.body.prompt;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const pythonProcess = spawn("python", ["creation.py", prompt]);

    let estimatedTime = 10; // Default estimate

    pythonProcess.stdout.on("data", (data) => {
        const message = data.toString().trim();

        if (message.startsWith("ESTIMATED_TIME")) {
            estimatedTime = parseFloat(message.split(" ")[1]);
            res.write(`event: estimated-time\ndata: ${estimatedTime}\n\n`);
        } else if (message.startsWith("PROGRESS")) {
            const remaining = parseFloat(message.split(" ")[1]);
            res.write(`event: progress\ndata: ${remaining}\n\n`);
        } else if (message.startsWith("IMAGE_READY")) {
            res.write(`event: complete\ndata: ${message.split(" ")[1]}\n\n`);
            res.end();
        }
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            res.status(500).send("Error generating image.");
        }
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
});

// Route to upload profile photo
app.post('/upload-photo', upload.single('photo'), (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user.id;
    const photoPath = `/user_data/user_${userId}/${req.file.filename}`;

    db.run(`UPDATE users SET profile_photo = ? WHERE id = ?`, [photoPath, userId], (err) => {
        if (err) {
            return res.status(500).json({ error: "Database update failed" });
        }
        res.json({ success: true, photoPath });
    });
});



// Logout route
app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

