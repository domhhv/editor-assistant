import { PlusIcon, MinusIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import EDITOR_SHORTCUTS from '@/lib/constants/editor-shortcuts';
import {
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
} from '@/lib/constants/initial-editor-toolbar-state';
import cn from '@/lib/utils/cn';

type FontSizeInputProps = {
  className?: string;
  delayDuration: number;
  isDisabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  onMouseEnter: () => void;
};

export default function FontSizeInput({
  className = '',
  delayDuration,
  isDisabled = false,
  onChange,
  onMouseEnter,
  value,
}: FontSizeInputProps) {
  const [inputValue, setInputValue] = React.useState<string>(value);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();

      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      updateFontSize(inputValue);
    }
  }

  function handleBlur() {
    updateFontSize(inputValue);
  }

  function updateFontSize(newValue: string) {
    const numValue = Number(newValue);

    if (isNaN(numValue) || newValue === '') {
      setInputValue(value);

      return;
    }

    let clampedValue = numValue;

    if (numValue > MAX_ALLOWED_FONT_SIZE) {
      clampedValue = MAX_ALLOWED_FONT_SIZE;
    } else if (numValue < MIN_ALLOWED_FONT_SIZE) {
      clampedValue = MIN_ALLOWED_FONT_SIZE;
    }

    const finalValue = String(clampedValue);

    setInputValue(finalValue);
    onChange(finalValue);
  }

  function handleIncrement() {
    const currentValue = Number(inputValue) || Number(value);
    const newValue = Math.min(currentValue + 1, MAX_ALLOWED_FONT_SIZE);
    const finalValue = String(newValue);

    setInputValue(finalValue);
    onChange(finalValue);
  }

  function handleDecrement() {
    const currentValue = Number(inputValue) || Number(value);
    const newValue = Math.max(currentValue - 1, MIN_ALLOWED_FONT_SIZE);
    const finalValue = String(newValue);

    setInputValue(finalValue);
    onChange(finalValue);
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild onMouseEnter={onMouseEnter}>
          <Button
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleDecrement}
            disabled={isDisabled || Number(inputValue) <= MIN_ALLOWED_FONT_SIZE}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
          <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
            {EDITOR_SHORTCUTS.DECREASE_FONT_SIZE}
          </div>
          <span className="text-sm">Decrease font size</span>
        </TooltipContent>
      </Tooltip>
      <Input
        type="number"
        placeholder=""
        value={inputValue}
        variant="secondary"
        onBlur={handleBlur}
        disabled={isDisabled}
        onKeyDown={handleKeyDown}
        max={MAX_ALLOWED_FONT_SIZE}
        min={MIN_ALLOWED_FONT_SIZE}
        className="h-9 w-16 text-center"
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
      />
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild onMouseEnter={onMouseEnter}>
          <Button
            size="icon"
            type="button"
            variant="ghost"
            onClick={handleIncrement}
            disabled={isDisabled || Number(inputValue) >= MAX_ALLOWED_FONT_SIZE}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
          <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
            {EDITOR_SHORTCUTS.INCREASE_FONT_SIZE}
          </div>
          <span className="text-sm">Increase font size</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
