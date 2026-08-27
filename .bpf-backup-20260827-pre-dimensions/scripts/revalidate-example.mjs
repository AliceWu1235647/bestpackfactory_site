const domain = process.env.DOMAIN || 'https://your-domain.com';
const secret = process.env.REVALIDATE_SECRET || 'your-long-secret-string';
const path = process.env.PATH_TO_REVALIDATE || '/products/new-product.html';
console.log(`curl "${domain}/api/revalidate?secret=${encodeURIComponent(secret)}&path=${encodeURIComponent(path)}"`);
