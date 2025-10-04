import type { ElementFormatType } from 'lexical';
import {
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterIcon,
  AlignJustifyIcon,
} from 'lucide-react';
import type { SVGProps, ComponentType } from 'react';

import EDITOR_SHORTCUTS from '@/lib/constants/editor-shortcuts';

export type Alignment = Extract<
  ElementFormatType,
  'left' | 'center' | 'right' | 'justify'
>;

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

/* eslint-disable perfectionist/sort-objects */
const ELEMENT_FORMAT_OPTIONS: Record<
  Alignment,
  {
    icon: Icon;
    name: string;
    shortcut: string;
  }
> = {
  left: {
    icon: AlignLeftIcon,
    name: `Align left`,
    shortcut: EDITOR_SHORTCUTS.LEFT_ALIGN,
  },
  center: {
    icon: AlignCenterIcon,
    name: `Align center`,
    shortcut: EDITOR_SHORTCUTS.CENTER_ALIGN,
  },
  right: {
    icon: AlignRightIcon,
    name: `Align right`,
    shortcut: EDITOR_SHORTCUTS.RIGHT_ALIGN,
  },
  justify: {
    icon: AlignJustifyIcon,
    name: `Align justify`,
    shortcut: EDITOR_SHORTCUTS.JUSTIFY_ALIGN,
  },
};
/* eslint-enable perfectionist/sort-objects */

export default ELEMENT_FORMAT_OPTIONS;
