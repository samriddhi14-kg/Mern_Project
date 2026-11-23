# Production Hosting & DevOps Guide: MERN Food Ordering Web Application
### Automated AWS EC2 Deployment with CloudFormation, Nginx, PM2 & GitHub Actions CI/CD

This document details the production hosting infrastructure and step-by-step instructions for deploying the **MERN Food Ordering Application** onto **AWS EC2** using Infrastructure-as-Code (IaC) and automated CI/CD.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Infrastructure Files in this Repository](#2-infrastructure-files-in-this-repository)
3. [Step-by-Step Deployment Instructions](#3-step-by-step-deployment-instructions)
   - [Step 1: Set Up Cloud Database (MongoDB Atlas)](#step-1-set-up-cloud-database-mongodb-atlas)
   - [Step 2: Collect AWS Credentials](#step-2-collect-aws-credentials)
   - [Step 3: Configure GitHub Secrets & Variables](#step-3-configure-github-secrets--variables)
   - [Step 4: Push to Main to Trigger CI/CD](#step-4-push-to-main-to-trigger-cicd)
   - [Step 5: Verify Live Application & Admin Access](#step-5-verify-live-application--admin-access)
4. [Custom Project Implementations & Routing Details](#4-custom-project-implementations--routing-details)
5. [AWS Learner Lab Expiration & Fast Recovery](#5-aws-learner-lab-expiration--fast-recovery)
6. [Server Maintenance & Debugging Commands](#6-server-maintenance--debugging-commands)

---

## 1. Architecture Overview

When a user visits your application via the public IP or domain, web traffic flows through the following architecture:

```
                            [ USER / BROWSER ]
                                    │
                                    │ HTTP Request (Port 80)
                                    ▼
                  ┌───────────────────────────────────┐
                  │          AWS EC2 INSTANCE         │
                  │         (Ubuntu 24.04 LTS)        │
                  │                                   │
                  │   ┌───────────────────────────┐   │
                  │   │    NGINX (Reverse Proxy)  │   │
                  │   └─────────────┬─────────────┘   │
                  │                 │                 │
                  │    ┌────────────┴───────────┐     │
                  │    │                        │     │
                  │    ▼                        ▼     │
                  │  Static Files           Backend   │
                  │  (React/Vite SPA)       Express   │
                  │  /frontend/dist         Port 5000 │
                  │                         (via PM2) │
                  └─────────────────────────────┬─────┘
                                                │
                                                │ Mongoose Connection
                                                ▼
                                    [ CLOUD DATABASE ]
                                    (MongoDB Atlas M0 - 24/7)
```

### Core Architecture Components:
- **AWS CloudFormation (`infra/ec2-instance.yaml`):** Provisions an Ubuntu 24.04 LTS `t2.micro` EC2 instance, configures Security Groups (Port 80 HTTP, Port 22 SSH), generates an SSH key pair stored securely in **AWS Systems Manager (SSM) Parameter Store**, and runs a bootstrap script (`UserData`) to install Node.js 22, Git, Nginx, and PM2.
- **Nginx Web Server (`infra/nginx.conf`):** Public entry point listening on Port 80. Serves compiled React static assets (`frontend/dist`), provides SPA client-side routing fallback (`try_files`), reverse-proxies `/api/` traffic to Express on internal port `5000`, and caches static media.
- **PM2 Process Manager (`backend/ecosystem.config.cjs`):** Keeps the Node.js backend active 24/7 in `fork` mode (optimized for single-core `t2.micro` instances) and automatically restarts on failures or instance reboot.
- **GitHub Actions CI/CD (`.github/workflows/deploy.yml`):** Automatically tests and builds frontend assets, deploys/updates the CloudFormation stack, fetches the SSH key from SSM, SSH-es into EC2, pulls latest code, configures `.env`, seeds the database, and reloads PM2 and Nginx.
- **MongoDB Atlas (Database as a Service):** 24/7 managed cloud database running outside the EC2 instance, persisting data across server reboots.

---

## 2. Infrastructure Files in this Repository

| File Path | Description |
|---|---|
| [`infra/ec2-instance.yaml`](./infra/ec2-instance.yaml) | CloudFormation template that provisions EC2, KeyPair, SecurityGroup, and bootstrap UserData. |
| [`infra/nginx.conf`](./infra/nginx.conf) | Nginx configuration file for reverse proxy, static React hosting, and SPA routing. |
| [`backend/ecosystem.config.cjs`](./backend/ecosystem.config.cjs) | PM2 process manager configuration for the Express server. |
| [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) | GitHub Actions CI/CD deployment pipeline. |

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Set Up Cloud Database (MongoDB Atlas)

1. Register or log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new project and build an **M0 Free Cluster** in region `us-east-1` (North Virginia).
3. **Database User Setup**:
   - Go to **Security** $\rightarrow$ **Database Access** $\rightarrow$ **Add New Database User**.
   - Create a username (e.g., `foodadmin`) and a password.
   - Set privileges to **Read and write to any database**.
4. **Network Whitelisting**:
   - Go to **Security** $\rightarrow$ **Network Access** $\rightarrow$ **Add IP Address**.
   - Choose **Allow Access from Anywhere (`0.0.0.0/0`)** and confirm.
   *(Essential because AWS EC2 public IPs change on instance recreation).*
5. **Connection String**:
   - Go to **Deployment** $\rightarrow$ **Database** $\rightarrow$ **Connect** $\rightarrow$ **Drivers** (Node.js).
   - Copy the connection URI:
     ```text
     mongodb+srv://foodadmin:<password>@<cluster-url>/food_ordering?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify database name `food_ordering`.

---

### Step 2: Collect AWS Credentials

#### Option A: AWS Academy / Learner Lab (VocLabs)
1. Open the lab and click **Start Lab** until the status turns green.
2. Click **AWS Details** $\rightarrow$ **Show** next to AWS CLI.
3. Copy the values:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token`

#### Option B: Standard AWS Account
1. Open IAM in the AWS Console.
2. Create an IAM User with `AdministratorAccess` (or EC2 + CloudFormation + SSM permissions).
3. Generate an Access Key ID and Secret Access Key.

---

### Step 3: Configure GitHub Secrets & Variables

In your GitHub repository ([`samriddhi14-kg/Mern_Project`](https://github.com/samriddhi14-kg/Mern_Project)), go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.

#### Add Repository Secrets:
| Secret Name | Description / Example Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | `ASIA...` (from Step 2) |
| `AWS_SECRET_ACCESS_KEY` | Secret access key (from Step 2) |
| `AWS_SESSION_TOKEN` | Full session token string (required for Learner Lab; omit if using standard IAM) |
| `MONGODB_URI` | `mongodb+srv://foodadmin:<password>@<cluster>.mongodb.net/food_ordering?retryWrites=true&w=majority` |
| `JWT_SECRET` | A secure random string (e.g. `jwt_super_secret_food_ordering_2026_xyz`) |

#### Add Repository Variable:
Under the **Variables** tab, click **New repository variable**:
- **Name**: `AWS_REGION`
- **Value**: `us-east-1`

---

### Step 4: Push to Main to Trigger CI/CD

Commit all changes and push to your `main` branch:

```bash
git push origin main
```

- Navigate to the **Actions** tab in GitHub to watch the workflow run.
- The initial run provisions the virtual machine and bootstraps system dependencies (approx. 5–7 minutes).
- Subsequent deployments take ~60–90 seconds.

---

### Step 5: Verify Live Application & Admin Access

1. When the workflow completes with a green checkmark, open the **Deploy to EC2** job.
2. Expand the **Print Live Web Application URL** step and copy the printed IP URL:
   ```text
   http://<EC2_PUBLIC_IP>
   ```
3. Open the URL in your browser to interact with the customer-facing food ordering app.
4. **Admin Portal**:
   - The deployment pipeline automatically executes idempotent database seed scripts (`npm run seed:admin` and `npm run seed:data`).
   - Navigate to `http://<EC2_PUBLIC_IP>/admin/login`
   - **Default Admin Email**: `admin@foodorder.com`
   - **Default Admin Password**: `AdminPassword123!`

---

## 4. Custom Project Implementations & Routing Details

This repository features several optimizations tailored specifically for this project:

1. **Relative Frontend API Base URL**:
   The frontend API service uses `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1'`. During CI/CD build, `VITE_API_BASE_URL` is injected as `/api/v1`. This ensures frontend HTTP requests target relative paths (`/api/v1/...`), eliminating browser CORS errors and hardcoded IP dependencies.
2. **Nginx Reverse Proxy Mapping**:
   Nginx captures any request starting with `/api/` and proxies it to internal port `5000` (`http://127.0.0.1:5000/api/`). Express routes mounted at `/api/v1/auth`, `/api/v1/foods`, etc., map directly and securely.
3. **SPA Deep-Linking Support**:
   React Router client-side routes (such as `/admin/orders` or `/cart`) are safeguarded by `try_files $uri $uri/ /index.html;` in Nginx, preventing HTTP 404 errors on page reloads.
4. **Automated Database Seeding**:
   The deployment workflow runs `npm run seed:admin` and `npm run seed:data` after building the backend environment. If documents already exist, the scripts skip recreation cleanly.

---

## 5. AWS Learner Lab Expiration & Fast Recovery

If using an AWS Academy Learner Lab, instances shut down and credentials expire after a 4-hour window.

### Recovery in 60 seconds:
1. Re-open your lab and click **Start Lab**.
2. Click **AWS Details** $\rightarrow$ **Show** and copy the fresh `[default]` credentials.
3. Update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` in GitHub Repository Secrets.
4. Go to **Actions** in GitHub and click **Re-run all jobs** on the latest workflow.
5. CloudFormation re-links the EC2 instance, queries the current Public IP, and recovers full operations automatically.

---

## 6. Server Maintenance & Debugging Commands

To inspect or troubleshoot the live server, connect using **EC2 Instance Connect** in the AWS EC2 Console:

```bash
# Check status of the Node.js backend
pm2 status

# View live backend error and application logs
pm2 logs --lines 50

# Restart backend process with fresh environment variables
pm2 restart food-ordering-backend --update-env

# Monitor live web traffic through Nginx
sudo tail -f /var/log/nginx/access.log

# Monitor Nginx errors
sudo tail -f /var/log/nginx/error.log

# Test and reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```
