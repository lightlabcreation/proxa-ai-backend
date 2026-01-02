// const jwt = require("jsonwebtoken");
// const db = require("../../config/config");
// const User = db.user;
// const Department = db.department;
// const accessSecretKey = process.env.ACCESS_SECRET_KEY;

// const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       console.log("[AUTH] Authorization header missing");
//       return res.status(401).json({ message: "Authorization header missing" });
//     }

//     const token = authHeader.split(" ")[1];
    
//     if (!accessSecretKey) {
//       console.error("[AUTH] ACCESS_SECRET_KEY is not set in environment variables");
//       return res.status(500).json({ message: "Server configuration error" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, accessSecretKey);
//     } catch (jwtError) {
//       console.error("[AUTH] Token verification failed:", jwtError.message);
//       if (jwtError.name === 'TokenExpiredError') {
//         return res.status(401).json({ message: "Token expired" });
//       }
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // 🔐 TOKEN MUST HAVE id & type
//     if (!decoded.id || !decoded.type) {
//       console.error("[AUTH] Invalid token payload - missing id or type:", { id: decoded.id, type: decoded.type });
//       return res.status(401).json({ message: "Invalid token payload" });
//     }

//     // 🔥 NORMALIZE req.user (THIS FIXES EVERYTHING)
//     req.user = {
//       id: decoded.id,
//       email: decoded.email,
//       userType: decoded.type, // ✅ convert `type` → `userType`
//     };

//     console.log("[AUTH] User authenticated:", { id: req.user.id, email: req.user.email, userType: req.user.userType });
//     next();
//   } catch (error) {
//     console.error("[AUTH] Authentication Error:", error.message);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// module.exports = authenticate;



const jwt = require("jsonwebtoken");
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] Authorization header missing");
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!accessSecretKey) {
      console.error("[AUTH] ACCESS_SECRET_KEY is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, accessSecretKey);
    } catch (jwtError) {
      console.error("[AUTH] Token verification failed:", jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    if (!decoded.id || !decoded.type) {
      console.error("[AUTH] Invalid token payload - missing id or type:", { id: decoded.id, type: decoded.type });
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 🔥 CRITICAL: Ensure id is a number
    const userId = Number(decoded.id);
    if (isNaN(userId)) {
      console.error("[AUTH] Invalid user ID in token:", decoded.id);
      return res.status(401).json({ message: "Invalid user ID in token" });
    }

    req.user = {
      id: userId, // ✅ Now safely a number
      email: decoded.email || null,
      userType: decoded.type,
    };

    console.log("[AUTH] User authenticated:", { id: req.user.id, email: req.user.email, userType: req.user.userType });
    next();
  } catch (error) {
    console.error("[AUTH] Authentication Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;