from time import time
from flask import Flask,request,render_template
import requests

app = Flask(__name__, 
            template_folder='../frontend',
            static_folder='../frontend')
PRODUCTS_API_URL = 'https://dummyjson.com/products'
products = { "data": [] , "cache_time": 0 }
TTL_CACHE = 300

# Fetch products from the API
def fetch_products():
    response = requests.get(f"{PRODUCTS_API_URL}?limit=0")
    if response.status_code == 200 :
        return response.json().get("products", [])
    return []

# Check if cache is valid, if not fetch new data
def get_products_cached():
    now=time()
    if now - products["cache_time"] > TTL_CACHE:
        products["data"] = fetch_products()
        products["cache_time"] = now

@app.route("/")
def index():
    return render_template("index.html")

# Collect all products
@app.route("/api/products")
def get_products():
    get_products_cached()
    page = request.args.get("page", 1, type=int)
    paginated_products = paginate_products(products["data"],page, 15)
    return {"products": paginated_products,"page": page,"total": len(products["data"])}

# Applying search
@app.route("/api/products/search/<string:query>")
def search_products(query):
    found_products_request = requests.get(f"{PRODUCTS_API_URL}/search/?q={query}")
    found_products = []
    if found_products_request.status_code == 200 and found_products_request.json().get("products"):
        found_products = found_products_request.json().get("products")
        page = request.args.get("page", 1, type=int)
        found_products = paginate_products(found_products,page, 15)
        return {"products": found_products,"page": page,"total": len(found_products) }
    else:
        return {"products": [],"page": 1,"total": 0 }

# Gallery
@app.route("/api/products/<int:product_id>")
def get_product(product_id):
    product = next((p for p in products["data"] if p.get("id") == product_id), None)
    return {"gallery": product["images"]} if product else {"product": None}

# Pagination function
def paginate_products(products_list, page, limit):
    start = (page - 1) * limit
    end = start + limit
    return products_list[start:end]

if __name__ == "__main__":
    app.run(debug=True)