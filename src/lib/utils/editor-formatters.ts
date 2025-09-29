import { $createCodeNode } from '@lexical/code';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import type { HeadingTagType } from '@lexical/rich-text';
import {
  $isQuoteNode,
  $isHeadingNode,
  $createQuoteNode,
  $createHeadingNode,
} from '@lexical/rich-text';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import { $isTableSelection } from '@lexical/table';
import { $getNearestBlockElementAncestorOrThrow } from '@lexical/utils';
import type { LexicalEditor } from 'lexical';
import {
  $isTextNode,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from 'lexical';

import {
  DEFAULT_FONT_SIZE,
  MAX_ALLOWED_FONT_SIZE,
  MIN_ALLOWED_FONT_SIZE,
} from '@/lib/constants/initial-editor-toolbar-state';

export enum UpdateFontSizeType {
  INCREMENT = 1,
  DECREMENT = 2,
}

export function calculateNextFontSize(
  currentFontSize: number,
  updateType: UpdateFontSizeType | null
) {
  if (!updateType) {
    return currentFontSize;
  }

  let updatedFontSize: number = currentFontSize;

  switch (updateType) {
    case UpdateFontSizeType.DECREMENT:
      switch (true) {
        case currentFontSize > MAX_ALLOWED_FONT_SIZE:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;

        case currentFontSize >= 48:
          updatedFontSize -= 12;
          break;

        case currentFontSize >= 24:
          updatedFontSize -= 4;
          break;

        case currentFontSize >= 14:
          updatedFontSize -= 2;
          break;

        case currentFontSize >= 9:
          updatedFontSize -= 1;
          break;

        default:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;
      }

      break;

    case UpdateFontSizeType.INCREMENT:
      switch (true) {
        case currentFontSize < MIN_ALLOWED_FONT_SIZE:
          updatedFontSize = MIN_ALLOWED_FONT_SIZE;
          break;

        case currentFontSize < 12:
          updatedFontSize += 1;
          break;

        case currentFontSize < 20:
          updatedFontSize += 2;
          break;

        case currentFontSize < 36:
          updatedFontSize += 4;
          break;

        case currentFontSize <= 60:
          updatedFontSize += 12;
          break;

        default:
          updatedFontSize = MAX_ALLOWED_FONT_SIZE;
          break;
      }

      break;

    default:
      break;
  }

  return updatedFontSize;
}

export function updateFontSizeInSelection(
  editor: LexicalEditor,
  newFontSize: string | null,
  updateType: UpdateFontSizeType | null
) {
  function getNextFontSize(prevFontSize: string | null) {
    if (!prevFontSize) {
      prevFontSize = `${DEFAULT_FONT_SIZE}px`;
    }

    prevFontSize = prevFontSize.slice(0, -2);
    const nextFontSize = calculateNextFontSize(
      Number(prevFontSize),
      updateType
    );

    return `${nextFontSize}px`;
  }

  editor.update(() => {
    if (editor.isEditable()) {
      const selection = $getSelection();

      if (selection !== null) {
        $patchStyleText(selection, {
          'font-size': newFontSize || getNextFontSize,
        });
      }
    }
  });
}

export function updateFontSize(
  editor: LexicalEditor,
  updateType: UpdateFontSizeType,
  inputValue: string
) {
  if (inputValue !== '') {
    const nextFontSize = calculateNextFontSize(Number(inputValue), updateType);
    updateFontSizeInSelection(editor, String(nextFontSize) + 'px', null);
  } else {
    updateFontSizeInSelection(editor, null, updateType);
  }
}

export function formatParagraph(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    $setBlocksType(selection, () => {
      return $createParagraphNode();
    });
  });
}

export function formatHeading(
  editor: LexicalEditor,
  blockType: string,
  headingSize: HeadingTagType
) {
  if (blockType !== headingSize) {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => {
        return $createHeadingNode(headingSize);
      });
    });
  }
}

export function formatBulletList(editor: LexicalEditor, blockType: string) {
  if (blockType !== 'bullet') {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
}

export function formatCheckList(editor: LexicalEditor, blockType: string) {
  if (blockType !== 'check') {
    editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
}

export function formatNumberedList(editor: LexicalEditor, blockType: string) {
  if (blockType !== 'number') {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  } else {
    formatParagraph(editor);
  }
}

export function formatQuote(editor: LexicalEditor, blockType: string) {
  if (blockType !== 'quote') {
    editor.update(() => {
      const selection = $getSelection();
      $setBlocksType(selection, () => {
        return $createQuoteNode();
      });
    });
  }
}

export function formatCode(editor: LexicalEditor, blockType: string) {
  if (blockType !== 'code') {
    editor.update(() => {
      let selection = $getSelection();

      if (!selection) {
        return;
      }

      if (!$isRangeSelection(selection) || selection.isCollapsed()) {
        $setBlocksType(selection, () => {
          return $createCodeNode();
        });
      } else {
        const textContent = selection.getTextContent();
        const codeNode = $createCodeNode();
        selection.insertNodes([codeNode]);
        selection = $getSelection();

        if ($isRangeSelection(selection)) {
          selection.insertRawText(textContent);
        }
      }
    });
  }
}

export function clearFormatting(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const anchor = selection.anchor;
      const focus = selection.focus;
      const nodes = selection.getNodes();
      const extractedNodes = selection.extract();

      if (anchor.key === focus.key && anchor.offset === focus.offset) {
        return;
      }

      nodes.forEach((node, idx) => {
        if ($isTextNode(node)) {
          let textNode = node;

          if (idx === 0 && anchor.offset !== 0) {
            textNode = textNode.splitText(anchor.offset)[1] || textNode;
          }

          if (idx === nodes.length - 1) {
            textNode = textNode.splitText(focus.offset)[0] || textNode;
          }

          const extractedTextNode = extractedNodes[0];

          if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
            textNode = extractedTextNode;
          }

          if (textNode.__style !== '') {
            textNode.setStyle('');
          }

          if (textNode.__format !== 0) {
            textNode.setFormat(0);
          }

          const nearestBlockElement =
            $getNearestBlockElementAncestorOrThrow(textNode);

          if (nearestBlockElement.__format !== 0) {
            nearestBlockElement.setFormat('');
          }

          if (nearestBlockElement.__indent !== 0) {
            nearestBlockElement.setIndent(0);
          }

          node = textNode;
        } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
          node.replace($createParagraphNode(), true);
        } else if ($isDecoratorBlockNode(node)) {
          node.setFormat('');
        }
      });
    }
  });
}
