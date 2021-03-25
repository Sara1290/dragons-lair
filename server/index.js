require('dotenv').config();
const express = require('express');
const app = express();
const massive = require('massive');
const session = require('express-session');
const { PORT, CONNECTION_STRING, SESSION_SECRET} = process.env;
const authCtrl = require('./controllers/authController');
const treasureCtrl = require('./controllers/treasureController');
const auth = require('./middleware/authMiddleware');


app.use(express.json())
app.use(
    session({
      resave: true,
      saveUninitialized: false,
      secret: SESSION_SECRET,
    })
  );

app.post('/auth/register', authCtrl.register);
app.post('/auth/login', authCtrl.login);
app.get('/auth/logout', authCtrl.logout);

app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure);
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure);
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure);
app.get('/api/treasure/all', auth.usersOnly, treasureCtrl.getAllTreasure);


massive({
    connectionString: CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
})
.then(dbInstance => {
    app.set('db', dbInstance)
    console.log('db connected')
    app.listen(PORT, () => console.log(`Server running on ${PORT}`))
})
.catch(err => console.log(err))
