## HTTPS Troubleshooting

### Current Status
The test subdomain `coffee-test.tnaprovider.com.au` works on HTTP (port 80) but HTTPS (port 443) is not configured yet. Caddy auto-TLS requires the domain to resolve publicly to the VPS IP.

### Troubleshooting Steps

1. **DNS must resolve publicly**
   ```bash
   dig coffee-test.tnaprovider.com.au @1.1.1.1
   ```
   Expected: `139.180.175.60`

2. **Caddy needs public DNS for Let's Encrypt**
   Caddy auto-provisions SSL certificates via HTTP-01 challenge. The domain must resolve to this server from the internet. If DNS only resolves internally, the challenge fails.

3. **Check Caddy logs**
   ```bash
   sudo journalctl -u caddy --no-pager -n 50
   ```

4. **Confirm port 80/443 are open**
   ```bash
   ss -tlnp | grep -E ':(80|443) '
   ```

5. **Check for conflicting Caddy blocks**
   ```bash
   sudo cat /etc/caddy/Caddyfile
   ```
   Ensure no other block claims `coffee-test.tnaprovider.com.au` with TLS.

6. **Force Caddy to retry certificate**
   ```bash
   sudo systemctl reload caddy
   ```
   Or delete the cert cache:
   ```bash
   sudo rm -rf /var/lib/caddy/.local/share/caddy/certificates/
   sudo systemctl reload caddy
   ```

### Known Issue
If accessing the server via SSH and testing locally, curl to HTTPS will fail because the Let's Encrypt challenge needs internet-facing resolution. Access the site from a browser instead.
