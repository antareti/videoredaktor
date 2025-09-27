import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          AI Редактор Изображений и Видео
        </h1>
        <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
          Загрузите изображение, опишите желаемые правки и создайте новое изображение или короткое видео с помощью ИИ.
        </p>
      </div>
    </header>
  );
};
