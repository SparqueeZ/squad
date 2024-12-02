module.exports = (io, socket) => {
  // Gérer les événements spécifiques à ce type de socket
  socket.on("anotherEvent", (data) => {
    // Logique pour traiter l'événement
    console.log("Another event received:", data);
  });
};
