var express = require("express");
var router = express.Router();

var User = require("../controller/user.controller");
var auth = require("../middleware/auth")

router.post("/register", User.register);

router.post("/login", User.login)

router.get("/profile", User.profile)

router.get("/read/:_id", User.read);

router.get("/readall", User.readAll);

router.put("/update/:_id", User.update);

router.delete("/delete/:_id", User.delete)


module.exports = router;
