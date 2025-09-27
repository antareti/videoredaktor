import React from 'react';

interface ResultDisplayProps {
  originalImage: string | null;
  editedImage: string | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, editedImage }) => {
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
          {editedImage ? (
            <img src={editedImage} alt="Edited" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-500">Ваше отредактированное изображение появится здесь</div>
          )}
        </div>
        {editedImage && (
             <a
                href={editedImage}
                download="edited-image.png"
                className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md"
            >
                Скачать изображение
            </a>
        )}
      </div>
    </div>
  );
};