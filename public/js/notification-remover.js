const errorMessage = document.querySelector(".error-message");
const message = document.querySelector(".message");
function notificationRemover() {
     message.style.display = "none";
     errorMessage.style.display = "block";
}

setTimeout(() => {
     notificationRemover();
}, 1000 * 3);
