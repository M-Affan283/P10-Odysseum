provider "aws" {
  region = var.aws_region
}

# --- Node.js API Resources ---

# S3 Bucket for storing Node.js Elastic Beanstalk app versions
resource "aws_s3_bucket" "node_app_version_bucket" {
  bucket = var.node_app_version_bucket
}

resource "aws_s3_bucket_ownership_controls" "node_bucket_ownership" {
  bucket = aws_s3_bucket.node_app_version_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Node.js Elastic Beanstalk application
resource "aws_elastic_beanstalk_application" "odysseum_app" {
  name        = var.node_application_name
  description = "Odysseum API Server"
}

# Node.js Application version - use file hash for stable versioning
resource "aws_s3_object" "node_app_source" {
  bucket = aws_s3_bucket.node_app_version_bucket.bucket
  key    = "odysseum-api-${filemd5("${path.module}/odysseum-api.zip")}.zip"
  source = "${path.module}/odysseum-api.zip"
  etag   = filemd5("${path.module}/odysseum-api.zip")
}

resource "aws_elastic_beanstalk_application_version" "node_app_version" {
  name        = "odysseum-api-${filemd5("${path.module}/odysseum-api.zip")}"
  application = aws_elastic_beanstalk_application.odysseum_app.name
  description = "Odysseum API application version"
  bucket      = aws_s3_bucket.node_app_version_bucket.id
  key         = aws_s3_object.node_app_source.id
}

# Node.js Elastic Beanstalk environment
resource "aws_elastic_beanstalk_environment" "odysseum_node_env" {
  name                = var.node_environment_name
  application         = aws_elastic_beanstalk_application.odysseum_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v6.5.1 running Node.js 20"
  version_label       = aws_elastic_beanstalk_application_version.node_app_version.name
  
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }
  
  # Environment type
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"  # Use LoadBalanced for production
  }
  
  # Instance type
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.node_instance_type
  }
  
  # Environment variables
  dynamic "setting" {
    for_each = var.node_env_vars
    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.key
      value     = setting.value
    }
  }
}

# --- Flask LLM API Resources ---

# S3 Bucket for storing Flask Elastic Beanstalk app versions
resource "aws_s3_bucket" "flask_app_version_bucket" {
  bucket = var.flask_app_version_bucket
}

resource "aws_s3_bucket_ownership_controls" "flask_bucket_ownership" {
  bucket = aws_s3_bucket.flask_app_version_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Flask Elastic Beanstalk application
resource "aws_elastic_beanstalk_application" "odysseum_llm_app" {
  name        = var.flask_application_name
  description = "Odysseum LLM API Server"
}

# Flask Application version - use file hash for stable versioning
resource "aws_s3_object" "flask_app_source" {
  bucket = aws_s3_bucket.flask_app_version_bucket.bucket
  key    = "odysseum-llm-api-${filemd5("${path.module}/odysseum-llm-api.zip")}.zip"
  source = "${path.module}/odysseum-llm-api.zip"
  etag   = filemd5("${path.module}/odysseum-llm-api.zip")
}

resource "aws_elastic_beanstalk_application_version" "flask_app_version" {
  name        = "odysseum-llm-api-${filemd5("${path.module}/odysseum-llm-api.zip")}"
  application = aws_elastic_beanstalk_application.odysseum_llm_app.name
  description = "Odysseum LLM API application version"
  bucket      = aws_s3_bucket.flask_app_version_bucket.id
  key         = aws_s3_object.flask_app_source.id
}

# Flask Elastic Beanstalk environment
resource "aws_elastic_beanstalk_environment" "odysseum_flask_env" {
  name                = var.flask_environment_name
  application         = aws_elastic_beanstalk_application.odysseum_llm_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.5.1 running Python 3.11"
  version_label       = aws_elastic_beanstalk_application_version.flask_app_version.name
  
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }
  
  # Environment type
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"  # Use LoadBalanced for production
  }
  
  # Instance type
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.flask_instance_type
  }
  
  # Increase deployment timeout for package installation
  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "Timeout"
    value     = "1800"  # 30 minutes for installing packages
  }
  
  # Python WSGI configuration - ensure Flask app is found
  setting {
    namespace = "aws:elasticbeanstalk:container:python"
    name      = "WSGIPath"
    value     = "llm_server:app"  # Updated to match the actual Flask app file
  }
  
  # Memory allocation - important for ML workloads
  setting {
    namespace = "aws:elasticbeanstalk:container:python"
    name      = "NumProcesses"
    value     = "1"  # Single process to maximize memory available
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:container:python"
    name      = "NumThreads"
    value     = "15"  # Reasonable threads for handling requests
  }
  
  # Environment variables
  dynamic "setting" {
    for_each = var.flask_env_vars
    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.key
      value     = setting.value
    }
  }
}

# --- Shared IAM Resources ---

resource "aws_iam_role" "eb_service_role" {
  name = "eb-service-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eb_service_policy" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role" "eb_instance_role" {
  name = "eb-instance-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

resource "aws_iam_role_policy_attachment" "web_tier" {
  role       = aws_iam_role.eb_instance_role.id
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# Only attach worker tier policy if your application uses worker features
resource "aws_iam_role_policy_attachment" "worker_tier" {
  role       = aws_iam_role.eb_instance_role.id
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier"
}

# --- Output Values ---

# Node.js API outputs
output "node_eb_url" {
  value = aws_elastic_beanstalk_environment.odysseum_node_env.endpoint_url
}

output "node_eb_domain" {
  value = aws_elastic_beanstalk_environment.odysseum_node_env.cname
}

# Flask API outputs
output "flask_eb_url" {
  value = aws_elastic_beanstalk_environment.odysseum_flask_env.endpoint_url
}

output "flask_eb_domain" {
  value = aws_elastic_beanstalk_environment.odysseum_flask_env.cname
}