import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth?callbackUrl=/admin');
  }
  
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user?.id },
    select: { isAdmin: true }
  });
  
  // Redirect to home if not admin
  if (!user?.isAdmin) {
    redirect('/?error=admin_required');
  }
  
  return <>{children}</>;
}
