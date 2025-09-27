import React from 'react';

interface VideoResultDisplayProps {
  originalImage: string | null;
  videoUrl: string | null;
}

export const VideoResultDisplay: React.FC<VideoResultDisplayProps> = ({ originalImage, videoUrl }) => {
  if (!originalImage) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-3 text-gray-400">Оригинал</h3>
        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-900 shadow-lg">
          <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-3 text-gray-400">Результат</h3>
        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-900 shadow-lg flex items-center justify-center">
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop muted className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-500">Ваше сгенерированное видео появится здесь</div>
          )}
        </div>
        {videoUrl && (
             <a
                href={videoUrl}
                download="generated-video.mp4"
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md"
            >
                Скачать видео
            </a>
        )}
      </div>
    </div>
  );
};
