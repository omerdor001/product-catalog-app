from flask import Flask

app = Flask(__name__)

# Example route
@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

# Collect all products

# Applying search

# Gallery


if __name__ == "__main__":
    app.run(debug=True)