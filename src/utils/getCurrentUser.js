const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

// module.exports = async (token, userModel) => {
//   // verify token
//   const { payload } = jwt.verify(token, secret);
//   // query user in db with id in token's payload
//   const currentUser = await userModel.findById(payload).exec();
//   // return user to be set in ctx
//   return currentUser;
// };

module.exports = async (token, usersLoader) => {
  // verify token
  const { payload } = jwt.verify(token, secret);
  // load user to users' loader
  const currentUser = await usersLoader.load(payload);
  // return user to be set in ctx
  return currentUser;
};
