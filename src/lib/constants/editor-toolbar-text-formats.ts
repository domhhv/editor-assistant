import type { TextFormatType } from 'lexical';
import {
  CaseLowerIcon,
  CaseUpperIcon,
  SubscriptIcon,
  HighlighterIcon,
  SuperscriptIcon,
  CaseSensitiveIcon,
} from 'lucide-react';

import EDITOR_SHORTCUTS from '@/lib/constants/editor-shortcuts';

type FormatOption = Extract<
  TextFormatType,
  | 'lowercase'
  | 'uppercase'
  | 'capitalize'
  | 'subscript'
  | 'superscript'
  | 'highlight'
>;

type ToolbarStateKey =
  | 'isLowercase'
  | 'isUppercase'
  | 'isCapitalize'
  | 'isSubscript'
  | 'isSuperscript'
  | 'isHighlight';

/* eslint-disable perfectionist/sort-objects */
const TEXT_FORMAT_OPTIONS: Record<
  FormatOption,
  {
    icon: React.ElementType;
    key: ToolbarStateKey;
    name: string;
    shortcut: string;
  }
> = {
  lowercase: {
    icon: CaseLowerIcon,
    key: 'isLowercase',
    name: 'Lowercase',
    shortcut: EDITOR_SHORTCUTS.LOWERCASE,
  },
  uppercase: {
    icon: CaseUpperIcon,
    key: 'isUppercase',
    name: 'Uppercase',
    shortcut: EDITOR_SHORTCUTS.UPPERCASE,
  },
  capitalize: {
    icon: CaseSensitiveIcon,
    key: 'isCapitalize',
    name: 'Capitalize',
    shortcut: EDITOR_SHORTCUTS.CAPITALIZE,
  },
  highlight: {
    icon: HighlighterIcon,
    key: 'isHighlight',
    name: 'Highlight',
    shortcut: EDITOR_SHORTCUTS.HIGHLIGHT,
  },
  subscript: {
    icon: SubscriptIcon,
    key: 'isSubscript',
    name: 'Subscript',
    shortcut: EDITOR_SHORTCUTS.SUBSCRIPT,
  },
  superscript: {
    icon: SuperscriptIcon,
    key: 'isSuperscript',
    name: 'Superscript',
    shortcut: EDITOR_SHORTCUTS.SUPERSCRIPT,
  },
};
/* eslint-enable perfectionist/sort-objects */

export default TEXT_FORMAT_OPTIONS;
