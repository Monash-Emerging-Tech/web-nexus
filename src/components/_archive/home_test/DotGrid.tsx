"use client";

import { createNoise3D } from 'simplex-noise';
import { useEffect, useMemo, useRef, useState } from "react";

const SQUARE_SIZE = 60;
const NOISE_SCALE = 0.4;
const NOISE_SPEED = 0.4;

const palette = ["#DB003B", "#030CAB", "#0E0E0E"];

const DotGrid = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });
	const [hoveredCol, setHoveredCol] = useState<number | null>(null);
	const [hoveredRow, setHoveredRow] = useState<number | null>(null);
	const [time, setTime] = useState(0);

	const noise = useMemo(() => createNoise3D(), []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const updateGrid = () => {
			const { width, height } = container.getBoundingClientRect();
			const cols = Math.max(1, Math.floor(width / SQUARE_SIZE));
			const rows = Math.max(1, Math.floor(height / SQUARE_SIZE));
			setGridSize({ cols, rows });
		};

		updateGrid();

		const observer = new ResizeObserver(updateGrid);
		observer.observe(container);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		let rafId = 0;
		let last = performance.now();

		const tick = (now: number) => {
			const delta = (now - last) / 1000;
			last = now;

			setTime((prev) => prev + delta);
			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, []);

	useEffect(() => {
		const handleMove = (e: MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			const col = Math.floor(x / SQUARE_SIZE);
			const row = Math.floor(y / SQUARE_SIZE);

			setHoveredCol(col);
			setHoveredRow(row);
		};

		window.addEventListener("mousemove", handleMove);
		return () => window.removeEventListener("mousemove", handleMove);
		}, [gridSize]);

	const squares = useMemo(() => {
		const count = gridSize.cols * gridSize.rows;
		return Array.from({ length: count }, (_, index) => index);
	}, [gridSize]);

	return (
		<div 
			ref={containerRef} 
			className="bg-black min-h-screen w-full flex justify-center items-center"
		>
			<div
				className="grid"
				style={{
					gridTemplateColumns: `repeat(${gridSize.cols}, ${SQUARE_SIZE}px)`,
					gridTemplateRows: `repeat(${gridSize.rows}, ${SQUARE_SIZE}px)`,
				}}
			>
				{squares.map((id) => {
					const col = gridSize.cols === 0 ? 0 : id % gridSize.cols;
					const row = gridSize.cols === 0 ? 0 : Math.floor(id / gridSize.cols);
					const raw = noise(col * NOISE_SCALE, row * NOISE_SCALE, Math.sin(time) * NOISE_SPEED);

					const normalized = (raw + 1) / 2;
					const smooth = normalized * normalized * (3 - 2 * normalized);
					
					let colorIndex = smooth < 0.25 ? 0 : smooth < 0.5 ? 1 : 2;

					let scale = 0.5;

					if (hoveredCol && hoveredRow) {
						const dx = col - (hoveredCol || 0);
						const dy = row - (hoveredRow || 0);
						const distance = Math.sqrt(dx * dx + dy * dy);

						scale = Math.max(0.5, 1 - distance * 0.2);
					}

					if (scale > 0.5) {
						colorIndex = smooth < 0.5 ? 0 : 1;
					}
						

					return (
						<div
							key={id}
							className="flex items-center justify-center bg-transparent"
							style={{
								width: SQUARE_SIZE,
								height: SQUARE_SIZE,
							}}
						>
							<div 
								className='brightness-75 opacity-90 w-9/10 h-9/10 rounded-full dotGrid shadow-lg'
								style={{
									backgroundColor: time < 1 ? palette[2] : palette[colorIndex],
									boxShadow: time < 1 ? `0 0 10px ${palette[2]}, 0 0 20px ${palette[2]}` : `0 0 ${60 * scale}px ${palette[colorIndex]}, 0 0 ${90 * scale}px ${palette[colorIndex]}`,
									scale
								}}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default DotGrid;