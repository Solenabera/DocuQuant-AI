import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures structured console logging across the application."""
    log_level = logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("docuquant")
    logger.setLevel(log_level)

    # Avoid duplicate handlers if re-called
    if not logger.handlers:
        logger.addHandler(handler)

    return logger


logger = setup_logging()

