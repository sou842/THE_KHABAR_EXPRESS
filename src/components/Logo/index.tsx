interface logoProps {
  type?: string;
}

const Logo = (props: logoProps) => {
  const { type } = props;

  switch (type) {
    case "full-logo":
      return (
        <span className="font-serif text-2xl md:text-3xl">
          <span className="text-xs text-khabar-600 font-sans font-light">
            The
          </span>
          <span className="font-sans bg-clip-text text-gray-800 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-khabar-600 font-sans font-light">
            Express
          </span>
        </span>
      );
    default:
      return (
        <span className="font-serif text-2xl md:text-3xl">
          <span className="font-sans bg-clip-text text-gray-800 font-bold mx-1">
            Khabar
          </span>
          <span className="text-xs text-khabar-600 font-sans">Express</span>
        </span>
      );
  }
};

export default Logo;
