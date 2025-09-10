import React, { useEffect, useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ChevronsUpDown, Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { normalizeCity, uniqueSortedCities } from '@/lib/city';

interface CityPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export const CityPicker: React.FC<CityPickerProps> = ({
  value,
  onChange,
  placeholder = 'Select city',
  disabled,
  allowCustom = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const displayValue = useMemo(() => normalizeCity(value || ''), [value]);

  useEffect(() => {
    const loadCities = async () => {
      const { data, error } = await supabase.from('communities').select('city');
      if (!error) {
        setCities(uniqueSortedCities((data || []).map((r: any) => r.city)));
      }
    };
    loadCities();
  }, []);

  const options = useMemo(() => cities, [cities]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          role="combobox"
          variant="outline"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className="flex items-center gap-2 text-left overflow-hidden">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{displayValue || placeholder}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search cities..." />
          <CommandList>
            <CommandEmpty>
              {allowCustom ? (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm"
                  onClick={() => {
                    const input = (document.querySelector('[cmdk-input]') as HTMLInputElement)?.value || '';
                    const n = normalizeCity(input);
                    if (n) {
                      onChange(n);
                      setOpen(false);
                    }
                  }}
                >
                  Create "{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value || ''}"
                </button>
              ) : (
                'No cities found.'
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((city) => (
                <CommandItem
                  key={city}
                  value={city}
                  onSelect={() => {
                    onChange(city);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', city === displayValue ? 'opacity-100' : 'opacity-0')} />
                  {city}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

