# Environment variables

* PORT = main web server port. Default is 4000.
* DB_CONFIG = database connection string as JSON. If not set, you need a src/db/config.json.
* CHECK_DB_SETUP = run a query that will create tables if they don't exist. Probably not a good solution and should be removed.
* REDIS_CONFIG = redis connection string as JSON. If not supplied, it will try to connect to localhost.
* SESSION_SECRET = secret to pass to express.session.
* FACEBOOK_APPID, FACEBOOK_APPSECRET = facebook connect info
* GOOGLE_APPID, GOOGLE_SECRET = google info
* ETHERPAD_DIR = Etherpad's install dir
* ETHERPAD_APIKEY = Etherpad's API key (use this or ETHERPAD_DIR but not both)
* PAD_URL = URL for embedding Etherpad. Defaults to http://pad.uanotes.com if not set.
