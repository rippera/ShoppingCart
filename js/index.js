// contentfull
const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "oelsqos80yn0",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken:
      "LsHC6LvBVaUou1d1BMn3h7pwv7yC59CaWw9acnln2mY"
  });

// variable
const cartBox = document.querySelector('.shopping__icon_box');
const cancel = document.querySelector('.cancel');
const cartInfo = document.querySelector('.shopping__info');
const mainWrapper = document.querySelector('.mainc__wrapper');
const mainContent = document.querySelector('.main__content');
const totalOut = document.querySelector('.total__out');
const cartContent = document.querySelector('.cart__content');
const cartItems = document.querySelector('.shopping__info');
const clearBtn = document.querySelector('.clear__btn');
let cart = [];
let buttonsDOM = [];

// Get Products From DataBase
class Products {
    async getProducts(){
        try{
        let contentful = await client.getEntries({
            content_type: "appleProducts"
            });
            // let result = await fetch('../db/products.json');
            // let data = await result.json();
            let products = contentful.items;
            products = products.map(item =>{
                const {title, price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            })
            return products;
        }catch(err){
            console.log(err);
        }
    }
}

// User Interface
class UI {
    printItems(products){
        let itemResult = '';
            products.forEach(product => {
            itemResult += `
            <div class="col-lg-4">
                <div class="product__box relative">
                    <img src="${product.image}" alt="">
                    <h1 class="main__title">${product.title}</h1>
                    <p class="main__intro">$${product.price}</p>
                    <button class="product__info" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                        add on cart
                    </button>
                </div>
            </div>
            `;
        });
        mainContent.innerHTML = itemResult;
    }
    getButton() {
        const buttons = [...document.querySelectorAll('.product__info')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerHTML = ` <i class="fas fa-shopping-cart"></i> In Cart`;
                button.disabled = true;
            }
            button.addEventListener('click',(e)=>{
                e.target.innerHTML = ` <i class="fas fa-shopping-cart"></i> In Cart`;
                e.target.disabled = true;
                let carItem = {...Storage.getProduct(id), amount:1};
                cart = [...cart, carItem];
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(carItem);
            });
        });
    }
    setCartValue(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        totalOut.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartItems.innerHTML = itemsTotal;
        
    }
    addCartItem(item){
        let cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart__item');
        cartItemDiv.innerHTML =`
            <div class="bag__info_wrapper  d-flex">
                <div class="bag__info_box d-flex">
                    <img class="bag__img" src="${item.image}" alt="">
                    <div class="info__">
                        <h1 class="bag__info_title">${item.title}</h1>
                        <p class="bag__info_price">$${item.price}</p>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                </div>
                <div class="items">
                    <i class="up fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="count">${item.amount}</p>
                    <i class="down fas fa-chevron-down" data-id=${item.id}></i>
                </div>
            </div>
        `;
        cartContent.appendChild(cartItemDiv);
    }
    setUPP (){
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.chosenProduct(cart);
    }
    chosenProduct(cart){
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic(){
        clearBtn.addEventListener('click',()=>{
            this.clearCart();
        });
        cartContent.addEventListener('click',(e)=>{
            if (e.target.classList.contains('remove-item')) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(cartContent.children[0]);
                this.removeItem(id);
            }
            else if(e.target.classList.contains('up')){
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(e.target.classList.contains('down')){
                let removeAmount = e.target;
                let id = removeAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    removeAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(cartContent.children[0]);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart(){
        let cartItems = cart.map(item=>item.id);
        cartItems.forEach(id =>this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id){
        cart = cart.filter(item => item.id !==id );
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingelButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add on cart`;
    }
    getSingelButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
// LocalStorage
class Storage {
    static saveProducts(products){
        localStorage.setItem('products',JSON.stringify(products));
    }
    static saveCart (cart){
        localStorage.setItem('cart',JSON.stringify(cart))
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static getCart (){
        // return (localStorage.getItem('cart'))?JSON.parse(localStorage.getItem('cart')): [];
        if (localStorage.getItem('cart')) {
            return JSON.parse(localStorage.getItem('cart'));
        } else {
            return [];
        }
    }
}
cartBox.addEventListener('click',()=>{
    document.querySelector('.bag__wrapper').classList.add('active');
    document.querySelector('.bag__parent_box').classList.add('bag_active');
});
cancel.addEventListener('click',()=>{
    document.querySelector('.bag__wrapper').classList.remove('active');
    document.querySelector('.bag__parent_box').classList.remove('bag_active');
});
document.addEventListener('DOMContentLoaded',()=>{
    const ui = new UI();
    const products = new Products();
    ui.setUPP();
    products.getProducts()
    .then(products =>{
        ui.printItems(products);
        Storage.saveProducts(products);
    })
    .then(()=>{
        ui.getButton();
        ui.cartLogic();
    })
});