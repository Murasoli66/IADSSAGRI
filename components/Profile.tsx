
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserProfile } from '../types.ts';
import { ProfileIcon } from './icons.tsx';
import { useTranslation } from '../contexts/LanguageContext.tsx';

const CameraIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', picture: null });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isPhotoTaken, setIsPhotoTaken] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const { t } = useTranslation();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        const storedProfile = localStorage.getItem('agri-ai-user-profile');
        if (storedProfile) {
            try {
                const parsedProfile = JSON.parse(storedProfile);
                setProfile(prevProfile => ({ ...prevProfile, ...parsedProfile }));
            } catch (error) {
                console.error("Failed to parse profile from localStorage:", error);
                localStorage.removeItem('agri-ai-user-profile');
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        try {
            localStorage.setItem('agri-ai-user-profile', JSON.stringify(profile));
            window.dispatchEvent(new Event('profileUpdated'));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleOpenCamera = async () => {
        stopStream();
        setIsPhotoTaken(false);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access the camera. Please check permissions.");
        }
    };

    const handleCloseCamera = () => {
        stopStream();
        setIsCameraOpen(false);
        setIsPhotoTaken(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setIsPhotoTaken(true);
            stopStream();
        }
    };
    
    const handleRetake = () => {
        setIsPhotoTaken(false);
        handleOpenCamera();
    };

    const handleSavePhoto = () => {
        if (canvasRef.current) {
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setProfile({ ...profile, picture: dataUrl });
            handleCloseCamera();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, picture: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        if (isCameraOpen && !isPhotoTaken && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraOpen, isPhotoTaken, stream]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold text-slate-900">{t('profile.title')}</h1>
                <p className="text-slate-600 mt-2 text-lg">{t('profile.subtitle')}</p>
            </header>

            <div className="mt-8 max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="flex flex-col items-center">
                        {profile.picture ? (
                            <img src={profile.picture} alt="Profile" className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover shadow-lg ring-4 ring-green-200" />
                        ) : (
                            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-slate-200 flex items-center justify-center ring-4 ring-slate-300/50">
                                <ProfileIcon className="h-20 w-20 sm:h-24 sm:h-24 text-slate-400" />
                            </div>
                        )}
                        <div className="flex space-x-2 mt-4 w-full">
                            <button onClick={handleOpenCamera} className="flex-1 text-sm bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow">
                                <CameraIcon className="h-5 w-5"/> {t('profile.takePhotoButton')}
                            </button>
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="flex-1 text-sm bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2 shadow">
                                <UploadIcon className="h-5 w-5"/> {t('profile.uploadButton')}
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t('profile.nameLabel')}</label>
                            <input type="text" name="name" id="name" value={profile.name} onChange={handleInputChange} className="mt-1 block w-full p-3 border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">{t('profile.emailLabel')}</label>
                            <input type="email" name="email" id="email" value={profile.email} onChange={handleInputChange} className="mt-1 block w-full p-3 border-slate-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                        </div>
                         <div className="flex justify-end items-center gap-4 pt-2">
                             {saveStatus === 'success' && <span className="text-sm text-green-600">{t('profile.successMessage')}</span>}
                             {saveStatus === 'error' && <span className="text-sm text-red-600">{t('profile.errorMessage')}</span>}
                            <button onClick={handleSave} className="bg-green-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors shadow-md hover:shadow-lg">
                                {t('profile.saveButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isCameraOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-lg font-bold mb-4">{isPhotoTaken ? t('profile.previewModalTitle') : t('profile.cameraModalTitle')}</h3>
                        <div className="relative bg-black rounded-md overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className={`w-full h-auto ${isPhotoTaken ? 'hidden' : 'block'}`}></video>
                            <canvas ref={canvasRef} className={`w-full h-auto ${isPhotoTaken ? 'block' : 'hidden'}`}></canvas>
                        </div>
                        <div className="mt-4 flex justify-between">
                            {!isPhotoTaken ? (
                                <>
                                <button onClick={handleCloseCamera} className="bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-400">{t('profile.cancelButton')}</button>
                                <button onClick={handleCapture} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">{t('profile.captureButton')}</button>
                                </>
                            ) : (
                                <>
                                <button onClick={handleRetake} className="bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-400">{t('profile.retakeButton')}</button>
                                <button onClick={handleSavePhoto} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">{t('profile.usePhotoButton')}</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
