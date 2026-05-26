project_name             = "twin"
environment              = "prod"
bedrock_model_id         = "us.amazon.nova-micro-v1:0"
lambda_timeout           = 60
api_throttle_burst_limit = 10
api_throttle_rate_limit  = 5
use_custom_domain        = true
root_domain              = "codacode.io"
# Set after an admin issues the cert in us-east-1, or leave empty once acm:RequestCertificate is allowed:
# acm_certificate_arn      = "arn:aws:acm:us-east-1:574852786640:certificate/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"