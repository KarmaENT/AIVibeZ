import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { CodeFile, SubscriptionTier, ChatMessage } from '../../types';
import { Icon } from '../ui/Icon';
import { Spinner } from '../ui/Spinner';
import { startOrContinueChat, resetChat } from '../../services/geminiService';


interface StudioViewProps {
  prompt: string;
  files: CodeFile[];
  onNewProject: () => void;
  userTier: SubscriptionTier;
  onOpenUpgrade: () => void;
}

const CodeViewer: React.FC<{ code: string }> = ({ code }) => (
    <pre className="text-sm bg-background p-4 rounded-lg overflow-x-auto h-full text-gray-300">
      <code className="font-mono">{code}</code>
    </pre>
);

export const StudioView: React.FC<StudioViewProps> = ({ prompt, files, onNewProject, userTier, onOpenUpgrade }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(files.find(f => f.path.endsWith('index.html')) || files[0]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Code Assistant State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  useEffect(() => {
    // A simple preview by rendering the index.html in an iframe.
    // This will only work correctly if the generated app uses absolute URLs for assets (e.g. from a CDN)
    // and doesn't rely on a build step or complex relative file paths, as per the generation prompt.
    const indexHtmlFile = files.find(f => f.path.endsWith('index.html'));
    if (indexHtmlFile) {
        const blob = new Blob([indexHtmlFile.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }
  }, [files]);
  
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'ai-studio-app.zip');
  };

  const handleNewProjectClick = () => {
    resetChat();
    onNewProject();
  };

  const handleAssistantSend = async () => {
    if (!assistantInput.trim() || isAssistantLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: assistantInput }];
    setChatMessages(newMessages);
    setAssistantInput('');
    setIsAssistantLoading(true);

    try {
        const stream = await startOrContinueChat(newMessages, files);
        let modelResponse = '';
        
        setChatMessages(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setChatMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1].content = modelResponse;
                return updated;
            });
        }
    } catch (e) {
        console.error("Assistant chat error:", e);
        setChatMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
        setIsAssistantLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border bg-surface flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <button onClick={handleNewProjectClick} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold">
            <Icon name="plus" size={16} />
            New Project
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-on-surface-secondary">
            <Icon name="terminal" size={16} />
            <p className="truncate max-w-sm">{prompt}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={handleDownloadZip} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md hover:bg-border text-on-surface-secondary">
                <Icon name="download" size={16} />
                Download Zip
            </button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-px bg-border overflow-hidden">
        {/* File Explorer */}
        <div className="col-span-12 lg:col-span-2 bg-surface p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3 text-on-surface-secondary uppercase tracking-wider">Files</h3>
          <ul>
            {files.map((file) => (
              <li key={file.path}>
                <button
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                    selectedFile.path === file.path
                      ? 'bg-primary/20 text-primary'
                      : 'text-on-surface-secondary hover:bg-border hover:text-on-surface'
                  }`}
                >
                  <Icon name={file.path.endsWith('.html') ? 'file-text' : file.path.endsWith('.css') ? 'file-json' : 'file-code-2'} size={16} />
                  {file.path.split('/').pop()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Editor */}
        <div className="col-span-12 lg:col-span-6 bg-surface p-4 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 mb-2">
                 <h3 className="text-sm font-semibold text-on-surface">{selectedFile.path}</h3>
            </div>
            <div className="flex-grow overflow-hidden">
                 <CodeViewer code={selectedFile.content} />
            </div>
        </div>

        {/* Preview & Assistant */}
        <div className="col-span-12 lg:col-span-4 bg-surface p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-on-surface-secondary uppercase tracking-wider">Live Preview</h3>
            <div className="aspect-video bg-background rounded-lg border border-border">
              {previewUrl ? (
                <iframe src={previewUrl} className="w-full h-full rounded-lg" title="Live Preview" sandbox="allow-scripts allow-same-origin"></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-on-surface-secondary">No index.html found</div>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-grow min-h-0">
            <h3 className="text-sm font-semibold mb-3 text-on-surface-secondary uppercase tracking-wider">Code Assistant</h3>
            <div className={`relative p-4 bg-background rounded-lg border border-border flex-grow flex flex-col min-h-0 ${userTier === SubscriptionTier.Free ? 'opacity-60' : ''}`}>
              {userTier === SubscriptionTier.Free && (
                 <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 rounded-lg text-center p-4">
                    <Icon name="lock" size={32} className="text-yellow-400 mb-2"/>
                    <p className="text-white font-semibold">Pro Feature</p>
                    <p className="text-sm text-gray-300">Upgrade to chat with an AI assistant.</p>
                    <button onClick={onOpenUpgrade} className="mt-2 px-3 py-1 text-sm bg-yellow-500 text-black rounded-md hover:bg-yellow-400 font-semibold">Upgrade to Unlock</button>
                 </div>
              )}
              <div className="flex-grow overflow-y-auto space-y-4 mb-2">
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-end gap-2 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <Icon name="bot" className="text-on-surface-secondary flex-shrink-0" size={20}/>}
                        <div className={`rounded-lg px-3 py-2 max-w-xs break-words ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface text-on-surface'}`}>
                            {isAssistantLoading && msg.role === 'model' && i === chatMessages.length - 1 && msg.content === '' ? <Spinner/> : <p className="whitespace-pre-wrap">{msg.content}</p>}
                        </div>
                    </div>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea 
                    placeholder="Ask for modifications..." 
                    className="w-full h-12 bg-surface p-2 rounded-md text-sm resize-none border border-border focus:ring-primary focus:outline-none flex-grow"
                    value={assistantInput}
                    onChange={e => setAssistantInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAssistantSend(); }}}
                    disabled={userTier === SubscriptionTier.Free || isAssistantLoading}
                />
                <button 
                    className="self-end px-3 py-2 text-sm bg-primary hover:bg-primary-hover text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleAssistantSend}
                    disabled={userTier === SubscriptionTier.Free || isAssistantLoading || !assistantInput.trim()}>
                  <Icon name="send" size={16}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};