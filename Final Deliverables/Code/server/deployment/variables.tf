variable "aws_region" {
  description = "AWS region to deploy resources"
  default     = "us-east-1"
}

# Node.js API Variables
variable "node_app_version_bucket" {
  description = "S3 bucket name for Node.js application versions"
  default     = "odysseum-node-api-versions"
}

variable "node_application_name" {
  description = "Elastic Beanstalk Node.js application name"
  default     = "odysseum-node-api"
}

variable "node_environment_name" {
  description = "Elastic Beanstalk Node.js environment name"
  default     = "odysseum-node-api-env"
}

variable "node_instance_type" {
  description = "EC2 instance type for Node.js environment"
  default     = "t2.micro"
}

variable "node_env_vars" {
  description = "Environment variables for Node.js application"
  type        = map(string)
  default     = {
    NODE_ENV = "production"
  }
}

# Flask LLM API Variables
variable "flask_app_version_bucket" {
  description = "S3 bucket name for Flask application versions"
  default     = "odysseum-flask-llm-api-versions"
}

variable "flask_application_name" {
  description = "Elastic Beanstalk Flask application name"
  default     = "odysseum-llm-api"
}

variable "flask_environment_name" {
  description = "Elastic Beanstalk Flask environment name"
  default     = "odysseum-llm-api-env"
}

variable "flask_instance_type" {
  description = "EC2 instance type for Flask environment"
  default     = "t2.micro"
}

variable "flask_env_vars" {
  description = "Environment variables for Flask application"
  type        = map(string)
  default     = {
    FLASK_ENV = "production"
  }
}
