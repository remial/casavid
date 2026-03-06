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
}

interface UploadedPhoto {
  file: File;
  preview: string;
  order: number;
}

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment / Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'studio', label: 'Studio' },
  { value: 'commercial', label: 'Commercial Space' },
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

export default function CreatePropertyForm({ userId }: CreatePropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [propertyType, setPropertyType] = useState('house');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [highlights, setHighlights] = useState('');
  const [videoLength, setVideoLength] = useState(60);
  const [voiceStyle, setVoiceStyle] = useState('professional-male');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newPhotos: UploadedPhoto[] = [];
    const currentCount = photos.length;
    
    Array.from(files).slice(0, 10 - currentCount).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        newPhotos.push({
          file,
          preview: URL.createObjectURL(file),
          order: currentCount + index,
        });
      }
    });
    
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
  }, [photos.length]);

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

      // Handle insufficient credits
      if (response.status === 402) {
        alert(data.message || 'You need credits to create a video. Please purchase credits to continue.');
        if (data.redirectTo) {
          router.push(data.redirectTo);
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create property');
      }

      router.push(`/dashboard/edit/${data.propertyId}`);
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property. Please try again.');
    } finally {
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
            1. Upload Property Photos (1-10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Upload high-quality photos of each room. More photos = more detailed video.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('photo-input')?.click()}
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
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {photos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{photos.length}/10 photos uploaded</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Longer videos showcase more details</p>
            <div className="space-y-3">
              {videoLengthOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    videoLength === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoLength"
                    value={option.value}
                    checked={videoLength === option.value}
                    onChange={() => setVideoLength(option.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
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
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">Help our AI write the perfect script</p>
            
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
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
                <Select value={bedrooms} onValueChange={setBedrooms}>
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
                <Select value={bathrooms} onValueChange={setBathrooms}>
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Choose the voice style for your video narration</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {voiceStyleOptions.map((option) => (
              <label
                key={option.value}
                className={`flex flex-col items-center text-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  voiceStyle === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                  name="voiceStyle"
                  value={option.value}
                  checked={voiceStyle === option.value}
                  onChange={() => setVoiceStyle(option.value)}
                  className="sr-only"
                />
                <span className="text-2xl mb-2">{option.emoji}</span>
                <p className="font-medium text-gray-800">{option.label}</p>
                <p className="text-sm text-gray-500">{option.desc}</p>
              </label>
            ))}
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
      <p className="text-center text-sm text-gray-500">
        You'll be able to reorder photos and add captions in the next step
      </p>
    </div>
  );
}
