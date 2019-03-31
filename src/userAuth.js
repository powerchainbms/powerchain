var readlineSync = require("readline-sync");
const crypto = require("crypto");
const mongodb = require("mongodb");
const wallet_1 = require("./wallet");

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
      var cName = await manageChannel(db);
      if (pass === repass) {
        //save into db as new user
        var userDetails = {
          userId: uid,
          password: pass,
          doj: new Date(),
          channelName: cName,
          publicKey: wallet_1.getPublicFromWallet(),
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

manageChannel = async db => {
  let choiceM = readlineSync.question(
    "enter\n 1. TO start a new channel\n 2. To join a existing channel\n\n Answer>"
  );
  switch (parseInt(choiceM)) {
    case 1:
      let name1 = readlineSync.question("Enter your new Channel name: ");
      let query1 = { name: name1 };
      let result1 = await db.collection("Channels").findOne(query1);
      if (result1) {
        console.log(
          "\n\nSorry another channel already exists with name: " +
            name1 +
            " ,Please retry\n"
        );
        return await manageChannel(db);
      } else {
        console.log("\nYour custom channel (" + name1 + ") is good to go\n");
        await db.collection("Channels").insertOne(query1);
        console.log("\nYour custom channel (" + name1 + ") has been created\n");
        return name1;
      }
      break;
    case 2:
      let name2 = readlineSync.question(
        "Enter name of the channel you want to join: "
      );
      let query2 = { name: name2 };
      let result2 = await db.collection("Channels").findOne(query2);
      if (result2) {
        console.log("\n" + name2 + " channel exists, adding you into it...");
        return name2;
      } else {
        console.log(
          "\nThe channel (" + name2 + ") doesnt exists, Please retry.\n"
        );
        return await manageChannel(db);
      }
  }
};

exports.login = login;
