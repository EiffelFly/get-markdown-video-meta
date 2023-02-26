export type YoutubeProps = {
  id: string;
  width?: number;
  height?: number;
};

export const Youtube = ({ id, width, height }: YoutubeProps) => {
  return (
    <>
      <style>
        {`
          .embed-youtube {
            border: 0;
          }
        `}
      </style>
      <iframe
        width={width ? width : "800"}
        height={height ? height : "450"}
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        className="embed-youtube"
      />
    </>
  );
};
