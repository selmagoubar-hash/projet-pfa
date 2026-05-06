import pymysql
pymysql.version_info = (2, 2, 1, 'final', 0)  # Force la version
pymysql.install_as_MySQLdb()