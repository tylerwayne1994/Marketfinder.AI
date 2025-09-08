from protected_routes import protected_bp

def register_blueprints(app):
    app.register_blueprint(checkout_bp, url_prefix='/api')
    app.register_blueprint(webhook_bp, url_prefix='/api') 
    app.register_blueprint(protected_bp, url_prefix='/api')