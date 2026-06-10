import math
from time import time
from flask import Flask,request,render_template
import requests

app = Flask(__name__, 
            template_folder='../frontend',
            static_folder='../frontend')
PRODUCTS_API_URL = 'https://dummyjson.com/products'
products = { "data": [] , "cache_time": 0 }
TTL_CACHE = 300

# Renders the main HTML page for the application, which is located in the frontend directory.
@app.route("/")
def index():
    return render_template("index.html")

# Fetch all products from the DummyJSON API at once (limit=0)
def fetch_products():
    try:
        response = requests.get(f"{PRODUCTS_API_URL}?limit=0", timeout=5)
        if response.status_code == 200:
            return response.json().get("products", [])
        else:
            return []
    except requests.RequestException:
        return []

# Returns cached products if valid by TTL, otherwise fetch new data and update cache
def get_products_cached():
    now=time()
    if now - products["cache_time"] > TTL_CACHE:
        products["data"] = fetch_products()
        products["cache_time"] = now


# Returns paginated products based on the requested page number, using cached data if valid.
# If the page number is out of range, returns an empty list.
@app.route("/api/products")
def get_products():
    get_products_cached()
    page = request.args.get("page", 1, type=int)
    if page>0 and page<=math.ceil(len(products["data"])/15):
       paginated_products = paginate_products(products["data"],page, 15)
    else:
       paginated_products = []
    return {"products": paginated_products,"page": page,"total": len(products["data"])}

# Search using the DummyJSON API search endpoint, then paginate results based on the requested page number.
@app.route("/api/products/search/<string:query>")
def search_products(query):
    found_products_request = requests.get(f"{PRODUCTS_API_URL}/search/?q={query}")
    found_products = []
    if found_products_request.status_code == 200 and found_products_request.json().get("products"):
        found_products = found_products_request.json().get("products")
        page = request.args.get("page", 1, type=int)
        total = len(found_products)
        found_products = paginate_products(found_products,page, 15)
        return {"products": found_products,"page": page,"total": total }
    else:
        return {"products": [],"page": 1,"total": 0 }

# Returns up to 3 images for a given product ID. If the product is not found, returns None.
@app.route("/api/products/<int:product_id>")
def get_product_gallery(product_id):
    product = next((p for p in products["data"] if p.get("id") == product_id), None)
    return {"gallery": product["images"][:3]} if product else {"product": None}

# Slices the products list to return only the products for the requested page and limit.
def paginate_products(products_list, page, limit):
    start = (page - 1) * limit
    end = start + limit
    return products_list[start:end]

if __name__ == "__main__":
    app.run(debug=True)