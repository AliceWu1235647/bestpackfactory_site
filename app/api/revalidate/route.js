import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request) {
  const secret = request.nextUrl.searchParams.get('secret');
  const type = request.nextUrl.searchParams.get('type'); // 'product', 'blog', 'news', 'home'
  const slug = request.nextUrl.searchParams.get('slug');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    if (type === 'home') {
      revalidatePath('/');
    } else if (type === 'product') {
      revalidatePath('/products.html');
      if (slug) revalidatePath(`/products/${slug}`);
      revalidatePath('/');
    } else if (type === 'blog') {
      revalidatePath('/blog.html');
      if (slug) revalidatePath(`/blog/${slug}`);
      revalidatePath('/');
    } else if (type === 'news') {
      revalidatePath('/news.html');
      if (slug) revalidatePath(`/news/${slug}`);
      revalidatePath('/');
    } else {
      // Revalidate all core lists as a fallback
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
  }
}
