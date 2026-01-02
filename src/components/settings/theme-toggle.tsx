'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg bg-background/50">
        <Sun className={`h-6 w-6 transition-all ${!isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
        <Switch
            id="theme-switch"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle theme"
        />
        <Moon className={`h-6 w-6 transition-all ${isDarkMode ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );
}
