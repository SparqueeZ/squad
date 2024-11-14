// const pool = require("../config/db");
// const bcrypt = require("bcrypt");

// const User = {
//   // Méthode pour obtenir tous les utilisateurs
//   getAllUsers: (callback) => {
//     const sql = "SELECT * FROM users";
//     pool.query(sql, (err, results) => {
//       if (err) {
//         return callback(err, null);
//       }
//       callback(null, results);
//     });
//   },

//   // Méthode pour ajouter un nouvel utilisateur
//   addUser: (email, login, password, role, display_name, callback) => {
//     bcrypt.hash(password, 10, (err, hash) => {
//       if (err) {
//         return callback(err, null);
//       }

//       const sql =
//         "INSERT INTO users (email, login, password, role, display_name) VALUES (?, ?, ?, ?, ?)";
//       const values = [email, login, hash, role, display_name];

//       pool.query(sql, values, (err, result) => {
//         if (err) {
//           return callback(err, null);
//         }
//         callback(null, {
//           u_id: result.insertId,
//           email,
//           login,
//           role,
//           display_name,
//         });
//       });
//     });
//   },

//   // Méthode pour vérifier les informations de connexion
//   authenticateUser: (login, password, callback) => {
//     const sql = "SELECT * FROM users WHERE login = ?";
//     pool.query(sql, [login], (err, results) => {
//       if (err) {
//         return callback(err, null);
//       }
//       if (results.length === 0) {
//         return callback(null, false); // Utilisateur non trouvé
//       }

//       const user = results[0];
//       bcrypt.compare(password, user.password, (err, isMatch) => {
//         if (err) {
//           return callback(err, null);
//         }
//         if (isMatch) {
//           const result = {
//             // id: user.u_id,
//             role: user.role,
//             display_name: user.display_name,
//             email: user.email,
//           };
//           callback(null, result);
//         } else {
//           callback(null, false); // Mot de passe incorrect
//         }
//       });
//     });
//   },

//   // Méthode pour obtenir un utilisateur par email
//   getUserByEmail: (email, callback) => {
//     const sql = "SELECT * FROM users WHERE email = ?";
//     pool.query(sql, [email], (err, results) => {
//       if (err) {
//         return callback(err, null);
//       }
//       if (results.length === 0) {
//         return callback(null, false); // Utilisateur non trouvé
//       }
//       callback(null, results[0]);
//     });
//   },

//   // Méthode pour mettre à jour un utilisateur
//   updateUser: (id, user, callback) => {
//     const sql = "UPDATE users SET ? WHERE id = ?";
//     pool.query(sql, [user, id], (err, result) => {
//       if (err) {
//         return callback(err, null);
//       }
//       callback(null, result);
//     });
//   },
// };

// module.exports = User;
