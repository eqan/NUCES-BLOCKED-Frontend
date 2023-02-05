import React from 'react';

interface CodeHighlightProps {
    children: React.ReactNode;
}

type PreProps = React.HTMLAttributes<HTMLPreElement>;

export const CodeHighlight: React.FC<CodeHighlightProps> = (props) => {
    return (
        <pre {...(props as PreProps)} className="border-round surface-ground text-900 p-5 overflow-auto">
            <code className="-mt-4 p-0 line-height-3 block" style={{fontFamily: 'monaco, Consolas, "Lucida Console", monospace'}}>{props.children}</code>
        </pre>
    );
};
