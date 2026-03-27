import React from 'react';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
    // Simple Markdown Parser (Regex based for core features)
    const renderMarkdown = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, index) => {
            const trimmedLine = line.trim();
            
            // Heading 1 (#)
            if (trimmedLine.startsWith('# ')) {
                return <h1 key={index} className="text-2xl font-bold text-slate-900 mt-6 mb-4 font-serif border-b border-slate-100 pb-2">{trimmedLine.substring(2)}</h1>;
            }
            
            // Heading 2 (##)
            if (trimmedLine.startsWith('## ')) {
                return <h2 key={index} className="text-xl font-bold text-slate-800 mt-5 mb-3 font-serif line-through-offset">{trimmedLine.substring(3)}</h2>;
            }

            // Heading 3 (###)
            if (trimmedLine.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-bold text-slate-700 mt-4 mb-2 font-serif">{trimmedLine.substring(4)}</h3>;
            }

            // List Item (- or * or •)
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ')) {
                return (
                    <div key={index} className="flex gap-3 ml-4 my-1 items-start group">
                        <span className="text-indigo-400 mt-1.5 flex-none w-1.5 h-1.5 rounded-full bg-indigo-100 group-hover:bg-indigo-400 transition-colors" />
                        <p className="text-[15px] text-slate-600 leading-relaxed italic">{trimmedLine.substring(2)}</p>
                    </div>
                );
            }

            // Blockquote (>)
            if (trimmedLine.startsWith('> ')) {
                return (
                    <blockquote key={index} className="border-l-4 border-indigo-200 pl-4 py-1 my-4 italic text-slate-500 bg-slate-50/50 rounded-r-lg">
                        {trimmedLine.substring(2)}
                    </blockquote>
                );
            }

            // Horizontal Rule (---)
            if (trimmedLine === '---') {
                return <hr key={index} className="my-8 border-slate-100" />;
            }

            // Empty Line
            if (trimmedLine === '') {
                return <div key={index} className="h-4" />;
            }

            // Regular Paragraph (with basic Bold/Italic support)
            return (
                <p key={index} className="text-[15px] text-slate-700 leading-relaxed mb-3 tracking-tight font-light" 
                   dangerouslySetInnerHTML={{ 
                       __html: parseInlineMarkdown(line) 
                   }} 
                />
            );
        });
    };

    // Helper to parse bold/italic/code within a line
    const parseInlineMarkdown = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold **text**
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic *text*
            .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-rose-500 font-mono text-[13px]">$1</code>') // Code `text`
            .replace(/~~(.*?)~~/g, '<del>$1</del>'); // Strikethrough ~~text~~
    };

    return (
        <div className={`markdown-preview-root transition-all duration-300 ${className}`} style={{ lineHeight: '2.2rem', fontSize: '15px' }}>
            {content.trim() === '' ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300 italic gap-4">
                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-200 flex items-center justify-center">
                        <span className="text-xl">✍️</span>
                    </div>
                    <span>문서 내용이 비어 있습니다.</span>
                </div>
            ) : (
                renderMarkdown(content)
            )}
        </div>
    );
};
