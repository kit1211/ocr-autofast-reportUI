#!/bin/bash

# Vercel Deployment Script
echo "🚀 Starting Vercel deployment..."

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel. Please login first:"
  echo "   vercel login"
  exit 1
fi

# Set environment variable (you'll need to set this)
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Warning: DATABASE_URL not set. Make sure to set it in Vercel dashboard."
fi

# Deploy to production
echo "📦 Deploying to production..."
vercel --prod --yes

echo "✅ Deployment complete!"

