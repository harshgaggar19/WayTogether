const LoadingSpinner = () => {
	return (
		<div className="absolute inset-0 flex items-center justify-center bg-white/50">
			<svg
				viewBox="25 25 50 50"
				className="w-10 animate-rotate"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					r="20"
					cy="50"
					cx="50"
					className="fill-none stroke-black stroke-2 stroke-dasharray-[1,200] stroke-dashoffset-0 stroke-linecap-round animate-dash"
				></circle>
			</svg>
			<style>{`
				@keyframes rotate {
					100% {
						transform: rotate(360deg);
					}
				}
				@keyframes dash {
					0% {
						stroke-dasharray: 1, 200;
						stroke-dashoffset: 0;
					}
					50% {
						stroke-dasharray: 90, 200;
						stroke-dashoffset: -35px;
					}
					100% {
						stroke-dashoffset: -125px;
					}
				}
				.animate-rotate {
					animation: rotate 2s linear infinite;
				}
				.animate-dash {
					animation: dash 1.5s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
};

export default LoadingSpinner;
