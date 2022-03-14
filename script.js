let gadgets = document.getElementById('gadgets');
let cartTable = document.getElementById('cart_table');
let carts = [];
let customer = {};
let sn = 0;

hideCart();

for (let key in products) {
    createGadget(key)
}

function createGadget(i){
    let prod = products[i];
    
    //Create the Gadget Div
    divGadget = document.createElement('div');
    divGadget.className = "gadget";

    divGadget.innerHTML = "<div id='detail"+i+"' onmouseover='showPrice("+i+")' onmouseout='hidePrice("+i+")'><div id='overlay"+i+"'></div><div id='price"+i+"'><p>Price</p><h1>&#8358 "+prod["price"].toLocaleString("en-US")+"</h1></div></div><h1>"+prod['name']+"</h1><button id='cartBtn"+i+"' onclick='addToCart("+i+")'>Add to Cart</button>";

    gadgets.appendChild(divGadget);

    divImg = document.getElementById("detail"+i);
    divImg.style.position = "relative";
    divImg.style.backgroundImage = "url('"+prod["link"]+"')";
    divImg.style.backgroundSize = "100% 100%";
    divImg.style.backgroundPosition = "center";
    divImg.style.backgroundRepeat = "no-repeat";
    divImg.style.width = "100%";
    divImg.style.height = "400px";
}

function showPrice(i){
    document.getElementById("price"+i).style.display="block";
    document.getElementById("overlay"+i).style.display="block";
}
function hidePrice(i){
    document.getElementById("price"+i).style.display="none";
    document.getElementById("overlay"+i).style.display="none";
}

function addToCart(i){
    if(document.getElementById('cartBtn'+i).innerHTML == "Remove From Cart") removeCart(i)
    else{
        carts.push({"prodPos": i, "qty": 1});
        let j = carts.length-1; //Array Position of the Cart Item Added
        document.getElementById('cart_total').innerHTML = carts.length;
        document.getElementById('cartBtn'+i).innerHTML = "Remove From Cart";
        document.getElementById('cartBtn'+i).style.backgroundColor = "Red";
    }
}

function removeCart(i){
    carts = carts.filter(n => n.prodPos != i);
    
    document.getElementById('cart_total').innerHTML = carts.length;
    document.getElementById('cartBtn'+i).innerHTML = "Add to Cart";
    document.getElementById('cartBtn'+i).style.backgroundColor = "#ff7a00";
    loadTable();
    calculateTotal();
    if(carts.length<=0) hideCart();
}
function showCart(){
    loadTable();
    
    if(carts.length<=0) alert("No Item in Cart");
    else{
       document.getElementById('modal').style.display="block";
       document.getElementById('overlay').style.display="block";
       calculateTotal();
    }


}
function loadTable(){
    let sn=0;
    let tbl="<table width='100%' cellspacing='0'><tr><td>S/N</td><td>Item</td><td>Price</td><td>Qty</td><td><button class='remove_cart' onclick='clearCart()'>Clear Cart</button></td></tr>";
    
    Object.values(carts).forEach(item => {
        sn++;
        let i = item.prodPos;
        let prod = products[i];
        tbl+="<tr><td>"+sn+"</td><td>"+prod['name']+"</td><td>"+prod['price'].toLocaleString("en-US")+"</td><td><button disabled onclick='reduceQty("+i+")' class='qty' id='qty_"+i+"'>-</button><span><span id='qty"+i+"'>1</span></span><button onclick='increaseQty("+i+")' class='qty'>+</button></td><td><button class='remove_cart' onclick='removeCart("+i+")'>Remove</button></td></tr>";
    })
    tbl+="</table>";
    document.getElementById('cartTable').innerHTML=tbl;
}

function hideCart(){
    document.getElementById('modal').style.display="none";
    document.getElementById('overlay').style.display="none";
}

function clearCart(){
    Object.keys(carts).forEach(item => delete carts[item]);
    window.location.replace("index.html");
}
function showSummary(payRef){
    document.getElementById('summary').style.display="block";
    document.getElementById('overlay').style.display="block";
    document.getElementById('payRef').innerHTML=payRef;
    document.getElementById('sname').innerHTML = customer.name

    let sn=0;
    let tbl="<table width='100%' cellspacing='0'><tr><td>S/N</td><td>Item</td><td>Price</td><td>Qty</td></tr>";
    
    Object.values(customer.cart).forEach(item => {
        sn++;
        let i = item.prodPos;
        let prod = products[i];
        tbl+="<tr><td>"+sn+"</td><td>"+prod['name']+"</td><td>"+prod['price']+"</td><td>"+item.qty+"</td></tr>";
    })
    tbl+="</table>";
    
    document.getElementById('tblSummary').innerHTML=tbl;
    //calculateTotal();
}
function hideSummary(){
    document.getElementById('summary').style.display="none";
    document.getElementById('overlay').style.display="none";
    window.location.replace("index.html");
}

function calculateTotal(){
    let aggTotal = 0 ;
    let qty = 1 ;
    //console.log(carts);
    
    for (let key in carts) {
        //console.log(i);
        let i = carts[key].prodPos;
        let qty = carts[key].qty;
        let prod = products[i];
        //qty = document.getElementById('qtyVal'+i).value;
        aggTotal += prod["price"] * qty;
    } 
    document.getElementById('total_in_cart').innerHTML = "&#8358 "+aggTotal.toLocaleString("en-US");
    document.getElementById('total_summary').innerHTML = "Total:&#8358 "+aggTotal.toLocaleString("en-US");
    document.getElementById('aggTotal').value = aggTotal;
}

function increaseQty(i){
    let qty = document.getElementById('qty'+i);
    qty.innerHTML++;
    getObjValue(carts, i).qty++;
    if(qty.innerHTML>1) document.getElementById('qty_'+i).disabled=false
    calculateTotal();
}
function reduceQty(i){
    qty = document.getElementById('qty'+i);
    qty.innerHTML--;
    getObjValue(carts, i).qty--;
    if(qty.innerHTML==1) document.getElementById('qty_'+i).disabled=true;
    calculateTotal();
}

function getObjValue(arr, value) {
    for (var i=0, iLen=arr.length; i<iLen; i++) {
      if (arr[i].prodPos == value) return arr[i];
    }
  }
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

function checkOut() {
    customer.name = document.getElementById('cname').value;
    customer.email = document.getElementById('cemail').value;
    customer.phone = document.getElementById('cphone').value;
    customer.cart = carts;
    console.log(customer);
    hideCart();
    payWithPaystack();
}
function payWithPaystack() {
    //e.preventDefault();
    let handler = PaystackPop.setup({
      key: 'pk_test_2e99205cc039466cea117a5c50ad190dcf1704f5', // Replace with your public key
      email: document.getElementById("cemail").value,
      amount: document.getElementById("aggTotal").value * 100,
      ref: ''+Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
      // label: "Optional string that replaces customer email"
      onClose: function(){
        alert('Window closed.');
      },
      callback: function(response){
        //let message = 'Payment complete! Reference: ' + response.reference;
        //alert(message);
        showSummary(response.reference);
        //console.log(customer);
      }
    });
    handler.openIframe();
  }

  function checkField(a){
    console.log(a)  
    field = document.getElementById(a).value;
    if(!field){
        document.getElementById(a+"_error").style.display = "block";
        document.getElementById(a+"_error").innerHTML = "This Field cannot be Blank";
        document.getElementById(a).style.border = "2px solid red";
    }
    else { 
        if(a=="cemail"){
            console.log(field.indexOf('@'));
            if(field.indexOf('@') < 1){
                document.getElementById(a+"_error").innerHTML = "Invalid Email Address";
                document.getElementById(a+"_error").style.display = "block";
                document.getElementById(a).style.border = "2px solid red";
            }
            else {
                document.getElementById(a).style.border = "2px solid green";
                document.getElementById(a+"_error").style.display = "none";
                document.getElementById('checkout').disabled = false;
            }
        } 
        else {
            document.getElementById(a).style.border = "2px solid green";
            document.getElementById(a+"_error").style.display = "none";
        }
    }
  }