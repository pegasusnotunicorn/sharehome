import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useWindowDimensions from "../utils/useWindowDimensions.js";
import DefaultButton from "../utils/DefaultButton.js";
import "../../css/utils/lazyYoutube.css";
import useDeviceType from "../utils/useDeviceType.js";

const DEFAULT_DESKTOP_CODE = "EoQ2VTipXPA";
const DEFAULT_MOBILE_CODE = "fNq9hS6DsTU";

export const YoutubeModal = ({
  videoModalVisible,
  setPlayer,
  stopVideo,
  desktopCodeOverride,
  mobileCodeOverride,
}) => {
  const iframeRef = useRef(null);

  const { width, height } = useWindowDimensions();
  const emToPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  ); // Convert 2em to pixels

  const isDesktop = width > 1000;
  const iframeWidth = isDesktop ? 1000 : width - 4 - emToPx * 2;
  const iframeHeight = isDesktop
    ? (iframeWidth * 9) / 16
    : Math.min((iframeWidth * 16) / 9, height - 4 - 45 - emToPx * 4);

  const youTubeVideoCode = isDesktop
    ? desktopCodeOverride ?? DEFAULT_DESKTOP_CODE
    : mobileCodeOverride ?? DEFAULT_MOBILE_CODE;

  const enableCC = isDesktop
    ? "&cc_load_policy=1&iv_load_policy=1"
    : "&cc_load_policy=3&iv_load_policy=3";

  const { isIOS } = useDeviceType();

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
            if (isIOS) {
              event.target.stopVideo();
            } else {
              event.target.stopVideo();
              event.target.seekTo(0);
              event.target.unMute();
            }
            setPlayer(event.target);
          },
        },
      });
    };
  }, [setPlayer, isIOS]);

  useEffect(() => {
    const button = document.querySelector(".lty-playbtn");
    if (!button) return;

    function createObserver() {
      let observer;
      let options = {
        rootMargin: "-50%",
        threshold: 1,
      };
      observer = new IntersectionObserver(() => {
        button.click();
      }, options);
      observer.observe(button);
    }
    return createObserver();
  }, []);

  return (
    <div
      style={{ display: videoModalVisible ? "flex" : "none" }}
      className="videoModalWrapper"
      onClick={stopVideo}
    >
      <div className="videoModalCloseButtonWrapper">
        <DefaultButton
          icon="whiteCross"
          className="is-black"
          onClick={stopVideo}
          text="Close video"
          shadowless
        />
      </div>
      <div className="videoWrapper">
        <iframe
          ref={iframeRef}
          width={iframeWidth}
          height={iframeHeight}
          src={`https://www.youtube.com/embed/${youTubeVideoCode}?si=JyFz4WBy_u2p8ot1&rel=0&controls=0&rel=0&modestbranding=1&playlist=${youTubeVideoCode}${enableCC}&enablejsapi=1&loop=1&autoplay=1&mute=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    </div>
  );
};

YoutubeModal.propTypes = {
  videoModalVisible: PropTypes.bool.isRequired,
  setPlayer: PropTypes.func.isRequired,
  stopVideo: PropTypes.func.isRequired,
  desktopCodeOverride: PropTypes.string,
  mobileCodeOverride: PropTypes.string,
};
