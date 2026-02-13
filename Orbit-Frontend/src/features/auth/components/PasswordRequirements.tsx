import { Check, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { validatePassword } from '../auth.utils';

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
}

export function PasswordRequirements({ password, showRequirements }: PasswordRequirementsProps) {
  if (!showRequirements) return null;

  const requirements = validatePassword(password);
  const allMet = requirements.every((req) => req.met);

  return (
    <div
      className={cn(
        'mt-2 space-y-2 rounded-md border p-3 text-sm transition-colors',
        allMet
          ? 'border-success/30 bg-success/10'
          : 'border-border bg-muted/30'
      )}
    >
      <p className="font-medium text-foreground">Password must contain:</p>
      <ul className="space-y-1">
        {requirements.map((requirement, index) => (
          <li key={index} className="flex items-center gap-2">
            {requirement.met ? (
              <Check className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <X className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={cn(
                'transition-colors',
                requirement.met
                  ? 'text-success-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {requirement.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
