import { useEffect, useRef } from "react";
import useWindowDimensions from "../utils/useWindowDimensions";
import DefaultButton from "../utils/DefaultButton";
import styles from "../../css/utils/lazyYoutube.module.css";
import useDeviceType from "../utils/useDeviceType";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const DEFAULT_DESKTOP_CODE = "EoQ2VTipXPA";
const DEFAULT_MOBILE_CODE = "fNq9hS6DsTU";

interface YoutubeModalProps {
  videoModalVisible: boolean;
  setPlayer: (player: any) => void;
  stopVideo: () => void;
  desktopCodeOverride?: string;
  mobileCodeOverride?: string;
}

export const YoutubeModal = ({
  videoModalVisible,
  setPlayer,
  stopVideo,
  desktopCodeOverride,
  mobileCodeOverride,
}: YoutubeModalProps) => {
  const playerDivRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const ytReadyRef = useRef(false);
  const playerReadyRef = useRef(false);
  const lastVideoCodeRef = useRef<string | null>(null);

  const { width, height, isDesktop } = useWindowDimensions();
  const emToPx = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );

  const iframeWidth = isDesktop ? 1000 : width - emToPx * 2;
  const iframeHeight = isDesktop
    ? (iframeWidth * 9) / 16
    : Math.min((iframeWidth * 16) / 9, height - 45 - emToPx * 4);

  const youTubeVideoCode = isDesktop
    ? desktopCodeOverride ?? DEFAULT_DESKTOP_CODE
    : mobileCodeOverride ?? DEFAULT_MOBILE_CODE;

  const enableCC = isDesktop ? 1 : 3;

  const { isIOS } = useDeviceType();

  // Load YT API script once
  useEffect(() => {
    if (!window.YT?.Player) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => {
        ytReadyRef.current = true;
      };
    } else {
      ytReadyRef.current = true;
    }
  }, []);

  // Create player only when modal opens for the first time
  useEffect(() => {
    if (!videoModalVisible) return;
    if (playerRef.current) {
      // Player already exists — just play
      if (playerReadyRef.current) {
        playerRef.current.playVideo?.();
        playerRef.current.unMute?.();
      }
      return;
    }
    if (!playerDivRef.current) return;

    const create = () => {
      playerRef.current = new window.YT.Player(playerDivRef.current, {
        width: iframeWidth,
        height: iframeHeight,
        videoId: youTubeVideoCode,
        playerVars: {
          autoplay: 1,
          mute: 0,
          rel: 0,
          controls: 0,
          modestbranding: 1,
          enablejsapi: 1,
          loop: 1,
          playlist: youTubeVideoCode,
          cc_load_policy: enableCC,
          iv_load_policy: enableCC,
        },
        events: {
          onReady: (event: any) => {
            playerReadyRef.current = true;
            lastVideoCodeRef.current = youTubeVideoCode;
            event.target.unMute();
            setPlayer(event.target);
          },
        },
      });
    };

    if (ytReadyRef.current) {
      create();
    } else {
      // API still loading — wait for it
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        ytReadyRef.current = true;
        create();
      };
    }
  }, [videoModalVisible, iframeWidth, iframeHeight, youTubeVideoCode, enableCC, isIOS, setPlayer]);

  useEffect(() => {
    if (!playerRef.current || !playerReadyRef.current || !videoModalVisible) return;
    playerRef.current.setSize?.(iframeWidth, iframeHeight);
  }, [videoModalVisible, iframeWidth, iframeHeight]);

  useEffect(() => {
    if (!playerRef.current || !playerReadyRef.current || !videoModalVisible) return;
    if (lastVideoCodeRef.current === youTubeVideoCode) return;

    const player = playerRef.current;
    const currentTime =
      typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
    const playerState =
      typeof player.getPlayerState === "function" ? player.getPlayerState() : null;
    const wasPlaying = playerState === window.YT?.PlayerState?.PLAYING;

    if (typeof player.loadVideoById !== "function") return;

    player.loadVideoById({
      videoId: youTubeVideoCode,
      startSeconds: currentTime,
    });
    player.unMute?.();

    if (!wasPlaying && typeof player.pauseVideo === "function") {
      player.pauseVideo();
    }

    lastVideoCodeRef.current = youTubeVideoCode;
  }, [videoModalVisible, youTubeVideoCode]);

  return (
    <div
      style={{ display: videoModalVisible ? "flex" : "none" }}
      className={styles.videoModalWrapper}
      onClick={stopVideo}
    >
      <div className={styles.videoModalCloseButtonWrapper}>
        <DefaultButton
          variant="secondary"
          icon="cross"
          onClick={stopVideo}
          text="Close video"
        />
      </div>
      <div className={styles.videoWrapper}>
        <div ref={playerDivRef} />
      </div>
    </div>
  );
};
