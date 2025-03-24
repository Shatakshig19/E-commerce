import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, //15 minutes js uses miliseconds for calculation
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days js uses miliseconds for calculation
  });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ mesaage: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    //authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in the signupcontroller", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in the login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; //same name as in setCookies function
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ); // to decode the userId from refresh Token
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in the logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//this will refersh the access token
// now for creating a new access token we will need the refresh token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken; // retrieve refersh token from cookies stored in client's browser

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//How Tokens and cookies Work Together in my Code At Signup:

// A new access token and refresh token are generated.
// These tokens are stored in cookies using the setCookies function.
// The server includes the cookies in its response to the client.

//On Every Request:
// The browser automatically sends the access token cookie with API requests.
// The server validates the token and allows access if valid.

// When the Access Token Expires:
// The client uses the refresh token (stored in another cookie) to request a new access token.
// The server verifies the refresh token and issues a new access token (and possibly a new refresh token).

//Tokens: Purpose and Usage

// Authentication:
// Tokens (like JWTs) store user authentication data in a compact and secure way.
// The access token is used to prove the user's identity on each API request.

// Statelessness:
// Tokens make the server stateless, meaning it doesn't need to store session information in memory or a database. This improves scalability.

// Expiration:
// Short-lived access tokens minimize the risk of compromise.
// Long-lived refresh tokens provide a mechanism to re-issue access tokens without requiring the user to log in again.

//we can use cookies as well as headers for storing and sending tokens but cookies are used for web applications whereas headers are used for APIs and mobile apps.

//HTTP-only Cookies:
//Cross-Site Scripting (XSS) is an attack where an attacker injects malicious JavaScript code into a website.
//If a cookie is not marked as httpOnly, malicious JavaScript can easily access it and potentially steal sensitive information(e.g., session cookies or authentication tokens).
//By marking the cookie as httpOnly, you prevent JavaScript code from accessing the cookie, thus protecting it from XSS attacks.

//The SameSite cookie attribute
//this attribute is a security feature that can be set on cookies to control when and how cookies are sent in cross - site requests.
//It helps protect against Cross - Site Request Forgery(CSRF) attacks, which occur when a malicious site tricks a user into making a request to a different site(e.g., submitting a form or making an API call) without the user's knowledge.

//Here’s a brief summary of the three `SameSite` cookie values:

/*1. SameSite=Strict:  
   - Only sends cookies when the request is from the same site (no cross-site requests).
   - Most restrictive.  
   - Useful for sensitive data like authentication tokens.

2. SameSite=Lax:  
   - Sends cookies for same-site requests and "safe" cross-site requests (e.g., following a link).
   - Less restrictive than `Strict`.  
   - Useful for most applications where cross-site navigation is allowed but not risky actions.

3. SameSite=None:  
   - Sends cookies with all requests, including cross-site ones.
   - Least restrictive and must use Secure to be sent over HTTPS.
   - Used for third-party integrations where cross-site requests are necessary (e.g., OAuth, embedded content).*/

//secure cookie flag
/*In production: Cookies are sent only over HTTPS.
In development: Cookies can be sent over HTTP for ease of development.*/

//The secure flag for cookies tells the browser to only send the cookie over HTTPS connections (secure HTTP).
//In development environments, you might run your application over HTTP for convenience,
// but in production, you want to ensure your cookies are transmitted securely over HTTPS to prevent man -in -the - middle attacks.

//DATABASE AND REDIS
//Here, MongoDB is used to store user details like name, email, and password.
//while Redis is used to store the refresh tokens for managing user sessions.
//Redis is particularly good for short - term, frequently accessed data(like tokens) that need to expire after a set time, making it a great fit for your authentication system.
//You can use Redis to push real-time updates to clients without querying MongoDB, which is not designed for real-time messaging.
//MongoDB handles long-term storage of your application data (users, products, etc.).
//Redis optimizes the performance by storing temporary data, caching, and handling sessions.

///NOTE
/*Yes, you're correct! The **refresh token** is indeed stored in a cookie as well. Here's how the overall flow works, and why the refresh token is stored both in **Redis** (on the server) and in **cookies** (on the client):

Why Store the Refresh Token in Both Places?

1. **In Cookies (Client-Side)**:
   - The refresh token is stored in a **secure, HTTP-only cookie** on the client side.
   - This cookie is automatically sent with every HTTP request (by the browser) to the server.
   - Since the refresh token is **HTTP-only**, it cannot be accessed via JavaScript, providing some protection against **Cross-Site Scripting (XSS)** attacks.
   - The refresh token has a **longer expiration time** (e.g., 7 days) and can be used to refresh the access token once it expires.

2. **In Redis (Server-Side)**:
   - The refresh token is also stored in **Redis** to allow the server to manage and verify its validity.
   - Storing the refresh token on the server ensures that even if someone manages to steal the refresh token from the client-side cookie, it can't be used without also verifying it on the server.
   - The server checks if the refresh token stored in Redis is valid when the client sends it for a new access token.
   - If the refresh token is valid, a new access token is issued. If the refresh token is invalid or expired, the user must log in again.

How It Works Together:

1. **User Logs In**:
   - The server generates both an **access token** (short-lived) and a **refresh token** (long-lived).
   - The **access token** is sent to the client in the response and stored in memory (or in a browser cookie, depending on your setup).
   - The **refresh token** is stored in an **HTTP-only cookie** on the client and also saved in **Redis** on the server.

2. **Access Token Expiration**:
   - When the **access token** expires (after, say, 15 minutes), the client sends the **refresh token** (from the cookie) to the server to obtain a new **access token**.

3. **Server Validates the Refresh Token**:
   - The server reads the refresh token from the cookie (sent with the request), checks its validity by comparing it to the value stored in Redis.
   - If the refresh token is valid, the server generates a new **access token** and sends it back to the client.
   - If the refresh token is invalid or expired, the server responds with an error, and the user needs to log in again.

4. **Expiration of Refresh Token**:
   - After the refresh token expires (e.g., after 7 days), the client will no longer be able to refresh the access token, and they will have to log in again to receive a new refresh token.

Why Both Places?

- **Cookies (Client-Side)**: Storing the refresh token in cookies ensures that the token can be sent with every API request automatically without needing explicit handling by the client. It also ensures that the refresh token is transmitted securely and that the client can access it for future refresh requests.
- **Redis (Server-Side)**: Storing the refresh token on the server allows the server to manage and verify the token's validity, ensuring it hasn’t been tampered with or expired. Redis is an in-memory data store that allows for fast lookups and storage of tokens.

In short, **cookies** are used for ease of sending the refresh token with each request, while **Redis** is used to securely store and manage the token on the server side, ensuring proper session handling and token verification.*/

//Logout
//in logout , refresh cookie needs to be deleted from redis and access cookie and refersh cookie both need to be deleted from cookie also
