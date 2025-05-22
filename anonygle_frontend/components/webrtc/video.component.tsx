import React, { useEffect, useRef } from 'react';
type StreamVideoProps = {
  stream: MediaStream | null;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  style?: React.CSSProperties;
};

const StreamVideo: React.FC<StreamVideoProps> = ({stream,className = '',muted = true,autoPlay = true,playsInline = true,style = {}}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay={autoPlay}
      muted={muted}
      playsInline={playsInline}
      className={className}
      style={style}
    />
  );
};

export default StreamVideo;
