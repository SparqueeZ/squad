// const User = require("../models/user");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { getReadableTimestampParis } = require("../utils/dateUtils");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");
// const pool = require("../config/db");

// // Créer un transporteur SMTP réutilisable en utilisant les informations de votre propre service SMTP
// const transporter = nodemailer.createTransport({
//   host: "shapee.re",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "test@shapee.re",
//     pass: "DOQM~nQnE*x0",
//   },
// });

// // Contrôleur pour obtenir tous les utilisateurs
// exports.getAllUsers = (req, res) => {
//   console.log(`${getReadableTimestampParis()} GET request : getAllUsers`);
//   User.getAllUsers((err, users) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(users);
//   });
// };

// // Contrôleur pour obtenir un utilisateur par ID
// exports.getUserById = (req, res) => {
//   const userId = req.params.u_id;
//   User.getUserById(userId, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (!user) {
//       return res.status(404).json({ message: "User not found1" });
//     }
//     res.json(user);
//   });
// };

// exports.addUser = (req, res) => {
//   const { email, login, password, role, display_name } = req.body;

//   // Ajoutez une validation basique des entrées, si nécessaire
//   if (!email || !login || !password || !role || !display_name) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   User.addUser(email, login, password, role, display_name, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(201).json(user);
//   });
// };

// exports.login = (req, res) => {
//   const { login, password } = req.body;
//   const JWT_SECRET = process.env.JWT_SECRET;

//   // Vérification des entrées
//   if (!login || !password) {
//     return res.status(400).json({ error: "Login and password are required" });
//   }

//   User.authenticateUser(login, password, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (!user) {
//       return res.status(401).json({ error: "Invalid login or password" });
//     }

//     // Générer un token JWT
//     const token = jwt.sign(
//       {
//         role: user.role,
//         display_name: user.display_name,
//         email: user.email,
//       },
//       JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.cookie("token", token, {
//       httpOnly: true,
//       // secure: true,
//       sameSite: "strict",
//     });

//     res.json({ message: "Login successful", user });
//     console.log(
//       `${getReadableTimestampParis()} User "${
//         user.display_name
//       }" succesfully connected.`
//     );
//   });
// };

// exports.logout = (req, res) => {
//   console.log(`${getReadableTimestampParis()} POST Request : logout`);
//   res.clearCookie("token");
//   res.json({ message: "Logout successful" });
// };

// exports.profile = (req, res) => {
//   const userId = req.user.email;
//   console.log(`${getReadableTimestampParis()} GET request : profile`);

//   // Utilisez userId pour récupérer les informations de l'utilisateur depuis la base de données
//   User.getUserByEmail(userId, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (!user) {
//       return res.status(404).json({ error: "User not found2" });
//     }
//     // Retournez les informations de l'utilisateur
//     res.status(200).json({ user });
//   });
// };

// // Contrôleur pour mettre à jour un utilisateur
// exports.updateUser = (req, res) => {
//   const userId = req.params.id;
//   const updatedUser = {
//     name: req.body.name,
//     email: req.body.email,
//   };

//   User.updateUser(userId, updatedUser, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found3" });
//     }
//     res.json({ message: "User updated successfully" });
//   });
// };

// // Contrôleur pour supprimer un utilisateur
// exports.deleteUser = (req, res) => {
//   const userId = req.params.id;
//   User.deleteUser(userId, (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "User not found4" });
//     }
//     res.json({ message: "User deleted successfully" });
//   });
// };

// exports.requestPasswordReset = (req, res) => {
//   const { email } = req.body;

//   User.getUserByEmail(email, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     if (!user) {
//       return res.status(404).json({ error: "User not found5" });
//     }

//     const token = jwt.sign({ userId: user.u_id }, "your_jwt_secret", {
//       expiresIn: "1h",
//     });

//     const resetUrl = `http://192.168.1.20/reset-password?token=${token}`;

//     const mailOptions = {
//       from: "test@shapee.re",
//       to: user.email,
//       subject: "Password Reset",
//       html: `
//         <p>You requested a password reset. Click the following link to reset your password:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//       `,
//     };

//     transporter.sendMail(mailOptions, (err, info) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       res.status(200).json({ message: "Password reset email sent" });
//     });
//   });
// };

// exports.resetPassword = (req, res) => {
//   const { token, newPassword } = req.body;

//   try {
//     const decoded = jwt.verify(token, "your_jwt_secret");
//     const userId = decoded.userId;

//     bcrypt.hash(newPassword, 10, (err, hash) => {
//       if (err) {
//         return res.status(500).json({ error: err.message });
//       }

//       const updateSql = "UPDATE users SET password = ? WHERE u_id = ?";
//       pool.query(updateSql, [hash, userId], (err) => {
//         if (err) {
//           return res.status(500).json({ error: err.message });
//         }

//         res.status(200).json({ message: "Password updated successfully" });
//       });
//     });
//   } catch (err) {
//     res.status(401).json({ error: "Invalid or expired token" });
//   }
// };
