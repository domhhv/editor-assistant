'use client';

import * as Slider from '@radix-ui/react-slider';
import Color from 'color';
import { PipetteIcon } from 'lucide-react';
import * as React from 'react';
import type { ComponentProps, HTMLAttributes } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import cn from '@/lib/utils/cn';

type ColorPickerContextValue = {
  alpha: number;
  hue: number;
  lightness: number;
  mode: string;
  saturation: number;
  setAlpha: (alpha: number) => void;
  setHue: (hue: number) => void;
  setLightness: (lightness: number) => void;
  setMode: (mode: string) => void;
  setSaturation: (saturation: number) => void;
};

const ColorPickerContext = React.createContext<ColorPickerContextValue>({
  alpha: 100,
  hue: 0,
  lightness: 50,
  mode: 'hex',
  saturation: 100,
  setAlpha: () => {},
  setHue: () => {},
  setLightness: () => {},
  setMode: () => {},
  setSaturation: () => {},
});

export type ColorPickerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange'
> & {
  defaultValue?: Parameters<typeof Color>[0];
  value?: Parameters<typeof Color>[0];
  onChange?: (value: [number, number, number, number]) => void;
};

function ColorPicker({
  className,
  defaultValue = '#000000',
  onChange,
  value,
  ...props
}: ColorPickerProps) {
  type ColorInstance = ReturnType<typeof Color>;
  let selectedColor: ColorInstance;
  let defaultColor: ColorInstance;

  try {
    selectedColor = Color(value);
  } catch {
    selectedColor = Color(defaultValue);
  }

  try {
    defaultColor = Color(defaultValue);
  } catch {
    defaultColor = Color('#000000');
  }

  const [hue, setHue] = React.useState(
    selectedColor.hue() ?? defaultColor.hue() ?? 0
  );
  const [saturation, setSaturation] = React.useState(
    selectedColor.saturationl() ?? defaultColor.saturationl() ?? 100
  );
  const [lightness, setLightness] = React.useState(
    selectedColor.lightness() ?? defaultColor.lightness() ?? 50
  );
  const [alpha, setAlpha] = React.useState(
    (selectedColor.alpha() ?? defaultColor.alpha()) * 100
  );
  const [mode, setMode] = React.useState('hex');

  const isInternalUpdate = React.useRef(false);

  React.useEffect(() => {
    if (value && !isInternalUpdate.current) {
      try {
        const color = Color(value);
        const [h, s, l] = color.hsl().array();

        setHue(h);
        setSaturation(s);
        setLightness(l);
        setAlpha(color.alpha() * 100);
      } catch (error) {
        console.error('Invalid color value provided:', value, error);
      }
    }

    isInternalUpdate.current = false;
  }, [value]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    if (onChangeRef.current) {
      isInternalUpdate.current = true;
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
      const rgba = color.rgb().array();

      onChangeRef.current([
        Math.round(rgba[0]),
        Math.round(rgba[1]),
        Math.round(rgba[2]),
        alpha / 100,
      ]);
    }
  }, [hue, saturation, lightness, alpha]);

  return (
    <ColorPickerContext.Provider
      value={{
        alpha,
        hue,
        lightness,
        mode,
        saturation,
        setAlpha,
        setHue,
        setLightness,
        setMode,
        setSaturation,
      }}
    >
      <div
        className={cn('flex size-full flex-col gap-4', className)}
        {...props}
      />
    </ColorPickerContext.Provider>
  );
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

const ColorPickerSelection = React.memo(function ColorPickerSelection({
  className,
  ...props
}: ColorPickerSelectionProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [positionX, setPositionX] = React.useState(0);
  const [positionY, setPositionY] = React.useState(0);
  const { hue, setLightness, setSaturation } = React.use(ColorPickerContext);

  const backgroundGradient = React.useMemo(() => {
    return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`;
  }, [hue]);

  const handlePointerMove = React.useCallback(
    (event: PointerEvent) => {
      if (!(isDragging && containerRef.current)) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width)
      );
      const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height)
      );
      setPositionX(x);
      setPositionY(y);
      setSaturation(x * 100);
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
      const lightness = topLightness * (1 - y);

      setLightness(lightness);
    },
    [isDragging, setSaturation, setLightness]
  );

  React.useEffect(() => {
    function handlePointerUp() {
      return setIsDragging(false);
    }

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, handlePointerMove]);

  return (
    <div
      ref={containerRef}
      style={{
        background: backgroundGradient,
      }}
      className={cn('relative size-full cursor-crosshair rounded', className)}
      onPointerDown={(e) => {
        e.preventDefault();
        setIsDragging(true);
        handlePointerMove(e.nativeEvent);
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          left: `${positionX * 100}%`,
          top: `${positionY * 100}%`,
        }}
      />
    </div>
  );
});

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>;

function ColorPickerHue({ className, ...props }: ColorPickerHueProps) {
  const { hue, setHue } = React.use(ColorPickerContext);

  return (
    <Slider.Root
      step={1}
      max={360}
      value={[hue]}
      onValueChange={([hue]) => {
        return setHue(hue);
      }}
      className={cn('relative flex h-4 w-full touch-none', className)}
      {...props}
    >
      <Slider.Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Slider.Range className="absolute h-full" />
      </Slider.Track>
      <Slider.Thumb className="border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>;

function ColorPickerAlpha({ className, ...props }: ColorPickerAlphaProps) {
  const { alpha, setAlpha } = React.use(ColorPickerContext);

  return (
    <Slider.Root
      step={1}
      max={100}
      value={[alpha]}
      className={cn('relative flex h-4 w-full touch-none', className)}
      onValueChange={([alpha]) => {
        return setAlpha(alpha);
      }}
      {...props}
    >
      <Slider.Track
        className="relative my-0.5 h-3 w-full grow rounded-full"
        style={{
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50" />
        <Slider.Range className="absolute h-full rounded-full bg-transparent" />
      </Slider.Track>
      <Slider.Thumb className="border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
    </Slider.Root>
  );
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

function ColorPickerEyeDropper({
  className,
  ...props
}: ColorPickerEyeDropperProps) {
  const { setAlpha, setHue, setLightness, setSaturation } =
    React.use(ColorPickerContext);

  const handleEyeDropper = React.useCallback(async () => {
    try {
      // @ts-expect-error - EyeDropper is not yet in the TypeScript library
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const color = Color(result.sRGBHex);
      const [h, s, l] = color.hsl().array();

      setHue(h);
      setSaturation(s);
      setLightness(l);
      setAlpha(100);
    } catch (error) {
      console.error('EyeDropper failed:', error);
    }
  }, [setAlpha, setHue, setLightness, setSaturation]);

  return (
    <Button
      size="icon"
      type="button"
      variant="outline"
      onClick={handleEyeDropper}
      disabled={!('EyeDropper' in window)}
      className={cn('text-muted-foreground shrink-0', className)}
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  );
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>;

const formats = ['hex', 'rgb', 'css', 'hsl'];

function ColorPickerOutput({ className, ...props }: ColorPickerOutputProps) {
  const { mode, setMode } = React.use(ColorPickerContext);

  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger
        className={cn('h-8 w-20 shrink-0 text-xs', className)}
        {...props}
      >
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => {
          return (
            <SelectItem key={format} value={format} className="text-xs">
              {format.toUpperCase()}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

type PercentageInputProps = ComponentProps<typeof Input>;

function PercentageInput({ className, ...props }: PercentageInputProps) {
  return (
    <div className="relative">
      <Input
        readOnly
        type="number"
        {...props}
        className={cn(
          'h-8 w-[3.5rem] rounded-l-none px-2 text-xs shadow-none',
          className
        )}
      />
      <span className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs">
        %
      </span>
    </div>
  );
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

function ColorPickerFormat({ className, ...props }: ColorPickerFormatProps) {
  const { alpha, hue, lightness, mode, saturation } =
    React.use(ColorPickerContext);
  const color = Color.hsl(hue, saturation, lightness, alpha / 100);

  if (mode === 'hex') {
    const hex = color.hex();

    return (
      <div
        className={cn(
          'relative flex w-full items-center justify-end -space-x-px rounded-md shadow-xs',
          className
        )}
        {...props}
      >
        <Input
          readOnly
          type="text"
          value={hex}
          className="h-8 w-36 rounded-r-none px-2 text-xs shadow-none"
        />
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'rgb') {
    const rgb = color
      .rgb()
      .array()
      .slice(0, 3)
      .map((value) => {
        return Math.round(value);
      });

    return (
      <div
        className={cn(
          'flex items-center -space-x-px rounded-md shadow-xs',
          className
        )}
        {...props}
      >
        {rgb.map((value, index) => {
          return (
            <Input
              readOnly
              key={index}
              type="text"
              value={value}
              className={cn(
                'h-8 w-12 rounded-r-none px-2 text-xs shadow-none',
                index && 'rounded-l-none',
                className
              )}
            />
          );
        })}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'css') {
    const rgb = color
      .rgb()
      .array()
      .slice(0, 3)
      .map((value) => {
        return Math.round(value);
      });

    return (
      <div className={cn('w-full rounded-md shadow-xs', className)} {...props}>
        <Input
          readOnly
          type="text"
          value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
          className="h-8 w-full px-2 text-xs shadow-none"
          {...props}
        />
      </div>
    );
  }

  if (mode === 'hsl') {
    const hsl = color
      .hsl()
      .array()
      .slice(0, 3)
      .map((value) => {
        return Math.round(value);
      });

    return (
      <div
        className={cn(
          'flex items-center -space-x-px rounded-md shadow-xs',
          className
        )}
        {...props}
      >
        {hsl.map((value, index) => {
          return (
            <Input
              readOnly
              key={index}
              type="text"
              value={value}
              className={cn(
                'h-8 w-12 rounded-r-none px-2 text-xs shadow-none',
                index && 'rounded-l-none',
                className
              )}
            />
          );
        })}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  return null;
}

export {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
};
