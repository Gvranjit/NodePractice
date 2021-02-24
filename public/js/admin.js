const deleteProduct = (btn) => {
     const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;

     const productId = btn.parentNode.querySelector("[name=productId]").value;

     const productElement = btn.closest("article");

     fetch("/admin/delete-product/" + productId, {
          //also can be used to send data, despite the name
          method: "DELETE",
          headers: { "csrf-token": csrfToken },
     })
          .then((rsult) => {
               return rsult.json();
          })
          .then((data) => {
               console.log(data);
               productElement.parentNode.removeChild(productElement);
          })
          .catch((err) => {
               console.log(err);
          });
};
