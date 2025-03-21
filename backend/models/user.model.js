import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, //ensures no two users have the same email
      lowercase: true,
      trim: true, //removes extra spaces in the beginning or the end
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    cartItems: [
      // array representing the user's shopping cart
      {
        quantity: {
          // specifies the quantity of the product in the cart umber
          type: Number,
          default: 1,
        },
        product: {
          //referces the product model using the product id
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"], // restricts the role to either "customer" or "admin"
      default: "customer",
    },
  },
  {
    timestamps: true, //puts the createAt and updateAt time about the document
  }
);

//Pre-save hook to hash password before saving to the database
userSchema.pre("save", async function (next) {
  // pre-save middleware function that runs before the user document is saved to the database
  if (!this.isModified("password")) return next(); // check whetehr password is modified or new if true then trycatch block will run otherwise next
  try {
    const salt = await bcrypt.genSalt(10); // it will generate a salt(random string). here 10 means number of rounds the algo will use to generate the salt.
    this.password = await bcrypt.hash(this.password, salt); // our password is hashaed with salt resukts im hashed password which is stored um the database.
    next(); // it is called to continue with saving the document
  } catch (error) {
    next(error);
  }
});

//used for checking passwords like if
// john with password 123456 and user inputs 1234567 => then password is incorrect or invalid credentials message is given
userSchema.methods.comparePassword = async function (password) {
  //password is the password entered by the user
  return bcrypt.compare(password, this.password); //bcrypt.compare returns a promise that resolves to true if the passwords match and false if they don't.
};

//yeh user niche define kra haii hashing ke baad taki password hashing ho skee
const User = mongoose.model("User", userSchema); //User is modelName ans users is collection name

//Mongoose automatically pluralizes and lowercases the modelName to create the collection name if not defined as third parameter

export default User;
