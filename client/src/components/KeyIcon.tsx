interface KeyIconProps extends React.PropsWithChildren {
  className?: string;
}

const KeyIcon: React.FC<KeyIconProps> = ({ children, className }) => {
  return (
    <span
      className={`inline-flex items-center justify-center h-5 rounded-[3pt] text-gray-700 border border-gray-500 text-xs p-2 ${className}`}
    >
      {children}
    </span>
  );
};

export default KeyIcon;