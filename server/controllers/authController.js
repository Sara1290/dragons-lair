const bcrypt = require('bcryptjs')

module.exports = {
    //CREATE A REGISTER METHOD AND USE ASYNC AWAIT. DESTRUCTURE U,P,ISADM OF THE REQ BODY.
    //GET THE DATABASE INSTANCE AND RUN THE SQL FILE GET_USER PASSING IN USERNAME - WILL CHECK TO SEE IF IT'S TAKEN.
    //SET THE VALUE OF THIS SQL QUERY TO A VARIABLE CALLED RESULT. SQL QUERIES COME BACK AS AN ARRAY SO USERNAME SHOULD BE IN [].
    //TAKE THE FIRST ITEM OF THE ARRAY AND SET IT TO ANOTHER CONST VARIABLE CALLED EXISTINGUSER.
    //IF EXISTING USER IS DEFINED SEND A RES STATUS OF 409 AND TELL THEM USERNAME TAKEN. if STATEMENT.
    //OTHERWISE CREATE A CONST VAR CALLED SALT = BCRYPT GEN SALT SYNC WHO'S ARGUMENT IS 10.
    //CREATE YET ANOTHER CONST VAR CALLED HASH AND SET IT TO BCRYPT HASH SYNC WHO ARGUMENTS ARE PASSWORD AND SALT. 
    //AWAIT WILL BE USED AGAIN RUNNING THE REGISTER_USER SQL FILE PASSING IN ISADMIN USERNAME AND HASH STORED TO YET ANOTHER CONST
    //VAR NAMED REGISTERED USER.
    //STORE THE FIRST ITEM IN REGISTERED USER ARRAY TO VARIABLE CALLED USER.
    //THIS IS OUR NEWLY CREATED USER OBJECT.
    //SET REQ.SESSION.USER TO BE AN OBJECT WITH PROPERTIES ISADMIN, ID AND USERNAME = TO USER.THEMSELVES.
    //*DEEP BREATH* SEND A STATUS OF 201 AND THE USER OBJECT ON SESSION.
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body;
        const dbInstance = req.app.get('db');

        const result = await dbInstance.get_user([username]);
        const existingUser = result[0];
        if (existingUser) {
            return res.status(409).send('Username Taken');
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const registeredUser = await dbInstance.register_user([isAdmin, username, hash]);
        const user = registeredUser[0];

        req.session.user = { isAdmin: user.is_admin, username: user.username, id: user.id };
        return res.status(201).send(req.session.user);
    },
    login: async (req, res) => {
        const { username, password } = req.body;
        const foundUser = await req.app.get('db').get_user([username]);
        const user = foundUser[0];
        if (!user) {
            return res.status(401).send("User not found. Register YOURSELF PLZ");
            }
        const isAuthenticated = bcrypt.compareSync(password, user.hash);
        if (!isAuthenticated) {
            return res.status(403).send(" AH AH AH, YOU DIDN'T SAY THE MAGIC WORD");
        }
        req.session.user = { isAdmin: user.is_admin, id: user.id, username: user.username };
        return res.send(req.session.user);
    },
    logout: (req, res) => {
        req.session.destroy();
        return res.sendStatus(200);
    }
}