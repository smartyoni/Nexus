import React, { useEffect, useRef } from 'react';
import { Crepe, CrepeFeature } from '@milkdown/crepe';

// Crepe theme styles
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface MilkdownEditorProps {
    content: string;
    onChange: (content: string) => void;
    readOnly?: boolean;
}

export const MilkdownEditor: React.FC<MilkdownEditorProps> = ({ content, onChange, readOnly = false }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const crepeRef = useRef<Crepe | null>(null);
    const onChangeRef = useRef(onChange);
    const initialContentRef = useRef(content);
    onChangeRef.current = onChange;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let destroyed = false;

        const crepe = new Crepe({
            root: el,
            defaultValue: initialContentRef.current,
            features: {
                [CrepeFeature.CodeMirror]: false,
                [CrepeFeature.ImageBlock]: false,
                [CrepeFeature.Latex]: false,
                [CrepeFeature.BlockEdit]: true,
                [CrepeFeature.Toolbar]: true,
                [CrepeFeature.Placeholder]: true,
                [CrepeFeature.ListItem]: true,
                [CrepeFeature.LinkTooltip]: true,
                [CrepeFeature.Cursor]: true,
                [CrepeFeature.Table]: true,
            },
            featureConfigs: {
                [CrepeFeature.Placeholder]: {
                    text: '내용을 입력하세요... ( / 를 입력하면 명령어 메뉴가 나타납니다)',
                },
            },
        });

        crepe.on((listener) => {
            listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
                if (markdown !== prevMarkdown) {
                    onChangeRef.current(markdown);
                }
            });
        });

        crepe.create().then(() => {
            if (destroyed) {
                crepe.destroy();
                return;
            }
            crepeRef.current = crepe;
            if (readOnly) {
                crepe.setReadonly(true);
            }
        });

        return () => {
            destroyed = true;
            crepeRef.current = null;
            crepe.destroy();
        };
    }, []); // Mount once only. Page switches handled by parent's key prop.

    // Sync readonly state dynamically
    useEffect(() => {
        if (crepeRef.current) {
            crepeRef.current.setReadonly(readOnly);
        }
    }, [readOnly]);

    return (
        <div className="milkdown-crepe-wrapper">
            <div ref={containerRef} className="crepe-editor-root" />
        </div>
    );
};
