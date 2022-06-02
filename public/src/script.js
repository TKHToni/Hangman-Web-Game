
alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');


for (let i = 0; i < alphabet.length; i++) {
  const keyForm = document.createElement("form");
  keyForm.classList.add("keyForm", "col-lg-1");
  keyForm.setAttribute("align","center")
  keyForm.setAttribute("action","/")
  keyForm.setAttribute("method","post")

  const keyButton = document.createElement("button");
  keyButton.classList.add("btn", "btn-outline-dark", "btn-lg", "keybtn");
  keyButton.innerText = alphabet[i];
  keyButton.setAttribute("name", "key");
  keyButton.setAttribute("value", alphabet[i]);

  keyForm.appendChild(keyButton);

  const buttonsDiv = document.getElementsByClassName("keysDiv");
  buttonsDiv[0].appendChild(keyForm);
};
