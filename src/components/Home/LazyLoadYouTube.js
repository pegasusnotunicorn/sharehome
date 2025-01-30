import PropTypes from "prop-types";

export const LazyYoutube = ({ isLoaded, src, width, height }) => {
  if (!isLoaded) {
    return (
      <img
        src="/images/main.webp"
        alt="YouTube video thumbnail"
        style={{
          width,
          height,
          objectFit: "cover",
          cursor: "pointer",
        }}
      />
    );
  }

  return (
    <iframe
      width={width}
      height={height}
      src={src}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      frameBorder="0"
    />
  );
};

LazyYoutube.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  src: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
};
