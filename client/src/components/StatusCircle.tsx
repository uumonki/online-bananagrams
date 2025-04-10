interface StatusCircleProps {
  status: 'connected' | 'disconnected',
  size?: number | string;
  className?: string;
}

const StatusCircle: React.FC<StatusCircleProps> = ({
  status,
  size = 10,
  className = "",
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      fill={status === 'connected' ? 'green' : 'gray'}
      style={{ width: size, height: size }}
    >
      <circle cx="12" cy="12" r="10" fill={status === 'connected' ? 'limegreen' : 'gray'} />
    </svg>
  );
};

export default StatusCircle;