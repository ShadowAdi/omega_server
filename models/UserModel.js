const { default: mongoose } = require("mongoose");
const bcrypt = require("bcrypt")


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === 'email'; // Only required for email provider
        }
    },
    mobileNo: {
        type: String,
        unique: true,
        required: function () {
            return this.provider === 'email'; // Only required for email provider
        }
    },
    profileImage: {
        type: String,
    },
    provider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email',
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isMediaAllowed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const adminEmails = ["shadowshukla76@gmail.com"];

UserSchema.pre('save', async function (next) {
    if (this.provider === 'email' && this.isModified('password')) {
        try {
            // Check if password exists
            if (!this.password) {
                throw new Error('Password is required');
            }
            const salt = await bcrypt.genSalt(10); // Generate salt
            this.password = await bcrypt.hash(this.password, salt); // Hash the password
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next(); // Skip password hashing for Google login users
    }
});



UserSchema.pre("save", function (next) {
    if (adminEmails.includes(this.email)) {
        this.isAdmin = true;
    }
    next();
});



const User = mongoose.model("User", UserSchema)
module.exports = User