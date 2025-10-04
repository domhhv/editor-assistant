'use client';

import { useChat } from '@ai-sdk/react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { UIMessage, UIDataTypes } from 'ai';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { User as UserIcon, LoaderPinwheelIcon } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';

import ChatEmptyState from '@/components/chat/chat-empty-state';
import ChatHeader from '@/components/chat/chat-header';
import ApiKeyDialog from '@/components/custom/api-key-dialog';
import { ApiKeyContext } from '@/components/providers/api-key-provider';
import { ChatStatusContext } from '@/components/providers/chat-status-provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import type { EditorCommandTools } from '@/lib/models/editor-commands';
import cn from '@/lib/utils/cn';
import executeEditorCommand from '@/lib/utils/execute-editor-command';
import getErrorMessage from '@/lib/utils/get-error-message';
import $getNextEditorState from '@/lib/utils/get-next-editor-state';

export default function Chat() {
  const [editor] = useLexicalComposerContext();
  const { setStatus } = React.use(ChatStatusContext);
  const { apiKey, hasApiKey, isLoading, setApiKey } = React.use(ApiKeyContext);
  const [input, setInput] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { addToolResult, error, messages, sendMessage, status } = useChat<
    UIMessage<unknown, UIDataTypes, EditorCommandTools>
  >({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      const { dynamic, input, toolCallId, toolName } = toolCall;

      if (dynamic) {
        return;
      }

      if (toolName === 'insertParagraph') {
        const result = await executeEditorCommand(editor, {
          ...input,
          type: 'insertParagraph',
        });

        void addToolResult({
          output: result,
          tool: toolName,
          toolCallId,
        });
      }

      if (toolName === 'editParagraph') {
        const result = await executeEditorCommand(editor, {
          ...input,
          type: 'editParagraph',
        });

        void addToolResult({
          output: result,
          tool: toolName,
          toolCallId,
        });
      }

      if (toolName === 'formatText') {
        const result = await executeEditorCommand(editor, {
          ...input,
          type: 'formatText',
        });

        void addToolResult({
          output: result,
          tool: toolName,
          toolCallId,
        });
      }
    },
  });

  React.useEffect(() => {
    setStatus(status);
  }, [status, setStatus, messages]);

  const submitMessage = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!hasApiKey) {
        setShowApiKeyDialog(true);

        return;
      }

      editor.read(() => {
        const {
          nextEditorMarkdownContent: editorMarkdownContent,
          nextEditorRootChildren: editorRootChildren,
        } = $getNextEditorState();

        void sendMessage(
          { text: input },
          {
            body: {
              apiKey,
              editorMarkdownContent,
              editorRootChildren,
            },
          }
        );
      });
      setInput('');
    },
    [input, editor, sendMessage, hasApiKey, apiKey]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoaderPinwheelIcon className="animate-spin" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="flex h-full flex-col">
        <ChatHeader
          onApiKeyEditClick={() => {
            return setShowApiKeyDialog(true);
          }}
        />
        <ChatEmptyState
          onSetApiKey={() => {
            return setShowApiKeyDialog(true);
          }}
        />
        <ApiKeyDialog
          isOpen={showApiKeyDialog}
          onOpenChange={setShowApiKeyDialog}
          onApiKeySet={(key) => {
            setApiKey(key);
            setShowApiKeyDialog(false);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        onApiKeySet={(key) => {
          setApiKey(key);
          setShowApiKeyDialog(false);
        }}
      />

      <div className="flex h-full flex-col overflow-x-auto">
        <ChatHeader
          onApiKeyEditClick={() => {
            return setShowApiKeyDialog(true);
          }}
        />

        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4">
          <div className="flex flex-col gap-4 pt-2">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}
            {messages.map((message) => {
              return (
                <div
                  key={message.id}
                  className={cn(
                    'whitespace-pre-wrap',
                    message.role === 'user' &&
                      'border-foreground flex items-start gap-2 rounded-lg border p-4'
                  )}
                >
                  {message.role === 'user' && (
                    <div className="border-border bg-foreground rounded-full border p-1">
                      <UserIcon className="text-background" />
                    </div>
                  )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className={cn(
                              message.role === 'user' ? 'px-2' : 'py-4'
                            )}
                          >
                            {part.text}
                          </div>
                        );

                      case 'tool-insertParagraph':
                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Generating new paragraph...</b>
                                <br />
                                {part.input?.content}
                              </div>
                            );

                          case 'input-available':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Inserted new paragraph with content:</b>
                                <br />
                                {part.input.content}
                              </div>
                            );

                          case 'output-error':
                            return (
                              <div key={`${message.id}-${i}`}>
                                Error: {part.errorText}
                              </div>
                            );

                          case 'output-available':
                          default:
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Inserted new paragraph with content:</b>
                                <br />
                                {part.input.content}
                              </div>
                            );
                        }

                      case 'tool-editParagraph':
                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>
                                  <i>Editing paragraph...</i>
                                </b>
                                <br />
                                <b>Current text:</b>
                                <br />
                                {part.input?.oldText}
                                <br />
                                <b>New text:</b>
                                <br />
                                {part.input?.newText}
                              </div>
                            );

                          case 'input-available':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>
                                  <i>Successfully edited paragraph.</i>
                                </b>
                                <br />
                                <b>Old text:</b> <br />
                                {part.input.oldText}
                                <br />
                                <b>New text:</b>
                                <br />
                                {part.input.newText}
                              </div>
                            );

                          case 'output-error':
                            return (
                              <div key={`${message.id}-${i}`}>
                                Error: {part.errorText}
                              </div>
                            );

                          case 'output-available':
                          default:
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>
                                  <i>Successfully edited paragraph.</i>
                                </b>
                                <br />
                                <b>Old text:</b> <br />
                                {part.input.oldText}
                                <br />
                                <b>New text:</b>
                                <br />
                                {part.input.newText}
                              </div>
                            );
                        }

                      case 'tool-formatText':
                        switch (part.state) {
                          case 'input-streaming':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Applying text format...</b>
                                <br />
                                {part.input?.format}
                                <br />
                                {part.input?.parentNodeKey}
                                <br />
                                {part.input?.textPartToSelect}
                              </div>
                            );

                          case 'input-available':
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Applied text format:</b>
                                <br />
                                {part.input.format}
                                <br />
                                {part.input.parentNodeKey}
                                <br />
                                {part.input.textPartToSelect}
                              </div>
                            );

                          case 'output-error':
                            return (
                              <div key={`${message.id}-${i}`}>
                                Error: {part.errorText}
                              </div>
                            );

                          case 'output-available':
                          default:
                            return (
                              <div key={`${message.id}-${i}`}>
                                <b>Applied text format:</b>
                                <br />
                                {part.input.format}
                                <br />
                                {part.input.parentNodeKey}
                                <br />
                                {part.input.textPartToSelect}
                              </div>
                            );
                        }
                    }
                  })}
                </div>
              );
            })}
            {status === 'submitted' && (
              <LoaderPinwheelIcon className="mx-auto animate-spin" />
            )}
          </div>

          <form onSubmit={submitMessage} className="m-1 mt-2 md:m-2 md:mt-4">
            <Input
              value={input}
              disabled={status === 'submitted'}
              placeholder="Add a paragraph or edit existing content..."
              onChange={(e) => {
                return setInput(e.currentTarget.value);
              }}
            />
          </form>
        </div>
      </div>
    </>
  );
}
