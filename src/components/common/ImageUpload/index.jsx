import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ photos = [], onPhotosChange, maxPhotos = 10, onRemovePhoto }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const dataURLtoBlob = (dataurl) => {
    if (!dataurl || typeof dataurl !== 'string') return null;
    const arr = dataurl.split(',');
    if (arr.length < 2) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && photos.length < maxPhotos) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png');
      const blob = dataURLtoBlob(dataUrl);
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
        onPhotosChange([...photos, { file, preview: dataUrl }]);
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.slice(0, maxPhotos - photos.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    onPhotosChange([...photos, ...newPhotos]);
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = '';
  };

  const removePhoto = async (idx) => {
    const photoToRemove = photos[idx];
    if (onRemovePhoto) {
      const allowed = await onRemovePhoto(photoToRemove, idx);
      if (allowed === false) return;
    }
    const updated = photos.filter((_, i) => i !== idx);
    onPhotosChange(updated);
  };

  return (
    <div className="image-upload">
      <label className="input-label">Community Photo</label>
      
      <div className="image-upload-actions">
        <button
          type="button"
          className="image-upload-btn"
          onClick={startCamera}
          disabled={isCameraActive || photos.length >= maxPhotos}
        >
          <Camera size={16} />
          Take Photo
        </button>
        <button
          type="button"
          className="image-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
        >
          <Upload size={16} />
          Upload File
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {isCameraActive && (
        <div className="camera-preview-wrap">
          <div className="camera-preview">
            <video ref={videoRef} autoPlay playsInline></video>
          </div>
          <div className="camera-controls">
            <button type="button" className="btn btn-primary btn-sm" onClick={capturePhoto}>
              Capture
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={stopCamera}>
              Stop Camera
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {photos.length > 0 && (
        <div className="image-upload-info">{photos.length}/{maxPhotos} photos</div>
      )}

      <div className="image-thumbnails">
        {photos.map((photo, idx) => (
          <div key={idx} className="image-thumbnail">
            <img src={photo.preview} alt={`Photo ${idx + 1}`} />
            <button
              type="button"
              className="image-thumbnail-remove"
              title="Remove image"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removePhoto(idx);
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {photos.length === 0 && !isCameraActive && (
          <div className="image-upload-empty">No photos</div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
