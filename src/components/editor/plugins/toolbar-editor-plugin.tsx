import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $patchStyleText } from '@lexical/selection';
import Color from 'color';
import {
  $getRoot,
  REDO_COMMAND,
  UNDO_COMMAND,
  HISTORIC_TAG,
  $getSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
} from 'lexical';
import {
  XIcon,
  BoldIcon,
  CodeIcon,
  ListIcon,
  UndoIcon,
  RedoIcon,
  LinkIcon,
  QuoteIcon,
  IndentIcon,
  ItalicIcon,
  EraserIcon,
  HeadingIcon,
  BaselineIcon,
  UnderlineIcon,
  ChevronDownIcon,
  TextInitialIcon,
  PaintBucketIcon,
  TypeOutlineIcon,
  StrikethroughIcon,
  BrushCleaningIcon,
  IndentDecreaseIcon,
} from 'lucide-react';
import * as React from 'react';

import EditorColorPicker from '@/components/custom/editor-color-picker';
import FontSizeInput from '@/components/custom/font-size-input';
import { ToolbarStateContext } from '@/components/providers/editor-toolbar-state-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import EDITOR_SHORTCUTS from '@/lib/constants/editor-shortcuts';
import type { Alignment } from '@/lib/constants/editor-toolbar-alignments';
import ELEMENT_FORMAT_OPTIONS from '@/lib/constants/editor-toolbar-alignments';
import headings from '@/lib/constants/editor-toolbar-headings';
import lists from '@/lib/constants/editor-toolbar-lists';
import TEXT_FORMAT_OPTIONS from '@/lib/constants/editor-toolbar-text-formats';
import useEditorToolbarSync from '@/lib/hooks/use-editor-toolbar-sync';
import useTooltipGroup from '@/lib/hooks/use-tooltip-group';
import {
  formatQuote,
  formatHeading,
  updateFontSize,
  formatCheckList,
  formatParagraph,
  clearFormatting,
  formatBulletList,
  formatNumberedList,
} from '@/lib/utils/editor-helpers';

export default function ToolbarEditorPlugin() {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = React.use(ToolbarStateContext);
  const tooltipGroup = useTooltipGroup();
  const [isFontColorPickerOpen, setIsFontColorPickerOpen] =
    React.useState(false);
  const [isBackgroundColorPickerOpen, setIsBackgroundColorPickerOpen] =
    React.useState(false);
  const [fontColor, setFontColor] = React.useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] =
    React.useState<string>('#000000');
  useEditorToolbarSync();

  React.useEffect(() => {
    setFontColor(toolbarState.fontColor || '#000000');
  }, [toolbarState.fontColor]);

  React.useEffect(() => {
    setBackgroundColor(toolbarState.backgroundColor || '#ffffff');
  }, [toolbarState.backgroundColor]);

  const applyStyleText = React.useCallback(
    (styles: Record<string, string>) => {
      editor.update(
        () => {
          const selection = $getSelection();

          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        { tag: HISTORIC_TAG }
      );
    },
    [editor]
  );

  const applyFontColor = React.useCallback(() => {
    setIsFontColorPickerOpen(false);
    applyStyleText({ color: fontColor });
  }, [applyStyleText, fontColor]);

  const applyBackgroundColor = React.useCallback(() => {
    setIsBackgroundColorPickerOpen(false);
    applyStyleText({ 'background-color': backgroundColor });
  }, [applyStyleText, backgroundColor]);

  const applyFontFamily = React.useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();

        if (selection !== null) {
          $patchStyleText(selection, {
            ['font-family']: option,
          });
        }
      });
    },
    [editor]
  );

  const handleFontSizeChange = React.useCallback(
    (newSize: string) => {
      updateFontSize(editor, `${newSize}px`);
    },
    [editor]
  );

  const handleFontColorOpenChange = React.useCallback((open: boolean) => {
    setIsFontColorPickerOpen(open);
    setIsBackgroundColorPickerOpen(false);
  }, []);

  const handleBackgroundColorOpenChange = React.useCallback((open: boolean) => {
    setIsBackgroundColorPickerOpen(open);
    setIsFontColorPickerOpen(false);
  }, []);

  React.useEffect(() => {
    if (!isFontColorPickerOpen && !isBackgroundColorPickerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return;
      }

      if (isFontColorPickerOpen) {
        setIsFontColorPickerOpen(false);
      }

      if (isBackgroundColorPickerOpen) {
        setIsBackgroundColorPickerOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFontColorPickerOpen, isBackgroundColorPickerOpen]);

  return (
    <TooltipProvider>
      <div
        onMouseLeave={tooltipGroup.onGroupMouseLeave}
        className="flex items-center gap-2 overflow-x-auto p-2"
      >
        <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
          <TooltipTrigger
            asChild
            onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
          >
            <Button
              size="icon"
              variant="outline"
              className="flex-shrink-0"
              onClick={() => {
                editor.update(() => {
                  $getRoot().clear();
                });
              }}
            >
              <BrushCleaningIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
            <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
              {EDITOR_SHORTCUTS.CLEAR_EDITOR}
            </div>
            <span className="text-sm">Clear all content</span>
          </TooltipContent>
        </Tooltip>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <div className="flex-shrink-0 [&>*]:rounded-none [&>*]:first:rounded-l-md [&>*]:last:rounded-r-md">
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant="secondary"
                disabled={!toolbarState.canUndo}
                onClick={() => {
                  editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
              >
                <UndoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.UNDO}
              </div>
              <span className="text-sm">Undo</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant="secondary"
                disabled={!toolbarState.canRedo}
                onClick={() => {
                  editor.dispatchCommand(REDO_COMMAND, undefined);
                }}
              >
                <RedoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.REDO}
              </div>
              <span className="text-sm">Redo</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <div className="flex-shrink-0 [&>*]:rounded-none [&>*]:first:rounded-l-md [&>*]:last:rounded-r-md">
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isBold ? 'secondary' : 'ghost'}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                }}
              >
                <BoldIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.BOLD}
              </div>
              <span className="text-sm">Bold</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isItalic ? 'secondary' : 'ghost'}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                }}
              >
                <ItalicIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.ITALIC}
              </div>
              <span className="text-sm">Italic</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isUnderline ? 'secondary' : 'ghost'}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                }}
              >
                <UnderlineIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.UNDERLINE}
              </div>
              <span className="text-sm">Underline</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isStrikethrough ? 'secondary' : 'ghost'}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                }}
              >
                <StrikethroughIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.STRIKETHROUGH}
              </div>
              <span className="text-sm">Strikethrough</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isCode ? 'secondary' : 'ghost'}
                onClick={() => {
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                }}
              >
                <CodeIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.CODE}
              </div>
              <span className="text-sm">Code</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant={toolbarState.isLink ? 'secondary' : 'ghost'}
                onClick={() => {
                  if (!toolbarState.isLink) {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
                  }
                }}
              >
                <LinkIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.INSERT_LINK}
              </div>
              <span className="text-sm">Link</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator
          orientation="vertical"
          className="h-6! self-center justify-self-center"
        />

        <Select value={toolbarState.fontFamily} onValueChange={applyFontFamily}>
          <SelectTrigger
            size="sm"
            variant="secondary"
            className="w-40 flex-shrink-0"
          >
            <SelectValue placeholder="Font family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Ubuntu">Ubuntu</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Lora">Lora</SelectItem>
          </SelectContent>
        </Select>

        <FontSizeInput
          className="flex-shrink-0"
          value={toolbarState.fontSize}
          onChange={handleFontSizeChange}
          onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
          delayDuration={tooltipGroup.getTooltipProps().delayDuration}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="w-40 flex-shrink-0 justify-between"
          >
            <Button size="sm" variant="secondary">
              <HeadingIcon className="mr-1 h-4 w-4" />
              {headings.find((h) => {
                return h.value === toolbarState.blockType;
              })?.label || 'Normal text'}
              <ChevronDownIcon className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {headings.map((heading) => {
              return (
                <DropdownMenuItem
                  key={heading.value}
                  className="flex justify-between gap-4"
                  onClick={() => {
                    formatHeading(
                      editor,
                      toolbarState.blockType,
                      heading.value
                    );
                  }}
                >
                  <div className="flex items-center">
                    <heading.icon className="mr-2 h-4 w-4" />
                    <span>{heading.label}</span>
                  </div>
                  <span className="text-muted-foreground min-w-14 text-xs">
                    {heading.shortcut}
                  </span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-between gap-4"
              onClick={() => {
                return formatParagraph(editor);
              }}
            >
              <div className="flex items-center gap-2">
                <TextInitialIcon />
                <span>Normal text</span>
              </div>
              <span className="text-muted-foreground ml-auto text-xs">
                {EDITOR_SHORTCUTS.NORMAL}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="w-44 flex-shrink-0 justify-between"
          >
            <Button size="sm" variant="secondary">
              <ListIcon className="mr-1 h-4 w-4" />
              {lists.find((l) => {
                return l.value === toolbarState.blockType;
              })?.label || 'Insert list'}
              <ChevronDownIcon className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {lists.map((list) => {
              return (
                <DropdownMenuItem
                  key={list.value}
                  className="flex justify-between gap-4"
                  onClick={() => {
                    if (list.value === 'bullet') {
                      formatBulletList(editor, toolbarState.blockType);
                    } else if (list.value === 'number') {
                      formatNumberedList(editor, toolbarState.blockType);
                    } else if (list.value === 'check') {
                      formatCheckList(editor, toolbarState.blockType);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <list.icon className="mr-2 h-4 w-4" />
                    <span>{list.label}</span>
                  </div>
                  <span className="text-muted-foreground min-w-14 text-xs">
                    {list.shortcut}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <Popover
          open={isFontColorPickerOpen}
          onOpenChange={handleFontColorOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="flex-shrink-0 gap-0 space-x-2"
            >
              <div className="flex items-center gap-2">
                <BaselineIcon />
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: Color(fontColor).alpha(0.8).string(),
                  }}
                />
              </div>
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            asChild
            onInteractOutside={(event) => {
              event.preventDefault();
            }}
          >
            <div className="w-[305px] space-y-4">
              <div className="text-muted-foreground flex items-center justify-between">
                <p className="text-sm">Font color</p>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setIsFontColorPickerOpen(false);
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              <EditorColorPicker value={fontColor} onChange={setFontColor} />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsFontColorPickerOpen(false);
                }}
              >
                <div className="rounded border border-current px-1 py-0.5 text-xs">
                  Esc
                </div>
                <span>Cancel</span>
              </Button>
              <Button className="w-full" onClick={applyFontColor}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover
          open={isBackgroundColorPickerOpen}
          onOpenChange={handleBackgroundColorOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="flex-shrink-0 gap-0 space-x-2"
            >
              <div className="flex items-center gap-2">
                <PaintBucketIcon />
                <div
                  className="h-4 w-4 rounded"
                  style={{
                    backgroundColor: Color(backgroundColor).alpha(0.8).string(),
                  }}
                />
              </div>
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            asChild
            onInteractOutside={(event) => {
              event.preventDefault();
            }}
          >
            <div className="w-[305px] space-y-4">
              <div className="text-muted-foreground flex items-center justify-between">
                <p className="text-sm">Background color</p>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setIsBackgroundColorPickerOpen(false);
                  }}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
              <EditorColorPicker
                value={backgroundColor}
                onChange={setBackgroundColor}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsBackgroundColorPickerOpen(false);
                }}
              >
                <div className="rounded border border-current px-1 py-0.5 text-xs">
                  Esc
                </div>
                <span>Cancel</span>
              </Button>
              <Button className="w-full" onClick={applyBackgroundColor}>
                <span>Apply</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <div className="flex-shrink-0 [&>*]:rounded-none [&>*]:first:rounded-l-md [&>*]:last:rounded-r-md">
          {(Object.keys(ELEMENT_FORMAT_OPTIONS) as Alignment[]).map(
            (alignment) => {
              const {
                icon: Icon,
                name,
                shortcut,
              } = ELEMENT_FORMAT_OPTIONS[alignment];

              return (
                <Tooltip
                  key={alignment}
                  delayDuration={tooltipGroup.getTooltipProps().delayDuration}
                >
                  <TooltipTrigger
                    asChild
                    onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
                  >
                    <Button
                      size="icon"
                      aria-label={name}
                      variant={
                        toolbarState.elementFormat === alignment
                          ? 'secondary'
                          : 'ghost'
                      }
                      onClick={() => {
                        editor.dispatchCommand(
                          FORMAT_ELEMENT_COMMAND,
                          alignment
                        );
                      }}
                    >
                      <Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
                    <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                      {shortcut}
                    </div>
                    <span className="text-sm">{name}</span>
                  </TooltipContent>
                </Tooltip>
              );
            }
          )}
        </div>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <div className="flex-shrink-0 [&>*]:rounded-none [&>*]:first:rounded-l-md [&>*]:last:rounded-r-md">
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                }}
              >
                <IndentDecreaseIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.OUTDENT}
              </div>
              <span className="text-sm">Outdent</span>
            </TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
            <TooltipTrigger
              asChild
              onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
            >
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                }}
              >
                <IndentIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
              <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
                {EDITOR_SHORTCUTS.INDENT}
              </div>
              <span className="text-sm">Indent</span>
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator
          orientation="vertical"
          className="h-6! flex-shrink-0 self-center justify-self-center"
        />

        <Tooltip delayDuration={tooltipGroup.getTooltipProps().delayDuration}>
          <TooltipTrigger
            asChild
            onMouseEnter={tooltipGroup.getTooltipProps().onMouseEnter}
          >
            <Button
              size="icon"
              className="flex-shrink-0"
              onClick={() => {
                formatQuote(editor, toolbarState.blockType);
              }}
              variant={
                toolbarState.blockType === 'quote' ? 'secondary' : 'ghost'
              }
            >
              <QuoteIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 px-2 py-2 pr-2.5">
            <div className="rounded border border-slate-300 px-1 py-0.5 text-xs text-slate-300 dark:border-slate-700 dark:text-slate-700">
              {EDITOR_SHORTCUTS.QUOTE}
            </div>
            <span className="text-sm">Quote</span>
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="w-44 flex-shrink-0 justify-between"
          >
            <Button size="sm" variant="secondary">
              <TypeOutlineIcon className="mr-1 h-4 w-4" />
              {Object.entries(TEXT_FORMAT_OPTIONS).find(([, option]) => {
                return toolbarState[option.key];
              })?.[1]?.name || 'Text format'}
              <ChevronDownIcon className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(
              Object.keys(TEXT_FORMAT_OPTIONS) as Array<
                keyof typeof TEXT_FORMAT_OPTIONS
              >
            ).map((format) => {
              const option = TEXT_FORMAT_OPTIONS[format];
              const Icon = option.icon;

              return (
                <DropdownMenuItem
                  key={format}
                  className="flex justify-between gap-4"
                  onClick={() => {
                    editor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      format as TextFormatType
                    );
                  }}
                >
                  <div className="flex items-center">
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{option.name}</span>
                  </div>
                  <span className="text-muted-foreground min-w-14 text-xs">
                    {option.shortcut}
                  </span>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-between gap-4"
              onClick={() => {
                clearFormatting(editor);
              }}
            >
              <div className="flex items-center gap-2">
                <EraserIcon className="h-4 w-4" />
                <span>Clear formatting</span>
              </div>
              <span className="text-muted-foreground ml-auto text-xs">
                {EDITOR_SHORTCUTS.CLEAR_FORMATTING}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
