<?php
/**
 * Copy to config.php on Hostinger only. Never commit the live config.
 * Configure a monitored recipient address and a verified sender on your domain.
 */
return [
 'recipient_email' => 'REPLACE_WITH_VERIFIED_AGENCY_INBOX',
 'from_email' => 'no-reply@YOUR-DOMAIN.example',
 'from_name' => 'Agency Website',
];
