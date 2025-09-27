import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { VideoResultDisplay } from './components/VideoResultDisplay';
import { Spinner } from './components/Spinner';
import { Header } from './components/Header';
import { editImageWithGemini, generateVideoFromImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { GeminiResponse } from './types';

const imagePromptSuggestions = [
  'Нарисуйте этого человека в купальнике на солнечном тропическом пляже.',
  'Поместите этого человека в бальный зал, одев в элегантное вечернее платье.',
  'Поместите человека на заснеженную гору, надев на него теплую зимнюю куртку.',
  'Представьте этого человека в образе рыцаря в сияющих доспехах перед замком.',
  'Измените стиль на яркий аниме-арт.',
];

const videoPromptSuggestions = [
    'Сделайте короткую анимацию, где этот человек машет рукой.',
    'Заставьте пар/дым на фоне медленно двигаться.',
    'Анимируйте волосы, как будто дует легкий ветерок.',
    'Сделайте эффект приближения (Dolly zoom) на лице человека.',
    'Превратите это фото в кинематографичный ролик с падающим снегом.',
];

const videoLoadingMessages = [
    "Инициализация видео-движка...",
    "Анализ изображения и промпта...",
    "Генерация ключевых кадров...",
    "Прорисовка движения и анимации...",
    "Добавление финальных штрихов...",
    "Это может занять несколько минут..."
];


export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(imagePromptSuggestions[0]);
  const [activeMode, setActiveMode] = useState<'image' | 'video'>('image');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    if (activeMode === 'image') {
        setPrompt(imagePromptSuggestions[0]);
    } else {
        setPrompt(videoPromptSuggestions[0]);
    }
  }, [activeMode]);

  const handleApiKeySave = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      localStorage.setItem('gemini-api-key', apiKeyInput.trim());
    }
  };
  
  const handleApiKeyChange = () => {
      setApiKey('');
      setApiKeyInput('');
      localStorage.removeItem('gemini-api-key');
  }

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setEditedImage(null);
    setGeneratedVideo(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProcessImage = async () => {
    if (!originalImage || !apiKey) return;

    setIsLoading(true);
    setLoadingMessage('ИИ творит магию...');
    setError(null);
    setEditedImage(null);

    try {
      const base64Image = await fileToBase64(originalImage);
      const mimeType = originalImage.type;
      
      const result: GeminiResponse | null = await editImageWithGemini(base64Image, mimeType, prompt, apiKey);

      if (result && result.image) {
        setEditedImage(`data:image/png;base64,${result.image}`);
      } else {
        setError(result?.text || 'Не удалось сгенерировать изображение. Модель могла отклонить запрос из-за политики безопасности.');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка.';
      setError(`Произошла ошибка: ${errorMessage}. Проверьте правильность вашего API ключа и обновите страницу.`);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleGenerateVideo = async () => {
    if (!originalImage || !apiKey) return;

    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    setGeneratedVideo(null);

    let messageIndex = 0;
    setLoadingMessage(videoLoadingMessages[messageIndex]);

    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % videoLoadingMessages.length;
        setLoadingMessage(videoLoadingMessages[messageIndex]);
    }, 4000);

    try {
        const base64Image = await fileToBase64(originalImage);
        const mimeType = originalImage.type;

        const videoUrl = await generateVideoFromImage(base64Image, mimeType, prompt, apiKey);

        setGeneratedVideo(videoUrl);
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Произошла неизвестная ошибка.';
        setError(`Произошла ошибка при создании видео: ${errorMessage}. Проверьте правильность вашего API ключа и обновите страницу.`);
    } finally {
        clearInterval(intervalId);
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleMainAction = () => {
    if (activeMode === 'image') {
        handleProcessImage();
    } else {
        handleGenerateVideo();
    }
  }

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImagePreview(null);
    setEditedImage(null);
    setGeneratedVideo(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
  };

  const currentSuggestions = activeMode === 'image' ? imagePromptSuggestions : videoPromptSuggestions;
  
  if (!apiKey) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-gray-200 font-sans flex items-center justify-center p-4">
             <div className="w-full max-w-md mx-auto bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700/50 p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-white">Требуется API Ключ Gemini</h2>
                <p className="text-gray-400 mb-6">
                    Чтобы использовать приложение, пожалуйста, введите ваш API-ключ от Google AI Studio. Он будет сохранен только в вашем браузере.
                </p>
                <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Введите ваш API ключ..."
                    className="w-full p-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                <button
                    onClick={handleApiKeySave}
                    className="mt-6 w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-300 shadow-xl"
                >
                    Сохранить и начать
                </button>
                <p className="text-xs text-gray-500 mt-4">
                    Получить ключ можно на <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">сайте Google AI Studio</a>.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-md border border-gray-700/50 overflow-hidden">
          {!originalImagePreview ? (
            <ImageUploader onImageUpload={handleImageUpload} />
          ) : (
            <div className="p-6 md:p-8">
              {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-96">
                      <Spinner />
                      <p className="mt-4 text-lg text-gray-400 animate-pulse">{loadingMessage}</p>
                      <p className="text-sm text-gray-500">Это может занять некоторое время.</p>
                  </div>
              ) : error ? (
                <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-xl font-bold text-red-400">Ошибка обработки</h3>
                  <p className="mt-2 text-red-300">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg"
                  >
                    Попробовать снова
                  </button>
                </div>
              ) : (
                 <>
                    {generatedVideo ? (
                        <VideoResultDisplay
                            originalImage={originalImagePreview}
                            videoUrl={generatedVideo}
                        />
                    ) : (
                        <ResultDisplay
                            originalImage={originalImagePreview}
                            editedImage={editedImage}
                        />
                    )}
                 </>
              )}

              {!isLoading && !editedImage && !generatedVideo && (
                <div className="mt-6">
                  <div className="flex justify-center mb-6 border-b border-gray-700">
                      <button
                          onClick={() => setActiveMode('image')}
                          className={`px-6 py-2 text-sm font-medium transition-colors duration-300 ${activeMode === 'image' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                          Редактировать Фото
                      </button>
                      <button
                          onClick={() => setActiveMode('video')}
                          className={`px-6 py-2 text-sm font-medium transition-colors duration-300 ${activeMode === 'video' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                          Создать Видео
                      </button>
                  </div>

                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-2">
                    Инструкция для ИИ (промпт)
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none"
                    rows={3}
                  />
                   <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Идеи для промпта:</p>
                    <div className="flex flex-wrap gap-2">
                        {currentSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setPrompt(suggestion)}
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full transition-colors duration-200"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-4 mt-6">
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors duration-300 shadow-lg"
                    >
                      Сменить изображение
                    </button>
                    <button
                      onClick={handleMainAction}
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {activeMode === 'image' ? 'Обработать' : 'Создать видео'}
                    </button>
                  </div>
                </div>
              )}
               {(editedImage || generatedVideo) && !isLoading && (
                  <div className="text-center mt-6">
                     <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-300 shadow-lg"
                    >
                      Начать сначала
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Создано с помощью Google Gemini. Пожалуйста, используйте этот инструмент ответственно.</p>
           <button onClick={handleApiKeyChange} className="mt-2 text-xs text-gray-600 hover:text-gray-400 underline">
                Сменить API ключ
           </button>
        </footer>
      </main>
    </div>
  );
}
