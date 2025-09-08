from flask import Flask
import os
from stripe_checkout import checkout_bp

# This will auto-register when imported
def init_routes(app):
    app.register_blueprint(checkout_bp, url_prefix='/api')

# Auto-register if this file gets imported
try:
    from __main__ import app
    init_routes(app)
except:
    pass
