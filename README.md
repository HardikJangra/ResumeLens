# 🚀 Resume Lens AI

An AI-powered resume analysis platform that helps users evaluate and improve their resumes through ATS scoring, AI-generated feedback, job matching insights, and intelligent resume processing.

Built with modern full-stack technologies and optimized using Redis caching and cloud-based file storage.

---

# ✨ Features

## 📄 Resume Upload & Processing

* Upload PDF and DOCX resumes
* Automatic resume parsing
* Secure cloud storage
* Resume text extraction
* Background resume processing

## 🤖 AI Resume Analysis

* ATS Score Generation
* Resume Strength Analysis
* Weakness Identification
* Skill Gap Detection
* Resume Improvement Suggestions
* AI-Powered Feedback using Gemini

## 🎯 Job Matching

* Analyze resume relevance
* Match candidate profiles
* Generate job compatibility insights
* Identify missing skills

## ☁️ Cloud Storage Integration

* Resume files stored in Cloudinary
* Secure cloud-hosted file management
* Public ID tracking
* Optimized document retrieval

## ⚡ Redis Caching

* SHA-256 content hashing
* Duplicate resume detection
* Cache-first architecture
* Reduced repeated AI processing
* Faster response times for previously analyzed resumes

---

# 🏗️ System Architecture

```text
User Uploads Resume
          │
          ▼
     UploadThing
          │
          ▼
     Cloudinary
          │
          ▼
     PostgreSQL
          │
          ▼
 Resume Processing API
          │
          ▼
 Generate Resume Hash
          │
          ▼
       Redis
      /     \
 Cache Hit  Cache Miss
     │          │
     ▼          ▼
Return Cached  Gemini AI
Result         Analysis
     │          │
     └────┬─────┘
          ▼
    Save Result
          ▼
      PostgreSQL
```

---

# 🔥 Performance Optimization

## Redis Cache Layer

Before Redis:

```text
Upload Resume
      │
      ▼
 Gemini Analysis
      │
      ▼
Return Result
```

Every upload triggered a new Gemini request.

After Redis:

```text
Upload Resume
      │
      ▼
Generate SHA-256 Hash
      │
      ▼
Check Redis Cache
      │
 ┌────┴────┐
 ▼         ▼
Hit       Miss
 │          │
 ▼          ▼
Return    Gemini
Cached    Analysis
Result
```

### Benefits

* Reduced duplicate AI requests
* Lower Gemini API usage
* Faster response times
* Improved scalability

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes
* Prisma ORM

## Database

* PostgreSQL (Neon)

## Authentication

* Clerk

## AI

* Google Gemini API

## Storage

* Cloudinary

## Caching

* Upstash Redis

## File Uploads

* UploadThing

---

# 📂 Core Modules

## Resume Upload Service

Handles:

* File validation
* Upload processing
* Cloudinary storage
* Metadata persistence

## Resume Analysis Service

Handles:

* Resume extraction
* ATS scoring
* AI evaluation
* Job matching

## Cache Layer

Handles:

* Resume hashing
* Cache lookup
* Cache storage
* Duplicate detection

---

# ⚙️ Environment Variables

```env
DATABASE_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

UPLOADTHING_TOKEN=

NEXT_PUBLIC_APP_URL=
```

---

# 🚀 Local Setup

## Install Dependencies

```bash
npm install
```

## Run Prisma

```bash
npx prisma generate
```

## Start Development Server

```bash
npm run dev
```

---

# 📊 Engineering Highlights

## Redis-Based Resume Caching

Implemented SHA-256 content hashing to detect duplicate resume uploads and eliminate redundant AI processing.

### Results

* Repeat analysis latency reduced from ~24s to ~3s
* Reduced Gemini API consumption
* Improved overall scalability

## Cloud Storage Migration

Integrated Cloudinary for persistent resume storage.

Benefits:

* Secure file management
* Scalable storage layer
* Improved asset availability

---

# 🔮 Future Improvements

* Rate Limiting using Redis
* Resume Version History
* PDF Report Generation
* Interview Question Generator
* Resume Comparison Tool
* Analytics Dashboard
* Multi-Resume Benchmarking

---

# 🎯 Learning Outcomes

This project demonstrates:

* Full-Stack Development
* Authentication & Authorization
* Database Design
* AI Integration
* Cloud Storage Architecture
* Redis Caching
* Content Hashing
* Performance Optimization
* Scalable System Design

---

# 📄 License

MIT License
