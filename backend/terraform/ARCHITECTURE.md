# AWS Deployment Architecture

This diagram reflects the resources and relationships declared in the Terraform configuration in this directory. Dashed elements are conditional or deployment-time dependencies rather than request traffic.

```mermaid
flowchart LR
    visitor["Web browser"]
    deployer["Terraform operator"]

    subgraph dns["Optional custom domain"]
        route53["Route 53<br/>A and AAAA aliases"]
        acm["ACM certificate<br/>us-east-1"]
        validation["Route 53<br/>DNS validation record"]
    end

    subgraph delivery["Frontend delivery"]
        cloudfront["CloudFront distribution<br/>HTTPS and compressed delivery"]
        oac["Origin Access Control<br/>SigV4 requests"]
        frontend["Private S3 frontend bucket<br/>Static export"]
    end

    subgraph api["Chat API"]
        gateway["API Gateway HTTP API<br/>Health, chat, and conversation routes"]
        lambda["Python 3.14 Lambda<br/>Mangum / FastAPI handler"]
        role["Lambda IAM role"]
        policies["Least-privilege policies<br/>Logs, Bedrock, memory objects"]
    end

    subgraph services["Data and AI services"]
        bedrock["Amazon Bedrock<br/>Nova model"]
        memory["Private S3 memory bucket<br/>Conversation history"]
        logs["CloudWatch Logs"]
    end

    subgraph state["Terraform state"]
        stateBucket[("External S3 backend<br/>configured at init time")]
    end

    visitor -->|"HTTPS: custom domain"| route53
    visitor -->|"HTTPS: default distribution URL"| cloudfront
    route53 -->|"Alias"| cloudfront
    acm -.->|"TLS certificate"| cloudfront
    validation -.->|"Validates"| acm
    cloudfront -->|"Signed HTTPS request"| oac
    oac -->|"GetObject"| frontend
    frontend -.->|"Loads static application"| visitor

    visitor -->|"HTTPS API request"| gateway
    gateway -->|"AWS proxy integration"| lambda
    lambda -->|"Converse API"| bedrock
    lambda -->|"Read and write sessions"| memory
    lambda -->|"Execution logs"| logs

    policies -->|"Attached to"| role
    role -->|"Execution role"| lambda

    deployer -.->|"terraform init / apply"| stateBucket
    deployer -.->|"Provisions"| cloudfront
    deployer -.->|"Provisions"| gateway
    deployer -.->|"Deploys lambda-deployment.zip"| lambda

    classDef optional fill:#fff8e1,stroke:#d69e2e,color:#5f4500,stroke-dasharray: 5 5;
    classDef storage fill:#e6f4ea,stroke:#2e7d32,color:#123d18;
    classDef compute fill:#e8f0fe,stroke:#3367d6,color:#15336b;
    class route53,acm,validation optional;
    class frontend,memory,stateBucket storage;
    class cloudfront,oac,gateway,lambda,bedrock compute;
```

## Architecture notes

- CloudFront serves the exported frontend from a private S3 REST origin. Origin Access Control signs requests, so the bucket is not publicly readable. API requests go from the browser to the separate API Gateway URL.
- The custom domain, Route 53 aliases, and ACM certificate resources are created only when `use_custom_domain` is enabled. Terraform can either create the certificate or use an existing ARN.
- Lambda stores conversation history in the encrypted private memory bucket, where objects expire after the configured retention period, and calls the configured Bedrock model.
- The Lambda role uses the AWS-managed basic execution policy for logs plus a narrow inline policy for conversation objects and the selected Bedrock model.
- The Terraform S3 backend bucket is supplied during `terraform init`; this configuration does not provision that bucket.
