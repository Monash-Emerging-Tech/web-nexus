import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Draggable, InertiaPlugin } from 'gsap/all'
import { cn } from '@/lib/utils'

const Carousel = ({ children }) => {
	const carouselRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		gsap.registerPlugin(Draggable, InertiaPlugin)

		const draggableElement = carouselRef.current
		const totalWidth = draggableElement?.scrollWidth
		const firstChildWidth = draggableElement?.firstChild?.offsetWidth
		const containerWidth = draggableElement?.offsetWidth

		const leftBoundary = -(totalWidth - containerWidth)

		Draggable.create('.draggable', {
			type: 'x',
			inertia: true,
			bounds: { 
				minX: leftBoundary,
				maxX: 0
			},
			onDrag: function() {
				updateMiddleIndex(this.x, containerWidth, firstChildWidth)
			},
			onThrowUpdate: function() {
				updateMiddleIndex(this.x, containerWidth, firstChildWidth)
			}
		})

		const updateMiddleIndex = (xPosition: number, containerWidth: number, firstChildWidth : number) => {
			const centerPosition = Math.abs(xPosition) + (containerWidth / 2)

			gsap.utils.toArray('.draggable > *').forEach((child) => {
				const childPosition = child.offsetLeft;
				const distanceFromCenter = Math.abs(childPosition + firstChildWidth / 2 - centerPosition);
				const translation = Math.max(0, 400 - (distanceFromCenter))

				gsap.to(child, { duration: 0.4, y: -translation/8 })
			})
		}

	updateMiddleIndex(0, containerWidth, firstChildWidth)

	}, [children])

	return (
		<div className="carousel overflow-hidden relative pt-25">
			<div ref={carouselRef} className={cn("draggable flex flex-row gap-4 ml-[15vw] mr-[15vw]")}>
				{children}
			</div>
		</div>
	)
}

export default Carousel;
