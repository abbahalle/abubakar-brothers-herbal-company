// ==========================================
//  - FINAL COMPLETE SCRIPT.JS
// ==========================================


// ==========================================
// 1. SAFE LOCAL STORAGE
// ==========================================

function safeGetJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return fallback;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("LocalStorage read error:", error);
        return fallback;
    }
}


function safeSetJSON(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {
        console.error("LocalStorage save error:", error);

        alert(
            "An samu matsala wajen ajiye bayanai."
        );

        return false;
    }
}


// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function jsString(value) {
    return JSON.stringify(
        String(value ?? "")
    );
}


function formatMoney(value) {
    const number = Number(value) || 0;

    return number.toLocaleString();
}


function getCurrentUser() {
    return safeGetJSON(
        "currentUser",
        null
    );
}


function getOrderStatusIndex(status) {

    const statuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];

    const index =
        statuses.indexOf(status);

    return index >= 0 ? index : 0;
}


function orderBelongsToUser(
    order,
    user
) {

    if (!order || !user) {
        return false;
    }


    if (
        order.customerEmail &&
        user.email
    ) {
        return (
            String(order.customerEmail)
                .toLowerCase() ===
            String(user.email)
                .toLowerCase()
        );
    }


    return (
        String(order.customerName || "")
            .toLowerCase() ===
        String(user.name || "")
            .toLowerCase()
    );
}


function getValidStatus(status) {

    const statuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];

    return statuses.includes(status)
        ? status
        : "Pending";
}


// ==========================================
// 3. CART
// ==========================================

let cart =
    safeGetJSON(
        "cart",
        []
    );


if (!Array.isArray(cart)) {
    cart = [];
}


// Normalize cart
cart = cart
    .filter(function(product) {
        return product && product.name;
    })
    .map(function(product) {

        return {
            name: String(product.name),
            price: Number(product.price) || 0,
            quantity:
                Math.max(
                    1,
                    Number(product.quantity) || 1
                )
        };

    });


safeSetJSON(
    "cart",
    cart
);


// Add product to cart
function addToCart(
    productName,
    price
) {

    productName =
        String(productName || "").trim();


    price =
        Number(price) || 0;


    if (!productName) {
        alert("Product name bai samu ba.");
        return;
    }


    if (price <= 0) {
        alert("Farashin product bai yi daidai ba.");
        return;
    }


    const existingProduct =
        cart.find(function(product) {

            return (
                product.name ===
                productName
            );

        });


    if (existingProduct) {

        existingProduct.quantity =
            (Number(
                existingProduct.quantity
            ) || 1) + 1;

    } else {

        cart.push({

            name: productName,

            price: price,

            quantity: 1

        });
    }


    safeSetJSON(
        "cart",
        cart
    );


    alert(
        productName +
        " an saka shi cikin Cart! 🛒"
    );


    displayCart();
}


// Display cart
function displayCart() {

    const cartItems =
        document.getElementById(
            "cart-items"
        );


    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Cart ɗinka babu kaya.</p>";


        if (cartTotal) {
            cartTotal.textContent = "0";
        }


        return;
    }


    cart.forEach(
        function(product, index) {

            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );


            const price =
                Number(
                    product.price
                ) || 0;


            const itemTotal =
                price * quantity;


            total += itemTotal;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "cart-item";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    Price:
                    ₦${formatMoney(price)}
                </p>

                <div class="quantity-controls">

                    <button
                        type="button"
                        onclick="decreaseQuantity(${index})"
                    >
                        −
                    </button>

                    <span style="margin: 0 15px;">
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        onclick="increaseQuantity(${index})"
                    >
                        +
                    </button>

                </div>

                <p>
                    Subtotal:
                    ₦${formatMoney(itemTotal)}
                </p>

                <button
                    type="button"
                    onclick="removeFromCart(${index})"
                >
                    Remove
                </button>

                <hr>

            `;


            cartItems.appendChild(item);

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            formatMoney(total);

    }
}


// Increase quantity
function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity =
        (Number(
            cart[index].quantity
        ) || 1) + 1;


    safeSetJSON(
        "cart",
        cart
    );


    displayCart();
}


// Decrease quantity
function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    const quantity =
        Number(
            cart[index].quantity
        ) || 1;


    if (quantity > 1) {

        cart[index].quantity =
            quantity - 1;

    } else {

        cart.splice(
            index,
            1
        );
    }


    safeSetJSON(
        "cart",
        cart
    );


    displayCart();
}


// Remove product
function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }


    cart.splice(
        index,
        1
    );


    safeSetJSON(
        "cart",
        cart
    );


    displayCart();
}


// Get cart total
function getCartTotal() {

    return cart.reduce(
        function(total, product) {

            const price =
                Number(
                    product.price
                ) || 0;


            const quantity =
                Number(
                    product.quantity
                ) || 1;


            return (
                total +
                price * quantity
            );

        },
        0
    );
}


// Checkout
function checkout() {

    if (cart.length === 0) {

        alert(
            "Cart ɗinka babu kaya."
        );

        return;
    }


    window.location.href =
        "checkout.html";
}


// ==========================================
// 4. PRODUCTS
// ==========================================

let products =
    safeGetJSON(
        "products",
        [
            {
                name: "Classic Shirt",
                price: 15000,
                category: "Shirts",
                image: "images/shirt.jpg"
            },

            {
                name: "Premium Shirt",
                price: 20000,
                category: "Shirts",
                image: "images/shirt.jpg"
            },

            {
                name: "Smart Shirt",
                price: 18000,
                category: "Shirts",
                image: "images/shirt.jpg"
            }
        ]
    );


if (!Array.isArray(products)) {
    products = [];
}


// Normalize products
products =
    products
        .filter(function(product) {
            return product;
        })
        .map(function(product) {

            return {

                name:
                    String(
                        product.name ||
                        "Product"
                    ),

                price:
                    Number(
                        product.price
                    ) || 0,

                category:
                    String(
                        product.category ||
                        "Other"
                    ),

                image:
                    String(
                        product.image ||
                        "images/shirt.jpg"
                    )

            };

        });


safeSetJSON(
    "products",
    products
);


// Save products
function saveProducts() {
    return safeSetJSON("products", products);
}


// ==========================================
// 5. ADD PRODUCT - ADMIN
// ==========================================

function addProduct() {

    const nameElement =
        document.getElementById(
            "product-name"
        );


    const priceElement =
        document.getElementById(
            "product-price"
        );


    const categoryElement =
        document.getElementById(
            "product-category"
        );


    const imageElement =
        document.getElementById(
            "product-image"
        );


    if (
        !nameElement ||
        !priceElement ||
        !categoryElement ||
        !imageElement
    ) {

        return;
    }


    const name =
        nameElement.value.trim();


    const price =
        Number(
            priceElement.value
        );


    const category =
        categoryElement.value.trim();


    const image =
        imageElement.value.trim();


    if (
        !name ||
        !category ||
        price <= 0
    ) {

        alert(
            "Please fill all required fields correctly."
        );

        return;
    }


    const newProduct = {

        name: name,

        price: price,

        category: category,

        image:
            image ||
            "images/shirt.jpg"

    };


    products.push(
        newProduct
    );


    saveProducts();


    displayAdminProducts();

    displayHomeProducts();

    populateCategoryFilter();


    nameElement.value = "";

    priceElement.value = "";

    categoryElement.value = "";

    imageElement.value = "";


    alert(
        "Product added successfully! ✅"
    );
}


// ==========================================
// 6. DISPLAY ADMIN PRODUCTS
// ==========================================

function displayAdminProducts() {

    const container =
        document.getElementById(
            "admin-products"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            "<p>No products yet.</p>";

        return;
    }


    products.forEach(
        function(product, index) {

            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "admin-product";


            box.innerHTML = `

                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                >

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ₦${formatMoney(product.price)}
                </p>

                <p>
                    Category:
                    ${escapeHTML(product.category)}
                </p>

                <button
                    type="button"
                    onclick="deleteProduct(${index})"
                >
                    Delete
                </button>

            `;


            container.appendChild(
                box
            );

        }
    );
}


// Delete product
function deleteProduct(index) {

    if (!products[index]) {
        return;
    }


    const confirmDelete =
        confirm(
            "Delete " +
            products[index].name +
            "?"
        );


    if (!confirmDelete) {
        return;
    }


    products.splice(
        index,
        1
    );


    saveProducts();


    displayAdminProducts();

    displayHomeProducts();

    populateCategoryFilter();


    alert(
        "Product deleted successfully."
    );
}


// ==========================================
// 7. HOME PRODUCTS
// ==========================================

function createProductCard(
    product,
    index
) {

    const productBox =
        document.createElement(
            "div"
        );


    productBox.className =
        "product";


    productBox.innerHTML = `

        <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
        >

        <h3>
            ${escapeHTML(product.name)}
        </h3>

        <p>
            ₦${formatMoney(product.price)}
        </p>

        <p>
            ${escapeHTML(product.category)}
        </p>

        <button
            type="button"
            onclick="viewProduct(${index})"
        >
            View Details
        </button>

        <button
            type="button"
            onclick="addToCart(
                ${jsString(product.name)},
                ${Number(product.price)}
            )"
        >
            Add to Cart 🛒
        </button>

    `;


    return productBox;
}


function displayHomeProducts() {

    const container =
        document.getElementById(
            "product-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            "<p>No products available.</p>";

        return;
    }


    products.forEach(
        function(product, index) {

            container.appendChild(
                createProductCard(
                    product,
                    index
                )
            );

        }
    );
}


// ==========================================
// 8. SEARCH + CATEGORY FILTER
// ==========================================

function populateCategoryFilter() {

    const categoryFilter =
        document.getElementById(
            "category-filter"
        );


    if (!categoryFilter) {
        return;
    }


    const currentValue =
        categoryFilter.value;


    const categories =
        [
            ...new Set(
                products
                    .map(function(product) {
                        return product.category;
                    })
                    .filter(Boolean)
            )
        ];


    categoryFilter.innerHTML =
        `<option value="All">All</option>`;


    categories.forEach(
        function(category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            categoryFilter.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        categoryFilter.value =
            currentValue;

    } else {

        categoryFilter.value =
            "All";

    }
}


function filterProducts() {

    const searchInput =
        document.getElementById(
            "search-input"
        );


    const categoryFilter =
        document.getElementById(
            "category-filter"
        );


    const container =
        document.getElementById(
            "product-container"
        );


    if (
        !searchInput ||
        !categoryFilter ||
        !container
    ) {

        return;
    }


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    const filteredProducts =
        products.filter(
            function(product) {

                const productName =
                    String(
                        product.name
                    ).toLowerCase();


                const productCategory =
                    String(
                        product.category
                    ).toLowerCase();


                const matchesSearch =
                    productName.includes(
                        searchText
                    ) ||
                    productCategory.includes(
                        searchText
                    );


                const matchesCategory =
                    selectedCategory === "All" ||
                    product.category ===
                    selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    container.innerHTML = "";


    if (
        filteredProducts.length === 0
    ) {

        container.innerHTML =
            "<p>No products found.</p>";

        return;
    }


    filteredProducts.forEach(
        function(product) {

            const originalIndex =
                products.indexOf(
                    product
                );


            container.appendChild(
                createProductCard(
                    product,
                    originalIndex
                )
            );

        }
    );
}


// ==========================================
// 9. PRODUCT DETAILS
// ==========================================

function viewProduct(index) {

    if (!products[index]) {
        return;
    }


    safeSetJSON(
        "selectedProduct",
        products[index]
    );


    window.location.href =
        "product-details.html";
}


function displayProductDetails() {

    const container =
        document.getElementById(
            "product-details-container"
        );


    if (!container) {
        return;
    }


    const selectedProduct =
        safeGetJSON(
            "selectedProduct",
            null
        );


    if (
        !selectedProduct ||
        !selectedProduct.name
    ) {

        container.innerHTML = `

            <div class="order-not-found">

                <h2>
                    Product Not Found ❌
                </h2>

                <br>

                <a
                    href="index.html"
                    class="continue-button"
                >
                    ← Back to Home
                </a>

            </div>

        `;

        return;
    }


    const productName =
        escapeHTML(
            selectedProduct.name
        );


    const productImage =
        escapeHTML(
            selectedProduct.image ||
            "images/shirt.jpg"
        );


    const productCategory =
        escapeHTML(
            selectedProduct.category ||
            "Other"
        );


    const productPrice =
        Number(
            selectedProduct.price
        ) || 0;


    container.innerHTML = `

        <div class="product-detail-card">

            <div class="product-detail-image">

                <img
                    src="${productImage}"
                    alt="${productName}"
                >

            </div>


            <div class="product-detail-info">

                <h1>
                    ${productName}
                </h1>

                <h2>
                    ₦${formatMoney(productPrice)}
                </h2>

                <p>

                    <strong>
                        Category:
                    </strong>

                    ${productCategory}

                </p>

                <p>
                    High quality product
                    from .
                    Order yours today!
                </p>

                <button
                    type="button"
                    onclick="addToCart(
                        ${jsString(selectedProduct.name)},
                        ${productPrice}
                    )"
                >
                    Add to Cart 🛒
                </button>

                <br><br>

                <a
                    href="cart.html"
                    class="continue-button"
                >
                    View Cart 🛒
                </a>

            </div>

        </div>

    `;
}


// ==========================================
// 10. CHECKOUT
// ==========================================

function setupCheckout() {

    const checkoutForm =
        document.getElementById(
            "checkout-form"
        );


    if (!checkoutForm) {
        return;
    }


    if (
        checkoutForm.dataset.initialized ===
        "true"
    ) {
        return;
    }


    checkoutForm.dataset.initialized =
        "true";


    checkoutForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Cart ɗinka babu kaya."
                );

                return;
            }


            const nameElement =
                document.getElementById(
                    "name"
                );


            const phoneElement =
                document.getElementById(
                    "phone"
                );


            const addressElement =
                document.getElementById(
                    "address"
                );


            if (
                !nameElement ||
                !phoneElement ||
                !addressElement
            ) {

                alert(
                    "Checkout fields ba su samu ba."
                );

                return;
            }


            const name =
                nameElement.value.trim();


            const phone =
                phoneElement.value.trim();


            const address =
                addressElement.value.trim();


            if (
                !name ||
                !phone ||
                !address
            ) {

                alert(
                    "Please fill all fields."
                );

                return;
            }


            if (
                phone.replace(/\D/g, "")
                    .length < 10
            ) {

                alert(
                    "Please enter a valid phone number."
                );

                return;
            }


            const total =
                getCartTotal();


            if (total <= 0) {

                alert(
                    "Order total ba daidai ba ne."
                );

                return;
            }


            const orderId =
                "ORD-" +
                Date.now();


            const currentUser =
                getCurrentUser();


            const order = {

                orderId: orderId,

                customerName: name,

                customerEmail:
                    currentUser &&
                    currentUser.email
                        ? currentUser.email
                        : "",

                phone: phone,

                address: address,

                products:
                    JSON.parse(
                        JSON.stringify(cart)
                    ),

                total: total,

                date:
                    new Date()
                        .toLocaleString(),

                status:
                    "Pending"

            };


            safeSetJSON(
                "latestOrder",
                order
            );


            let orders =
                getOrders();


            orders.push(
                order
            );


            safeSetJSON(
                "orders",
                orders
            );


            cart = [];


            safeSetJSON(
                "cart",
                []
            );


            window.location.href =
                "success.html";

        }
    );
}


// ==========================================
// 11. SUCCESS PAGE
// ==========================================

function displaySuccessPage() {

    const orderIdElement =
        document.getElementById(
            "success-order-id"
        );


    const nameElement =
        document.getElementById(
            "success-name"
        );


    const totalElement =
        document.getElementById(
            "success-total"
        );


    const trackOrderLink =
        document.getElementById(
            "track-order-link"
        );


    if (
        !orderIdElement &&
        !nameElement &&
        !totalElement &&
        !trackOrderLink
    ) {

        return;
    }


    const order =
        safeGetJSON(
            "latestOrder",
            null
        );


    if (!order) {

        if (orderIdElement) {
            orderIdElement.textContent =
                "N/A";
        }


        if (nameElement) {
            nameElement.textContent =
                "Customer";
        }


        if (totalElement) {
            totalElement.textContent =
                "0";
        }


        return;
    }


    if (orderIdElement) {

        orderIdElement.textContent =
            order.orderId ||
            "N/A";
    }


    if (nameElement) {

        nameElement.textContent =
            order.customerName ||
            "Customer";
    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                order.total
            );
    }


    if (trackOrderLink) {

        trackOrderLink.href =
            "track-order.html?orderId=" +
            encodeURIComponent(
                order.orderId || ""
            );
    }
}


// ==========================================
// 12. GET ALL ORDERS
// ==========================================

function getOrders() {

    let orders =
        safeGetJSON(
            "orders",
            []
        );


    if (!Array.isArray(orders)) {
        orders = [];
    }


    if (orders.length === 0) {

        const latestOrder =
            safeGetJSON(
                "latestOrder",
                null
            );


        if (latestOrder) {

            orders = [
                latestOrder
            ];


            safeSetJSON(
                "orders",
                orders
            );
        }
    }


    return orders;
}


// ==========================================
// 13. ADMIN ORDERS
// ==========================================

function displayAdminOrders() {

    const ordersContainer =
        document.getElementById(
            "orders-container"
        );


    const orderCount =
        document.getElementById(
            "order-count"
        );


    const totalSales =
        document.getElementById(
            "total-sales"
        );


    if (!ordersContainer) {
        return;
    }


    const orders =
        getOrders();


    ordersContainer.innerHTML =
        "";


    if (orderCount) {

        orderCount.textContent =
            orders.length;
    }


    const sales =
        orders.reduce(
            function(total, order) {

                return (
                    total +
                    (
                        Number(
                            order.total
                        ) || 0
                    )
                );

            },
            0
        );


    if (totalSales) {

        totalSales.textContent =
            "₦" +
            formatMoney(sales);
    }


    if (orders.length === 0) {

        ordersContainer.innerHTML =
            "<p>No orders yet.</p>";

        return;
    }


    const sortedOrders =
        [...orders].reverse();


    sortedOrders.forEach(
        function(order) {

            createAdminOrderBox(
                ordersContainer,
                order
            );

        }
    );
}


// Create admin order box
function createAdminOrderBox(
    container,
    order
) {

    const orderBox =
        document.createElement(
            "div"
        );


    orderBox.className =
        "order-box";


    const status =
        getValidStatus(
            order.status
        );


    const total =
        Number(
            order.total
        ) || 0;


    let productsHTML = "";


    (Array.isArray(order.products)
        ? order.products
        : []
    ).forEach(
        function(product) {

            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );


            const price =
                Number(
                    product.price
                ) || 0;


            productsHTML += `

                <p>

                    ${escapeHTML(product.name)}

                    × ${quantity}

                    —

                    ₦${formatMoney(
                        price * quantity
                    )}

                </p>

            `;

        }
    );


    orderBox.innerHTML = `

        <h3>
            Order
            ${escapeHTML(
                order.orderId || "N/A"
            )}
        </h3>


        <h3>
            Customer Information
        </h3>


        <p>
            <strong>
                Name:
            </strong>

            ${escapeHTML(
                order.customerName || "N/A"
            )}
        </p>


        <p>
            <strong>
                Email:
            </strong>

            ${escapeHTML(
                order.customerEmail || "N/A"
            )}
        </p>


        <p>
            <strong>
                Phone:
            </strong>

            ${escapeHTML(
                order.phone || "N/A"
            )}
        </p>


        <p>
            <strong>
                Address:
            </strong>

            ${escapeHTML(
                order.address || "N/A"
            )}
        </p>


        <h3>
            Products
        </h3>


        ${
            productsHTML ||
            "<p>No products.</p>"
        }


        <h3>
            Total:
            ₦${formatMoney(total)}
        </h3>


        <p>
            <strong>
                Date:
            </strong>

            ${escapeHTML(
                order.date || "N/A"
            )}
        </p>


        <p>

            <strong>
                Status:
            </strong>

            <span class="order-status">
                ${escapeHTML(status)}
            </span>

        </p>


        <select
            onchange="updateOrderStatus(
                ${jsString(order.orderId || "")},
                this.value
            )"
        >

            <option
                value="Pending"
                ${
                    status === "Pending"
                        ? "selected"
                        : ""
                }
            >
                Pending
            </option>


            <option
                value="Confirmed"
                ${
                    status === "Confirmed"
                        ? "selected"
                        : ""
                }
            >
                Confirmed
            </option>


            <option
                value="Shipped"
                ${
                    status === "Shipped"
                        ? "selected"
                        : ""
                }
            >
                Shipped
            </option>


            <option
                value="Delivered"
                ${
                    status === "Delivered"
                        ? "selected"
                        : ""
                }
            >
                Delivered
            </option>

        </select>


        <br><br>


        <a
            href="order-details.html?orderId=${encodeURIComponent(
                order.orderId || ""
            )}"
            class="continue-button"
        >
            View Details 👁️
        </a>

    `;


    container.appendChild(
        orderBox
    );
}


// ==========================================
// 14. UPDATE ORDER STATUS
// ==========================================

function updateOrderStatus(
    orderId,
    newStatus
) {

    const validStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];


    if (
        !validStatuses.includes(
            newStatus
        )
    ) {

        alert(
            "Invalid order status."
        );

        return;
    }


    const orders =
        getOrders();


    const orderIndex =
        orders.findIndex(
            function(order) {

                return (
                    order.orderId ===
                    orderId
                );

            }
        );


    if (orderIndex === -1) {

        alert(
            "Order ba samu ba."
        );

        return;
    }


    orders[orderIndex].status =
        newStatus;


    safeSetJSON(
        "orders",
        orders
    );


    const latestOrder =
        safeGetJSON(
            "latestOrder",
            null
        );


    if (
        latestOrder &&
        latestOrder.orderId ===
        orderId
    ) {

        latestOrder.status =
            newStatus;


        safeSetJSON(
            "latestOrder",
            latestOrder
        );
    }


    displayAdminOrders();

    displayCustomerOrders();

    displayOrderDetails();


    alert(
        "Order status updated to " +
        newStatus +
        " ✅"
    );
}


// ==========================================
// 15. TRACK ORDER
// ==========================================

function trackOrder() {

    const input =
        document.getElementById(
            "order-id-input"
        );


    const result =
        document.getElementById(
            "tracking-result"
        );


    if (
        !input ||
        !result
    ) {

        return;
    }


    const orderId =
        input.value.trim();


    if (!orderId) {

        result.innerHTML = `

            <div class="tracking-error">

                <h3>
                    Order ID Required ❗
                </h3>

                <p>
                    Please enter your Order ID.
                </p>

            </div>

        `;

        return;
    }


    const orders =
        getOrders();


    const order =
        orders.find(
            function(item) {

                return (
                    item.orderId ===
                    orderId
                );

            }
        );


    if (!order) {

        result.innerHTML = `

            <div class="tracking-error">

                <h3>
                    Order Not Found ❌
                </h3>

                <p>
                    We could not find this Order ID.
                </p>

                <p>
                    Please check your Order ID
                    and try again.
                </p>

            </div>

        `;

        return;
    }


    const status =
        getValidStatus(
            order.status
        );


    const total =
        Number(
            order.total
        ) || 0;


    const steps = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];


    const currentStep =
        getOrderStatusIndex(
            status
        );


    let progressHTML = "";


    steps.forEach(
        function(step, index) {

            const isActive =
                index <= currentStep;


            const isCurrent =
                index === currentStep;


            progressHTML += `

                <div class="
                    progress-step
                    ${isActive ? "active" : ""}
                    ${isCurrent ? "current" : ""}
                ">

                    <div class="progress-number">

                        ${
                            index <
                            currentStep
                                ? "✓"
                                : index + 1
                        }

                    </div>


                    <div class="progress-label">

                        ${step}

                    </div>

                </div>

            `;


            if (
                index <
                steps.length - 1
            ) {

                progressHTML += `

                    <div class="
                        progress-line
                        ${
                            index <
                            currentStep
                                ? "active"
                                : ""
                        }
                    "></div>

                `;

            }

        }
    );


    let message =
        "Your order is being processed.";


    if (
        status === "Pending"
    ) {

        message =
            "Your order has been received and is waiting for confirmation.";

    } else if (
        status === "Confirmed"
    ) {

        message =
            "Your order has been confirmed and is being prepared.";

    } else if (
        status === "Shipped"
    ) {

        message =
            "Your order has been shipped and is on its way.";

    } else if (
        status === "Delivered"
    ) {

        message =
            "Your order has been delivered successfully. 🎉";
    }


    result.innerHTML = `

        <div class="tracking-result">

            <div class="tracking-header">

                <h2>
                    Order Found ✅
                </h2>

                <span class="tracking-status">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="tracking-information">

                <p>

                    <strong>
                        Order ID:
                    </strong>

                    ${escapeHTML(
                        order.orderId
                    )}

                </p>


                <p>

                    <strong>
                        Customer:
                    </strong>

                    ${escapeHTML(
                        order.customerName ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Date:
                    </strong>

                    ${escapeHTML(
                        order.date ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Total:
                    </strong>

                    ₦${formatMoney(total)}

                </p>

            </div>


            <h3>
                Order Progress 📦
            </h3>


            <div class="order-progress">

                ${progressHTML}

            </div>


            <div class="tracking-message">

                ${message}

            </div>


            <div class="tracking-actions">

                <a
                    href="order-details.html?orderId=${encodeURIComponent(
                        order.orderId
                    )}"
                    class="continue-button"
                >
                    View Order Details 👁️
                </a>


                <a
                    href="orders.html"
                    class="continue-button"
                >
                    My Orders 📦
                </a>

            </div>

        </div>

    `;
}


// Initialize tracking from URL
function initializeTrackingFromURL() {

    const input =
        document.getElementById(
            "order-id-input"
        );


    if (!input) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get(
            "orderId"
        );


    if (orderId) {

        input.value =
            orderId;


        trackOrder();
    }
}


// ==========================================
// 16. CUSTOMER ORDERS
// ==========================================

function displayCustomerOrders() {

    const container =
        document.getElementById(
            "customer-orders"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        container.innerHTML = `

            <div class="no-orders">

                <h2>
                    Login Required 🔐
                </h2>

                <p>
                    Please login to view your orders.
                </p>

                <br>

                <a
                    href="login.html"
                    class="continue-button"
                >
                    Login
                </a>

            </div>

        `;

        return;
    }


    let orders =
        getOrders();


    orders =
        orders.filter(
            function(order) {

                return orderBelongsToUser(
                    order,
                    currentUser
                );

            }
        );


    if (orders.length === 0) {

        container.innerHTML = `

            <div class="no-orders">

                <h2>
                    No Orders Yet 📦
                </h2>

                <p>
                    You have not placed any orders yet.
                </p>

                <br>

                <a
                    href="index.html"
                    class="continue-button"
                >
                    Start Shopping 🛍️
                </a>

            </div>

        `;

        return;
    }


    const sortedOrders =
        [...orders].reverse();


    sortedOrders.forEach(
        function(order) {

            const orderBox =
                document.createElement(
                    "div"
                );


            orderBox.className =
                "customer-order-box";


            const status =
                getValidStatus(
                    order.status
                );


            const total =
                Number(
                    order.total
                ) || 0;


            let productsHTML = "";


            (
                Array.isArray(
                    order.products
                )
                    ? order.products
                    : []
            ).forEach(
                function(product) {

                    const quantity =
                        Math.max(
                            1,
                            Number(
                                product.quantity
                            ) || 1
                        );


                    const price =
                        Number(
                            product.price
                        ) || 0;


                    const subtotal =
                        price *
                        quantity;


                    productsHTML += `

                        <div
                            class="customer-order-product"
                        >

                            <p>

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                × ${quantity}

                            </p>


                            <p>

                                ₦${formatMoney(
                                    subtotal
                                )}

                            </p>

                        </div>

                    `;

                }
            );


            orderBox.innerHTML = `

                <div class="customer-order-header">

                    <h2>
                        Order
                        ${escapeHTML(
                            order.orderId ||
                            "N/A"
                        )}
                    </h2>


                    <span class="order-status">

                        ${escapeHTML(status)}

                    </span>

                </div>


                <p>

                    <strong>
                        Date:
                    </strong>

                    ${escapeHTML(
                        order.date ||
                        "N/A"
                    )}

                </p>


                <h3>
                    Products 📦
                </h3>


                <div class="customer-products">

                    ${
                        productsHTML ||
                        "<p>No products.</p>"
                    }

                </div>


                <h3 class="customer-order-total">

                    Total:
                    ₦${formatMoney(total)}

                </h3>


                <div class="customer-order-actions">

                    <a
                        href="order-details.html?orderId=${encodeURIComponent(
                            order.orderId || ""
                        )}"
                        class="continue-button"
                    >
                        View Details 👁️
                    </a>


                    <a
                        href="track-order.html?orderId=${encodeURIComponent(
                            order.orderId || ""
                        )}"
                        class="continue-button"
                    >
                        Track Order 📦
                    </a>

                </div>

            `;


            container.appendChild(
                orderBox
            );

        }
    );
}


// ==========================================
// 17. REGISTER
// ==========================================

function setupRegister() {

    const form =
        document.getElementById(
            "register-form"
        );


    if (!form) {
        return;
    }


    if (
        form.dataset.initialized ===
        "true"
    ) {
        return;
    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const nameElement =
                document.getElementById(
                    "register-name"
                );


            const emailElement =
                document.getElementById(
                    "register-email"
                );


            const passwordElement =
                document.getElementById(
                    "register-password"
                );


            const confirmPasswordElement =
                document.getElementById(
                    "register-confirm-password"
                );


            const message =
                document.getElementById(
                    "register-message"
                );


            if (
                !nameElement ||
                !emailElement ||
                !passwordElement ||
                !confirmPasswordElement
            ) {

                return;
            }


            const name =
                nameElement.value.trim();


            const email =
                emailElement.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordElement.value;


            const confirmPassword =
                confirmPasswordElement.value;


            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "Please fill all fields.";

                }

                return;
            }


            if (
                password.length < 6
            ) {

                if (message) {

                    message.textContent =
                        "Password must be at least 6 characters.";

                }

                return;
            }


            if (
                password !==
                confirmPassword
            ) {

                if (message) {

                    message.textContent =
                        "Passwords ba su yi daidai ba.";

                }

                return;
            }


            let users =
                safeGetJSON(
                    "users",
                    []
                );


            if (!Array.isArray(users)) {
                users = [];
            }


            const existingUser =
                users.find(
                    function(user) {

                        return (
                            user &&
                            String(
                                user.email ||
                                ""
                            ).toLowerCase() ===
                            email
                        );

                    }
                );


            if (existingUser) {

                if (message) {

                    message.textContent =
                        "Wannan email ɗin an riga an yi register.";

                }

                return;
            }


            const newUser = {

                name: name,

                email: email,

                password: password

            };


            users.push(
                newUser
            );


            safeSetJSON(
                "users",
                users
            );


            alert(
                "Account an ƙirƙira successfully! 🎉"
            );


            window.location.href =
                "login.html";

        }
    );
}


// ==========================================
// 18. LOGIN
// ==========================================

function setupLogin() {

    const form =
        document.getElementById(
            "login-form"
        );


    if (!form) {
        return;
    }


    if (
        form.dataset.initialized ===
        "true"
    ) {
        return;
    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const emailElement =
                document.getElementById(
                    "login-email"
                );


            const passwordElement =
                document.getElementById(
                    "login-password"
                );


            const message =
                document.getElementById(
                    "login-message"
                );


            if (
                !emailElement ||
                !passwordElement
            ) {

                return;
            }


            const email =
                emailElement.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordElement.value;


            const users =
                safeGetJSON(
                    "users",
                    []
                );


            if (!Array.isArray(users)) {

                if (message) {
                    message.textContent =
                        "Babu registered user.";
                }

                return;
            }


            const user =
                users.find(
                    function(item) {

                        return (
                            item &&
                            String(
                                item.email ||
                                ""
                            ).toLowerCase() ===
                            email &&
                            item.password ===
                            password
                        );

                    }
                );


            if (!user) {

                if (message) {

                    message.textContent =
                        "Email ko password ba daidai ba ne.";

                }

                return;
            }


            safeSetJSON(
                "currentUser",
                user
            );


            alert(
                "Welcome " +
                user.name +
                "! 🎉"
            );


            window.location.href =
                "index.html";

        }
    );
}


// ==========================================
// 19. USER MENU
// ==========================================

function displayUserMenu() {

    const userMenu =
        document.getElementById(
            "user-menu"
        );


    if (!userMenu) {
        return;
    }


    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        userMenu.innerHTML = `

            <a href="login.html">
                Login
            </a>

            <a href="register.html">
                Register
            </a>

        `;

        return;
    }


    userMenu.innerHTML = `

        <span>
            Welcome,
            ${escapeHTML(
                currentUser.name
            )}
            👋
        </span>


        <a href="dashboard.html">
            Dashboard 👤
        </a>


        <a href="account.html">
            Account
        </a>


        <a href="orders.html">
            My Orders 📦
        </a>


        <button
            type="button"
            onclick="logout()"
        >
            Logout
        </button>

    `;
}


// Customer logout
function logout() {

    localStorage.removeItem(
        "currentUser"
    );


    alert(
        "An yi Logout successfully."
    );


    window.location.href =
        "index.html";
}


// ==========================================
// 20. ADMIN LOGIN
// ==========================================

function setupAdminLogin() {

    const form =
        document.getElementById(
            "admin-login-form"
        );


    if (!form) {
        return;
    }


    if (
        form.dataset.initialized ===
        "true"
    ) {
        return;
    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const emailElement =
                document.getElementById(
                    "admin-email"
                );


            const passwordElement =
                document.getElementById(
                    "admin-password"
                );


            const message =
                document.getElementById(
                    "admin-login-message"
                );


            if (
                !emailElement ||
                !passwordElement
            ) {

                return;
            }


            const email =
                emailElement.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordElement.value;


            // DEMO ADMIN LOGIN
            const adminEmail =
                "admin@mybusiness.com";


            const adminPassword =
                "admin123";


            if (
                email !== adminEmail ||
                password !== adminPassword
            ) {

                if (message) {

                    message.textContent =
                        "Admin email ko password ba daidai ba ne.";

                }

                return;
            }


            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            alert(
                "Admin Login Successful! 🎉"
            );


            window.location.href =
                "admin.html";

        }
    );
}


// ==========================================
// 21. PROTECT ADMIN PAGES
// ==========================================

function protectAdminPage() {

    const adminPages = [
        "admin.html",
        "admin-orders.html"
    ];


    const isAdmin =
        localStorage.getItem(
            "adminLoggedIn"
        );


    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    if (
        adminPages.includes(
            currentPage
        ) &&
        isAdmin !== "true"
    ) {

        window.location.href =
            "admin-login.html";
    }
}


// ==========================================
// 22. ADMIN LOGOUT
// ==========================================

function adminLogout() {

    localStorage.removeItem(
        "adminLoggedIn"
    );


    alert(
        "Admin Logout Successful."
    );


    window.location.href =
        "admin-login.html";
}


// ==========================================
// 23. FILTER ADMIN ORDERS
// ==========================================

function filterAdminOrders() {

    const searchInput =
        document.getElementById(
            "order-search"
        );


    const statusFilter =
        document.getElementById(
            "order-status-filter"
        );


    const container =
        document.getElementById(
            "orders-container"
        );


    if (
        !searchInput ||
        !statusFilter ||
        !container
    ) {

        return;
    }


    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusFilter.value;


    const orders =
        getOrders();


    const filteredOrders =
        orders.filter(
            function(order) {

                const orderId =
                    String(
                        order.orderId || ""
                    ).toLowerCase();


                const customerName =
                    String(
                        order.customerName ||
                        ""
                    ).toLowerCase();


                const customerEmail =
                    String(
                        order.customerEmail ||
                        ""
                    ).toLowerCase();


                const status =
                    getValidStatus(
                        order.status
                    );


                const matchesSearch =
                    orderId.includes(
                        searchText
                    ) ||
                    customerName.includes(
                        searchText
                    ) ||
                    customerEmail.includes(
                        searchText
                    );


                const matchesStatus =
                    selectedStatus === "All" ||
                    status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayFilteredAdminOrders(
        filteredOrders
    );
}


// ==========================================
// 24. DISPLAY FILTERED ADMIN ORDERS
// ==========================================

function displayFilteredAdminOrders(
    orders
) {

    const container =
        document.getElementById(
            "orders-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    if (!Array.isArray(orders)) {
        orders = [];
    }


    if (orders.length === 0) {

        container.innerHTML = `

            <div class="no-orders">

                <h2>
                    No Orders Found 🔍
                </h2>

                <p>
                    Try another search
                    or status filter.
                </p>

            </div>

        `;

        return;
    }


    const sortedOrders =
        [...orders].reverse();


    sortedOrders.forEach(
        function(order) {

            createAdminOrderBox(
                container,
                order
            );

        }
    );
}


// ==========================================
// 25. CUSTOMER ORDER DETAILS
// ==========================================

function displayOrderDetails() {

    const container =
        document.getElementById(
            "order-details-container"
        );


    if (!container) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get(
            "orderId"
        );


    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        container.innerHTML = `

            <div class="order-not-found">

                <h2>
                    Login Required 🔐
                </h2>

                <p>
                    Please login to view your order.
                </p>

                <br>

                <a
                    href="login.html"
                    class="continue-button"
                >
                    Login
                </a>

            </div>

        `;

        return;
    }


    if (!orderId) {

        container.innerHTML = `

            <div class="order-not-found">

                <h2>
                    Order Not Found ❌
                </h2>

                <p>
                    No Order ID was provided.
                </p>

                <br>

                <a
                    href="orders.html"
                    class="continue-button"
                >
                    ← Back to My Orders
                </a>

            </div>

        `;

        return;
    }


    const orders =
        getOrders();


    const order =
        orders.find(
            function(item) {

                return (
                    item.orderId ===
                    orderId
                );

            }
        );


    if (!order) {

        container.innerHTML = `

            <div class="order-not-found">

                <h2>
                    Order Not Found ❌
                </h2>

                <p>
                    We could not find this order.
                </p>

                <br>

                <a
                    href="orders.html"
                    class="continue-button"
                >
                    ← Back to My Orders
                </a>

            </div>

        `;

        return;
    }


    // Security check
    if (
        !orderBelongsToUser(
            order,
            currentUser
        )
    ) {

        container.innerHTML = `

            <div class="order-not-found">

                <h2>
                    Access Denied 🚫
                </h2>

                <p>
                    You cannot view this order.
                </p>

                <p>
                    This order belongs to another customer.
                </p>

                <br>

                <a
                    href="orders.html"
                    class="continue-button"
                >
                    ← Back to My Orders
                </a>

            </div>

        `;

        return;
    }


    const status =
        getValidStatus(
            order.status
        );


    const total =
        Number(
            order.total
        ) || 0;


    const statuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Delivered"
    ];


    const currentStatusIndex =
        getOrderStatusIndex(
            status
        );


    let progressHTML = "";


    statuses.forEach(
        function(item, index) {

            const active =
                index <=
                currentStatusIndex
                    ? "active"
                    : "";


            const current =
                index ===
                currentStatusIndex
                    ? "current"
                    : "";


            const number =
                index <
                currentStatusIndex
                    ? "✓"
                    : index + 1;


            progressHTML += `

                <div
                    class="
                        progress-step
                        ${active}
                        ${current}
                    "
                >

                    <div
                        class="progress-number"
                    >
                        ${number}
                    </div>

                    <div
                        class="progress-label"
                    >
                        ${item}
                    </div>

                </div>

            `;


            if (
                index <
                statuses.length - 1
            ) {

                progressHTML += `

                    <div
                        class="
                            progress-line
                            ${
                                index <
                                currentStatusIndex
                                    ? "active"
                                    : ""
                            }
                        "
                    ></div>

                `;

            }

        }
    );


    let productsHTML = "";


    (
        Array.isArray(
            order.products
        )
            ? order.products
            : []
    ).forEach(
        function(product) {

            const quantity =
                Math.max(
                    1,
                    Number(
                        product.quantity
                    ) || 1
                );


            const price =
                Number(
                    product.price
                ) || 0;


            const subtotal =
                price *
                quantity;


            productsHTML += `

                <div
                    class="order-product"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>

                        <p>
                            Price:
                            ₦${formatMoney(price)}
                        </p>

                        <p>
                            Quantity:
                            ${quantity}
                        </p>

                    </div>


                    <strong>
                        ₦${formatMoney(subtotal)}
                    </strong>

                </div>

            `;

        }
    );


    container.innerHTML = `

        <div class="order-details-card">

            <div class="order-details-header">

                <h1>
                    Order
                    ${escapeHTML(
                        order.orderId
                    )}
                </h1>


                <span
                    class="order-details-status"
                >
                    ${escapeHTML(status)}
                </span>

            </div>


            <div
                class="order-progress-details"
            >

                <h2>
                    Order Progress 📦
                </h2>


                <div
                    class="progress-container"
                >

                    ${progressHTML}

                </div>

            </div>


            <div class="order-customer">

                <h2>
                    Customer Information 👤
                </h2>


                <p>

                    <strong>
                        Name:
                    </strong>

                    ${escapeHTML(
                        order.customerName ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${escapeHTML(
                        order.phone ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Address:
                    </strong>

                    ${escapeHTML(
                        order.address ||
                        "N/A"
                    )}

                </p>


                <p>

                    <strong>
                        Date:
                    </strong>

                    ${escapeHTML(
                        order.date ||
                        "N/A"
                    )}

                </p>

            </div>


            <div class="order-products">

                <h2>
                    Products 📦
                </h2>

                <br>

                ${
                    productsHTML ||
                    "<p>No products.</p>"
                }

            </div>


            <div class="order-total">

                <strong>
                    Total:
                </strong>

                ₦${formatMoney(total)}

            </div>


            <div class="order-details-actions">

                <a
                    href="orders.html"
                    class="continue-button"
                >
                    ← My Orders
                </a>


                <a
                    href="track-order.html?orderId=${encodeURIComponent(
                        order.orderId
                    )}"
                    class="continue-button"
                >
                    Track Order 📦
                </a>

            </div>

        </div>

    `;
}


// ==========================================
// 26. CUSTOMER ACCOUNT
// ==========================================

function displayAccount() {

    const container =
        document.getElementById(
            "account-container"
        );


    if (!container) {
        return;
    }


    const currentUser =
        getCurrentUser();


    if (!currentUser) {

        container.innerHTML = `

            <div
                class="account-not-logged"
            >

                <h2>
                    You are not logged in 🔐
                </h2>

                <p>
                    Please login to view your account.
                </p>

                <br>

                <a
                    href="login.html"
                    class="continue-button"
                >
                    Login
                </a>


                <a
                    href="register.html"
                    class="continue-button"
                >
                    Register
                </a>

            </div>

        `;

        return;
    }


    const orders =
        getOrders();


    const customerOrders =
        orders.filter(
            function(order) {

                return orderBelongsToUser(
                    order,
                    currentUser
                );

            }
        );


    const totalSpent =
        customerOrders.reduce(
            function(total, order) {

                return (
                    total +
                    (
                        Number(
                            order.total
                        ) || 0
                    )
                );

            },
            0
        );


    container.innerHTML = `

        <div class="account-card">

            <div class="account-icon">
                👤
            </div>


            <h1>
                Welcome,
                ${escapeHTML(
                    currentUser.name
                )}
                ! 👋
            </h1>


            <p>
                 Account
            </p>


            <div class="account-info">

                <p>

                    <strong>
                        Name:
                    </strong>

                    ${escapeHTML(
                        currentUser.name
                    )}

                </p>


                <p>

                    <strong>
                        Email:
                    </strong>

                    ${escapeHTML(
                        currentUser.email
                    )}

                </p>


                <p>

                    <strong>
                        Total Orders:
                    </strong>

                    ${customerOrders.length}

                </p>


                <p>

                    <strong>
                        Total Spent:
                    </strong>

                    ₦${formatMoney(totalSpent)}

                </p>

            </div>


            <div class="account-actions">

                <a
                    href="dashboard.html"
                    class="continue-button"
                >
                    Dashboard 👤
                </a>


                <a
                    href="orders.html"
                    class="continue-button"
                >
                    My Orders 📦
                </a>


                <a
                    href="index.html"
                    class="continue-button"
                >
                    Continue Shopping 🛒
                </a>


                <button
                    type="button"
                    class="account-logout"
                    onclick="logout()"
                >
                    Logout
                </button>

            </div>

        </div>

    `;
}


// ==========================================
// 27. DASHBOARD USER CHECK
// ==========================================

function protectCustomerPage() {

    const customerPages = [
        "dashboard.html",
        "account.html",
        "orders.html",
        "order-details.html"
    ];


    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const currentUser =
        getCurrentUser();


    if (
        customerPages.includes(
            currentPage
        ) &&
        !currentUser
    ) {

        if (
            currentPage ===
            "order-details.html"
        ) {

            return;
        }


        window.location.href =
            "login.html";
    }
}


// ==========================================
// 28. FINAL INITIALIZATION
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // Cart
        displayCart();


        // Products
        displayAdminProducts();

        displayHomeProducts();

        populateCategoryFilter();


        // Product details
        displayProductDetails();


        // Checkout
        setupCheckout();


        // Success
        displaySuccessPage();


        // Orders
        displayAdminOrders();

        displayOrderDetails();

        displayCustomerOrders();


        // Tracking
        initializeTrackingFromURL();


        // Authentication
        setupRegister();

        setupLogin();

        displayUserMenu();


        // Account
        displayAccount();


        // Admin
        setupAdminLogin();

        protectAdminPage();


        // Customer protection
        protectCustomerPage();

    }
);
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;

    const installBtn = document.getElementById("installBtn");

    if (installBtn) {
        installBtn.style.display = "block";

        installBtn.addEventListener("click", async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();

            const { outcome } = await deferredPrompt.userChoice;

            console.log("Install result:", outcome);

            deferredPrompt = null;
            installBtn.style.display = "none";
        });
    }
});

window.addEventListener("appinstalled", () => {
    console.log(" App installed successfully");

    const installBtn = document.getElementById("installBtn");

    if (installBtn) {
        installBtn.style.display = "none";
    }
});   