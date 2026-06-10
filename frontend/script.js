let searchInput = document.getElementById('search-input');
let searchButton = document.getElementById('search-button');
let nextPageButton = document.getElementById('nextPageButton');
let prevPageButton = document.getElementById('prevPageButton');
let productsToShow=[];
let productGallery =[];
let currentPage = 1;
let total = 0;

// Event listeners for pagination and search
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


//function to fetch products
async function fetchProducts() {
    const response = await fetch(`/api/products?page=${currentPage}`);
    const data = await response.json();
    productsToShow = data.products;
    currentPage = data.page;
    total = data.total;
    renderProducts();
    renderPagination();
}

// function to handle search products
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

// function for handle showing gallery of a product
async function getProductGallery(row,product_id) {
    const response = await fetch(`/api/products/${product_id}`);
    const data = await response.json();
    productGallery = data.gallery;
    renderGallery(row);
}

// function to render products
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

// function to render pagination
function renderPagination() {
    const totalPages = Math.ceil(total / 15);
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
}

// function to render gallery
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