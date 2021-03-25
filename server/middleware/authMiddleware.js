module.exports = {
    usersOnly: (req, res, next) => {
      if (!req.session.user) {
        return res.status(401).send("Please logeth in to enter fully into the Dragon's Lair");
      }
      next();
    },
    adminsOnly: (req, res, next) => {
      if (!req.session.user.isAdmin) {
        return res.status(403).send('You are not an admin');
      }
      next();
    }
  };