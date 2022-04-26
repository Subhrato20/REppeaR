//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const hash = require('object-hash');
const blockChain = require("./blockchain/blockchain");
const assert = require('assert');
const md5 = require('md5');
const favicon = require('serve-favicon');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const NodeRSA = require("node-rsa");
//const fileUpload = require('express-fileupload');
//const router = express.Router();
//const fs = require('fs');
//const upload = require("./middleware/upload");
//const Web3 = require('web3');
//const Provider = require('@truffle/hdwallet-provider');
//const MyContract = require('./build/contracts/MyContract.json');
//const address = '';
//const privateKey = '';
//const infuraUrl = '';

const blockchain = new blockChain();
assert.throws(
  function() {
    throw new Error("Wrong value");
  },
  function(err) {
    if ((err instanceof Error) && /value/.test(err)) {
      return true;
    }
  },
  "unexpected error"
);

function makeid(length) {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
const currhash = makeid(41);
var prevhash = "Null";
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

/*app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));*/

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  dob: Date,
  password: String,
  adhaar: String,
  secret: String,
  eacc: String,
  balance: Number

  // history: String,

});
const govSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  dob: Date,
  password: String,
  govid: String,

  // history: String,

});

const transactionSchema = new mongoose.Schema({
  seller: String,
  buyer: String,
  amount: Number,
  authorizerHash: String,
  assetHash: String,
});
const assetSchema = new mongoose.Schema({
  email: String,
  hash: String,
  assname: String,
  asstype: String,
  amount: Number,
  status: String,
});

const imgSchema = new mongoose.Schema({
  to: String,
  from: String,
  image: String,
  approved: String,
  imghash: String,
  date: Date,
  //govid: String,
  asshash: String,
  contentType: String,
  path: String,
  email: String,

  // history: String,

});

const paymentSchema = new mongoose.Schema({
  cardno: String,
  cvv: String,
  expmonth: String,
  expyear: String
});

/*const authSchema = new mongoose.Schema({
  authfile:
});*/
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Gov = new mongoose.model("gov", govSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Asset = mongoose.model("Asset", assetSchema);
const Img = mongoose.model("Img", imgSchema);
const Payment = mongoose.model("Payment", paymentSchema);




passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = {

  fetchData: function(callback) {
    var userData = User.find({});
    userData.exec(function(err, data) {
      if (err) throw err;
      return callback(data);
    })

  }
}

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb) {
    let ext = path.extname(file.originalname)
    cb(null, Date.now() + ext)
  }
});

var upload = multer({
  storage: storage
});


var today = new Date();
var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + "  " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
////////////////////////////////////////////////////////// blockChain////////////////////////////////////////////////////////////////////////
// const PROOF = 1560;
// const validProof = (proof)=>{
//   let guessHash = hash(proof);
//   //console.log("hashing: ",guessHash);
//   return guessHash == hash(PROOF);
// };

// let proofOfWork = () => {
//   let proof = 0;
//   while(true){
//     if(!validProof(proof)){
//       proof++;
//     }else{
//       break
//     }
//   }
//   return proof;
// }

// if(proofOfWork() == PROOF){
//   blockchain.addNewTransaction("Sender","Subhrato",1000);
//   let prevHash = blockchain.lastBlock() ? blockchain.lastBlock().hash:null;
//   blockchain.addNewBlock(prevHash);
// }
// console.log("Chain:",blockchain.chain);


/////////////////////////////////////////////////////////get methods////////////////////////////////////////////////////////////////////////
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/gov", function(req, res) {
  res.render("gov");
});
app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/govlog", function(req, res) {
  res.render("govlog");
});



app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/govreg", function(req, res) {
  res.render("govreg");
});

app.get("/sell", function(req, res) {
  res.render("sell");
});
app.get("/ret", function(req, res) {
  res.render("ret");
});

app.get("/pay", function(req, res) {
  res.render("pay");
});

app.get("/secrets", function(req, res) {
  User.find({
    "secret": {
      $ne: null
    }
  }, function(err, foundUsers) {
    //console.log(req.query.id);
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("secrets", {
          usersWithSecrets: foundUsers,
          userid: req.query.id
        });
      }
    }
  });
});
const hashr = [];
for (let i = 0; i < 1000; i++) {
  hashr[i] = makeid(41);
  i += 1;
}
app.get("/history", function(req, res) {
  console.log("Chain:", blockchain.chain)
  // console.log("hello");
  let buyer = req.query.sid;
  let seller = req.query.rid;
  //console.log(req.query.sid + " " + req.query.rid);
  const PROOF = 60;
  const validProof = (proof) => {
    let guessHash = hash(proof);
    console.log("hashing: ", guessHash);
    return guessHash == hash(PROOF);
  };

  let proofOfWork = () => {
    let proof = 0;
    while (true) {
      if (!validProof(proof)) {
        proof++;
      } else {
        break
      }
    }
    return proof;
  }

  if (proofOfWork() == PROOF) {
    blockchain.addNewTransaction(req.query.sid);
    let hash = currhash;
    blockchain.addNewBlock(buyer, seller);
  }
  console.log("Chain:", blockchain.chain)
  Transaction.find({
    sender: req.query.sid
  }, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      res.render("history", {
        users: foundUsers
      });
    }
  })
});



app.get("/account", function(req, res) {
  const userid = req.query.id;
  User.find({
    username: userid
  }, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("account", {
          usersWithdata: foundUsers
        });
      }
    }
  });
});
app.get("/item", function(req, res) {
  Asset.find({
    status: "On Sale"
  }, function(err, foundasset) {
    assert.equal(err, null);
    res.render("items", {
      assets: foundasset
    })
  })
});

app.get("/auth", function(req, res) {
  Img.find({
    approved: "Unknown"
  }, function(err, foundimg) {
    assert.equal(err, null);
    res.render("auth", {
      imgs: foundimg
    })
  })
});


app.get("/stat", function(req, res) {
  const userid = req.query.id;
  console.log(req.query.id);
  Img.find({
    email: userid
  }, function(err, foundimg) {
    assert.equal(err, null);
    res.render("stat", {
      imgs: foundimg
    })
  })
});
app.get("/transaction", function(req, res) {
  const userid = req.query.id;
  res.render("transaction", {
    userfound: userid
  });
});
app.get("/submit", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});
app.get("/balance", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("balance");
  } else {
    res.redirect("/login");
  }
});
app.get("/money", function(req, res) {
  const userid = req.query.id;
  User.find({
    username: userid
  }, function(err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("money", {
          usersWithbalance: foundUsers
        });
      }
    }
  });
});

//////////////////////////////////////////////////////////post methods///////////////////////////////////////////////////////////////////////

app.post("/submit", function(req, res) {
  const submittedSecret = req.body.secret;
  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function() {
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.post("/balance", function(req, res) {
  const submittedbalance = parseInt(req.body.balance);
  User.findById(req.user.id, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        $inc: {
          foundUser.balance = submittedbalance
        };
        foundUser.save(function() {
          res.redirect("/secrets");
        });
      }
    }
  });
});


app.post("/maketransaction", function(req, res) {
  const userid = req.query.id;
  const email = req.body.username;
  const addedbalance = parseInt(req.body.balance);
  const authhash = req.body.authhash;
  const asshash = req.body.asshash;
  const tranobj = new Transaction({
    buyer: userid,
    seller: email,
    amount: addedbalance,
    authorizerHash: authhash,
    assetHash: asshash

  });
  tranobj.save();
  console.log(req.user);
  Asset.findOneAndUpdate({
    hash: asshash
  }, {
    status: 'Sold'
  }, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      //res.render("/secrets")
    }
  });
  User.findOneAndUpdate({
    username: email
  }, {
    $inc: {
      balance: addedbalance
    }
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      // res.redirect("/secrets");
    }
  });
  User.findOneAndUpdate({
    username: userid
  }, {
    $inc: {
      balance: -addedbalance
    }
  }, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/history?sid=" + userid);
    }
  });

});

app.post('/uploadFile', upload.single('upfile'), (req, res, next) => {
  var img = fs.readFileSync(req.file.path);
  var enc_image = img.toString('base64');
  let curr_date = date;
  var ihash = "0";
  var status = "Unknown";
  var finalImg = new Img({
    contentType: req.file.mimetype,
    path: req.file.path,
    from: req.body.name,
    to: req.body.seller,
    asshash: req.body.asshash,
    image: enc_image,
    date: curr_date,
    imghash: ihash,
    approved: status,
    email: req.body.email
  });
  finalImg.save();
  res.redirect("/secrets");
  /*
  db.collection('Img').insertOne(finalImg,(err,result)=>{
    console.log(result);
    if(err) return console.log(err);

    console.log("Saved to database");
    res.contentType(finalImg.contentType);
    res.send(finalImg.image);
  });
*/
});
app.post("/approve", function(req, res) {
  const name = req.body.type;
  const toname = req.body.name;
  var fhash = makeid(16);
  if (name == "Approve") {
    Img.findOneAndUpdate({
      to: toname
    }, {
      approved: 'Approved',
      imghash: fhash
    }, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        res.render("/auth")
      }
    });
  } else {
    Img.findOneAndUpdate({
      to: toname
    }, {
      approved: 'Rejected'
    }, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        res.render("/auth")
      }
    });
  }


  console.log("Done");
  res.redirect("/auth");

});
/*app.post("/stat", function(req, res) {
  const email = req.body.email;
})*/


app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {

  User.register({
    fname: req.body.fname,
    lname: req.body.lname,
    username: req.body.username,
    adhaar: req.body.adhaar,
    dob: req.body.dob,
    balance: 0

  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });

});
app.post("/govreg", function(req, res) {
  const govobj = new Gov({
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.username,
    govid: req.body.govid,
    dob: req.body.dob,
    password: md5(req.body.password)

  });
  govobj.save()
  res.redirect("/auth");

});
app.post("/sell", function(req, res) {

  /*const aname = req.body.aname;
  const atype = req.body.atype;
  const amountadd = parseInt(req.body.amount);*/
  var sellinghash = makeid(16);
  const userid = req.query.id;
  const assobj = new Asset({
    email: req.body.email,
    hash: sellinghash,
    assname: req.body.aname,
    asstype: req.body.atype,
    amount: parseInt(req.body.amount),
    status: "On Sale"
  });
  assobj.save()
  res.redirect("/secrets");
});
app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets?id=" + user.username);
      });
    }
  });

});


app.post("/pay", function(req, res) {
  let cardno = req.body.cn;
  let cvv = req.body.cvv;
  let mon = req.body.Month;
  let year = req.body.Year;
  const key = new NodeRSA({
    b: 1024
  })
  var cardnoenc = key.encrypt(cardno, 'base64');
  var cvvenc = key.encrypt(cvv, 'base64');
  var monenc = key.encrypt(mon, 'base64');
  var yearenc = key.encrypt(year, 'base64');
  const payObj = new Payment({
    cardno: cardnoenc,
    cvv: cvvenc,
    expmonth: monenc,
    expyear: yearenc
  });
  payObj.save();
  res.redirect("secrets");
});

app.post("/govlog", function(req, res) {

  const gov = new Gov({
    username: req.body.username,
    password: md5(req.body.password)
    //console.log(password);
  });

  req.login(gov, function(err) {
    if (err) {
      res.redirect("/govlog");
    } else {
      res.redirect("/auth?");
    }
  });

});






app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports = mongoose.model("Asset", assetSchema);
module.exports = mongoose.model("Gov", govSchema);
module.exports = mongoose.model("Img", imgSchema);
module.exports = mongoose.model("Payment", paymentSchema);
