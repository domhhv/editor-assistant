'use client';

import { $convertFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $addUpdateTag, $setSelection, SKIP_DOM_SELECTION_TAG } from 'lexical';
import { Edit3, Columns2, MessageSquare } from 'lucide-react';
import * as React from 'react';
import { useSwipeable } from 'react-swipeable';

import { MobileLayoutContext } from '@/components/providers/mobile-layout-provider';
import { Button } from '@/components/ui/button';
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ENHANCED_LEXICAL_TRANSFORMERS from '@/lib/constants/enhanced-lexical-transformers';
import cn from '@/lib/utils/cn';

type AdaptiveLayoutProps = {
  chat: React.ReactNode;
  editor: React.ReactNode;
};

const VIEW_MODES = ['chat', 'split', 'editor'] as const;
type ViewMode = (typeof VIEW_MODES)[number];

export default function AdaptiveLayout({ chat, editor }: AdaptiveLayoutProps) {
  const { isMobile, setViewMode, viewMode } = React.use(MobileLayoutContext);
  const [lexicalEditor] = useLexicalComposerContext();

  React.useEffect(() => {
    async function loadSampleContent() {
      const response = await fetch('/sample-content.md');
      const text = await response.text();

      lexicalEditor.update(() => {
        $addUpdateTag(SKIP_DOM_SELECTION_TAG);
        $convertFromMarkdownString(
          text,
          ENHANCED_LEXICAL_TRANSFORMERS,
          undefined,
          true
        );
      });
    }

    void loadSampleContent();
  }, [lexicalEditor]);

  const resetEditorSelection = React.useCallback(() => {
    lexicalEditor.update(() => {
      $setSelection(null);
    });
  }, [lexicalEditor]);

  const cycleViewMode = React.useCallback(
    (direction: 'left' | 'right') => {
      resetEditorSelection();

      const currentIndex = VIEW_MODES.indexOf(viewMode as ViewMode);
      let nextIndex: number;

      if (direction === 'left') {
        nextIndex = (currentIndex + 1) % VIEW_MODES.length;
      } else {
        nextIndex = (currentIndex - 1 + VIEW_MODES.length) % VIEW_MODES.length;
      }

      setViewMode(VIEW_MODES[nextIndex]);
    },
    [viewMode, setViewMode, resetEditorSelection]
  );

  const swipeHandlers = useSwipeable({
    delta: 50,
    preventScrollOnSwipe: true,
    trackMouse: false,
    onSwipedLeft: () => {
      return isMobile && cycleViewMode('left');
    },
    onSwipedRight: () => {
      return isMobile && cycleViewMode('right');
    },
  });

  if (!isMobile) {
    return (
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel minSize={10} defaultSize={30}>
          {chat}
        </ResizablePanel>
        <ResizableHandle isWithHandle />
        <ResizablePanel minSize={40} defaultSize={70}>
          {editor}
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="relative flex-1 overflow-hidden">
        {viewMode === 'split' ? (
          <ResizablePanelGroup className="h-full" direction="vertical">
            <ResizablePanel minSize={30} defaultSize={50}>
              {chat}
            </ResizablePanel>
            <ResizableHandle isWithHandle />
            <ResizablePanel minSize={30} defaultSize={50}>
              {editor}
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div
              className={cn(
                'absolute inset-0 transition-transform duration-300 ease-in-out',
                viewMode === 'chat' ? 'translate-y-0' : '-translate-y-full'
              )}
            >
              {chat}
            </div>
            <div
              className={cn(
                'absolute inset-0 transition-transform duration-300 ease-in-out',
                viewMode === 'editor' ? 'translate-y-0' : 'translate-y-full'
              )}
            >
              {editor}
            </div>
          </>
        )}
      </div>

      <div className="space-y-0.5 border-t p-2 text-center">
        <div
          className="bg-background/95 supports-[backdrop-filter]:bg-background/60 backdrop-blur"
          {...swipeHandlers}
        >
          <div className="flex items-center justify-center gap-1">
            <Button
              size="sm"
              variant={viewMode === 'chat' ? 'default' : 'outline'}
              className={cn('space-y-2', viewMode === 'chat' && 'flex-1')}
              onClick={() => {
                resetEditorSelection();

                setViewMode('chat');
              }}
            >
              <MessageSquare className="h-4 w-4" />
              {viewMode === 'chat' && 'Chat'}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'split' ? 'default' : 'outline'}
              className={cn('space-y-2', viewMode === 'split' && 'flex-1')}
              onClick={() => {
                resetEditorSelection();

                setViewMode('split');
              }}
            >
              <Columns2 className="h-4 w-4" />
              {viewMode === 'split' && 'Split'}
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              className={cn('space-y-2', viewMode === 'editor' && 'flex-1')}
              onClick={() => {
                resetEditorSelection();

                setViewMode('editor');
              }}
            >
              <Edit3 className="h-4 w-4" />
              {viewMode === 'editor' && 'Editor'}
            </Button>
          </div>
        </div>
        <span className="text-muted-foreground text-xs">
          Swipe left/right to change view mode
        </span>
      </div>
    </div>
  );
}
