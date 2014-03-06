# Environment variables

* PORT = main web server port. Default is 4000.
* DB_CONFIG = database connection string as JSON. If not set, you need a src/db/config.json.
* CHECK_DB_SETUP = run a query that will create tables if they don't exist. Probably not a good solution and should be removed.
* REDIS_CONFIG = redis connection string as JSON. If not supplied, it will try to connect to localhost.
