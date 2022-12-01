let prices = [];
const cartItems = '.cart__items';

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image, price: salePrice }) {
  // nessa função usei o código do Rodolfo Pinheiro de referência para a correção de um erro meu, detalhado abaixo. Fonte: https://github.com/tryber/sd-014-a-project-shopping-cart/pull/98/files
  const itemsList = document.querySelector('.items'); // estava errando nessa linha, porque estava usando .getElementsByClassName, que retorna não o elemento, mas uma HTMLlist. Usando o querySelector, como o Rodolfo usou, consegui acessar o elemento diretamente.
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('span', 'item__price', `R$ ${salePrice.toFixed(2)}`));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  itemsList.appendChild(section);
  
  return itemsList;
}

// não usei a função abaixo:

// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }

function cartItemClickListener(event) {
  event.remove();
}

const sum = async () => {
  const totalPrice = document.querySelector('.total-price');
  const number = prices.reduce((acc, price) => acc + price, 0);
  totalPrice.innerText = `Total: R$${number}`; // referencia: https://stackoverflow.com/questions/3612744/remove-insignificant-trailing-zeros-from-a-number
};

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const cart = document.querySelector(cartItems); // o item a ser criado será armazenado aqui.
  
  const li = document.createElement('li'); 
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  
  cart.appendChild(li); // afixa o item no carrinho.

  window.localStorage.setItem(name, li.innerText); // armazena os dados do item no localStorage.

  li.addEventListener('click', cartItemClickListener.bind(this, li)); // referencia para o .bind: https://stackoverflow.com/questions/35667267/addeventlistenerclick-firing-immediately.
  li.addEventListener('click', () => window.localStorage.removeItem(name)); // apaga o item correspondente no storage.
  li.addEventListener('click', () => {
    prices = prices.filter((price) => price !== salePrice);
    sum();
  });
  return li;
}

const addToCart = async (id) => { // puxa a API com dados do item a ser adicionado ao cart
  const myFetch = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const response = await myFetch.json();
  createCartItemElement(response); // chama a função createCartItemElement passando os dados do item a ser adicionado
  prices.push(response.price);
  sum();
};

const loadCart = () => { // carrega os itens do carrinho ao iniciar a pág.
  const storage = Object.keys(window.localStorage).sort(); // referência: https://trybecourse.slack.com/archives/C023YHXAEGM/p1628892824387200.

  storage.forEach((key) => { // para cada item no storage será criado um correspondente no carrinho.
    const listItem = document.createElement('li'); // cria o item da lista...
    listItem.innerText = window.localStorage.getItem(key); // ...atribui o valor armazenado no storage... 
    document.querySelector(cartItems).appendChild(listItem); // ... e afixa o li no carrinho.
    
    listItem.addEventListener('click', cartItemClickListener.bind(this, listItem)); // adiciona a opção de apagar o item recém-criado...
    listItem.addEventListener('click', () => window.localStorage.removeItem(key)); // ... e o par chave-valor correspondente no storage. 
    sum();
  });
};

const addListenerToButtons = () => {
  const buttonArr = Array.from(document.getElementsByClassName('item__add')); // junta todos os botões num array.
  const itemArr = Array.from(document.getElementsByClassName('item__sku')); // junta todos os itens num array .
  buttonArr.forEach((button, i) => button.addEventListener('click', // adiciona um listener em cada botão...
  addToCart.bind(this, itemArr[i].innerHTML.toString()))); // ...que executa a função addToCart, adicionando dados do item no carrinho. 
};

const getApi = async (searchItem) => {
    const loading = document.createElement('h1'); // esse primeiro bloco abaixo adiciona a exibição do texto 'loading' à página.
    loading.classList.add('loading');
    loading.innerHTML = 'LOADING';
    document.querySelector('.items').appendChild(loading);
  
    try {
    let list = [];
    const myFetch = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${searchItem}`); // pega os items que se relacionam à busca.
    const response = await myFetch.json();
      list = await response.results; // armazena os dados dos itens. 
      document.querySelector('.items').removeChild(loading); // com os itens carregados, o loading some.
      list.forEach((item) => createProductItemElement(item));// para cada item é feito um card.
    addListenerToButtons(); // função para adicionar listener aos botões de cada card.
    } catch (error) {
      console.log(error);
}
};

const emptyCart = () => {
  const button = document.querySelector('.empty-cart');
  button.addEventListener('click', () => {
    document.querySelector(cartItems).innerHTML = '';
    localStorage.clear(); // apaga itens dentro do carrinho.
    });
};

window.onload = () => { 
 getApi('computador');
 loadCart();
 emptyCart();
};