let searchInput = document.getElementById('search-input');
let searchButton = document.getElementById('search-button');
let nextPageButton = document.getElementById('nextPageButton');
let prevPageButton = document.getElementById('prevPageButton');
let productsToShow=[];
let productGallery =[];
let currentPage = 1;
let total = 0;

// Event listeners for pagination and search buttons. 
// They call the appropriate functions to fetch products or search based on user input, and update the current page accordingly.
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchProducts();
    }
});

nextPageButton.addEventListener('click', () => {
    const totalPages = Math.ceil(total / 15);
    if (currentPage < totalPages) {
        currentPage++;
        fetchProducts();
    }
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchProducts(query);
    } else {
        fetchProducts();
    }
});


//Fetches products for the current page from the backend API and updates the productsToShow array, currentPage, and total variables. 
//Then it calls renderProducts() and renderPagination() to update the UI.
async function fetchProducts() {
    const response = await fetch(`/api/products?page=${currentPage}`);
    const data = await response.json();
    productsToShow = data.products;
    currentPage = data.page;
    total = data.total;
    renderProducts();
    renderPagination();
}

// Searches for products based on the user's query and updates the displayed products and pagination accordingly. 
// If the search query is empty, it fetches all products for the current page.
async function searchProducts(query) {
    const response = await fetch(`/api/products/search/${query}`);
    const data = await response.json();
    productsToShow = data.products;
    currentPage = data.page;
    console.log(data.page);
    total = data.total;
    renderProducts();
    renderPagination();
}

// Fetching up to 3 gallery images for a specific product ID and then rendering the gallery below the clicked product row. 
async function getProductGallery(row,product_id) {
    const response = await fetch(`/api/products/${product_id}`);
    const data = await response.json();
    productGallery = data.gallery;
    renderGallery(row);
}

// Renders the products in the table based on the current productsToShow array. 
// Each product row includes a "View" button to show the product gallery.
function renderProducts() {
    const productTable = document.querySelector('#productTable tbody');
    productTable.innerHTML = '';
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.title}</td>
            <td>${product.description}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.rating}</td>
            <td>${product.stock}</td>
            <td>${product.brand}</td>
            <td>${product.category}</td>
            <td><img src="${product.thumbnail}" alt="${product.title}" style="width: 100px;"></td>
        `;
        const galleryButton = document.createElement('button');
        galleryButton.textContent = 'View';
        galleryButton.classList.add('galleryButton');

        // Styling the gallery button
        galleryButton.style.backgroundColor = '#fff';
        galleryButton.style.color = '#272626';
        galleryButton.style.border = '1px solid #333';
        galleryButton.style.padding = '5px 10px';
        galleryButton.style.borderRadius = '5px';
        galleryButton.style.fontSize = '14px';
        galleryButton.style.marginTop = '30px';
        galleryButton.style.transition = 'background-color 0.3s, color 0.3s';
        galleryButton.style.cursor = 'pointer';

        galleryButton.addEventListener('click', () => getProductGallery(row,product.id));
        const td= document.createElement('td');
        td.style.textAlign = 'center';
        td.style.verticalAlign = 'middle';
        td.appendChild(galleryButton);
        row.appendChild(td);
        productTable.appendChild(row);
    });
}

// Disables/enables pagination buttons based on the current page and total pages. 
function renderPagination() {
    const totalPages = Math.ceil(total / 15);
    prevPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
}

// Inserts a new row with the product gallery images below the clicked product row. 
// If the gallery is already shown, it removes the gallery row.
function renderGallery(row) {
    const galleryRow = document.createElement('tr');
    galleryRow.classList.add('galleryRow');
    galleryRow.innerHTML = `
        <td colspan="8" style="border:none;">
            ${productGallery.map(image => `<img src="${image}" alt="Gallery Image" style="width: 300px; margin: 5px;">`).join('')}      
        </td>
    `;
    if (row.nextSibling && row.nextSibling.classList.contains('galleryRow')) {
        row.parentNode.removeChild(row.nextSibling);
    } else {
        row.parentNode.insertBefore(galleryRow, row.nextSibling);
    }
}

// Initial fetch of products
fetchProducts();