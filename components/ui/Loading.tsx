type Variant = 'spinner' | 'pulse' | 'dots' | 'wave' | 'skeleton' | 'progress'
type Size = 'small' | 'medium' | 'large'
interface LoadingInputProps {
    size: Size
}
interface LoaderProps {
    variant: Variant;
    size: Size
}


const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
};

// Spinner Animation
const SpinnerLoader = ({ size }: LoadingInputProps) => (
    <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="w-full h-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full"></div>
    </div>
);

// Pulse Animation
const PulseLoader = ({ size }: LoadingInputProps) => (
    <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : size === 'large' ? 'w-4 h-4' : 'w-5 h-5'} bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse`}
                style={{ animationDelay: `${i * 0.2}s` }}
            />
        ))}
    </div>
);

// Dots Animation
const DotsLoader = ({ size }: LoadingInputProps) => (
    <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
            <div
                key={i}
                className={`${size === 'small' ? 'w-2 h-2' : size === 'medium' ? 'w-3 h-3' : size === 'large' ? 'w-4 h-4' : 'w-5 h-5'} bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
            />
        ))}
    </div>
);

// Wave Animation
const WaveLoader = ({ size }: LoadingInputProps) => (
    <div className="flex items-end space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
            <div
                key={i}
                className={`${size === 'small' ? 'w-1' : size === 'medium' ? 'w-2' : size === 'large' ? 'w-3' : 'w-4'} bg-blue-500 dark:bg-blue-400 rounded-sm animate-pulse`}
                style={{
                    height: `${12 + Math.sin(i) * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                }}
            />
        ))}
    </div>
);

// Skeleton Animation
const SkeletonLoader = () => (
    <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
    </div>
);

// Progress Bar Animation
const ProgressLoader = () => (
    <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
    </div>
);



export default function Loader({ variant, size }: LoaderProps) {
    switch (variant) {
        case 'spinner': return <SpinnerLoader size={size} />;
        case 'pulse': return <PulseLoader size={size} />;
        case 'dots': return <DotsLoader size={size} />;
        case 'wave': return <WaveLoader size={size} />;
        case 'skeleton': return <SkeletonLoader />;
        case 'progress': return <ProgressLoader />;
        default: return <SpinnerLoader size={size} />;
    }
};

