# Cloudinary Setup for Coffee Shop Admin

## Prerequisites
1. Create a Cloudinary account at https://cloudinary.com/
2. Get your Cloudinary credentials from your dashboard

## Environment Variables
Add these variables to your `.env` file in the server directory:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## How to Get Cloudinary Credentials

1. **Sign up for Cloudinary**: Go to https://cloudinary.com/ and create a free account

2. **Get your credentials**:
   - Log in to your Cloudinary dashboard
   - Go to "Dashboard" section
   - Copy your Cloud Name, API Key, and API Secret

3. **Update your .env file**:
   - Replace `your-cloud-name` with your actual Cloud Name
   - Replace `your-api-key` with your actual API Key
   - Replace `your-api-secret` with your actual API Secret

## Features
- Image upload with drag & drop
- Automatic image optimization
- Secure URL generation
- Image preview before upload
- File size validation (max 5MB)
- File type validation (images only)

## Usage
1. Go to Admin Dashboard → Products
2. Click "Add Product" or "Edit Product"
3. Use the image upload area to upload product images
4. Images will be automatically uploaded to Cloudinary
5. The secure URL will be saved with the product

## Security
- Only authenticated admin users can upload images
- File size and type validation
- Images are stored securely on Cloudinary
- Automatic image optimization for better performance 