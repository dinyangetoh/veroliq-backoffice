'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const password = formData.get('password');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    const cookieStore = await cookies();
    // Assuming the veroliq-api also needs this token or we just use it locally
    // If the API uses Basic Auth, we need to pass `Basic admin:password`
    // Wait, the API uses AdminBasicAuthGuard which likely expects `Basic admin:admin_password`
    // Let's set the token in cookie so the client can use it.
    // The username for AdminBasicAuthGuard is usually 'admin'.
    const token = btoa(`admin:${password}`);
    cookieStore.set('admin_token', token, {
      httpOnly: false, // so client can access it to attach to headers
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    redirect('/');
  } else {
    return { error: 'Invalid password' };
  }
}
