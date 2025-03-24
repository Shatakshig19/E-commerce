import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res
        .status(400)
        .json({ message: "Unauthorized - No access Token provided" });
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password"); //-password is done because we donot want the password to be sent

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user; // data of the user is put in the request for further use

      next(); // to move to the next middleware which is adminRoute in this case
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access token expired" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectroute middleware", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid access tokn" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(400).json({ message: "Access denied - Admin only" });
  }
};

/*Middleware:

Runs before the route handler (or other middleware).
Typically processes or validates the request.
Can stop the request-response cycle (e.g., if there's an error) or pass control using next().


Route Handler:

Responsible for sending the final response to the client.
Usually the last function in the request lifecycle unless another middleware is executed afterward.*/

/*While tokens (access and refresh) provide the authentication mechanism, middleware like protectRoute ensures:

Token validation for every request.
Authorization enforcement to prevent unauthorized access.
Centralized token handling to keep code clean and maintainable.
Access and refresh tokens are tools, but middleware acts as the framework to use these tools securely and efficiently.*/
