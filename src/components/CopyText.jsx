import React from 'react'

export default function CopyText() {
    const [copied, setCopied] = useState(false);
    const textToCopy = "This is the text to copy"; // Thay thế bằng văn bản bạn muốn sao chép
    const textAreaRef = useRef(null);

    const handleCopyClick = () => {
        if (textAreaRef.current) {
            textAreaRef.current.select();
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Đặt lại trạng thái sau 2 giây
        }
    };

    return (
        <div>
            <textarea
                ref={textAreaRef}
                value={textToCopy}
                readOnly
                style={{ position: 'absolute', left: '-9999px' }}
            />
            <button onClick={handleCopyClick}>
                {copied ? 'Copied!' : 'Copy Text'}
            </button>
        </div>
    );
}
