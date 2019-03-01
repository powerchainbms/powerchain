var readlineSync = require("readline-sync");
const crypto = require("crypto");
const mongodb = require("mongodb");

const login = async db => {
  // dbConn();
  var choice = readlineSync.question(
    "Choose\n  1.Login \n  2.SignUp\n\n Answer>"
  );
  switch (parseInt(choice)) {
    case 1:
      console.log("Please enter your userID and password to login\n");

      var userID = readlineSync.question("UserID> ");
      console.log("userID: ", userID);

      var password = readlineSync.question("Password> ", {
        hideEchoBack: true
      });
      console.log("Password: ", password);
      var query = {
        userId: userID,
        password: password
      };
      var result = await db.collection("userDetails").findOne(query);
      console.log(result + " inside findone");
      if (result) {
        return result;
      } else {
        console.log("Wrong Credentials!\n\n");
        return await login(db);
      }
      break;
    case 2:
      console.log("Please enter your userID and password to SignUp");

      var uid = readlineSync.question("New UserID> ");
      console.log("userID: ", uid);

      var pass = readlineSync.question("New Password> ", {
        hideEchoBack: true
      });
      var repass = readlineSync.question("Confirm New Password> ", {
        hideEchoBack: true
      });
      if (pass === repass) {
        //save into db as new user
        var userDetails = {
          userId: uid,
          password: pass,
          doj: new Date(),
          userHash: crypto.randomBytes(16),
          accountBalance: 0
        };
        await db.collection("userDetails").insertOne(userDetails);
        console.log("Your details have been saved.\n\nLogin to continue\n\n");
        return await login(db);
      } else {
        console.log("Passwords didn't match!\nPlease retry.\n\n");
        return await login(db);
      }
      break;
    default:
      console.log("Invalid Choice !");
      return await login(db);
  }
};
exports.login = login;
