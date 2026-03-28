interface logoProps {
  type?: string;
}

const Logo = (props: logoProps) => {
  const { type } = props;

  switch (type) {
    case "full-logo":
      return (
        <span translate="no" className="font-serif text-2xl md:text-3xl">
          <span className="text-xs text-white font-sans font-light">
            The
          </span>
          <span className="font-sans bg-clip-text text-gray-200 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-white font-sans font-light">
            Express
          </span>
        </span>
      );
    case "footer-logo":
      return (
        <span translate="no" className="font-serif text-2xl md:text-3xl">
          <span className="text-xs text-gray-400 font-sans font-light">
            The
          </span>
          <span className="font-sans bg-clip-text text-gray-600 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-gray-400 font-sans font-light">
            Express
          </span>
        </span>
      );
    case "admin-logo":
      return (
        <span translate="no" className="font-serif text-2xl md:text-3xl">
          <span className="font-sans bg-clip-text text-gray-600 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-gray-400 font-sans font-light">
            Express
          </span>
        </span>
      );
    case "simple-logo":
      return (
        <div translate="no" className="flex items-center justify-center w-8 h-8 rounded-lg bg-khabar-600 text-white font-bold text-lg">
          K
        </div>
      );
    default:
      return (
        <span translate="no" className="font-serif text-2xl md:text-3xl">
          <span className="font-sans bg-clip-text text-gray-600 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-gray-600 font-sans">Express</span>
        </span>
      );
  }
};

export default Logo;
