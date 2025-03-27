const LoadingSpinner = () => {
	return (
		<svg
			viewBox="25 25 50 50"
			className="w-14 animate-rotate flex items-center justify-center"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				r="20"
				cy="50"
				cx="50"
				className="fill-none stroke-blue-500 stroke-2 stroke-dasharray-[1,200] stroke-dashoffset-0 stroke-linecap-round animate-dash"
			></circle>
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
		</svg>
	);
};

export default LoadingSpinner;
