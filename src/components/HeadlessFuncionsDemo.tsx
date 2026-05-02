import React, { useState } from 'react';
import { downloadQRCode, generateBlob, generateCanvas, generateDataURL, type QRRenderOptions } from 'react-qrcode-logo';

interface DemoProps {
    data: QRRenderOptions;
}

export function HeadlessFunctionsDemo({ data }: DemoProps) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [blobInfo, setBlobInfo] = useState<{ size: number; type: string } | null>(null);
    const [canvasInfo, setCanvasInfo] = useState<{ width: number; height: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canvasContainerRef = React.useRef<HTMLDivElement>(null);

    const handleGenerateCanvas = async () => {
        try {
            setError(null);
            const canvas = await generateCanvas(data);
            setCanvasInfo({ width: canvas.width, height: canvas.height });

            // Mount the actual canvas element so the user sees it
            if (canvasContainerRef.current) {
                canvasContainerRef.current.innerHTML = '';
                // Cap displayed size for readability
                canvas.style.maxWidth = '300px';
                canvas.style.height = 'auto';
                canvas.style.border = '1px solid #ccc';
                canvasContainerRef.current.appendChild(canvas);
            }
        } catch (e) {
            setError(`generateCanvas failed: ${(e as Error).message}`);
        }
    };

    const handleGenerateDataURL = async () => {
        try {
            setError(null);
            const url = await generateDataURL(data);
            setDataUrl(url);
        } catch (e) {
            setError(`generateDataURL failed: ${(e as Error).message}`);
        }
    };

    const handleGenerateBlob = async () => {
        try {
            setError(null);
            // Revoke previous blob URL to avoid memory leaks
            if (blobUrl) URL.revokeObjectURL(blobUrl);

            const blob = await generateBlob(data);
            const url = URL.createObjectURL(blob);
            setBlobUrl(url);
            setBlobInfo({ size: blob.size, type: blob.type });
        } catch (e) {
            setError(`generateBlob failed: ${(e as Error).message}`);
        }
    };

    const handleDownload = async () => {
        try {
            setError(null);
            await downloadQRCode(data, 'jpg', 'test-standalone-qr-jpg');
        } catch (e) {
            setError(`downloadQRCode failed: ${(e as Error).message}`);
        }
    };

    // Cleanup blob URL on unmount
    React.useEffect(() => {
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [blobUrl]);

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h3>Headless functions demo</h3>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                <button type='button' onClick={handleGenerateCanvas}>
                    generateCanvas
                </button>
                <button type='button' onClick={handleGenerateDataURL}>
                    generateDataURL
                </button>
                <button type='button' onClick={handleGenerateBlob}>
                    generateBlob
                </button>
                <button type='button' onClick={handleDownload}>
                    downloadQRCode
                </button>
            </div>

            {error && (
                <div style={{ color: 'crimson', marginBottom: 20 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {/* generateCanvas output */}
                <section>
                    <h4>generateCanvas</h4>
                    <div ref={canvasContainerRef} />
                    {canvasInfo ? (
                        <p style={{ fontSize: 12, color: '#666' }}>
                            Canvas {canvasInfo.width}×{canvasInfo.height}px (mounted directly into the DOM)
                        </p>
                    ) : (
                        <p style={{ color: '#999' }}>Click the button to render</p>
                    )}
                </section>

                {/* generateDataURL output */}
                <section>
                    <h4>generateDataURL</h4>
                    {dataUrl ? (
                        <>
                            <img
                                src={dataUrl}
                                alt='QR from data URL'
                                style={{ maxWidth: 300, border: '1px solid #ccc' }}
                            />
                            <p style={{ fontSize: 12, color: '#666', wordBreak: 'break-all' }}>
                                {dataUrl.slice(0, 60)}… ({Math.round(dataUrl.length / 1024)} KB)
                            </p>
                        </>
                    ) : (
                        <p style={{ color: '#999' }}>Click the button to generate</p>
                    )}
                </section>

                {/* generateBlob output */}
                <section>
                    <h4>generateBlob</h4>
                    {blobUrl && blobInfo ? (
                        <>
                            <img
                                src={blobUrl}
                                alt='QR from blob'
                                style={{ maxWidth: 300, border: '1px solid #ccc' }}
                            />
                            <p style={{ fontSize: 12, color: '#666' }}>
                                {blobInfo.type} — {(blobInfo.size / 1024).toFixed(1)} KB
                            </p>
                        </>
                    ) : (
                        <p style={{ color: '#999' }}>Click the button to generate</p>
                    )}
                </section>
            </div>
        </div>
    );
}
