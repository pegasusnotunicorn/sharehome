import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
import "../../css/utils/lazyYoutube.css";

export const LazyYoutube = ({ videoModalVisible, setPlayer, stopVideo }) => {
  const iframeRef = useRef(null);

  let { width, height } = useWindowDimensions();
  const emToPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  ); // Convert 2em to pixels

  const isDesktop = width > 1000;
  const iframeWidth = isDesktop ? 1000 : width - 4 - emToPx * 2;
  const iframeHeight = isDesktop
    ? (iframeWidth * 9) / 16
    : Math.min((iframeWidth * 16) / 9, height - 4 - 45 - emToPx * 4);

  const youTubeVideoCode = isDesktop ? "EoQ2VTipXPA" : "fNq9hS6DsTU";
  const enableCC = isDesktop
    ? "&cc_load_policy=1&iv_load_policy=1"
    : "&cc_load_policy=3&iv_load_policy=3";

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(iframeRef.current, {
        events: {
          onReady: (event) => {
            setPlayer(event.target);
          },
        },
      });
    };
  }, [setPlayer]);

  return (
    <div
      style={{ display: videoModalVisible ? "flex" : "none" }}
      id="videoModalWrapper"
      className="screenHeight"
      onClick={stopVideo}
    >
      <iframe
        ref={iframeRef}
        width={iframeWidth}
        height={iframeHeight}
        src={`https://www.youtube.com/embed/${youTubeVideoCode}?si=JyFz4WBy_u2p8ot1&rel=0&controls=0&rel=0&modestbranding=1&playlist=${youTubeVideoCode}${enableCC}&enablejsapi=1&loop=1`}
        title="YouTube video player"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        frameBorder="0"
      />
      <div className="videoModalCloseButtonWrapper">
        <DefaultButton
          icon="whiteCross"
          className="is-black"
          onClick={stopVideo}
          text="Close video"
          shadowless
        />
      </div>
    </div>
  );
};

LazyYoutube.propTypes = {
  videoModalVisible: PropTypes.bool.isRequired,
  setPlayer: PropTypes.func.isRequired,
  stopVideo: PropTypes.func.isRequired,
};
