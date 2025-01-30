export const LazyYoutube = ({ isLoaded, src, width, height }) => {
  return (
    <>
      {!isLoaded && (
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
      )}

      {isLoaded && (
        <iframe
          width={width}
          height={height}
          src={src}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          frameborder="0"
        />
      )}
    </>
  );
};
