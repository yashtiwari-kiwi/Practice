require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

var User = require("../models/user.model");
var auth = require("../middleware/auth");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        var instance = new User(req.body);
    
        if (!(name && email && password)) {
          res.status(400).send("All inputs are required!!");
        }

        const olduser = await User.findOne({ email })
        if (olduser) {
            res.status(409).send('User already exists. Proceed to login')
        }

        encryptedPassword = await bcrypt.hash(password, 10);


        const user = await instance.save({
            name,
            email,
            password: encryptedPassword,
        });

        const token = jwt.sign({
            user_id: user._id
        }, process.env.TOKEN_KEY)

        user.token = token
        var tokenSave = await instance.save({token})

        console.log(user, tokenSave);
        res.status(201).json(user);
      } catch (err) {
        console.log(err);
      }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!(email && password)) {
            res.status(400).send("All inputs are required!!");
          }

        const user = await User.findOne({ email })
         if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign(
                { user_id: user._id}, process.env.TOKEN_KEY
            )
            user.token = token
            
         }
         res.status(201).json(user)
         
    } catch (err) {
        console.log(err);
    }
}

exports.profile = auth, async (req, res) => {
    res.send('')
}

exports.read =  (req, res) => {
    User.findOne(req.body._id)
    .then((user) => {
      if (!user) {
        return res.send({ message: "User not found with this id" });
      }
      res.send(user), console.log(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.send(
          "Could not find the user with this id, Please Check again"
        );
      }
    })
}

exports.readAll = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

  try {
    const user = await User.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments();

    res.json({
      user,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error(err.message);
  }
}

exports.update = (req, res) => {
    User.findByIdAndUpdate(req.params._id, req.body, { new: true })
    .then((user) => {
      if (!user) {
        return res.send({ message: "User not found with this id" });
      }
      res.send(user), console.log(user);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.send(
          "Could not find the user with this id, Please Check again"
        );
      }
    });
}

exports.delete = (req, res) => {
    User.findByIdAndRemove(req.params._id)
    .then((user) => {
      if (!user) {
        return res.send({
          message: "user not found with this id ",
        });
      }
      res.send({ message: "User deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.send("User not found with id");
      }
      return res.send("Could not delete User with this  id ");
    });
}