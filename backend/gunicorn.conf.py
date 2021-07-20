import multiprocessing
import os

bind: str = os.getenv("ADDRESS_PORT", "0.0.0.0:7000")
loglevel: str = os.getenv("LOG_LEVEL", "info")
workers: int = multiprocessing.cpu_count()
errorlog: str = "-"
accesslog: str = "-"
graceful_timeout: int = 120
timeout: int = int(os.getenv("TIMEOUT", 120))
keepalive: int = int(os.getenv("KEEP_ALIVE", 5))
