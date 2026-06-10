# Product Catalog App

A full-stack web application for browsing, searching, and exploring products. The backend uses Flask API that gets and caches data from [DummyJSON](https://dummyjson.com/), and the frontend is a plain HTML/CSS/JavaScript UI ,served by Flask.

## Features

- Browse all products in a paginated table (15 per page)
- Search products by keyword
- View a product's full image gallery inline
- Server-side caching of product data (5-minute TTL) to reduce external API calls

## Project Structure

```
product-catalog-app/
├── backend/
│   └── server.py       # Flask app and API routes
└── frontend/
    ├── index.html      # Main page
    ├── script.js       # Fetch, render, pagination, and gallery logic
    └── style.css       # Styles
```

## Requirements

- Python 3.x
- Flask
- requests
- render-template

## Setup & Running

1. **Create and activate a virtual environment:**

   ```bash
   python -m venv catalog_env
   # Windows
   catalog_env\Scripts\activate
   # macOS/Linux
   source catalog_env/bin/activate
   ```

2. **Install dependencies:**

   ```bash
   pip install flask requests render-template
   ```

3. **Start the server:**

   ```bash
   python backend/server.py
   ```

4. Open your browser at `http://127.0.0.1:5000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serves the frontend |
| GET | `/api/products?page=<n>` | Returns paginated products (15 per page) |
| GET | `/api/products/search/<query>` | Searches products by keyword |
| GET | `/api/products/<id>` | Returns image gallery for a product |

## How It Works

1. **Startup** — Flask serves `index.html` from `frontend/` that immediately triggers a `fetchProducts()` call from the browser.
2. **Product listing** — `GET /api/products?page=N` slices the in-memory product list (15 items per page) and returns the slice along with the total product count. The frontend uses the total product count to compute how many pages exist and enables/disables the Previous/Next buttons accordingly.
3. **Caching** — on the first request (or after the 5-minute TTL expires), the backend calls `https://dummyjson.com/products?limit=0` to fetch every product in one shot. The result is stored in a module-level list alongside the fetch timestamp. Subsequent requests within the TTL window skip the external call and read from that dict.
4. **Search** — `GET /api/products/search/<query>` bypasses the cache entirely and forwards the query to DummyJSON's own search endpoint. Results are returned as-is; no local filtering or pagination is applied.
5. **Gallery** — clicking "View Gallery" on a row calls `GET /api/products/<id>`, which looks up the product in the in-memory cache and returns its `images` array. The frontend inserts a new `<tr>` directly below the clicked row with all gallery images rendered inline. Clicking the button a second time removes that row (toggle behaviour).

## Assumptions & Decisions

- **`?limit=0` fetches everything** — DummyJSON treats `limit=0` as "return all products". This lets the server do pagination locally without multiple external calls, at the cost of a larger initial payload (~194 KB JSON).
- **In-memory cache only** — the cache is a plain Python dict that lives in the Flask process. It resets on every server restart and is not shared across workers. This was chosen for zero-dependency simplicity.
- **Search is always live** — search results are never cached. The assumption is that search is infrequent enough that hitting DummyJSON each time is acceptable.
- **Gallery depends on the cache being warm** — `GET /api/products/<id>` looks up the product in `products["data"]`. If the cache hasn't been populated yet (e.g., the gallery endpoint is called before any browse request), it returns `{"product": null}`. In normal usage this cannot happen because the page always fetches the product list on load.
