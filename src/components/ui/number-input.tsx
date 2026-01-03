'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value: string | number | undefined | null;
  onChange: (value: string | number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, min = 0, max, step = 1, ...props }, ref) => {
    const innerInputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerInputRef.current as HTMLInputElement);

    // ref to store current value to avoid stale closures inside interval
    const valueRef = React.useRef(value);

    // refs for timers (start delay and interval)
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    // update value ref whenever prop value changes
    React.useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const handleStep = (direction: 1 | -1) => {
      // get the freshest value from ref, not from props
      const current = valueRef.current ? parseFloat(String(valueRef.current)) : 0;
      const safeCurrent = isNaN(current) ? 0 : current;

      let newValue = safeCurrent + step * direction;

      // validation for min/max
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;

      // rounding to 2 decimal places to fix js floating point issues
      const fixedValue = parseFloat(newValue.toFixed(2));

      onChange(fixedValue);
      // we don't focus here to avoid scroll jumping when holding button
    };

    const startAutoChange = (direction: 1 | -1) => {
      // 1. execute immediate change on click
      handleStep(direction);

      // 2. set delay before rapid change starts
      // this allows distinguishing between single click and holding
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          handleStep(direction);
        }, 50); // change value every 50ms
      }, 300);
    };

    const stopAutoChange = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // cleanup timers on component unmount
    React.useEffect(() => {
      return () => stopAutoChange();
    }, []);

    return (
      <div className={cn('relative group', className)}>
        <Input
          type="number"
          step={step}
          min={min}
          max={max}
          {...props}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          ref={innerInputRef}
          className={cn(
            'bg-slate-950 border-slate-800 focus:border-blue-500/50 text-sm h-9 text-white font-mono pr-8',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />

        <div className="absolute right-[1px] top-[1px] bottom-[1px] w-7 flex flex-col border-l border-slate-800">
          <button
            type="button"
            // using onMouseDown/onTouchStart instead of onClick to handle continuous change
            onMouseDown={() => startAutoChange(1)}
            onMouseUp={stopAutoChange}
            onMouseLeave={stopAutoChange}
            onTouchStart={(e) => {
              // preventDefault avoids mouse emulation on mobile devices
              if (e.cancelable) e.preventDefault();
              startAutoChange(1);
            }}
            onTouchEnd={stopAutoChange}
            className="flex-1 flex items-center justify-center hover:bg-blue-900/20 text-slate-500 hover:text-blue-400 active:text-blue-300 active:bg-blue-900/40 transition-colors rounded-tr-md"
            tabIndex={-1}
            disabled={props.disabled}
          >
            <ChevronUp size={12} strokeWidth={3} />
          </button>
          <button
            type="button"
            // same logic for decrement button
            onMouseDown={() => startAutoChange(-1)}
            onMouseUp={stopAutoChange}
            onMouseLeave={stopAutoChange}
            onTouchStart={(e) => {
              if (e.cancelable) e.preventDefault();
              startAutoChange(-1);
            }}
            onTouchEnd={stopAutoChange}
            className="flex-1 flex items-center justify-center hover:bg-blue-900/20 text-slate-500 hover:text-blue-400 active:text-blue-300 active:bg-blue-900/40 transition-colors border-t border-slate-800/50 rounded-br-md"
            tabIndex={-1}
            disabled={props.disabled}
          >
            <ChevronDown size={12} strokeWidth={3} />
          </button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = 'NumberInput';
