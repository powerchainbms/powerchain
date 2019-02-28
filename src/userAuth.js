var readlineSync = require("readline-sync");
const crypto = require("crypto");

const login = () => {
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
      if (userID === "mahesh" && password === "123") {
        return { userID: userID, password: password };
      } else {
        console.log("Invalid UserID / Password\n\n");
        login();
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
        console.log(
          "User details saved to the DataBase, Please Relogin to continue.\n\n"
        );
        // login();
        return userDetails;
      } else {
        console.log("Passwords didn't match!\nPlease retry.\n\n");
        login();
      }
      break;
    default:
      console.log("Invalid Choice !");
      login();
  }
};
exports.login = login;
