import { Construction } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ComingSoonProps {
  title: string;
  subtitle: string;
  blockReference: string;
  bullets: string[];
}

export function ComingSoon({ title, subtitle, blockReference, bullets }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <Construction className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Próximamente</CardTitle>
              <CardDescription>{blockReference}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-400">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-slate-600">▸</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
