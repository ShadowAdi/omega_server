const express = require("express")
const { RegisterUser, LoginUser, GetUsers, AddUser, DeleteUser, UpdateUser, GetUser, CreateChat, GetMessages, ExportData, ImportData } = require("../controllers/UserController")
const passport = require("passport")
const jwt = require('jsonwebtoken');
const router = express.Router()

router.get("/", async function (req, res) {
    res.send("hii")
})

router.post("/register", RegisterUser)
router.post("/login", LoginUser)
router.get("/users", GetUsers)
router.post("/addUser", AddUser)
router.delete("/deleteUser/:id", DeleteUser)
router.get("/getUser/:id", GetUser)
router.put("/updateUser/:id", UpdateUser)
router.post("/chat", CreateChat)
router.get("/messages", GetMessages)
router.get("/export-users", ExportData)
router.post("/import-users", ImportData); // Make sure this matches the frontend URL


router.get("/auth/google", (req, res, next) => {
    console.log("Redirect URI Sent:", 
        "https://omega-server-k372.onrender.com/api/auth/google/callback");
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })(req, res, next);
});


router.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "https://omega-client-jet.vercel.app" }),
    (req, res) => {
        const token = jwt.sign(
            { id: req.user._id, email: req.user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.redirect(`https://omega-client-jet.vercel.app?token=${token}`);
    });




router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("https://omega-client-jet.vercel.app");
    });
});





module.exports = { router }