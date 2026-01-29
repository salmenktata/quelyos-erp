# Dockerfile Backend API (Odoo 19 + quelyos_api module)
FROM odoo:19

USER root

# Install additional Python packages
RUN pip3 install --no-cache-dir \
    redis \
    prometheus-client \
    sentry-sdk \
    pyjwt \
    python-dateutil

# Copy custom addons
COPY --chown=odoo:odoo ./addons /mnt/extra-addons

# Create necessary directories
RUN mkdir -p /var/lib/odoo && \
    chown -R odoo:odoo /var/lib/odoo

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8069/web/health || exit 1

USER odoo

EXPOSE 8069

# Use default Odoo entrypoint
ENTRYPOINT ["/entrypoint.sh"]
CMD ["odoo"]
