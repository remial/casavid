'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

interface CreatePropertyFormProps {
  userId: string;
  subLevel: number;
}

interface UploadedPhoto {
  file: File;
  preview: string;
  order: number;
}

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment / Condo' },
  { value: 'flat', label: 'Flat' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'loft', label: 'Loft' },
  { value: 'cottage', label: 'Cottage' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'farmhouse', label: 'Farmhouse' },
  { value: 'land', label: 'Land / Plot' },
  { value: 'commercial', label: 'Commercial Space' },
  { value: 'other', label: 'Other' },
];

const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+'];
const bathroomOptions = ['1', '1.5', '2', '2.5', '3', '3.5', '4+'];

const videoLengthOptions = [
  { value: 30, label: '30 seconds', desc: 'Quick overview' },
  { value: 60, label: '60 seconds', desc: 'Standard tour' },
  { value: 120, label: '2 minutes', desc: 'Full showcase' },
];

const voiceStyleOptions = [
  { value: 'professional-male', label: 'Professional Male', desc: 'Warm, authoritative tone', emoji: '👨‍💼' },
  { value: 'professional-female', label: 'Professional Female', desc: 'Friendly, engaging tone', emoji: '👩‍💼' },
  { value: 'luxury', label: 'Luxury Style', desc: 'Elegant, premium feel', emoji: '💎' },
  { value: 'casual', label: 'Casual & Friendly', desc: 'Relaxed, conversational', emoji: '😊' },
];

export default function CreatePropertyForm({ userId, subLevel }: CreatePropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [propertyType, setPropertyType] = useState('house');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [highlights, setHighlights] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Subscription-based restrictions
  // subLevel 0 = unsubscribed (all options enabled, will be redirected on submit)
  // subLevel 1 = Starter (5 photos, 30s video, first voice only)
  // subLevel 2 = Pro (10 photos, up to 60s video, all voices)
  // subLevel 3 = Premium (10 photos for now, all video lengths, all voices)
  const isUnsubscribed = subLevel === 0;
  const maxPhotos = isUnsubscribed ? 10 : subLevel === 1 ? 5 : 10;
  
  // Determine allowed video lengths
  const getAllowedVideoLengths = () => {
    if (isUnsubscribed) return [30, 60, 120]; // All options for unsubscribed
    if (subLevel === 1) return [30]; // Starter: only 30s
    if (subLevel === 2) return [30, 60]; // Pro: up to 60s
    return [30, 60, 120]; // Premium: all lengths
  };
  const allowedVideoLengths = getAllowedVideoLengths();
  
  // Set default video length based on subscription
  const getDefaultVideoLength = () => {
    if (isUnsubscribed) return 60;
    if (subLevel === 1) return 30;
    if (subLevel === 2) return 60;
    return 60;
  };
  
  const [videoLength, setVideoLength] = useState(getDefaultVideoLength());
  const [voiceStyle, setVoiceStyle] = useState('professional-male');

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newPhotos: UploadedPhoto[] = [];
    const currentCount = photos.length;
    
    Array.from(files).slice(0, maxPhotos - currentCount).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        newPhotos.push({
          file,
          preview: URL.createObjectURL(file),
          order: currentCount + index,
        });
      }
    });
    
    setPhotos(prev => [...prev, ...newPhotos].slice(0, maxPhotos));
  }, [photos.length, maxPhotos]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      return newPhotos.map((p, i) => ({ ...p, order: i }));
    });
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check credits FIRST before doing anything else
      const creditCheckRes = await fetch('/api/user/checkCreditsAndSubscription');
      const creditData = await creditCheckRes.json();
      
      if (creditData.credits <= 0) {
        alert('You need credits to create a video. Please purchase credits to continue.');
        setIsSubmitting(false);
        router.push('/pricing');
        return;
      }

      const formData = new FormData();
      formData.append('propertyType', propertyType);
      formData.append('bedrooms', bedrooms);
      formData.append('bathrooms', bathrooms);
      formData.append('highlights', highlights);
      formData.append('videoLength', videoLength.toString());
      formData.append('voiceStyle', voiceStyle);
      
      photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo.file);
      });

      const response = await fetch('/api/property/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      // Handle insufficient credits (backup check)
      if (response.status === 402) {
        alert(data.message || 'You need credits to create a video. Please purchase credits to continue.');
        setIsSubmitting(false);
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
        return;
      }

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to create property';
        throw new Error(errorMsg);
      }

      // Keep isSubmitting true during navigation - component will unmount
      router.push(`/dashboard/edit/${data.propertyId}`);
    } catch (error) {
      console.error('Error creating property:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('storage') || message.includes('bucket')) {
        alert('Failed to upload photos. Please try again with smaller images or fewer photos.');
      } else if (message.includes('timeout') || message.includes('network')) {
        alert('Upload timed out. Please check your connection and try again.');
      } else {
        alert(`Failed to create property: ${message}`);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            1. Upload Property Photos (1-{maxPhotos})
          </CardTitle>
          {subLevel === 1 && (
            <p className="text-sm text-amber-600 mt-1">Starter Plan: Up to {maxPhotos} photos per video</p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Upload high-quality photos of each room. More photos = more detailed video.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isSubmitting 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
                : isDragging 
                  ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                  : 'border-gray-300 hover:border-blue-400 cursor-pointer'
            }`}
            onDrop={!isSubmitting ? handleDrop : undefined}
            onDragOver={!isSubmitting ? handleDragOver : undefined}
            onDragLeave={!isSubmitting ? handleDragLeave : undefined}
            onClick={() => !isSubmitting && document.getElementById('photo-input')?.click()}
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Drop photos here or click to browse</p>
            <p className="text-sm text-gray-400">JPG, PNG up to 10MB each</p>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={isSubmitting}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {photos.length > 0 && (
            <div className={`mt-4 ${isSubmitting ? 'opacity-60' : ''}`}>
              <p className="text-sm text-gray-600 mb-2">{photos.length}/{maxPhotos} photos uploaded</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {!isSubmitting && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-sm text-gray-700 mb-2">Tips for best results:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use well-lit, high-resolution photos</li>
              <li>• Include: living room, kitchen, bedrooms, bathrooms, exterior</li>
              <li>• Highlight unique features (fireplace, pool, views)</li>
              <li>• Avoid cluttered or dark photos</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Video Settings */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🎬</span>
              2. Video Length
            </CardTitle>
            {subLevel === 1 && (
              <p className="text-sm text-amber-600 mt-1">Starter Plan: 30-second videos only</p>
            )}
            {subLevel === 2 && (
              <p className="text-sm text-blue-600 mt-1">Pro Plan: Up to 60-second videos</p>
            )}
          </CardHeader>
          <CardContent className={isSubmitting ? 'opacity-60 pointer-events-none' : ''}>
            <p className="text-sm text-gray-500 mb-4">Longer videos showcase more details</p>
            <div className="space-y-3">
              {videoLengthOptions.map((option) => {
                const isAllowed = allowedVideoLengths.includes(option.value);
                const isDisabled = !isAllowed && !isUnsubscribed;
                
                return (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      isSubmitting || isDisabled
                        ? 'cursor-not-allowed' 
                        : 'cursor-pointer'
                    } ${
                      isDisabled 
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : videoLength === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="videoLength"
                      value={option.value}
                      checked={videoLength === option.value}
                      onChange={() => !isDisabled && setVideoLength(option.value)}
                      className="mr-3"
                      disabled={isSubmitting || isDisabled}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>{option.label}</p>
                      <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{option.desc}</p>
                    </div>
                    {isDisabled && (
                      <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                        {subLevel === 1 ? 'Not available on Starter Plan' : 'Not available on Pro Plan'}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🏠</span>
              3. Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-4 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}>
            <p className="text-sm text-gray-500">Help our AI write the perfect script</p>
            
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Select value={bedrooms} onValueChange={setBedrooms} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Select value={bathrooms} onValueChange={setBathrooms} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="highlights">Key Features (optional)</Label>
              <Textarea
                id="highlights"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="e.g., Renovated kitchen, hardwood floors, large backyard, mountain views, pool..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Narrator Voice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            4. Narrator Voice
          </CardTitle>
          {subLevel === 1 && (
            <p className="text-sm text-amber-600 mt-1">Starter Plan: Default voice only</p>
          )}
        </CardHeader>
        <CardContent className={isSubmitting ? 'opacity-60 pointer-events-none' : ''}>
          <p className="text-sm text-gray-500 mb-4">Choose the voice style for your video narration</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {voiceStyleOptions.map((option, index) => {
              // Starter plan users can only use the first voice option
              const isVoiceRestricted = subLevel === 1 && index > 0;
              const isDisabled = isVoiceRestricted && !isUnsubscribed;
              
              return (
                <label
                  key={option.value}
                  className={`flex flex-col items-center text-center p-4 rounded-lg border transition-colors relative ${
                    isSubmitting || isDisabled
                      ? 'cursor-not-allowed' 
                      : 'cursor-pointer'
                  } ${
                    isDisabled
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : voiceStyle === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="voiceStyle"
                    value={option.value}
                    checked={voiceStyle === option.value}
                    onChange={() => !isDisabled && setVoiceStyle(option.value)}
                    className="sr-only"
                    disabled={isSubmitting || isDisabled}
                  />
                  <span className={`text-2xl mb-2 ${isDisabled ? 'grayscale' : ''}`}>{option.emoji}</span>
                  <p className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>{option.label}</p>
                  <p className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>{option.desc}</p>
                  {isDisabled && (
                    <span className="text-xs text-amber-600 font-medium mt-2">
                      Not available on Starter Plan
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || photos.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <ImageIcon className="w-5 h-5 mr-2" />
              Continue to Edit
            </>
          )}
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="text-center text-sm text-amber-600 font-medium">
          Please upload at least one photo to continue
        </p>
      ) : (
        <p className="text-center text-sm text-gray-500">
          You'll be able to reorder photos and add captions in the next step
        </p>
      )}
    </div>
  );
}
