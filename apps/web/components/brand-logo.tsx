import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  href?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function BrandLogo({ href = '/', className, imageClassName, priority = false }: BrandLogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center', className)} aria-label="Credia inicio">
      <Image
        src="/CREDIA.svg"
        alt="Credia"
        width={180}
        height={60}
        priority={priority}
        className={cn('h-8 w-auto', imageClassName)}
      />
    </Link>
  );
}
