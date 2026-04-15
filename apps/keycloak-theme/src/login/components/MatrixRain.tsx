import { useEffect, useRef } from "react";
import { createMatrixRain } from "matrix-rain";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const instance = createMatrixRain(canvasRef.current!, { color: [255, 94, 31], headColor: [255, 240, 220] });
        return () => instance.destroy();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
        />
    );
}
